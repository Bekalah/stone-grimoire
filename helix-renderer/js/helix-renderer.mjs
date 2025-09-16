// Per Texturas Numerorum, Spira Loquitur.  //
/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; simplified layout)
    3) Fibonacci curve (log spiral polyline; static)
    4) Double-helix lattice (two phase-shifted sine strands with 144 vertical struts)
*/

// Small, pure, parameterized functions only; no animation, no external deps.
// ND-safe: all drawings are static with high-contrast, calm palette.

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  const colors = palette.layers || [];

  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  drawVesica(ctx, width, height, {
    rim: pickColor(colors, 0, palette.ink),
    grid: pickColor(colors, 1, palette.ink)
  }, NUM);
  drawTree(ctx, width, height, {
    path: pickColor(colors, 2, palette.ink),
    node: pickColor(colors, 3, palette.ink)
  }, NUM);
  drawFibonacci(ctx, width, height, pickColor(colors, 4, palette.ink), NUM);
  drawHelix(ctx, width, height, {
    strand: pickColor(colors, 5, palette.ink),
    lattice: pickColor(colors, 0, palette.ink)
  }, NUM);
}

  // Layer order preserves depth: vesica base, tree scaffold, spiral path, helix crown.
  drawVesica(ctx, width, height, palette.layers[0], NUM);
  drawTree(ctx, width, height, palette.layers[1], palette.layers[2], NUM);
  drawFibonacci(ctx, width, height, palette.layers[3], NUM);
  drawHelix(ctx, width, height, palette.layers[4], palette.layers[5], NUM);
function pickColor(list, index, fallback) {
  return list && list[index] ? list[index] : fallback;
}

// L1 Vesica field: soft intersecting circles, gentle grid
function drawVesica(ctx, w, h, colors, NUM) {
  const r = Math.min(w, h) / NUM.THREE; // radius tied to numerology
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.strokeStyle = colors.rim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - r / 2, cy, r, 0, Math.PI * 2);
  ctx.arc(cx + r / 2, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // subtle vesica grid using SEVEN vertical lines + ELEVEN horizontal guides
  ctx.lineWidth = 1;
  ctx.strokeStyle = colors.grid;
  ctx.globalAlpha = 0.6; // ND-safe translucency to keep the grid gentle
  const step = r / NUM.SEVEN;
  ctx.beginPath();
  for (let i = -NUM.SEVEN; i <= NUM.SEVEN; i++) {
    const x = cx + i * step;
    ctx.moveTo(x, cy - r);
    ctx.lineTo(x, cy + r);
  }
  ctx.stroke();

  const horizonStep = r / NUM.ELEVEN;
  ctx.beginPath();
  for (let j = -NUM.ELEVEN; j <= NUM.ELEVEN; j += NUM.SEVEN) {
    const y = cy + j * horizonStep;
    ctx.moveTo(cx - r, y);
    ctx.lineTo(cx + r, y);
  }
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.restore();
}

// L2 Tree-of-Life: 10 nodes + 22 paths (NUM.TWENTYTWO)
function drawTree(ctx, w, h, colors, NUM) {
  const stepY = h / NUM.ELEVEN; // vertical rhythm
  const xCenter = w / 2;
  const xOffset = w / NUM.THREE / 2; // three pillars

  const nodes = buildTreeNodes(xCenter, xOffset, stepY);
  const paths = buildTreePaths();

  ctx.save();
  ctx.strokeStyle = colors.path;
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

  const r = Math.min(w, h) / NUM.THREE / NUM.ELEVEN; // small node radius
  ctx.fillStyle = colors.node;
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function buildTreeNodes(xCenter, xOffset, stepY) {
  return [
    { x: xCenter, y: stepY },
    { x: xCenter + xOffset, y: stepY * 2 },
    { x: xCenter - xOffset, y: stepY * 2 },
    { x: xCenter + xOffset, y: stepY * 4 },
    { x: xCenter - xOffset, y: stepY * 4 },
    { x: xCenter, y: stepY * 5 },
    { x: xCenter + xOffset, y: stepY * 7 },
    { x: xCenter - xOffset, y: stepY * 7 },
    { x: xCenter, y: stepY * 8 },
    { x: xCenter, y: stepY * 10 }
  ];
}

function buildTreePaths() {
  return [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
    [5, 6], [5, 7], [6, 7], [6, 8], [7, 8], [8, 9], [5, 8], [1, 5],
    [2, 5], [3, 6], [4, 7], [1, 6], [2, 7], [0, 5]
  ];
}

// L3 Fibonacci curve: static polyline log spiral
function drawFibonacci(ctx, w, h, color, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
  const centerX = w / 2;
  const centerY = h / 2;
  const scale = Math.min(w, h) / NUM.THIRTYTHREE;
  const maxRadius = Math.hypot(w, h) / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < NUM.NINETYNINE; i++) { // 99 static points for trauma-safe predictability
    const angle = i * (Math.PI / NUM.ELEVEN); // gentle sweep
    const r = Math.min(maxRadius, scale * Math.pow(phi, i / NUM.NINE));
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// L4 Double-helix lattice: two phase-shifted sine waves with 144 struts
function drawHelix(ctx, w, h, colors, NUM) {
  const centerY = h / 2;
  const amp = h / NUM.THREE; // amplitude linked to threefold nature
  const steps = NUM.ONEFORTYFOUR; // lattice count
  const span = steps - 1 || 1; // ensures the final strut reaches the far edge without extra lines
  const freq = NUM.THREE; // three full twists
  const spacing = w / steps;

  // vertical struts connecting the two strands
  ctx.save();
  ctx.strokeStyle = colors.lattice;
  ctx.lineWidth = 1;
  for (let i = 0; i < steps; i++) {
    const ratio = i / span;
    const x = w * ratio;
    const phase = ratio * freq * Math.PI;
  ctx.globalAlpha = 0.65; // translucent struts keep focus on calm strands
  for (let i = 0; i <= steps; i++) {
    const x = spacing * i;
    const phase = (i / steps) * freq * Math.PI;
    const y1 = centerY + amp * Math.sin(phase);
    const y2 = centerY + amp * Math.sin(phase + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }

  // first strand
  ctx.strokeStyle = colors.strand;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  for (let i = 0; i < steps; i++) {
    const ratio = i / span;
    const x = w * ratio;
    const phase = ratio * freq * Math.PI;
  for (let i = 0; i <= steps; i++) {
    const x = spacing * i;
    const phase = (i / steps) * freq * Math.PI;
    const y = centerY + amp * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // second strand phase-shifted by PI
  ctx.beginPath();
  for (let i = 0; i < steps; i++) {
    const ratio = i / span;
    const x = w * ratio;
    const phase = ratio * freq * Math.PI + Math.PI;
  for (let i = 0; i <= steps; i++) {
    const x = spacing * i;
    const phase = (i / steps) * freq * Math.PI + Math.PI;
    const y = centerY + amp * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}
