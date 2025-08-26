// Room Plaque UI -- Cathedral of Circuits (Codex 144:99)
// Purpose: mounts a curator plaque for the current room,
// pulls an optional plaque JSON, and wires tone/style controls.
//
// Dependencies: engines/cathedral-engine.js, data under assets/data/*
// Safe for iPad Safari, no autoplay, ASCII only.

import { applyRoom, startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

// Small helpers
async function firstOk(urls){
  for (const u of urls){
    try { const r = await fetch(u, { cache: "no-store" }); if (r.ok) return await r.json(); } catch(_) {}
  }
  return null;
}
async function loadPlaque(roomId){
  const tries = [
    `./assets/data/plaques/${roomId}.json`,
    `./assets/data/plaques/${roomId.toLowerCase()}.json`
  ];
  return await firstOk(tries);
}

// Minimal DOM builder
function el(tag, attrs={}, html=""){
  const n = document.createElement(tag);
  for (const k in attrs){ if (attrs[k] != null) n.setAttribute(k, attrs[k]); }
  if (html) n.innerHTML = html;
  return n;
}

// Mount plaque container and content
export async function mountRoomPlaque(room){
  // If a page passed only an id, resolve via engine
  if (typeof room === "string") room = await applyRoom(room);

  // Container
  const wrap = el("section", { class: "c99-plaque", role: "region", "aria-label": "Curator Plaque" });

  // Title line
  const h = el("header", { class: "c99-plaque__head" });
  h.appendChild(el("h2", {}, room.title || "Room"));
  h.appendChild(el("p", { class: "c99-plaque__sub" },
    `Style: ${room.stylepack || "--"} · Tone: ${room.toneHz || "--"} Hz`
  ));
  wrap.appendChild(h);

  // Controls row
  const controls = el("div", { class: "c99-plaque__controls" });
  controls.appendChild(el("button", { type: "button", id: "c99_audio_toggle" }, "Quietus / Resume"));
  controls.appendChild(el("button", { type: "button", id: "c99_tone_down", "aria-label": "Tone down" }, "−"));
  controls.appendChild(el("button", { type: "button", id: "c99_tone_up", "aria-label": "Tone up" }, "+"));
  wrap.appendChild(controls);

  // Text blocks (from plaque JSON if available)
  const body = el("div", { class: "c99-plaque__body" });
  const data = await loadPlaque(room.id || "room");
  if (data){
    // data fields: title?, what, why, how, lineage, safety, patrons
    if (data.what)     body.appendChild(el("p", {}, `<strong>What:</strong> ${data.what}`));
    if (data.why)      body.appendChild(el("p", {}, `<strong>Why:</strong> ${data.why}`));
    if (data.how)      body.appendChild(el("p", {}, `<strong>How:</strong> ${data.how}`));
    if (data.lineage)  body.appendChild(el("p", {}, `<strong>Lineage:</strong> ${data.lineage}`));
    if (data.safety)   body.appendChild(el("p", {}, `<strong>Safety:</strong> ${data.safety}`));
    if (data.patrons)  body.appendChild(el("p", {}, `<strong>Patrons:</strong> ${data.patrons}`));
  } else {
    // Graceful fallback if plaque JSON not present yet
    body.appendChild(el("p", {}, "This folio is staged. Add a curator plaque JSON under assets/data/plaques/<roomId>.json to populate these notes (What / Why / How / Lineage / Safety / Patrons)."));
  }
  wrap.appendChild(body);

  // Mount once
  document.body.appendChild(wrap);

  // Wire controls (ND-safe: no autoplay)
  let audioOn = false;
  let currentHz = room.toneHz || 528;

  document.getElementById("c99_audio_toggle").addEventListener("click", async ()=>{
    if (!audioOn){ await startTone(currentHz); audioOn = true; }
    else { stopTone(); audioOn = false; }
  });
  document.getElementById("c99_tone_up").addEventListener("click", ()=>{
    currentHz = Math.round(currentHz + 6);
    setTone(currentHz);
  });
  document.getElementById("c99_tone_down").addEventListener("click", ()=>{
    currentHz = Math.max(60, Math.round(currentHz - 6));
    setTone(currentHz);
  });

  return wrap;
}

// Optional: auto-mount when script is included directly with type="module"
(async function auto(){
  // Only auto if a marker is present to avoid double UI on some pages
  if (document.querySelector("[data-c99-autoplaque]")){
    try {
      const room = await applyRoom(); // resolves current route/hash
      await mountRoomPlaque(room);
    } catch(e){ console.error("room-plaque auto error:", e); }
  }
})();