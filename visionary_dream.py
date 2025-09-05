"""Generate museum-quality visionary art with selectable palettes."""

# Import required libraries
import argparse
import numpy as np
from PIL import Image

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

