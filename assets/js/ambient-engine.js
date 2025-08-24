// assets/js/ambient-engine.js
let AC = null, nodes = null, irLoaded = false;
const defaultHz = 528, fadeMs = 800;

const toneListeners = new Set();
function emitTone(hz){ for (const fn of toneListeners) try{ fn(hz); }catch{} }

export function onToneChange(fn){
  if (typeof fn === 'function') toneListeners.add(fn);
  return () => toneListeners.delete(fn);
}

export async function ensureAudio(){
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext; AC = new Ctx();

  const osc = AC.createOscillator();
  const gain = AC.createGain();
  const master = AC.createGain();

  const low  = AC.createBiquadFilter(); low.type='lowshelf'; low.frequency.value=80;  low.gain.value=-3;
  const peak = AC.createBiquadFilter(); peak.type='peaking';  peak.frequency.value=2500; peak.Q.value=0.9; peak.gain.value=-4;
  const comp = AC.createDynamicsCompressor(); comp.threshold.value=-28; comp.knee.value=24; comp.ratio.value=2.2; comp.attack.value=.015; comp.release.value=.25;

  // NEW: analyser tap (post‑EQ/comp, pre‑IR) for cymatics
  const analyser = AC.createAnalyser();
  analyser.fftSize = 1024; // gentle resolution
  analyser.smoothingTimeConstant = 0.88;

  const convolver = AC.createConvolver();
  const limiter = AC.createDynamicsCompressor(); limiter.threshold.value=-4; limiter.knee.value=0; limiter.ratio.value=20; limiter.attack.value=.003; limiter.release.value=.15;

  gain.gain.value = 0.0001; // start muted (ND‑safe)
  master.gain.value = .25;

  osc.type = 'sine';
  osc.frequency.value = defaultHz;
  osc.start();

  // Graph: osc -> gain -> low -> peak -> comp -> [split]
  //                                      -> analyser -> convolver -> limiter -> master -> out
  osc.connect(gain); gain.connect(low); low.connect(peak); peak.connect(comp);
  comp.connect(analyser);
  analyser.connect(convolver); convolver.connect(limiter); limiter.connect(master); master.connect(AC.destination);

  nodes = { osc, gain, master, convolver, analyser };
  return AC;
}

export async function loadIR(url = './assets/audio/ir/cathedral_small.wav'){
  if (!AC) await ensureAudio();
  try{
    const buf = await (await fetch(url, {cache:'force-cache'})).arrayBuffer();
    AC.decodeAudioData(buf, (dec)=>{ nodes.convolver.buffer = dec; irLoaded = true; });
  }catch{ irLoaded = false; }
}

function fadeTo(target, ms = fadeMs){
  const g = nodes.gain.gain, now = AC.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(target, now + ms/1000);
}

export async function startTone(hz = defaultHz){
  if (!AC) await ensureAudio();
  if (!irLoaded) await loadIR();
  nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime + .25);
  fadeTo(0.08);
  emitTone(hz);
}

export function stopTone(){
  if (!AC) return;
  fadeTo(0.0001);
}

export function setTone(hz = defaultHz){
  if (!AC) return;
  nodes.osc.frequency.linearRampToValueAtTime(hz, AC.currentTime + .12);
  emitTone(hz);
}

// NEW: expose analyser safely for visualizers
export function getAnalyser(){
  return nodes?.analyser || null;
}