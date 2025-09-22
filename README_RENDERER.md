# Cosmic Helix Renderer (Offline, ND-safe)

This renderer keeps the Stone Cathedral helix accessible without builds or networks. Double-click `index.html` and the 1440×900 canvas paints once, layering vesica geometry, the Tree-of-Life scaffold, a Fibonacci spiral, and a static double-helix lattice. The palette is trauma-informed: high legibility, no strobing, and gentle gradients only.

## Files

- `index.html` – entry point with a calm header, status line, and `<canvas>` sized to 1440×900. Opens directly in any browser.
- `js/helix-renderer.mjs` – ES module exporting `renderHelix(ctx, options)`. Helpers are pure and explain ND-safe rationale in comments.
- `data/palette.json` – optional colour overrides. Remove or edit to retint the scene while staying offline. When missing, the script notes the fallback palette.

## Layer Order and Numerology Anchors

1. **Vesica Field** – twin circles plus a numerology grid (3, 7, 11, 22) to ground the scene.
2. **Tree-of-Life** – ten sephirot and twenty-two paths, stroked first then filled nodes.
3. **Fibonacci Curve** – logarithmic spiral traced with 99 points (33 samples per turn) for a quiet golden-ratio cue.
4. **Double Helix** – two phase-shifted strands with 144 crossbars for the lattice breath.

The default numerology map exposes 3, 7, 9, 11, 22, 33, 99, and 144. Modify the `NUM` object before calling `renderHelix` to experiment with other ratios.

## ND-safe Design Notes

- No animation, transitions, or timers. The canvas paints once and stays still.
- Colour contrast sits between 7:1 and 3:1 for readability without glare.
- Layer comments inside `js/helix-renderer.mjs` explain the safety choices for future caretakers.
- When `data/palette.json` is absent or blocked, the header reports that a safe fallback palette is being used.

## Offline Usage

1. Keep `index.html`, the `js/` folder, and the `data/` folder together on disk.
2. Open `index.html`. The header reports whether the custom palette loaded.
3. Study or capture the canvas. There are no network requests or build steps.
