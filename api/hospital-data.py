import pandas as pd
import json
import requests
from http.server import BaseHTTPRequestHandler
import threading
import io
import math
from urllib.parse import urlparse, parse_qs

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

def aggregate_hcahps():
    hcahps, hospitals = load_data()
    
    # Filter for relevant metrics and "Always" responses (A_P)
    filtered = hcahps[hcahps['HCAHPS Measure ID'].isin(METRIC_IDS.keys())].copy()
    
    # Convert HCAHPS Answer Percent to numeric, handling errors
    filtered['HCAHPS Answer Percent'] = pd.to_numeric(filtered['HCAHPS Answer Percent'], errors='coerce')
    
    # Remove rows with NaN values
    filtered = filtered.dropna(subset=['HCAHPS Answer Percent'])
    
    # Group by hospital and metric, then average the percentages
    grouped = filtered.groupby(['Facility ID', 'Facility Name', 'State', 'HCAHPS Measure ID'])['HCAHPS Answer Percent'].mean().reset_index()
    
    # Pivot to get one row per hospital, columns are HCAHPS Measure IDs
    pivot = grouped.pivot_table(
        index=['Facility ID', 'Facility Name', 'State'],
        columns='HCAHPS Measure ID',
        values='HCAHPS Answer Percent',
        aggfunc='mean'
    ).reset_index()
    
    # Fill NaN values with 0
    pivot = pivot.fillna(0)
    
    # For each friendly metric name, average all columns that map to it
    for friendly_name in set(METRIC_IDS.values()):
        cols = [k for k, v in METRIC_IDS.items() if v == friendly_name]
        if len(cols) > 1:
            # Get all columns that exist in the pivot table
            existing_cols = [col for col in cols if col in pivot.columns]
            if existing_cols:
                pivot[friendly_name] = pivot[existing_cols].mean(axis=1)
            else:
                pivot[friendly_name] = 0
        elif len(cols) == 1:
            if cols[0] in pivot.columns:
                pivot[friendly_name] = pivot[cols[0]]
            else:
                pivot[friendly_name] = 0
        else:
            pivot[friendly_name] = 0
    
    # Only keep the friendly columns and the index columns
    keep_cols = ['Facility ID', 'Facility Name', 'State'] + list(set(METRIC_IDS.values()))
    pivot = pivot[keep_cols]
    
    return pivot, hospitals

def get_hospital_data(hospital_name):
    pivot, hospitals = aggregate_hcahps()
    row = pivot[pivot['Facility Name'] == hospital_name]
    if row.empty:
        return None, "Hospital not found"
    
    info = hospitals[hospitals['Facility Name'] == hospital_name].iloc[0].to_dict() if not hospitals[hospitals['Facility Name'] == hospital_name].empty else {}
    
    # Calculate national averages for each metric
    national_averages = {}
    for col in METRIC_IDS.values():
        if col in pivot.columns:
            try:
                vals = pd.to_numeric(pivot[col], errors='coerce').dropna()
                if len(vals) > 0:
                    national_averages[col] = float(vals.mean())
                else:
                    national_averages[col] = 75.0
            except Exception:
                national_averages[col] = 75.0
    
    # Calculate state average for the hospital's state
    state = row.iloc[0]['State']
    state_data = pivot[pivot['State'] == state]
    state_averages = {}
    for col in METRIC_IDS.values():
        if col in state_data.columns:
            try:
                vals = pd.to_numeric(state_data[col], errors='coerce').dropna()
                if len(vals) > 0:
                    state_averages[col] = float(vals.mean())
                else:
                    state_averages[col] = 75.0
            except Exception:
                state_averages[col] = 75.0
    
    # Build metrics with proper structure
    metrics = {}
    for col in METRIC_IDS.values():
        if col in row.columns and pd.notnull(row.iloc[0][col]):
            hospital_val = float(row.iloc[0][col])
            state_avg = state_averages.get(col, 75.0)
            national_avg = national_averages.get(col, 75.0)
            
            metrics[col] = {
                "hospital": hospital_val,
                "state": state_avg,
                "national": national_avg,
                "vsState": round(hospital_val - state_avg, 1),
                "vsNational": round(hospital_val - national_avg, 1)
            }
    
    return {"info": info, "metrics": metrics}, None

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse the URL to get hospital name
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.split('/')
            
            # Find the hospital name in the path
            hospital_name = None
            for i, part in enumerate(path_parts):
                if part == 'hospital-data' and i + 1 < len(path_parts):
                    hospital_name = path_parts[i + 1]
                    break
            
            if not hospital_name:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Hospital name not provided"}).encode())
                return
            
            # URL decode the hospital name
            import urllib.parse
            hospital_name = urllib.parse.unquote(hospital_name)
            
            result, error = get_hospital_data(hospital_name)
            
            if error:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps({"error": error}).encode())
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                
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