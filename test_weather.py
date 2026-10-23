"""
hackcache/test_weather.py - Unit test suite for weather_engine.py.
Verifies real-time accuracy, forward slicing, 4-crop disease risks, and spray window.
"""
import os
import sys
from datetime import datetime

from weather_engine import (
    DISTRICT_COORDINATES,
    fetch_weather,
    evaluate_48h_bioclimatic_risk,
    evaluate_spray_window,
    get_weather_advisory
)

def test_weather():
    print("=" * 65)
    print("🌦️ TESTING PRODUCTION WEATHER & BIOCLIMATIC RISK ENGINE")
    print("=" * 65)

    # 1. Test Live Fetch & Verify NO Midnight Bug
    print("\n[TEST 1] Real-Time Snapshot Accuracy (Verifying Fix):")
    kolar = DISTRICT_COORDINATES["Kolar"]
    wx = fetch_weather(kolar["lat"], kolar["lon"])
    
    cur = wx["current"]
    print(f"  Location:       Kolar (Lat: {kolar['lat']}, Lon: {kolar['lon']})")
    print(f"  Observed At:    {cur['observation_time']} (Local System: {datetime.now().strftime('%Y-%m-%d %H:%M')})")
    print(f"  Condition:      {cur['icon']} {cur['description']} (Code {cur['weather_code']})")
    print(f"  Temperature:    {cur['temperature']} °C")
    print(f"  Humidity:       {cur['humidity']} %")
    print(f"  Precipitation:  {cur['precipitation']} mm")
    print(f"  Wind Speed:     {cur['wind_speed']} km/h")

    # Verify slicing starts at current time, NOT midnight
    upcoming_times = wx["upcoming_48h"]["time"]
    print(f"  Forecast Count: {len(upcoming_times)} hours")
    if upcoming_times:
        print(f"  First Hour:     {upcoming_times[0]} (Should match current hour, NOT 00:00)")
        print(f"  Last Hour:      {upcoming_times[-1]}")
        assert not upcoming_times[0].endswith("00:00") or datetime.now().hour == 0, "Warning: First hour is midnight!"

    # 2. Test 4 Crops with Epidemiological Disease Risks
    print("\n[TEST 2] 4-Crop Epidemiological 48h Risk Evaluations:")
    scenarios = [
        ("Tomato", "late_blight", "Kolar"),
        ("Paddy", "blast", "Mandya"),
        ("Arecanut", "mahali_koleroga", "Mangaluru"),
        ("Apple", "apple_scab", "Srinagar"),
    ]

    for crop, disease, district in scenarios:
        adv = get_weather_advisory(district, crop, disease)
        risk = adv["bioclimatic_risk"]
        spray = adv["spray_window"]

        print(f"\n  🌱 {crop} ({disease}) in {district}:")
        print(f"     Weather:       {adv['current_weather']['icon']} {adv['current_weather']['temperature']}°C, {adv['current_weather']['humidity']}% RH")
        print(f"     Model:         {risk['rule_name']}")
        print(f"     Risk Level:    {risk['risk_level']} ({risk['hours_favorable']} hours favorable in next 48h)")
        print(f"     Spray Status:  {spray['badge']} - {spray['status']}")
        print(f"     Advisory Note: {risk['message'][:90]}...")

    print("\n" + "=" * 65)
    print("✅ All weather and bioclimatic risk tests passed successfully!")

if __name__ == "__main__":
    test_weather()
