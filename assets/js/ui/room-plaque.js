// UI: Room Plaque (museum label + tone controls)
// ASCII-only, iPad-safe. Works with your data/structure + data/plaques.
//
// Imports
import { startTone, stopTone, setTone } from "../engines/ambient-engine.js";

// Helpers ------------------------------------------------------------
async function fetchJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("Fetch failed: " + url);
  return await r.json();
}
function el(tag, attrs = {}, html = "") {
  const n = document.createElement(tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (html) n.innerHTML = html;
  return n;
}
function safe(str, fallback = "--") {
  return (str === 0 || str) ? String(str) : fallback;
}

// Load plaque data (curator label) -----------------------------------
async function loadPlaqueData(roomId) {
  // Try dedicated plaque json first
  const candidates = [
    `./assets/data/plaques/${roomId}.json`,
    `./assets/data/plaques/${roomId.toLowerCase()}.json`
  ];
  for (const u of candidates) {
    try { return await fetchJSON(u); } catch(_) {}
  }
  // Fallback: synthesize a minimal plaque if none found
  return {
    title: "Plaque",
    what: "This room has no dedicated curator plaque yet.",
    why: "Use assets/data/plaques/<roomId>.json to add museum labels.",
    how: "Document intention, technique, lineage, evidence, reflection.",
    lineage: [],
    patrons: []
  };
}

// Public mount -------------------------------------------------------
/**
 * mountRoomPlaque(container, room)
 * container: HTMLElement to mount into
 * room: { id, title, stylepack, toneHz, notes }
 */
export async function mountRoomPlaque(container, room) {
  const wrap = el("section", { class: "c-plaque", "aria-labelledby": "plaque-title" });

  // Title row
  const h = el("h3", { id: "plaque-title", class: "c-plaque__title" },
    safe(room.title, "Room")
  );
  const meta = el("div", { class: "c-plaque__meta" },
    `Style: ${safe(room.stylepack)} &middot; Tone: ${safe(room.toneHz)} Hz`
  );

  // Curator fields
  const plaque = await loadPlaqueData(room.id || "room");
  const grid = el("div", { class: "c-plaque__grid" });
  const mkField = (label, value) => {
    const blk = el("div", { class: "c-plaque__field" });
    blk.appendChild(el("strong", {}, label));
    blk.appendChild(el("p", {}, safe(value)));
    return blk;
  };
  grid.appendChild(mkField("What", plaque.what));
  grid.appendChild(mkField("Why", plaque.why));
  grid.appendChild(mkField("How", plaque.how));
  if (plaque.lineage && plaque.lineage.length) {
    grid.appendChild(mkField("Lineage", plaque.lineage.join("; ")));
  }
  if (plaque.evidence) grid.appendChild(mkField("Evidence", plaque.evidence));
  if (plaque.reflection) grid.appendChild(mkField("Reflection", plaque.reflection));
  if (room.notes) grid.appendChild(mkField("Notes", room.notes));
  if (plaque.patrons && plaque.patrons.length) {
    grid.appendChild(mkField("Patrons", plaque.patrons.join(", ")));
  }

  // Tone controls
  const controls = el("div", { class: "c-plaque__controls" });
  const btnToggle = el("button", { type: "button", class: "btn" }, "Quietus / Resume");
  const btnDown   = el("button", { type: "button", class: "btn" }, "−");
  const btnUp     = el("button", { type: "button", class: "btn" }, "+");

  controls.appendChild(btnToggle);
  controls.appendChild(btnDown);
  controls.appendChild(btnUp);

  // Wire audio
  let audioOn = false;
  let currentHz = Number(room.toneHz || 528);
  btnToggle.addEventListener("click", async () => {
    if (!audioOn) { await startTone(currentHz); audioOn = true; }
    else { stopTone(); audioOn = false; }
  });
  btnUp.addEventListener("click", () => {
    currentHz = Math.round(currentHz + 6);
    setTone(currentHz);
    meta.innerHTML = `Style: ${safe(room.stylepack)} &middot; Tone: ${safe(currentHz)} Hz`;
  });
  btnDown.addEventListener("click", () => {
    currentHz = Math.max(60, Math.round(currentHz - 6));
    setTone(currentHz);
    meta.innerHTML = `Style: ${safe(room.stylepack)} &middot; Tone: ${safe(currentHz)} Hz`;
  });

  // Assemble
  wrap.appendChild(h);
  wrap.appendChild(meta);
  wrap.appendChild(grid);
  wrap.appendChild(controls);
  container.appendChild(wrap);

  // Return a tiny API if you need to refresh tone/style live
  return {
    setStylepackName(name) {
      room.stylepack = name;
      meta.innerHTML = `Style: ${safe(room.stylepack)} &middot; Tone: ${safe(currentHz)} Hz`;
    },
    setToneHz(hz) {
      currentHz = Number(hz || currentHz);
      setTone(currentHz);
      meta.innerHTML = `Style: ${safe(room.stylepack)} &middot; Tone: ${safe(currentHz)} Hz`;
    }
  };
}

// Back-compat shim: if something imports "room-plague.js", re-export here.
export default { mountRoomPlaque };