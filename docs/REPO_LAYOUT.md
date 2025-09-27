# Repository Layout Update

The active files have been grouped by responsibility so the offline renderer, Cloudflare bridge, and archived assets stay clear.

## Active Directories
- `apps/renderer/` — ND-safe offline HTML + Canvas renderer with all JSON palettes in `data/`.
- `apps/cloudflare-vite/` — Vite + React bridge prepared for Cloudflare deployment and optional C++ helpers.
- `infra/cloudflare/` — Wrangler configuration for deploying the Vite bundle to Cloudflare Pages.

## Archived or Legacy
- `random/helix-renderer-legacy/` — previous copy of the renderer kept for historical reference.
- `random/legacy-hosting/` — Fly.io dockerfile and configs moved out of the active tree.

Any additional artifacts that do not participate in the current renderer/Cloudflare setup should be parked under `random/` for
clarity.
