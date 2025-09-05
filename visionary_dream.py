# Visionary art generation using Python and Pillow
# Color palette inspired by Alex Grey's psychedelic spectrum

import numpy as np
from PIL import Image

# Set canvas resolution
WIDTH, HEIGHT = 1920, 1080

# Create coordinate grids centered at origin
x = np.linspace(-1, 1, WIDTH)
y = np.linspace(-1, 1, HEIGHT)
X, Y = np.meshgrid(x, y)

# Compute radial distance and polar angle
R = np.sqrt(X**2 + Y**2)
theta = np.arctan2(Y, X)

# Layered trigonometric waves for visionary geometry
wave = np.sin(10 * R + 5 * theta) + np.sin(15 * R - 4 * theta)

# Normalize wave to 0-1 range
wave_norm = (wave - wave.min()) / (wave.max() - wave.min())

# Alex Grey-inspired spectral palette (violet to red)
palette = np.array([
    [148, 0, 211],
    [75, 0, 130],
    [0, 0, 255],
    [0, 255, 0],
    [255, 255, 0],
    [255, 127, 0],
    [255, 0, 0]
], dtype=np.float32) / 255.0

# Interpolate colors across the palette
indices = wave_norm * (palette.shape[0] - 1)
low = np.floor(indices).astype(int)
high = np.ceil(indices).astype(int)
frac = indices - low
rgb = palette[low] * (1 - frac[..., None]) + palette[high] * frac[..., None]

# Convert to image and save
Image.fromarray((rgb * 255).astype(np.uint8)).save("Visionary_Dream.png")
