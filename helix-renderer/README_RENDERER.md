# Cosmic Helix Renderer

Offline, ND-safe renderer for layered sacred geometry. Double-click `index.html` in this folder to view. This version aligns with the trauma-informed Cosmogenesis plan using pure ES modules and zero external dependencies.

The HTML file works directly from disk. If the palette JSON cannot be read because of browser file restrictions or missing data, the module applies a calm fallback palette and the header status line explains why. No network calls leave the machine.

## Layers
1. **Vesica field** &mdash; intersecting circles and a gentle vesica grid (Layer 1).
2. **Tree-of-Life scaffold** &mdash; 10 sephirot and 22 paths, balanced across three pillars (Layer 2).
3. **Fibonacci curve** &mdash; static logarithmic spiral approximated with 99 points (Layer 3).
4. **Double-helix lattice** &mdash; two phase-shifted strands linked by 144 struts (Layer 4).

## Palette
Colors are loaded from `data/palette.json`. If the file is missing or a browser blocks local `fetch`, the renderer displays a small notice and falls back to a safe default palette. The active palette also updates page colors to keep contrast consistent with ND-safe guidelines. Additional palettes can be curated later without changing the rendering code.

Default palette hues follow the trauma-informed guidance from the cosmic brief: calm blues, restorative greens, mystical purples, and warm neutrals. All hues appear as high-contrast yet gentle strokes layered over the dark canvas.

## ND-safe Choices
- No animation, motion, or autoplay.
- High-contrast yet soft color palette with predictable layering.
- Simple ES module, offline-first. No build steps or workflows required.

## Numerology Anchors
The geometry routines honor key counts:
- 3 &mdash; primary vesica radius, helix amplitude, and wave frequency.
- 7 &mdash; vesica grid columns.
- 9 &mdash; spiral growth cadence.
- 11 &mdash; vertical rhythm for the Tree of Life and spiral angle increments.
- 22 &mdash; sephirot paths.
- 33 &mdash; spiral scaling baseline.
- 99 &mdash; points along the Fibonacci curve.
- 144 &mdash; helix lattice struts.

## Usage
Open `index.html` directly in any modern browser. The canvas is 1440x900 and relies only on built-in browser features. The header status line will report whether the custom palette loaded or if the safe fallback is in use.
