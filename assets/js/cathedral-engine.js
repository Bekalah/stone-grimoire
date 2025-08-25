
<!-- File: assets/js/cathedral-engine.js -->
<script type="module">
// Cathedral Engine (data-root autodetect, iPad-safe)

// --- helpers ---------------------------------------------------------------
async function firstOk(urls){
  for (const u of urls){
    try {
      const r = await fetch(u, { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch(_) {}
  }
  throw new Error("No data source reachable: " + urls.join(" | "));
}
function byId(list, id){ return list.find(x => x.id === id); }

// --- dynamic DATA_ROOT: prefer /main/data, fallback to /assets/data --------
const CANDIDATE_ROOTS = [
  "./main/data",     // canonical
  "./assets/data"    // backward‑compat
];

async function loadJSON(relPath){
  const tries = CANDIDATE_ROOTS.map(root => `${root}/${relPath}`);
  return await firstOk(tries);
}

// --- style packs -----------------------------------------------------------
export async function loadStylepacks(){
  return await loadJSON("style_packs/stylepacks.json");
}
export function applyStylepack(doc, packsOrId, idMaybe){
  const isString = typeof packsOrId === "string";
  const packId = isString ? packsOrId : idMaybe;
  const packs  = isString ? null : packsOrId;
  doc.documentElement.setAttribute("data-stylepack", packId);
  if (!packs) return;
  const pack = packs.packs.find(p => p.id === packId);
  if (pack && pack.palette){
    const rs = getComputedStyle(doc.documentElement);
    doc.documentElement.style.setProperty("--accent",  pack.palette[2] || rs.getPropertyValue("--accent"));
    doc.documentElement.style.setProperty("--accent-2",pack.palette[1] || rs.getPropertyValue("--accent-2"));
  }
}

// --- ambient (lazy) --------------------------------------------------------
let AC=null, nodes=null, irLoaded=false;
const defaultHz=528, fadeMs=800;
async function ensureAudio(){
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();
  const osc=AC.createOscillator(), gain=AC.createGain(), master=AC.createGain();
  const low=AC.createBiquadFilter(); low.type="lowshelf"; low.frequency.value=80; low.gain.value=-3;
  const peak=AC.createBiquadFilter(); peak.type="peaking"; peak.frequency.value=2500; peak.Q.value=.9; peak.gain.value=-4;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-28; comp.knee.value=24; comp.ratio.value=2.2; comp.attack.value=.015; comp.release.value=.25;
  const convolver=AC.createConvolver();
  const limiter=AC.createDynamicsCompressor(); limiter.threshold.value=-4; limiter.knee.value=0; limiter.ratio.value=20; limiter.attack.value=.003; limiter.release.value=.15;
  gain.gain.value=0.0001; master.gain.value=.25; osc.type="sine"; osc.frequency.value=defaultHz; osc.start();
  osc.connect(gain); gain.connect(low); low.connect(peak); peak.connect(comp); comp.connect(convolver); convolver.connect(limiter); limiter.connect(master); master.connect(AC.destination);
  nodes={osc,gain,master,convolver}; return AC;
}
async function loadIR(){
  if(!AC) await ensureAudio();
  try{
    const urlCandidates = CANDIDATE_ROOTS.map(r => r.replace("/data","/audio/ir/cathedral_small.wav"));
    for (const u of urlCandidates){
      const buf = await (await fetch(u,{cache:"force-cache"})).arrayBuffer();
      await new Promise(res => AC.decodeAudioData(buf,(dec)=>{ nodes.convolver.buffer=dec; res(); }));
      irLoaded=true; break;
    }
  } catch{ irLoaded=false; }
}
function fadeTo(target,ms=fadeMs){
  const g=nodes.gain.gain, now=AC.currentTime; g.cancelScheduledValues(now);
  g.setValueAtTime(g.value,now); g.linearRampToValueAtTime(target, now+ms/1000);
}
export async function startTone(hz=defaultHz){
  if(!AC) await ensureAudio(); if(!irLoaded) await loadIR();
  nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.25); fadeTo(0.08);
}
export function stopTone(){ if(!AC) return; fadeTo(0.0001); }
export function setTone(hz=defaultHz){ if(!AC) return; nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.12); }

// --- structure -------------------------------------------------------------
async function loadStructure(){ return await loadJSON("structure/structure.json"); }
function resolveRoom(struct){
  const path=(location.pathname.split("/").pop()||"index.html");
  const hash=location.hash||"";
  const exact = struct.rooms.find(r => (r.route === (path+hash)));
  if(exact) return exact;
  return struct.rooms.find(r=>r.route===path) || struct.rooms[0];
}

function mountOverlay(){
  const ov=document.createElement("div");
  ov.className="overlay-vitrail";
  document.body.appendChild(ov);
  return ov;
}

function mountPlaque({title,toneHz,stylepack,notes}){
  const el=document.createElement("div"); el.className="controls";
  el.innerHTML = ''
    + '<strong>'+(title||"Plaque")+'</strong><br>'
    + '<small>Style: '+(stylepack||"--")+' · Tone: '+(toneHz||"--")+' Hz</small><br>'
    + '<button id="btnToggle">Quietus / Resume</button> '
    + '<button id="btnToneDown">-</button> '
    + '<button id="btnToneUp">+</button>';
  document.body.appendChild(el);
  return el;
}

// expose a light hook so other pages can mark a room by id
export async function applyRoom(roomId){
  const struct = await loadStructure();
  const packs = await loadStylepacks();
  const room  = byId(struct.rooms, roomId) || resolveRoom(struct);
  applyStylepack(document, packs, room.stylepack);
  return room;
}

// --- boot ---------------------------------------------------------------
(async function boot(){
  try{
    const struct=await loadStructure();
    const packs =await loadStylepacks();
    const room  = resolveRoom(struct);
    applyStylepack(document, packs, room.stylepack);
    mountOverlay();
    const plaque = mountPlaque({
      title: room.title, toneHz: room.toneHz, stylepack: room.stylepack, notes: room.notes
    });
    let audioOn=false, currentHz=room.toneHz||defaultHz;
    plaque.querySelector("#btnToggle").addEventListener("click", async ()=>{
      if(!audioOn){ await ensureAudio(); await startTone(currentHz); audioOn=true; } else { stopTone(); audioOn=false; }
    });
    plaque.querySelector("#btnToneUp").addEventListener("click", ()=>{ currentHz = Math.round(currentHz+6); setTone(currentHz); });
    plaque.querySelector("#btnToneDown").addEventListener("click", ()=>{ currentHz = Math.max(60, Math.round(currentHz-6)); setTone(currentHz); });
  } catch(e){
    console.error("Cathedral boot error:", e);
  }
})();
</script>