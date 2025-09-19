/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers (painted bottom to top):
    1) Vesica field (intersecting circles)
    2) Tree-of-Life scaffold (10 sephirot + 22 paths; Daath rendered as translucent guide)
    3) Fibonacci curve (log-spiral polyline)
    4) Double-helix lattice (static intertwined strands)

  ND-safe choices:
    - No animation; everything is rendered once to avoid motion triggers.
    - Soft contrast palette; transparent overlays maintain legibility without harsh glare.
    - Layer order mirrors ritual staging so the eye can rest while decoding geometry.
*/

export function renderHelix(ctx, options) {
  const config = normaliseOptions(options);
  const { width, height, palette, NUM } = config;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  paintBackground(ctx, width, height, palette, NUM);
  drawVesicaField(ctx, width, height, palette, NUM);
  drawTreeOfLife(ctx, width, height, palette, NUM);
  drawFibonacciCurve(ctx, width, height, palette, NUM);
  drawDoubleHelix(ctx, width, height, palette, NUM);

  ctx.restore();
}

function normaliseOptions(options) {
  const defaults = {
    width: 1440,
    height: 900,
    palette: {
      bg: "#0b0b12",
      ink: "#e8e8f0",
      layers: ["#9bbcff", "#7ee6f2", "#8ef5a5", "#ffd59b", "#f7a5ff", "#d8d8f8"]
    },
    NUM: { THREE:3, SEVEN:7, NINE:9, ELEVEN:11, TWENTYTWO:22, THIRTYTHREE:33, NINETYNINE:99, ONEFORTYFOUR:144 }
  };

  const safe = options || {};
  const palette = safe.palette || {};
  return {
    width: typeof safe.width === "number" ? safe.width : defaults.width,
    height: typeof safe.height === "number" ? safe.height : defaults.height,
    palette: {
      bg: palette.bg || defaults.palette.bg,
      ink: palette.ink || defaults.palette.ink,
      layers: Array.isArray(palette.layers) && palette.layers.length > 0 ? palette.layers : defaults.palette.layers
    },
    NUM: safe.NUM || defaults.NUM
  };
}

function paintBackground(ctx, width, height, palette, NUM) {
  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  // Gentle radial glow to add depth without motion.
  const glow = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) / NUM.NINETYNINE,
    width / 2,
    height / 2,
    Math.max(width, height) / 2
  );
  glow.addColorStop(0, hexToRgba(palette.layers[1] || palette.ink, 0.12));
  glow.addColorStop(1, hexToRgba(palette.bg, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawVesicaField(ctx, width, height, palette, NUM) {
  ctx.save();
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / NUM.THREE;
  const offset = radius / (NUM.SEVEN / 2);
  const baseColor = palette.layers[0] || palette.ink;

  ctx.lineWidth = 2;
  ctx.strokeStyle = hexToRgba(baseColor, 0.55);

  const offsets = [-1, 0, 1];
  for (const hx of offsets) {
    for (const hy of offsets) {
      const x = centerX + hx * offset * 1.5;
      const y = centerY + hy * offset * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Vesica lens highlights referencing sacred ratios.
  ctx.lineWidth = 3;
  const lensColor = palette.layers[2] || palette.ink;
  ctx.strokeStyle = hexToRgba(lensColor, 0.35);
  for (let i = 0; i <= NUM.NINE; i++) {
    const t = i / NUM.NINE;
    const x = centerX + (t - 0.5) * radius * 1.2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * (0.65 + t * 0.15), radius * (0.32 + t * 0.18), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTreeOfLife(ctx, width, height, palette, NUM) {
  ctx.save();
  const nodeRadius = Math.min(width, height) / NUM.ONEFORTYFOUR * 3;
  const colorPaths = palette.layers[3] || palette.ink;
  const colorNodes = palette.layers[2] || palette.ink;
  const colorHidden = palette.layers[5] || palette.ink;

  const nodes = [
    { name: "Keter", x: 0.5, y: 0.09 },
    { name: "Chokmah", x: 0.68, y: 0.19 },
    { name: "Binah", x: 0.32, y: 0.19 },
    { name: "Daath", x: 0.5, y: 0.29, hidden: true },
    { name: "Chesed", x: 0.7, y: 0.39 },
    { name: "Geburah", x: 0.3, y: 0.39 },
    { name: "Tiphereth", x: 0.5, y: 0.52 },
    { name: "Netzach", x: 0.7, y: 0.64 },
    { name: "Hod", x: 0.3, y: 0.64 },
    { name: "Yesod", x: 0.5, y: 0.78 },
    { name: "Malkuth", x: 0.5, y: 0.91 }
  ];

  const edges = [
    [0,1],[0,2],[1,2],[1,4],[2,5],[4,6],[5,6],[4,3],[5,3],[3,6],
    [4,7],[5,8],[6,7],[6,8],[7,9],[8,9],[9,10],[7,10],[8,10],[3,9],[1,3],[2,3]
  ];

  ctx.strokeStyle = hexToRgba(colorPaths, 0.45);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  for (const [a, b] of edges) {
    const start = nodes[a];
    const end = nodes[b];
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  for (const node of nodes) {
    const cx = node.x * width;
    const cy = node.y * height;
    ctx.beginPath();
    ctx.fillStyle = node.hidden ? hexToRgba(colorHidden, 0.28) : hexToRgba(colorNodes, 0.82);
    ctx.strokeStyle = hexToRgba(palette.ink, node.hidden ? 0.2 : 0.6);
    ctx.lineWidth = node.hidden ? 1 : 2;
    ctx.arc(cx, cy, node.hidden ? nodeRadius * 0.75 : nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawFibonacciCurve(ctx, width, height, palette, NUM) {
  ctx.save();
  const phi = (1 + Math.sqrt(5)) / 2;
  const steps = NUM.TWENTYTWO;
  const baseRadius = Math.min(width, height) / NUM.SEVEN;
  const centerX = width * 0.32;
  const centerY = height * 0.58;
  const curveColor = palette.layers[4] || palette.ink;

  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI / NUM.ELEVEN) * i;
    const radius = baseRadius * Math.pow(phi, i / NUM.NINE);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push({ x, y });
  }

  ctx.beginPath();
  points.forEach((p, index) => {
    if (index === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  ctx.strokeStyle = hexToRgba(curveColor, 0.75);
  ctx.lineWidth = 3;
  ctx.stroke();

  // Place gentle markers at numerically significant steps for clarity.
  ctx.fillStyle = hexToRgba(curveColor, 0.6);
  const markerSpacing = Math.max(1, Math.floor(steps / NUM.SEVEN));
  for (let i = 0; i < points.length; i += markerSpacing) {
    const p = points[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawDoubleHelix(ctx, width, height, palette, NUM) {
  ctx.save();
  const strandA = palette.layers[5] || palette.ink;
  const strandB = palette.layers[1] || palette.ink;
  const axisX = width * 0.62;
  const top = height * 0.08;
  const bottom = height * 0.92;
  const amplitude = width / NUM.NINE;
  const cycles = NUM.THREE;
  const totalLength = bottom - top;
  const steps = NUM.ONEFORTYFOUR;

  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";

  // Strand A
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * cycles;
    const x = axisX + Math.sin(angle) * amplitude;
    const y = top + t * totalLength;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = hexToRgba(strandA, 0.8);
  ctx.stroke();

  // Strand B (phase-shifted by PI to weave with strand A)
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * cycles + Math.PI;
    const x = axisX + Math.sin(angle) * amplitude;
    const y = top + t * totalLength;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = hexToRgba(strandB, 0.65);
  ctx.stroke();

  // Lattice rungs referencing the 22 paths.
  const rungCount = NUM.TWENTYTWO;
  ctx.strokeStyle = hexToRgba(palette.layers[3] || palette.ink, 0.3);
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= rungCount; i++) {
    const t = i / rungCount;
    const angle = t * Math.PI * 2 * cycles;
    const y = top + t * totalLength;
    const x1 = axisX + Math.sin(angle) * amplitude;
    const x2 = axisX + Math.sin(angle + Math.PI) * amplitude;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  // Central axis for grounding.
  ctx.strokeStyle = hexToRgba(palette.ink, 0.22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(axisX, top);
  ctx.lineTo(axisX, bottom);
  ctx.stroke();

  ctx.restore();
}

function hexToRgba(hex, alpha) {
  if (!hex) {
    return `rgba(0,0,0,${alpha})`;
  }
  let value = hex.trim();
  if (value.startsWith("#")) {
    value = value.slice(1);
  }
  if (value.length === 3) {
    value = value.split("").map((c) => c + c).join("");
  }
  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const clamped = Math.max(0, Math.min(1, alpha));
  return `rgba(${r},${g},${b},${clamped})`;
}
