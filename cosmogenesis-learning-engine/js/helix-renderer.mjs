/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; simplified layout)
    3) Fibonacci curve (log spiral polyline; static)
    4) Double-helix lattice (two phase-shifted sine waves)

  Each draw* function is pure and invoked once. No animation, no network.
*/

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  drawVesica(ctx, width, height, palette.layers[0], NUM);
  drawTree(ctx, width, height, palette.layers[1], palette.layers[2], NUM);
  drawFibonacci(ctx, width, height, palette.layers[3], NUM);
  drawLattice(ctx, width, height, palette.layers[4], palette.layers[5], NUM);
}

function drawVesica(ctx, w, h, color, NUM) {
  // ND-safe: static Vesica Piscis, base field of intersection
  const r = Math.min(w, h) / NUM.THREE;
  const dx = r * NUM.ELEVEN / NUM.TWENTYTWO; // == r/2 without introducing bare 2
  const cx1 = w / 2 - dx;
  const cx2 = w / 2 + dx;
  const cy = h / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx1, cy, r, 0, Math.PI * 2);
  ctx.arc(cx2, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTree(ctx, w, h, pathColor, nodeColor, NUM) {
  // Simplified Tree-of-Life layout using relative coordinates
  const nodes = [
    { x:0.5,  y:0.05 },
    { x:0.25, y:0.15 }, { x:0.75, y:0.15 },
    { x:0.25, y:0.35 }, { x:0.75, y:0.35 },
    { x:0.5,  y:0.45 },
    { x:0.25, y:0.65 }, { x:0.75, y:0.65 },
    { x:0.5,  y:0.75 },
    { x:0.5,  y:0.9 }
  ];
  const edges = [
    [0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5],
    [3,6],[4,7],[5,8],[6,7],[6,8],[7,8],[6,9],[7,9],[8,9],
    [1,4],[2,3],[1,5],[2,5],[3,7],[4,6] // total 22 paths
  ];
  ctx.strokeStyle = pathColor;
  ctx.lineWidth = 1;
  edges.forEach(pair => {
    const a = nodes[pair[0]], b = nodes[pair[1]];
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  });
  ctx.fillStyle = nodeColor;
  const r = Math.min(w, h) / NUM.NINETYNINE;
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x * w, n.y * h, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFibonacci(ctx, w, h, color, NUM) {
  // Static approximation of a Fibonacci spiral using polyline segments
  const cx = w / 2;
  const cy = h / 2;
  const steps = NUM.TWENTYTWO; // 22 segments
  const base = Math.min(w, h) / NUM.THIRTYTHREE;
  const phi = (1 + Math.sqrt(5)) / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const theta = i * Math.PI / NUM.ELEVEN;
    const radius = base * Math.pow(phi, i / NUM.SEVEN);
    const x = cx + radius * Math.cos(theta);
    const y = cy + radius * Math.sin(theta);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawLattice(ctx, w, h, colorA, colorB, NUM) {
  // Double helix drawn as two sine waves; no motion
  const steps = NUM.ONEFORTYFOUR; // 144 sample points
  const amp = h / NUM.NINE;
  const mid = h / 2;
  ctx.lineWidth = 1;
  ctx.strokeStyle = colorA;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = mid + amp * Math.sin((i / steps) * NUM.THIRTYTHREE);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = colorB;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = mid + amp * Math.sin((i / steps) * NUM.THIRTYTHREE + Math.PI);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
