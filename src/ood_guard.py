import os
import sys
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
import config

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

OOD_PARAMS_FILE = os.path.join(config.MODELS_DIR, "ood_params.pt")

def get_image_transform():
    return transforms.Compose([
        transforms.Resize((config.IMG_SIZE, config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(config.IMAGENET_MEAN, config.IMAGENET_STD),
    ])

def get_feature_extractor(crop_name: str):
    key = crop_name.lower()
    if key == "apple":
        pth = os.path.join(config.MODELS_DIR, "apple_disease_fgvc_v1.pth")
        if not os.path.exists(pth):
            pth = os.path.join(config.MODELS_DIR, "apple_disease_classifier.pth")
    else:
        pth = os.path.join(config.MODELS_DIR, f"{key}_disease_classifier.pth")
    if not os.path.exists(pth):
        raise FileNotFoundError(f"Model checkpoint not found: {pth}")

    ck = torch.load(pth, map_location="cpu", weights_only=True)
    classes = ck["classes"]
    model = models.resnet18(weights=None)
    if "fc.1.weight" in ck["model_state_dict"]:
        model.fc = nn.Sequential(nn.Dropout(p=0.4), nn.Linear(model.fc.in_features, len(classes)))
    else:
        model.fc = nn.Linear(model.fc.in_features, len(classes))

    model.load_state_dict(ck["model_state_dict"])
    model.fc = nn.Identity()
    model.eval()
    return model, classes

def compute_mahalanobis_scores(features: np.ndarray, means: np.ndarray, precision: np.ndarray) -> np.ndarray:
    diff = features[:, np.newaxis, :] - means[np.newaxis, :, :]  # (N, C, 512)
    diff_precision = np.einsum('ncd,de->nce', diff, precision)   # (N, C, 512)
    dists_sq = np.einsum('nce,nce->nc', diff_precision, diff)    # (N, C)
    dists_sq = np.maximum(dists_sq, 0.0)
    min_dist_sq = np.min(dists_sq, axis=1)                       # (N,)
    return np.sqrt(min_dist_sq)

_OOD_MODELS = {}
_OOD_PARAMS = None

def load_ood_params():
    global _OOD_PARAMS
    if _OOD_PARAMS is None:
        if not os.path.exists(OOD_PARAMS_FILE):
            return None
        _OOD_PARAMS = torch.load(OOD_PARAMS_FILE, map_location="cpu", weights_only=False)
    return _OOD_PARAMS

def check_ood(image: Image.Image, crop_name: str):
    key = crop_name.lower()
    params = load_ood_params()
    if params is None or key not in params:
        return False, 0.0, 999.0

    crop_data = params[key]
    means = crop_data["means"].numpy() if isinstance(crop_data["means"], torch.Tensor) else crop_data["means"]
    precision = crop_data["precision"].numpy() if isinstance(crop_data["precision"], torch.Tensor) else crop_data["precision"]
    threshold = float(crop_data["threshold"])

    global _OOD_MODELS
    if key not in _OOD_MODELS:
        model, _ = get_feature_extractor(crop_name)
        _OOD_MODELS[key] = model
    model = _OOD_MODELS[key]

    tf = get_image_transform()
    t = tf(image.convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        feat = model(t).cpu().numpy()

    score = float(compute_mahalanobis_scores(feat, means, precision)[0])
    is_ood = bool(score > threshold)
    return is_ood, score, threshold
