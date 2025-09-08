import math
import zlib
import struct

# Canvas resolution
WIDTH, HEIGHT = 800, 800

# Surreal palette inspired by Alex Grey
PALETTE = [
    (255, 0, 127),   # magenta
    (0, 255, 150),   # aqua green
    (255, 140, 0),   # orange
    (75, 0, 130),    # indigo
    (255, 215, 0),   # gold
]

# Initialize pattern array and track min/max for normalization
pattern = [[0.0 for _ in range(WIDTH)] for _ in range(HEIGHT)]
min_val, max_val = float('inf'), float('-inf')
for y in range(HEIGHT):
    ny = -math.pi + (2 * math.pi) * (y / (HEIGHT - 1))
    for x in range(WIDTH):
        nx = -math.pi + (2 * math.pi) * (x / (WIDTH - 1))
        r = math.hypot(nx, ny)
        t = math.atan2(ny, nx)
        val = (
            math.sin(3 * r) +
            math.cos(4 * t) +
            math.sin(2 * (nx + ny)) +
            math.cos(3 * (nx - ny))
        )
        pattern[y][x] = val
        if val < min_val:
            min_val = val
        if val > max_val:
            max_val = val

# Helper to interpolate palette
def interp_palette(v):
    v = max(0.0, min(1.0, v))
    p = v * (len(PALETTE) - 1)
    i = int(p)
    f = p - i
    c1 = PALETTE[i]
    c2 = PALETTE[min(i + 1, len(PALETTE) - 1)]
    return (
        int(c1[0] + (c2[0] - c1[0]) * f),
        int(c1[1] + (c2[1] - c1[1]) * f),
        int(c1[2] + (c2[2] - c1[2]) * f),
    )

# Create pixel array from normalized pattern
pixels = [[(0, 0, 0) for _ in range(WIDTH)] for _ in range(HEIGHT)]
for y in range(HEIGHT):
    for x in range(WIDTH):
        norm = (pattern[y][x] - min_val) / (max_val - min_val)
        pixels[y][x] = interp_palette(norm)

# Drawing utilities

def set_pixel(x, y, color):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        pixels[y][x] = color

def draw_line(x1, y1, x2, y2, color, width=1):
    dx, dy = x2 - x1, y2 - y1
    steps = int(max(abs(dx), abs(dy)))
    if steps == 0:
        set_pixel(int(round(x1)), int(round(y1)), color)
        return
    for i in range(steps + 1):
        x = x1 + dx * i / steps
        y = y1 + dy * i / steps
        for ox in range(-width // 2, width // 2 + 1):
            for oy in range(-width // 2, width // 2 + 1):
                set_pixel(int(round(x + ox)), int(round(y + oy)), color)

def draw_circle(cx, cy, r, color, width=1):
    for angle in range(360):
        x = cx + r * math.cos(math.radians(angle))
        y = cy + r * math.sin(math.radians(angle))
        for ox in range(-width // 2, width // 2 + 1):
            for oy in range(-width // 2, width // 2 + 1):
                set_pixel(int(round(x + ox)), int(round(y + oy)), color)

def draw_polygon(points, color, width=1):
    for i in range(len(points)):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % len(points)]
        draw_line(x1, y1, x2, y2, color, width)

# Kabbalistic Tree of Life
=======
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
main
sephirot = [
    (0.5, 0.05), (0.75, 0.15), (0.25, 0.15),
    (0.75, 0.35), (0.25, 0.35), (0.5, 0.5),
    (0.75, 0.65), (0.25, 0.65), (0.5, 0.8), (0.5, 0.95)
]
paths = [
    (0,1), (0,2), (1,2), (1,3), (2,4),
    (3,5), (4,5), (3,6), (4,7), (6,8), (7,8), (8,9)
]
codex/explore-multimedia-art-techniques-lg6t15
for a, b in paths:
    draw_line(seph_px[a][0], seph_px[a][1], seph_px[b][0], seph_px[b][1], (255,255,255), width=3)
for cx, cy in seph_px:
    draw_circle(cx, cy, 20, (255,255,255), width=3)

# Alchemical symbols
symbol_color = (255, 255, 255)
# Fire
draw_polygon([
    (int(WIDTH*0.1), int(HEIGHT*0.85)),
    (int(WIDTH*0.15), int(HEIGHT*0.75)),
    (int(WIDTH*0.2), int(HEIGHT*0.85))
], symbol_color, width=3)
# Water
draw_polygon([
    (int(WIDTH*0.8), int(HEIGHT*0.75)),
    (int(WIDTH*0.85), int(HEIGHT*0.85)),
    (int(WIDTH*0.9), int(HEIGHT*0.75))
], symbol_color, width=3)
# Air
draw_polygon([
    (int(WIDTH*0.3), int(HEIGHT*0.25)),
    (int(WIDTH*0.35), int(HEIGHT*0.15)),
    (int(WIDTH*0.4), int(HEIGHT*0.25))
], symbol_color, width=3)
draw_line(int(WIDTH*0.32), int(HEIGHT*0.2), int(WIDTH*0.38), int(HEIGHT*0.2), symbol_color, width=3)
# Earth
draw_polygon([
    (int(WIDTH*0.6), int(HEIGHT*0.15)),
    (int(WIDTH*0.65), int(HEIGHT*0.25)),
    (int(WIDTH*0.7), int(HEIGHT*0.15))
], symbol_color, width=3)
draw_line(int(WIDTH*0.62), int(HEIGHT*0.2), int(WIDTH*0.68), int(HEIGHT*0.2), symbol_color, width=3)

# Minimal PNG writer

def save_png(filename, pixel_data):
    def chunk(chunk_type, data):
        return (struct.pack('!I', len(data)) + chunk_type + data +
                struct.pack('!I', zlib.crc32(chunk_type + data) & 0xffffffff))
    raw_data = b''
    for row in pixel_data:
        raw_data += b'\x00' + bytes([c for pixel in row for c in pixel])
    with open(filename, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        ihdr = struct.pack('!IIBBBBB', WIDTH, HEIGHT, 8, 2, 0, 0, 0)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', zlib.compress(raw_data, 9)))
        f.write(chunk(b'IEND', b''))

# Save final artwork
save_png('Visionary_Dream.png', pixels)
=======

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
main
