// Per Texturas Numerorum, Spira Loquitur. //
/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers rendered in order:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths)
    3) Fibonacci curve (log spiral polyline)
    4) Double-helix lattice (two phase-shifted strands with 144 struts)

  Rationale: no motion, gentle contrast, and parameterization with numerology anchors.
*/

const FALLBACK_LAYERS = ["#b1c7ff", "#89f7fe", "#a0ffa1", "#ffd27f", "#f5a3ff", "#d0d0e6"];

// Exported pure function orchestrating the four geometry layers.
export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  const safeBg = typeof palette.bg === "string" ? palette.bg : "#0b0b12";
  const safeInk = typeof palette.ink === "string" ? palette.ink : "#e8e8f0";
  const layers = Array.isArray(palette.layers) && palette.layers.length ? palette.layers : FALLBACK_LAYERS;

  ctx.save();
  ctx.fillStyle = safeBg;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const tones = {
    vesica: {
      rim: pickTone(layers, 0, safeInk),
      grid: pickTone(layers, 1, safeInk)
    },
    tree: {
      path: pickTone(layers, 2, safeInk),
      node: pickTone(layers, 1, safeInk)
    },
    fibonacci: pickTone(layers, 3, safeInk),
    helix: {
      strand: pickTone(layers, 4, safeInk),
      lattice: pickTone(layers, 5, safeInk)
    }
  };

  drawVesica(ctx, width, height, tones.vesica, NUM);
  drawTree(ctx, width, height, tones.tree, NUM);
  drawFibonacci(ctx, width, height, tones.fibonacci, NUM);
  drawHelix(ctx, width, height, tones.helix, NUM);
}

function pickTone(list, index, fallback) {
  if (!Array.isArray(list)) return fallback;
  const tone = list[index];
  return typeof tone === "string" ? tone : fallback;
}

// L1 Vesica field: intersecting circles and a gentle numerological grid.
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
  ctx.globalAlpha = 0.45; // ND-safe translucency keeps the grid gentle.

  const verticalStep = radius / NUM.SEVEN;
  ctx.beginPath();
  for (let i = -NUM.SEVEN; i <= NUM.SEVEN; i++) {
    const x = cx + i * verticalStep;
    ctx.moveTo(x, cy - radius);
    ctx.lineTo(x, cy + radius);
  }
  ctx.stroke();

  const horizontalStep = radius / NUM.ELEVEN;
  ctx.beginPath();
  for (let j = -NUM.ELEVEN; j <= NUM.ELEVEN; j++) {
    const y = cy + j * horizontalStep;
    ctx.moveTo(cx - radius, y);
    ctx.lineTo(cx + radius, y);
  }
  ctx.stroke();
  ctx.restore();
}

// L2 Tree-of-Life scaffold: 10 nodes and 22 connective paths.
function drawTree(ctx, w, h, tones, NUM) {
  const nodes = buildTreeNodes(w, h, NUM);
  const paths = buildTreePaths();

  ctx.save();
  ctx.strokeStyle = tones.path;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7; // ND-safe: paths stay soft yet legible.
  for (const [aIndex, bIndex] of paths) {
    const a = nodes[aIndex];
    const b = nodes[bIndex];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = tones.node;
  const nodeRadius = Math.max(4, Math.min(w, h) / NUM.ONEFORTYFOUR * 3);
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function buildTreeNodes(w, h, NUM) {
  const centerX = w / 2;
  const pillarOffset = (w / NUM.THREE) / 2;
  const stepY = h / (NUM.ELEVEN + 2); // Room for calm breathing space top and bottom.

  return [
    { x:centerX, y:stepY * 1 },
    { x:centerX - pillarOffset, y:stepY * 2 },
    { x:centerX + pillarOffset, y:stepY * 2 },
    { x:centerX, y:stepY * 3 },
    { x:centerX - pillarOffset, y:stepY * 4 },
    { x:centerX + pillarOffset, y:stepY * 4 },
    { x:centerX - pillarOffset, y:stepY * 5 },
    { x:centerX + pillarOffset, y:stepY * 5 },
    { x:centerX, y:stepY * 6 },
    { x:centerX, y:stepY * 7 }
  ];
}

function buildTreePaths() {
  return [
    [0,1],[0,2],[1,2],
    [1,3],[2,3],
    [1,4],[2,5],
    [3,4],[3,5],[4,5],
    [4,6],[5,7],[6,7],
    [4,8],[5,8],[6,8],[7,8],
    [6,9],[7,9],[8,9],[4,9],[5,9]
  ];
}

// L3 Fibonacci curve: static logarithmic spiral honoring 33 steps per turn and 99 points total.
function drawFibonacci(ctx, w, h, tone, NUM) {
  const totalPoints = NUM.NINETYNINE;
  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = Math.min(w, h) / NUM.THIRTYTHREE;
  const phi = (1 + Math.sqrt(5)) / 2;
  const angleStep = (Math.PI * 2) / NUM.THIRTYTHREE;
  const maxRadius = Math.min(w, h) / 2.1;

  ctx.save();
  ctx.strokeStyle = tone;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (let i = 0; i < totalPoints; i++) {
    const angle = i * angleStep;
    const radius = Math.min(baseRadius * Math.pow(phi, i / NUM.NINE), maxRadius);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

// L4 Double-helix lattice: two sine-based strands linked with 144 struts.
function drawHelix(ctx, w, h, tones, NUM) {
  const segments = NUM.ONEFORTYFOUR;
  const amplitude = h / NUM.THREE / 2;
  const baseY = h / 2;
  const stepX = w / segments;
  const phaseStep = (Math.PI * 2) / (NUM.ELEVEN * NUM.THREE); // Soft frequency for calm pacing.

  const strandA = [];
  const strandB = [];
  for (let i = 0; i <= segments; i++) {
    const x = i * stepX;
    const phase = i * phaseStep;
    strandA.push({ x, y: baseY + Math.sin(phase) * amplitude });
    strandB.push({ x, y: baseY + Math.sin(phase + Math.PI) * amplitude });
  }

  ctx.save();
  ctx.strokeStyle = tones.lattice;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35; // Lattice stays subtle to preserve depth without overstimulation.
  for (let i = 0; i < segments; i++) {
    const a = strandA[i];
    const b = strandB[i];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = tones.strand;
  ctx.lineWidth = 2;
  drawStrand(ctx, strandA);
  drawStrand(ctx, strandB);
  ctx.restore();
}

function drawStrand(ctx, points) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (i === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  }
  ctx.stroke();
}
