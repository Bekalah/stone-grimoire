"""Generate a museum-quality visionary art piece inspired by Hilma af Klint."""

# Import required libraries
import numpy as np
from PIL import Image

# Resolution of the output image (4K)
WIDTH, HEIGHT = 3840, 2160

# Generate a coordinate grid centered at the canvas origin
x = np.linspace(-1, 1, WIDTH)
y = np.linspace(-1, 1, HEIGHT)
X, Y = np.meshgrid(x, y)

# Compute polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Layered trigonometric pattern for visionary geometry
pattern = np.sin(8 * R**2 + 6 * T) + np.cos(4 * R - 3 * T)

# Normalize pattern to the range [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Define a pastel palette inspired by Hilma af Klint (RGB 0-1)
palette = np.array([
    [255, 200, 221],  # soft rose
    [211, 226, 255],  # pale sky
    [255, 255, 204],  # light gold
    [204, 246, 221],  # mint
    [229, 203, 255],  # lavender
]) / 255.0

# Interpolate the palette across the normalized pattern
xp = np.linspace(0, 1, len(palette))
RGB = np.empty((HEIGHT, WIDTH, 3))
for c in range(3):
    RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

# Convert to 8-bit color and create image
img = Image.fromarray((RGB * 255).astype(np.uint8))

# Save the generated artwork
img.save("Visionary_Dream.png")

