import os
import sys
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)
import config

import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image

class GradCAM:
    def __init__(self, model, target_layer_name='layer4'):
        self.model = model
        self.target_layer_name = target_layer_name
        self.gradients = None
        self.activations = None
        
        target_layer = None
        if hasattr(self.model, 'backbone'):
            for name, module in self.model.backbone.named_modules():
                if name == self.target_layer_name:
                    target_layer = module
                    break
        else:
            for name, module in self.model.named_modules():
                if name == self.target_layer_name:
                    target_layer = module
                    break
                    
        if target_layer is None:
            raise ValueError(f"Target layer {self.target_layer_name} not found in model.")
            
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)
        
    def save_activation(self, module, input, output):
        self.activations = output
        
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
        
    def generate(self, input_tensor, target_class=None):
        self.model.eval()
        self.model.zero_grad()
        
        output = self.model(input_tensor)
        
        if target_class is None:
            if output.shape[1] == config.NUM_ORDINAL_TASKS:
                probs = torch.sigmoid(output)
                from src.corn_loss import corn_probs_to_grade
                pred_grade, _ = corn_probs_to_grade(probs)
                target_class = pred_grade.item()
            else:
                target_class = output.argmax(dim=1).item()
                
        if output.shape[1] == config.NUM_ORDINAL_TASKS:
            if target_class == 0:
                target = -output[0, 0]
            elif target_class == config.NUM_ORDINAL_TASKS:
                target = output[0, target_class - 1]
            else:
                target = output[0, target_class - 1] - output[0, target_class]
        else:
            target = output[0, target_class]
            
        target.backward(retain_graph=False)
        
        gradients = self.gradients[0]
        activations = self.activations[0]
        
        weights = torch.mean(gradients, dim=(1, 2))
        cam = torch.zeros(activations.shape[1:], dtype=torch.float32, device=input_tensor.device)
        for i, w in enumerate(weights):
            cam += w * activations[i]
            
        cam = F.relu(cam)
        cam = cam - torch.min(cam)
        max_val = torch.max(cam)
        if max_val > 0:
            cam = cam / max_val
            
        cam = cam.cpu().detach().numpy()
        self.gradients = None
        self.activations = None
        self.model.zero_grad(set_to_none=True)
        return cam

def overlay_heatmap(image, heatmap, alpha=0.5, colormap='jet'):
    if isinstance(image, Image.Image):
        image_np = np.array(image)
    else:
        image_np = image
        
    h, w = image_np.shape[:2]
    
    # Ultra-lean C++ OpenCV colormap (zero matplotlib memory overhead)
    heatmap_uint8 = np.uint8(np.clip(heatmap, 0, 1) * 255)
    heatmap_resized = cv2.resize(heatmap_uint8, (w, h), interpolation=cv2.INTER_LINEAR)
    
    cv2_cmap = cv2.COLORMAP_JET if colormap == 'jet' else cv2.COLORMAP_VIRIDIS
    colored_bgr = cv2.applyColorMap(heatmap_resized, cv2_cmap)
    colored_rgb = cv2.cvtColor(colored_bgr, cv2.COLOR_BGR2RGB)
    
    overlay = cv2.addWeighted(image_np, 1 - alpha, colored_rgb, alpha, 0)
    return Image.fromarray(overlay)
