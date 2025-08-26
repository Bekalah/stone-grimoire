// Ritual Controls -- Circuitum 99
// Purpose: give every page a clean "Opening/Closing" hygiene:
// BANISH (neutralize visuals + mute), CENTER (528 Hz soft), CONSECRATE (room tone),
// LICENSE (stop + clear UI state). No dogma -- just safe, predictable UX.
//
// Works without needing to import private engine internals; relies only on
// startTone/stopTone/setTone from cathedral-engine. Visual neutralization
// is handled by toggling data attributes your CSS can style.
//
// Usage:
//   <div id="ritual"></div>
//   <script type="module">
//     import { applyRoom } from "../engines/cathedral-engine.js";
//     import { mountRitual } from "../ui/ritual.js";
//     const room = await applyRoom(); // already set stylepack + geometry
//     mountRitual("#ritual", { defaultHz: room.toneHz || 528 });
//   </script>

import { startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

function $(sel, root=document){ return root.querySelector(sel); }
function el(tag, cls){ const n=document.createElement(tag); if(cls) n.className=cls; return n; }

function setState(state){
  // states: "", "banished", "centered", "consecrated"
  const de = document.documentElement;
  de.setAttribute("data-ritual", state||"");
}

export function mountRitual(target, opts={}){
  const root = (typeof target==="string") ? $(target) : target;
  if(!root) throw new Error("ritual: target not found");

  const defaultHz = Number(opts.defaultHz||528);

  const box = el("div","c99-ritual");
  box.innerHTML = [
    `<div class="c99-ritual__row">`,
      `<button id="rBanish" type="button" title="Neutralize visuals & mute">Banish</button>`,
      `<button id="rCenter" type="button" title="Calm 528 Hz">Center</button>`,
      `<button id="rConsecrate" type="button" title="Room tone & glow">Consecrate</button>`,
      `<button id="rLicense" type="button" title="Stop & clear">License</button>`,
    `</div>`
  ].join("");

  root.innerHTML = "";
  root.appendChild(box);

  $("#rBanish", box).addEventListener("click", async ()=>{
    setState("banished");
    stopTone();
    // Optional: drop to an ultra-low level rather than hard mute:
    // await startTone(120); setTone(120); setTimeout(()=>stopTone(), 300);
    box.dispatchEvent(new CustomEvent("c99:ritual", { detail:{state:"banished"} }));
  });

  $("#rCenter", box).addEventListener("click", async ()=>{
    setState("centered");
    await startTone(528); // gentle center
    box.dispatchEvent(new CustomEvent("c99:ritual", { detail:{state:"centered", hz:528} }));
  });

  $("#rConsecrate", box).addEventListener("click", async ()=>{
    const hz = defaultHz || 528;
    setState("consecrated");
    await startTone(hz);
    box.dispatchEvent(new CustomEvent("c99:ritual", { detail:{state:"consecrated", hz} }));
  });

  $("#rLicense", box).addEventListener("click", ()=>{
    setState("");
    stopTone();
    box.dispatchEvent(new CustomEvent("c99:ritual", { detail:{state:"license"} }));
  });

  return box;
}