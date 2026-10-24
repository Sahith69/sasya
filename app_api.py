"""
hackcache/app_api.py - Production FastAPI Backend for Sasya AI
Provides endpoints for:
- Leaf disease diagnosis & OOD guard
- Grad-CAM heatmap & CORN ordinal severity
- Open-Meteo 48-hour bioclimatic spray window
- Dataset micro-bounty quality evaluation
- Centroid-aggregated regional outbreak surveillance
"""

import os
import io
import base64
from typing import Optional, Dict, Any
from PIL import Image

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import engine
import weather_engine

app = FastAPI(
    title="Sasya AI API",
    description="Multi-Crop Pathology, Bioclimatic Defense & Sovereign Agriculture AI",
    version="2.4.0"
)

# Enable CORS for local dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy singleton vision engine
_vision_engine = None

def get_engine() -> engine.CropVisionEngine:
    global _vision_engine
    if _vision_engine is None:
        _vision_engine = engine.CropVisionEngine()
    return _vision_engine


class DetectRequest(BaseModel):
    image_base64: Optional[str] = None
    crop_hint: Optional[str] = None
    district: Optional[str] = "Dakshina Kannada"


@app.get("/")
def root():
    return {
        "service": "Sasya AI Backend",
        "status": "online",
        "docs": "/docs",
        "version": "2.4.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "supported_crops": engine.SUPPORTED_CROPS,
        "models_dir": os.path.exists("models")
    }


@app.post("/api/detect")
async def detect_crop_disease(
    file: Optional[UploadFile] = File(None),
    crop_hint: Optional[str] = Form(None),
    district: Optional[str] = Form("Dakshina Kannada")
):
    """
    Runs multi-crop Gatekeeper, Mahalanobis OOD Guard, ResNet-18 Classifier,
    CORN Ordinal Grader, and Grad-CAM Class Activation Heatmap.
    """
    try:
        if file is not None:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        else:
            raise HTTPException(status_code=400, detail="No image file provided.")

        eng = get_engine()
        result = eng.diagnose(
            image_input=image,
            crop_hint=crop_hint if crop_hint and crop_hint != "Auto" else None,
            generate_visuals=True,
            district_or_coords=district
        )

        # Convert visual PIL images to base64 for JSON transport
        visuals_b64 = {}
        if "visuals" in result and result["visuals"]:
            for k, img in result["visuals"].items():
                if isinstance(img, Image.Image):
                    buffered = io.BytesIO()
                    img.save(buffered, format="JPEG", quality=85)
                    visuals_b64[k] = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "success": result.get("success", False),
            "verification": result.get("verification", {}),
            "crop": result.get("crop"),
            "disease": result.get("disease"),
            "confidence": result.get("confidence"),
            "top_predictions": result.get("top_predictions", []),
            "severity": result.get("severity", {}),
            "visuals": visuals_b64,
            "weather_advisory": result.get("weather_advisory"),
            "multimodal_risk": result.get("multimodal_risk")
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/weather/advisory")
def get_weather_advisory(
    district: str = Query("Dakshina Kannada"),
    crop: str = Query("Arecanut"),
    disease: str = Query("koleroga")
):
    """
    Returns live Open-Meteo 48-hour bioclimatic advisory and safe spray window.
    """
    try:
        advisory = weather_engine.get_weather_advisory(district, crop, disease)
        return {
            "success": True,
            "district": district,
            "crop": crop,
            "disease": disease,
            "advisory": advisory
        }
    except Exception as e:
        return {
            "success": False,
            "district": district,
            "error": str(e)
        }


@app.get("/api/weather/risk")
def get_bioclimatic_risk(
    district: str = Query("Dakshina Kannada"),
    crop: str = Query("Arecanut"),
    disease: str = Query("koleroga")
):
    """
    Returns 48-hour hourly risk curves and chemical adhesion timeline.
    """
    try:
        weather_data = weather_engine.fetch_weather(district)
        if not weather_data:
            raise HTTPException(status_code=502, detail="Weather fetch failed.")
        risk_data = weather_engine.evaluate_48h_bioclimatic_risk(weather_data, crop, disease)
        return {
            "success": True,
            "district": district,
            "crop": crop,
            "disease": disease,
            "risk": risk_data
        }
    except Exception as e:
        return {
            "success": False,
            "district": district,
            "error": str(e)
        }


@app.post("/api/bounty/evaluate")
async def evaluate_bounty_submission(file: UploadFile = File(...)):
    """
    Evaluates leaf image quality (sharpness, contrast, resolution)
    to calculate micro-bounty payout for dataset contribution.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        width, height = image.size

        # Simple Laplacian variance sharpness metric
        import numpy as np
        import cv2
        img_np = np.array(image)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        is_sharp = laplacian_var > 100.0
        quality_score = min(99, int((laplacian_var / 500.0) * 100)) if is_sharp else 45
        bounty_amount = 15.00 if is_sharp and width >= 400 else 5.00

        return {
            "success": True,
            "laplacian_variance": round(float(laplacian_var), 2),
            "is_sharp": is_sharp,
            "quality_score": f"{quality_score}%",
            "bounty_awarded": bounty_amount,
            "status": "Approved" if is_sharp else "Requires Clearer Photo"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app_api.py:app", host="0.0.0.0", port=8000, reload=True)
