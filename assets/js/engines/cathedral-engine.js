// Cathedral Engine -- Circuitum 99
// ES module, iPad-safe (ASCII only). No autoplay audio.
// Looks up JSON under ./assets/data. (Legacy fallback: ./main/data)

//// helpers /////////////////////////////////////////////////////////////////
async function firstOk(urls){
  for(const u of urls){
    try{ const r = await fetch(u, {cache:"no-store"}); if(r.ok) return await r.json(); }catch(_){}
  }
  throw new Error("No data source reachable: " + urls.join(" | "));
}
const byId = (list, id) => list.find(x => x.id === id);

const DATA_ROOTS = [
  "./assets/data",  // canonical
  "./main/data"     // legacy fallback (if older pages still reference it)
];

async function loadJSON(relPath){
  const tries = DATA_ROOTS.map(root => `${root}/${relPath}`);
  return await firstOk(tries);
}

//// data loaders ////////////////////////////////////////////////////////////
async function loadStylepacks(){
  // NOTE: your repo stores this at assets/data/stylepacks.json
  return await loadJSON("stylepacks.json");
}
async function loadStructure(){
  // NOTE: assets/data/structure.json
  return await loadJSON("structure.json");
}
async function loadGeometryIndex(){
  // NOTE: assets/data/geometry/geometry_index.json
  return await loadJSON("geometry/geometry_index.json");
}

//// stylepacks //////////////////////////////////////////////////////////////
function applyStylepack(packId, packs, doc){
  doc.documentElement.setAttribute("data-stylepack", packId || "");
  const pack = packs && packs.packs && packs.packs.find(p => p.id === packId);
  if(!pack || !pack.palette) return;
  const rs = getComputedStyle(doc.documentElement);
  const a  = pack.palette[2] || rs.getPropertyValue("--accent");
  const a2 = pack.palette[1] || rs.getPropertyValue("--accent-2");
  doc.documentElement.style.setProperty("--accent", a);
  doc.documentElement.style.setProperty("--accent-2", a2);
}

//// room resolution /////////////////////////////////////////////////////////
function resolveRoom(struct){
  const path = (location.pathname.split("/").pop() || "index.html");
  const hash = location.hash || "";
  const exact = struct.rooms.find(r => r.route === (path + hash));
  return exact || struct.rooms.find(r => r.route === path) || struct.rooms[0];
}

//// geometry mount (subtle scaffold) ////////////////////////////////////////
function resolveGeometryPath(geomId, geomIx){
  if(!geomId || !geomIx || !geomIx.plates) return null;
  const hit = byId(geomIx.plates, geomId);
  return hit ? hit.file : null; // file should be a relative path: assets/resources/... or similar
}
async function mountGeometry(path){
  if(!path) return;
  const frame = document.createElement("div");
  frame.className = "geometry-frame";
  const img = document.createElement("img");
  img.src = path;
  img.alt = "Sacred Geometry Scaffold";
  img.decoding = "async";
  img.loading  = "lazy";
  frame.appendChild(img);
  document.body.appendChild(frame);
}

//// ambient audio (manual start, ND-safe) ///////////////////////////////////
let AC=null, nodes=null, irLoaded=false;
const defaultHz=528, fadeMs=800;

async function ensureAudio(){
  if(AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();

  const osc=AC.createOscillator();
  const gain=AC.createGain();
  const master=AC.createGain();
  const low=AC.createBiquadFilter();   low.type="lowshelf";  low.frequency.value=80;   low.gain.value=-3;
  const peak=AC.createBiquadFilter();  peak.type="peaking";  peak.frequency.value=2500; peak.Q.value=.9; peak.gain.value=-4;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-28; comp.knee.value=24; comp.ratio.value=2.2; comp.attack.value=.015; comp.release.value=.25;
  const convolver=AC.createConvolver();
  const limit=AC.createDynamicsCompressor(); limit.threshold.value=-4; limit.knee.value=0; limit.ratio.value=20; limit.attack.value=.003; limit.release.value=.15;

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
  convolver.connect(limit);
  limit.connect(master);
  master.connect(AC.destination);

  nodes={osc,gain,master,convolver};
  return AC;
}
async function loadIR(){
  if(!AC) await ensureAudio();
  const irCandidates = [
    "./assets/audio/ir/cathedral_small.wav",
    "./audio/ir/cathedral_small.wav" // legacy
  ];
  for(const url of irCandidates){
    try{
      const buf = await (await fetch(url,{cache:"force-cache"})).arrayBuffer();
      await new Promise(res => AC.decodeAudioData(buf,(dec)=>{ nodes.convolver.buffer=dec; res(); }));
      irLoaded=true; return;
    }catch(_){}
  }
  irLoaded=false;
}
function fadeTo(target,ms=fadeMs){
  if(!nodes) return;
  const g = nodes.gain.gain, now = AC.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(target, now + ms/1000);
}
async function startTone(hz=defaultHz){
  if(!AC) await ensureAudio();
  if(!irLoaded) await loadIR();
  nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.25);
  fadeTo(0.08);
}
function stopTone(){ if(!AC) return; fadeTo(0.0001); }
function setTone(hz=defaultHz){ if(!AC) return; nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime+.12); }

//// minimal overlay (glass) /////////////////////////////////////////////////
function mountOverlay(){
  const ov = document.createElement("div");
  ov.className = "overlay-vitrail";
  ov.setAttribute("aria-hidden","true");
  document.body.appendChild(ov);
  return ov;
}

//// public hook: apply current room or by id //////////////////////////////////
export async function applyRoom(roomId){
  const struct = await loadStructure();
  const packs  = await loadStylepacks();
  const geomIx = await loadGeometryIndex();
  const room   = roomId ? byId(struct.rooms, roomId) : resolveRoom(struct);

  applyStylepack(room.stylepack, packs, document);

  const geomPath = resolveGeometryPath(room.geometry, geomIx);
  if(geomPath) await mountGeometry(geomPath);

  mountOverlay();
  return room;
}

// expose ambient if other modules need it
export { startTone, stopTone, setTone, ensureAudio };

//// auto-boot when included directly /////////////////////////////////////////
(async function boot(){
  try{
    const struct = await loadStructure();
    const packs  = await loadStylepacks();
    const geomIx = await loadGeometryIndex();
    const room   = resolveRoom(struct);

    applyStylepack(room.stylepack, packs, document);

    const geomPath = resolveGeometryPath(room.geometry, geomIx);
    if(geomPath) await mountGeometry(geomPath);

    mountOverlay();
  }catch(e){
    console.error("Cathedral boot error:", e);
  }
})();