# ✦ Venus Covenant — Atelier Manifesto (Codex 144:99)

**Purpose.** The Ateliers are covens of living art. Each atelier binds a real patron circle to a planetary/visionary current and produces work that is both **fine art** and **talisman**. This document sets museum‑grade standards so every piece is coherent, ethical, and sponsor‑ready.

—

## 0) Standards (apply to all ateliers)
- **Museum Quality:** depth, glaze, proportion (φ), no flat clip‑art.
- **Provenance:** include _Intention · Technique · Lineage · Evidence · Reflection_ on each piece.
- **Accessibility (ND‑safe):** no strobe; tone starts only on user tap; high‑contrast stylepacks available; captions/ALT text.
- **Licensing:** public‑domain sources or properly attributed CC‑BY/CC‑BY‑SA; keep a PD manifest for each gallery.
- **Stylepacks:** use `stylepacks.json` IDs for palette/motif; record which pack was used in the plaque.

—

## 1) Atelier Lux — Light Geometry
**Sphere:** Venus (harmonics through Aether) · **Tone:** 528 Hz · **Stylepack:** `hilma_spiral`  
**Lineage:** Hilma af Klint, Emma Kunz, Hermetic geometry.  
**Output:** radiant mandalas, spiral cosmograms, ND‑gentle ribbon overlays.  
**Rule:** Every plate must “breathe” via layers (glaze, halo, soft depth).  
**Sponsor Credit:** Curator plaque lists patrons + materials.

—

## 2) Atelier Rosæ — Illuminated Manuscript
**Sphere:** Venus/Water · **Tone:** 639 Hz · **Stylepack:** `rosicrucian_black`  
**Lineage:** Rosicrucian emblems, Hildegard, medieval scriptorium.  
**Output:** illuminated folios, ritual texts, rose‑cross diagrams.  
**Rule:** Each text page includes gold initial, border vine, and a hidden marginal glyph (cataloged in notes).  
**Sponsor Credit:** Named scribe/poet + archive source links.

—

## 3) Atelier Somnium — Dream Current
**Sphere:** Venus/Air · **Tone:** 741 Hz · **Stylepack:** `faery_shadow`  
**Lineage:** Carrington, Varo, folk cunning lore.  
**Output:** oneiric sigils, lantern‑lit scenes, dream journals with dates and prompts.  
**Rule:** Pair every image with a short dream‑field note (2–4 lines) and a symbolic index.  
**Sponsor Credit:** Dream circle patrons (anonymous option supported).

—

## 4) Atelier Venosa — Visionary Realism
**Sphere:** Venus/Fire · **Tone:** 852 Hz · **Stylepack:** `alchemical_bloom`  
**Lineage:** Venosa, Fuchs, Klarwein.  
**Output:** archetypal portraits (avatars), flesh + geometry, subtle glaze.  
**Rule:** Portraits are embedded in living geometry (halo, vesica, lattice); list brushes/technique in plaque.  
**Sponsor Credit:** Patron + sitter (if public); model release kept offline.

—

## 5) Atelier Luxuria — Ecstatic Ribbon Rite
**Sphere:** Venus/Light · **Tone:** 963 Hz · **Stylepack:** `solfeggio_ribbons`  
**Lineage:** sacred fashion, sound temple, cymatic couture.  
**Output:** harmonic ribbons, couture silhouettes, audio‑responsive overlays.  
**Rule:** Every scene has a clear “score” (frequencies used, IR reverb settings) in the plaque’s Technique field.  
**Sponsor Credit:** DJs/sound designers credited; IR source noted.

—

## 6) Ethics & Safety
- **Consent:** real people = explicit consent; keep sealed records offline.
- **Privacy:** anonymize where requested; use composite names for public pages.
- **Boundaries:** no medical claims; this is art + contemplative design.
- **ND Care:** volume caps; gentle dynamics; visible “Quietus” button.

—

## 7) Plaque Template (paste into each page)
**Intention:** _What is willed/evoked?_  
**Technique:** _Media/stack, stylepack ID, tones (Hz), IR used._  
**Lineage:** _Sources (PD/CC) + influences._  
**Evidence:** _Links to assets/plates; process notes (1–3 lines)._  
**Reflection:** _What changed? Safety notes; next step._  
**Patrons:** _Names or “Anonymous,” year._

—

## 8) Production Checklist
- [ ] Choose atelier + stylepack.
- [ ] Draft Intention; pick tone (Solfeggio/Pythagorean).
- [ ] Build the plate with depth (≥3 layers).
- [ ] Add plaque with full provenance.
- [ ] Add ALT/captions; run accessibility pass.
- [ ] Commit; update PD manifest.

**Motto:** _Lux et Amor in aeternum resonat._  (Light and Love resound forever.)

<!DOCTYPE html>
<html lang=“en”>
<head>
  <meta charset=“UTF-8”>
  <title>Ateliers Manifesto</title>
  <link rel=“stylesheet” href=“../../assets/css/style.css”>
  <script type=“module”>
    import { applyRoom } from “../../assets/js/cathedral-engine.js”;
    import { renderMarkdown } from “../../assets/js/markdown-render.js”;
    window.addEventListener(“DOMContentLoaded”, () => {
      applyRoom(“atelier-manifesto”);
      renderMarkdown(“../../main/05_ateliers/MANIFESTO.md”, “#content”);
    });
  </script>
</head>
<body>
  <div id=“content” class=“folio-text”></div>
</body>
</html>