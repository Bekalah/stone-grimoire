// Room Plaque (curator UI) -- Circuitum 99
// Purpose: small, elegant control that shows the current room title,
// stylepack id, and tone. It lets you start/stop audio and nudge the tone.
// Depends on ambient hooks exported by cathedral-engine.js.
//
// Usage in an HTML page:
//   <div id="plaque"></div>
//   <script type="module">
//     import { applyRoom } from "../engines/cathedral-engine.js";
//     import { mountRoomPlaque } from "../ui/room-plaque.js";
//     const room = await applyRoom(/* optional roomId */);
//     mountRoomPlaque("#plaque", room);
//   </script>

import { startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

function $(sel, root=document){ return root.querySelector(sel); }
function el(tag, cls){ const n=document.createElement(tag); if(cls) n.className=cls; return n; }

export function mountRoomPlaque(target, room, opts={}){
  const root = (typeof target==="string") ? $(target) : target;
  if(!root) throw new Error("room-plaque: target not found");

  const box = el("div","c99-plaque");
  box.innerHTML = [
    `<div class="c99-plaque__title">${room.title||"Untitled Room"}</div>`,
    `<div class="c99-plaque__meta">`,
    `<span>Style: <b>${room.stylepack||"--"}</b></span>`,
    `<span>· Tone: <b id="c99ToneLbl">${room.toneHz||"--"}</b> Hz</span>`,
    `</div>`,
    `<div class="c99-plaque__controls">`,
      `<button type="button" id="c99Toggle">Quietus / Resume</button>`,
      `<button type="button" id="c99Down">-</button>`,
      `<button type="button" id="c99Up">+</button>`,
      `<input id="c99Tone" type="number" inputmode="numeric" step="1" min="60" max="1200" aria-label="Tone (Hz)" value="${room.toneHz||528}">`,
    `</div>`
  ].join("");

  root.innerHTML = "";
  root.appendChild(box);

  let audioOn=false;
  let hz = Number(room.toneHz||528);

  const lbl = $("#c99ToneLbl", box);
  const num = $("#c99Tone", box);

  $("#c99Toggle", box).addEventListener("click", async ()=>{
    if(!audioOn){ await startTone(hz); audioOn=true; box.classList.add("is-on"); }
    else { stopTone(); audioOn=false; box.classList.remove("is-on"); }
    if (opts.onToggle) opts.onToggle(audioOn);
  });

  $("#c99Up", box).addEventListener("click", ()=>{
    hz = Math.min(1200, Math.round(hz + 6));
    setTone(hz); num.value = String(hz); lbl.textContent = String(hz);
    if (opts.onToneChange) opts.onToneChange(hz);
    box.dispatchEvent(new CustomEvent("c99:tone", { detail:{hz} }));
  });

  $("#c99Down", box).addEventListener("click", ()=>{
    hz = Math.max(60, Math.round(hz - 6));
    setTone(hz); num.value = String(hz); lbl.textContent = String(hz);
    if (opts.onToneChange) opts.onToneChange(hz);
    box.dispatchEvent(new CustomEvent("c99:tone", { detail:{hz} }));
  });

  num.addEventListener("change", ()=>{
    const v = Math.max(60, Math.min(1200, Math.round(Number(num.value)||hz)));
    hz = v; setTone(hz); lbl.textContent = String(hz);
    if (opts.onToneChange) opts.onToneChange(hz);
    box.dispatchEvent(new CustomEvent("c99:tone", { detail:{hz} }));
  });

  return box;
}