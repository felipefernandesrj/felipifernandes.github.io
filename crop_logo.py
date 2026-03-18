from PIL import Image
import numpy as np

# Open the logo
img_path = 'assets/docs/Performance/d1000-Profarma/logotipos/dm_marca_f_02_rgb.png'
out_path = 'assets/docs/Performance/d1000-Profarma/logotipos/dm_marca_f_02_rgb_cropped.png'
img = Image.open(img_path)

print(f"Mode: {img.mode}, Size: {img.size}")

# Convert to RGBA if needed
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Get pixel data
data = np.array(img)

# Find pixels that are visible (alpha > 0)
visible = data[:, :, 3] > 0

# Find bounding box of visible content
rows = np.any(visible, axis=1)
cols = np.any(visible, axis=0)

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
    cropped.save(out_path)
    print(f"Cropped successfully! Original: {img.size}, New: {cropped.size}")
else:
    print("No content found")
