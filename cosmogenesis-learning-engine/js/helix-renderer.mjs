/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers:
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; simplified layout)
    3) Fibonacci curve (log spiral polyline; static)
    4) Double-helix lattice (two phase-shifted sine waves with rungs)

  Why ND-safe: no motion, soft palette, comments explain geometry order for sensory clarity.
*/

export function renderHelix(ctx, opts) {
  const { width, height, palette, NUM } = opts;
  // Paint background first to avoid flash of white; calm dark tone chosen
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  drawVesica(ctx, width, height, palette.layers[0], NUM);
  drawTree(ctx, width, height, palette.layers[1], palette.layers[2], NUM);
  drawFibonacci(ctx, width, height, palette.layers[3], NUM);
  drawHelix(ctx, width, height, palette.layers[4], palette.layers[5], NUM);
}

// --- Layer 1: Vesica field
function drawVesica(ctx, w, h, color, NUM) {
  const r = h / NUM.THREE; // radius sized by numerology 3
  const cx1 = w / 2 - r / 2;
  const cx2 = w / 2 + r / 2;
  const cy = h / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx1, cy, r, 0, Math.PI * 2);
  ctx.arc(cx2, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

// --- Layer 2: Tree-of-Life nodes + paths
function drawTree(ctx, w, h, nodeColor, pathColor, NUM) {
  // unit coordinates of 10 sephirot (Kabbalistic tree simplified)
  const N = [
    [0.5, 0.05],            // 1 Keter
    [0.35, 0.15], [0.65, 0.15], // 2-3
    [0.35, 0.30], [0.65, 0.30], // 4-5
    [0.5, 0.45],             // 6
    [0.35, 0.60], [0.65, 0.60], // 7-8
    [0.5, 0.75],             // 9
    [0.5, 0.90]              // 10 Malkuth
  ];
  const P = [ // 22 paths via node indices
    [0,1],[0,2],[1,3],[1,4],[2,3],[2,4],
    [3,5],[4,5],[3,6],[4,7],[6,7],[6,8],[7,8],
    [6,9],[7,9],[8,9],[1,2],[3,4],[5,6],[5,7],[5,8],[8,9]
  ];
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = pathColor;
  for (const [a,b] of P) {
    const [x1,y1] = N[a];
    const [x2,y2] = N[b];
    ctx.beginPath();
    ctx.moveTo(x1 * w, y1 * h);
    ctx.lineTo(x2 * w, y2 * h);
    ctx.stroke();
  }
  ctx.fillStyle = nodeColor;
  const r = h / NUM.TWENTYTWO; // small circles sized by 22
  for (const [x,y] of N) {
    ctx.beginPath();
    ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Layer 3: Fibonacci log spiral (approximate)
function drawFibonacci(ctx, w, h, color, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < NUM.NINETYNINE; i++) { // 99 steps for smooth curve
    const angle = i / NUM.THIRTYTHREE * Math.PI * 2; // wrap every 33 segments
    const r = Math.pow(phi, angle / Math.PI) * (maxR / NUM.TWENTYTWO);
    if (r > maxR) break;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// --- Layer 4: Double-helix lattice
function drawHelix(ctx, w, h, color, rungColor, NUM) {
  const amp = h / NUM.NINE; // amplitude set by numerology 9
  const cx = w / NUM.NINETYNINE; // step width
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = color;
  let prev1 = null, prev2 = null;
  for (let i = 0; i < NUM.NINETYNINE; i++) {
    const x = i * cx;
    const t = i / NUM.THIRTYTHREE * Math.PI * 2; // three full twists
    const y1 = h/2 + amp * Math.sin(t);
    const y2 = h/2 + amp * Math.sin(t + Math.PI);
    if (prev1) {
      ctx.beginPath();
      ctx.moveTo(prev1.x, prev1.y);
      ctx.lineTo(x, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(prev2.x, prev2.y);
      ctx.lineTo(x, y2);
      ctx.stroke();
    }
    // rungs
    ctx.strokeStyle = rungColor;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.strokeStyle = color;
    prev1 = {x, y: y1};
    prev2 = {x, y: y2};
  }
}
