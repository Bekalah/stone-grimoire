"""Render a museum-quality visionary art piece inspired by Alex Grey."""

# Import only standard library modules to avoid external dependencies
import math
import struct
import zlib

# Canvas resolution (4K square)
WIDTH, HEIGHT = 4096, 4096

# Psychedelic palette inspired by Alex Grey (RGB 0-255)
PALETTE = [
    (255, 110, 0),   # vivid orange
    (106, 0, 255),   # deep violet
    (0, 255, 212),   # electric aqua
    (255, 0, 133),   # neon magenta
    (255, 255, 0),   # solar yellow
]

# Precompute coordinate scalars
X_SCALE = 2 * math.pi / (WIDTH - 1)
Y_SCALE = 2 * math.pi / (HEIGHT - 1)
R_MAX = math.sqrt(2) * math.pi

# First pass: determine pattern range for normalization
min_val, max_val = float("inf"), float("-inf")
for j in range(HEIGHT):
    ty = -math.pi + j * Y_SCALE
    for i in range(WIDTH):
        tx = -math.pi + i * X_SCALE
        r = math.hypot(tx, ty)
        t = math.atan2(ty, tx)
        pattern = (
            math.sin(3 * r) +
            math.cos(5 * t) +
            math.sin(2 * (tx + ty)) +
            math.cos(2 * (tx - ty))
        )
        if pattern < min_val:
            min_val = pattern
        if pattern > max_val:
            max_val = pattern
range_val = max_val - min_val

# Helper to interpolate Alex Grey palette
segments = len(PALETTE) - 1

def palette_color(value, gradient):
    pos = value * segments
    idx = int(pos)
    frac = pos - idx
    r1, g1, b1 = PALETTE[idx]
    r2, g2, b2 = PALETTE[min(idx + 1, segments)]
    r = int((r1 + (r2 - r1) * frac) * gradient)
    g = int((g1 + (g2 - g1) * frac) * gradient)
    b = int((b1 + (b2 - b1) * frac) * gradient)
    return r, g, b

# Second pass: generate PNG scanlines
scanlines = bytearray()
for j in range(HEIGHT):
    ty = -math.pi + j * Y_SCALE
    scanlines.append(0)  # no filter for this row
    for i in range(WIDTH):
        tx = -math.pi + i * X_SCALE
        r = math.hypot(tx, ty)
        t = math.atan2(ty, tx)
        pattern = (
            math.sin(3 * r) +
            math.cos(5 * t) +
            math.sin(2 * (tx + ty)) +
            math.cos(2 * (tx - ty))
        )
        norm = (pattern - min_val) / range_val
        gradient = 1 - min(r / R_MAX, 1)
        scanlines.extend(palette_color(norm, gradient))

# Build PNG chunks
png = bytearray(b"\x89PNG\r\n\x1a\n")
# IHDR chunk
ihdr = struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0)
png.extend(struct.pack(">I", len(ihdr)))
png.extend(b"IHDR")
png.extend(ihdr)
png.extend(struct.pack(">I", zlib.crc32(b"IHDR" + ihdr) & 0xFFFFFFFF))
# IDAT chunk
compressed = zlib.compress(bytes(scanlines), level=9)
png.extend(struct.pack(">I", len(compressed)))
png.extend(b"IDAT")
png.extend(compressed)
png.extend(struct.pack(">I", zlib.crc32(b"IDAT" + compressed) & 0xFFFFFFFF))
# IEND chunk
png.extend(struct.pack(">I", 0))
png.extend(b"IEND")
png.extend(struct.pack(">I", zlib.crc32(b"IEND") & 0xFFFFFFFF))

# Save final image
with open("Visionary_Dream.png", "wb") as f:
    f.write(png)
