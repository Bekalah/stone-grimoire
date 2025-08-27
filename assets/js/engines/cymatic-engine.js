// assets/js/engines/cymatic-engine.js
// Museum-grade, ND-safe cymatic bloom. ES module. Any-device safe.
// Depends on ambient-engine.js exporting: ensureAudio(), getAnalyser(), onToneChange(cb).

import { ensureAudio, getAnalyser, onToneChange } from '../ambient-engine.js';

// Render state
let canvas = null, ctx = null, rafId = 0;
let analyser = null, bins = null;
let active = false, currentHz = 0;
let ro = null; // ResizeObserver

// Helpers
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function dprCap() {
  const d = window.devicePixelRatio || 1;
  return Math.min(Math.max(1, d), 2); // cap at 2 for perf
}
function sizeCanvas(c) {
  if (!c || !ctx) return;
  const dpr = dprCap();
  const w = c.clientWidth || 640;
  const h = c.clientHeight || 360;
  c.width  = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);
  // draw in CSS pixel units
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function mountResize() {
  // Prefer ResizeObserver to follow CSS changes
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => sizeCanvas(canvas));
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', () => sizeCanvas(canvas), { passive: true });
  }
}

function unmountResize() {
  if (ro) { try { ro.disconnect(); } catch(_){} ro = null; }
  else { window.removeEventListener('resize', () => sizeCanvas(canvas)); }
}

function draw(tms) {
  if (!active || !ctx) return;
  rafId = requestAnimationFrame(draw);

  // CSS pixels
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 360;
  const cx = w * 0.5, cy = h * 0.5;

  // Time (seconds)
  const t = (tms || 0) * 0.001;

  // Background wash from theme
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = cssVar('--wash', '#fff8e7');
  ctx.fillRect(0, 0, w, h);

  // Audio amplitude (stable low-mids) or soft breathing fallback
  let amp = 0.18 + 0.08 * Math.sin(t * 0.6);
  if (analyser && bins) {
    analyser.getByteFrequencyData(bins);
    let sum = 0, n = 0;
    // average bins 2..48 for smooth ND-safe motion
    const max = Math.min(48, bins.length);
    for (let i = 2; i < max; i++) { sum += bins[i]; n++; }
    const avg = n ? (sum / n) : 0;
    amp = 0.12 + (avg / 255) * 0.38; // ~0.12..0.50
  }

  // Palette
  const accent  = cssVar('--accent',  'rgba(47,90,158,0.35)');
  const accent2 = cssVar('--accent-2','rgba(212,175,55,0.40)');

  // Mandala petals
  const petals = 24;
  const baseR = Math.min(w, h) * 0.12;

  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + t * 0.5;
    const r1 = baseR * (1 + amp * 0.6);
    const r2 = r1 * (1.7 + 0.6 * Math.sin(t + i * 0.3));

    const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;

    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, accent2.replace('0.40', '0.28'));
    g.addColorStop(1, accent.replace('0.35', '0.22'));

    ctx.strokeStyle = g;
    ctx.lineWidth = 1 + amp * 0.8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Inner aureole
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * (1 + amp * 0.4), 0, Math.PI * 2);
  ctx.strokeStyle = accent2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Slow outer halo tied to tone
  const toneMod = currentHz ? (currentHz % 37) / 37 : 0.21;
  const R = Math.min(w, h) * (0.28 + 0.05 * Math.sin(t * (0.7 + toneMod)));
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = accent2;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function start() {
  if (active) return;
  // Respect reduced motion: draw one frame and exit
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.clientWidth || 0, canvas.clientHeight || 0);
  }
}

/** Public: mount and wire audio/reactivity
 *  target: CSS selector string or HTMLCanvasElement
 */
export async function mountCymaticsCanvas(target = '#cymatics') {
  canvas = typeof target === 'string' ? document.querySelector(target) : target;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  sizeCanvas(canvas);
  mountResize();

  // Set up audio if present (no autoplay; safe if blocked)
  try { await ensureAudio(); } catch(_) {}
  analyser = typeof getAnalyser === 'function' ? getAnalyser() : null;
  bins = analyser ? new Uint8Array(analyser.frequencyBinCount || 512) : null;

  // React to tone changes (number or {hz:...})
  if (typeof onToneChange === 'function') {
    onToneChange((payload) => {
      currentHz = (typeof payload === 'number') ? payload : (payload && payload.hz) || 0;
      start();
    });
  }

  // Also allow user gesture to kick it on mobile/iPad
  window.addEventListener('pointerdown', () => { if (!active) start(); }, { passive: true });

  // Return a small control API if callers want to manage lifecycle
  return { start, stop, unmount: () => { stop(); unmountResize(); canvas = ctx = null; } };
}

// Back-compat optional toggles
export function cymaticsOn(){ start(); }
export function cymaticsOff(){ stop(); }