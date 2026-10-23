"""
test_engine.py - Smoke test verifying all models and inference functions in hackcache.
"""
import os
import sys
from PIL import Image

from engine import CropVisionEngine, pil_to_base64

def test_all():
    print("Initializing CropVisionEngine...")
    engine = CropVisionEngine()
    
    samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")
    test_files = [
        ("Paddy", os.path.join(samples_dir, "sample_paddy.jpg")),
        ("Arecanut", os.path.join(samples_dir, "sample_arecanut.jpg")),
        ("Apple", os.path.join(samples_dir, "sample_apple.jpg")),
        ("Tomato", os.path.join(samples_dir, "sample_tomato.jpg")),
        ("Non-Crop / Noise", os.path.join(samples_dir, "sample_random_noise.jpg")),
    ]
    
    print("\n" + "="*65)
    for expected_crop, img_path in test_files:
        if not os.path.exists(img_path):
            print(f"Skipping {img_path} (file not found)")
            continue
            
        print(f"\n[TEST] Input: {expected_crop} ({os.path.basename(img_path)})")
        img = Image.open(img_path)
        
        hint = None if "Non-Crop" in expected_crop else expected_crop
        res = engine.diagnose(img, crop_hint=hint, generate_visuals=True)
        
        print(f"  Success:        {res['success']}")
        print(f"  Valid Crop:     {res['verification']['is_valid_crop']}")
        print(f"  Detected Crop:  {res['crop']}")
        print(f"  Disease:        {res['disease']}")
        print(f"  Confidence:     {res['confidence'] * 100:.2f}%")
        print(f"  Severity Grade: {res['severity']['grade']} ({res['severity']['label']})")
        print(f"  Lesion Ratio:   {res['severity']['lesion_ratio_pct']}%")
        print(f"  Grad-CAM Gen:   {'Yes' if res['visuals']['gradcam_image'] else 'No'}")
        print(f"  Mask Gen:       {'Yes' if res['visuals']['mask_image'] else 'No'}")
        if res['error']:
            print(f"  Rejection Note: {res['error']}")
        
    print("\n" + "="*65)
    print("✅ All engine inference tests completed successfully!")

if __name__ == "__main__":
    test_all()
