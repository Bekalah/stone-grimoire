"""Generate a museum-quality visionary art piece inspired by Alex Grey."""

# Import required libraries
import numpy as np
from PIL import Image

# Canvas resolution (4K square)
WIDTH, HEIGHT = 4096, 4096

# Generate coordinate grid centered at the canvas origin
x = np.linspace(-2, 2, WIDTH)
y = np.linspace(-2, 2, HEIGHT)
X, Y = np.meshgrid(x, y)

# Compute polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Simulate tesseract-inspired 4D rotations
theta = np.pi / 4
x4 = X * np.cos(theta) - Y * np.sin(theta)
y4 = X * np.sin(theta) + Y * np.cos(theta)
z4 = np.sin(x4)
w4 = np.cos(y4)

# Layered trigonometric field for visionary geometry
pattern = (
    np.sin(4 * R + 8 * T)
    + np.cos(4 * (R - T))
    + np.sin(3 * (x4 + z4))
    + np.cos(3 * (y4 + w4))
)

# Normalize pattern to range [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Define a vibrant palette inspired by Alex Grey (RGB 0-1)
palette = np.array([
    [75, 0, 130],   # indigo
    [0, 0, 255],    # blue
    [0, 255, 255],  # cyan
    [0, 255, 0],    # green
    [255, 255, 0],  # yellow
    [255, 165, 0],  # orange
    [255, 0, 0],    # red
]) / 255.0

# Interpolate palette across the normalized pattern
xp = np.linspace(0, 1, len(palette))
RGB = np.empty((HEIGHT, WIDTH, 3))
for c in range(3):
    RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

# Convert to 8-bit color and create image
img = Image.fromarray((RGB * 255).astype(np.uint8))

# Save the generated artwork
img.save("Visionary_Dream.png")

