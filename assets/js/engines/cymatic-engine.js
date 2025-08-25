// assets/js/engines/cymatic-engine.js
// Museum-grade, ND-safe cymatic bloom. ES module. No autoplay; respects reduced-motion.
// Depends on ambient-engine.js exporting: ensureAudio(), getAnalyser(), onToneChange(cb).

import { ensureAudio, getAnalyser, onToneChange } from '../ambient-engine.js';

// Canvas + render state
let canvas = null, ctx = null, rafId = 0;
let analyser = null, data = null;
let active = false, currentHz = 0;

// Helpers
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 360;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(tms) {
  if (!active || !ctx) return;
  rafId = requestAnimationFrame(draw);

  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 360;
  const cx = w * 0.5, cy = h * 0.5;

  // gently evolving time
  const t = (tms || 0) * 0.001;

  // background wash (uses site palette, falls back if missing)
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = cssVar('--wash', '#fff8e7');
  ctx.fillRect(0,0,w,h);

  // read analyser (if available); otherwise breathe softly
  let ampAvg = 0.18 + 0.08 * Math.sin(t * 0.6);
  if (analyser && data) {
    analyser.getByteFrequencyData(data);
    // average low-mid bins for a stable, ND-safe response
    let sum = 0, n = 0;
    for (let i = 2; i < Math.min(48, data.length); i++) { sum += data[i]; n++; }
    const avg = n ? sum / n : 0;
    ampAvg = 0.12 + (avg / 255) * 0.38; // clamp-ish 0.12..0.5
  }

  // palette links
  const accent = cssVar('--accent', 'rgba(47,90,158,0.35)');
  const accent2 = cssVar('--accent-2', 'rgba(212,175,55,0.40)');

  // radial petals (mandala)
  const petals = 24;                         // symmetry
  const baseR = Math.min(w, h) * 0.12;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + t * 0.5;
    const r1 = baseR * (1 + ampAvg * 0.6);
    const r2 = r1 * (1.7 + 0.6 * Math.sin(t + i * 0.3));
    const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;

    // gradient per petal for a glazed look
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, accent2.replace('0.40', '0.28'));
    g.addColorStop(1, accent.replace('0.35', '0.22'));
    ctx.strokeStyle = g;
    ctx.lineWidth = 1 + ampAvg * 0.8;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // inner aureole ring
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * (1 + ampAvg * 0.4), 0, Math.PI * 2);
    ctx.strokeStyle = accent2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // slow outer halo tied to current tone (tiny, ND safe)
  const toneMod = currentHz ? (currentHz % 37) / 37 : 0.21;
  ctx.beginPath();
  const R = Math.min(w, h) * (0.28 + 0.05 * Math.sin(t * (0.7 + toneMod)));
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function start() {
  if (active) return;
  // accessibility: respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // draw one still frame and stop
    active = true;
    draw(0);
    cancelAnimationFrame(rafId);
    active = false;
    return;
  }
  active = true;
  rafId = requestAnimationFrame(draw);
}
function stop() {
  active = false;
  cancelAnimationFrame(rafId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.clientWidth || 0, canvas.clientHeight || 0);
}

/** Public: mount the canvas and wire audio */
export async function mountCymaticsCanvas(selector = '#cymatics') {
  canvas = document.querySelector(selector);
  if (!canvas) return; // quietly exit if the page doesn't have a canvas
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Set up audio if present; this keeps it ND-safe (no autoplay)
  await ensureAudio().catch(()=>{ /* if blocked, we'll still breathe visually */ });
  analyser = getAnalyser?.() || null;
  if (analyser) data = new Uint8Array(analyser.frequencyBinCount || 512);

  // Start/stop visuals on tone change (ambient-engine calls this)
  onToneChange?.((hz) => {
    currentHz = hz || 0;
    start();
  });

  // Also allow user gesture to kick it on mobile/iPad
  window.addEventListener('pointerdown', () => { if (!active) start(); }, { passive: true });
}

/** Optional toggles you can call from UI later */
export function cymaticsOn(){ start(); }
export function cymaticsOff(){ stop(); }