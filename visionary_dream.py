import numpy as np
from PIL import Image
import colorsys

# Resolution of the output image
WIDTH, HEIGHT = 1920, 1080

# Generate coordinate grid spanning the aspect ratio
x = np.linspace(-2, 2, WIDTH)
y = np.linspace(-1.125, 1.125, HEIGHT)  # maintain 16:9 aspect
X, Y = np.meshgrid(x, y)

# Convert to polar coordinates for radial symmetry
R = np.sqrt(X**2 + Y**2)
T = np.arctan2(Y, X)

# Layered trigonometric waves for visionary geometry
layer1 = np.sin(6 * R - 3 * T)
layer2 = np.cos(8 * T + 5 * R)
layer3 = np.sin(4 * R + np.cos(12 * T))
pattern = layer1 + layer2 + layer3

# Normalize combined pattern to [0, 1]
pattern_norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())

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
