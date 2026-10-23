"""
test_rtc.py - Verification Suite for Land Record & RTC Engine
AgriTrust AI / hackcache
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src.rtc_engine import (
    init_rtc_db,
    query_bhoomi_rtc,
    register_farmer_rtc,
    get_farmer_parcels,
    parse_uploaded_rtc_document,
    get_parcel_bioclimatic_profile,
    KARNATAKA_HIERARCHY
)

def test_rtc_pipeline():
    print("=" * 65)
    print("🌾 TESTING BHOOMI RTC & LAND REGISTRATION ENGINE")
    print("=" * 65)

    # 1. Official Bhoomi Registry Lookup
    print("\n[TEST 1] Bhoomi Online RTC Lookup for Survey #42 in Belthangady:")
    rtc_data = query_bhoomi_rtc(
        district="Dakshina Kannada",
        taluk="Belthangady",
        hobli="Venur",
        village="Kashipatna",
        survey_no="42"
    )
    print(f"  Owner:          {rtc_data['owner_name']}")
    print(f"  Survey Extent:  {rtc_data['extent_acres']} Acres {rtc_data['extent_guntas']} Guntas")
    print(f"  Soil Type:      {rtc_data['soil_type']}")
    print(f"  Crop:           {rtc_data['registered_crop']}")
    print(f"  RTC Cert No:    {rtc_data['rtc_certificate_no']}")
    assert rtc_data["owner_name"] == "Ramesh Poojary"
    assert rtc_data["registered_crop"] == "Arecanut"
    print("  ✅ Official Bhoomi RTC lookup verified!")

    # 2. Register Farmer Parcel
    print("\n[TEST 2] Registering Land Parcel to Farmer Profile:")
    reg_result = register_farmer_rtc(
        farmer_id="farmer_KA_101",
        district="Kolar",
        taluk="Kolar",
        hobli="Kasaba",
        village="Huthur",
        survey_no="73",
        hissa_no="1"
    )
    print(f"  Status:         {reg_result['success']}")
    print(f"  Parcel ID:      {reg_result['parcel_id']}")
    print(f"  Owner:          {reg_result['owner_name']}")
    print(f"  Survey No:      {reg_result['survey_no']}")
    print(f"  Registered Crop:{reg_result['registered_crop']}")
    print(f"  Extents:        {reg_result['total_extent']}")
    print(f"  GPS:            ({reg_result['latitude']:.4f}, {reg_result['longitude']:.4f})")
    assert reg_result["success"] is True
    assert reg_result["registered_crop"] == "Tomato"
    print("  ✅ Land parcel registration verified!")

    # 3. List Farmer Parcels
    print("\n[TEST 3] Retrieving Registered Parcels for Farmer:")
    parcels = get_farmer_parcels("farmer_KA_101")
    print(f"  Total Registered Plots: {len(parcels)}")
    for p in parcels:
        print(f"    - Plot #{p['id']}: Sy {p['survey_no']}/{p['hissa_no']} in {p['taluk']}, {p['district']} ({p['registered_crop']}, {p['extent_acres']}A)")
    assert len(parcels) >= 1
    print("  ✅ Farmer parcel registry query verified!")

    # 4. Document / Scanned RTC Upload Parsing
    print("\n[TEST 4] Parsing Uploaded RTC Document:")
    mock_pdf_content = b"GOVERNMENT OF KARNATAKA - REVENUE DEPARTMENT\nFORM 16 - RECORD OF RIGHTS (PAHANI)\nDistrict: Shivamogga, Taluk: Thirthahalli\nSurvey: 104, Hissa: 1\nKhata No: 4892\n"
    ocr_result = parse_uploaded_rtc_document(
        filename="bhoomi_rtc_thirthahalli_sy104.pdf",
        file_bytes=mock_pdf_content,
        farmer_id="farmer_KA_101"
    )
    print(f"  Parsed Survey:  {ocr_result['survey_no']}")
    print(f"  Detected Crop:  {ocr_result['registered_crop']}")
    print(f"  Owner:          {ocr_result['owner_name']}")
    assert ocr_result["success"] is True
    print("  ✅ RTC document parser verified!")

    # 5. Full Bioclimatic Parcel Profile Integration
    print("\n[TEST 5] Linking Parcel Directly with Live Microclimate & Spray Window:")
    profile = get_parcel_bioclimatic_profile(reg_result["parcel_id"])
    print(f"  Success:        {profile['success']}")
    cur = profile['current_weather']
    print(f"  Live Weather:   {cur.get('temperature')}°C, RH: {cur.get('humidity')}%, Wind: {cur.get('wind_speed')} km/h ({cur.get('description')})")
    risk = profile['bioclimatic_risk']
    print(f"  Pathogen:       {profile['target_disease']} -> Risk Level: {risk.get('risk_level')} ({risk.get('hours_favorable')} favorable hours)")
    print(f"  Risk Summary:   {risk.get('message')}")
    spray = profile['spray_window']
    print(f"  Spray Window:   {spray.get('spray_advisory')}")
    print(f"  Ideal Hours:    {len(spray.get('recommended_spray_hours', []))} recommended hour windows found")
    assert profile["success"] is True
    assert profile["microclimate_linked"] is True
    print("  ✅ Hyper-local parcel microclimate linkage verified!")

    print("\n" + "=" * 65)
    print("🎉 All Land Record & RTC Engine tests passed successfully!")
    print("=" * 65)

if __name__ == "__main__":
    test_rtc_pipeline()
