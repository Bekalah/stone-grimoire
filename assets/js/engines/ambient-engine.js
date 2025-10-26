// assets/js/engines/ambient-engine.js
// Single AudioContext (safe), tone pub/sub, analyser, reduced-motion aware.

let _ctx = null, _osc = null, _gain = null, _analyser = null;
const _listeners = new Set();
let _lastHz = 432;
let _ensured = false;

class FakeAnalyser {
  constructor(){ this.frequencyBinCount = 512; this._t = 0; }
  getByteFrequencyData(arr){
    this._t += 0.016;
    const base = 40 + Math.floor(30 * Math.sin(this._t));
    for (let i = 0; i < arr.length; i++) arr[i] = base + ((i % 32) * 2);
  }
}

function reducedMotion(){ 
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export async function ensureAudio(){
  if (_ensured) return;
  _ensured = true;

  if (reducedMotion()) { _analyser = new FakeAnalyser(); return; }

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { _analyser = new FakeAnalyser(); return; }

  _ctx = new AC({ latencyHint: "interactive" });
  _osc = _ctx.createOscillator();
  _osc.type = "sine";
  _osc.frequency.value = _lastHz;

  _gain = _ctx.createGain();
  _gain.gain.value = 0.04; // ND-safe default

  _analyser = _ctx.createAnalyser();
  _analyser.fftSize = 1024;
  _analyser.smoothingTimeConstant = 0.85;

  _osc.connect(_gain);
  _gain.connect(_analyser);
  _analyser.connect(_ctx.destination);
  _osc.start();

  if (_ctx.state === "suspended") {
    try { await _ctx.resume(); } catch(_) {}
  }
}

export function getAnalyser(){ return _analyser || new FakeAnalyser(); }

export function onToneChange(fn){
  if (typeof fn === "function") _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function setToneHz(hz, meta){
  if (Number.isFinite(hz) && hz > 0) _lastHz = hz;
  if (_osc && _ctx) {
    const t = _ctx.currentTime;
    _osc.frequency.setTargetAtTime(_lastHz, t, 0.02);
  }
  const payload = Object.assign({ hz: Number(_lastHz)||null }, meta || {});
  _listeners.forEach(fn => { try { fn(payload); } catch(_){} });
}

export function setVolume(v){
  if (!_gain) return;
  const x = Math.max(0, Math.min(1, Number(v)||0));
  _gain.gain.setTargetAtTime(x, _ctx.currentTime, 0.05);
}

// user gesture unlock (harmless if already running)
window.addEventListener("pointerdown", () => { ensureAudio(); }, { once:true, passive:true });