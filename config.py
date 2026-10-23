"""
hackcache/config.py - Dynamic, self-contained configuration for Crop Vision Engine.
Compatible with any front-end (FastAPI, Flask, React, Next.js, Streamlit).
"""
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
SAMPLES_DIR = os.path.join(PROJECT_ROOT, "samples")

# Image & Backbone settings
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
BACKBONE = "resnet18"
NUM_SEVERITY_GRADES = 4
NUM_ORDINAL_TASKS = 3
GRADCAM_TARGET_LAYER = "layer4"

# Severity thresholds (% lesion area to leaf area)
SEVERITY_THRESHOLDS = {
    'grade_0_max': 0.005,  # Healthy / Negligible (<0.5%)
    'grade_1_max': 0.05,   # Mild (<5%)
    'grade_2_max': 0.15,   # Moderate (<15%)
    # Grade 3: Severe (>15%)
}

# Paddy Classes
PADDY_CLASSES = [
    "bacterial_leaf_blight",
    "bacterial_leaf_streak",
    "bacterial_panicle_blight",
    "blast",
    "brown_spot",
    "dead_heart",
    "downy_mildew",
    "hispa",
    "normal",
    "tungro"
]
PADDY_NORMAL = "normal"
PADDY_GROUP_A = ["bacterial_leaf_blight", "bacterial_leaf_streak", "bacterial_panicle_blight", "blast", "brown_spot", "downy_mildew", "tungro"]
PADDY_GROUP_B_DEAD_HEART = "dead_heart"
PADDY_GROUP_B_HISPA = "hispa"

# Arecanut Classes
ARECANUT_CLASSES = {
    0: "bud_borer",
    1: "healthy_foot",
    2: "healthy_leaf",
    3: "healthy_nut",
    4: "healthy_trunk",
    5: "mahali_koleroga",
    6: "stem_cracking",
    7: "stem_bleeding",
    8: "yellow_leaf_disease",
}
ARECANUT_HEALTHY_CLASSES = {1, 2, 3, 4}
ARECANUT_GROUP_A = {"mahali_koleroga", "stem_bleeding", "yellow_leaf_disease"}

# Apple Classes
APPLE_CLASSES = [
    "apple_scab",
    "black_rot",
    "cedar_apple_rust",
    "healthy"
]
APPLE_HEALTHY_CLASS = "healthy"

# Tomato Classes
TOMATO_CLASSES = [
    "bacterial_spot",
    "early_blight",
    "healthy",
    "late_blight",
    "leaf_mold",
    "mosaic_virus",
    "septoria_leaf_spot",
    "spider_mites",
    "target_spot",
    "yellow_leaf_curl_virus"
]
TOMATO_HEALTHY_CLASS = "healthy"

# Segmentation settings
LEAF_MASK_EROSION_PX = 3
MIN_LESION_BLOB_PX = 15
LEAF_AREA_MIN_PCT = 0.05
LEAF_AREA_MAX_PCT = 0.95
