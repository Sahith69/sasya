# Crop Vision Engine (Backend & Model Core)

A standalone, framework-agnostic AI inference engine for multi-crop disease classification, ordinal severity grading, and visual explainability.

---

## 📁 Directory Structure

```
hackcache/
├── config.py             # Relative path configurations & hyperparams
├── engine.py             # Unified CropVisionEngine (Single import for all AI logic)
├── weather_engine.py     # Production Bioclimatic Risk & Live Weather Engine (Bug-free)
├── test_engine.py        # Automated test suite (5 test scenarios)
├── test_weather.py       # Weather and 48h epidemiological risk unit tests
├── test_multimodal.py    # Neural Multimodal Fusion & What-If simulator tests
├── test_rtc.py           # Bhoomi Land Record (RTC) & parcel linkage tests
├── test_bounty.py        # Farmer Contribution, Expert Verification & AI Triangulation tests
├── models/               # Checkpoints (ResNet-18, CORN severity, OOD guards)
│   ├── paddy_disease_classifier.pth
│   ├── paddy_ordinal.pth
│   ├── arecanut_disease_classifier.pth
│   ├── arecanut_ordinal.pth
│   ├── apple_disease_classifier.pth
│   ├── apple_disease_fgvc_v1.pth
│   ├── apple_ordinal.pth
│   ├── tomato_disease_classifier.pth
│   ├── tomato_ordinal.pth
│   ├── crop_gatekeeper.pth
│   └── ood_params.pt
├── src/                  # Core PyTorch and OpenCV modules
│   ├── model.py          # ResNet-18 Backbone & CORN Head
│   ├── corn_loss.py      # Ordinal probabilities to discrete grades
│   ├── gradcam.py        # Grad-CAM attention heatmap overlay
│   ├── segmentation.py   # Adaptive leaf & lesion segmentation
│   ├── severity_grader.py# Ratio-to-grade mapper & rule system
│   ├── ood_guard.py      # Mahalanobis distance OOD & domain guard
│   ├── multimodal_fusion.py # SensorEncoder + Late Fusion Network + What-If Simulator
│   ├── rtc_engine.py     # Bhoomi RTC Registry, Land Parcel Linkage & GPS Resolver
│   └── bounty_engine.py  # Community Contributions, Expert Desk & AI Triangulation Matrix
├── data/                 # Datasets & annotations (symlinks to avoid disk bloat)
│   ├── paddy/
│   ├── arecanut/
│   ├── apple/
│   └── arecanut_annotations.json
└── samples/              # Test sample images for Paddy, Arecanut, Apple, and Noise
```

---

## 🚀 How to Use in Your New App

### 1. Simple Python Usage
```python
from PIL import Image
from engine import CropVisionEngine

engine = CropVisionEngine()

image = Image.open("samples/sample_paddy.jpg")

# Diagnose with optional Live Weather & 48h Bioclimatic Risk
result = engine.diagnose(image, crop_hint="Tomato", district_or_coords="Kolar")

if result["success"]:
    print(f"Crop: {result['crop']}")
    print(f"Disease: {result['disease']} ({result['confidence']*100:.1f}%)")
    print(f"Severity: {result['severity']['label']}")
    print(f"Lesion Area: {result['severity']['lesion_ratio_pct']}%")
    
    # Live Weather & Bioclimatic Risk:
    wx = result.get("weather_advisory")
    if wx:
        print(f"Weather: {wx['current_weather']['icon']} {wx['current_weather']['temperature']}°C, {wx['current_weather']['humidity']}% RH")
        print(f"Outbreak Risk: {wx['bioclimatic_risk']['risk_level']}")
        print(f"Spray Window: {wx['spray_window']['badge']} ({wx['spray_window']['status']})")
    
    # Visualizations (PIL Images):
    heatmap_pil = result["visuals"]["gradcam_image"]
    mask_pil = result["visuals"]["mask_image"]
else:
    print(f"Rejected: {result['error']}")
```

### 2. Ready for Any Web Backend (FastAPI / Flask / Express)
Use the built-in `pil_to_base64` helper to send images directly in JSON responses:
```python
from engine import CropVisionEngine, pil_to_base64

result = engine.diagnose(image)
if result["success"]:
    result["visuals"]["gradcam_image"] = pil_to_base64(result["visuals"]["gradcam_image"])
    result["visuals"]["mask_image"] = pil_to_base64(result["visuals"]["mask_image"])
# Directly return `result` as JSON
```
