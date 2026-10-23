"""
hackcache/engine.py - Production-Ready Standalone Crop Vision & Severity Engine
Encapsulates Multi-Crop Domain Guard, Disease Classifier, CORN Ordinal Severity,
Grad-CAM Explainability, and Leaf/Lesion Segmentation.

Completely independent of UI; directly usable by FastAPI, Flask, React, Next.js, or Streamlit.
"""

import os
import io
import base64
from typing import Dict, Any, Optional, Tuple, Union
from PIL import Image
import numpy as np

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms

import config
from src.model import CropSeverityModel
from src.corn_loss import corn_probs_to_grade
from src.gradcam import GradCAM, overlay_heatmap
from src.severity_grader import grade_image, ratio_to_grade
from src.ood_guard import check_ood
from src.multimodal_fusion import (
    SensorEncoder,
    MultimodalCropFusionNet,
    evaluate_environmental_risk,
    simulate_what_if
)

# Human readable grade labels
SEVERITY_LABELS = {
    0: "Healthy / Negligible (<0.5%)",
    1: "Mild Severity (0.5% - 5%)",
    2: "Moderate Severity (5% - 15%)",
    3: "Severe (>15%)"
}

SUPPORTED_CROPS = ["Paddy", "Arecanut", "Apple", "Tomato"]


class CropVisionEngine:
    def __init__(self, models_dir: Optional[str] = None, device: Optional[str] = None):
        self.models_dir = models_dir or config.MODELS_DIR
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))
        
        self.transform = transforms.Compose([
            transforms.Resize((config.IMG_SIZE, config.IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=config.IMAGENET_MEAN, std=config.IMAGENET_STD)
        ])
        
        # Cached model instances
        self._gatekeeper = None
        self._gatekeeper_classes = None
        self._disease_models: Dict[str, Tuple[nn.Module, list]] = {}
        self._severity_models: Dict[str, nn.Module] = {}

    def get_gatekeeper(self) -> Tuple[Optional[nn.Module], list]:
        """Loads or returns cached 3-way Gatekeeper model (Paddy, Arecanut, Non-Crop)."""
        if self._gatekeeper is not None:
            return self._gatekeeper, self._gatekeeper_classes

        pth = os.path.join(self.models_dir, "crop_gatekeeper.pth")
        if not os.path.exists(pth):
            return None, ["Paddy", "Arecanut", "Non-Crop"]

        ck = torch.load(pth, map_location=self.device, weights_only=True)
        classes = ck.get('classes', ['Paddy', 'Arecanut', 'Non-Crop / Other'])
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(classes))
        model.load_state_dict(ck['model_state_dict'])
        model.to(self.device).eval()

        self._gatekeeper = model
        self._gatekeeper_classes = classes
        return self._gatekeeper, self._gatekeeper_classes

    def get_disease_classifier(self, crop_name: str) -> Tuple[Optional[nn.Module], list]:
        """Loads or returns cached disease classification model for a given crop."""
        key = crop_name.lower()
        if key in self._disease_models:
            return self._disease_models[key]

        pth = os.path.join(self.models_dir, f"{key}_disease_classifier.pth")
        if not os.path.exists(pth):
            return None, []

        ck = torch.load(pth, map_location=self.device, weights_only=True)
        classes = ck.get('classes', [])
        model = models.resnet18(weights=None)

        if 'fc.1.weight' in ck['model_state_dict']:
            model.fc = nn.Sequential(nn.Dropout(p=0.4), nn.Linear(model.fc.in_features, len(classes)))
        else:
            model.fc = nn.Linear(model.fc.in_features, len(classes))

        model.load_state_dict(ck['model_state_dict'])
        model.to(self.device).eval()

        self._disease_models[key] = (model, classes)
        return model, classes

    def get_severity_model(self, crop_name: str) -> Optional[nn.Module]:
        """Loads or returns cached CORN ordinal severity model for a given crop."""
        key = crop_name.lower()
        if key in self._severity_models:
            return self._severity_models[key]

        pth = os.path.join(self.models_dir, f"{key}_ordinal.pth")
        if not os.path.exists(pth):
            return None

        m = CropSeverityModel(backbone=config.BACKBONE, num_classes=config.NUM_SEVERITY_GRADES,
                              ordinal=True, pretrained=False)
        ck = torch.load(pth, map_location=self.device, weights_only=True)
        sd = ck.get('model_state_dict', ck) if isinstance(ck, dict) else ck
        m.load_state_dict(sd)
        m.to(self.device).eval()

        self._severity_models[key] = m
        return m

    def verify_crop(self, image: Image.Image, requested_crop: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs OOD & Crop Verification:
        1. Obvious non-plant checks (solid blank images or Gatekeeper Non-Crop detection).
        2. If requested_crop is given, checks Mahalanobis distance against that crop.
        3. If requested_crop is None, auto-detects by comparing OOD ratios across supported crops.
        """
        # A. Low-entropy blank image check
        img_np = np.array(image)
        if float(np.std(img_np)) < 8.0:
            return {
                "is_valid_crop": False,
                "detected_crop": requested_crop or "Non-Crop",
                "confidence": 0.0,
                "is_ood": True,
                "ood_score": 999.0,
                "ood_threshold": 30.0,
                "rejection_reason": "Low image variance: Solid or blank image detected (not a crop leaf)."
            }

        # B. Gatekeeper Non-Crop detection
        gk_model, gk_classes = self.get_gatekeeper()
        if gk_model is not None:
            t_gk = self.transform(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                probs_gk = F.softmax(gk_model(t_gk), dim=1)[0].cpu().numpy()
            non_crop_idx = next((i for i, c in enumerate(gk_classes) if "non-crop" in c.lower()), None)
            if non_crop_idx is not None and probs_gk[non_crop_idx] >= 0.80:
                return {
                    "is_valid_crop": False,
                    "detected_crop": requested_crop or "Non-Crop",
                    "confidence": 0.0,
                    "is_ood": True,
                    "ood_score": 999.0,
                    "ood_threshold": 30.0,
                    "rejection_reason": "Gatekeeper AI rejected image: Identified as Non-Crop / Non-Plant."
                }

        if requested_crop is not None:
            target_crop = requested_crop.capitalize()
            is_ood, ood_score, threshold = check_ood(image, target_crop)
            ratio = ood_score / threshold if threshold > 0 else 1.0
            return {
                "is_valid_crop": not is_ood,
                "detected_crop": target_crop,
                "confidence": round(max(0.0, min(1.0, 1.0 - (ratio - 1.0))), 3) if is_ood else round(min(1.0, 1.0 - (ratio * 0.2)), 3),
                "is_ood": is_ood,
                "ood_score": round(ood_score, 3),
                "ood_threshold": round(threshold, 3),
                "rejection_reason": "Image features diverge from verified in-domain leaf distribution." if is_ood else None
            }

        # Multi-crop auto-detection using OOD ratios
        ood_ratios = {}
        ood_scores = {}
        thresholds = {}
        for c in SUPPORTED_CROPS:
            is_o, sc, th = check_ood(image, c)
            ood_scores[c] = sc
            thresholds[c] = th
            ood_ratios[c] = sc / th if th > 0 else 999.0

        best_crop = min(ood_ratios, key=ood_ratios.get)
        best_ratio = ood_ratios[best_crop]
        all_above_1 = all(r > 1.0 for r in ood_ratios.values())

        if all_above_1:
            return {
                "is_valid_crop": False,
                "detected_crop": best_crop,
                "confidence": 0.0,
                "is_ood": True,
                "ood_score": round(ood_scores[best_crop], 3),
                "ood_threshold": round(thresholds[best_crop], 3),
                "rejection_reason": "Non-crop or out-of-distribution image: Does not match any supported crop distribution."
            }

        return {
            "is_valid_crop": True,
            "detected_crop": best_crop,
            "confidence": round(min(1.0, 1.0 - (best_ratio * 0.1)), 3),
            "is_ood": False,
            "ood_score": round(ood_scores[best_crop], 3),
            "ood_threshold": round(thresholds[best_crop], 3),
            "rejection_reason": None
        }

    def diagnose(
        self,
        image_input: Union[str, Image.Image],
        crop_hint: Optional[str] = None,
        generate_visuals: bool = True,
        district_or_coords: Optional[Any] = None,
        sensor_readings: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Main inference entrypoint:
        Full end-to-end diagnosis pipeline returning disease, severity, visualizations,
        optional real-time weather & 48h bioclimatic risk projections,
        and optional IoT sensor multimodal fusion vulnerability scoring.
        """
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        else:
            image = image_input.convert("RGB")

        # 1. Verification
        verification = self.verify_crop(image, requested_crop=crop_hint)
        active_crop = verification["detected_crop"]

        if not verification["is_valid_crop"]:
            return {
                "success": False,
                "crop": active_crop,
                "disease": "Out of Distribution / Rejected",
                "confidence": 0.0,
                "error": verification["rejection_reason"],
                "verification": verification,
                "top_predictions": [],
                "severity": {
                    "grade": 0,
                    "label": "N/A",
                    "grade_probabilities": [0.0, 0.0, 0.0, 0.0],
                    "lesion_ratio_pct": 0.0,
                    "segmentation_confidence": 0.0
                },
                "visuals": {
                    "gradcam_image": None,
                    "mask_image": None
                }
            }

        # 2. Disease Classification
        disease_model, classes = self.get_disease_classifier(active_crop)
        if disease_model is None or not classes:
            return {
                "success": False,
                "crop": active_crop,
                "disease": "Model Not Found",
                "confidence": 0.0,
                "error": f"Model for crop '{active_crop}' not found in {self.models_dir}.",
                "verification": verification,
                "top_predictions": [],
                "severity": {
                    "grade": 0,
                    "label": "N/A",
                    "grade_probabilities": [0.0, 0.0, 0.0, 0.0],
                    "lesion_ratio_pct": 0.0,
                    "segmentation_confidence": 0.0
                },
                "visuals": {
                    "gradcam_image": None,
                    "mask_image": None
                }
            }

        t = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = disease_model(t)
            probs = F.softmax(logits, dim=1)[0].cpu().numpy()

        pred_idx = int(np.argmax(probs))
        predicted_disease = classes[pred_idx]
        disease_conf = float(probs[pred_idx])

        top_classes = [
            {"label": classes[i], "probability": round(float(probs[i]), 4)}
            for i in np.argsort(probs)[::-1][:5]
        ]

        # 3. Severity Assessment (CORN Ordinal Model)
        severity_model = self.get_severity_model(active_crop)
        pred_grade = 0
        grade_probs_list = [1.0, 0.0, 0.0, 0.0]

        if severity_model is not None:
            with torch.no_grad():
                sev_logits = severity_model(t)
                sigmoid_probs = torch.sigmoid(sev_logits)
                grade_tensor, grade_probs_tensor = corn_probs_to_grade(sigmoid_probs[0])
                pred_grade = int(grade_tensor.item())
                grade_probs_list = [round(float(p), 4) for p in grade_probs_tensor.cpu().numpy()]

        # 4. Color-Threshold Lesion Segmentation
        seg_res = grade_image(image, predicted_disease, active_crop)
        lesion_ratio = seg_res["ratio"]

        # 5. Visualizations (Grad-CAM & Lesion Mask)
        gradcam_img = None
        mask_img = None

        if generate_visuals:
            try:
                target_model = disease_model
                gradcam = GradCAM(target_model, target_layer_name=config.GRADCAM_TARGET_LAYER)
                t_cam = self.transform(image).unsqueeze(0).to(self.device)
                t_cam.requires_grad_(True)
                cam = gradcam.generate(t_cam, target_class=pred_idx)
                gradcam_img = overlay_heatmap(image, cam, alpha=0.5)
            except Exception:
                gradcam_img = None

            try:
                mask = seg_res.get("lesion_mask")
                if mask is not None:
                    orig_np = np.array(image)
                    overlay_np = orig_np.copy()
                    overlay_np[mask] = [230, 40, 40]
                    mask_img = Image.fromarray((orig_np * 0.4 + overlay_np * 0.6).astype(np.uint8))
            except Exception:
                mask_img = None

        weather_advisory = None
        if district_or_coords is not None:
            try:
                from weather_engine import get_weather_advisory
                weather_advisory = get_weather_advisory(district_or_coords, active_crop, predicted_disease)
            except Exception:
                weather_advisory = None

        # Multimodal Environmental Risk Scoring
        env_risk = None
        if sensor_readings is not None:
            t_c = float(sensor_readings.get("temperature", 25.0))
            h_pct = float(sensor_readings.get("humidity", 75.0))
            sm_pct = float(sensor_readings.get("soil_moisture", 65.0))
            env_risk = evaluate_environmental_risk(active_crop, predicted_disease, t_c, h_pct, sm_pct)
        elif weather_advisory is not None:
            cur_wx = weather_advisory.get("current_weather", {})
            t_c = float(cur_wx.get("temperature", 25.0))
            h_pct = float(cur_wx.get("humidity", 75.0))
            sm_pct = 65.0  # standard soil moisture proxy
            env_risk = evaluate_environmental_risk(active_crop, predicted_disease, t_c, h_pct, sm_pct)

        return {
            "success": True,
            "error": None,
            "verification": verification,
            "crop": active_crop,
            "disease": predicted_disease,
            "confidence": round(disease_conf, 4),
            "top_predictions": top_classes,
            "severity": {
                "grade": pred_grade,
                "label": SEVERITY_LABELS.get(pred_grade, f"Grade {pred_grade}"),
                "grade_probabilities": grade_probs_list,
                "lesion_ratio_pct": round(lesion_ratio * 100, 2),
                "segmentation_confidence": seg_res["confidence"]
            },
            "visuals": {
                "gradcam_image": gradcam_img,
                "mask_image": mask_img
            },
            "weather_advisory": weather_advisory,
            "multimodal_risk": env_risk
        }

    def simulate_what_if(
        self,
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
        Interactive 'What-If' Microclimate Simulation tool.
        Evaluates vulnerability shifts when humidity, temperature, or soil moisture vary.
        """
        return simulate_what_if(
            crop=crop,
            disease_name=disease_name,
            baseline_temp=baseline_temp,
            baseline_humidity=baseline_humidity,
            baseline_soil_moisture=baseline_soil_moisture,
            delta_temp=delta_temp,
            delta_humidity=delta_humidity,
            delta_soil_moisture=delta_soil_moisture
        )

    def evaluate_multimodal_risk(
        self,
        crop: str,
        disease_name: str,
        temp_c: float,
        humidity_pct: float = 75.0,
        soil_moisture_pct: float = 65.0
    ) -> Dict[str, Any]:
        """Direct helper to evaluate environmental outbreak risk for a given crop & microclimate."""
        return evaluate_environmental_risk(
            crop=crop,
            disease_name=disease_name,
            temp_c=temp_c,
            humidity_pct=humidity_pct,
            soil_moisture_pct=soil_moisture_pct
        )


def pil_to_base64(img: Image.Image, format: str = "PNG") -> str:
    """Helper to convert a PIL Image to a base64 string for REST/WebSocket transport."""
    buffered = io.BytesIO()
    img.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{img_str}"
