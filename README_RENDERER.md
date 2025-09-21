# Cosmic Helix Renderer (Offline, ND-safe)

This renderer keeps the Stone Cathedral helix accessible without builds or networks. Double-click `index.html` and the 1440×900 canvas paints once, layering vesica geometry, the Tree-of-Life scaffold, a Fibonacci spiral, and a static double-helix lattice. The palette is trauma-informed: high legibility, no strobing, and gentle gradients only.

## Files

- Vesica field anchors the scene with intersecting circles derived from constants 3, 7, 9, and 11.
- Tree-of-Life scaffold plots 10 sephirot plus Daath and wires 22 static paths to respect the canon.
- Fibonacci curve traces three calm turns of a logarithmic spiral for gentle motion cues without animation.
- Double-helix lattice adds two strands, 22 crossbars, and a central spine so the weave stays grounded.

Design notes sit directly inside `js/helix-renderer.mjs`. Each helper is pure and includes comments about ND-safe rationale: no motion, soft gradients, and a clear paint order for layered geometry.

## Numerology Anchors

The renderer keeps the requested constants close at hand. The default `NUM` object exposes 3, 7, 9, 11, 22, 33, 99, and 144. Modify the object before calling `renderHelix` if you need different ratios for another study.

- `index.html` – entry point with calm shell styling and a short status message about the active palette.
- `js/helix-renderer.mjs` – ES module exporting `renderHelix(ctx, options)`. All helpers are pure so the canvas state stays predictable.
- `data/palette.json` – optional colour overrides. Remove or edit this file to retint the scene while staying offline.

## Cathedral Visionary Ruleset Hook


- `registry/universal.json` now registers the **Cathedral Visionary 1.0** ruleset.
- Load `rulesets.cathedral_visionary_v1` to enforce Rosslyn geometry, Tara bands, and provenance metadata across renderers.

## Layer Order and Numerology Anchors

1. **Vesica Field** – twin circles plus a numerology grid (3, 7, 11, 22) to ground the scene.
2. **Tree-of-Life** – ten sephirot and twenty-two paths, rendered with soft line caps then filled nodes.
3. **Fibonacci Curve** – logarithmic spiral traced with 99 points and a golden-ratio step (33 samples per turn).
4. **Double Helix** – two phase-shifted strands joined by 144 struts for a quiet lattice breath.

## ND-safe Design Notes

- No animation, transitions, or timers. The canvas paints once and stays still.
- Colour contrast sits between 7:1 and 3:1 for readability without glare.
- Layer comments inside `js/helix-renderer.mjs` explain the safety choices for future caretakers.
- When `data/palette.json` is absent or blocked by the browser, the header notes the fallback palette in use.


- `index.html` – entry point with header status line and a `<canvas>` sized to 1440x900.
- `js/helix-renderer.mjs` – ES module exporting `renderHelix(ctx, options)`; contains pure helpers for each layer.
- `data/palette.json` – optional palette override. Remove or edit to retint the renderer while staying offline. When missing, the script posts a small notice and uses internal ND-safe colors.

## Offline Usage

1. Keep the `index.html`, `js/`, and `data/` entries together on disk.
2. Open `index.html`. The header reports whether the custom palette loaded.
3. Study or capture the canvas. There are no network requests or build steps.

## Preparing for Fly.io

The Netlify configuration has been retired. A minimal `fly.toml` now ships with the repo so the renderer can be served by Fly.io when desired. Deploy manually:

1. Install the Fly.io CLI (`flyctl`).
2. Edit `fly.toml` and set a unique `app` name plus your preferred `primary_region`.
3. From a clean checkout, run `flyctl launch --no-deploy` to initialise the app without creating machines.
4. When ready, run `flyctl deploy --config fly.toml`. The static renderer will serve from `/` with no build step.

All steps are manual by design to honour the "no workflows" canon.
