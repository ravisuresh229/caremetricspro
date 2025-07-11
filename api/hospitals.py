import pandas as pd
import json
import requests
from http.server import BaseHTTPRequestHandler
import threading
import io

# S3 URLs
HCAHPS_URL = 'https://hospital-benchmark-data.s3.us-east-1.amazonaws.com/HCAHPS.csv'
HOSPITAL_URL = 'https://hospital-benchmark-data.s3.us-east-1.amazonaws.com/Hospital_General_Information.csv'

# Simple in-memory cache (persists for the life of the serverless instance)
DATA_CACHE = {}
CACHE_LOCK = threading.Lock()

METRIC_IDS = {
    'H_COMP_1_A_P': 'Nurse Communication',
    'H_COMP_2_A_P': 'Doctor Communication',
    'H_COMP_3_A_P': 'Staff Responsiveness',
    'H_CALL_BUTTON_A_P': 'Staff Responsiveness',
    'H_BATH_HELP_A_P': 'Staff Responsiveness',
    'H_SIDE_EFFECTS_A_P': 'Care Transition',
    'H_DISCH_HELP_Y_P': 'Discharge Info',
    'H_CLEAN_HSP_A_P': 'Care Cleanliness',
    'H_QUIET_HSP_A_P': 'Quietness',
    'H_RECMND_DY': 'Recommend'
}

def fetch_csv(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return pd.read_csv(io.StringIO(resp.text), low_memory=False)

def load_data():
    with CACHE_LOCK:
        if not DATA_CACHE:
            hcahps = fetch_csv(HCAHPS_URL)
            hospitals = fetch_csv(HOSPITAL_URL)
            DATA_CACHE['hcahps'] = hcahps
            DATA_CACHE['hospitals'] = hospitals
        return DATA_CACHE['hcahps'], DATA_CACHE['hospitals']

def get_hospital_list():
    hcahps, hospitals = load_data()
    # Filter for relevant metrics and "Always" responses (A_P)
    filtered = hcahps[hcahps['HCAHPS Measure ID'].isin(METRIC_IDS.keys())].copy()
    filtered['HCAHPS Answer Percent'] = pd.to_numeric(filtered['HCAHPS Answer Percent'], errors='coerce')
    filtered = filtered.dropna(subset=['HCAHPS Answer Percent'])
    grouped = filtered.groupby(['Facility ID', 'Facility Name', 'State', 'HCAHPS Measure ID'])['HCAHPS Answer Percent'].mean().reset_index()
    pivot = grouped.pivot_table(
        index=['Facility ID', 'Facility Name', 'State'],
        columns='HCAHPS Measure ID',
        values='HCAHPS Answer Percent',
        aggfunc='mean'
    ).reset_index()
    pivot = pivot.fillna(0)
    return pivot['Facility Name'].dropna().unique().tolist()

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            hospitals = get_hospital_list()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps({"hospitals": hospitals}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 