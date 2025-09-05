// assets/js/bloom.js
// ND-safe tone + visual bloom controller (shared)

let ctx = null;
let osc = null;
let gain = null;
let master = null;
let convolver = null;
let irLoaded = false;

// DOM bloom (subtle radial)
let bloomEl = null;

export async function ensureAudio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();

  osc = ctx.createOscillator();
  gain = ctx.createGain();
  master = ctx.createGain();
  convolver = ctx.createConvolver();

  // Gentle defaults
  osc.type = "sine";
  osc.frequency.value = 528;
  gain.gain.value = 0.0001;
  master.gain.value = 0.2;

  // Mild EQ dip to avoid harshness
  const peak = ctx.createBiquadFilter();
  peak.type = "peaking"; peak.frequency.value = 2500; peak.Q.value = 0.8; peak.gain.value = -3;

  // Soft compressor & limiter
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -26; comp.knee.value = 24; comp.ratio.value = 2.2;
  comp.attack.value = 0.02; comp.release.value = 0.25;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.003; limiter.release.value = 0.15;

  // Wire
  osc.connect(gain);
  gain.connect(peak);
  peak.connect(comp);
  comp.connect(convolver);
  convolver.connect(limiter);
  limiter.connect(master);
  master.connect(ctx.destination);

  osc.start();
  return ctx;
}

export async function loadIR(url = "/assets/audio/ir/cathedral_small.wav") {
  await ensureAudio();
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const buf = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buf);
    convolver.buffer = decoded;
    irLoaded = true;
  } catch {
    irLoaded = false; // fine to run dry
  }
}

function ensureBloomEl() {
  if (bloomEl) return;
  bloomEl = document.createElement("div");
  bloomEl.setAttribute("aria-hidden", "true");
  bloomEl.style.position = "fixed";
  bloomEl.style.inset = "0";
  bloomEl.style.pointerEvents = "none";
  bloomEl.style.opacity = "0";
  bloomEl.style.transition = "opacity 800ms ease";
  // soft halo
  bloomEl.style.background =
    "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.22), rgba(255,255,255,0.08) 40%, transparent 70%)";
  document.body.appendChild(bloomEl);
}

function lerp(a,b,t){ return a + (b-a)*t; }

export async function setBloomTone(hz = 528, opt = {}) {
  // opt.color: CSS color for subtle border-glow on body (optional)
  // opt.level: 0..1 overall loudness cap (default 0.2)
  await ensureAudio();
  ensureBloomEl();

  // Wake audio if suspended
  if (ctx.state === "suspended") await ctx.resume();

  // Smooth glide
  const now = ctx.currentTime;
  const gl = 0.35;
  osc.frequency.cancelScheduledValues(now);
  osc.frequency.setValueAtTime(osc.frequency.value, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, hz), now + gl);

  // Gentle swell
  const target = Math.max(0.05, Math.min(opt.level ?? 0.2, 0.35));
  gain.gain.cancelScheduledValues(now);
  gain.gain.linearRampToValueAtTime(target, now + 0.3);
  gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);

  // Subtle visual halo
  bloomEl.style.opacity = "1";
  setTimeout(()=>{ bloomEl.style.opacity = "0"; }, 650);

  // Optional body border-glow, very subtle
  if (opt.color) {
    const el = document.documentElement;
    el.style.setProperty("--bloom-color", opt.color);
    el.style.boxShadow = `inset 0 0 0 2px rgba(0,0,0,0),
                          0 0 40px 10px ${opt.color}33`;
    setTimeout(()=>{ el.style.boxShadow = "none"; }, 900);
  }
}