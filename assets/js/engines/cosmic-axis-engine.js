/**
 * ✦ Cosmic Axis Engine -- Codex 144:99
 * Museum-grade geometry engine for a "cosmos on a tilted axis" with a spiral nodal system.
 * Built for chapels like Living Sculpture Fusion. ND-safe (no autoplay audio), zero external deps.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * FEATURES
 * - Draws a celestial field on a tilted axis (default 23.5°) with ecliptic, meridians, Jacob's Ladder spine,
 *   rose/vesica tracery, and a logarithmic or Archimedean spiral node lattice (up to 144+ nodes).
 * - Palette aware (wash/ink/accent/gold). Works with your stylepacks.json (array or map).
 * - Modular overlays: I Ching hexagram bands, numerology resonance, planetary tints (gentle).
 * - Deterministic composition via seeded RNG; respects prefers-reduced-motion.
 * - High-DPI aware; exports clean API: mount(), renderTo(), update(), setPalette(), setHexagram(), setNumerology(),
 *   applyPlanet(), start(), stop(), dispose(), getSnapshot().
 *
 * USAGE (ESM):
 *   import * as CosmicAxis from "/assets/js/engines/cosmic-axis-engine.js";
 *   const axis = CosmicAxis.mount("#stage", { tiltDeg: 23.5, nodes: 144, palette: myPalette });
 *   axis.update({ hexagram: 31, numerologyKey: 144 });
 *
 *   // one-off:
 *   CosmicAxis.renderTo(ctx, { width: 1280, height: 720, palette: myPalette });
 *
 * PALETTE SHAPE
 *   { wash:"#f7f2e9", ink:"#1b1b1b", accent:"#2f5a9e", gold:"#d4af37" }
 *
 * COPYRIGHT
 *   © You. ND-safe visual engine. No audio here. Keep provenance in plaques.
 */

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const DEFAULTS = {
  width: 1280,
  height: 720,
  tiltDeg: 23.5,              // Earth-like axial tilt
  nodes: 144,                 // spiral node count
  arms: 2,                    // spiral arms
  spiral: "log",              // "log" or "arch"
  pitch: 0.10,                // growth rate (log) or spacing (arch)
  nodalRadius: 2.4,
  nodalGain: 0.9,             // how radius scales across index
  palette: { wash:"#f7f2e9", ink:"#1a1714", accent:"#2f5a9e", gold:"#d4af37" },
  overlays: {
    aeons: 14,
    meridians: 12,
    drawEcliptic: true,
    drawEquator: true,
    drawMeridians: true,
    drawLadder: true,
    drawRose: true,
    drawVesica: true,
    drawHexagram: false
  },
  hexagram: 0,                // 1..64 to activate; 0 disables
  numerologyKey: null,        // e.g. 11/22/33/72/99/144 → modulates petals/rungs
  planet: null,               // Moon/Venus/Sun/Mercury/Jupiter/Mars/Saturn (tints + subtle tilt drift)
  hueSeedHz: 0,               // optional: derive tiny hue drift from tone Hz
  seed: "cathedral",          // deterministic random seed for composition
  animate: true,              // respects prefers-reduced-motion
  caption: true,              // draw a discreet lower caption
  textures: [],               // pre-rendered flame/fractal images (string URLs); first will be used if provided
  fractalRenderer: null       // optional function(ctx, bounds, settings) for live passes
};

/* ────────────────────────── STATE & RNG ────────────────────────── */

function createRng(seed) {
  // Mulberry32 -- deterministic, tiny, fast
  let h = 1779033703 ^ seedHash(seed);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return (t / 4294967296);
  };
}
function seedHash(s) {
  s = String(s || "");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ────────────────────────── COLOR UTILS ────────────────────────── */

function hexToRgb(h) {
  const x = parseInt(String(h).replace("#",""), 16);
  return { r:(x>>16)&255, g:(x>>8)&255, b:x&255 };
}
function rgbToHex(o) {
  const n = (o.r<<16) | (o.g<<8) | o.b;
  return "#"+("000000"+n.toString(16)).slice(-6);
}
function blend(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex({ r:Math.round(lerp(A.r,B.r,t)), g:Math.round(lerp(A.g,B.g,t)), b:Math.round(lerp(A.b,B.b,t)) });
}
function lerp(a,b,t){ return a + (b - a) * t; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

/* ────────────────────────── GEOMETRY ────────────────────────── */

function spiralNodes(cfg, rng) {
  const { nodes, arms, spiral, pitch, nodalRadius, nodalGain, width, height } = cfg;
  const cx = width * 0.5, cy = height * 0.5;
  const maxR = Math.min(width, height) * 0.46;

  const out = [];
  for (let i=0; i<nodes; i++) {
    const armIdx = i % arms;
    const t = Math.floor(i / arms) + 1; // step along that arm
    const theta = (armIdx / arms) * TAU + t * (spiral === "log" ? 0.27 : 0.36);
    const r = (spiral === "log")
      ? Math.min(maxR, Math.exp(pitch * t) - 1) * (maxR / Math.exp(pitch * (nodes/arms)))
      : Math.min(maxR, t * (pitch * 6.0));

    const jitter = (rng() - 0.5) * Math.max(1, nodalRadius * 0.5);
    const x = cx + Math.cos(theta) * r + jitter;
    const y = cy + Math.sin(theta) * r + jitter;
    const base = nodalRadius * Math.pow(nodalGain, i / nodes);
    const a = 0.75 * (1 - i / (nodes + 8)); // fade outer nodes
    out.push({ x, y, r: base, alpha: a });
  }
  return out;
}

function hexagramLines(n) {
  // Return 6 lines bottom→top, 1=yang (solid), 0=yin (broken)
  // Here we map 1..64 over 6-bit pattern
  const idx = clamp((n|0)-1, 0, 63);
  const lines = [];
  for (let i=0;i<6;i++) lines.push((idx >> i) & 1);
  return lines;
}

/* ────────────────────────── PLANET MAP ────────────────────────── */

const PLANET = {
  moon:    { hue: 210, tiltDelta: -0.6 },
  mercury: { hue: 180, tiltDelta:  0.2 },
  venus:   { hue: 300, tiltDelta:  0.4 },
  sun:     { hue:  20, tiltDelta:  0.1 },
  mars:    { hue: 350, tiltDelta:  0.3 },
  jupiter: { hue:  40, tiltDelta:  0.2 },
  saturn:  { hue:  60, tiltDelta: -0.4 }
};

/* ────────────────────────── CORE RENDER ────────────────────────── */

function drawCosmos(ctx, cfg, tClock = 0) {
  const {
    width, height, palette, overlays, tiltDeg, planet, hueSeedHz, hexagram, numerologyKey,
    textures, fractalRenderer
  } = cfg;

  // DPR guard
  ctx.save();
  ctx.clearRect(0,0,width,height);

  // Backdrop (wash + aeon rings)
  ctx.fillStyle = palette.wash;
  ctx.fillRect(0,0,width,height);

  const cx = width * 0.5, cy = height * 0.5;
  const aeons = overlays.aeons|0;
  const rings = Math.max(4, aeons);
  for (let i=0;i<rings;i++) {
    const r = lerp(20, Math.min(width,height)*0.48, i/(rings-1));
    const g = ctx.createRadialGradient(cx,cy, r*0.12, cx,cy, r);
    g.addColorStop(0, blend(palette.accent, "#ffffff", 0.78));
    g.addColorStop(1, blend(palette.ink, palette.wash, 0.82));
    ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU); ctx.fillStyle=g; ctx.fill();
  }

  // Optional flame texture underlays
  if (Array.isArray(textures) && textures.length && textures[0]?._img) {
    ctx.globalAlpha = 0.22;
    const img = textures[0]._img;
    const ratio = Math.max(width/img.width, height/img.height);
    const w = img.width * ratio, h = img.height * ratio;
    ctx.drawImage(img, (width - w)/2, (height - h)/2, w, h);
    ctx.globalAlpha = 1;
  }

  // Planetary gentle hue drift via composition (tiny)
  let tilt = tiltDeg;
  if (planet && PLANET[planet]) tilt += PLANET[planet].tiltDelta;
  const rot = (tilt * Math.PI) / 180;

  // Ecliptic + Equator
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  if (overlays.drawEcliptic) {
    ctx.strokeStyle = blend(palette.accent, "#000000", 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, width*0.42, height*0.22, 0, 0, TAU);
    ctx.stroke();
  }

  if (overlays.drawEquator) {
    ctx.strokeStyle = blend(palette.ink, palette.wash, 0.25);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, width*0.28, height*0.08, 0, 0, TAU);
    ctx.stroke();
  }

  // Meridians
  if (overlays.drawMeridians) {
    const m = Math.max(6, overlays.meridians|0);
    ctx.strokeStyle = blend(palette.accent, "#000000", 0.25);
    ctx.lineWidth = 1.1;
    for (let i=0;i<m;i++) {
      const a = (i/m)*TAU;
      const x1 = Math.cos(a) * width * 0.48, y1 = Math.sin(a) * height * 0.30;
      const x2 = Math.cos(a) * width * 0.18, y2 = Math.sin(a) * height * 0.06;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
  }

  // Ladder spine (Jacob's)
  if (overlays.drawLadder) {
    ctx.strokeStyle = blend(palette.accent, "#000000", 0.25);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0,0, width*0.05, height*0.40, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.4;
    const steps = laddersFromNumerology(numerologyKey);
    for (let i=0;i<steps;i++) {
      const a = (i/steps) * TAU;
      const x1 = Math.cos(a) * width * 0.40, y1 = Math.sin(a) * height * 0.28;
      const x2 = Math.cos(a + 0.42) * width * 0.20, y2 = Math.sin(a + 0.42) * height * 0.14;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
  }

  // Rose + Vesica overlays
  if (overlays.drawRose) {
    ctx.strokeStyle = blend(palette.gold, palette.accent, 0.4);
    ctx.lineWidth = 1.4;
    const r = Math.min(width,height)*0.18;
    const petals = petalsFromNumerology(numerologyKey);
    for (let i=0;i<petals;i++) {
      const a = (i/petals)*TAU;
      ctx.beginPath(); ctx.ellipse(0,0, r, r*0.42, a, 0, TAU); ctx.stroke();
    }
  }
  if (overlays.drawVesica) {
    ctx.strokeStyle = blend(palette.gold, palette.accent, 0.45);
    ctx.lineWidth = 1.2;
    const r = Math.min(width,height)*0.16;
    ctx.beginPath(); ctx.ellipse(-r*0.55, 0, r*0.9, r*0.44, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse( r*0.55, 0, r*0.9, r*0.44, 0, 0, TAU); ctx.stroke();
  }

  // Unrotate to draw screen-aligned content
  ctx.rotate(-rot);

  // Hexagram bands (screen-aligned for legibility)
  if (hexagram && overlays.drawHexagram) {
    const lines = hexagramLines(hexagram);
    ctx.strokeStyle = blend(palette.ink, palette.wash, 0.35);
    ctx.lineWidth = 3;
    const r = Math.min(width, height)*0.28;
    for (let i=0;i<6;i++) {
      const y = -r*0.65 + i*(r*0.22);
      if (lines[i] === 1) {
        segment(ctx, -r*0.74, y, r*0.74, y);
      } else {
        segment(ctx, -r*0.74, y, -r*0.16, y);
        segment(ctx,  r*0.16, y,  r*0.74, y);
      }
    }
  }

  // Spiral nodes (deterministic, gently animated alpha)
  const rng = createRng(cfg.seed);
  const nodes = spiralNodes(cfg, rng);
  const twinkle = Math.sin(tClock * 0.8) * 0.08; // gentle, ND-friendly
  for (let i=0;i<nodes.length;i++) {
    const n = nodes[i];
    const a = clamp(n.alpha + twinkle * (i % 5 === 0 ? 1 : -1), 0.05, 0.95);
    ctx.globalAlpha = a;
    ctx.fillStyle = i % 9 === 0
      ? blend(palette.gold, palette.accent, 0.3)
      : blend(palette.accent, "#000000", 0.15);
    ctx.beginPath(); ctx.arc(n.x - cx, n.y - cy, n.r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Optional live fractal pass
  if (typeof fractalRenderer === "function") {
    try {
      fractalRenderer(ctx, { x:-cx, y:-cy, width, height }, {
        hueSeed: hueSeedHz,
        softness: 0.35,
        radius: Math.min(width, height) * 0.28
      });
    } catch (e) { /* ignore */ }
  }

  // Frame + caption
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(-cx+10, -cy+10, width-20, height-20);

  if (cfg.caption) {
    ctx.fillStyle = palette.ink;
    ctx.font = "14px Georgia, serif";
    const lbl = captionFor(cfg);
    ctx.fillText(lbl, -cx + 24, cy - 18);
  }

  ctx.restore();
}

/* ────────────────────────── HELPERS ────────────────────────── */

function laddersFromNumerology(n) {
  // Map 11/22/33/72/99/144 → distinct rung counts
  const k = Number(n)||0;
  if (!k) return 33;
  if (k === 11) return 22;
  if (k === 22) return 44;
  if (k === 33) return 33;
  if (k === 72) return 36;
  if (k === 99) return 45;
  if (k === 144) return 48;
  return 33;
}
function petalsFromNumerology(n) {
  const k = Number(n)||0;
  if (!k) return 8;
  if (k === 11) return 7;
  if (k === 22) return 10;
  if (k === 33) return 12;
  if (k === 72) return 9;
  if (k === 99) return 11;
  if (k === 144) return 16;
  return 8;
}
function segment(ctx, x1,y1,x2,y2){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }

function normalizePalette(p) {
  // Accept array of 4 or object with wash/ink/accent/gold
  if (Array.isArray(p)) {
    const [wash, ink, accent, gold] = p;
    return {
      wash:  wash  || DEFAULTS.palette.wash,
      ink:   ink   || DEFAULTS.palette.ink,
      accent:accent|| DEFAULTS.palette.accent,
      gold:  gold  || DEFAULTS.palette.gold
    };
  }
  return {
    wash:  p?.wash  || DEFAULTS.palette.wash,
    ink:   p?.ink   || DEFAULTS.palette.ink,
    accent:p?.accent|| DEFAULTS.palette.accent,
    gold:  p?.gold  || DEFAULTS.palette.gold
  };
}

function devicePixelRatioOf(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { dpr, width: w, height: h };
}

function captionFor(cfg) {
  const p = cfg.planet ? cfg.planet[0].toUpperCase()+cfg.planet.slice(1) : "--";
  const hx = cfg.hexagram ? String(cfg.hexagram) : "--";
  const nk = cfg.numerologyKey ? String(cfg.numerologyKey) : "--";
  return [
    `Tilt: ${cfg.tiltDeg.toFixed(1)}°`,
    `Nodes: ${cfg.nodes}`,
    `Planet: ${p}`,
    `Hex: ${hx}`,
    `Key: ${nk}`
  ].join("   •   ");
}

/* ────────────────────────── RUNTIME WRAPPER ────────────────────────── */

class AxisInstance {
  constructor(canvas, options) {
    this.canvas = typeof canvas === "string" ? document.querySelector(canvas) : canvas;
    if (!this.canvas) throw new Error("CosmicAxis.mount: canvas not found.");
    this.ctx = this.canvas.getContext("2d");
    this.running = false;
    this.t0 = performance.now();
    this.textures = [];
    this.opts = { ...DEFAULTS, ...options };
    this.opts.palette = normalizePalette(this.opts.palette || DEFAULTS.palette);
    this.opts.overlays = { ...DEFAULTS.overlays, ...(options?.overlays||{}) };
    this._raf = 0;
    this._onResize = () => this._resize();
    window.addEventListener("resize", this._onResize, { passive:true });
    this._resize();
    this._preloadTextures().then(()=> this._frame());
  }

  async _preloadTextures() {
    const list = Array.isArray(this.opts.textures) ? this.opts.textures : [];
    const tasks = list.map(src => new Promise(res=>{
      const img = new Image(); img.referrerPolicy = "no-referrer";
      img.onload = ()=>res({ src, _img: img }); img.onerror = ()=>res(null);
      img.src = src;
    }));
    const loaded = (await Promise.all(tasks)).filter(Boolean);
    this.textures = loaded;
    this.opts.textures = loaded; // store on opts so renderer can access
  }

  _resize() {
    const { width, height } = devicePixelRatioOf(this.canvas);
    this.opts.width = width;
    this.opts.height = height;
    if (!this.running) {
      drawCosmos(this.ctx, this.opts, 0);
    }
  }

  _frame = () => {
    const rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = (performance.now() - this.t0) / 1000;
    if (this.running && !rm && this.opts.animate) {
      drawCosmos(this.ctx, this.opts, t);
      this._raf = requestAnimationFrame(this._frame);
    } else {
      drawCosmos(this.ctx, this.opts, t);
    }
    // Dispatch a curator event for hooks
    try {
      const ev = new CustomEvent("cosmic-axis:frame", { detail: { time:t, options: this.opts } });
      this.canvas.dispatchEvent(ev);
    } catch(_) {}
  };

  start() {
    if (this.running) return this;
    this.running = true;
    this._frame();
    return this;
  }
  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
    return this;
  }
  dispose() {
    this.stop();
    window.removeEventListener("resize", this._onResize);
  }

  update(patch = {}) {
    // merge shallow options; deep-merge overlays and palette
    if (patch.palette) this.setPalette(patch.palette);
    if (patch.overlays) this.opts.overlays = { ...this.opts.overlays, ...patch.overlays };
    const shallow = { ...patch };
    delete shallow.palette; delete shallow.overlays;
    Object.assign(this.opts, shallow);
    // gentle clamp
    this.opts.tiltDeg = Number(this.opts.tiltDeg);
    this.opts.nodes = clamp(this.opts.nodes|0, 12, 999);
    this._frame();
    return this;
  }

  setPalette(p) {
    this.opts.palette = normalizePalette(p);
    this._frame();
    return this;
  }
  setHexagram(n) {
    this.opts.hexagram = clamp(Number(n)||0, 0, 64);
    this.opts.overlays.drawHexagram = this.opts.hexagram > 0;
    this._frame();
    return this;
  }
  setNumerology(n) {
    this.opts.numerologyKey = n == null ? null : String(n);
    this._frame();
    return this;
  }
  applyPlanet(name) {
    const key = String(name||"").toLowerCase();
    this.opts.planet = PLANET[key] ? key : null;
    this._frame();
    return this;
  }
  setFractalRenderer(fn) {
    this.opts.fractalRenderer = typeof fn === "function" ? fn : null;
    this._frame();
    return this;
  }
  getSnapshot() {
    const { width, height, ...rest } = this.opts;
    return JSON.parse(JSON.stringify(rest));
  }
}

/* ────────────────────────── PUBLIC API ────────────────────────── */

export function mount(canvasOrSelector, options = {}) {
  const inst = new AxisInstance(canvasOrSelector, options);
  if (options.animate && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    inst.start();
  }
  return inst;
}

export function renderTo(ctx, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  opts.palette = normalizePalette(opts.palette || DEFAULTS.palette);
  opts.overlays = { ...DEFAULTS.overlays, ...(options?.overlays||{}) };
  // Preload texture images on the fly if passed in -- render immediately if not loaded.
  if (Array.isArray(opts.textures)) {
    opts.textures = opts.textures.map(src => (typeof src === "string" ? { src } : src));
  } else {
    opts.textures = [];
  }
  drawCosmos(ctx, opts, 0);
  return true;
}

export function setStylepackPaletteFrom(stylepack) {
  // Accept a stylepack object with .palette in array or object form.
  return normalizePalette(stylepack?.palette || {});
}

// Convenience: derive palette gently from an angels72 entry (if it carried a stylepack)
export function paletteFromAngel(angel, stylepackMap) {
  const key = angel?.stylepack;
  if (!key || !stylepackMap) return null;
  const pack = Array.isArray(stylepackMap?.packs)
    ? stylepackMap.packs.find(p => p.id === key)
    : stylepackMap[key];
  if (!pack) return null;
  return normalizePalette(pack.palette);
}

/* ────────────────────────── END ────────────────────────── */