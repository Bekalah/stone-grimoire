# ✦ Codex 144:99 — Task Master (Alpha et Omega)

# Single entry instructions for Codex inside this chat.

# Purpose: prevent overwrites, ensure full, runnable code, and align engines (JS + Python).

ROLE
- Codex acts as scribe-engine. It may refine, extend, and repair; it must not erase or replace original intentions.
- Always output full working files in one code block; never drafts or partials.

GOLDEN RULES
- Preserve original details and structure. No ritual content; archetypes and angels are symbolic learning companions only.
- One file per answer. Begin with “# Path: <path>” then the complete file content.
- Use straight quotes only. Keep JSON valid (no trailing commas).
- Respect repo structure and do not flatten it: app, assets, data, docs, experiences, plugins, scripts, src, styles, test, vendor, engines.
- Use CC0 / public-domain / open-source assets only.
- Comment code once near the top: // ✦ Codex 144:99 — preserve original intention (or Python equivalent).

STRUCTURAL FRAMES (keep intact)
- Double Tree of Life (schema).
- 33-node Living Spine (backbone).
- Spiral-Dynamic + Tesseract Nodal System (navigation and growth logic).
- Six Consecration Angels (supportive avatars; guard rails for process integrity).
- Labs & Engines are modular and must interoperate (see ENGINES below).

DIRECTORY GUIDANCE (flat list, iPad-friendly)
- app
- assets
- data
- docs
- engines
- experiences
- plugins
- scripts
- src
- styles
- test
- vendor

SHARED PALETTE (cross-language)
- Place a palette JSON the engines can share:
  - Preferred: data/palettes/visionary.json
  - Acceptable fallback: shared/palettes/visionary.json (if shared/ exists)
  - Emergency fallback: engines/visionary.json (local to engines)
- Expected JSON shape (no trailing commas):
  {
    “visionary”: {
      “core”: {
        “indigo”: “#280050”,
        “violet”: “#460082”,
        “blue”: “#0080FF”,
        “green”: “#00FF80”,
        “amber”: “#FFC800”,
        “light”: “#FFFFFF”
      },
      “secondary”: {
        “crimson”: “#B7410E”,
        “gold”: “#FFD700”,
        “slate”: “#2E2E2E”,
        “silver”: “#C0C0C0”,
        “sky”: “#87CEFA”,
        “shadow”: “#4B0082”
      }
    }
  }

ENGINES (must remain modular and use the shared palette when possible)

1) Cosmogenesis.js (SVG, browser-native)
- Location: engines/Cosmogenesis.js
- Purpose: render Cosmogenesis Plates (Monad → Spiral → Ring → Border) with layouts:
  spiral, twin_cones, wheel, grid.
- Public API (minimal):
  - constructor(config)
  - mount(containerEl)
  - render()
  - setConfig(partialConfig)
  - randomizePhase()
  - toSVGBlob(), toPNGBlob(size)
  - loadPaletteJSON(url, use=“visionary.core”)
- Inputs:
  - labels (auto 1..N when blank)
  - palette (bg, ink, monad, spiral, border, nodes[])
- Behavior:
  - instant re-render on config change
  - exports SVG/PNG
  - ND-safe (reduced motion handled by host page; Cosmogenesis uses subtle animation only when asked)
- Must not add ritual logic. Keep symbolic only.

2) Cymatics.js (Web Audio + WebGL/Three.js)
- Location: engines/Cymatics.js
- Purpose: real-time audio → visual resonance (spiral/tesseract overlays).
- Public API (minimal):
  - initAudio({srcUrl? stream?})
  - analyze()
  - renderFrame(time)
  - setPalette(paletteJsonOrObject)
  - linkSpiralEngine(cosmogenesisInstance) for shared node geometry if needed
- Inputs:
  - CC0/public-domain audio URLs (type beats, ambient, binaural)
- Behavior:
  - safe defaults, gain limiting, pause/mute control
  - provides frequency bins and peak features for mapping to Cosmogenesis nodes

3) Visionary Palette (Python offline generator)
- Location: engines/visionary_palette.py
- Purpose: batch-generate stills/textures using the shared palette; complements the JS engines.
- CLI:
  - python engines/visionary_palette.py —mode kaleido|spiral|flame_like —width 1400 —height 1400 —symmetry 6 —seed 33 —out assets/cymatics
- Behavior:
  - loads palette JSON if available; otherwise uses built-in visionary fallback
  - writes PNGs to assets/cymatics (auto-create)
  - never blocks JS runtime; treated as an offline tool

4) Tesseract Engine (3D/4D spatial linking)
- Location: engines/Tesseract.js
- Purpose: nodal navigation across experiences A–D via a hypercube metaphor.
- Public API:
  - mount(containerWebGL)
  - setNodes(nodeListOf33)
  - transform(matrix4 or presets)
  - highlight(nodeId)
  - onSelect(callback)
- Integrations:
  - can receive palette and node colors from Cosmogenesis
  - can react to Cymatics features (e.g., beat-synced highlight)

5) Apprentice Pillar (onboarding + 6 guardians)
- Location: engines/ApprenticePillar.js
- Purpose: gentle guidance, tooltips, ND-safe tour, and the six consecration avatars as UI guardians (symbolic).
- Public API:
  - initializePillar({avatars:[]})
  - activateGuardian(indexOrName)
  - renderInto(containerEl)
  - onStep(callback)

6) Jacob’s Ladder (33-node helper)
- Location: engines/JacobsLadder.js
- Purpose: convenience helper for the 33-node spine (placements, numbering, label alignment).
- Public API:
  - spiralPositions({rInner, rOuter, turns, phase})
  - ringPositions({radius, phase})
  - labelMapper(labels[])

ASSET PLACEMENT
- Generated images from Python: assets/cymatics
- Linked audio: assets/audio (URLs preferred; no private/DRM content)
- If large binary assets must be tracked, prefer Git LFS.

CODING STYLE REQUIREMENTS
- JS/TS modules with small, focused classes or functions.
- No global mutable singletons; return instances.
- Comments: one banner comment near the top per file with “✦ Codex 144:99 — preserve original intention”.
- Accessibility: support reduced motion, calm colors; no autoplay audio (start only on user gesture).

DO-NOT-DO LIST
- Do not insert ritual or ceremonial steps; all archetypal content is symbolic and supportive only.
- Do not rename top-level directories.
- Do not replace existing palettes or symbolic mappings.
- Do not produce partial code or “snippets”; always return entire file when asked to update or create.

EXAMPLE TASK PROMPTS (ready to paste after this manifest)
- Create engines/Tesseract.js that exposes mount, setNodes, transform, highlight, onSelect; uses Three.js; colors come from data/palettes/visionary.json (“visionary.core”); no animations unless requested via a boolean config.
- Extend engines/Cymatics.js with initAudio(url), analyze(), and renderFrame(time); provide a setPalette(p) method reading the same palette JSON structure; include gain limiting and a mute toggle; no autoplay.
- Update engines/Cosmogenesis.js to accept an optional getPositions() callback that overrides default spiral placement (for research modes), while preserving current defaults.
- Add data/palettes/visionary.json exactly in the shape defined above; do not change field names; no trailing commas.
- Create engines/JacobsLadder.js with spiralPositions, ringPositions, labelMapper utilities; ensure math is deterministic for a given phase.
- Create experiences/ExperienceA.md (or .json if you prefer) that lists a small set of nodes and labels for a demo, with no personal names; use symbolic labels only.

CHECKLIST BEFORE RETURNING ANY FILE
- Path line present and correct.
- Entire file content included.
- Straight quotes only.
- Valid JSON (when applicable).
- Uses // ✦ Codex 144:99 — preserve original intention (or Python docstring).
- No rituals. No overwrites of project identity. Only improvements and extensions.

END OF TASK MASTER