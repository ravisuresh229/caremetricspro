#!/usr/bin/env python3
"""
Test script for Vercel serverless functions
Run this to verify all endpoints work correctly
"""

import requests
import json
import time

def test_endpoint(url, name):
    """Test an endpoint and return the result"""
    try:
        print(f"Testing {name}...")
        start_time = time.time()
        response = requests.get(url, timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {name} - Success ({end_time - start_time:.2f}s)")
            print(f"   Response size: {len(json.dumps(data))} characters")
            if isinstance(data, dict) and 'hospitals' in data:
                print(f"   Hospitals count: {len(data['hospitals'])}")
            elif isinstance(data, dict) and 'national' in data:
                print(f"   Benchmarks count: {len(data['national'])}")
            elif isinstance(data, dict) and len(data) > 0:
                print(f"   Hospitals in data: {len(data)}")
            return True
        else:
            print(f"❌ {name} - Failed (Status: {response.status_code})")
            print(f"   Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ {name} - Error: {str(e)}")
        return False

def main():
    """Test all endpoints"""
    print("🏥 Testing HealthMetrics Pro Vercel Functions")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        ("http://localhost:3000/api/hospitals", "Hospitals List"),
        ("http://localhost:3000/api/benchmarks", "Benchmarks"),
        ("http://localhost:3000/api/all-hospitals-data", "All Hospitals Data"),
    ]
    
    # Test hospital data endpoint with a sample hospital
    # First get hospitals list
    try:
        hospitals_response = requests.get("http://localhost:3000/api/hospitals", timeout=30)
        if hospitals_response.status_code == 200:
            hospitals_data = hospitals_response.json()
            if hospitals_data.get('hospitals') and len(hospitals_data['hospitals']) > 0:
                sample_hospital = hospitals_data['hospitals'][0]
                # URL encode the hospital name
                import urllib.parse
                encoded_hospital = urllib.parse.quote(sample_hospital)
                endpoints.append(
                    (f"http://localhost:3000/api/hospital-data/{encoded_hospital}", 
                     f"Hospital Data ({sample_hospital})")
                )
    except Exception as e:
        print(f"⚠️  Could not get hospitals list for testing: {e}")
    
    # Run tests
    results = []
    for url, name in endpoints:
        result = test_endpoint(url, name)
        results.append(result)
        print()
    
    # Summary
    print("=" * 50)
    print("📊 Test Summary:")
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Ready for deployment.")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main() 