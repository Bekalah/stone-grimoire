# Cosmic Helix Renderer — Offline Study Deck

Static, trauma-informed canvas study for the Stone Cathedral helix. Keep the four files together, double-click `index.html`, and a 1440×900 canvas renders once: Vesica field, Tree-of-Life scaffold, Fibonacci curve, and a static double-helix lattice. No build tools, no motion, no external calls.

## Quick Start
1. Store `index.html`, the `js/` folder, the `data/` folder, and this README in the same directory.
2. Open `index.html` directly in any modern browser (offline is fine).
3. Watch the header status — it reports whether the custom palette loaded or the fallback palette took over.
4. Study or capture the canvas. The geometry is static and safe for ND viewers.

## Files
- `index.html` — offline shell, palette loader, status + notice discipline, and 1440×900 `<canvas>`.
- `js/helix-renderer.mjs` — pure ES module that paints the four layers in order.
- `data/palette.json` — optional palette override; missing or malformed data triggers an inline fallback notice.
- `README_RENDERER.md` — this guide.

## Layer Order & Numerology Anchors
1. **Vesica Field** — twin circles and a numerology grid (3, 7, 11, 22) clipped to the vesica lens.
2. **Tree-of-Life Scaffold** — ten sephirot nodes plus twenty-two paths; soft glow keeps nodes legible.
3. **Fibonacci Curve** — logarithmic spiral sampled at 99 points with a 33-step golden cadence.
4. **Double-Helix Lattice** — two static strands with 144 crossbars, phase-shifted for layered depth.

The renderer exposes constants for 3, 7, 9, 11, 22, 33, 99, and 144. Adjust them in `index.html` before calling `renderHelix` if you need alternative ratios.

## Padding & Clearspace Law
- **Padding Law:** All renders (artifacts, seals, realms, exports) must include a minimum 5–10% clearspace buffer. No sacred form is ever cut by canvas edges.
- The HTML shell wraps the `<canvas>` in a `.canvas` frame that applies a 5% padding buffer per side before any pixels are drawn.
- `renderHelix` computes a safe frame margin as the larger of 5% of the shorter dimension or the outer stroke width, then routes every layer through that padded frame so geometry never touches the edge.
- A golden-ratio grid is lightly stroked on top of the render to signal the composition lattice without overwhelming ND viewers.

## Palette & Status Discipline
- The script first tries to fetch `data/palette.json`. When the file loads and passes validation, the body switches to **mode: custom**.
- If the file is missing, blocked, or malformed, the renderer clones the built-in ND-safe palette, marks **mode: fallback**, and posts a small inline notice.
- If the browser fails to provide a 2D canvas context, the page switches to **mode: minimal** and surfaces a notice explaining that the shell remains but geometry is skipped.
- Palette overrides must provide `bg`, `ink`, `muted`, and a `layers` array with at least three hex strings. Anything less drops back to the safe defaults without crashing.

## ND-safe Implementation Notes
- All helpers in `js/helix-renderer.mjs` are pure and comment on their trauma-informed choices.
- There are no timers, loops that animate, or event hooks that would introduce motion. The canvas paints once on load.
- Colour contrast stays soft but legible; the fallback palette keeps text above 4.5:1 contrast.
- No dependencies, bundlers, or workflows are required. Everything runs from the filesystem.

## Palette Template
```json
{
  "bg": "#0b0d19",
  "ink": "#edf1ff",
  "muted": "#939abf",
  "layers": ["#8fb4ff", "#5fc4f4", "#89efc5", "#ffd8a6", "#f3a8ff", "#dde1ff"]
}
```

Copy this structure to customise the tones. The script clones arrays internally so palette edits never mutate the defaults.
