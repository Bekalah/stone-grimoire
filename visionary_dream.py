"""Generate visionary art and corresponding music based on user art and tarot."""

# Import required libraries
import argparse
import math
import wave
import numpy as np
from PIL import Image

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
x = np.linspace(-1, 1, WIDTH)
y = np.linspace(-1, 1, HEIGHT)
X, Y = np.meshgrid(x, y)

# ------------------------------
# Radial coordinates for symmetry
# ------------------------------
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# ------------------------------
# Layered trigonometric pattern with tarot phase
# ------------------------------
pattern = np.sin(8 * R + tarot_phase) + np.cos(5 * T - tarot_phase)

# Normalize pattern to the range [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

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

# Convert to 8-bit color and create image
img = Image.fromarray((RGB * 255).astype(np.uint8))

# Save the generated artwork
img.save("Visionary_Dream.png")

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

