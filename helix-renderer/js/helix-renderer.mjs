/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths)
    3) Fibonacci curve (log spiral polyline)
    4) Double-helix lattice (two phase-shifted strands with 144 struts)
*/

// Small, pure, parameterized functions only; no animation, no external dependencies.
// ND-safe: all drawings are static with layered order for calm focus.

const FALLBACK_LAYERS = ["#b1c7ff", "#89f7fe", "#a0ffa1", "#ffd27f", "#f5a3ff", "#d0d0e6"];

function selectLayerTone(layers, index) {
  if (!Array.isArray(layers)) return FALLBACK_LAYERS[index];
  const tone = layers[index];
  return typeof tone === "string" ? tone : FALLBACK_LAYERS[index];
}

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;

  const safeBg = typeof palette.bg === "string" ? palette.bg : "#0b0b12";
  ctx.save();
  ctx.fillStyle = safeBg;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Layer order preserves depth: vesica base, tree scaffold, spiral path, helix crown.
  const vesicaTone = selectLayerTone(palette.layers, 0);
  const treeNodeTone = selectLayerTone(palette.layers, 1);
  const treePathTone = selectLayerTone(palette.layers, 2);
  const fibonacciTone = selectLayerTone(palette.layers, 3);
  const helixStrandTone = selectLayerTone(palette.layers, 4);
  const latticeTone = selectLayerTone(palette.layers, 5);

  drawVesica(ctx, width, height, vesicaTone, NUM);
  drawTree(ctx, width, height, treeNodeTone, treePathTone, NUM);
  drawFibonacci(ctx, width, height, fibonacciTone, NUM);
  drawHelix(ctx, width, height, helixStrandTone, latticeTone, NUM);
}

// L1 Vesica field: soft intersecting circles, gentle grid
function drawVesica(ctx, w, h, color, NUM) {
  ctx.save();
  const r = Math.min(w, h) / NUM.THREE; // radius tied to numerology

  const layers = Array.isArray(palette.layers) ? palette.layers : [];
  const ink = palette.ink || "#e8e8f0";

  // Layer foundation: fill background first to anchor the canvas in calm darkness.
  ctx.save();
  ctx.fillStyle = palette.bg || "#0b0b12";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  drawVesica(ctx, width, height, {
    rim: pickColor(layers, 0, ink),
    grid: pickColor(layers, 1, ink)
  }, NUM);

  drawTree(ctx, width, height, {
    path: pickColor(layers, 2, ink),
    node: pickColor(layers, 3, ink)
  }, NUM);

  drawFibonacci(ctx, width, height, pickColor(layers, 4, ink), NUM);

  drawHelix(ctx, width, height, {
    strand: pickColor(layers, 5, ink),
    lattice: pickColor(layers, 0, ink)
  }, NUM);
}

function pickColor(list, index, fallback) {
  return list[index] || fallback;
}

// L1 Vesica field: intersecting circles and a gentle grid grounded in numerology.
function drawVesica(ctx, w, h, tones, NUM) {
  const radius = Math.min(w, h) / NUM.THREE;

  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.strokeStyle = tones.rim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - radius / 2, cy, radius, 0, Math.PI * 2);
  ctx.arc(cx + radius / 2, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = tones.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5; // ND-safe translucency keeps the grid supportive, not overwhelming.

  const verticalStep = radius / NUM.SEVEN;
  ctx.beginPath();
  for (let i = -NUM.SEVEN; i <= NUM.SEVEN; i++) {
    const x = cx + i * verticalStep;
    ctx.moveTo(x, cy - radius);
    ctx.lineTo(x, cy + radius);
  }
  ctx.stroke();

  ctx.restore();
}

// L2 Tree-of-Life: 10 nodes + 22 paths (NUM.TWENTYTWO)
function drawTree(ctx, w, h, nodeColor, pathColor, NUM) {
  ctx.save();
  const stepY = h / NUM.ELEVEN; // vertical rhythm


  const horizontalStep = (radius * 2) / NUM.ELEVEN;
  ctx.beginPath();
  for (let j = 0; j <= NUM.ELEVEN; j++) {
    const y = cy - radius + j * horizontalStep;
    ctx.moveTo(cx - radius, y);
    ctx.lineTo(cx + radius, y);
  }
  ctx.stroke();
  ctx.restore();
}

// L2 Tree-of-Life scaffold: 10 nodes and 22 paths for steady ascent.
function drawTree(ctx, w, h, tones, NUM) {
  const stepY = h / NUM.ELEVEN;

  const xCenter = w / 2;
  const xOffset = w / NUM.THREE / 2; // Three pillars define lateral spacing.

  const nodes = buildTreeNodes(xCenter, xOffset, stepY);
  const paths = buildTreePaths();

  ctx.save();
  ctx.strokeStyle = tones.path;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  for (const [a, b] of paths) {
    const p1 = nodes[a];
    const p2 = nodes[b];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const nodeRadius = Math.min(w, h) / (NUM.THREE * NUM.ELEVEN);
  ctx.fillStyle = tones.node;
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();


}

function buildTreeNodes(center, offset, stepY) {
  // Ten sephirot arranged in tri-column symmetry.
  return [
    { x:center, y:stepY },
    { x:center + offset, y:stepY * 2 },
    { x:center - offset, y:stepY * 2 },
    { x:center + offset, y:stepY * 4 },
    { x:center - offset, y:stepY * 4 },
    { x:center, y:stepY * 5 },
    { x:center + offset, y:stepY * 7 },
    { x:center - offset, y:stepY * 7 },
    { x:center, y:stepY * 8 },
    { x:center, y:stepY * 10 }
  ];
}

function buildTreePaths() {
  // Twenty-two paths honoring the classic Tree-of-Life connections.
  return [
    [0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5],
    [5,6],[5,7],[6,7],[6,8],[7,8],[8,9],[5,8],[1,5],
    [2,5],[3,6],[4,7],[1,6],[2,7],[0,5]
  ];

}

// L3 Fibonacci curve: 99 static points create a calm logarithmic spiral.
function drawFibonacci(ctx, w, h, color, NUM) {

  ctx.save();
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio

  const phi = (1 + Math.sqrt(5)) / 2;

  const centerX = w / 2;
  const centerY = h / 2;
  const scale = Math.min(w, h) / NUM.THIRTYTHREE;
  const maxRadius = Math.hypot(w, h) / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < NUM.NINETYNINE; i++) {
    const angle = i * (Math.PI / NUM.ELEVEN);
    const radius = Math.min(maxRadius, scale * Math.pow(phi, i / NUM.NINE));
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}


// L4 Double-helix lattice: two phase-shifted sine waves with 144 struts
function drawHelix(ctx, w, h, strandColor, latticeColor, NUM) {
  ctx.save();
  const centerY = h / 2;
  const amp = h / NUM.THREE; // amplitude linked to threefold nature
  const steps = NUM.ONEFORTYFOUR; // lattice count
  const span = steps - 1 || 1; // ensures the final strut reaches the far edge without extra lines
  const freq = NUM.THREE; // three full twists

// L4 Double-helix lattice: twin strands bridged by 144 static struts.
function drawHelix(ctx, w, h, tones, NUM) {
  const steps = NUM.ONEFORTYFOUR;
  const span = Math.max(1, steps - 1);
  const baseY = h / 2;
  const amplitude = h / NUM.THREE;
  const frequency = NUM.THREE; // Three full waves maintain the trifold pattern.

  ctx.save();


  ctx.strokeStyle = tones.lattice;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55; // Struts stay supportive without overpowering the strands.
  for (let i = 0; i < steps; i++) {
    const ratio = i / span;
    const x = ratio * w;
    const phase = ratio * frequency * Math.PI;
    const yA = baseY + amplitude * Math.sin(phase);
    const yB = baseY + amplitude * Math.sin(phase + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, yA);
    ctx.lineTo(x, yB);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = tones.strand;
  ctx.lineWidth = 2;
  drawStrand(ctx, steps, span, w, baseY, amplitude, frequency, 0);
  drawStrand(ctx, steps, span, w, baseY, amplitude, frequency, Math.PI);

  ctx.restore();
}

function drawStrand(ctx, steps, span, width, baseY, amplitude, frequency, phaseShift) {
  ctx.beginPath();
  for (let i = 0; i < steps; i++) {
    const ratio = i / span;
    const x = ratio * width;
    const phase = ratio * frequency * Math.PI + phaseShift;
    const y = baseY + amplitude * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}
