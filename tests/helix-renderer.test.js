/* 
  Tests for helix-renderer.mjs
  Testing library/framework: Jest/Vitest style (describe/it/expect). 
  This file uses standard BDD globals which are compatible with Jest and Vitest.
*/

import { renderHelix } from '../src/helix-renderer.mjs';

/**
 * Build a robust mock CanvasRenderingContext2D that records operations.
 * We track:
 *  - property sets (strokeStyle, fillStyle, lineWidth, lineCap)
 *  - method calls (save, restore, clearRect, fillRect, beginPath, moveTo, lineTo, stroke, fill, arc, setLineDash, createRadialGradient)
 * We also maintain a save/restore depth to segment layers.
 */
function makeMockCtx() {
  const events = [];
  let depth = 0;
  let currentStrokeStyle = null;
  let currentFillStyle = null;
  let currentLineWidth = null;
  let currentLineCap = null;
  let currentDash = [];

  function record(type, payload = {}) {
    events.push({ type, depth, strokeStyle: currentStrokeStyle, fillStyle: currentFillStyle, lineWidth: currentLineWidth, lineCap: currentLineCap, lineDash: currentDash.slice(), ...payload });
  }

  const gradientObjects = [];
  const ctx = {
    get _events() { return events; },
    get _gradientObjects() { return gradientObjects; },
    get _depth() { return depth; },

    save() { depth += 1; record('save'); },
    restore() { record('restore'); depth = Math.max(0, depth - 1); },
    clearRect(x, y, w, h) { record('clearRect', { x, y, w, h }); },
    fillRect(x, y, w, h) { record('fillRect', { x, y, w, h }); },
    beginPath() { record('beginPath'); },
    moveTo(x, y) { record('moveTo', { x, y }); },
    lineTo(x, y) { record('lineTo', { x, y }); },
    stroke() { record('stroke'); },
    fill() { record('fill'); },
    arc(x, y, r, s, e) { record('arc', { x, y, r, s, e }); },
    setLineDash(arr) { currentDash = Array.isArray(arr) ? arr.slice() : []; record('setLineDash', { value: currentDash.slice() }); },
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
      const grad = { stops: [], x0, y0, r0, x1, y1, r1, addColorStop(offset, color) { grad.stops.push({ offset, color }); } };
      gradientObjects.push(grad);
      record('createRadialGradient', { x0, y0, r0, x1, y1, r1, id: gradientObjects.length - 1 });
      return grad;
    },
  };

  // Define tracked style properties with setters that record updates
  Object.defineProperty(ctx, 'strokeStyle', {
    get() { return currentStrokeStyle; },
    set(v) { currentStrokeStyle = v; record('set:strokeStyle', { value: v }); },
    enumerable: true,
  });
  Object.defineProperty(ctx, 'fillStyle', {
    get() { return currentFillStyle; },
    set(v) { currentFillStyle = v; record('set:fillStyle', { value: v }); },
    enumerable: true,
  });
  Object.defineProperty(ctx, 'lineWidth', {
    get() { return currentLineWidth; },
    set(v) { currentLineWidth = v; record('set:lineWidth', { value: v }); },
    enumerable: true,
  });
  Object.defineProperty(ctx, 'lineCap', {
    get() { return currentLineCap; },
    set(v) { currentLineCap = v; record('set:lineCap', { value: v }); },
    enumerable: true,
  });

  return ctx;
}

// Utilities for analyzing the event log
function segmentByDepth(events, targetDepth) {
  // Returns contiguous spans at specific depth (enter at save to that depth, exit at restore)
  const spans = [];
  let start = -1;
  let currentDepth = 0;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.type === 'save') currentDepth += 1;
    if (ev.type === 'restore') currentDepth -= 1;

    // Identify when we are inside a block at the given targetDepth
    // Note: renderHelix calls ctx.save() first (depth=1), each layer uses additional save/restore (depth=2).

    if (currentDepth === targetDepth && start === -1) {
      start = i + 1; // after we reach the depth
    }
    if (currentDepth < targetDepth && start !== -1) {
      spans.push({ start, end: i });
      start = -1;
    }
  }
  if (start !== -1) {
    spans.push({ start, end: events.length - 1 });
  }
  return spans;
}

function sliceEvents(events, span) {
  return events.slice(span.start, span.end + 1);
}

// Convert hex -> rgba like the implementation to compute expected colors in assertions
function hexToRgba(hex, alpha) {
  const value = (hex || '').replace('#', '');
  if (value.length !== 6) return 'rgba(255,255,255,' + alpha + ')';
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

describe('renderHelix', () => {
  const defaultWidth = 1440;
  const defaultHeight = 900;

  it('renders with defaults: clears canvas, paints background, draws all four layers, and restores', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);

    const ev = ctx._events;

    // Top-level save at start and restore at end
    expect(ev.find(e => e.type === 'save')).toBeTruthy();
    expect(ev[ev.length - 1].type).toBe('restore');

    // Clears using default dimensions
    const clear = ev.find(e => e.type === 'clearRect');
    expect(clear).toBeTruthy();
    expect(clear.w).toBe(defaultWidth);
    expect(clear.h).toBe(defaultHeight);

    // Background should do two fillRect calls (base + radial gradient)
    const fills = ev.filter(e => e.type === 'fillRect');
    expect(fills.length).toBeGreaterThanOrEqual(2);
    expect(fills[0].w).toBe(defaultWidth);
    expect(fills[0].h).toBe(defaultHeight);

    // There should be four nested layer save/restore pairs at depth 2
    const depth2Spans = segmentByDepth(ev, 2);

    expect(depth2Spans.length).toBe(4);

    // Total strokes sanity check
    const totalStrokes = ev.filter(e => e.type === 'stroke').length;

    expect(totalStrokes).toBe(209);

    // Total arcs sanity check (2 vesica + 10 tree nodes)
    const totalArcs = ev.filter(e => e.type === 'arc').length;
    expect(totalArcs).toBe(12);
  });

  it('paints background gradient with expected color stops (defaults)', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);

    // First createRadialGradient should be the one from paintBackground
    const grads = ctx._gradientObjects;
    expect(grads.length).toBeGreaterThanOrEqual(1);
    const g = grads[0];

    // Color at 0 comes from layer index 1 with alpha 0.18; fallbackLayers[1] = "#74d8f2"
    expect(g.stops.find(s => s.offset === 0).color).toBe(hexToRgba('#74d8f2', 0.18));
    // Color at 1 comes from bg "#0b0b12" alpha 0
    expect(g.stops.find(s => s.offset === 1).color).toBe(hexToRgba('#0b0b12', 0));
  });

  it('draws Vesica field with 2 circles and 38 grid segments and dashed pattern', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);
    const ev = ctx._events;
    const spans = segmentByDepth(ev, 2);

    // Vesica is first layer span
    const vesica = sliceEvents(ev, spans[0]);

    const arcCount = vesica.filter(e => e.type === 'arc').length;
    expect(arcCount).toBe(2);

    const setDash = vesica.find(e => e.type === 'setLineDash');
    expect(setDash).toBeTruthy();
    expect(setDash.value).toEqual([3, 3]);

    // Count grid segment strokes (after dash set) + circle strokes
    const strokeCount = vesica.filter(e => e.type === 'stroke').length;
    expect(strokeCount).toBe(40); // 2 circle strokes + 38 grid strokes
  });

  it('draws Tree-of-Life with 22 path strokes and 10 node fills at computed radius', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);
    const ev = ctx._events;
    const spans = segmentByDepth(ev, 2);

    // Tree-of-Life is second layer span
    const tree = sliceEvents(ev, spans[1]);

    const pathStrokes = tree.filter(e => e.type === 'stroke').length;
    expect(pathStrokes).toBe(22);

    const nodeArcs = tree.filter(e => e.type === 'arc');
    expect(nodeArcs.length).toBe(10);

    // Radius should be Math.max(4, min(width,height)/144*3)
    const expectedR = Math.max(4, Math.min(defaultWidth, defaultHeight) / 144 * 3);
    nodeArcs.forEach(a => expect(a.r).toBeCloseTo(expectedR, 5));

    // 10 fills for the nodes
    const fills = tree.filter(e => e.type === 'fill');
    expect(fills.length).toBe(10);
  });

  it('draws Fibonacci polyline with 98 line segments and a single stroke', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);
    const ev = ctx._events;
    const spans = segmentByDepth(ev, 2);

    // Fibonacci is third layer span
    const fib = sliceEvents(ev, spans[2]);

    const lineTos = fib.filter(e => e.type === 'lineTo').length;
    expect(lineTos).toBe(98); // 99 points => 98 segments

    const strokes = fib.filter(e => e.type === 'stroke').length;
    expect(strokes).toBe(1);
  });

  it('draws double-helix with 144 crossbar strokes and two strand polylines (288 line segments total after color switch)', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx);
    const ev = ctx._events;
    const spans = segmentByDepth(ev, 2);

    // Helix is fourth layer span
    const helix = sliceEvents(ev, spans[3]);

    // Identify switch from latticeColour to strandColour by strokeStyle set events
    const styleSets = helix.filter(e => e.type === 'set:strokeStyle');
    expect(styleSets.length).toBeGreaterThanOrEqual(2);

    // Find index where second strokeStyle set occurs (strand colour)
    const secondStyleIndex = helix.findIndex((e, i) => e.type === 'set:strokeStyle' && i > helix.findIndex(e2 => e2.type === 'set:strokeStyle'));
    expect(secondStyleIndex).toBeGreaterThan(0);

    // Crossbar strokes occur before the second style set
    const crossbarStrokes = helix.slice(0, secondStyleIndex).filter(e => e.type === 'stroke').length;
    expect(crossbarStrokes).toBe(144);

    // After color change, two polylines are drawn: 2 strokes, 288 lineTo total (144 per strand)
    const after = helix.slice(secondStyleIndex);

    const polyStrokes = after.filter(e => e.type === 'stroke').length;
    expect(polyStrokes).toBe(2);

    const polyLineTos = after.filter(e => e.type === 'lineTo').length;
    expect(polyLineTos).toBe(288);
  });

  it('respects custom dimensions and numerology overrides (affects clearRect and dash pattern)', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx, { width: 800, height: 600, NUM: { THREE: 5 } });

    const ev = ctx._events;
    const clear = ev.find(e => e.type === 'clearRect');
    expect(clear.w).toBe(800);
    expect(clear.h).toBe(600);

    // Vesica layer setLineDash should use [5,5]
    const depth2Spans = segmentByDepth(ev, 2);
    const vesica = sliceEvents(ev, depth2Spans[0]);
    const dash = vesica.find(e => e.type === 'setLineDash');
    expect(dash.value).toEqual([5, 5]);
  });

  it('falls back to palette.ink when layer color is missing for certain indices', () => {
    const ctx = makeMockCtx();
    const custom = {
      palette: {
        bg: '#0b0b12',
        ink: '#112233',
        layers: ['#abcdef'], // only index 0 provided
      }
    };
    renderHelix(ctx, custom);

    const ev = ctx._events;
    const spans = segmentByDepth(ev, 2);
    const vesica = sliceEvents(ev, spans[0]);

    // In vesica, grid colour uses pickLayer index 2 which should fallback to palette.ink
    // The code sets strokeStyle to gridColour (rgba of ink with alpha 0.35) after setting dash.
    const gridStyleEvent = vesica.find(e => e.type === 'set:strokeStyle' && typeof e.value === 'string' && e.value.startsWith('rgba('));
    expect(gridStyleEvent).toBeTruthy();
    expect(gridStyleEvent.value).toBe(hexToRgba('#112233', 0.35));

    // Background gradient colorStop at 0 uses layer index 1 -> fallback to ink due to missing layer
    const grad = ctx._gradientObjects[0];
    const stop0 = grad.stops.find(s => s.offset === 0);
    expect(stop0.color).toBe(hexToRgba('#112233', 0.18));
  });

  it('uses white in gradient when bg hex is invalid (e.g., #abc)', () => {
    const ctx = makeMockCtx();
    renderHelix(ctx, { palette: { bg: '#abc' } });

    const grad = ctx._gradientObjects[0];
    const stop1 = grad.stops.find(s => s.offset === 1);
    expect(stop1.color).toBe('rgba(255,255,255,0)');
  });
});