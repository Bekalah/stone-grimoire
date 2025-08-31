// Planetary Light Engine -- Codex 144:99
// ND-safe, iPad-friendly. Listens for angel/sign events and shifts site colors.
// Exposes: applySign(sign), applyPlanet(planet), applyAngel(detail)

const SIGN_TO_PLANET = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn",
  Pisces: "Jupiter"
};

// Planetary palettes (traditional correspondences + color-healing vibe)
// Keep values calm; you can tune later. Keys match your CSS vars in palette.css / light.css.
const PLANET_PALETTE = {
  Sun:     { bg:"#fff6e6", ink:"#2a2320", accent:"#e0a624", accent2:"#a66d0d", panel:"#fffaf0", wash:"#f7edd8", line:"#d9c7a2" },
  Moon:    { bg:"#eef6ff", ink:"#222733", accent:"#7aa7ff", accent2:"#3e68a2", panel:"#f7fbff", wash:"#e8f0fb", line:"#cfd8ea" },
  Mercury: { bg:"#f3f6fb", ink:"#22252b", accent:"#6b9aa7", accent2:"#3b5c66", panel:"#ffffff", wash:"#edf2f6", line:"#d2dae2" },
  Venus:   { bg:"#fff0f5", ink:"#2a1f26", accent:"#d688b3", accent2:"#8a4e75", panel:"#fff7fb", wash:"#f7e5ef", line:"#e2cad8" },
  Mars:    { bg:"#fff1ec", ink:"#2b1f1c", accent:"#d96a4b", accent2:"#93432f", panel:"#fff8f5", wash:"#f7e7e1", line:"#e2c9c1" },
  Jupiter: { bg:"#f6fff1", ink:"#232a20", accent:"#7ca04b", accent2:"#506c2f", panel:"#fbfff7", wash:"#ecf4e4", line:"#d1dec3" },
  Saturn:  { bg:"#f0edf6", ink:"#221f2b", accent:"#9b86c9", accent2:"#5e4f88", panel:"#f7f5fb", wash:"#e8e5f1", line:"#d3cfe0" }
};

// Element tint helper (optional, subtle wash). Your angels72.json has element keys.
const ELEMENT_TINT = {
  Fire:"#e8893a", Air:"#8faef2", Water:"#80dfff", Earth:"#7aa36d", Light:"#f4c76a", Aether:"#c49bc7"
};

// Internal: gentle overlay flash to make the shift feel "breathing", not abrupt.
let overlay = null;
function ensureOverlay(){
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden","true");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity .8s ease";
  document.body.appendChild(overlay);
  return overlay;
}

function setVars(pal){
  const r = document.documentElement.style;
  r.setProperty("--bg", pal.bg);
  r.setProperty("--ink", pal.ink);
  r.setProperty("--accent", pal.accent);
  r.setProperty("--accent-2", pal.accent2);
  r.setProperty("--panel", pal.panel);
  r.setProperty("--wash", pal.wash);
  r.setProperty("--line", pal.line);
}

// Public: set by planet
export function applyPlanet(planet, opts={}){
  const pal = PLANET_PALETTE[planet] || PLANET_PALETTE.Sun;
  setVars(pal);

  // Optional element tint halo
  const tint = opts.elementTint || null;
  if (tint){
    const ov = ensureOverlay();
    ov.style.background = "radial-gradient(circle at 50% 20%, " + hexA(tint,0.16) + " 0%, transparent 60%)";
    ov.style.opacity = "1";
    requestAnimationFrame(()=>{ ov.style.opacity = "0"; });
  }
}

// Public: set by sign
export function applySign(sign, opts={}){
  const planet = SIGN_TO_PLANET[sign] || "Sun";
  applyPlanet(planet, opts);
}

// Public: set by angel detail (expects {name, sign, element} at least)
export function applyAngel(detail={}){
  const sign = detail.sign || null;
  const element = detail.element || null;
  const tint = element && ELEMENT_TINT[element] ? ELEMENT_TINT[element] : null;
  if (sign) applySign(sign, { elementTint: tint });
  else applyPlanet("Sun", { elementTint: tint });
}

// Utility: hex -> rgba string with alpha
function hexA(hex, a){
  const h = hex.replace("#","").trim();
  const n = parseInt(h.length===3 ? h.split("").map(c=>c+c).join("") : h, 16);
  const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

// Event wiring: listen for your app’s custom events.
function onAngelActivate(e){ applyAngel(e.detail || {}); }
function onSignSet(e){ applySign((e.detail && e.detail.sign) || "Sun"); }

// Init: attach listeners once DOM is ready
(function init(){
  // Custom events dispatched elsewhere:
  //  - "codex:angel-activate"  detail: { id, name, sign, element, toneHz, stylepack }
  //  - "codex:set-sign"       detail: { sign }
  window.addEventListener("codex:angel-activate", onAngelActivate);
  window.addEventListener("codex:set-sign", onSignSet);

  // Export a small global for convenience if you want to poke it from console
  window.PlanetaryLight = { applyPlanet, applySign, applyAngel };
})();