// Per Texturas Numerorum, Spira Loquitur. //
/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers rendered in order:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths)
    3) Fibonacci curve (log spiral polyline)
    4) Double-helix lattice (two phase-shifted strands with 144 struts)
*/

// Small, pure, parameterized functions only; no animation, no external dependencies.
// ND-safe: drawings are static with high-contrast yet gentle palette choices.

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  const layers = Array.isArray(palette.layers) ? palette.layers : [];
  const fallback = palette.ink || "#ffffff";

  ctx.save();
  ctx.fillStyle = palette.bg || "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Layer order preserves depth: vesica base, tree scaffold, spiral path, helix lattice crown.
  drawVesica(ctx, width, height, {
    rim: pickColor(layers, 0, fallback),
    grid: pickColor(layers, 1, fallback)
  }, NUM);

  drawTree(ctx, width, height, {
    path: pickColor(layers, 2, fallback),
    node: pickColor(layers, 3, fallback)
  }, NUM);

  drawFibonacci(ctx, width, height, pickColor(layers, 4, fallback), NUM);

  drawHelix(ctx, width, height, {
    strand: pickColor(layers, 5, fallback),
    lattice: pickColor(layers, 0, fallback)
  }, NUM);
}

function pickColor(list, index, fallback) {
  return list && list[index] ? list[index] : fallback;
}

// L1 Vesica field: soft intersecting circles + numerological grid.
function drawVesica(ctx, w, h, colors, NUM) {
  const radius = Math.min(w, h) / NUM.THREE;
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.strokeStyle = colors.rim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - radius / 2, cy, radius, 0, Math.PI * 2);
  ctx.arc(cx + radius / 2, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle vesica grid using 7 vertical and 11 horizontal guides.
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6; // ND-safe translucency keeps the grid gentle.

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

// L2 Tree-of-Life: 10 nodes + 22 connective paths.
function drawTree(ctx, w, h, colors, NUM) {
  const verticalStep = h / NUM.ELEVEN;
  const centerX = w / 2;
  const pillarOffset = (w / NUM.THREE) / 2;

  const nodes = buildTreeNodes(centerX, pillarOffset, verticalStep);
  const paths = buildTreePaths();

  ctx.save();
  ctx.strokeStyle = colors.path;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  for (const [from, to] of paths) {
    const start = nodes[from];
    const end = nodes[to];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  const nodeRadius = Math.min(w, h) / (NUM.THREE * NUM.ELEVEN);
  ctx.fillStyle = colors.node;
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function buildTreeNodes(centerX, offsetX, stepY) {
  return [
    { x:centerX, y:stepY },
    { x:centerX + offsetX, y:stepY * 2 },
    { x:centerX - offsetX, y:stepY * 2 },
    { x:centerX + offsetX, y:stepY * 4 },
    { x:centerX - offsetX, y:stepY * 4 },
    { x:centerX, y:stepY * 5 },
    { x:centerX + offsetX, y:stepY * 7 },
    { x:centerX - offsetX, y:stepY * 7 },
    { x:centerX, y:stepY * 8 },
    { x:centerX, y:stepY * 10 }
  ];
}

function buildTreePaths() {
  return [
    [0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5],
    [5,6],[5,7],[6,7],[6,8],[7,8],[8,9],[5,8],[1,5],
    [2,5],[3,6],[4,7],[1,6],[2,7],[0,5]
  ];
}

// L3 Fibonacci curve: static polyline log spiral with 99 calm points.
function drawFibonacci(ctx, w, h, color, NUM) {
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
    const angle = i * (Math.PI / NUM.ELEVEN); // gentle sweep tied to 11.
    const radius = Math.min(maxRadius, scale * Math.pow(phi, i / NUM.NINE));
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// L4 Double-helix lattice: two sine strands with 144 vertical struts.
function drawHelix(ctx, w, h, colors, NUM) {
  const centerY = h / 2;
  const amplitude = h / NUM.THREE;
  const steps = NUM.ONEFORTYFOUR;
  const frequency = NUM.THREE; // three gentle twists across the width.

  ctx.save();

  ctx.strokeStyle = colors.lattice;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6; // ND-safe translucency keeps lattice supportive, not overpowering.
  for (let i = 0; i <= steps; i++) {
    const ratio = steps === 0 ? 0 : i / steps;
    const x = ratio * w;
    const phase = ratio * frequency * Math.PI;
    const yA = centerY + amplitude * Math.sin(phase);
    const yB = centerY + amplitude * Math.sin(phase + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, yA);
    ctx.lineTo(x, yB);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.strand;
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const ratio = steps === 0 ? 0 : i / steps;
    const x = ratio * w;
    const phase = ratio * frequency * Math.PI;
    const y = centerY + amplitude * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const ratio = steps === 0 ? 0 : i / steps;
    const x = ratio * w;
    const phase = ratio * frequency * Math.PI + Math.PI;
    const y = centerY + amplitude * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.restore();
}
