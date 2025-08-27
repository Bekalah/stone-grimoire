// ambient-engine.js (patched)
import { hasAudio, onFirstGesture, prefersReducedMotion } from "../compat/platform-bridge.js";

let _ctx, _osc, _gain, _analyser, _fake, _lastHz = 432;
const _listeners = new Set();

class FakeAnalyser {
  constructor(){ this.frequencyBinCount = 512; this._t = 0; }
  getByteFrequencyData(arr) {
    // gentle synthetic motion if audio is blocked or disabled
    this._t += 0.016;
    const base = 40 + Math.floor(30 * Math.sin(this._t));
    for (let i = 0; i < arr.length; i++) arr[i] = base + ((i % 32) * 2);
  }
}

function _ensureAudio() {
  if (_ctx || _fake) return;

  if (!hasAudio || prefersReducedMotion) {
    // No audio context or motion reduced: provide silent, synthetic analyser
    _fake = new FakeAnalyser();
    return;
  }

  const AC = window.AudioContext || window.webkitAudioContext;
  _ctx = new AC({ latencyHint: "interactive" });

  _osc = _ctx.createOscillator();
  _osc.type = "sine";
  _osc.frequency.value = _lastHz;

  _gain = _ctx.createGain();
  _gain.gain.value = 0.04;

  _analyser = _ctx.createAnalyser();
  _analyser.fftSize = 1024;
  _analyser.smoothingTimeConstant = 0.85;

  _osc.connect(_gain);
  _gain.connect(_analyser);
  _analyser.connect(_ctx.destination);
  _osc.start();
}

export async function unlock() {
  _ensureAudio();
  if (_ctx && _ctx.state === "suspended") {
    try { await _ctx.resume(); } catch(_) {}
  }
}

onFirstGesture(unlock); // works on iOS/Android/desktop

export function setToneHz(hz, meta) {
  if (Number.isFinite(hz) && hz > 0) _lastHz = hz;

  _ensureAudio();
  if (_ctx && _ctx.state === "suspended") _ctx.resume().catch(()=>{});

  if (_osc && _ctx) {
    const t = _ctx.currentTime;
    _osc.frequency.setTargetAtTime(_lastHz, t, 0.02);
  }

  const payload = Object.assign({ hz: Number(_lastHz) || null }, meta || {});
  _listeners.forEach(fn => { try { fn(payload); } catch(_){} });
}

export function onToneChange(fn) {
  if (typeof fn === "function") _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function getAnalyser() {
  _ensureAudio();
  return _analyser || _fake || new FakeAnalyser();
}

export function setVolume(v) {
  if (!_gain) return;
  const x = Math.max(0, Math.min(1, Number(v) || 0));
  _gain.gain.setTargetAtTime(x, _ctx.currentTime, 0.05);
}