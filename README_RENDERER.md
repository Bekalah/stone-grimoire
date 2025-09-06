# Cosmic Helix Renderer

Static, offline-only canvas demo encoding Vesica grid, Tree‑of‑Life scaffold, Fibonacci curve, and a static double‑helix lattice.
No animation, no external libraries.

## Local use
1. Keep all files in the same folder.
2. Double‑click `index.html` in any modern browser.
3. If `data/palette.json` is missing, a calm fallback palette is used and a notice appears.

## Why these choices
- **ND‑safe:** soft contrast, no motion, no network requests.
- **Layer order:** background, vesica field, tree scaffold, Fibonacci curve, helix lattice.
- **Numerology constants:** geometry routines rely on 3, 7, 9, 11, 22, 33, 99, and 144 for repeat counts and sizing.

## Palette
Default palette lives in `data/palette.json` and may be edited locally. Colors use plain hex strings.
