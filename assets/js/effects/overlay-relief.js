// assets/js/effects/overlay-relief.js
// Living-sculpture overlay that "breathes" with tone. Any-device safe.
// Depends on ambient-engine.js exporting: ensureAudio(), getAnalyser() (optional), onToneChange(cb) (optional).

import { ensureAudio, getAnalyser, onToneChange } from '../engines/ambient-engine.js';

let canvas = null, ctx = null, rafId = 0;
let analyser = null, bins = null;
let img = null, ready = false;
let active = false, alpha = 0.25, ro = null;

function dprCap() {
  const d = window.devicePixelRatio || 1;
  return Math.min(Math.max(1, d), 2);
}
function sizeCanvas(c) {
  if (!c || !ctx) return;
  const dpr = dprCap();
  const w = c.clientWidth || 640;
  const h = c.clientHeight || 360;
  c.width  = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function mountResize() {
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

function fallbackPattern(w, h, strength) {
  // Subtle geometric fallback if image not ready or offline
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.globalAlpha = 0.10 + strength * 0.10;
  const spokes = 48;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.002));
  for (let i = 0; i < spokes; i++) {
    ctx.rotate(Math.PI / 24);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, Math.min(w, h) * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

function draw(tms) {
  if (!active || !ctx) return;
  rafId = requestAnimationFrame(draw);

  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 360;
  const t = (tms || 0) * 0.001;

  // Default breathing if no audio
  let energy = 0.2 + 0.1 * Math.sin(t * 0.7);

  if (analyser && bins) {
    analyser.getByteFrequencyData(bins);
    let sum = 0, n = 0;
    const max = Math.min(64, bins.length);
    for (let i = 2; i < max; i++) { sum += bins[i]; n++; }
    const avg = n ? (sum / n) : 0;
    energy = 0.12 + (avg / 255) * 0.55; // 0.12..0.67
  }

  ctx.clearRect(0, 0, w, h);

  if (!ready || !img || !img.complete || img.naturalWidth === 0) {
    fallbackPattern(w, h, energy);
    return;
  }

  // Living-sculpture look: blur + brightness modulated by energy
  const blur = Math.round(energy * 8);
  const bright = 1 + energy * 0.3;
  ctx.globalAlpha = alpha + energy * 0.25;
  ctx.filter = 'blur(' + blur + 'px) brightness(' + bright + ')';

  // Cover-fit draw
  const arImg = img.naturalWidth / img.naturalHeight;
  const arCan = w / h;
  let dw = w, dh = h, dx = 0, dy = 0;
  if (arImg > arCan) {
    // image wider than canvas: height fits, crop sides
    dh = h; dw = Math.ceil(h * arImg); dx = Math.floor((w - dw) / 2);
  } else {
    // image taller: width fits, crop top/bottom
    dw = w; dh = Math.ceil(w / arImg); dy = Math.floor((h - dh) / 2);
  }
  ctx.drawImage(img, dx, dy, dw, dh);

  // Frame halo (subtle)
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,' + (0.05 + energy * 0.1) + ')';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(w, h) * 0.002));
  ctx.strokeRect(0, 0, w, h);
}

function start() {
  if (active) return;
  // Respect reduced motion
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
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.clientWidth || 0, canvas.clientHeight || 0);
}

/** Public: mount overlay
 *  target: CSS selector or HTMLCanvasElement
 *  opts: { src, alpha, useAudio=true }
 */
export async function mountOverlayCanvas(target, opts) {
  const o = Object.assign({ src: '', alpha: 0.25, useAudio: true }, opts || {});
  canvas = typeof target === 'string' ? document.querySelector(target) : target;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  alpha = Math.max(0, Math.min(1, Number(o.alpha)));

  // Size + observers
  sizeCanvas(canvas);
  mountResize();

  // Load image
  ready = false;
  img = new Image();
  img.decoding = 'async';
  img.src = o.src || canvas.getAttribute('src') || canvas.getAttribute('data-src') || '';
  img.onload = () => { ready = true; };
  img.onerror = () => { ready = false; };

  // Audio (optional)
  if (o.useAudio) {
    try { await ensureAudio(); } catch(_) {}
    analyser = typeof getAnalyser === 'function' ? getAnalyser() : null;
    bins = analyser ? new Uint8Array(analyser.frequencyBinCount || 512) : null;

    if (typeof onToneChange === 'function') {
      onToneChange(() => { start(); });
    }
  }

  // User gesture can kick it too
  window.addEventListener('pointerdown', () => { if (!active) start(); }, { passive: true });

  // Return lifecycle API
  return { start, stop, unmount: () => { stop(); unmountResize(); canvas = ctx = img = null; ready = false; } };
}

// Back-compat helpers
export function reliefOn(){ start(); }
export function reliefOff(){ stop(); }