# ✦ Curator Sync Map — Bring Rooms & Effects Back (No-Reorg Plan)

*Codex 144:99 · Museum-grade alignment for your current tree.*

You told me your exact current layout. I’ve mapped roles, checks, and quick fixes **without changing your structure** — only connecting what’s already there and quarantining duplicates in `recovery/`.

—

## I. Your Live Inventory (verbatim from you)

**Directories**

assets, chapels, core, docs, folios, gnosis, guides, helpers, herbs, main,
music, ornaments, patrons, plans, recovery, resources, standards, tools, updates

**Root files**

angels72.html, cathedral.html, CURATOR_GUIDE.md, index.html, LICENSE,
musical-cubes.html, README_UPDATE.md, README.md

—

## II. Canonical Roles (keep these as-is)

- `assets/` → engines, data, css, images.  
  - JS engines (ambient/fractal/cymatic/planetary/light), data (`structure.json`, plaques, stylepacks).
- `chapels/` → **interactive rooms** (effects, ND-safe audio **on manual start**, planetary tint).  
- `folios/` → **archive plates** (study pages: Intention · Technique · Lineage · Evidence · Reflection).  
- `gnosis/` → mystical study pages (ok to keep here **if** they also appear on your Folio Shelf via link).  
- `helpers/` → `cathedral-helper.js` (feature flags, rubric, audio-safe).  
- `main/` → ateliers & briefs (tools, manifestos; can *link to* chapels; no duplication).  
- `resources/` → image sources & PD indexes (cite from folios/chapels).  
- `standards/` → project charter (`README.md`).  
- `recovery/` → duplicates & unsure files (quarantine; not linked).  
_All others (core/docs/guides/herbs/music/ornaments/patrons/plans/tools/updates) are supportive folders; keep them untouched._

—

## III. Chapel ↔ Folio ↔ Engine Wiring (how to “bring back the effects”)

### A) What every **Chapel** page must minimally have

- **Imports** (any one of):
  - `helpers/cathedral-helper.js` (preferred)  
  - and/or `assets/js/planetary-light.js`, `assets/js/engines/ambient-engine.js`
- **Controls**
  - Planetary tint buttons: Moon, Venus, Sun, Mercury, Jupiter, Mars, Saturn (subtle background; no motion).
  - Manual audio **Start/Stop** (single Oscillator; ND-safe; no autoplay).
- **Curator Plaque**
  - Render from `assets/data/plaques/<matching>.json` if exists; otherwise inline the five fields.
- **Numerology chips**
  - Badges: `11, 22, 33, 72, 99, 144`.
- **Cross-links**
  - “Related Folio” (in `folios/…`) and any relevant atelier/tool (in `main/` or a root engine page like `angels72.html`).

> If a chapel is missing effects, copy the controls from a working chapel (e.g., `crypt.html` or `lady-chapel.html`) and swap the plaque key.

### B) What every **Folio** page must minimally have

- Invocation fields (the 5-fold rubric).  
- A static figure/plate (SVG/PNG) with a caption citing PD source.  
- Cross-links to:
  - Its Chapel twin in `chapels/`
  - Any atelier/tool (`angels72.html`, visual labs, etc.)
- Optional: local save/export to JSON (already in your `folio1.html`).

### C) Engines stay put

- Keep engines in `assets/` only. **Do not** copy engines into chapels/folios.  
- Chapel pages **call** engines (ambient, fractal, planetary) through their imports.

—

## IV. Quick Audit — What to pair, what to fix

Use this checklist to walk your tree once:

### 1) Pairs: does each Chapel have a Folio?

- For each `chapels/*.html`, confirm there is **one** folio document about that room’s theme.
  - If “Gnosis/Thunder” is now in `folios/`, ✅ pair it with `chapels/thunder-…html` (or keep chapel named “lady-chapel” etc. and link explicitly).
  - If no folio exists yet, it’s okay — add later. Don’t duplicate.

### 2) Plaques: JSON coverage

- For each chapel filename **stem**, look for `assets/data/plaques/<stem>.json`.  
  - If missing, create a one-page stub with the five fields.

### 3) Effects: engines & controls present?

- Open each `chapels/*.html` and verify:
  - Planetary tint buttons exist.
  - Manual **Start/Stop** audio exists.
  - No autoplay, no heavy motion.

### 4) Root strays (keep, alias, or relocate softly)

- `musical-cubes.html` is at root **and** you may have `chapels/musical-cubes.html`.  
  - **Option A (no move):** keep root file as a router/alias that links to the chapel version.  
  - **Option B (soft relocate):** move the root file to `recovery/` and keep only the chapel version live.

### 5) Recovery quarantine

- Put **all duplicates** or uncertain legacy files in `recovery/`.  
  - Do **not** link to `recovery/` from live pages.

—

## V. Tiny “Fix Packs” (drop-in edits you can make in minutes)

### A) Minimal **Chapel Controls** block (paste into any `chapels/*.html`)

```html
<section aria-labelledby=“controls”>
  <h2 id=“controls” class=“sr-only”>Chapel Controls</h2>
  <div class=“bar”>
    <button data-tint=“moon”>Moon</button>
    <button data-tint=“venus”>Venus</button>
    <button data-tint=“sun”>Sun</button>
    <button data-tint=“mercury”>Mercury</button>
    <button data-tint=“jupiter”>Jupiter</button>
    <button data-tint=“mars”>Mars</button>
    <button data-tint=“saturn”>Saturn</button>
    <button id=“startTone”>Start Tone</button>
    <button id=“stopTone” disabled>Stop</button>
  </div>
</section>
<script type=“module”>
  import “../helpers/cathedral-helper.js”; // loads feature flags and safe defaults
  // Tint handlers
  document.querySelectorAll(“[data-tint]”).forEach(b=>{
    b.addEventListener(“click”, ()=>{
      const t=b.getAttribute(“data-tint”);
      document.body.className = “”; // clear
      document.body.classList.add(“t-“+t);
    });
  });
  // ND-safe audio
  let ctx, osc, gain;
  const start=document.getElementById(“startTone”);
  const stop=document.getElementById(“stopTone”);
  function ensure(){ if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext; ctx=new AC();
    osc=ctx.createOscillator(); gain=ctx.createGain();
    osc.type=“sine”; osc.frequency.value=210.42; gain.gain.value=0.04;
    osc.connect(gain).connect(ctx.destination);
  }
  start.addEventListener(“click”, async ()=>{
    ensure(); if(ctx.state===“suspended”) await ctx.resume(); try{osc.start();}catch{}
    start.disabled=true; stop.disabled=false;
  });
  stop.addEventListener(“click”, async ()=>{
    if(!ctx) return; try{osc.stop();}catch{} try{await ctx.close();}catch{}
    ctx=osc=gain=null; stop.disabled=true; start.disabled=false;
  });
</script>
