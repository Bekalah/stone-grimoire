// assets/js/ambient-engine.js
// High-quality WebAudio chain: tone -> EQ -> gentle comp -> (optional) cathedral IR -> soft limiter -> master gain.
// ND‑safe: no autoplay; requires user gesture. Smooth fades. No harsh transients.

let AC = null;
let nodes = null;
let currentHz = null;
let fadeMs = 800;
let irLoaded = false;

export async function ensureAudio() {
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();
  // Base nodes
  const osc = AC.createOscillator();
  const gain = AC.createGain();        // musical gain (fades)
  const master = AC.createGain();      // master output cap

  // Subtle EQ to remove harshness and rumble
  const lowShelf = AC.createBiquadFilter();
  lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 80; lowShelf.gain.value = -3;

  const peak = AC.createBiquadFilter();
  peak.type = 'peaking'; peak.frequency.value = 2500; peak.Q.value = 0.9; peak.gain.value = -4;

  // Soft dynamics (keeps it gentle)
  const comp = AC.createDynamicsCompressor();
  comp.threshold.value = -28; comp.knee.value = 24; comp.ratio.value = 2.2;
  comp.attack.value = 0.015; comp.release.value = 0.25;

  // Optional convolution reverb (cathedral IR). Fallback is dry if asset missing.
  const convolver = AC.createConvolver();

  // Soft clipper / limiter
  const limiter = AC.createDynamicsCompressor();
  limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.003; limiter.release.value = 0.15;

  // Default levels
  gain.gain.value = 0.0001;
  master.gain.value = 0.25; // global cap; be kind to ears

  // Topology: osc -> gain -> EQ -> comp -> [convolver?] -> limiter -> master -> destination
  osc.connect(gain);
  gain.connect(lowShelf);
  lowShelf.connect(peak);
  peak.connect(comp);
  comp.connect(convolver);
  convolver.connect(limiter);
  limiter.connect(master);
  master.connect(AC.destination);

  osc.type = 'sine';    // start pure; we’ll shape with EQ+IR to sound "organ-ish"
  osc.frequency.value = 528;

  osc.start();

  nodes = { osc, gain, master, comp, convolver };
  return AC;
}

export async function loadIR(url = '../assets/audio/ir/cathedral_small.wav') {
  if (!AC) await ensureAudio();
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    const buf = await res.arrayBuffer();
    AC.decodeAudioData(buf, decoded => {
      nodes.convolver.buffer = decoded;
      irLoaded = true;
    });
  } catch {
    // no IR available--stay dry
    irLoaded = false;