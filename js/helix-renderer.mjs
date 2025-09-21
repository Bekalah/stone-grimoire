/*
  helix-renderer.mjs
  ND-safe static renderer for the Cosmic Helix canvas.
  Layers paint bottom to top in four passes to preserve depth without motion:
    1) Vesica field with numerology grid
    2) Tree-of-Life scaffold (10 sephirot, 22 paths)
    3) Fibonacci curve sampled at 99 points
    4) Double-helix lattice with 144 struts
  All helpers are pure; they only touch arguments passed to them.
*/

const PHI = (1 + Math.sqrt(5)) / 2;

export function renderHelix(ctx, options) {
  const config = normaliseOptions(options);
  const { width, height, palette, NUM } = config;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  paintBackground(ctx, width, height, palette);
  drawVesicaField(ctx, width, height, palette, NUM);
  drawTreeOfLife(ctx, width, height, palette, NUM);
  drawFibonacciCurve(ctx, width, height, palette, NUM);
  drawDoubleHelix(ctx, width, height, palette, NUM);

  ctx.restore();
}

function normaliseOptions(options) {
  const safe = options || {};
  const width = typeof safe.width === "number" ? safe.width : 1440;
  const height = typeof safe.height === "number" ? safe.height : 900;
  const palette = normalisePalette(safe.palette);
  const NUM = normaliseNumerology(safe.NUM);
  return { width, height, palette, NUM };
}

function normalisePalette(palette) {
  const base = palette || {};
  const fallbackLayers = ["#8ba8ff", "#74d8f2", "#98f7c4", "#ffd8a8", "#f6b8ff", "#d8dcff"];
  return {
    bg: typeof base.bg === "string" ? base.bg : "#0b0b12",
    ink: typeof base.ink === "string" ? base.ink : "#e8e8f0",
    layers: Array.isArray(base.layers) && base.layers.length > 0 ? base.layers.slice() : fallbackLayers
  };
}

function normaliseNumerology(NUM) {
  const template = {
    THREE:3,
    SEVEN:7,
    NINE:9,
    ELEVEN:11,
    TWENTYTWO:22,
    THIRTYTHREE:33,
    NINETYNINE:99,
    ONEFORTYFOUR:144
  };
  if (!NUM) return template;
  const clone = {};
  for (const key of Object.keys(template)) {
    const value = NUM[key];
    clone[key] = typeof value === "number" ? value : template[key];
  }
  return clone;
}

function paintBackground(ctx, width, height, palette) {
  /* ND-safe base: solid dusk tone with soft radial glow to avoid harsh contrast. */
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) / 8,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.2
  );
  gradient.addColorStop(0, hexToRgba(pickLayer(palette.layers, 1, palette.ink), 0.18));
  gradient.addColorStop(1, hexToRgba(palette.bg, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawVesicaField(ctx, width, height, palette, NUM) {
  /* Layer 1: Vesica grid. Calm line weights keep intersections gentle. */
  const field = buildVesicaField(width, height, NUM);
  const rimColour = hexToRgba(pickLayer(palette.layers, 0, palette.ink), 0.8);
  const gridColour = hexToRgba(pickLayer(palette.layers, 2, palette.ink), 0.35);

  ctx.save();
  ctx.strokeStyle = rimColour;
  ctx.lineWidth = 2;
  field.circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = gridColour;
  ctx.lineWidth = 1;
  ctx.setLineDash([NUM.THREE, NUM.THREE]);
  field.grid.forEach(segment => {
    ctx.beginPath();
    ctx.moveTo(segment.ax, segment.ay);
    ctx.lineTo(segment.bx, segment.by);
    ctx.stroke();
  });
  ctx.restore();
}

function buildVesicaField(width, height, NUM) {
  const radius = Math.min(width, height) / NUM.THREE;
  const centreX = width / 2;
  const centreY = height / 2;
  const circles = [
    { x: centreX - radius / 2, y: centreY, r: radius },
    { x: centreX + radius / 2, y: centreY, r: radius }
  ];

  const grid = [];
  const verticalStep = (radius * 2) / NUM.TWENTYTWO;
  for (let i = -NUM.ELEVEN; i <= NUM.ELEVEN; i += 1) {
    const x = centreX + i * verticalStep;
    grid.push({ ax: x, ay: centreY - radius, bx: x, by: centreY + radius });
  }

  const horizontalStep = radius / NUM.SEVEN;
  for (let j = -NUM.SEVEN; j <= NUM.SEVEN; j += 1) {
    const y = centreY + j * horizontalStep;
    grid.push({ ax: centreX - radius, ay: y, bx: centreX + radius, by: y });
  }

  return { circles, grid };
}

function drawTreeOfLife(ctx, width, height, palette, NUM) {
  /* Layer 2: Tree-of-Life scaffold. Paths first, nodes second for clarity. */
  const nodes = buildTreeNodes(width, height, NUM);
  const paths = buildTreePaths();

  ctx.save();
  ctx.strokeStyle = hexToRgba(pickLayer(palette.layers, 3, palette.ink), 0.6);
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  paths.forEach(pair => {
    const start = nodes[pair[0]];
    const end = nodes[pair[1]];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  ctx.fillStyle = hexToRgba(pickLayer(palette.layers, 1, palette.ink), 0.9);
  const nodeRadius = computeNodeRadius(width, height, NUM);
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function buildTreeNodes(width, height, NUM) {
  const centreX = width / 2;
  const pillarOffset = (width / NUM.THREE) / 2;
  const stepY = height / (NUM.ELEVEN + 2);
  return [
    { x: centreX, y: stepY * 1 },
    { x: centreX - pillarOffset, y: stepY * 2 },
    { x: centreX + pillarOffset, y: stepY * 2 },
    { x: centreX, y: stepY * 3 },
    { x: centreX - pillarOffset, y: stepY * 4 },
    { x: centreX + pillarOffset, y: stepY * 4 },
    { x: centreX - pillarOffset, y: stepY * 5 },
    { x: centreX + pillarOffset, y: stepY * 5 },
    { x: centreX, y: stepY * 6 },
    { x: centreX, y: stepY * 7 }
  ];
}

function buildTreePaths() {
  return [
    [0,1], [0,2], [1,2],
    [1,3], [2,3],
    [1,4], [2,5],
    [3,4], [3,5], [4,5],
    [4,6], [5,7], [6,7],
    [4,8], [5,8], [6,8], [7,8],
    [6,9], [7,9], [8,9], [4,9], [5,9]
  ];
}

function drawFibonacciCurve(ctx, width, height, palette, NUM) {
  /* Layer 3: Fibonacci spiral. Static polyline; no animation. */
  const points = buildSpiralPoints(width, height, NUM);
  ctx.save();
  ctx.strokeStyle = hexToRgba(pickLayer(palette.layers, 4, palette.ink), 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.restore();
}

function buildSpiralPoints(width, height, NUM) {
  const total = NUM.NINETYNINE;
  const centreX = width / 2;
  const centreY = height / 2;
  const baseRadius = Math.min(width, height) / NUM.THIRTYTHREE;
  const angleStep = (Math.PI * 2) / NUM.THIRTYTHREE;
  const maxRadius = Math.min(width, height) / 2.1;
  const output = [];

  for (let i = 0; i < total; i += 1) {
    const angle = i * angleStep;
    const radius = Math.min(baseRadius * Math.pow(PHI, i / NUM.NINE), maxRadius);
    output.push({
      x: centreX + Math.cos(angle) * radius,
      y: centreY + Math.sin(angle) * radius
    });
  }
  return output;
}

function drawDoubleHelix(ctx, width, height, palette, NUM) {
  /* Layer 4: Double-helix lattice. Two strands with 144 crossbars stay static. */
  const helix = buildHelixStrands(width, height, NUM);
  const strandColour = hexToRgba(pickLayer(palette.layers, 5, palette.ink), 0.9);
  const latticeColour = hexToRgba(pickLayer(palette.layers, 0, palette.ink), 0.35);

  ctx.save();
  ctx.strokeStyle = latticeColour;
  ctx.lineWidth = 1;
  helix.crossbars.forEach(bar => {
    ctx.beginPath();
    ctx.moveTo(bar.ax, bar.ay);
    ctx.lineTo(bar.bx, bar.by);
    ctx.stroke();
  });

  ctx.strokeStyle = strandColour;
  ctx.lineWidth = 2;
  drawPolyline(ctx, helix.strandA);
  drawPolyline(ctx, helix.strandB);
  ctx.restore();
}

function buildHelixStrands(width, height, NUM) {
  const segments = NUM.ONEFORTYFOUR;
  const amplitude = height / NUM.THREE / 2;
  const centreY = height / 2;
  const stepX = width / segments;
  const frequency = (Math.PI * 2) / (NUM.ELEVEN * NUM.THREE);

  const strandA = [];
  const strandB = [];
  const crossbars = [];

  for (let i = 0; i <= segments; i += 1) {
    const x = i * stepX;
    const phase = i * frequency;
    const yA = centreY + Math.sin(phase) * amplitude;
    const yB = centreY + Math.sin(phase + Math.PI) * amplitude;
    strandA.push({ x, y: yA });
    strandB.push({ x, y: yB });
    if (i < segments) {
      crossbars.push({ ax: x, ay: yA, bx: x, by: yB });
    }
  }

  return { strandA, strandB, crossbars };
}

function drawPolyline(ctx, points) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}

function computeNodeRadius(width, height, NUM) {
  return Math.max(4, Math.min(width, height) / NUM.ONEFORTYFOUR * 3);
}

function pickLayer(layers, index, fallback) {
  if (!Array.isArray(layers)) return fallback;
  const tone = layers[index];
  return typeof tone === "string" ? tone : fallback;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return "rgba(255,255,255," + alpha + ")";
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}
