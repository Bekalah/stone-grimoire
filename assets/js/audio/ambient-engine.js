// assets/js/ambient-engine.js
// High-quality WebAudio chain: osc -> gain -> EQ -> comp -> [convolver] -> limiter -> master.
// ND‑safe: no autoplay; smooth gain ramps; volume caps; optional convolution reverb.
// Usage:
//   import { ensureAudio, toneTo, fadeOutAll, loadIR } from "./ambient-engine.js";
//   await ensureAudio(); await loadIR(); await toneTo(528); // after user gesture
//   // add a "Quietus" button to call fadeOutAll();

let AC = null;
let nodes = null;
let currentHz = null;
let irLoaded = false;

const fadeMs = 800;

export async function ensureAudio() {
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();

  const osc = AC.createOscillator();
  const gain = AC.createGain();        // musical gain (fades)
  const master = AC.createGain();      // master cap

  // Subtle EQ (tame rumble & harshness)
  const lowShelf = AC.createBiquadFilter();
  lowShelf.type = "lowshelf"; lowShelf.frequency.value = 80; lowShelf.gain.value = -3;

  const peak = AC.createBiquadFilter();
  peak.type = "peaking"; peak.frequency.value = 2500; peak.Q.value = 0.9; peak.gain.value = -4;

  // Gentle compression
  const comp = AC.createDynamicsCompressor();
  comp.threshold.value = -28; comp.knee.value = 24; comp.ratio.value = 2.2;
  comp.attack.value = 0.015; comp.release.value = 0.25;

  // Convolver (optional IR)
  const convolver = AC.createConvolver();

  // Soft limiter
  const limiter = AC.createDynamicsCompressor();
  limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.003; limiter.release.value = 0.15;

  // Levels
  gain.gain.value = 0.0001;
  master.gain.value = 0.25; // be kind to ears

  // Topology
  osc.connect(gain);
  gain.connect(lowShelf);
  lowShelf.connect(peak);
  peak.connect(comp);
  comp.connect(convolver);
  convolver.connect(limiter);
  limiter.connect(master);
  master.connect(AC.destination);

  osc.type = "sine";
  osc.frequency.value = 528;
  osc.start();

  nodes = { osc, gain, master, comp, convolver, limiter };
  return AC;
}

export async function loadIR(url = "/assets/audio/ir/cathedral_small.wav") {
  if (!AC) await ensureAudio();
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const buf = await res.arrayBuffer();
    const decoded = await AC.decodeAudioData(buf);
    nodes.convolver.buffer = decoded;
    irLoaded = true;
  } catch (e) {
    irLoaded = false;
  }
}

export async function toneTo(hz = 528) {
  if (!AC) await ensureAudio();
  currentHz = hz;
  const now = AC.currentTime;
  smooth(nodes.osc.frequency, hz, now);
  fadeIn(nodes.gain, 0.12, fadeMs);
}

export async function fadeOutAll() {
  if (!AC) return;
  fadeOut(nodes.gain, fadeMs);
}

function smooth(param, value, t) {
  try {
    param.setTargetAtTime(value, t, 0.05);
  } catch {
    param.value = value;
  }
}

function fadeIn(g, target = 0.12, ms = 800) {
  const t = AC.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(target, t + ms / 1000);
}

function fadeOut(g, ms = 800) {
  const t = AC.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(0.0001, t + ms / 1000);
}

// Expose a helper to bind a "Quietus" button
export function bindQuietus(selector = "[data-quietus]") {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await ensureAudio();
    await fadeOutAll();
  });
}