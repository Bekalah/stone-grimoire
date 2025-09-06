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
codex/fill-in-demo-code-and-add-options-racrhm
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


 codex/fill-in-demo-code-and-add-options-racrhm
PATTERNS: dict[str, Callable[[float, float], float]] = {
    "radial": pattern_radial,
    "waves": pattern_waves,

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
 codex/fill-in-demo-code-and-add-options-racrhm
"""Render a museum-quality visionary art piece inspired by Alex Grey."""

# Import required libraries
import argparse
"""Generate visionary art and corresponding music based on user art and tarot."""

# Import required libraries
import argparse
import math
import wave
# Visionary art generation using Python and Pillow
# Color palette inspired by Alex Grey's psychedelic spectrum

# Visionary art generation using Python and Pillow
# Color palette inspired by Alex Grey's psychedelic spectrum

import numpy as np
from PIL import Image
from datetime import datetime

# Predefined color palettes inspired by different art lineages (RGB 0-255)
PALETTES = {
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
}


def generate_art(width: int, height: int, palette_name: str) -> Image.Image:
    """Render a symmetric geometric pattern using the chosen palette."""

    # Select palette and normalize to 0-1 floats
    palette = np.array(PALETTES[palette_name], dtype=float) / 255.0

def generate_art(width: int, height: int, style: str, output: str) -> None:
    """Render a visionary artwork using the chosen style."""

    # Generate a coordinate grid centered at the canvas origin
    x = np.linspace(-1, 1, width)
    y = np.linspace(-1, 1, height)
    X, Y = np.meshgrid(x, y)

    # Compute polar coordinates for radial symmetry
    R = np.sqrt(X**2 + Y**2)
    T = np.arctan2(Y, X)

    # Style-specific pattern and palette definitions
    if style == "hilma":
        pattern = np.sin(8 * R**2 + 6 * T) + np.cos(4 * R - 3 * T)
        palette = np.array([
            [255, 200, 221],  # soft rose
            [211, 226, 255],  # pale sky
            [255, 255, 204],  # light gold
            [204, 246, 221],  # mint
            [229, 203, 255],  # lavender
        ]) / 255.0
    elif style == "alex_grey":
        pattern = np.sin(10 * R**2) * np.cos(10 * T)
        palette = np.array([
            [255, 0, 136],   # electric magenta
            [0, 255, 221],   # neon aqua
            [255, 255, 0],   # vibrant yellow
            [0, 136, 255],   # intense blue
            [255, 102, 0],   # burning orange
        ]) / 255.0
    elif style == "surreal":
        pattern = np.sin(5 * R + 5 * T) + np.cos(3 * R - 7 * T)
        palette = np.array([
            [247, 222, 191],  # desert tan
            [180, 205, 255],  # dream sky
            [255, 182, 193],  # pastel rose
            [0, 168, 120],    # deep teal
            [255, 215, 0],    # soft gold
        ]) / 255.0
    else:
        raise ValueError(f"Unknown style: {style}")

    # Normalize pattern to the range [0, 1]
    pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

    # Interpolate the palette across the normalized pattern
    xp = np.linspace(0, 1, len(palette))
    RGB = np.empty((height, width, 3))
    for c in range(3):
        RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

    # Convert to 8-bit color and create image
    img = Image.fromarray((RGB * 255).astype(np.uint8))

    # Save the generated artwork
    img.save(output)


def main() -> None:
    """Parse arguments and generate a visionary art piece."""

    parser = argparse.ArgumentParser(description="Generate visionary art.")
    parser.add_argument("--width", type=int, default=3840, help="image width in pixels")
    parser.add_argument("--height", type=int, default=2160, help="image height in pixels")
    parser.add_argument(
        "--style",
        choices=["hilma", "alex_grey", "surreal"],
        default="hilma",
        help="color and pattern style",
    )
    parser.add_argument(
        "--output", default="Visionary_Dream.png", help="output filename"
    )
    args = parser.parse_args()

    generate_art(args.width, args.height, args.style, args.output)


if __name__ == "__main__":
    main()
    # Generate coordinate grid centered at canvas origin
    x = np.linspace(-1, 1, width)
    y = np.linspace(-1, 1, height)
    X, Y = np.meshgrid(x, y)

    # Compute polar coordinates for radial symmetry
    R = np.sqrt(X**2 + Y**2)
    T = np.arctan2(Y, X)

    # Layered trigonometric pattern for visionary geometry
    pattern = np.sin(8 * R**2 + 6 * T) + np.cos(4 * R - 3 * T)

    # Normalize pattern to the range [0, 1]
    pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

    # Interpolate the palette across the normalized pattern
    xp = np.linspace(0, 1, len(palette))
    rgb = np.empty((height, width, 3))
    for c in range(3):
        rgb[..., c] = np.interp(pattern_norm, xp, palette[:, c])

    # Convert to 8-bit color and create image
    return Image.fromarray((rgb * 255).astype(np.uint8))


def main() -> None:
    """Parse arguments and save generated artwork."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--style",
        choices=sorted(PALETTES.keys()),
        default="hilma",
        help="palette to use for rendering",
    )
    parser.add_argument("--width", type=int, default=3840, help="image width in pixels")
    parser.add_argument("--height", type=int, default=2160, help="image height in pixels")
    parser.add_argument(
        "--output",
        default="Visionary_Dream.png",
        help="filename for the generated image",
    )
    args = parser.parse_args()

    # Render image with requested settings
    img = generate_art(args.width, args.height, args.style)

    # Save the generated artwork
    img.save(args.output)


if __name__ == "__main__":
    main()
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
# ------------------------------
# Argument parsing for user inputs
# ------------------------------
parser = argparse.ArgumentParser(description="Visionary art/music generator")
parser.add_argument("--art", type=str, default=None, help="Path to user art image")
parser.add_argument("--tarot", type=str, default="The Fool", help="Tarot card name")
args = parser.parse_args()

# ------------------------------
# Canvas resolution (Full HD)
# ------------------------------
WIDTH, HEIGHT = 1920, 1080

# ------------------------------
# Derive a color influence from user art
# ------------------------------
if args.art:
    user_img = Image.open(args.art).resize((WIDTH, HEIGHT))
    avg_color = np.array(user_img).mean(axis=(0, 1)) / 255.0
else:
    avg_color = np.array([0.5, 0.5, 0.5])

# ------------------------------
# Tarot influence alters pattern phase
# ------------------------------
tarot_phase = (hash(args.tarot) % 360) / 180.0 * math.pi

# ------------------------------
# Coordinate grid centered at canvas origin
# ------------------------------
# Set canvas resolution
WIDTH, HEIGHT = 1920, 1080

=======
# Set canvas resolution
WIDTH, HEIGHT = 1920, 1080

# Create coordinate grids centered at origin
x = np.linspace(-1, 1, WIDTH)
y = np.linspace(-1, 1, HEIGHT)
X, Y = np.meshgrid(x, y)

# ------------------------------
# Radial coordinates for symmetry
# ------------------------------
# Compute radial distance and polar angle
=======
import colorsys

# Resolution of the output image
WIDTH, HEIGHT = 1920, 1080

# Generate coordinate grid spanning the aspect ratio
x = np.linspace(-2, 2, WIDTH)
y = np.linspace(-1.125, 1.125, HEIGHT)  # maintain 16:9 aspect
X, Y = np.meshgrid(x, y)

# Convert to polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
theta = np.arctan2(Y, X)

# ------------------------------
# Layered trigonometric pattern with tarot phase
# ------------------------------
pattern = np.sin(8 * R + tarot_phase) + np.cos(5 * T - tarot_phase)
# Layered trigonometric waves for visionary geometry
layer1 = np.sin(6 * R - 3 * T)
layer2 = np.cos(8 * T + 5 * R)
layer3 = np.sin(4 * R + np.cos(12 * T))
pattern = layer1 + layer2 + layer3

# Normalize combined pattern to [0, 1]
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
# ------------------------------
# Alex Grey inspired vibrant palette (RGB 0-1)
# ------------------------------
palette = np.array([
    [255, 0, 255],   # magenta
    [0, 255, 255],   # cyan
    [255, 255, 0],   # yellow
    [255, 127, 0],   # orange
    [0, 0, 255],     # blue
]) / 255.0

# Blend palette with average color from user art
palette = palette * (0.5 + 0.5 * avg_color)

# Interpolate the palette across the normalized pattern
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


# ------------------------------
# Simple audio generation from averaged color
# ------------------------------
sample_rate = 44100
duration = 4  # seconds
t = np.linspace(0, duration, int(sample_rate * duration), False)

# Map RGB components to frequencies within an octave
base_freq = 220.0  # A3
freqs = base_freq + avg_color * 220.0
waveform = sum(np.sin(2 * np.pi * f * t) for f in freqs) / len(freqs)

# Normalize and convert to 16-bit PCM
audio = np.int16(waveform / np.max(np.abs(waveform)) * 32767)

with wave.open("Visionary_Dream.wav", "w") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    wf.writeframes(audio.tobytes())

# Layered trigonometric waves for visionary geometry
wave = np.sin(10 * R + 5 * theta) + np.sin(15 * R - 4 * theta)

# Normalize wave to 0-1 range
wave_norm = (wave - wave.min()) / (wave.max() - wave.min())

# Alex Grey-inspired spectral palette (violet to red)
palette = np.array([
# Layered trigonometric waves for visionary geometry
wave = np.sin(10 * R + 5 * theta) + np.sin(15 * R - 4 * theta)

# Normalize wave to 0-1 range
wave_norm = (wave - wave.min()) / (wave.max() - wave.min())

# Alex Grey-inspired spectral palette (violet to red)
palette = np.array([
    [148, 0, 211],
    [75, 0, 130],
    [0, 0, 255],
    [0, 255, 0],
    [255, 255, 0],
    [255, 127, 0],
    [255, 0, 0]
], dtype=np.float32) / 255.0

# Interpolate colors across the palette
indices = wave_norm * (palette.shape[0] - 1)
low = np.floor(indices).astype(int)
high = np.ceil(indices).astype(int)
frac = indices - low
rgb = palette[low] * (1 - frac[..., None]) + palette[high] * frac[..., None]

# Convert to image and save
Image.fromarray((rgb * 255).astype(np.uint8)).save("Visionary_Dream.png")
# Map to HSV palette inspired by Alex Grey's luminous hues
HSV = np.zeros((HEIGHT, WIDTH, 3), dtype=np.float32)
HSV[..., 0] = (pattern_norm + T / (2 * np.pi)) % 1.0  # hue cycles with angle
HSV[..., 1] = 1.0                                        # full saturation
HSV[..., 2] = np.clip(1 - R / 2, 0, 1)                   # radial value fade

# Convert HSV to RGB
RGB = np.zeros_like(HSV)
for i in range(HEIGHT):
    for j in range(WIDTH):
        RGB[i, j] = colorsys.hsv_to_rgb(*HSV[i, j])

# Create and save the final artwork
img = Image.fromarray((RGB * 255).astype(np.uint8))
img.save("Visionary_Dream.png")
print("Visionary_Dream.png saved")
