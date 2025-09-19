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
