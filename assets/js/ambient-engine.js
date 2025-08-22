// Ambient Harmonics Engine (ND-friendly, museum-grade)
// Sets a gentle drone + cycling Solfeggio tones; optional binaural; soft EQ and reverb.
// Usage: import on any Temple page AFTER the DOM, e.g. <script type="module" src="./assets/js/ambient-engine.js"></script>

const Ambient = (() => {
  const state = {
    ctx: null,
    started: false,
    config: null,
    roomId: null,
    nodes: {},
    prefs: {
      muted: false,
      visualizeOnly: false,
      binauralEnabled: null, // null = follow config
      volumeDb: null,        // null = follow config
      softenHighs: true
    }
  };

  // Utilities
  const dbToGain = db => Math.pow(10, db / 20);
  const now = () => state.ctx ? state.ctx.currentTime : 0;

  async function loadConfig() {
    const path = resolvePath("./assets/data/ambient.json");
    const r = await fetch(path);
    state.config = await r.json();
  }

  // Resolve relative path from page nesting
  function resolvePath(p) {
    const base = document.currentScript?.src || document.location.pathname;
    // crude but effective: if we're in /chapels/ or /rooms/, prepend ../
    const up = base.includes("/chapels/") || base.includes("/rooms/") ? "../" :
               base.includes("/patrons/") || base.includes("/plans/")  ? "../" : "./";
    return (p.startsWith("./") ? p.replace("./", up) : p);
  }

  function inferRoomId() {
    // Prefer explicit data-room; else from filename; else null
    const explicit = document.body.getAttribute("data-room");
    if (explicit) return explicit;
    const path = location.pathname;
    const name = path.split("/").pop();
    if (name === "index.html" || name === "" ) return "frontispiece";
    if (name === "cathedral.html") return "cathedral";
    // fallback: strip .html
    return name.replace(/\.html$/,"");
  }

  function applyRoomConfig() {
    const defaults = state.config.defaults || {};
    const rooms = state.config.rooms || {};
    const room = rooms[state.roomId] || {};
    // merged
    state.active = {
      volumeDb: pick(state.prefs.volumeDb, defaults.volumeDb),
      fundamentalHz: room.fundamentalHz || defaults.fundamentalHz || 96,
      useJustIntonation: defaults.useJustIntonation !== false,
      overtoneGains: defaults.overtoneGains || [1.0, 0.42, 0.22],
      lpCutoffHz: defaults.lpCutoffHz || 9000,
      hiSoftDb: state.prefs.softenHighs ? (defaults.hiSoftDb ?? -6) : 0,
      convolutionIR: defaults.convolutionIR || null,
      solfeggioCycle: room.solfeggioCycle || defaults.solfeggioCycle || [396, 528, 639],
      cycleSeconds: defaults.cycleSeconds || 180,
      binaural: {
        enabled: pick(state.prefs.binauralEnabled, defaults.binaural?.enabled) || false,
        beatHz: (room.binaural?.beatHz) || (defaults.binaural?.beatHz || 6)
      },
      startPaused: defaults.startPaused !== false,
      visualizeOnlyDefault: defaults.visualizeOnlyDefault || false
    };
    if (state.prefs.visualizeOnly == null) {
      state.prefs.visualizeOnly = state.active.visualizeOnlyDefault;
    }
  }

  function pick(pref, def) { return pref == null ? def : pref; }

  async function initAudio() {
    if (state.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    state.ctx = new AC();
    // Master
    const masterGain = state.ctx.createGain();
    masterGain.gain.value = 0.00001; // fade in later
    const analyser = state.ctx.createAnalyser();
    analyser.fftSize = 1024;
    // Filters
    const lowpass = state.ctx.createBiquadFilter();
    lowpass.type = "lowpass"; lowpass.frequency.value = state.active.lpCutoffHz;
    const highshelf = state.ctx.createBiquadFilter();
    highshelf.type = "highshelf"; highshelf.frequency.value = 6000;
    highshelf.gain.value = state.active.hiSoftDb; // soften highs by default
    // Reverb (convolver) — optional
    const convolver = state.ctx.createConvolver();
    await loadIR(convolver, state.active.convolutionIR);

    // Chain: mix -> highshelf -> lowpass -> convolver -> master -> analyser -> destination
    const mix = state.ctx.createGain();
    mix.connect(highshelf); highshelf.connect(lowpass);
    lowpass.connect(convolver); convolver.connect(masterGain);
    masterGain.connect(analyser); analyser.connect(state.ctx.destination);

    state.nodes = { masterGain, analyser, mix, convolver, lowpass, highshelf };

    // Build sources
    buildDrone(mix);
    buildSolfeggio(mix);
    if (state.active.binaural.enabled) buildBinaural(mix);

    // Fade in to configured volume
    const target = dbToGain(state.active.volumeDb);
    ramp(masterGain.gain, target, 6);
  }

  async function loadIR(convolver, url) {
    try {
      if (!url) { convolver.buffer = generateSimpleIR(state.ctx); return; }
      const res = await fetch(resolvePath(url));
      if (!res.ok) { convolver.buffer = generateSimpleIR(state.ctx); return; }
      const arr = await res.arrayBuffer();
      convolver.buffer = await state.ctx.decodeAudioData(arr);
    } catch {
      convolver.buffer = generateSimpleIR(state.ctx);
    }
  }

  function generateSimpleIR(ctx) {
    // Lightweight exponentially decaying noise as fallback "stone" space
    const len = ctx.sampleRate * 3.5;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch=0; ch<2; ch++){
      const data = buf.getChannelData(ch);
      for (let i=0;i<len;i++){
        const t = i/len;
        data[i] = (Math.random()*2-1) * Math.pow(1 - t, 2.4) * 0.4;
      }
    }
    return buf;
  }

  function ramp(param, value, seconds=1) {
    const t = now();
    param.cancelScheduledValues(t);
    param.setTargetAtTime(value, t, Math.max(0.05, seconds/5)); // smooth
  }

  function buildDrone(dest) {
    const g = state.ctx.createGain();
    g.gain.value = 0.35; // overall drone level
    g.connect(dest);

    const base = mkOsc(state.active.fundamentalHz, "sine", 0.35 * state.active.overtoneGains[0]);
    const fifth = mkOsc(state.active.fundamentalHz * (3/2), "sine", 0.22 * (state.active.overtoneGains[1]||0.42));
    const octave = mkOsc(state.active.fundamentalHz * 2, "sine", 0.12 * (state.active.overtoneGains[2]||0.22));

    base.gain.connect(g); fifth.gain.connect(g); octave.gain.connect(g);
    base.start(); fifth.start(); octave.start();

    state.nodes.drone = { base, fifth, octave, groupGain: g };
  }

  function buildSolfeggio(dest) {
    const osc = state.ctx.createOscillator();
    osc.type = "sine";
    const gain = state.ctx.createGain();
    gain.gain.value = 0.18;
    osc.connect(gain).connect(dest);
    osc.start();
    state.nodes.solf = { osc, gain, idx: 0, timer: null };
    // start cycling
    cycleSolfeggio();
  }

  function cycleSolfeggio() {
    const { solf } = state.nodes; if (!solf) return;
    const seq = state.active.solfeggioCycle;
    if (!seq || !seq.length) return;
    const hz = seq[solf.idx % seq.length];
    // smooth glide to next frequency
    solf.osc.frequency.cancelScheduledValues(now());
    solf.osc.frequency.linearRampToValueAtTime(hz, now() + 4);
    // schedule next
    clearTimeout(solf.timer);
    solf.timer = setTimeout(() => {
      solf.idx++;
      cycleSolfeggio();
    }, state.active.cycleSeconds * 1000);
  }

  function buildBinaural(dest) {
    const pannerL = state.ctx.createStereoPanner(); pannerL.pan.value = -1;
    const pannerR = state.ctx.createStereoPanner(); pannerR.pan.value =  1;
    const gL = state.ctx.createGain(); const gR = state.ctx.createGain();
    gL.gain.value = 0.09; gR.gain.value = 0.09;

    const target = state.active.solfeggioCycle?.[0] || 396;
    const beat = state.active.binaural.beatHz || 6;

    const oscL = state.ctx.createOscillator();
    const oscR = state.ctx.createOscillator();
    oscL.type="sine"; oscR.type="sine";
    oscL.frequency.value = target - beat/2;
    oscR.frequency.value = target + beat/2;

    oscL.connect(gL).connect(pannerL).connect(dest);
    oscR.connect(gR).connect(pannerR).connect(dest);
    oscL.start(); oscR.start();

    state.nodes.binaural = { oscL, oscR, gL, gR, beat };
  }

  function mkOsc(freq, type="sine", level=0.2) {
    const osc = state.ctx.createOscillator();
    osc.type = type;
    const gain = state.ctx.createGain();
    gain.gain.value = level;
    osc.connect(gain);
    osc.frequency.value = freq;
    return { osc, gain, start: () => osc.start(), stop: () => osc.stop() };
  }

  // Public API
  async function boot() {
    if (!document.body) return;
    await loadConfig();
    state.roomId = document.body.getAttribute("data-room") || inferRoomId();
    applyRoomConfig();

    // Restore prefs
    try {
      const saved = JSON.parse(localStorage.getItem("ambient-prefs")||"{}");
      Object.assign(state.prefs, saved);
    } catch {}

    // Lazy start on first user gesture
    const gesture = async () => {
      if (state.started || state.prefs.visualizeOnly) { detach(); return; }
      await initAudio();
      state.started = true;
      if (state.prefs.muted) mute(true);
      detach();
    };
    const detach = () => {
      window.removeEventListener("click", gesture);
      window.removeEventListener("touchstart", gesture, {passive:true});
      window.removeEventListener("keydown", gesture);
    };
    window.addEventListener("click", gesture);
    window.addEventListener("touchstart", gesture, {passive:true});
    window.addEventListener("keydown", gesture);

    // Always expose analyser for visuals, even if muted or visualize-only
    window.Ambient = {
      analyser: () => state.nodes.analyser || null,
      setMuted: mute,
      setVolumeDb,
      setBinaural,
      setVisualizeOnly,
      isStarted: () => state.started,
      room: () => state.roomId
    };
  }

  function mute(flag) {
    state.prefs.muted = flag;
    savePrefs();
    if (!state.nodes.masterGain) return;
    ramp(state.nodes.masterGain.gain, flag ? 0.00001 : dbToGain(state.active.volumeDb), 1.2);
  }
  function setVolumeDb(db) {
    state.prefs.volumeDb = db;
    savePrefs();
    if (!state.nodes.masterGain) return;
    ramp(state.nodes.masterGain.gain, dbToGain(db), 0.8);
  }
  function setBinaural(flag) {
    state.prefs.binauralEnabled = flag;
    savePrefs();
    // Only affects new sessions; to live-tweak, we’d rebuild the chain.
    // For now, simple mute/unmute the binaural group if present:
    if (state.nodes.binaural) {
      state.nodes.binaural.gL.gain.value = flag ? 0.09 : 0.0;
      state.nodes.binaural.gR.gain.value = flag ? 0.09 : 0.0;
    }
  }
  function setVisualizeOnly(flag) {
    state.prefs.visualizeOnly = flag;
    savePrefs();
    if (flag) mute(true);
  }
  function savePrefs() {
    try { localStorage.setItem("ambient-prefs", JSON.stringify(state.prefs)); } catch {}
  }

  document.addEventListener("DOMContentLoaded", boot);
  return {};
})();
export default Ambient;
