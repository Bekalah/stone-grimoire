"""Compose a simple visionary melody and save it as a WAV file.

This script is self-contained and uses only the Python standard library.
"""

import argparse
import math
import struct
import wave
from typing import List

# ---------------------------------------------------------------------------
# Musical scales (semitone offsets from base A)
# ---------------------------------------------------------------------------
SCALES = {
    "pentatonic": [0, 2, 4, 7, 9],
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
}


def note_frequency(semitone: int, base: float = 220.0) -> float:
    """Convert semitone offset into frequency in Hz."""

    return base * (2 ** (semitone / 12))


def render(scale: str, pattern: str, bpm: int, bars: int) -> List[int]:
    """Create a sequence of samples for the chosen musical settings."""

    sr = 44100  # sample rate
    beat_samples = int(sr * 60 / bpm)
    sequence = SCALES[scale]
    if pattern == "descending":
        sequence = list(reversed(sequence))

    samples: List[int] = []
    for i in range(bars * 4):
        semitone = sequence[i % len(sequence)]
        freq = note_frequency(semitone)
        for n in range(beat_samples):
            sample = int(32767 * math.sin(2 * math.pi * freq * n / sr))
            samples.append(sample)
    return samples


def write_wav(filename: str, samples: List[int]) -> None:
    """Write samples to a mono 16-bit WAV file."""

    with wave.open(filename, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(44100)
        w.writeframes(b"".join(struct.pack("<h", s) for s in samples))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scale", choices=sorted(SCALES), default="pentatonic")
    parser.add_argument("--pattern", choices=["ascending", "descending"], default="ascending")
    parser.add_argument("--bpm", type=int, default=120, help="tempo in beats per minute")
    parser.add_argument("--bars", type=int, default=4, help="number of 4/4 bars")
    parser.add_argument("--output", default="Harmonic_Dream.wav", help="output WAV filename")
    args = parser.parse_args()

    samples = render(args.scale, args.pattern, args.bpm, args.bars)
    write_wav(args.output, samples)


if __name__ == "__main__":
    main()
