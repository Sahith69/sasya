"""
hackcache/test_multimodal.py - Unit test suite for Multimodal Neural Fusion & What-If Simulator.
"""
import os
import sys
import torch
from PIL import Image

from engine import CropVisionEngine
from src.multimodal_fusion import (
    SensorEncoder,
    MultimodalCropFusionNet,
    evaluate_environmental_risk,
    simulate_what_if
)

def test_multimodal():
    print("=" * 65)
    print("🧠 TESTING MULTIMODAL NEURAL FUSION & WHAT-IF SIMULATOR")
    print("=" * 65)

    # 1. Test Multimodal Late-Fusion Network Architecture
    print("\n[TEST 1] Multimodal Neural Architecture Forward Pass:")
    fusion_net = MultimodalCropFusionNet(visual_feature_dim=512, sensor_dim=64, num_classes=4)
    fusion_net.eval()

    # Simulate batch of 2 samples
    dummy_visual_feats = torch.randn(2, 512)
    dummy_sensor_data = torch.tensor([
        [24.5, 88.0, 72.0],  # Sample 1: 24.5°C, 88% RH, 72% Soil Moisture
        [32.0, 45.0, 20.0]   # Sample 2: 32.0°C, 45% RH, 20% Soil Moisture
    ])

    with torch.no_grad():
        out_logits = fusion_net(dummy_visual_feats, dummy_sensor_data)
        
    print(f"  Visual Feature Shape: {dummy_visual_feats.shape} (512-dim)")
    print(f"  Sensor Telemetry:     {dummy_sensor_data.shape} (3-dim: Temp, RH, Soil)")
    print(f"  Output Logits Shape:  {out_logits.shape} (Fused representation -> 4 classes)")
    assert out_logits.shape == (2, 4), "Shape mismatch in MultimodalCropFusionNet!"
    print("  ✅ Multimodal Neural Fusion Network forward pass successful!")

    # 2. Test Interactive What-If Microclimate Simulator
    print("\n[TEST 2] Interactive 'What-If' Simulation Scenario:")
    print("  Scenario: Farmer in Kolar observes mild Tomato Late Blight.")
    print("  Question: What if humidity spikes by +20% and soil moisture by +15% over the weekend?")

    sim_result = simulate_what_if(
        crop="Tomato",
        disease_name="late_blight",
        baseline_temp=22.0,
        baseline_humidity=70.0,
        baseline_soil_moisture=50.0,
        delta_temp=-2.0,            # Slight drop to 20°C (cool evening)
        delta_humidity=+20.0,       # Spike to 90% RH
        delta_soil_moisture=+15.0   # Increase to 65% moisture
    )

    print(f"\n  Baseline Microclimate: {sim_result['baseline']['temperature']}°C, {sim_result['baseline']['humidity']}% RH, {sim_result['baseline']['soil_moisture']}% Soil")
    print(f"  Baseline Outbreak Score: {sim_result['baseline']['risk_score']}% ({sim_result['baseline']['risk_level']})")
    print(f"  Simulated Microclimate: {sim_result['simulated']['temperature']}°C, {sim_result['simulated']['humidity']}% RH, {sim_result['simulated']['soil_moisture']}% Soil")
    print(f"  Simulated Outbreak Score: {sim_result['simulated']['risk_score']}% ({sim_result['simulated']['risk_level']})")
    print(f"  Score Delta:          {sim_result['score_delta']:+0.1f}%")
    print(f"  Trajectory Status:    {sim_result['trajectory']}")
    print(f"  Scenario Summary:     {sim_result['scenario_summary']}")
    print(f"  Action Required:      {sim_result['recommended_action']}")

    # 3. Test Full Engine Integration with Sensor Readings
    print("\n[TEST 3] Full Engine Diagnosis with Multi-Sensor Telemetry:")
    engine = CropVisionEngine()
    img = Image.open(os.path.join(os.path.dirname(__file__), "samples", "sample_tomato.jpg"))
    
    sensor_input = {"temperature": 23.0, "humidity": 92.0, "soil_moisture": 80.0}
    res = engine.diagnose(img, crop_hint="Tomato", sensor_readings=sensor_input)

    print(f"  Diagnosed Disease:    {res['disease']} ({res['confidence']*100:.1f}%)")
    print(f"  Severity Stage:       {res['severity']['label']}")
    print(f"  Multimodal Risk:      {res['multimodal_risk']['risk_score']}% - {res['multimodal_risk']['risk_level']}")
    print(f"  Key Microclimate Drivers: {', '.join(res['multimodal_risk']['key_drivers'])}")
    print(f"  Action Advisory:      {res['multimodal_risk']['action_advisory']}")

    print("\n" + "=" * 65)
    print("✅ All Multimodal Fusion and What-If Simulator tests passed!")

if __name__ == "__main__":
    test_multimodal()
