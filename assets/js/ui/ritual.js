// Ritual UI -- Cathedral of Circuits
// Purpose: small, explicit "Opening / Center / Closing" helpers that match your
// ND-safe rhythm (banish, center, license to depart), without overwriting engines.
//
// Dependencies: engines/cathedral-engine.js, assets/data/style_packs/stylepacks.json
// Styling hint: define CSS for [data-ritual="banish|center|work|depart"] to tint gently.

import { applyRoom, startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

// Stylepack toggles use the document data attribute already set by the engine.
// For banish/center we just set a marker data-ritual to let CSS soften the scene.

function setRitualState(state){
  document.documentElement.setAttribute("data-ritual", state);
}

export async function opening(roomIdOptional){
  // Prep the space; do not start audio yet
  setRitualState("center");
  if (roomIdOptional) await applyRoom(roomIdOptional);
  // Optional: gentle hint tone on first tap only (leave to user action)
  // User presses a "Begin" button to start the tone, preserving ND-safety.
}

export async function beginWork(targetHz){
  // User consented: start tone and enter work state
  setRitualState("work");
  if (typeof targetHz === "number"){ await startTone(targetHz); }
  else { await startTone(); }
}

export function centerBreath(){
  // Keep session running but soften; useful between segments
  setRitualState("center");
  setTone(432); // mild centering suggestion; safe and gentle
}

export function banish(){
  // Visual and audio hush
  setRitualState("banish");
  stopTone();
}

export function licenseToDepart(){
  // Clean close; return UI to neutral_white if that stylepack exists
  setRitualState("depart");
  stopTone();
  // Page remains styled by current room; your CSS can fade overlays here.
}

// Minimal, accessible buttons builder (optional use)
export function mountRitualBar(opts={}){
  const bar = document.createElement("nav");
  bar.className = "c99-ritualbar";
  bar.setAttribute("role","navigation");
  bar.innerHTML =
    '<button type="button" id="c99_open">Open</button> ' +
    '<button type="button" id="c99_begin">Begin</button> ' +
    '<button type="button" id="c99_center">Center</button> ' +
    '<button type="button" id="c99_banish">Banish</button> ' +
    '<button type="button" id="c99_depart">Depart</button>';
  document.body.appendChild(bar);

  const hz = typeof opts.hz === "number" ? opts.hz : undefined;
  document.getElementById("c99_open").addEventListener("click", ()=> opening(opts.roomId));
  document.getElementById("c99_begin").addEventListener("click", ()=> beginWork(hz));
  document.getElementById("c99_center").addEventListener("click", centerBreath);
  document.getElementById("c99_banish").addEventListener("click", banish);
  document.getElementById("c99_depart").addEventListener("click", licenseToDepart);

  return bar;
}

// Auto-mount if explicitly requested via data attribute
(function auto(){
  const host = document.querySelector("[data-c99-ritualbar]");
  if (!host) return;
  const hzAttr = host.getAttribute("data-tone");
  const roomId = host.getAttribute("data-room");
  const hz = hzAttr ? parseFloat(hzAttr) : undefined;
  mountRitualBar({ hz, roomId });
})();