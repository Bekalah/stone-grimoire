# Cosmic Helix Renderer

Static, offline-safe renderer for the Cathedral lattice. Double-click `index.html` and the 1440×900 canvas will layer sacred geometry without motion.

## Features

- **Layer order** (ND-safe): Vesica field → Tree-of-Life scaffold → Fibonacci curve → Double-helix lattice.
- **Palette aware:** reads `data/palette.json` via native ES modules; if blocked (e.g., local file restrictions) it falls back to a built-in ND-safe palette and shows a status notice.
- **Numerology alignment:** geometry dimensions reference the constants 3, 7, 9, 11, 22, 33, 99, and 144 for spacing and repetitions.
- **Offline-first:** no network calls; everything lives inside `/index.html`, `/js/helix-renderer.mjs`, and `/data/palette.json`.

## Files

- `index.html` — entry point with ND-safe styles, wireframe lattice backdrop, luminous node halo, and renderer bootstrapping.
- `js/helix-renderer.mjs` — pure ES module; exports `renderHelix(ctx, options)` and draws the four layers.
- `data/palette.json` — optional theme overrides (background, ink, layer colors). If removed, defaults are used.

## Usage

1. Open the repository locally.
2. Double-click `index.html` (no server required).
3. Observe status line: "Palette loaded." means JSON was read, otherwise fallback palette is active.

To adjust colors, edit `data/palette.json` (hex values only). Reload the page to apply the tint. The cathedral lattice background listens for custom `cathedral:select` events, so other scripts can retint the wireframe if desired.

## Accessibility & ND Safety

- Zero animation or autoplay; only static gradients and lines.
- High contrast text (`--ink`) against deep background (`--bg`).
- Layer comments in the module explain why each step preserves ND safety (soft glows, limited shadow blur).
- Background and halo color variables respect Codex tint events without introducing motion.

## Extending

If you introduce new data files, keep them under `/data/` and prefer module imports (`import ... assert { type: "json" }`) so the renderer stays offline-friendly. For new geometry layers, follow the same pattern: derive counts from the numerology constants and keep helpers pure and documented.
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
