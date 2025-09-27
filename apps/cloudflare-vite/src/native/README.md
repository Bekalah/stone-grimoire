# Native Bridge Scaffold

This folder carries a minimal C++ routine that can be compiled to WebAssembly with Emscripten. The React layer checks for the
module at runtime but remains functional if it is missing.

## Build Steps (Offline)
1. Install Emscripten locally if you have not already.
2. Run `npm run wasm` from `apps/cloudflare-vite` to compile `helix.cpp` into `public/helix.wasm`.
3. Wrangler exposes `HELIX_WASM_PATH` so you can move or rename the module later without touching React code.

The native function simply sums numerology constants (3, 9, 33, 99) to stay aligned with the renderer's geometry rules.
