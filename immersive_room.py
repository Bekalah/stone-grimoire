"""Explore an immersive room of art and generative music."""

# Import required libraries
import os
import numpy as np
import pygame
from pygame import sndarray
from datetime import datetime

def create_background(width: int, height: int) -> pygame.Surface:
    """Generate a simple procedural background pattern."""
    x = np.linspace(0, 1, width)
    y = np.linspace(0, 1, height)
    X, Y = np.meshgrid(x, y)
    pattern = np.sin(3 * np.pi * X) * np.cos(3 * np.pi * Y)
    norm = (pattern - pattern.min()) / (pattern.max() - pattern.min())
    rgb = np.stack([norm * 255] * 3, axis=-1).astype(np.uint8)
    return pygame.surfarray.make_surface(rgb)

def tone(frequency: float, duration: float = 0.5, sample_rate: int = 44100) -> pygame.mixer.Sound:
    """Create a sine wave tone for generative music."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    wave = np.sin(frequency * t * 2 * np.pi)
    audio = np.int16(wave * 32767)
    return sndarray.make_sound(audio)

def main() -> None:
    """Run the immersive creative room."""
    pygame.init()

    width, height = 800, 600
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption("Immersive Creative Room")

    background = create_background(width, height)

    # Layer a simple ambient chord using looping tones
    pygame.mixer.set_num_channels(4)
    for freq in (261.63, 329.63, 392.00, 523.25):  # C major chord
        tone(freq, duration=1.0).play(loops=-1)

    clock = pygame.time.Clock()
    pos = pygame.Vector2(width // 2, height // 2)

    # Short demo mode for headless execution
    headless = os.environ.get("SDL_VIDEODRIVER") == "dummy"
    frame_limit = 30 if headless else None
    frame_count = 0

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_s:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    pygame.image.save(screen, f"room_capture_{timestamp}.png")

        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            pos.x -= 5
        if keys[pygame.K_RIGHT]:
            pos.x += 5
        if keys[pygame.K_UP]:
            pos.y -= 5
        if keys[pygame.K_DOWN]:
            pos.y += 5

        screen.blit(background, (0, 0))
        pygame.draw.circle(screen, (255, 255, 255), pos, 10)
        pygame.display.flip()
        clock.tick(60)

        if headless:
            frame_count += 1
            if frame_limit and frame_count >= frame_limit:
                running = False

    pygame.quit()

if __name__ == "__main__":
    main()
