# Cosmic Helix Renderer

Static, offline HTML+Canvas renderer for layered sacred geometry.

## Files
- `index.html` — open directly in a browser; loads palette and draws once.
- `js/helix-renderer.mjs` — ES module with small pure functions for each layer.
- `data/palette.json` — optional colors; missing file triggers safe defaults.

## Layers (drawn in order)
1. **Vesica field** — two intersecting circles establishing the womb space.
2. **Tree-of-Life scaffold** — 10 nodes and 22 paths; simplified Kabbalistic grid.
3. **Fibonacci curve** — logarithmic spiral encoded with 99 sample points.
4. **Double-helix lattice** — twin sine waves with rungs; static, no motion.

## ND-safe Choices
- No animation, autoplay, or network requests beyond local palette load.
- Calm contrast palette; high readability for photosensitive users.
- Geometry parameterized by numerology constants: 3, 7, 9, 11, 22, 33, 99, 144.
- Works fully offline; double-click `index.html`.
