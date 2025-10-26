# Bridge Plan — Codex 144:99, Living Tarot, and Mystery House

This memo outlines the current bridge pieces in *Stone Grimoire* and a task list for extending them to the broader cosmology (Circuitum99, Codex 144:99, Living Tarot, and the upcoming Mystery House).

## Current Links

- **Circuitum99**: `bridge/c99-bridge.json` shares palette tokens and art references in an ND-safe, offline JSON schema.
- **Cosmic Helix Renderer**: `helix-renderer/` is a standalone ES module (no deps) that other repos can copy verbatim. It already encodes numerology constants and layer ordering.

## Flexibility & Safety Principles

- Pure functions and JSON configs—no build step, no network requests.
- Palette and numerology constants live in data files so repos can swap styles without overwriting lore.
- All geometry is static: no motion, strobe, or autoplay; readable contrast for ND-safe use.

## Bridge Tasks

1. **Codex 144:99**
  - Mirror `helix-renderer/` into the codex repo and expose numerology constants for card spreads.
  - Add a `bridge/codex-bridge.json` that maps deck names to palette layers.
2. **Living Tarot**
  - Provide an import example showing how a tarot page loads the helix renderer as an optional overlay.
  - Document a safe fallback when palette files are missing.
3. **Circuitum99 (CYOA)**
  - Extend `c99-bridge.json` with node IDs for story rooms so egregores can cross between books and apps.
  - Draft a JSON schema for character stats that remain interchangeable across repos.
4. **Mystery House (144 rooms)**
  - Create a new repo scaffold with `/rooms/001-144.json` files and a minimal `index.html` loader.
  - Map each room to a stylepack and optional deity/egregore reference.
5. **General**
  - Keep everything offline-first: all assets local, no CDN calls.
  - Use shared palette file format to avoid accidental overwrites.
  - Add README notes in each repo explaining how and why bridges exist.

## Next Steps

- Confirm repository access for Codex 144:99 and Mystery House.
- Duplicate the helix renderer and update bridge JSON files accordingly.
- Review each bridge file for ND-safe compliance (contrast, motion, wording).
