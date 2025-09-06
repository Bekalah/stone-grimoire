# ✦ Cathedral of Circuits — Pull Request Checklist ✦

Please confirm all items before merging.  
This project follows **CONTRIBUTING.md** (Bot Contract).  
No GitHub Actions. ND-safe only.

—

### ✅ Required Checks
- [ ] Ran `./scripts/check.sh` locally (ND-safe gate passed)
- [ ] Added/updated node(s) in `data/nodes/*.json`
- [ ] Updated `data/registry.json` with new node IDs
- [ ] Added or extended provenance entries in `data/provenance.json`
- [ ] Extended `data/correspondences.json` without breaking schema
- [ ] All JSON valid (no smart quotes, no tabs, LF endings)

### 🎨 Creative Integrity
- [ ] Layered art sources preserved (no flat SVG-only)
- [ ] ND-safe confirmed (no autoplay, strobe, blink, or flashing)
- [ ] Numerology respected (33 spine, 99 gates, 144 lattice)

### 📜 Provenance & Citations
- [ ] Cited relevant sources (Dee, Agrippa, Fortune, Case, Kunz, Regardie, I Ching, Tibetan, Reiki, Hilma, Tesla, Jung, etc.)
- [ ] Notes added to `docs/annex/` if new research included

### ⚡ Final Review
- [ ] No `.github/workflows/*` created or modified
- [ ] PR description includes context for new/updated nodes
- [ ] PR aligns with **open spiral learning** and trauma-informed design

# BEST-TOOLS APPENDIX (paste at end of CONTRIBUTING.md)

GOAL
- Realistic + dynamic open-world spiral learning; zero CI; all local; ND-safe.
- Works offline; scales to any flavor (Einstein, Hypatia, Agrippa, Dee, Fortune, Case, Tibetan, Reiki, etc.).

RUNTIME BASICS (local only; optional)
- Node.js ≥ 20 LTS (for dev tools only; app runs in browser without build).
- Python ≥ 3.11 (optional scripts/utilities).
- jq ≥ 1.6 (JSON ops), ripgrep ≥ 13 (fast search).

DEV DEPENDENCIES (optional — local only; no workflows)
- Prettier ^3 (format JS/JSON/MD): `npx prettier -w .`
- markdownlint-cli2 ^0.14 (MD lint): `markdownlint-cli2 **/*.md`
- ajv-cli ^5 (JSON-Schema validate): `npx ajv -s data/nodes/schema.json -d ‘data/nodes/*.json’`
- yamllint (YAML sanity) + shellcheck (shell sanity), if installed.

If using npm locally, `package.json` devDeps suggestion:
{
  “private”: true,
  “devDependencies”: {
    “ajv-cli”: “^5.0.0”,
    “markdownlint-cli2”: “^0.14.0”,
    “prettier”: “^3.3.0”
  },
  “scripts”: {
    “fmt”: “prettier -w .”,
    “lint:md”: “markdownlint-cli2 **/*.md”,
    “validate:nodes”: “ajv -s data/nodes/schema.json -d ‘data/nodes/*.json’ —errors=text”
  }
}

BROWSER-SIDE (runs offline; no bundler; ND-safe)
- Use ES modules only (no framework required).
- Optional utility libs (drop in via <script> tags; remove if not needed):
  • Marked (render .md folios to HTML): https://github.com/markedjs/marked (latest 5.x)  
    Usage: `const html = marked.parse(mdString);` (sanitize your input).  
  • KaTeX (math) if you need formulas (fast, no network).  
  • Mermaid (diagrams) if desired; keep animations minimal (ND-safe).
- Audio: only manual play `<audio controls>`; default volume low; no autoplay attribute—ever.

ACCESSIBILITY & ND-SAFETY
- No strobe, blink, or autoplay. Keep transitions 200–500ms max.
- High contrast text; font stack: EB Garamond, Junicode, Inter.
- Respect motion settings: honor `prefers-reduced-motion: reduce`.

DATA & SCHEMA
- Keep `data/nodes/schema.json` authoritative; validate with `ajv` locally.
- Append to `data/correspondences.json` for overlays (Hermetic, Thelema, Alchemy, Soyga, I Ching, Astrology, BioGeometry, Tibetan, Reiki, Art-Genius).
- Append to `data/provenance.json` for citations (Einstein, Hypatia, Agrippa, Dee, Fortune, Case, Regardie, Kunz, Hilma, Kunz, Tesla, Jung, etc.). Never overwrite existing keys.

SCRIPTS (local only; no CI)
- `scripts/check.sh` (required): ND-safety & hygiene (LF only; no smart quotes/tabs; no autoplay/blink/marquee).
- `scripts/ci.sh` (optional): runs check + optional format/validate; must skip gracefully if tools missing.
- Optional git hook: `.git/hooks/pre-push` runs `./scripts/check.sh`.

DEPLOY (no workflows)
- GitHub Pages (Manual): Settings → Pages → Branch: `main` (or `/docs`).  
  Or serve locally with a simple static server (`python -m http.server`).

PROMPTS & MODES
- Every node must emit 4 prompt types: art, sound, geometry, writing, tailored to selected overlay (e.g., Hypatia or Einstein flavor).
- Overlays are purely data-driven (toggle in UI); same node id, different face.
- Egregores/daimons arrays must always be present (Tarot, IFS, Tibetan, Reiki, Genius-muses).

GUARDRAILS (repeat)
- NO `.github/workflows/*`.  
- UPDATE only; do not overwrite canon.  
- Keep layered art sources; never deliver flat SVG as the only source.  
- Preserve numerology (33 spine, 99 gates, 144 lattice; include 72 Shem angels/demons where relevant).  
- Valid JSON/MD/JS/CSS only; LF endings; ASCII quotes.

BOT PREFACE (paste atop any bot request)
“BOT MODE: obey CONTRIBUTING.md. No workflows. Produce valid JSON/MD/JS/CSS into correct folders. Update, don’t overwrite. Extend correspondences/provenance. ND-safe. Output code/data only—no prose.”