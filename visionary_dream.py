 codex/fill-in-demo-code-and-add-options-8yxo44
"""Generate museum-quality visionary art with selectable palettes and patterns.

This version is self-contained and requires only the Python standard library.
It writes a PNG image directly without third-party dependencies.
"""

import argparse
import math
import struct
import zlib
from typing import Callable, List, Sequence, Tuple

# ---------------------------------------------------------------------------
# Color palettes inspired by visionary lineages (RGB 0-255)
# ---------------------------------------------------------------------------
PALETTES: dict[str, Sequence[Tuple[int, int, int]]] = {
    "hilma": [
        (255, 200, 221),  # soft rose
        (211, 226, 255),  # pale sky
        (255, 255, 204),  # light gold
        (204, 246, 221),  # mint
        (229, 203, 255),  # lavender
    ],
    "alex_grey": [
        (0, 0, 0),        # void black
        (0, 128, 255),    # luminous blue
        (0, 255, 128),    # electric green
        (255, 128, 0),    # radiant orange
        (255, 255, 255),  # pure light
    ],
    "surrealism": [
        (255, 0, 127),    # fuchsia
        (0, 255, 255),    # cyan
        (255, 255, 0),    # yellow
        (0, 0, 128),      # navy
        (240, 240, 240),  # mist gray
    ],
    "venus_net": [
        (255, 179, 71),   # amber
        (255, 94, 196),   # magenta
        (117, 84, 249),   # violet
        (42, 171, 224),   # aqua
        (0, 0, 0),        # midnight
    ],
}


# ---------------------------------------------------------------------------
# Pattern functions
# ---------------------------------------------------------------------------
def pattern_radial(x: float, y: float) -> float:
    """Radial symmetry using layered trigonometry."""

    r = math.sqrt(x * x + y * y)
    t = math.atan2(y, x)
    return math.sin(8 * r * r + 6 * t) + math.cos(4 * r - 3 * t)


def pattern_waves(x: float, y: float) -> float:
    """Cartesian wave interference pattern."""

    return math.sin(10 * x) * math.cos(10 * y)


def pattern_flower(x: float, y: float) -> float:
    """Sacred geometry reminiscent of a flower of life."""

    r = math.sqrt(x * x + y * y)
    t = math.atan2(y, x)
    return math.sin(12 * t) * math.cos(6 * r)


PATTERNS: dict[str, Callable[[float, float], float]] = {
    "radial": pattern_radial,
    "waves": pattern_waves,
    "flower": pattern_flower,
}


# ---------------------------------------------------------------------------
# Rendering utilities
# ---------------------------------------------------------------------------
def interpolate_palette(palette: Sequence[Tuple[int, int, int]], value: float) -> Tuple[int, int, int]:
    """Map a normalized value [0,1] onto a palette using linear interpolation."""

    if value <= 0:
        return palette[0]
    if value >= 1:
        return palette[-1]

    pos = value * (len(palette) - 1)
    idx = int(pos)
    frac = pos - idx
    c0 = palette[idx]
    c1 = palette[idx + 1]
    return tuple(int(round((1 - frac) * c0[i] + frac * c1[i])) for i in range(3))


def render(
    width: int, height: int, palette_name: str, pattern_name: str
) -> List[List[Tuple[int, int, int]]]:
    """Generate a 2D array of RGB tuples for the chosen settings."""

    palette = PALETTES[palette_name]
    pattern = PATTERNS[pattern_name]

    rows: List[List[Tuple[int, int, int]]] = []
    for j in range(height):
        y = 2 * j / (height - 1) - 1
        row: List[Tuple[int, int, int]] = []
        for i in range(width):
            x = 2 * i / (width - 1) - 1
            v = pattern(x, y)
            n = (v + 1) / 2  # normalize from [-1,1] to [0,1]
            row.append(interpolate_palette(palette, n))
        rows.append(row)
    return rows


def write_png(filename: str, rows: List[List[Tuple[int, int, int]]]) -> None:
    """Write RGB data to a PNG file using the standard library."""

    height = len(rows)
    width = len(rows[0]) if height else 0

    # Pack scanlines with filter byte 0
    raw = b"".join(b"\x00" + bytes([c for px in row for c in px]) for row in rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(png)


# ---------------------------------------------------------------------------
# Command-line interface
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--style",
        choices=sorted(PALETTES.keys()),
        default="hilma",
        help="color palette to use",
    )
    parser.add_argument(
        "--pattern",
        choices=sorted(PATTERNS.keys()),
        default="radial",
        help="geometric pattern to render",
    )
    parser.add_argument("--width", type=int, default=1024, help="image width in pixels")
    parser.add_argument("--height", type=int, default=1024, help="image height in pixels")
    parser.add_argument(
        "--output",
        default="Visionary_Dream.png",
        help="filename for the generated image",
    )
    args = parser.parse_args()

    rows = render(args.width, args.height, args.style, args.pattern)
    write_png(args.output, rows)


if __name__ == "__main__":
    main()
=======
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
main

