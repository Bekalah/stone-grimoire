<!-- File: assets/js/engines/cathedral-engine.js -->
<script type="module">
// Cathedral Engine -- circuitum99 (unified data root = assets/data, iPad-safe)
// - Reads: assets/data/structure.json, assets/data/stylepacks.json,
//          assets/data/geometry/geometry_index.json
// - Provides: stylepack apply, geometry mount, ND-safe ambient (manual start).

// helpers
async function firstOk(urls){
  for (const u of urls){
    try { const r = await fetch(u, { cache: "no-store" }); if (r.ok) return await r.json(); } catch(_) {}
  }
  throw new Error("No data source reachable: " + urls.join(" | "));
}
const byId = (list, id) => list.find(x => x.id === id);

// Data roots (canonical → legacy fallback if you still have main/data)
const DATA_ROOTS = [
  "./assets/data",
  "./main/data"
];
async function loadJSON(relPath){
  const tries = DATA_ROOTS.map(root => `${root}/${relPath}`);
  return await firstOk(tries);
}

// stylepacks
async function loadStylepacks(){ return await loadJSON("stylepacks.json"); }
function applyStylepack(packId, packs, doc){
  doc.documentElement.setAttribute("data-stylepack", packId || "");
  const pack = packs && packs.packs && packs.packs.find(p => p.id === packId);
  if (!pack || !pack.palette) return;
  const rs = getComputedStyle(doc.documentElement);
  doc.documentElement.style.setProperty("--accent",   pack.palette[2] || rs.getPropertyValue("--accent"));
  doc.documentElement.style.setProperty("--accent-2", pack.palette[1] || rs.getPropertyValue("--accent-2"));
}

// structure
async function loadStructure(){ return await loadJSON("structure.json"); }
function resolveRoom(struct){
  const path = (location.pathname.split("/").pop() || "index.html");
  const hash = location.hash || "";
  const exact = struct.rooms.find(r => (r.route === (path + hash)));
  return exact || struct.rooms.find(r => r.route === path) || struct.rooms[0];
}

// geometry
async function loadGeometryIndex(){ return await loadJSON("geometry/geometry_index.json"); }
function resolveGeometryPath(geomId, geomIndex){
  if (!geomId || !geomIndex || !geomIndex.plates) return null;
  const hit = byId(geomIndex.plates, geomId);
  return hit ? hit.file : null;
}
async function mountGeometry(path){
  if (!path) return;
  const frame = document.createElement("div");
  frame.className = "geometry-frame";
  const img = document.createElement("img");
  img.src = path;
  img.alt = "Sacred Geometry Scaffold";
  frame.appendChild(img);
  document.body.appendChild(frame);
}

// ambient audio (manual start; ND-safe chain)
let AC=null, nodes=null, irLoaded=false;
const defaultHz=528, fadeMs=800;

async function ensureAudio(){
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();

  const osc=AC.createOscillator();
  const gain=AC.createGain();
  const master=AC.createGain();
  const low=AC.createBiquadFilter();  low.type="lowshelf";  low.frequency.value=80;   low.gain.value=-3;
  const peak=AC.createBiquadFilter(); peak.type="peaking";  peak.frequency.value=2500; peak.Q.value=.9; peak.gain.value=-4;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-28; comp.knee.value=24; comp.ratio.value=2.2; comp.attack.value=.015; comp.release.value=.25;
  const convolver=AC.createConvolver();
  const limiter=AC.createDynamicsCompressor(); limiter.threshold.value=-4; limiter.knee.value=0; limiter.ratio.value=20; limiter.attack.value=.003; limiter.release.value=.15;

  gain.gain.value=0.0001;
  master.gain.value=.25;
  osc.type="sine";
  osc.frequency.value=defaultHz;
  osc.start();

  osc.connect(gain);
  gain.connect(low);
  low.connect(peak);
  peak.connect(comp);
  comp.connect(convolver);
  convolver.connect(limiter);
  limiter.connect(master);
  master.connect(AC.destination);

  nodes={osc,gain,master,convolver};
  return AC;
}
async function loadIR(){
  if(!AC) await ensureAudio();
  const irCandidates = [
    "./assets/audio/ir/cathedral_small.wav",
    "./audio/ir/cathedral_small.wav"
  ];
  for (const url of irCandidates){
    try{
      const buf = await (await fetch(url,{cache:"force-cache"})).arrayBuffer();
      await new Promise(res => AC.decodeAudioData(buf,(dec)=>{ nodes.convolver.buffer=dec; res(); }));
      irLoaded=true; return;
    } catch(_){}
  }
  irLoaded=false;
}
function fadeTo(target,ms=fadeMs){
  if(!nodes) return;
  const g=nodes.gain.gain, now=AC.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value,now);
  g.linearRampToValueAtTime(target, now+ms/1000);
}
async function startTone(hz=defaultHz){
  if(!AC) await ensureAudio();
  if(!irLoaded) await loadIR();
  nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.25);
  fadeTo(0.08);
}
function stopTone(){ if(!AC) return; fadeTo(0.0001); }
function setTone(hz=defaultHz){ if(!AC) return; nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.12); }

// minimal curator plaque
function mountPlaque(room){
  const el=document.createElement("div");
  el.className="controls";
  el.innerHTML =
    "<strong>"+(room.title||"Plaque")+"</strong><br>"
    + "<small>Style: "+(room.stylepack||"--")+" · Tone: "+(room.toneHz||"--")+" Hz</small><br>"
    + '<button id="btnToggle" type="button">Quietus / Resume</button> '
    + '<button id="btnToneDown" type="button">-</button> '
    + '<button id="btnToneUp" type="button">+</button>';
  document.body.appendChild(el);

  let audioOn=false, currentHz=room.toneHz||defaultHz;
  el.querySelector("#btnToggle").addEventListener("click", async ()=>{
    if(!audioOn){ await ensureAudio(); await startTone(currentHz); audioOn=true; }
    else { stopTone(); audioOn=false; }
  });
  el.querySelector("#btnToneUp").addEventListener("click", ()=>{ currentHz = Math.round(currentHz+6); setTone(currentHz); });
  el.querySelector("#btnToneDown").addEventListener("click", ()=>{ currentHz = Math.max(60, Math.round(currentHz-6)); setTone(currentHz); });
  return el;
}

// public hook for other pages
export async function applyRoom(roomId){
  const struct = await loadStructure();
  const packs  = await loadStylepacks();
  const geomIx = await loadGeometryIndex();
  const room   = roomId ? byId(struct.rooms, roomId) : resolveRoom(struct);

  applyStylepack(room.stylepack, packs, document);
  const geomPath = resolveGeometryPath(room.geometry, geomIx);
  if (geomPath) await mountGeometry(geomPath);

  const ov = document.createElement("div"); ov.className="overlay-vitrail"; document.body.appendChild(ov);
  mountPlaque(room);
  return room;
}
export { startTone, stopTone, setTone };

// auto-boot if included directly
(async function boot(){
  try{
    const struct = await loadStructure();
    const packs  = await loadStylepacks();
    const geomIx = await loadGeometryIndex();
    const room   = resolveRoom(struct);

    applyStylepack(room.stylepack, packs, document);
    const geomPath = resolveGeometryPath(room.geometry, geomIx);
    if (geomPath) await mountGeometry(geomPath);

    const ov = document.createElement("div"); ov.className="overlay-vitrail"; document.body.appendChild(ov);
    mountPlaque(room);
  } catch(e){
    console.error("Cathedral boot error:", e);
  }
})();
</script>