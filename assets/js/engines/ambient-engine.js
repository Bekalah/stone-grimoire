

  // assets/js/engines/ambient-engine.js
// ND-safe WebAudio core with tiny pub/sub. ASCII-only, iPad-safe.
// Exposes: start(), stop(), setToneHz(hz), setMuted(on), onToneChange(fn),
//          getAnalyser(), currentTone()

let AC = null;
let osc = null;
let preGain = null;     // musical gain (we fade this)
let low = null;         // gentle lowshelf
let peak = null;        // gentle peaking cut
let comp = null;        // soft compressor
let convolver = null;   // optional IR
let limiter = null;     // soft safety limiter
let master = null;      // final cap
let analyser = null;

let currentHz = 528;
let started = false;
let muted = false;

const listeners = new Set();

// ---------- tiny pub/sub ----------
export function onToneChange(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
function notify(){ for (const fn of listeners) { try{ fn(currentHz); }catch(_){} } }

// ---------- gesture unlock (iPad/Safari) ----------
function onFirstGesture(fn){
  let done = false;
  const go = () => { if (!done){ done = true; cleanup(); try{ fn(); }catch(_){} } };
  const cleanup = () => {
    const evs = ['pointerdown','touchstart','keydown','mousedown','click','visibilitychange'];
    evs.forEach(ev => window.removeEventListener(ev, go, true));
  };
  const evs = ['pointerdown','touchstart','keydown','mousedown','click','visibilitychange'];
  evs.forEach(ev => window.addEventListener(ev, go, true));
}

// ---------- optional IR loader (tries common paths) ----------
async function loadIR(ac){
  const urls = [
    'assets/audio/ir/cathedral_small.wav',
    'assets/audio/ir/cathedral.wav',
    '../assets/audio/ir/cathedral_small.wav',
    '../assets/audio/ir/cathedral.wav'
  ];
  for (const u of urls){
    try{
      const res = await fetch(u, { cache: 'force-cache' });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      return await ac.decodeAudioData(buf);
    }catch(_){}
  }
  return null; // fine: we will run dry
}

// ---------- graph build ----------
async function ensureAudio(){
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) { started = true; return null; } // no WebAudio available

  AC = new Ctx();

  // nodes
  preGain = AC.createGain();      preGain.gain.value = 0.0001; // start silent
  low     = AC.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 80;  low.gain.value = -3;
  peak    = AC.createBiquadFilter(); peak.type = 'peaking';   peak.frequency.value = 2500; peak.Q.value = 0.9; peak.gain.value = -4;
  comp    = AC.createDynamicsCompressor();
  comp.threshold.value = -28; comp.knee.value = 24; comp.ratio.value = 2.2; comp.attack.value = 0.015; comp.release.value = 0.25;

  convolver = AC.createConvolver();
  limiter   = AC.createDynamicsCompressor();
  limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.003; limiter.release.value = 0.15;

  master   = AC.createGain();     master.gain.value = 0.9; // global cap
  analyser = AC.createAnalyser(); analyser.fftSize = 1024;

  // chain: (osc) -> preGain -> low -> peak -> comp -> convolver -> limiter -> master -> analyser -> destination
  preGain.connect(low); low.connect(peak); peak.connect(comp);
  comp.connect(convolver); convolver.connect(limiter);
  limiter.connect(master); master.connect(analyser); analyser.connect(AC.destination);

  // load IR (optional)
  const ir = await loadIR(AC);
  if (ir) convolver.buffer = ir;

  // gesture resume (mobile)
  onFirstGesture(() => { if (AC.state === 'suspended') { AC.resume().catch(()=>{}); } });

  return AC;
}

function buildOsc(){
  if (!AC) return;
  if (osc) { try { osc.stop(); } catch(_){ } try { osc.disconnect(); } catch(_){ } }
  osc = AC.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = currentHz;
  osc.connect(preGain);
  osc.start();
}

// ---------- public API ----------
export async function start(){
  await ensureAudio();
  if (!AC) { started = true; return; }
  if (!osc) buildOsc();
  if (AC.state === 'suspended') { try{ await AC.resume(); }catch(_){} }
  started = true;
  fadeTo(muted ? 0.0001 : 0.08, 600); // ND-safe gentle pad
}

export function stop(){
  if (!AC) return;
  fadeTo(0.0001, 400);
}

export async function setToneHz(hz){
  currentHz = hz;
  notify();
  await ensureAudio();
  if (!AC) return;
  if (!osc) buildOsc();
  const t = AC.currentTime + 0.06;
  try {
    osc.frequency.linearRampToValueAtTime(hz, t);
  } catch(_){
    osc.frequency.value = hz;
  }
  if (!started) return; // will fade-in when start() is called
  fadeTo(muted ? 0.0001 : 0.08, 200);
}

export function setMuted(on){
  muted = !!on;
  if (!AC) return;
  fadeTo(muted ? 0.0001 : 0.08, 150);
}

export function getAnalyser(){ return analyser; }
export function currentTone(){ return currentHz; }

// ---------- helpers ----------
function fadeTo(v, ms){
  if (!AC || !preGain) return;
  const now = AC.currentTime;
  preGain.gain.cancelScheduledValues(now);
  preGain.gain.setValueAtTime(preGain.gain.value, now);
  preGain.gain.linearRampToValueAtTime(v, now + (ms/1000));
}