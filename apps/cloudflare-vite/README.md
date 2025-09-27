# Cloudflare Vite Bridge

This optional client provides a Vite + React surface for hosting the Cosmic Helix renderer within Cloudflare Pages. It does not
replace the offline-first canvas in `../renderer`; instead, it wraps that artefact with UI and a hook for C++ helpers compiled to
WebAssembly.

## Directory Map
- `index.html` — Vite entry point used during local development and the build.
- `src/main.jsx` — bootstraps React using the minimal `App` component.
- `src/App.jsx` — renders ND-safe UI scaffolding and checks for the optional WebAssembly module.
- `src/native/helix.cpp` — placeholder numerology helper ready for Emscripten.
- `public/` — place compiled assets like `helix.wasm` here.

## Local Steps
1. `npm install`
2. `npm run dev` for local Vite development.
3. `npm run build` to emit the static `dist/` bundle for Cloudflare.
4. Optionally `npm run wasm` to compile the C++ helper.

## Deployment with Wrangler
After building, use the `infra/cloudflare/wrangler.toml` file with `wrangler pages dev` or `wrangler pages publish`. The env var
`HELIX_WASM_PATH` makes the WebAssembly URL configurable without editing the React code.

All files avoid motion, keep calm palettes, and respect the numerology constants shared with the offline renderer.
