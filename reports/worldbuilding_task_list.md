# Worldbuilding Integration Status

This document summarizes the current state of the *Stone Grimoire* repository and outlines tasks for expanding it into a reusable world‑building toolkit across multiple games and complex environments.

## Completed Components
- **Cosmic Helix Renderer** (`helix-renderer/`) provides an offline, ND‑safe HTML/Canvas renderer for layered sacred geometry.
- **Shared Data Contracts** (`data/`) include numerology constants and palette data for consistent theming across projects.
- **Core Document Structure** (`core/`, `chapels/`, `folios/`) establishes museum‑grade conventions for rooms and archival plates.
- **Curator Sync Map** (`reports/curator_sync_map.md`) defines standard wiring between chapels, folios, engines and plaques.

## Current Repository Connections
- **Trinity Architecture**: Stone Grimoire (Body) connects conceptually with the `circuitum99` (Soul) and `cosmogenesis-learning-engine` (Spirit) repositories through shared numerology and codex schemas.
- **Shared JSON Assets**: Many engines and pages reference common JSON files (`assets/data/structure.json`, `plaques/*.json`, etc.) allowing cross‑module synchronization.
- **Engine Imports**: Chapel pages load engines from `assets/js/`, ensuring centralised behavior without duplication.

## Strategy for Multi‑Game & Complex Environments
- **Modular Engines**: Abstract existing engines into small ES modules so different games can enable only what they need.
- **Unified Data Schema**: Maintain a single codex schema file that all repositories import, guaranteeing consistent lore across environments.
- **World Builder Hooks**: Expose a simple API for generating rooms/realms from JSON descriptors, enabling integration with diverse game engines.
- **Offline First**: Continue the current approach of zero external dependencies so assets render reliably in closed or high‑security environments.

## Remaining Tasks
1. Document the API surface for engines and data schemas.
2. Add examples demonstrating how another game can import the renderer and codex data.
3. Create a world‑builder script that reads a realm descriptor and emits chapel/folio stubs.
4. Expand automated tests to validate that cross‑repo JSON references remain in sync.
5. Draft contribution guidelines for external games that wish to plug into the Trinity.

## Actions Completed in This Commit
- Added this planning document to `reports/worldbuilding_task_list.md` outlining current status and next steps.

