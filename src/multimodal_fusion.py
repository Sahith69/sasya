"""
hackcache/src/multimodal_fusion.py - Multimodal Late-Fusion Network & What-If Microclimate Simulator.
Fuses 512-dim ResNet-18 Computer Vision Embeddings with 64-dim IoT Sensor Embeddings.
Provides epidemiological bioclimatic risk scoring and What-If scenario simulations.
Supports Paddy, Arecanut, Apple, and Tomato.
"""

import os
import sys
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
import config

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, Any, Tuple, Optional


# ─── 1. SENSOR ENCODER (IoT TELEMETRY EMBEDDING) ────────────────────────────
class SensorEncoder(nn.Module):
    """
    Encodes tabular IoT sensor readings:
      - Temperature (°C)
      - Relative Humidity (%)
      - Soil Moisture (%)
    Maps 3-dimensional telemetry into a 64-dimensional microclimate embedding.
    """
    def __init__(self, in_features: int = 3, hidden_dim: int = 32, out_dim: int = 64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.BatchNorm1d(hidden_dim) if hidden_dim > 1 else nn.Identity(),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(hidden_dim, out_dim),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.dim() == 1:
            x = x.unsqueeze(0)
        return self.net(x)


# ─── 2. MULTIMODAL CROP FUSION NETWORK ──────────────────────────────────────
class MultimodalCropFusionNet(nn.Module):
    """
    Joint Multimodal Network:
    Fuses 512-dim CNN visual feature embeddings with 64-dim IoT sensor embeddings
    into a 576-dimensional joint representation for combined disease & vulnerability staging.
    """
    def __init__(self, visual_feature_dim: int = 512, sensor_dim: int = 64, num_classes: int = 4):
        super().__init__()
        self.sensor_encoder = SensorEncoder(in_features=3, hidden_dim=32, out_dim=sensor_dim)
        
        fusion_dim = visual_feature_dim + sensor_dim  # 512 + 64 = 576
        self.fusion_head = nn.Sequential(
            nn.Linear(fusion_dim, 128),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, visual_feats: torch.Tensor, sensor_data: torch.Tensor) -> torch.Tensor:
        if sensor_data.dim() == 1:
            sensor_data = sensor_data.unsqueeze(0)
        if visual_feats.dim() == 1:
            visual_feats = visual_feats.unsqueeze(0)
            
        sensor_feats = self.sensor_encoder(sensor_data)
        joint_representation = torch.cat([visual_feats, sensor_feats], dim=1)
        logits = self.fusion_head(joint_representation)
        return logits


# ─── 3. EPIDEMIOLOGICAL ENVIRONMENTAL RISK EVALUATOR ────────────────────────
def evaluate_environmental_risk(
    crop: str,
    disease_name: str,
    temp_c: float,
    humidity_pct: float = 75.0,
    soil_moisture_pct: float = 65.0
) -> Dict[str, Any]:
    """
    Calculates the Bioclimatic Outbreak Risk Index (0 - 100%) based on 
    established plant pathology models:
      - Paddy Blast (Ou, 1985)
      - Apple Scab (Mills Period)
      - Arecanut Koleroga (Phytophthora Spore-Wash)
      - Tomato Late Blight (Wallin / Blitecast) & Early Blight (Alternaria)
    """
    crop_clean = crop.capitalize()
    d_clean = disease_name.lower()
    score = 25.0
    alerts = []
    drivers = []

    # 1. PADDY DISEASES
    if crop_clean == "Paddy":
        if "blast" in d_clean:
            if 20.0 <= temp_c <= 28.0 and humidity_pct >= 85.0:
                score += 55.0
                alerts.append("Optimal Blast Temperature & High Humidity (20-28°C, >85% RH) accelerates sporulation!")
                drivers.append("Temp & Humidity blast threshold met")
            elif soil_moisture_pct >= 75.0:
                score += 30.0
                alerts.append("Saturated soil (>=75%) increases standing-water disease pressure.")
                drivers.append("Saturated soil moisture")
        elif "blight" in d_clean or "bacterial" in d_clean:
            if 25.0 <= temp_c <= 34.0 and soil_moisture_pct >= 70.0:
                score += 50.0
                alerts.append("Warm waterlogged environment (25-34°C) promotes rapid bacterial exudation.")
                drivers.append("Warm waterlogged soil")
            elif temp_c > 30.0:
                score += 25.0
                alerts.append("High temperature (>30°C) accelerates bacterial spread.")
                drivers.append("High temperature")
        else:
            if soil_moisture_pct >= 85.0:
                score += 30.0
                alerts.append("Excess standing water increases fungal root/foliar vulnerability.")
                drivers.append("Excess standing water")

    # 2. ARECANUT DISEASES
    elif crop_clean == "Arecanut":
        if "koleroga" in d_clean or "mahali" in d_clean:
            if soil_moisture_pct >= 75.0 and 20.0 <= temp_c <= 29.0:
                score += 65.0
                alerts.append("Severe Monsoon Rot Conditions: Phytophthora zoospores actively wash down nut bunches.")
                drivers.append("Monsoon humidity & temperature optimum")
            elif humidity_pct >= 85.0:
                score += 35.0
                alerts.append("Sustained relative humidity (>=85%) accelerates fruit rot sporulation.")
                drivers.append("High relative humidity")
        elif "yellow" in d_clean:
            if soil_moisture_pct < 30.0 and temp_c > 32.0:
                score += 40.0
                alerts.append("Drought stress exacerbates phytoplasma yellowing symptom expression.")
                drivers.append("Severe moisture deficit")

    # 3. APPLE DISEASES
    elif crop_clean == "Apple":
        if "scab" in d_clean:
            if 15.0 <= temp_c <= 24.0 and (humidity_pct >= 80.0 or soil_moisture_pct >= 65.0):
                score += 60.0
                alerts.append("Mills Infection Window Met (15-24°C, High Moisture): Ascomycete spores actively germinate.")
                drivers.append("Mills wet-temperature window")
            elif humidity_pct >= 75.0:
                score += 30.0
                alerts.append("Elevated orchard humidity creates favourable infection conditions.")
                drivers.append("Orchard humidity")
        elif "black_rot" in d_clean or "rot" in d_clean:
            if 24.0 <= temp_c <= 32.0 and humidity_pct >= 70.0:
                score += 50.0
                alerts.append("Warm humid orchard conditions (24-32°C) trigger pycnidiospore discharge.")
                drivers.append("Warm humid canopy")
        elif "rust" in d_clean:
            if 12.0 <= temp_c <= 24.0 and humidity_pct >= 75.0:
                score += 55.0
                alerts.append("Teliospore germination window active (12-24°C with wet leaf canopy).")
                drivers.append("Rust teliospore window")

    # 4. TOMATO DISEASES
    elif crop_clean == "Tomato":
        if "late_blight" in d_clean or "blight" in d_clean:
            # Wallin / Blitecast Late Blight model
            if 14.0 <= temp_c <= 24.0 and humidity_pct >= 85.0:
                score += 60.0
                alerts.append("Wallin Late Blight Criteria Met (14-24°C, >85% RH): Phytophthora infestans zoospores germinate within 4-6 hours!")
                drivers.append("Late blight temperature-humidity convergence")
            elif humidity_pct >= 80.0:
                score += 30.0
                alerts.append("Elevated canopy humidity (>=80%) elevates sporulation risk.")
                drivers.append("High canopy humidity")
        elif "early_blight" in d_clean or "septoria" in d_clean:
            # Alternaria solani warm-humid model
            if 24.0 <= temp_c <= 32.0 and humidity_pct >= 80.0:
                score += 50.0
                alerts.append("Alternaria Optimum Window (24-32°C, >80% RH): Expanding necrotic target lesions and rapid conidial sporulation.")
                drivers.append("Alternaria temperature-moisture optimum")
            elif temp_c >= 26.0:
                score += 25.0
                alerts.append("Warm temperatures accelerate lesion coalescence.")
                drivers.append("Warm temperature")
        elif "bacterial" in d_clean:
            if 25.0 <= temp_c <= 33.0 and humidity_pct >= 80.0:
                score += 45.0
                alerts.append("Bacterial spot thrives in warm, humid microclimates (25-33°C).")
                drivers.append("Warm humid microclimate")

    # Environmental Stress Modifiers
    if soil_moisture_pct > 85.0:
        score += 15.0
        alerts.append("Soil is severely waterlogged; anaerobic root stress detected.")
        drivers.append("Waterlogged soil")
    elif soil_moisture_pct < 25.0:
        score += 10.0
        alerts.append("Low soil moisture; crop experiencing moisture-deficit stress.")
        drivers.append("Moisture-deficit stress")

    final_score = min(100.0, max(5.0, score))

    if final_score >= 75.0:
        risk_level = "CRITICAL OUTBREAK RISK"
        action = "🚨 Immediate preventive action required! Microclimate conditions favor aggressive secondary epidemic escalation within 24-48h."
    elif final_score >= 50.0:
        risk_level = "MODERATE ELEVATED RISK"
        action = "⚠️ Microclimate favors disease development. Monitor leaf canopy closely and prepare preventive fungicide application."
    else:
        risk_level = "LOW CLIMATIC PRESSURE"
        action = "🟢 Environmental conditions do not currently favor aggressive disease escalation."

    main_alert = " | ".join(alerts) if alerts else "Ambient temperature and soil moisture are within normal tolerance thresholds."

    return {
        "risk_score": round(final_score, 1),
        "risk_level": risk_level,
        "alert": main_alert,
        "action_advisory": action,
        "key_drivers": drivers
    }


# ─── 4. INTERACTIVE "WHAT-IF" MICROCLIMATE SIMULATOR ─────────────────────────
def simulate_what_if(
    crop: str,
    disease_name: str,
    baseline_temp: float,
    baseline_humidity: float,
    baseline_soil_moisture: float,
    delta_temp: float = 0.0,
    delta_humidity: float = 0.0,
    delta_soil_moisture: float = 0.0
) -> Dict[str, Any]:
    """
    Simulates environmental shifts and calculates vulnerability shifts:
    Answers: 'What happens if humidity spikes by 15%?' or 'What if rainfall saturates the soil by +25%?'
    
    Returns:
      - Baseline Risk Score vs Simulated Risk Score
      - Risk Delta (+/- %)
      - Trajectory Level ('Elevated', 'Stable', 'Reduced')
      - Driver Attribution and Dynamic Agronomic Advisory
    """
    # 1. Evaluate baseline
    base_eval = evaluate_environmental_risk(
        crop=crop,
        disease_name=disease_name,
        temp_c=baseline_temp,
        humidity_pct=baseline_humidity,
        soil_moisture_pct=baseline_soil_moisture
    )

    # 2. Evaluate simulated conditions
    sim_temp = max(-10.0, min(50.0, baseline_temp + delta_temp))
    sim_humidity = max(10.0, min(100.0, baseline_humidity + delta_humidity))
    sim_soil = max(5.0, min(100.0, baseline_soil_moisture + delta_soil_moisture))

    sim_eval = evaluate_environmental_risk(
        crop=crop,
        disease_name=disease_name,
        temp_c=sim_temp,
        humidity_pct=sim_humidity,
        soil_moisture_pct=sim_soil
    )

    score_delta = round(sim_eval["risk_score"] - base_eval["risk_score"], 1)

    if score_delta > 15.0:
        trajectory = "🚨 SEVERE ESCALATION"
        scenario_msg = (
            f"Simulated weather shift (+{delta_humidity:+.0f}% RH, {delta_temp:+.1f}°C) "
            f"catapults outbreak risk from {base_eval['risk_score']}% ({base_eval['risk_level']}) "
            f"to {sim_eval['risk_score']}% ({sim_eval['risk_level']}). High spore dispersal imminent!"
        )
    elif score_delta > 5.0:
        trajectory = "⚠️ MODERATE INCREASE"
        scenario_msg = (
            f"Risk index increases by +{score_delta}% due to elevated microclimate moisture. "
            f"Foliar susceptibility is heightened."
        )
    elif score_delta < -5.0:
        trajectory = "🟢 RISK MITIGATION"
        scenario_msg = (
            f"Simulated weather conditions reduce disease pressure by {abs(score_delta)}%. "
            f"Environment becomes less conducive to pathogen propagation."
        )
    else:
        trajectory = "⚖️ STABLE"
        scenario_msg = "Minor environmental variation; disease pressure remains relatively unchanged."

    return {
        "crop": crop,
        "disease": disease_name,
        "baseline": {
            "temperature": baseline_temp,
            "humidity": baseline_humidity,
            "soil_moisture": baseline_soil_moisture,
            "risk_score": base_eval["risk_score"],
            "risk_level": base_eval["risk_level"]
        },
        "simulated": {
            "temperature": round(sim_temp, 1),
            "humidity": round(sim_humidity, 1),
            "soil_moisture": round(sim_soil, 1),
            "risk_score": sim_eval["risk_score"],
            "risk_level": sim_eval["risk_level"]
        },
        "score_delta": score_delta,
        "trajectory": trajectory,
        "scenario_summary": scenario_msg,
        "simulated_alert": sim_eval["alert"],
        "recommended_action": sim_eval["action_advisory"]
    }
