// Ritual Bar -- Banish / Center / Depart
// ES module, ASCII only. Hooks into cathedral engine.

import { ensureAudio, startTone, stopTone, setTone } from "../engines/cathedral-engine.js";

const NEUTRAL_PACK = "neutral_white"; // make sure it exists in stylepacks.json

// lightweight stylepack setter (no fetch; reuse attribute)
function setStylepackId(id){
  document.documentElement.setAttribute("data-stylepack", id || "");
}

// soft desaturate overlay
function setScreenTint(hsla){
  let tint = document.getElementById("hourTint");
  if(!tint){
    tint = document.createElement("div");
    tint.id = "hourTint";
    tint.style.position = "fixed";
    tint.style.top = "0"; tint.style.left = "0";
    tint.style.width = "100%"; tint.style.height = "100%";
    tint.style.zIndex = "-2";
    tint.style.pointerEvents = "none";
    tint.style.mixBlendMode = "overlay";
    document.body.appendChild(tint);
  }
  tint.style.background = hsla;
}

export function mountRitualBar(opts={}){
  const defaults = { roomId:null, hz:528 };
  const o = Object.assign({}, defaults, opts);

  const wrap = document.createElement("div");
  wrap.id = "ritual-bar";
  wrap.innerHTML = ''
    + '<div class="ritual-controls" role="group" aria-label="Ritual controls">'
    + '  <button type="button" data-act="banish">Banish</button>'
    + '  <button type="button" data-act="center">Center</button>'
    + '  <button type="button" data-act="depart">Depart</button>'
    + '</div>';
  document.body.appendChild(wrap);

  wrap.addEventListener("click", async (e)=>{
    const btn = e.target.closest("button[data-act]");
    if(!btn) return;
    const act = btn.getAttribute("data-act");

    if(act === "banish"){
      // mute, neutral palette, soft light
      await ensureAudio(); stopTone();
      setStylepackId(NEUTRAL_PACK);
      setScreenTint("hsla(0,0%,100%,0.15)");
    }
    if(act === "center"){
      // center on default tone and clear tint
      await ensureAudio(); setTone(o.hz); startTone(o.hz);
      setScreenTint("hsla(0,0%,50%,0.0)");
    }
    if(act === "depart"){
      // stop audio, gentle dusk tint
      await ensureAudio(); stopTone();
      setScreenTint("hsla(260,30%,30%,0.18)");
    }
  });

  return wrap;
}

// auto-mount if a data attribute is present
(function auto(){
  const el = document.querySelector("[data-c99-ritualbar]");
  if(!el) return;
  const hz = Number(el.getAttribute("data-tone") || "528");
  mountRitualBar({ hz });
})();