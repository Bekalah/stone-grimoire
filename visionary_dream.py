"""Generate a museum-quality visionary art piece with selectable styles."""

# Import required libraries
import argparse
import numpy as np
from PIL import Image


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

