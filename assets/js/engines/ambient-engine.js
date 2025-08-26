// assets/js/engines/ambient-engine.js
// ND-safe WebAudio core with tiny pub/sub. ASCII-only; iPad-safe (requires first tap).

let ctx = null;
let master = null;
let osc = null;
let gain = null;
let analyser = null;
let convolver = null;
let muted = false;
let currentHz = 0;

const subs = new Set();

export async function ensureAudio(){
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0.9;

  // mild comp for headroom
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -24; comp.knee.value = 30; comp.ratio.value = 6;
  comp.attack.value = 0.005; comp.release.value = 0.25;

  // analyser for visuals
  analyser = ctx.createAnalyser();
  analyser.fftSize = 512;

  // optional IR (silent if missing; you can wire later)
  convolver = ctx.createConvolver();
  // fetch lightly; if 404, just skip
  try {
    const r = await fetch("../assets/ir/cathedral.wav");
    if (r.ok) {
      const buf = await r.arrayBuffer();
      ctx.decodeAudioData(buf, b => convolver.buffer = b);
    }
  } catch(_){ /* non-fatal */ }

  master.connect(comp).connect(analyser).connect(ctx.destination);
  return ctx;
}

function buildOsc() {
  if (osc) { try { osc.stop(0); } catch(_){ } osc.disconnect(); }
  if (gain) { gain.disconnect(); }
  osc = ctx.createOscillator();
  osc.type = "sine";
  gain = ctx.createGain();
  gain.gain.value = 0.0001;          // start silent; ramp in
  // convolver may be empty; connect gain->master always
  gain.connect(master);
  osc.connect(gain);
  osc.start();
}

export function setMuted(on){
  muted = !!on;
  if (gain) gain.gain.value = 0.0001;
}

export async function setToneHz(hz){
  await ensureAudio();
  if (!osc) buildOsc();
  if (ctx.state === "suspended") await ctx.resume();

  currentHz = hz;
  const now = ctx.currentTime;
  try {
    osc.frequency.setTargetAtTime(hz, now, 0.03);
  } catch(_){
    osc.frequency.value = hz;
  }
  const target = muted ? 0.0001 : 0.12; // ND-safe loudness
  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(target, now, 0.06);

  subs.forEach(fn => { try { fn(hz); } catch(_){ } });
}

export function stopTone(){
  if (!ctx || !gain) return;
  const now = ctx.currentTime;
  gain.gain.setTargetAtTime(0.0001, now, 0.06);
}

export function getAnalyser(){ return analyser; }

export function onToneChange(fn){
  subs.add(fn);
  return () => subs.delete(fn);
}

export function currentTone(){ return currentHz; }