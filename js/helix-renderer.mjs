/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; simplified layout)
    3) Fibonacci curve (log spiral polyline; static)
    4) Double-helix lattice (two phase-shifted sine waves)

  Each function below is pure and draws a single layer.
*/

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  // base fill: calm dark background for contrast
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  drawVesicaField(ctx, width, height, palette.layers[0], NUM);
  drawTreeOfLife(ctx, width, height, palette.layers[1], palette.layers[2], NUM);
  drawFibonacciCurve(ctx, width, height, palette.layers[3], NUM);
  drawHelixLattice(ctx, width, height, palette.layers[4], palette.layers[5], NUM);
}

// L1: Vesica grid using sacred numbers 3 and 7
function drawVesicaField(ctx, w, h, color, NUM) {
  const cols = NUM.THREE;
  const rows = NUM.SEVEN;
  const r = Math.min(w / (cols * NUM.THREE), h / (rows * NUM.THREE));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = ((i + 0.5) * w) / cols;
      const cy = ((j + 0.5) * h) / rows;
      drawVesica(ctx, cx, cy, r);
    }
  }
}

function drawVesica(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx - r / 2, cy, r, 0, Math.PI * 2);
  ctx.arc(cx + r / 2, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

// L2: Tree-of-Life with 10 nodes and 22 paths
function drawTreeOfLife(ctx, w, h, nodeColor, pathColor, NUM) {
  const r = Math.min(w, h) / NUM.THIRTYTHREE; // gentle size
  const nodes = [
    { x:0.5,  y:0.05 }, // Kether
    { x:0.25, y:0.18 }, // Chokmah
    { x:0.75, y:0.18 }, // Binah
    { x:0.25, y:0.35 }, // Chesed
    { x:0.75, y:0.35 }, // Geburah
    { x:0.5,  y:0.5  }, // Tiphareth
    { x:0.25, y:0.65 }, // Netzach
    { x:0.75, y:0.65 }, // Hod
    { x:0.5,  y:0.8  }, // Yesod
    { x:0.5,  y:0.95 }  // Malkuth
  ];
  const paths = [
    [0,1],[0,2],[0,5],[1,2],[1,5],[1,3],[2,5],[2,4],[3,4],[3,5],
    [3,6],[4,5],[4,7],[5,6],[5,7],[5,8],[6,7],[6,8],[7,8],[6,9],[7,9],[8,9]
  ]; // 22 paths guided by NUM.TWENTYTWO
  ctx.strokeStyle = pathColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < NUM.TWENTYTWO; i++) {
    const [a, b] = paths[i];
    ctx.beginPath();
    ctx.moveTo(nodes[a].x * w, nodes[a].y * h);
    ctx.lineTo(nodes[b].x * w, nodes[b].y * h);
    ctx.stroke();
  }
  ctx.fillStyle = nodeColor;
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x * w, n.y * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// L3: Fibonacci log spiral built from numbers up to 144
function drawFibonacciCurve(ctx, w, h, color, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const steps = NUM.NINETYNINE; // smoothness
  const centerX = w / 2;
  const centerY = h / 2;
  const scale = Math.min(w, h) / NUM.ONEFORTYFOUR;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const angle = (i / NUM.NINE) * (Math.PI / 2); // quarter turns
    const r = scale * Math.pow(phi, i / NUM.TWENTYTWO);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// L4: static double-helix lattice
function drawHelixLattice(ctx, w, h, colorA, colorB, NUM) {
  const amp = h / NUM.THREE;
  const freq = NUM.ELEVEN;
  const steps = NUM.NINETYNINE;
  ctx.lineWidth = 1;
  ctx.strokeStyle = colorA;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * freq;
    const x = (i / steps) * w;
    const y = h / 2 + amp * Math.sin(t);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = colorB;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * freq + Math.PI; // phase shift
    const x = (i / steps) * w;
    const y = h / 2 + amp * Math.sin(t);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // lattice cross-links every 9 steps
  ctx.strokeStyle = colorB;
  for (let i = 0; i <= steps; i += NUM.NINE) {
    const t = (i / steps) * Math.PI * 2 * freq;
    const x = (i / steps) * w;
    const y1 = h / 2 + amp * Math.sin(t);
    const y2 = h / 2 + amp * Math.sin(t + Math.PI);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }
}
