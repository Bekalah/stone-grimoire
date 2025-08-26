// Stained Glass Engine (Canvas 2D, iPad-safe, ND-safe)
// Purpose: prismatic "rose window" wash + soft refraction + lead lattice overlay.
// No WebGL. No autoplay sound. Works after first user interaction.
// API:
//   const sg = await mountStainedGlass({ canvas:"#stainedglass", palette:[...], intensity:0.65, latticeSrc:"assets/geometry/stainedglass-lead.svg", leadOpacity:0.28 });
//   setGlassTone(528);        // subtle tempo shift for visual motion
//   setGlassPalette([...]);   // swap palette on the fly
//
// Notes:
// - Uses devicePixelRatio for crispness.
// - Respects prefers-reduced-motion (slows animation).
// - Designed to sit alongside your ambient-engine (optional hook below).

const _S = {
  ctx: null, cvs: null, w: 0, h: 0, raf: 0, t0: 0,
  running: false, intensity: 0.6, toneHz: 528,
  palette: ["#e7f0ff","#bcd2ff","#8faef2","#546aa9"], // angelic_chorus default
  grainCanvas: null, blurCanvas: null, blurCtx: null,
  latticeImg: null, leadOpacity: 0.28, rMotion: 1
};

function _resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = _S.cvs.getBoundingClientRect();
  _S.w = Math.max(320, Math.floor(rect.width * dpr));
  _S.h = Math.max(320, Math.floor(rect.height * dpr));
  _S.cvs.width = _S.w;
  _S.cvs.height = _S.h;
  _S.grainCanvas.width = _S.w;
  _S.grainCanvas.height = _S.h;
  _S.blurCanvas.width = Math.floor(_S.w / 2);
  _S.blurCanvas.height = Math.floor(_S.h / 2);
}

function _alpha(hex, a) {
  const m = hex.replace("#","").trim();
  const r = parseInt(m.slice(0,2),16);
  const g = parseInt(m.slice(2,4),16);
  const b = parseInt(m.slice(4,6),16);
  return "rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")";
}

function _makeGrain() {
  const gctx = _S.grainCanvas.getContext("2d");
  const img = gctx.createImageData(_S.w, _S.h);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = 128 + (Math.random() * 30 - 15);
    data[i] = data[i+1] = data[i+2] = n;
    data[i+3] = 18; // low alpha paper noise
  }
  gctx.putImageData(img, 0, 0);
}

/* Aurora wash: two moving gradients that cross-fade */
function _auroraWash(ctx, t) {
  const { w, h, palette, intensity } = _S;
  const g1 = ctx.createLinearGradient(0, 0, w, h);
  const g2 = ctx.createLinearGradient(w, 0, 0, h);
  const p = (i, a) => _alpha(palette[i % palette.length], a * intensity);

  g1.addColorStop(0.0, p(0, .06)); g1.addColorStop(0.5, p(1, .08)); g1.addColorStop(1.0, p(2, .04));
  g2.addColorStop(0.0, p(2, .05)); g2.addColorStop(0.5, p(3, .07)); g2.addColorStop(1.0, p(0, .03));

  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = g1; ctx.fillRect(0,0,w,h);
  const a = 0.8 + 0.2 * Math.sin(t * 0.0003 * _S.rMotion);
  ctx.globalAlpha = a; ctx.fillStyle = g2; ctx.fillRect(0,0,w,h);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
}

/* Prism rays: 12 spokes (cathedral clock), breathing with tone */
function _prismBeams(ctx, t) {
  const { w, h, palette, intensity } = _S;
  const cx = w * 0.5, cy = h * 0.5;
  const rays = 12;
  const rMax = Math.hypot(w, h) * 0.6;

  ctx.save(); ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < rays; i++) {
    const hue = palette[i % palette.length];
    ctx.rotate((Math.PI * 2) / rays);
    const sweep = 0.8 + 0.2 * Math.sin((t * 0.0006 * _S.rMotion) + i);
    const grd = ctx.createRadialGradient(0,0,0, 0,0, rMax);
    grd.addColorStop(0.0, _alpha(hue, 0.12 * intensity));
    grd.addColorStop(0.45, _alpha(hue, 0.06 * intensity));
    grd.addColorStop(1.0, _alpha(hue, 0.00));
    ctx.fillStyle = grd;
    ctx.beginPath();
    const a = 0.22 + 0.08 * sweep;
    ctx.moveTo(0,0);
    ctx.arc(0,0,rMax, -a, a);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* Soft refraction: blur downsample then overlay to simulate glass bleed */
function _softRefraction(ctx) {
  const { w, h, blurCanvas, blurCtx } = _S;
  blurCtx.clearRect(0,0,blurCanvas.width, blurCanvas.height);
  blurCtx.drawImage(_S.cvs, 0, 0, blurCanvas.width, blurCanvas.height);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.25;
  ctx.drawImage(blurCanvas, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/* Lead came overlay (multiply) */
function _leadCame(ctx) {
  if (!_S.latticeImg) return;
  const { w, h, leadOpacity } = _S;
  ctx.save();
  ctx.globalAlpha = leadOpacity;
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(_S.latticeImg, 0, 0, w, h);
  ctx.restore();
}

/* Paper grain final pass */
function _grainPass(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(_S.grainCanvas, 0, 0);
  ctx.restore();
}

function _loop(ts) {
  if (!_S.running) return;
  if (!_S.t0) _S.t0 = ts;
  const t = ts - _S.t0;
  const ctx = _S.ctx;
  const { w, h } = _S;

  // base vellum
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = "#0e0d10";
  ctx.globalAlpha = 0.75; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;

  _auroraWash(ctx, t);
  _prismBeams(ctx, t * (1 + (_S.toneHz - 528) / 3000));
  _softRefraction(ctx);
  _leadCame(ctx);
  _grainPass(ctx);

  _S.raf = requestAnimationFrame(_loop);
}

async function _loadImage(src) {
  return new Promise(function(res, rej){
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function(){ res(im); };
    im.onerror = rej;
    im.src = src;
  });
}

export async function mountStainedGlass(opts) {
  opts = opts || {};
  const cvs = typeof opts.canvas === "string" ? document.querySelector(opts.canvas) : opts.canvas;
  if (!cvs) throw new Error("stainedglass-engine: canvas not found");
  _S.cvs = cvs;
  _S.ctx = cvs.getContext("2d", { alpha: true });

  if (Array.isArray(opts.palette) && opts.palette.length) _S.palette = opts.palette.slice(0,4);
  if (typeof opts.intensity === "number") _S.intensity = opts.intensity;
  if (typeof opts.leadOpacity === "number") _S.leadOpacity = Math.max(0, Math.min(1, opts.leadOpacity));

  // motion preference
  _S.rMotion = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? 0.35 : 1;

  _S.grainCanvas = document.createElement("canvas");
  _S.blurCanvas = document.createElement("canvas");
  _S.blurCtx = _S.blurCanvas.getContext("2d");

  _resize(); _makeGrain();
  window.addEventListener("resize", function(){ _resize(); _makeGrain(); }, { passive: true });

  const latticeSrc = opts.latticeSrc || "assets/geometry/stainedglass-lead.svg";
  try { _S.latticeImg = await _loadImage(latticeSrc); } catch(_) { _S.latticeImg = null; }

  _S.running = true;
  _S.raf = requestAnimationFrame(_loop);

  return {
    stop: function(){ _S.running = false; cancelAnimationFrame(_S.raf); },
    setOpacity: function(v){ _S.leadOpacity = Math.max(0, Math.min(1, v)); },
    setPalette: function(arr){ if(Array.isArray(arr)&&arr.length) _S.palette = arr.slice(0,4); },
    canvas: _S.cvs
  };
}

export function setGlassTone(hz) {
  if (typeof hz === "number" && isFinite(hz)) _S.toneHz = hz;
}

export function setGlassPalette(arr) {
  if (Array.isArray(arr) && arr.length) _S.palette = arr.slice(0,4);
}

/* Optional: subscribe ambient-engine tone changes if present
   Usage in page:
     if (window.Ambient && Ambient.onToneChange) Ambient.onToneChange(setGlassTone);
*/