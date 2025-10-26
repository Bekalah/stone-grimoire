// assets/js/ui/ritual.js
import { startTone, stopTone } from "/assets/js/engines/cathedral-engine.js";

export function mountRitualBar(opts = {}) {
  const hz = Number(opts.hz || 528);
  const target = opts.target ? (typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target) : document.body;
  const el = document.createElement("div");
  el.className = "ritual-bar";
  el.innerHTML =
    "<div class='ritual-controls' role='group' aria-label='Ritual controls'>" +
    "<button data-act='banish'>Banish</button>" +
    "<button data-act='center'>Center</button>" +
    "<button data-act='depart'>Depart</button>" +
    "</div>";
  target.appendChild(el);

  el.addEventListener("click", async ev => {
    const act = ev.target?.getAttribute("data-act");
    if (!act) return;
    if (act === "banish") {
      stopTone();
      document.documentElement.setAttribute("data-stylepack", "neutral_white");
    }
    if (act === "center") {
      await startTone(hz);
    }
    if (act === "depart") {
      stopTone();
    }
  });
  return el;
}

export default mountRitualBar;
