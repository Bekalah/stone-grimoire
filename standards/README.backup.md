# 🜍 Stone Grimoire — Standards Charter

This Charter defines the **museum-grade rubric** for Codex 144:99 (Cathedral of Circuits).  
All folios, chapels, engines, and updates must comply with these standards.

—

## ✦ Provenance & Integrity

- **Provenance Blocks** — every data file (`.json`) and page (`.html`, `.md`) must carry:
  - **Lineage** (source texts, art, or influences).  
  - **License** (CC-BY, CC0, PD, ARR).  
  - **Curator** (responsible person).  
  - **Date** (creation or revision).  
- **Integrity** — no anonymous or orphaned files. Each element must be traceable.  
- **Transparency** — PD vs. commentary vs. original work must be clearly marked.  

—

## ✦ Museum-Grade Quality

- **Depth & Finish** — illuminated grimoire aesthetics, not flat placeholders.  
- **Accuracy** — Hermetic, Pythagorean, Qabalistic, Rosslyn-inspired references must be cited.  
- **Cosmology Integration** — modules (chapels, folios, ateliers) must connect back to the living spine (33 vertebrae, 72 ladder, 99 seals, 144 lattice).  
- **Immersion** — rooms (chapels) must be atmospheric: light, tone, geometry.  

—

## ✦ Accessibility

- **ND-Safe Sound** —  
  - No autoplay.  
  - Soft volume defaults.  
  - Solfeggio / Pythagorean tones + cathedral IR reverb.  
  - Manual start/stop controls always visible.  
- **Visual Safety** —  
  - No strobe or rapid flashing.  
  - Planetary tints & fractals must be gentle, not overwhelming.  
- **ARIA & Semantics** —  
  - All nav, controls, and plaques carry ARIA roles/labels.  
  - Folios use accessible form elements with clear labels.  
- **Exportability** — all folios must allow JSON export for external study.  

—

## ✦ Plaques & Metadata

- Every chapel or module must include a **Plaque** (curator card):  
  - Glyph / Icon  
  - Tone / Hz  
  - Color swatches (from Style Wardrobe)  
  - Sponsor metadata (if applicable)  
  - Five fields: *Intention, Technique, Lineage, Evidence, Reflection*  
- Plaques can be JSON (`assets/data/plaques/*.json`) or inline markup.  

—

## ✦ Style Wardrobe

- **Data-driven Skins** (`stylepacks.json`) provide:  
  - Palette (ink, wash, accent, gold).  
  - Motifs (Hilma spirals, Solfeggio ribbons, Gothic tracery).  
  - Provenance (`_provenance` object) with lineage + license.  
- No style is applied without citation.  

—

## ✦ Sponsorship Protocol

- **Attribution** — plaques include patron metadata if sponsored.  
- **Safety** — only PD / CC-licensed art is used unless ARR (display-only) is explicitly noted.  
- **Portability** — all sponsor-ready pages must be modular and exportable.  

—

## ✦ Enforcement

- **Curator Guide** (`CURATOR_GUIDE.md`) provides daily workflow rules.  
- **Recovery Folder** (`/recovery/`) quarantines duplicates or uncertain files — nothing in recovery is linked live.  
- **Validation** — `structure.schema.json` and `stylepacks.schema.json` enforce schema compliance.  

—

## ✦ Summary

The Charter ensures that **every element of Codex 144:99** is:  
- Museum-grade in finish,  
- Hermetically accurate in lineage,  
- Accessible and ND-safe,  
- Sponsor-ready and portable.  

⚜️ *Stone is grimoire. Every line of code, a carving. Every tone, a cube of Rosslyn. This Charter preserves the cathedral’s dignity.*