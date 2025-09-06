"""Render a museum-quality visionary art piece inspired by Alex Grey."""

# Import numerical and imaging libraries
import numpy as np
from PIL import Image, ImageFilter

# Canvas resolution (square)
WIDTH, HEIGHT = 1024, 1024

# Create coordinate grids as the lattice of the dream
y, x = np.mgrid[0:HEIGHT, 0:WIDTH]

# Compose an ethereal base pattern using gentle harmonic waves
pattern = np.sin(x * 0.015) + np.cos(y * 0.02) + np.sin((x + y) * 0.01)

# Layer a radial pulse for a mandala-like center
cx, cy = WIDTH / 2, HEIGHT / 2
radius = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
pattern += np.cos(radius * 0.03)

# Normalize to 0–1 to prepare for color mapping
pattern = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Mirror the pattern to evoke sacred symmetry and calm focus
pattern = (pattern + pattern[:, ::-1] + pattern[::-1, :] + pattern[::-1, ::-1]) / 4

# Define a luminous palette inspired by Alex Grey's visionary spectra
palette = np.array([
    [20, 10, 40],    # deep indigo night
    [85, 0, 120],    # royal violet ascent
    [255, 120, 0],   # radiant orange soul
    [255, 236, 150], # golden enlightenment
    [0, 200, 150]    # turquoise aura breeze
])

# Map pattern values to colors through linear interpolation
scaled = pattern * (len(palette) - 1)
idx = np.floor(scaled).astype(int)
frac = scaled - idx
color = (palette[idx] * (1 - frac[..., None]) +
         palette[np.clip(idx + 1, 0, len(palette) - 1)] * frac[..., None])

# Weave the color array into an image
image = Image.fromarray(color.astype(np.uint8), mode="RGB")

# Soften edges for gentle gradients, honoring trauma-informed visuals
image = image.filter(ImageFilter.GaussianBlur(radius=2))

# Render the final dreamscape without noise or flash
image.save("Visionary_Dream.png")
