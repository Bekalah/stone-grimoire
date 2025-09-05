"""Generate a dynamic world-building art piece inspired by Alex Grey."""

# Import required libraries
import numpy as np
from PIL import Image
from datetime import datetime

# Resolution of the output image (4K)
WIDTH, HEIGHT = 3840, 2160

# Function to create fractal noise for terrain-like patterns
def fractal_noise(width, height, octaves=6, persistence=0.5):
    """Produce fractal Brownian motion using layered random noise."""
    noise = np.zeros((height, width))
    amplitude = 1.0
    frequency = 1.0
    total_amplitude = 0.0
    for _ in range(octaves):
        # Random layer at reduced resolution
        layer = np.random.rand(max(1, int(height / frequency)), max(1, int(width / frequency)))
        # Upscale layer to target resolution with smooth interpolation
        layer_img = Image.fromarray((layer * 255).astype(np.uint8)).resize((width, height), resample=Image.BILINEAR)
        layer_resized = np.array(layer_img) / 255.0
        # Accumulate weighted layer
        noise += layer_resized * amplitude
        total_amplitude += amplitude
        amplitude *= persistence
        frequency *= 2.0
    # Normalize composite noise
    return noise / total_amplitude

# Generate terrain-like noise pattern
pattern = fractal_noise(WIDTH, HEIGHT)

# Normalize pattern to [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Psychedelic palette inspired by Alex Grey (RGB 0-1)
palette = np.array([
    [20, 30, 80],    # deep indigo
    [70, 20, 150],   # violet
    [180, 40, 240],  # magenta
    [255, 140, 0],   # electric orange
    [255, 220, 100], # radiant gold
]) / 255.0

# Interpolate palette across noise pattern
xp = np.linspace(0, 1, len(palette))
RGB = np.empty((HEIGHT, WIDTH, 3))
for c in range(3):
    RGB[..., c] = np.interp(pattern_norm, xp, palette[:, c])

# Convert to 8-bit color and create image
img = Image.fromarray((RGB * 255).astype(np.uint8))

# Save the generated artwork with a timestamped filename
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"Visionary_Dream_{timestamp}.png"
img.save(filename)
