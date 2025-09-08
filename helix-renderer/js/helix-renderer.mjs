/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.
  Motto: Per Texturas Numerorum, Spira Loquitur.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; simplified layout)
    3) Fibonacci curve (log spiral polyline; static)
    4) Double-helix lattice (two phase-shifted sine strands with 144 vertical struts)
*/

// Small, pure, parameterized functions only; no animation, no external deps.

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  drawVesica(ctx, width, height, palette.layers[0], NUM);
  drawTree(ctx, width, height, palette.layers[1], palette.layers[2], NUM);
  drawFibonacci(ctx, width, height, palette.layers[3], NUM);
  drawHelix(ctx, width, height, palette.layers[4], palette.layers[5], NUM);
}

// L1 Vesica field: soft intersecting circles, gentle grid
function drawVesica(ctx, w, h, color, NUM) {
  const r = Math.min(w, h) / NUM.THREE; // radius tied to numerology
  const cx = w / 2;
  const cy = h / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - r / 2, cy, r, 0, Math.PI * 2);
  ctx.arc(cx + r / 2, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // subtle vesica grid using SEVEN lines for calm symmetry
  ctx.lineWidth = 1;
  const step = r / NUM.SEVEN;
  ctx.beginPath();
  for (let i = -NUM.SEVEN; i <= NUM.SEVEN; i++) {
    const x = cx + i * step;
    ctx.moveTo(x, cy - r);
    ctx.lineTo(x, cy + r);
  }
  ctx.stroke();
}

// L2 Tree-of-Life: 10 nodes + 22 paths (NUM.TWENTYTWO)
function drawTree(ctx, w, h, nodeColor, pathColor, NUM) {
  const stepY = h / NUM.ELEVEN; // vertical rhythm
  const xCenter = w / 2;
  const xOffset = w / NUM.THREE / 2; // three pillars

  const nodes = [
    { x: xCenter, y: stepY }, // 0 Keter
    { x: xCenter + xOffset, y: stepY * 2 }, // 1 Chokmah
    { x: xCenter - xOffset, y: stepY * 2 }, // 2 Binah
    { x: xCenter + xOffset, y: stepY * 4 }, // 3 Chesed
    { x: xCenter - xOffset, y: stepY * 4 }, // 4 Geburah
    { x: xCenter, y: stepY * 5 }, // 5 Tiphareth
    { x: xCenter + xOffset, y: stepY * 7 }, // 6 Netzach
    { x: xCenter - xOffset, y: stepY * 7 }, // 7 Hod
    { x: xCenter, y: stepY * 8 }, // 8 Yesod
    { x: xCenter, y: stepY * 10 }, // 9 Malkuth
  ];

  const paths = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
    [5, 6], [5, 7], [6, 7], [6, 8], [7, 8], [8, 9], [5, 8], [1, 5],
    [2, 5], [3, 6], [4, 7], [1, 6], [2, 7], [0, 5], // 22 paths
  ];

  ctx.strokeStyle = pathColor;
  ctx.lineWidth = 1;
  for (const [a, b] of paths) {
    const p1 = nodes[a];
    const p2 = nodes[b];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const r = Math.min(w, h) / NUM.THREE / NUM.ELEVEN; // small node radius
  ctx.fillStyle = nodeColor;
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// L3 Fibonacci curve: static polyline log spiral
function drawFibonacci(ctx, w, h, color, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
  const centerX = w / 2;
  const centerY = h / 2;
  const scale = Math.min(w, h) / NUM.THIRTYTHREE;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= NUM.NINETYNINE; i++) {
    const angle = i * (Math.PI / NUM.ELEVEN); // gentle sweep
    const r = scale * Math.pow(phi, i / NUM.NINE);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// L4 Double-helix lattice: two phase-shifted sine waves with 144 struts
function drawHelix(ctx, w, h, strandColor, latticeColor, NUM) {
  const centerY = h / 2;
  const amp = h / NUM.THREE; // amplitude linked to threefold nature
  const steps = NUM.ONEFORTYFOUR; // lattice count
  const freq = NUM.THREE; // three full twists

  // vertical struts connecting the two strands
  ctx.strokeStyle = latticeColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    const phase = (i / steps) * freq * Math.PI;
    const y1 = centerY + amp * Math.sin(phase);
    const y2 = centerY + amp * Math.sin(phase + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }

  // first strand
  ctx.strokeStyle = strandColor;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    const phase = (i / steps) * freq * Math.PI;
    const y = centerY + amp * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // second strand phase-shifted by PI
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    const phase = (i / steps) * freq * Math.PI + Math.PI;
    const y = centerY + amp * Math.sin(phase);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
