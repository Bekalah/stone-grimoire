# Cosmic Helix Renderer

Static, offline renderer that paints the Cosmic Helix layers on a 1440x900 canvas. Double-click `index.html` in any browser and the geometry appears instantly with no network calls.

## Layers and Safety

- Vesica field anchors the scene with intersecting circles derived from constants 3, 7, 9, and 11.
- Tree-of-Life scaffold plots 10 sephirot plus Daath and wires 22 static paths to respect the canon.
- Fibonacci curve traces three calm turns of a logarithmic spiral for gentle motion cues without animation.
- Double-helix lattice adds two strands, 22 crossbars, and a central spine so the weave stays grounded.

Design notes sit directly inside `js/helix-renderer.mjs`. Each helper is pure and includes comments about ND-safe rationale: no motion, soft gradients, and a clear paint order for layered geometry.

## Numerology Anchors

The renderer keeps the requested constants close at hand. The default `NUM` object exposes 3, 7, 9, 11, 22, 33, 99, and 144. Modify the object before calling `renderHelix` if you need different ratios for another study.

## Files

- `index.html` – entry point with header status line and a `<canvas>` sized to 1440x900.
- `js/helix-renderer.mjs` – ES module exporting `renderHelix(ctx, options)`; contains pure helpers for each layer.
- `data/palette.json` – optional palette override. Remove or edit to retint the renderer while staying offline. When missing, the script posts a small notice and uses internal ND-safe colors.

## Usage (Offline)

1. Keep the three files together (plus `js/` and `data/` directories).
2. Double-click `index.html`. The header reports whether the palette JSON loaded or the fallback palette is active.
3. Study the static output. There are no listeners, timers, or transitions.

## Customising

- Edit `data/palette.json` to change colors. If the file is missing, built-in ND-safe values render automatically.
- Pass a custom `NUM` object to `renderHelix` if you need alternative numerology constants for experiments.
- Additional layers should follow the same pattern: pure helper, generous comments about safety, and offline-only data.

Why this document: it explains how the renderer upholds the circuitum99 canon while keeping every asset offline-first and trauma-informed.
