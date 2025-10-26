Stone Grimoire — Cathedral Integration Framework

(Codex 144:99 · Sponsor-grade / Team-ready)

⸻

Scope

A Living Cathedral (Rosslyn pattern) built to museum standards:
	•	Alchemy fusion engine
	•	Shem Ladder (72 archetypes)
	•	Plaques on every page
	•	ND-friendly sound
	•	Modular JSON-driven routing

Goal: make the entire stack reusable across ateliers and art/magick projects with minimal setup.

⸻

0) What’s In Place

Style Wardrobe
	•	stylepacks.json + style-engine.js
	•	Museum-quality skins: palette, motif, texture
	•	Codex lineage: Fuchs, Venosa, Klarwein, PD engravings, dark-academia fonts

Cathedral Engine
	•	Reads structure.json (rooms)
	•	Applies stylepack, element overlays, and tones
	•	Starts gentle cathedral pad on first gesture

Plaque System
	•	room-plaque.js → curator card
	•	Glyph, tone (Hz), swatches, notes, sponsor metadata

Angelic Data (72)
	•	angels72.json = Shem ha-Mephorash mapping
	•	Keys: sign, decan, ruler, element, tone, stylepack, cymatic pattern
	•	Mirrors Codex “angel-tech ladder”

Alchemy Engine
	•	7 stages (calcination → coagulation)
	•	Fusion events:
	•	Color glide
	•	Mid-blend style handoff
	•	Tone glide (cathedral IR reverb)

Labs & Pages
	•	Helix Totem → 3D archetype fusion
	•	Shem Ladder → 72-grid reskin
	•	Chapel Pages → Apprentice, Lady, Crypt
	•	Musical Cubes → Rosslyn harmonic stubs
	•	PD Library → manuscript & engraving stubs

Accessibility / ND-Friendly
	•	No strobe, no autoplay
	•	Sound gated on gesture
	•	High-contrast skins
	•	ARIA roles/labels
	•	Cymatic blooms (for non-hearing), narrated glyphs (for non-seeing)

⸻

# Section

## Multiclass Templates (Agate)

Stone Grimoire exports a small set of ES module templates so that other
repositories can reuse cathedral features without copying code. Each
template is ND-safe and side-effect free.

### cross-fetch.js

- `loadFromRepo(registry, repoName, relPath, kind="json")`
  - Resolves a file from a sibling repo listed in `registry`.
  - `kind` may be "json", "text", or "module".
  - Returns parsed JSON, text, or a dynamic import.

### interface-guard.js

- `validateInterface(payload, schemaUrl="/assets/data/interface.schema.json")`
  - Loads a JSON schema (local path or remote URL).
  - Checks required keys, semantic version, and array fields.
  - Returns `{ valid:boolean, errors:[] }`.

### merge-view.js

- `composeView({palettes=[], geometry_layers=[], narrative_nodes=[]}, overlays={})`
  - Deep-freezes arrays to prevent mutation.
  - Merges overlay arrays into a new view object.
  - Returns an immutable snapshot.

### registry-loader.js

- `loadRegistry(url="/assets/data/registry.json")`
  - Fetches and parses the repository registry.
  - Throws if the file is missing.

These templates form the external contract for composing multiclass
views: load a registry, fetch cross-repo assets, validate interface
payloads, then merge overlays into a frozen view. Other modules may call
them but must respect their pure, read-only design.
