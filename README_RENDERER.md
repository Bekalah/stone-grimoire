# Cosmic Helix Renderer

This lightweight offline renderer draws four layers of sacred geometry — Vesica field, Tree-of-Life scaffold, Fibonacci curve, and a static double-helix lattice — on a 1440×900 canvas. The palette is ND-safe: calm contrast, no motion, and every layer is annotated in code comments.

## Files

- `index.html` – entry point with inline status messaging and a `<canvas>` sized to 1440×900.
- `js/helix-renderer.mjs` – pure ES module that renders the layered geometry with no external dependencies.
- `data/palette.json` – optional palette override; edit or remove to adjust colors. Fallback colors load automatically if the file is missing or blocked by the browser.

## Usage (Offline)

1. Ensure the directory structure is intact (`index.html`, `js/`, `data/`).
2. Double-click `index.html` in any modern browser. No server or build step is required.
3. If the palette fails to load (common when using the `file://` protocol), the header status will note the fallback and the default palette will render safely.

## Geometry Notes

- Vesica field uses intersecting circles spaced by numerology constants (3, 7, 9) to form the foundational lattice.
- Tree-of-Life layer plots 10 sephirot plus translucent Daath, wiring 22 static paths.
- Fibonacci curve samples 22 steps of a logarithmic spiral using the golden ratio (φ) to keep the arc smooth without animation.
- Double helix forms three static cycles with 22 crossbars, referencing constants 11, 22, 33, and 144 for spacing and resolution.

## Customisation

- Adjust palette colors inside `data/palette.json` to retint layers.
- Geometry scale factors are expressed via the numerology constants object inside `index.html`; tweak values there or pass new ones to `renderHelix` for experiments.

ND-safe oath: no animation, no flashing, no external calls. The renderer is fully offline and respects trauma-informed design.
