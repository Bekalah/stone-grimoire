# Cosmic Helix Renderer — Glass/Dark Study Deck

Museum-grade offline renderer for the Stone Cathedral helix. Double-click `index.html` and a 1440×900 canvas paints once, honouring vesica geometry, the Tree-of-Life scaffold, a Fibonacci spiral, and a double-helix lattice. No build step, no network, no motion.

## Files
- `index.html` — glass/dark shell, palette loader, and three-mode status discipline.
- `js/helix-renderer.mjs` — pure ES module that draws the four sacred layers.
- `data/palette.json` — optional colour overrides; missing or invalid files fall back safely.
- `README_RENDERER.md` — this operating note.

## Layer Stack
1. **Vesica Field** — intersecting circles and numerology grid (3, 7, 11, 22) clipped to the vesica lens.
2. **Tree-of-Life Scaffold** — ten sephirot plus twenty-two paths, soft glows to keep nodes legible.
3. **Fibonacci Curve** — logarithmic spiral traced with 99 points, golden-ratio cadence every 33 steps.
4. **Double-Helix Lattice** — two phase-shifted strands with 144 crossbars for the static lattice breath.

## Three-Mode Discipline
The header status keeps the implementation guide's "three-mode" rule:
- **Mode: Custom palette** — palette loaded from `data/palette.json`.
- **Mode: Fallback palette** — safe ND palette applied because the data file was missing or malformed.
- **Mode: Minimal** — canvas context unavailable; shell remains, geometry is skipped to stay safe.

Each mode posts a short inline notice so curators know exactly which state rendered the canvas.

## Palette & Accessibility
- Default palette leans glass/dark: indigo dusk base, aqua/emerald/amber/violet highlights.
- Override colours by editing `data/palette.json`; keys: `bg`, `ink`, `muted`, `layers` (array of at least three hex strings).
- When browsers block local `fetch` (common when opened directly), the header reports the fallback and the renderer still paints using trauma-informed tones.
- Comments in `js/helix-renderer.mjs` explain ND-safe choices: no animation, calm gradients, soft glows on nodes, and pure helper functions.

## Offline Usage
1. Keep `index.html`, `js/`, `data/`, and this README together on disk.
2. Open `index.html` directly in any modern browser (no server required).
3. Read the header to confirm the active mode; if a notice appears, the fallback palette is in play.
4. Capture or study the canvas — the composition is static and never triggers motion.

## Numerology Anchors
- **3** — vesica radius, helix amplitude.
- **7** — vesica grid rows.
- **9** — Fibonacci radial growth cadence.
- **11** — tree spacing, helix frequency.
- **22** — vesica grid columns and tree paths.
- **33** — golden-ratio angular step per spiral turn.
- **99** — Fibonacci sample points.
- **144** — helix crossbars (static lattice).

Curators may adjust the `NUM` constants before calling `renderHelix` to explore alternate ratios without changing the code structure.
