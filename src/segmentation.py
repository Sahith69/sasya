import os
import sys
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
import config

import numpy as np

def otsu_threshold(gray_img, mask=None):
    if mask is None:
        mask = np.ones_like(gray_img, dtype=bool)
    pixels = gray_img[mask]
    if pixels.size == 0:
        return 0
    
    hist, bin_edges = np.histogram(pixels, bins=256, range=(0, 256))
    bin_mids = (bin_edges[:-1] + bin_edges[1:]) / 2.0
    
    weight1 = np.cumsum(hist)
    weight2 = np.cumsum(hist[::-1])[::-1]
    
    mean1 = np.cumsum(hist * bin_mids) / (weight1 + 1e-8)
    mean2 = (np.cumsum((hist * bin_mids)[::-1]) / (weight2[::-1] + 1e-8))[::-1]
    
    variance12 = weight1[:-1] * weight2[1:] * (mean1[:-1] - mean2[1:]) ** 2
    
    if len(variance12) == 0:
        return 0
    
    idx = np.argmax(variance12)
    return bin_mids[idx]

def get_disk(radius):
    y, x = np.ogrid[-radius:radius+1, -radius:radius+1]
    return x**2 + y**2 <= radius**2

def binary_erosion(mask, radius):
    if radius == 0:
        return mask
    disk = get_disk(radius)
    offsets = np.argwhere(disk) - radius
    padded = np.pad(mask, radius, mode='constant', constant_values=False)
    eroded = np.ones_like(mask, dtype=bool)
    for dy, dx in offsets:
        eroded &= padded[radius+dy : radius+dy+mask.shape[0], radius+dx : radius+dx+mask.shape[1]]
    return eroded

def filter_small_components(mask, min_size):
    visited = np.zeros_like(mask, dtype=bool)
    output = np.zeros_like(mask, dtype=bool)
    rows, cols = mask.shape
    ys, xs = np.nonzero(mask)
    
    for start_y, start_x in zip(ys, xs):
        if not visited[start_y, start_x]:
            queue = [(start_y, start_x)]
            visited[start_y, start_x] = True
            component = []
            head = 0
            while head < len(queue):
                y, x = queue[head]
                head += 1
                component.append((y, x))
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < rows and 0 <= nx < cols:
                        if mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            queue.append((ny, nx))
                            
            if len(component) >= min_size:
                for cy, cx in component:
                    output[cy, cx] = True
    return output

def segment_leaf_adaptive(img_array):
    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)
    
    exg = 2.0 * g - r - b
    exg_scaled = np.clip((exg + 255.0) / 2.0, 0, 255).astype(np.uint8)
    
    thresh = otsu_threshold(exg_scaled)
    leaf_mask = exg_scaled > thresh
    return leaf_mask

def detect_lesions_group_a(img_array, leaf_mask):
    eroded_mask = binary_erosion(leaf_mask, config.LEAF_MASK_EROSION_PX)
    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)
    
    exr = 1.4 * r - g
    exr_masked = np.zeros_like(exr)
    exr_masked[eroded_mask] = exr[eroded_mask]
    exr_scaled = np.clip(exr_masked + 128.0, 0, 255).astype(np.uint8)
    
    thresh = otsu_threshold(exr_scaled, mask=eroded_mask)
    lesion_mask = (exr_scaled > thresh) & eroded_mask
    return filter_small_components(lesion_mask, config.MIN_LESION_BLOB_PX)

def detect_dead_heart(img_array, leaf_mask):
    eroded_mask = binary_erosion(leaf_mask, config.LEAF_MASK_EROSION_PX)
    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)
    
    yellowness = (r + g) / 2.0 - b
    yellowness_scaled = np.clip(yellowness + 128.0, 0, 255).astype(np.uint8)
    
    thresh = otsu_threshold(yellowness_scaled, mask=eroded_mask)
    discoloration_mask = (yellowness_scaled > thresh) & eroded_mask
    return filter_small_components(discoloration_mask, config.MIN_LESION_BLOB_PX)

def detect_hispa(img_array, leaf_mask):
    eroded_mask = binary_erosion(leaf_mask, config.LEAF_MASK_EROSION_PX)
    r = img_array[:, :, 0].astype(np.float32)
    g = img_array[:, :, 1].astype(np.float32)
    b = img_array[:, :, 2].astype(np.float32)
    
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = np.zeros_like(r)
    non_zero = max_c > 0
    sat[non_zero] = (max_c[non_zero] - min_c[non_zero]) / (max_c[non_zero] + 1e-8)
    
    hispa_candidate = (brightness > 150) & (sat < 0.25) & eroded_mask
    return filter_small_components(hispa_candidate, config.MIN_LESION_BLOB_PX)

def compute_ratio(lesion_mask, leaf_mask):
    leaf_area = np.sum(leaf_mask)
    if leaf_area == 0:
        return 0.0
    lesion_area = np.sum(lesion_mask)
    return float(lesion_area / leaf_area)
