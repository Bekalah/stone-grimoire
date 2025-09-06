// helix-renderer.mjs
// ND-safe static renderer for layered sacred geometry.
// Layers: Vesica field, Tree-of-Life scaffold, Fibonacci curve, double-helix lattice.
// No animation, no external dependencies. Comments explain ND choices.

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;

  // background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // Layer 1: Vesica field
  // We draw intersecting circles across the width using NUM.ELEVEN as count.
  ctx.strokeStyle = palette.layers[0];
  ctx.lineWidth = 1;
  const r = height / NUM.THREE; // large calm circles
  const step = width / NUM.ELEVEN;
  for (let i = 0; i < NUM.ELEVEN + 2; i++) {
    const x = i * step - r;
    ctx.beginPath();
    ctx.arc(x, height / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Layer 2: Tree-of-Life scaffold
  // Node positions scaled from canonical proportions; 10 sephirot, 22 paths.
  const tree = [
    { x: 0.5, y: 0.05 },
    { x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 },
    { x: 0.3, y: 0.30 }, { x: 0.7, y: 0.30 },
    { x: 0.5, y: 0.40 },
    { x: 0.3, y: 0.55 }, { x: 0.7, y: 0.55 },
    { x: 0.5, y: 0.70 },
    { x: 0.5, y: 0.85 }
  ];
  const scaleX = width;
  const scaleY = height;
  const edges = [
    [0,1],[0,2],
    [1,2],[1,3],[1,4],
    [2,3],[2,4],[2,5],
    [3,4],[3,5],[3,6],
    [4,5],[4,7],
    [5,6],[5,7],[5,8],
    [6,7],[6,8],[7,8],
    [8,9],
    [3,8],[4,8]
  ];
  ctx.strokeStyle = palette.layers[1];
  for (const [a, b] of edges) {
    ctx.beginPath();
    ctx.moveTo(tree[a].x * scaleX, tree[a].y * scaleY);
    ctx.lineTo(tree[b].x * scaleX, tree[b].y * scaleY);
    ctx.stroke();
  }
  ctx.fillStyle = palette.layers[2];
  for (const n of tree) {
    ctx.beginPath();
    ctx.arc(n.x * scaleX, n.y * scaleY, NUM.THREE, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 3: Fibonacci curve (log spiral polyline)
  // Uses numerology constant ONEFORTYFOUR as max radius.
  const fib = [1,1];
  while (fib[fib.length - 1] < NUM.ONEFORTYFOUR) {
    fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
  }
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 2; // base scale
  const centerX = width * 0.75;
  const centerY = height * 0.75;
  ctx.strokeStyle = palette.layers[3];
  ctx.beginPath();
  let first = true;
  for (let i = 0; i < fib.length; i++) {
    const angle = i * (Math.PI / 2);
    const radius = a * Math.pow(phi, i);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (first) { ctx.moveTo(x, y); first = false; }
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Layer 4: static double-helix lattice
  // Two phase-shifted sinusoids with gentle contrast; lattice rungs every NINETYNINE px.
  const amp = height / NUM.ELEVEN; // calm amplitude
  const period = width / NUM.TWENTYTWO;
  ctx.strokeStyle = palette.layers[4];
  ctx.beginPath();
  for (let x = 0; x <= width; x++) {
    const y = height / 2 + amp * Math.sin((2 * Math.PI * x) / period);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = palette.layers[5];
  ctx.beginPath();
  for (let x = 0; x <= width; x++) {
    const y = height / 2 + amp * Math.sin((2 * Math.PI * x) / period + Math.PI);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // lattice rungs
  ctx.strokeStyle = palette.layers[2];
  for (let x = 0; x <= width; x += NUM.NINETYNINE) {
    const y1 = height / 2 + amp * Math.sin((2 * Math.PI * x) / period);
    const y2 = height / 2 + amp * Math.sin((2 * Math.PI * x) / period + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }
}
