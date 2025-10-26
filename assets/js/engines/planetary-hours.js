// assets/js/engines/planetary-light.js
// Cathedral zodiac tint engine (ND-safe, iPad-safe, ASCII only).
// Maps zodiac degrees -> angels72 -> stylepack + color wash.
// No audio autoplay. If your ambient engine is running, we sync its tone.

const CONFIG = {
  mode: "FIVE_DEGREES", // "FIVE_DEGREES" (exact 72) or "THREE_DEGREES" (finer healing)
  cycleMinutes: 120,     // full 360° cycle duration when simulating (change to taste)
  autoStart: true,       // start simulated cycle on load (no audio)
  cssVar: "--hour-bg",   // the CSS var we tint
  opacityVar: "--hour-bg-alpha", // optional alpha var you can use in CSS gradients
};

// --- tiny utils --------------------------------------------------------------
const $ = (sel, root=document) => root.querySelector(sel);
function setVar(name, val){ document.documentElement.style.setProperty(name, val); }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

// Resolve a JSON by trying multiple relative paths (works from any subdir)
async function loadJSON(candidates){
  for (const url of candidates){
    try{
      const res = await fetch(url, { cache: "no-cache" });
      if (res.ok) return await res.json();
    }catch(_){}
  }
  console.warn("[planetary-light] Could not load JSON from", candidates);
  return null;
}

// Try both common locations relative to pages at /, /main/, /chapels/
const ANGEL_PATHS = [
  "assets/data/angels72.json",
  "/assets/data/angels72.json",
];

// Optional imports are dynamic so this file never hard-crashes if modules are missing
async function tryImportAmbient(){
  const candidates = [
    "./ambient-engine.js",
    "../ambient-engine.js",
    "/assets/js/engines/ambient-engine.js",
    "../engines/ambient-engine.js"
  ];
  for (const p of candidates){
    try{ return await import(p); } catch(_){}
  }
  return null;
}
async function tryImportStyleEngine(){
  const candidates = [
    "../style-engine.js",
    "/assets/js/style-engine.js",
    "../engines/style-engine.js",
    "/assets/js/engines/style-engine.js",
  ];
  for (const p of candidates){
    try{ return await import(p); } catch(_){}
  }
  return null;
}

// --- color maps --------------------------------------------------------------
const ELEMENT_HINT = {
  Fire:  "#e8893a",
  Air:   "#8faef2",
  Water: "#80dfff",
  Earth: "#7aa36d",
  Light: "#f4c76a",
  Aether:"#c49bc7"
};

// --- degree math -------------------------------------------------------------
function angelIndexFromDegree(deg, mode){
  const d = ((deg % 360) + 360) % 360;
  if (mode === "THREE_DEGREES"){
    // 120 slots -> map to 72 by proportion
    const slot = Math.floor(d / 3);              // 0..119
    const idx  = Math.floor(slot * (72/120));    // 0..71
    return idx;
  } else {
    // FIVE_DEGREES -> 360/72 = 5°
    return Math.floor(d / 5) % 72;               // 0..71
  }
}

function simDegree(progress01){
  // Progress 0..1 across the full cycle
  return progress01 * 360;
}

// --- main loop ---------------------------------------------------------------
let angels = null;
let ambient = null;
let styleEngine = null;
let raf = 0;
let t0 = 0;

function hexWithAlpha(hex, alpha=0.18){
  // hex "#rrggbb" -> rgba string
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!m) return hex;
  const r = parseInt(m[1],16), g = parseInt(m[2],16), b = parseInt(m[3],16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function tick(){
  const now = performance.now();
  const dur = CONFIG.cycleMinutes * 60 * 1000; // ms
  const p   = (now - t0) / dur;
  const deg = simDegree(p % 1);

  const idx = angelIndexFromDegree(deg, CONFIG.mode);
  const a   = angels[idx];

  // Set tint color
  const color = ELEMENT_HINT[a.element] || "#d4af37";
  setVar(CONFIG.cssVar, color);
  setVar(CONFIG.opacityVar, "0.18");

  // Optionally update stylepack if available (very light)
  if (styleEngine?.applyStylepack && a.stylepack){
    // You can comment this out if you don't want skins to drift
    // styleEngine.applyStylepack(a.stylepack);
  }

  // If ambient engine is already running, glide to the tone (no autoplay)
  if (ambient?.setToneHz && typeof a.toneHz === "number"){
    ambient.setToneHz(a.toneHz);
  }

  raf = requestAnimationFrame(tick);
}

async function start(){
  angels      = await loadJSON(ANGEL_PATHS);
  if (!Array.isArray(angels) || angels.length < 72){
    console.warn("[planetary-light] angels72.json missing or incomplete");
    return;
  }
  ambient     = await tryImportAmbient();     // optional
  styleEngine = await tryImportStyleEngine(); // optional

  t0 = performance.now();
  if (CONFIG.autoStart) tick();

  // Respect reduced motion: show a static tint only
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    cancelAnimationFrame(raf);
    const idx = angelIndexFromDegree(0, CONFIG.mode);
    const a   = angels[idx];
    const color = ELEMENT_HINT[a.element] || "#d4af37";
    setVar(CONFIG.cssVar, color);
    setVar(CONFIG.opacityVar, "0.14");
  }
}

document.addEventListener("DOMContentLoaded", start);