"""Generate museum-quality visionary art with multiple styles and options."""

# Import required libraries
import argparse
import numpy as np
from PIL import Image

def fractal_noise(width: int, height: int, octaves: int = 6, persistence: float = 0.5) -> np.ndarray:
    """Create fractal Brownian motion using layered random noise."""
    noise = np.zeros((height, width))
    amplitude, frequency, total_amp = 1.0, 1.0, 0.0
    for _ in range(octaves):
        layer = np.random.rand(max(1, int(height / frequency)), max(1, int(width / frequency)))
        layer_img = Image.fromarray((layer * 255).astype(np.uint8)).resize((width, height), resample=Image.BILINEAR)
        noise += (np.array(layer_img) / 255.0) * amplitude
        total_amp += amplitude
        amplitude *= persistence
        frequency *= 2.0
    return noise / total_amp

def radial_pattern(width: int, height: int) -> np.ndarray:
    """Generate a radial trigonometric pattern for mandala-like symmetry."""
    x = np.linspace(-1, 1, width)
    y = np.linspace(-1, 1, height)
    X, Y = np.meshgrid(x, y)
    R = np.sqrt(X**2 + Y**2)
    T = np.arctan2(Y, X)
    return np.sin(8 * R**2 + 6 * T) + np.cos(4 * R - 3 * T)

PALETTES = {
    "alex_grey": np.array([
        [20, 30, 80],
        [70, 20, 150],
        [180, 40, 240],
        [255, 140, 0],
        [255, 220, 100],
    ]) / 255.0,
    "hilma_af_klint": np.array([
        [255, 200, 221],
        [211, 226, 255],
        [255, 255, 204],
        [204, 246, 221],
        [229, 203, 255],
    ]) / 255.0,
    "surrealism": np.array([
        [10, 25, 66],
        [58, 12, 163],
        [101, 84, 192],
        [255, 99, 72],
        [255, 219, 88],
    ]) / 255.0,
}

PATTERNS = {
    "fractal": fractal_noise,
    "radial": radial_pattern,
}

def build_image(width: int, height: int, pattern_fn, palette: np.ndarray, seed: int | None) -> Image.Image:
    """Construct the visionary artwork using the selected pattern and palette."""
    if seed is not None:
        np.random.seed(seed)
    pattern = pattern_fn(width, height)
    pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())
    xp = np.linspace(0, 1, len(palette))
    rgb = np.empty((height, width, 3))
    for c in range(3):
        rgb[..., c] = np.interp(pattern_norm, xp, palette[:, c])
    return Image.fromarray((rgb * 255).astype(np.uint8))

def main() -> None:
    parser = argparse.ArgumentParser(description="Visionary world-building art generator")
    parser.add_argument("--width", type=int, default=3840, help="image width in pixels")
    parser.add_argument("--height", type=int, default=2160, help="image height in pixels")
    parser.add_argument("--pattern", choices=PATTERNS.keys(), default="fractal", help="pattern algorithm")
    parser.add_argument("--palette", choices=PALETTES.keys(), default="alex_grey", help="color palette")
    parser.add_argument("--seed", type=int, default=None, help="random seed for reproducibility")
    parser.add_argument("--output", default="Visionary_Dream.png", help="output filename")
    parser.add_argument("--show", action="store_true", help="display the image after generation")
    args = parser.parse_args()

    img = build_image(args.width, args.height, PATTERNS[args.pattern], PALETTES[args.palette], args.seed)
    img.save(args.output)
    if args.show:
        img.show()

if __name__ == "__main__":
    main()
=======
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
