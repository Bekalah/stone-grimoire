/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry used across Stone Cathedral projects.
  Layers paint bottom to top so depth remains legible without motion:
    1) Vesica field (intersecting circles, numerology aligned)
    2) Tree-of-Life scaffold (nodes and 22 paths)
    3) Fibonacci curve (logarithmic spiral polyline)
    4) Double-helix lattice (phase shifted strands with crossbars)
  All helpers are pure; they only work with data passed as arguments.
*/

const DEFAULT_NUM = {
  THREE: 3,
  SEVEN: 7,
  NINE: 9,
  ELEVEN: 11,
  TWENTYTWO: 22,
  THIRTYTHREE: 33,
  NINETYNINE: 99,
  ONEFORTYFOUR: 144
};

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
  const safe = options || {};
  const width = typeof safe.width === "number" ? safe.width : 1440;
  const height = typeof safe.height === "number" ? safe.height : 900;
  const palette = normalisePalette(safe.palette);
  const NUM = safe.NUM || DEFAULT_NUM;
  return { width, height, palette, NUM };
}

function normalisePalette(palette) {
  const base = palette || {};
  return {
    bg: base.bg || "#0b0b12",
    ink: base.ink || "#e8e8f0",
    layers: Array.isArray(base.layers) && base.layers.length > 0
      ? base.layers.slice()
      : ["#9bbcff", "#7ee6f2", "#8ef5a5", "#ffd59b", "#f7a5ff", "#d8d8f8"]
  };
}

function paintBackground(ctx, width, height, palette, NUM) {
  /* ND-safe choice: solid base fill plus gentle radial glow. */
  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) / NUM.NINETYNINE,
    width / 2,
    height / 2,
    Math.max(width, height) / 2
  );
  gradient.addColorStop(0, hexToRgba(palette.layers[1] || palette.ink, 0.12));
  gradient.addColorStop(1, hexToRgba(palette.bg, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawVesicaField(ctx, width, height, palette, NUM) {
  /* ND-safe: intersecting rings only, no animation. */
  const circles = createVesicaCircles(width, height, NUM);
  const lineColor = hexToRgba(pickLayer(palette.layers, 0, palette.ink), 0.55);
  const haloColor = hexToRgba(pickLayer(palette.layers, 2, palette.ink), 0.3);

  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Soft lens overlays echoing numerology ratios.
  ctx.strokeStyle = haloColor;
  ctx.lineWidth = 3;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) / NUM.THREE;
  for (let i = 0; i <= NUM.NINE; i += 1) {
    const scale = 0.55 + (i / NUM.NINE) * 0.2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, baseRadius * scale, baseRadius * scale * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function createVesicaCircles(width, height, NUM) {
  const output = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) / (NUM.THREE + NUM.SEVEN / NUM.ELEVEN);
  const horizontal = baseRadius * (NUM.NINE / NUM.ELEVEN);
  const vertical = baseRadius * (NUM.THREE / NUM.TWENTYTWO);

  // Primary triple vesica
  for (let i = 0; i < NUM.THREE; i += 1) {
    const offset = (i - (NUM.THREE - 1) / 2) * horizontal;
    output.push({ x: centerX + offset, y: centerY, r: baseRadius });
  }

  // Vertical stack referencing seven bands
  const range = Math.floor(NUM.SEVEN / 2);
  for (let j = -range; j <= range; j += 1) {
    const scale = (NUM.SEVEN - Math.abs(j)) / NUM.SEVEN;
    output.push({
      x: centerX,
      y: centerY + j * vertical,
      r: baseRadius * (0.6 + scale * 0.2)
    });
  }

  // Diagonal overlays referencing nine phases
  for (let k = 0; k < NUM.NINE; k += 1) {
    const theta = (k / NUM.NINE) * Math.PI;
    const x = centerX + Math.cos(theta) * horizontal * 0.75;
    const y = centerY + Math.sin(theta) * vertical * NUM.THREE;
    output.push({ x, y, r: baseRadius * 0.8 });
  }

  return output;
}

function drawTreeOfLife(ctx, width, height, palette, NUM) {
  /* ND-safe: subtle glow around nodes, no flashing. */
  const nodes = buildTreeNodes(width, height);
  const edges = buildTreeEdges();

  ctx.save();
  ctx.strokeStyle = hexToRgba(pickLayer(palette.layers, 1, palette.ink), 0.45);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  edges.forEach(pair => {
    const start = nodes[pair[0]];
    const end = nodes[pair[1]];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  const radius = Math.min(width, height) / NUM.ONEFORTYFOUR * NUM.NINE / NUM.TWENTYTWO;
  ctx.fillStyle = hexToRgba(pickLayer(palette.layers, 4, palette.ink), 0.85);
  ctx.strokeStyle = hexToRgba(palette.ink, 0.35);
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.hidden ? radius * 0.7 : radius, 0, Math.PI * 2);
    ctx.fillStyle = node.hidden
      ? hexToRgba(pickLayer(palette.layers, 5, palette.ink), 0.28)
      : hexToRgba(pickLayer(palette.layers, 4, palette.ink), 0.85);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function buildTreeNodes(width, height) {
  const points = [
    { name: "Keter", x: 0.5, y: 0.07 },
    { name: "Chokmah", x: 0.68, y: 0.17 },
    { name: "Binah", x: 0.32, y: 0.17 },
    { name: "Daath", x: 0.5, y: 0.28, hidden: true },
    { name: "Chesed", x: 0.7, y: 0.36 },
    { name: "Geburah", x: 0.3, y: 0.36 },
    { name: "Tiphereth", x: 0.5, y: 0.5 },
    { name: "Netzach", x: 0.68, y: 0.63 },
    { name: "Hod", x: 0.32, y: 0.63 },
    { name: "Yesod", x: 0.5, y: 0.78 },
    { name: "Malkuth", x: 0.5, y: 0.9 }
  ];
  return points.map(point => ({
    name: point.name,
    hidden: Boolean(point.hidden),
    x: point.x * width,
    y: point.y * height
  }));
}

function buildTreeEdges() {
  // 22 paths aligning with Hebrew letters
  return [
    [0, 1], [0, 2], [1, 2],
    [1, 4], [2, 5], [4, 6], [5, 6],
    [4, 3], [5, 3], [3, 6],
    [4, 7], [5, 8], [6, 7], [6, 8],
    [7, 9], [8, 9], [9, 10],
    [7, 10], [8, 10], [3, 9], [1, 3], [2, 3]
  ];
}

function drawFibonacciCurve(ctx, width, height, palette, NUM) {
  /* ND-safe: static polyline approximating a logarithmic spiral. */
  const center = { x: width * 0.32, y: height * 0.58 };
  const scale = Math.min(width, height) / NUM.ONEFORTYFOUR * NUM.ELEVEN;
  const points = createFibonacciPoints(center, scale, NUM);
  const lineColor = hexToRgba(pickLayer(palette.layers, 3, palette.ink), 0.78);

  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  // Mark numerology checkpoints so viewers can rest their gaze.
  const markerInterval = Math.max(1, Math.floor(points.length / NUM.SEVEN));
  const markerRadius = Math.min(width, height) / NUM.ONEFORTYFOUR * (NUM.THREE / NUM.ELEVEN);
  ctx.fillStyle = hexToRgba(pickLayer(palette.layers, 2, palette.ink), 0.65);
  for (let i = 0; i < points.length; i += markerInterval) {
    const marker = points[i];
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, markerRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function createFibonacciPoints(center, scale, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const turns = NUM.THREE; // three turns keep the spiral gentle
  const totalAngle = turns * Math.PI * 2;
  const steps = NUM.THIRTYTHREE;
  const b = Math.log(Math.pow(phi, turns)) / totalAngle;
  const output = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = totalAngle * t - Math.PI / 2;
    const radius = scale * Math.exp(b * angle);
    output.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  return output;
}

function drawDoubleHelix(ctx, width, height, palette, NUM) {
  /* ND-safe: static helix lattice with 22 crossbars, no oscillation. */
  const cycles = NUM.THREE;
  const steps = NUM.ONEFORTYFOUR;
  const axisX = width * 0.62;
  const top = height * 0.08;
  const bottom = height * 0.92;
  const amplitude = width / NUM.NINE;
  const strandA = hexToRgba(pickLayer(palette.layers, 5, palette.ink), 0.8);
  const strandB = hexToRgba(pickLayer(palette.layers, 1, palette.ink), 0.7);

  ctx.save();
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";

  const strandPointsA = createHelixPoints(axisX, top, bottom, amplitude, cycles, steps, 0);
  const strandPointsB = createHelixPoints(axisX, top, bottom, amplitude, cycles, steps, Math.PI);

  strokePolyline(ctx, strandPointsA, strandA);
  strokePolyline(ctx, strandPointsB, strandB);

  // Crossbars referencing the 22 paths
  ctx.strokeStyle = hexToRgba(pickLayer(palette.layers, 3, palette.ink), 0.32);
  ctx.lineWidth = 1.4;
  for (let i = 0; i <= NUM.TWENTYTWO; i += 1) {
    const t = i / NUM.TWENTYTWO;
    const angle = t * Math.PI * 2 * cycles;
    const y = top + (bottom - top) * t;
    const x1 = axisX + Math.sin(angle) * amplitude;
    const x2 = axisX + Math.sin(angle + Math.PI) * amplitude;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  // Central spine for grounding
  ctx.strokeStyle = hexToRgba(palette.ink, 0.22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(axisX, top);
  ctx.lineTo(axisX, bottom);
  ctx.stroke();

  ctx.restore();
}

function createHelixPoints(axisX, top, bottom, amplitude, cycles, steps, phase) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * cycles + phase;
    const y = top + (bottom - top) * t;
    const x = axisX + Math.sin(angle) * amplitude;
    points.push({ x, y });
  }
  return points;
}

function strokePolyline(ctx, points, strokeStyle) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function pickLayer(layers, index, fallback) {
  return layers && layers[index] ? layers[index] : fallback;
}

function hexToRgba(hex, alpha) {
  if (!hex) {
    return `rgba(0,0,0,${clamp(alpha, 0, 1)})`;
  }
  let value = hex.trim();
  if (value.startsWith("#")) {
    value = value.slice(1);
  }
  if (value.length === 3) {
    value = value.split("").map(ch => ch + ch).join("");
  }
  if (value.length !== 6) {
    return `rgba(0,0,0,${clamp(alpha, 0, 1)})`;
  }
  const intValue = parseInt(value, 16);
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  const a = clamp(alpha, 0, 1);
  return `rgba(${r},${g},${b},${a})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
