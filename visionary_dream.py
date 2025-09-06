"""Procedurally generate a colorful world map and save as Visionary_Dream.png."""

import argparse
import json
import math
import random
import struct
import zlib

# ------------------------------
# Pure Python PNG writer
# ------------------------------
def write_png(filename, width, height, pixels):
    """Write a 24-bit RGB PNG file."""
    # Flatten pixel rows with filter byte 0
    raw = b"".join(b"\x00" + bytes(r for rgb in row for r in rgb) for row in pixels)
    compressor = zlib.compressobj()
    compressed = compressor.compress(raw) + compressor.flush()

    def chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack("!I", len(data)) + tag + data + struct.pack("!I", crc)

    with open(filename, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0)))
        f.write(chunk(b"IDAT", compressed))
        f.write(chunk(b"IEND", b""))

# ------------------------------
# Interpolate between two colors
# ------------------------------
def lerp_color(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))

# ------------------------------
# Generate a smooth height map
# ------------------------------
def generate_height_map(width, height, seed):
    random.seed(seed)
    grid = [[random.random() for _ in range(width)] for _ in range(height)]
    # simple smoothing passes
    for _ in range(3):
        new = [[0.0] * width for _ in range(height)]
        for y in range(height):
            for x in range(width):
                total = 0.0
                count = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = (y + dy) % height, (x + dx) % width
                        total += grid[ny][nx]
                        count += 1
                new[y][x] = total / count
        grid = new
    return grid

# ------------------------------
# Map height values to Alex Grey inspired colors
# ------------------------------
PALETTE = [
    (48, 0, 108),    # deep violet
    (0, 170, 255),   # electric blue
    (255, 93, 0),    # vibrant orange
    (255, 255, 0),   # radiant yellow
]


def height_to_color(value):
    if value < 0.33:
        t = value / 0.33
        c1, c2 = PALETTE[0], PALETTE[1]
    elif value < 0.66:
        t = (value - 0.33) / 0.33
        c1, c2 = PALETTE[1], PALETTE[2]
    else:
        t = (value - 0.66) / 0.34
        c1, c2 = PALETTE[2], PALETTE[3]
    return lerp_color(c1, c2, t)

# ------------------------------
# Main execution
# ------------------------------
parser = argparse.ArgumentParser(description="Procedural visionary world builder")
parser.add_argument("--width", type=int, default=256, help="map width")
parser.add_argument("--height", type=int, default=256, help="map height")
parser.add_argument("--seed", type=int, default=0, help="random seed")
args = parser.parse_args()

# Generate height map and corresponding RGB pixels
heights = generate_height_map(args.width, args.height, args.seed)
pixels = [[height_to_color(h) for h in row] for row in heights]

# Save artwork
write_png("Visionary_Dream.png", args.width, args.height, pixels)

# Persist world data for game expansion
world = {"width": args.width, "height": args.height, "map": heights}
with open("visionary_world.json", "w") as f:
    json.dump(world, f)
