import numpy as np
from PIL import Image

# Resolution of the output image
WIDTH, HEIGHT = 1024, 1024

# Generate coordinate grid centered at origin
x = np.linspace(-1, 1, WIDTH)
y = np.linspace(-1, 1, HEIGHT)
X, Y = np.meshgrid(x, y)

# Radial distance and angle for polar patterns
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Layered trigonometric pattern for visionary geometry
pattern = np.sin(10 * R + 5 * np.sin(5 * T)) + np.cos(15 * T)

# Normalize pattern to [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

# Map normalized values to a psychedelic color palette inspired by Alex Grey
# Hue varies with pattern, saturation full, value based on radial distance
HSV = np.zeros((HEIGHT, WIDTH, 3), dtype=np.float32)
HSV[..., 0] = pattern_norm  # hue
HSV[..., 1] = 1.0           # saturation
HSV[..., 2] = np.clip(1 - R, 0, 1)  # value gradient from center

# Convert HSV to RGB
import colorsys
RGB = np.zeros_like(HSV)
for i in range(HEIGHT):
    for j in range(WIDTH):
        RGB[i, j] = colorsys.hsv_to_rgb(*HSV[i, j])

# Convert to 8-bit color and create image
img = Image.fromarray((RGB * 255).astype(np.uint8))

# Save the generated artwork
img.save("Visionary_Dream.png")
print("Visionary_Dream.png saved")
