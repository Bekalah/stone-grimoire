"""Render a visionary collage weaving Kabbalistic and alchemical symbols."""

# Import required libraries
import numpy as np
from PIL import Image, ImageDraw
from datetime import datetime

# Canvas resolution (4K square)
WIDTH, HEIGHT = 4096, 4096

# Create coordinate grid centered at origin
x = np.linspace(-np.pi, np.pi, WIDTH)
y = np.linspace(-np.pi, np.pi, HEIGHT)
X, Y = np.meshgrid(x, y)

# Polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Layered wave patterns for cosmic background
pattern = (
    np.sin(3 * R) +
    np.cos(4 * T) +
    np.sin(2 * (X + Y)) +
    np.cos(3 * (X - Y))
)

# Normalize pattern to [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Surreal palette inspired by Alex Grey (RGB 0-1)
palette = np.array([
    [255, 0, 127],    # magenta
    [0, 255, 150],    # aqua green
    [255, 140, 0],    # orange
    [75, 0, 130],     # indigo
    [255, 215, 0],    # gold
]) / 255.0

# Interpolate palette across pattern
xp = np.linspace(0, 1, len(palette))
RGB = np.empty((HEIGHT, WIDTH, 3))
for c in range(3):
    RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

# Convert to image
img = Image.fromarray((RGB * 255).astype(np.uint8))
draw = ImageDraw.Draw(img)

# Kabbalistic Tree of Life coordinates (relative positions)
sephirot = [
    (0.5, 0.05), (0.75, 0.15), (0.25, 0.15),
    (0.75, 0.35), (0.25, 0.35), (0.5, 0.5),
    (0.75, 0.65), (0.25, 0.65), (0.5, 0.8), (0.5, 0.95)
]

# Convert to pixel coordinates
sephirot_px = [(int(x*WIDTH), int(y*HEIGHT)) for x, y in sephirot]

# Connections between sephirot
paths = [
    (0,1), (0,2), (1,2), (1,3), (2,4),
    (3,5), (4,5), (3,6), (4,7), (6,8), (7,8), (8,9)
]

# Draw connections
for a, b in paths:
    draw.line([sephirot_px[a], sephirot_px[b]], fill=(255,255,255,128), width=5)

# Draw sephirot circles
for cx, cy in sephirot_px:
    r = 40
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(255,255,255), width=5)

# Alchemical symbols positions and shapes
symbol_color = (255, 255, 255)
# Fire triangle
draw.polygon([
    (WIDTH*0.1, HEIGHT*0.85),
    (WIDTH*0.15, HEIGHT*0.75),
    (WIDTH*0.2, HEIGHT*0.85)
], outline=symbol_color, width=5)
# Water inverted triangle
draw.polygon([
    (WIDTH*0.8, HEIGHT*0.75),
    (WIDTH*0.85, HEIGHT*0.85),
    (WIDTH*0.9, HEIGHT*0.75)
], outline=symbol_color, width=5)
# Air triangle with line
draw.polygon([
    (WIDTH*0.3, HEIGHT*0.25),
    (WIDTH*0.35, HEIGHT*0.15),
    (WIDTH*0.4, HEIGHT*0.25)
], outline=symbol_color, width=5)
draw.line([
    (WIDTH*0.32, HEIGHT*0.2),
    (WIDTH*0.38, HEIGHT*0.2)
], fill=symbol_color, width=5)
# Earth inverted triangle with line
draw.polygon([
    (WIDTH*0.6, HEIGHT*0.15),
    (WIDTH*0.65, HEIGHT*0.25),
    (WIDTH*0.7, HEIGHT*0.15)
], outline=symbol_color, width=5)
draw.line([
    (WIDTH*0.62, HEIGHT*0.2),
    (WIDTH*0.68, HEIGHT*0.2)
], fill=symbol_color, width=5)

# Save the final visionary artwork with a timestamped filename
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"Visionary_Dream_{timestamp}.png"
img.save(filename)
