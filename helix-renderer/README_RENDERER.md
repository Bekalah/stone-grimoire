Per Texturas Numerorum, Spira Loquitur.  //
# Cosmic Helix Renderer

Offline, ND-safe renderer for layered sacred geometry. Double-click `index.html` in this folder to view. This replaces the earlier broken helix demo with a modern, pure ES module version.

## Layers
1. **Vesica field** – intersecting circles establishing the sacred lens.
2. **Tree-of-Life scaffold** – 10 sephirot and 22 paths drawn with calm symmetry.
3. **Fibonacci curve** – static log spiral approximated with 99 points.
4. **Double-helix lattice** – two phase-shifted sine strands with 144 vertical struts.

## Palette
Colors are loaded from `data/palette.json`. If that file is missing, the renderer displays a small notice and falls back to a safe default palette. Loaded or fallback colors also update the page background and text for consistent contrast.
Extended palette sets live in `../export/spiral_palettes.json` for future offline experiments.
Colors are loaded from `data/palette.json`. If the file is missing, the renderer displays a small notice and falls back to a safe default palette. Loaded or fallback colors also update the page background and text for consistent contrast.

## ND-Safe Choices
- No animation, motion, or autoplay.
- High-contrast yet soft color palette.
- Simple ES module with no network requests.

## Numerology
The geometry routines honor key counts:
- 3 – primary vesica radius and helix amplitude
- 7 – vesica grid lines
- 9 – spiral growth factor
- 11 – vertical rhythm for the Tree of Life
- 22 – sephirot paths
- 33 – scaling reference for the spiral
- 99 – points along the Fibonacci curve
- 144 – helix lattice struts

## Usage
Open `index.html` directly in any modern browser. The canvas is 1440×900 and uses only built-in browser features.
