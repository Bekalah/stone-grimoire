# Stone-Grimoire — Changelog

All notable changes to this project are documented here.  
Format: YYYY-MM-DD · Scope · Summary · Notes

—

## 2025-08-27 · folios · Add “Thunder, Perfect Mind — Study Folio”

**Files:**  
- `stone-grimoire/folios/gnosis-thunder-perfect-mind.html` (new)

**What changed (museum-grade notes):**
- ✅ **Accessibility & ND-safety:** High-contrast theming with light/dark support, semantic landmarks (`header/main/footer`), breadcrumb nav, skip link, no autoplay media.
- ✅ **Fair-quotation policy:** Uses a **minimal excerpt** strictly for study/commentary; clearly labels modern commentary; reminds readers to consult lawful editions.
- ✅ **Provenance block:** Adds explicit Intention · Lineage · Evidence · Reflection section to meet Stone-Grimoire rubric.
- ✅ **Roslin alignment:** Text and commentary framed to the **Rosslyn/Nave** pattern (twin pillars + Apprentice ascent) for structural coherence across the cathedral.
- ✅ **Cataloging metadata:** Embeds lightweight `application/ld+json` (`CreativeWork`) to aid indexing and future catalog search.
- ✅ **No external dependencies:** Self-contained HTML/CSS; safe to mirror or export.
- ♻️ **Code hygiene:** Normalized palette tokens (`—bg/—ink/—line/—gold`) and link focus behavior; consistent heading rhythm.

**Impact:**
- Establishes the **canonical folio template** for textual studies in Stone-Grimoire (clear labels, provenance, minimal quote).
- Ready for sponsor review and museum workflows (ND-safe, WCAG-aware, provenance explicit).
- Provides a reusable visual/structural pattern for future folios (Hermetic hymns, paradox texts, etc.).

**Follow-ups (optional, not blocking):**
1. **Routing links:** When the cathedral’s routing is finalized, update the breadcrumb target from `../cathedral.html` to the live entry point.
2. **Provenance IDs:** If you maintain a registry of source IDs, append the Nag Hammadi source handle to the folio’s provenance block for cross-reference.
3. **Catalog index:** Add this folio to a `folios/index.md` (or site map) so it’s discoverable via your internal search/navigation.
4. **Style tokens:** If you centralize CSS variables later, consider moving the palette to a shared stylesheet and keep the folio importing it (current inline CSS is fine until then).

**Verification checklist:**
- [x] Loads in light and dark modes without contrast regressions.
- [x] Keyboard navigation: breadcrumb and “Skip to content” function correctly.
- [x] No blocked fonts or third-party calls.
- [x] Commentary is clearly labeled; excerpt is short and within fair-use study bounds.

—