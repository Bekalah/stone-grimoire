"""Generate Visionary_Dream.png: museum-quality visionary art."""

# Complete runnable code with imports and setup
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math
import random

# Resolution settings
WIDTH, HEIGHT = 2048, 2048
CENTER = (WIDTH // 2, HEIGHT // 2)

# Color palette inspired by Alex Grey and Hilma af Klint
COLORS = {
    'ultramarine': (63, 0, 255),     # deep blue
    'vermilion': (227, 66, 52),      # vivid red-orange
    'gold': (255, 215, 0),           # alchemical gold
    'peacock': (0, 166, 147),        # peacock green
    'bone': (10, 10, 10)             # bone black
}

# Create gradient background
bg = Image.new('RGB', (WIDTH, HEIGHT), COLORS['bone'])
pixels = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
for y in range(HEIGHT):
    for x in range(WIDTH):
        # radial distance from center normalized 0-1
        r = math.hypot(x - CENTER[0], y - CENTER[1]) / (WIDTH/2)
        r = min(r, 1)
        # interpolate between peacock and ultramarine
        r_color = [
            int(COLORS['peacock'][i] * (1 - r) + COLORS['ultramarine'][i] * r)
            for i in range(3)
        ]
        pixels[y, x] = r_color
bg = Image.fromarray(pixels)

# Draw visionary geometry overlay
canvas = ImageDraw.Draw(bg, 'RGBA')

# Concentric circles with gold glow
for radius in range(100, WIDTH//2, 100):
    alpha = int(255 * (1 - radius / (WIDTH//2)))
    canvas.ellipse([
        CENTER[0] - radius, CENTER[1] - radius,
        CENTER[0] + radius, CENTER[1] + radius
    ], outline=COLORS['gold'] + (alpha,))

# Radiating rays in vermilion
for angle in range(0, 360, 15):
    rad = math.radians(angle)
    x = CENTER[0] + int(math.cos(rad) * (WIDTH//2))
    y = CENTER[1] + int(math.sin(rad) * (HEIGHT//2))
    canvas.line([CENTER, (x, y)], fill=COLORS['vermilion'] + (128,), width=3)

# Add random mystic orbs with blur
for _ in range(50):
    radius = random.randint(10, 40)
    x = random.randint(0, WIDTH)
    y = random.randint(0, HEIGHT)
    color = random.choice(list(COLORS.values()))
    orb = Image.new('RGBA', (radius*2, radius*2), (0, 0, 0, 0))
    draw_orb = ImageDraw.Draw(orb)
    draw_orb.ellipse([0, 0, radius*2, radius*2], fill=color + (180,))
    orb = orb.filter(ImageFilter.GaussianBlur(radius/2))
    bg.paste(orb, (x - radius, y - radius), orb)

# Save final artwork
bg.save('Visionary_Dream.png')
