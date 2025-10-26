# Project Documentation

Per Texturas Numerorum, Spira Loquitur. //

# Cosmic Helix Renderer

Offline, ND-safe renderer for layered sacred geometry. Double-click `index.html` in this folder to view. The canvas renders once, holds still, and works without any build step or network connection.

## Files

- `index.html` -- static entry point with inline status notice and palette loader.
- `js/helix-renderer.mjs` -- pure ES module responsible for layered drawing.
- `data/palette.json` -- optional palette override; safe defaults apply if missing.
- `README_RENDERER.md` -- this guide.

## Layers

1. **Vesica field** -- intersecting circles and a gentle grid grounded in numerology (Layer 1).
2. **Tree-of-Life scaffold** -- 10 sephirot and 22 connective paths balanced across three pillars (Layer 2).
3. **Fibonacci curve** -- static logarithmic spiral approximated with 99 points, calm line weight (Layer 3).
4. **Double-helix lattice** -- two phase-shifted sine strands linked by 144 struts (Layer 4).

## Palette

Colors load from `data/palette.json`. When browsers block local `fetch` or the file is absent, the renderer posts a small notice and falls back to a trauma-informed palette of indigo, aqua, green, amber, and violet. The active palette also sets the page background and ink colors to maintain contrast.

## ND-safe Choices

- No animation, autoplay, or flashing sequences.
- Layered ordering preserves depth while staying static.
- Gentle but legible contrasts; translucency keeps supportive lines soft.
- Pure ES module with zero dependencies for offline-first use.

## Numerology Anchors

- 3 -- vesica radius and helix amplitude.
- 7 -- vesica grid columns.
- 9 -- spiral growth cadence.
- 11 -- vertical rhythm for the tree scaffold and helix frequency.
- 22 -- sephirot paths.
- 33 -- spiral step cadence per turn.
- 99 -- points traced along the Fibonacci curve.
- 144 -- lattice struts linking the double helix.

## Offline Usage

Open `index.html` directly in any modern browser. The status line reports whether the custom palette loaded or if the safe fallback is active. No requests leave the machine, satisfying the offline-first requirement.
