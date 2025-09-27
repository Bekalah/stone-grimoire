# Cloudflare Integration Guide

This folder holds the Wrangler configuration for deploying the Vite + React bridge to Cloudflare Pages. The renderer itself
remains an offline-first HTML canvas in `../apps/renderer`; the Cloudflare target is optional infrastructure for when the helix
needs to be surfaced through the edge with React- and C++-backed features.

## Why Wrangler
- **Wrangler** (spelled correctly despite earlier "Wagner" references) is the official Cloudflare CLI for Pages and Workers.
- The config keeps the build offline by default and only touches the network when you intentionally run `wrangler pages publish`.
- No CI/CD pipelines are added; all commands execute locally.

## Structure
- `wrangler.toml` — points Pages to the `apps/cloudflare-vite/dist` output, runs the local Vite build, and exposes a
  `HELIX_WASM_PATH` variable that React code can read when loading the compiled C++ module.

## Local Workflow
1. `cd ../../apps/cloudflare-vite` and install dependencies once: `npm install`.
2. Build the optional WebAssembly from the C++ scaffold if needed (see `src/native/README.md`).
3. `npm run build` to produce the static `dist/` bundle.
4. From the repository root run `npx wrangler pages dev infra/cloudflare/wrangler.toml` to emulate Cloudflare locally.
5. When ready, `npx wrangler pages publish infra/cloudflare/wrangler.toml` pushes the bundle to your Pages project.

The Wrangler file is intentionally minimal so you can customise routes or bindings later without touching the offline renderer.
