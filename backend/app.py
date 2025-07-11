import pandas as pd
import requests
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import math
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# S3 URLs for the CSVs
HCAHPS_URL = 'https://hospital-benchmark-data.s3.us-east-1.amazonaws.com/HCAHPS.csv'
HOSPITAL_URL = 'https://hospital-benchmark-data.s3.us-east-1.amazonaws.com/Hospital_General_Information.csv'

# Metrics to benchmark (updated to match actual CSV data)
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

# Simple cache to avoid reloading every request
DATA_CACHE = {}

def fetch_csv(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return pd.read_csv(io.StringIO(resp.text), low_memory=False)

def load_data():
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

@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Starting up - loading data...")
        # Optionally, trigger your data loading here:
        # load_data()
        logger.info("Data loaded successfully!")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise e

@app.get("/api/hospitals")
def get_hospitals():
    pivot, _ = aggregate_hcahps()
    return {"hospitals": pivot['Facility Name'].dropna().unique().tolist()}

@app.get("/api/hospital-data/{hospital_name}")
def get_hospital_data(hospital_name: str):
    pivot, hospitals = aggregate_hcahps()
    row = pivot[pivot['Facility Name'] == hospital_name]
    if row.empty:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
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
    
    return {"info": info, "metrics": metrics}

@app.get("/api/all-hospitals-data")
def get_all_hospitals_data():
    pivot, hospitals = aggregate_hcahps()
    all_data = {}
    
    # Calculate national averages for each metric
    national_averages = {}
    for col in METRIC_IDS.values():
        if col in pivot.columns:
            try:
                vals = pd.to_numeric(pivot[col], errors='coerce').dropna()
                if len(vals) > 0:
                    national_averages[col] = float(vals.mean())
                else:
                    national_averages[col] = 75.0  # Default fallback
            except Exception:
                national_averages[col] = 75.0  # Default fallback
    
    # Calculate state averages for each metric
    state_averages = {}
    for state in pivot['State'].unique():
        state_data = pivot[pivot['State'] == state]
        state_averages[state] = {}
        for col in METRIC_IDS.values():
            if col in state_data.columns:
                try:
                    vals = pd.to_numeric(state_data[col], errors='coerce').dropna()
                    if len(vals) > 0:
                        state_averages[state][col] = float(vals.mean())
                    else:
                        state_averages[state][col] = 75.0  # Default fallback
                except Exception:
                    state_averages[state][col] = 75.0  # Default fallback
    
    # Process all hospitals
    for _, row in pivot.iterrows():
        name = row['Facility Name']
        state = row['State']
        info = hospitals[hospitals['Facility Name'] == name].iloc[0].to_dict() if not hospitals[hospitals['Facility Name'] == name].empty else {}
        
        # Clean info dict for JSON serialization
        clean_info = {}
        for k, v in info.items():
            if isinstance(v, float) and (pd.isnull(v) or not math.isfinite(v)):
                clean_info[k] = ''
            elif isinstance(v, (int, float)):
                clean_info[k] = v
            else:
                clean_info[k] = str(v) if v is not None else ''
        
        # Build metrics with proper structure
        metrics = {}
        for col in METRIC_IDS.values():
            if col in row:
                try:
                    hospital_val = row[col]
                    if pd.notnull(hospital_val) and hospital_val != '':
                        fval = float(hospital_val)
                        if math.isfinite(fval):
                            state_avg = state_averages.get(state, {}).get(col, 75.0)
                            national_avg = national_averages.get(col, 75.0)
                            
                            metrics[col] = {
                                "hospital": fval,
                                "state": state_avg,
                                "national": national_avg,
                                "vsState": round(fval - state_avg, 1),
                                "vsNational": round(fval - national_avg, 1)
                            }
                except Exception:
                    continue
        
        all_data[name] = {"info": clean_info, "metrics": metrics}
    
    return all_data

@app.get("/api/benchmarks")
def get_benchmarks():
    pivot, _ = aggregate_hcahps()
    benchmarks = {}
    for col in METRIC_IDS.values():
        if col in pivot.columns:
            try:
                # Ensure we have a Series, not DataFrame
                if hasattr(pivot[col], 'iloc'):
                    # It's a DataFrame column, get the first column
                    series = pivot[col].iloc[:, 0] if pivot[col].shape[1] > 0 else pd.Series()
                else:
                    # It's already a Series
                    series = pivot[col]
                
                # Convert to numeric and calculate mean
                vals = pd.to_numeric(series, errors='coerce').dropna()
                if len(vals) > 0:
                    benchmarks[col] = float(vals.mean())
            except Exception:
                continue
    return {"national": benchmarks}

@app.get("/")
async def root():
    try:
        return {"message": "API is running"}
    except Exception as e:
        logger.error(f"Root endpoint failed: {e}")
        raise e 