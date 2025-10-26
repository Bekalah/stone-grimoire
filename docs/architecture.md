# 🜍 Stone Grimoire — System Architecture (One‑Pager)

*A portable, museum‑grade cathedral engine: data‑driven style, plaques, alchemy, angels, and ND‑friendly harmonics.*

---

## Diagram

```mermaid
flowchart TD
  %% Top-level
  A[Visitor\n(click/tap/scroll)] -->|gesture| B{Temple Page\n(cathedral.html, chapels/*.html)}
  B --> C[Style Engine\nassets/js/components/style-engine.js]
  B --> D[Cathedral Engine\nassets/js/cathedral-engine.js]
  B --> E[Plaque System\nassets/js/components/room-plaque.js]
  B --> F[Ambient Harmonics\nassets/js/ambient-engine.js]
  B --> G[Cymatic Bloom\nassets/js/cymatic-engine.js]
  B --> H[Alchemy Engine\nassets/js/alchemy-engine.js]
  B --> I[Rites Engine (Temple-only)\nassets/js/rites-engine.js]
  B --> J[Guides (Hilma & The Five)\nassets/js/guides.js]

  %% Data sources
  subgraph DATA[Data (JSON)]
    S1[structure.json\nrooms, routes, elements]:::json
    S2[stylepacks.json\npalettes, fonts, ornaments]:::json
    S3[angels72.json\nzodiac, decans, tones, stylepack]:::json
    S4[ambient.json\nsolfeggio cycle, IR, ND prefs]:::json
    S5[rites.json\nTemple protocols]:::json
    S6[hilma-plaque.json\ncurator note for Sanctum]:::json
  end

  %% Overlays / media
  subgraph MEDIA[Overlays & Media]
    M1[assets/overlays/\nspiral-mandalas.svg]
    M2[assets/overlays/\nhealing-ribbons.*]
    M3[assets/overlays/\nscroll-text.json]
    M4[assets/sounds/\nir_cathedral.wav]
    M5[assets/sounds/\ncathedral_pad_hilma.mp3]
  end

  %% Wiring
  D --> S1
  C --> S2
  E --> S1
  H --> S3
  F --> S4
  I --> S5
  E --> S6

  G --> F
  F --> M4
  F --> M5
  D --> M1
  H --> M2
  J --> M3

  %% Outputs
  F --> O1((Audio Out\nND-safe))
  G --> O2((Cymatic Visual\nno-strobe))
  E --> O3[(Plaques\nprovenance/lineage)]
  C --> O4[(Page Styling\nmuseum skins)]
  H --> O5((Fusion Effects\ncolor/tone/geometry))

  classDef json fill:#fff8,stroke:#b89,stroke-width:1px,color:#333;
