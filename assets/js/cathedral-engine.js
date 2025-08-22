// Cathedral engine: reads structure.json, styles the room, starts elemental overlay and gentle tone.
async function loadJSON(p){ const r = await fetch(p); return r.json(); }
function rel(path){ const d = location.pathname.split('/').length - 2; return ('../'.repeat(Math.max(0,d))) + path; }

function detectSection(){
  const ds = document.body.dataset.section; if (ds) return ds;
  const p = (location.pathname.split('/').pop() || 'index.html').replace('.html','');
  return p === '' ? 'frontispiece' : p;
}

async function applyPack(packId, target){
  if (window.applyStylePack) return window.applyStylePack(target, packId);
  const mod = await import(rel('assets/js/components/style-engine.js'));
  return mod.applyStylePack(target, packId);
}

function startElementOverlay(element){
  import(rel('assets/js/effects/elements.js')).then(m=>m.startElementalOverlay(element)).catch(()=>{});
}

async function startPad(hz){
  const once = async ()=>{
    document.removeEventListener('pointerdown', once);
    try{
      const Tone = (await import('https://esm.sh/tone@14.8.39')).default;
      await Tone.start();
      const reverb = new Tone.Reverb({ decay:6, wet:0.32 }).toDestination();
      const filt = new Tone.Filter({ frequency: 1200, type:'lowpass' }).connect(reverb);
      const osc = new Tone.Oscillator(hz, 'sine').connect(filt).start();
      window.__cathedralPad = { osc, filt, reverb, Tone };
    }catch(e){}
  };
  document.addEventListener('pointerdown', once, { once:true, passive:true });
}

(async function boot(){
  const id = detectSection();
  const data = await loadJSON(rel('assets/data/structure.json'));
  const room = data.rooms.find(r => r.id===id) || null;
  if (!room) return;

  document.title = `${room.title} — Stone Grimoire`;
  await applyPack(null, room.stylepack);
  startElementOverlay(room.element);
  if (room.toneHz) startPad(room.toneHz);
  window.CATHEDRAL = { room };
})();
