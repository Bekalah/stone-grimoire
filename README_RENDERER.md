# Cosmic Helix Renderer (Offline, ND-safe)

This renderer keeps the Stone Cathedral helix accessible without builds or networks. Double-click `index.html` and the 1440×900 canvas paints once, layering vesica geometry, the Tree-of-Life scaffold, a Fibonacci spiral, and a static double-helix lattice. The palette is trauma-informed: high legibility, no strobing, and gentle gradients only.

## Files

- `index.html` – entry point with calm shell styling and a short status message about the active palette.
- `js/helix-renderer.mjs` – ES module exporting `renderHelix(ctx, options)`. All helpers are pure so the canvas state stays predictable.
- `data/palette.json` – optional colour overrides. Remove or edit this file to retint the scene while staying offline.

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
