from PIL import Image
import numpy as np

# Open the logo
img_path = 'assets/docs/Performance/d1000-Profarma/logotipos/dm_marca_f_01_rgb.png'
img = Image.open(img_path)

print(f"Mode: {img.mode}, Size: {img.size}")

# Convert to RGBA if needed
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Get pixel data
data = np.array(img)

# Find pixels that are NOT white/near-white (threshold 250)
# Check RGB channels, ignore alpha
non_white = np.any(data[:, :, :3] < 250, axis=2)

# Find bounding box of non-white content
rows = np.any(non_white, axis=1)
cols = np.any(non_white, axis=0)

if rows.any() and cols.any():
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    
    # Add small padding
    padding = 2
    rmin = max(0, rmin - padding)
    rmax = min(data.shape[0], rmax + padding + 1)
    cmin = max(0, cmin - padding)
    cmax = min(data.shape[1], cmax + padding + 1)
    
    # Crop
    cropped = img.crop((cmin, rmin, cmax, rmax))
    cropped.save(img_path)
    print(f"Cropped successfully! Original: {img.size}, New: {cropped.size}")
else:
    print("No content found")
