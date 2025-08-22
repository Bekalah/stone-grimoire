// Cathedral engine (robust): reads structure.json, infers current room,
// applies stylepack, starts elemental overlay, and arms gentle tone pad.

async function loadJSON(p){ const r = await fetch(p); return r.json(); }
function rel(path){
  const d = location.pathname.split('/').length - 2;
  return ('../'.repeat(Math.max(0, d))) + path;
}

// ---------- Room detection (same semantics as room-plaque.js)
function filenameFromPath(){
  const last = location.pathname.split('/').pop() || 'index.html';
  return last.toLowerCase();
}
function inferIdFromFilename(file){
  const base = file.endsWith('.html') ? file.slice(0, -5) : file;
  if (base === '' || base === 'index') return 'frontispiece';
  if (base === 'cathedral') return 'nave';
  return base; // e.g., lady-chapel, crypt, helix-totem, etc.
}
function detectSection(structure){
  // 1) explicit <body data-section="...">
  const ds = document.body.dataset.section;
  if (ds) return ds;

  // 2) filename inference
  const file = filenameFromPath();
  const inferred = inferIdFromFilename(file);
  if (structure?.rooms?.some(r => r.id === inferred)) return inferred;

  // 3) match by route (supports subpaths/hashes)
  const path = location.pathname.replace(/\/+$/, ''); // trim trailing slash
  const byExact = structure?.rooms?.find(r => {
    try { return new URL(r.route, location.origin).pathname === path; }
    catch { return false; }
  });
  if (byExact) return byExact.id;

  const byFile = structure?.rooms?.find(r => r.route && r.route.toLowerCase().includes(file));
  if (byFile) return byFile.id;

  const hash = location.hash || '';
  if (hash) {
    const byHash = structure?.rooms?.find(r => r.route && r.route.split('#')[1] && ('#' + r.route.split('#')[1]) === hash);
    if (byHash) return byHash.id;
  }

  // 4) fallback
  return 'frontispiece';
}

// ---------- Style pack hookup
async function applyPack(packId, target){
  if (window.applyStylePack) return window.applyStylePack(target, packId);
  const mod = await import(rel('assets/js/components/style-engine.js'));
  return mod.applyStylePack(target, packId);
}

// ---------- Element overlay (safe if missing)
function startElementOverlay(element){
  import(rel('assets/js/effects/elements.js'))
    .then(m => m.startElementalOverlay && m.startElementalOverlay(element))
    .catch(()=>{});
}

// ---------- ND‑friendly pad (first gesture only)
async function startPad(hz){
  const once = async ()=>{
    document.removeEventListener('pointerdown', once);
    try{
      const Tone = (await import('https://esm.sh/tone@14.8.39')).default;
      await Tone.start();
      const reverb = new Tone.Reverb({ decay:6, wet:0.32 }).toDestination();
      const filt = new Tone.Filter({ frequency: 1200, type:'lowpass' }).connect(reverb);
      const osc = new Tone.Oscillator(hz || 528, 'sine').connect(filt).start();
      window.__cathedralPad = { osc, filt, reverb, Tone };
    }catch(e){}
  };
  document.addEventListener('pointerdown', once, { once:true, passive:true });
}

// ---------- Boot
(async function boot(){
  try{
    const structure = await loadJSON(rel('assets/data/structure.json'));
    const roomId = detectSection(structure);
    const room = structure.rooms.find(r => r.id === roomId);

    if (!room) return; // graceful no-op if not defined

    // Title + style + overlays
    document.title = `${room.title} — Stone Grimoire`;
    await applyPack(room.stylepack, null);
    startElementOverlay(room.element);
    if (room.toneHz) startPad(room.toneHz);

    // Expose for debugging / plaques / labs
    window.CATHEDRAL = { room, structure };
  }catch(e){
    // Silent fail to avoid breaking pages
    console.warn('Cathedral engine init failed:', e);
  }
})();
