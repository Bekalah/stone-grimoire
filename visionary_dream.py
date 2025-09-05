"""Render a museum-quality visionary art piece inspired by Alex Grey."""

# Import required libraries
import numpy as np
from PIL import Image
from datetime import datetime

# Canvas resolution (4K square)
WIDTH, HEIGHT = 4096, 4096

# Craft coordinate grid centered at origin
x = np.linspace(-np.pi, np.pi, WIDTH)
y = np.linspace(-np.pi, np.pi, HEIGHT)
X, Y = np.meshgrid(x, y)

# Polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Layered visionary geometry using trigonometric waves
pattern = (
    np.sin(3 * R) +
    np.cos(5 * T) +
    np.sin(2 * (X + Y)) +
    np.cos(2 * (X - Y))
)

# Normalize pattern to [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Psychedelic palette inspired by Alex Grey (RGB 0-1)
palette = np.array([
    [255, 110, 0],   # vivid orange
    [106, 0, 255],   # deep violet
    [0, 255, 212],   # electric aqua
    [255, 0, 133],   # neon magenta
    [255, 255, 0],   # solar yellow
]) / 255.0

# Interpolate palette across pattern
xp = np.linspace(0, 1, len(palette))
RGB = np.empty((HEIGHT, WIDTH, 3))
for c in range(3):
    RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

# Radial gradient for depth
gradient = 1 - np.clip(R / R.max(), 0, 1)
RGB *= gradient[..., None]

# Convert to 8-bit image and save with timestamped filename
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"Visionary_Dream_{timestamp}.png"
Image.fromarray((RGB * 255).astype(np.uint8)).save(filename)

