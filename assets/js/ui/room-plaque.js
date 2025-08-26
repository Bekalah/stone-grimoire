// Room Plaque -- curator voice (title, stylepack, tone controls)
// Works with assets/data/structure.json and cathedral-engine ambient.

import { applyRoom, ensureAudio, startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

export async function mountRoomPlaque(selectorOrNull){
  const container = selectorOrNull
    ? (typeof selectorOrNull === "string" ? document.querySelector(selectorOrNull) : selectorOrNull)
    : null;

  const room = await applyRoom(); // resolve by current route
  const el = document.createElement("div");
  el.className = "controls plaque";
  el.innerHTML = ""
    + "<strong>" + (room.title || "Plaque") + "</strong><br>"
    + "<small>"
    + "Style: " + (room.stylepack || "--")
    + " &middot; Tone: <span data-tone>" + (room.toneHz || "--") + "</span> Hz"
    + "</small><br>"
    + '<button type="button" data-act="toggle">Quietus / Resume</button> '
    + '<button type="button" data-act="down">-</button> '
    + '<button type="button" data-act="up">+</button>';

  (container || document.body).appendChild(el);

  let audioOn = false;
  let currentHz = room.toneHz || 528;

  el.addEventListener("click", async (e)=>{
    const btn = e.target.closest("button[data-act]");
    if(!btn) return;
    const act = btn.getAttribute("data-act");

    if(act === "toggle"){
      if(!audioOn){ await ensureAudio(); await startTone(currentHz); audioOn = true; }
      else { stopTone(); audioOn = false; }
    }
    if(act === "up"){
      currentHz = Math.round(currentHz + 6);
      setTone(currentHz);
      el.querySelector("[data-tone]").textContent = currentHz;
    }
    if(act === "down"){
      currentHz = Math.max(60, Math.round(currentHz - 6));
      setTone(currentHz);
      el.querySelector("[data-tone]").textContent = currentHz;
    }
  });

  return el;
}

// auto-mount if a data flag is present
(function auto(){
  const hook = document.querySelector("[data-c99-autoplaque]");
  if(!hook) return;
  mountRoomPlaque(hook);
})();