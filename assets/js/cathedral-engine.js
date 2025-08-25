<!-- USE AS: <script type="module" src="./assets/js/cathedral-engine.js"></script> -->
<script type="module">
/*
  Cathedral Engine -- path-robust, iPad-safe
  - Resolves assets/data/ no matter if you’re at /, /main/, or /main/05_ateliers/
  - Applies stylepack accents from stylepacks.json
  - Mounts an overlay and a simple room plaque
  - Controls ambient tone via ambient-engine.js if present
*/

const CANDIDATE_BASES = [
  "./assets/data/",
  "../assets/data/",
  "../../assets/data/",
  "../../../assets/data/"
];

async function fetchFirst(paths, file){
  for (const base of paths){
    try{
      const url = base + file;
      const r = await fetch(url, { cache: "no-cache" });
      if (r.ok) return await r.json();
    }catch(_){}
  }
  throw new Error("Could not load "+file+" from any known path.");
}

async function loadStructure(){ return fetchFirst(CANDIDATE_BASES, "structure.json"); }
async function loadStylepacks(){ return fetchFirst(CANDIDATE_BASES, "stylepacks.json"); }

function resolveRoom(struct){
  const path = location.pathname.split("/").pop() || "index.html";
  const hash = location.hash || "";
  const exact = struct.rooms.find(r => r.route === (path + hash));
  if (exact) return exact;
  return struct.rooms.find(r => r.route === path) || struct.rooms[0];
}

function applyStylepack(doc, packs, packId){
  doc.documentElement.setAttribute("data-stylepack", packId);
  const pack = packs.packs.find(p => p.id === packId);
  if (!pack || !pack.palette) return;
  const rs = getComputedStyle(doc.documentElement);
  doc.documentElement.style.setProperty("--accent", pack.palette[2] || rs.getPropertyValue("--accent"));
  doc.documentElement.style.setProperty("--accent-2", pack.palette[1] || rs.getPropertyValue("--accent-2"));
}

function mountOverlay(){
  const ov = document.createElement("div");
  ov.className = "overlay-vitrail";
  document.body.appendChild(ov);
  return ov;
}

function mountPlaque({title,glyph,toneHz,stylepack,notes}){
  const el = document.createElement("div");
  el.className = "controls";
  el.innerHTML = `
    <strong>${glyph||"✶"} ${title||"Plaque"}</strong><br>
    <small>Style: ${stylepack||"--"} · Tone: ${toneHz||"--"} Hz</small><br>
    <button id="btnToggle">Quietus / Resume</button>
    <button id="btnToneDown">−</button>
    <button id="btnToneUp">+</button>
  `;
  document.body.appendChild(el);
  return el;
}

// Optional ambient engine (will no-op if not present)
let AE = null;
async function ensureAmbient(){
  if (AE) return AE;
  try{
    const modPaths = [
      "./assets/js/ambient-engine.js",
      "../assets/js/ambient-engine.js",
      "../../assets/js/ambient-engine.js",
      "../../../assets/js/ambient-engine.js"
    ];
    for (const p of modPaths){
      try { AE = await import(p); break; } catch(_){}
    }
  }catch(_){}
  return AE;
}

// Public helper for folio pages to tell the engine which room they are
export async function applyRoom(roomId){
  const [struct, packs] = await Promise.all([loadStructure(), loadStylepacks()]);
  const room = struct.rooms.find(r => r.id === roomId) || resolveRoom(struct);
  applyStylepack(document, packs, room.stylepack);
  mountOverlay();

  const plaque = mountPlaque({
    title: room.title, glyph: "𓂀", toneHz: room.toneHz,
    stylepack: room.stylepack, notes: room.notes
  });

  let audioOn=false, currentHz = room.toneHz || 528;
  const A = await ensureAmbient();

  plaque.querySelector("#btnToggle").addEventListener("click", async ()=>{
    if (!A) return; // ambient disabled gracefully
    if (!audioOn){ await A.ensureAudio(); await A.startTone(currentHz); audioOn=true; }
    else { A.stopTone(); audioOn=false; }
  });
  plaque.querySelector("#btnToneUp").addEventListener("click", ()=>{
    if (!A) return; currentHz = Math.round((currentHz+6)); A.setTone(currentHz);
  });
  plaque.querySelector("#btnToneDown").addEventListener("click", ()=>{
    if (!A) return; currentHz = Math.max(60, Math.round((currentHz-6))); A.setTone(currentHz);
  });
}

// Auto‑boot on pages that don’t call applyRoom() explicitly
(async function boot(){
  // If another script calls applyRoom() later, this harmlessly preps style for current page
  try{
    const [struct, packs] = await Promise.all([loadStructure(), loadStylepacks()]);
    const room = resolveRoom(struct);
    applyStylepack(document, packs, room.stylepack);
    mountOverlay();
  }catch(e){
    // Non-fatal for static pages; leave console note for debugging
    console.warn("[cathedral-engine] boot warning:", e.message);
  }
})();
</script>