/*
  helix-renderer.mjs
  ND-safe static renderer for layered sacred geometry.

  Layers are drawn in a fixed order to maintain gentle depth cues:
    1) Vesica field (intersecting circles) for grounding.
    2) Tree-of-Life scaffold (10 sephirot, 22 paths) for structural anchors.
    3) Fibonacci curve (log spiral) for harmonic flow.
    4) Double-helix lattice (phase-shifted strands) for cosmic weave.

  All geometry uses numerology constants (3, 7, 9, 11, 22, 33, 99, 144) to respect lore.
  Each helper is pure: it only depends on supplied parameters and returns new data.
*/

const FALLBACK_NUM = {
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
  const dims = { width: options.width, height: options.height };
  const palette = normalisePalette(options.palette);
  const NUM = options.NUM || FALLBACK_NUM;

  ctx.save();
  ctx.clearRect(0, 0, dims.width, dims.height);

  fillBackground(ctx, palette, dims, NUM);
  drawVesicaLayer(ctx, dims, palette, NUM);
  drawTreeOfLifeLayer(ctx, dims, palette, NUM);
  drawFibonacciLayer(ctx, dims, palette, NUM);
  drawHelixLayer(ctx, dims, palette, NUM);
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

function normalisePalette(palette) {
  const layers = Array.isArray(palette.layers) ? palette.layers : [];
  return {
    bg: palette.bg || "#0b0b12",
    ink: palette.ink || "#e8e8f0",
    muted: palette.muted || "#a6a6c1",
    layers,
  };
}

function fillBackground(ctx, palette, dims, NUM) {
  /* ND-safe: flat fill with a subtle radial glow, no motion or flicker. */
  ctx.save();
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, dims.width, dims.height);
  const depth = palette.layers.length || (NUM.THREE - 1);
  const glow = ctx.createRadialGradient(
    dims.width / (NUM.THREE - 1),
    dims.height / depth,
    0,
    dims.width / (NUM.THREE - 1),
    dims.height / (NUM.THREE - 1),
    Math.max(dims.width, dims.height) / (NUM.THREE - 1)
  );
  glow.addColorStop(0, withAlpha(palette.ink, 0.06));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, dims.width, dims.height);
  ctx.restore();
}

function drawVesicaLayer(ctx, dims, palette, NUM) {
  /* ND-safe: concentric field only, no oscillation or animated blending. */
  const circles = createVesicaCircles(dims, NUM);
  ctx.save();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = withAlpha(pickLayer(palette.layers, 0, "#8fa1ff"), 0.44);
  ctx.shadowColor = withAlpha(pickLayer(palette.layers, 0, "#8fa1ff"), 0.18);
  ctx.shadowBlur = 18;
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function createVesicaCircles(dims, NUM) {
  const circles = [];
  const center = { x: dims.width / 2, y: dims.height / 2 };
  const baseRadius = Math.min(dims.width, dims.height) / (NUM.THREE + (NUM.SEVEN / NUM.ELEVEN));
  const horizontalSpacing = baseRadius * (NUM.NINE / NUM.ELEVEN);
  const verticalSpacing = baseRadius * (NUM.THREE / NUM.TWENTYTWO);

  // Core triple vesica (3 circles)
  for (let i = 0; i < NUM.THREE; i += 1) {
    const offset = (i - (NUM.THREE - 1) / 2) * horizontalSpacing;
    circles.push({ x: center.x + offset, y: center.y, r: baseRadius });
  }

  // Vertical layering using 7 bands
  const range = Math.floor(NUM.SEVEN / 2);
  for (let j = -range; j <= range; j += 1) {
    const scale = (NUM.SEVEN - Math.abs(j)) / NUM.SEVEN;
    circles.push({
      x: center.x,
      y: center.y + j * verticalSpacing,
      r: baseRadius * ((NUM.NINE + scale * NUM.THREE) / NUM.TWENTYTWO)
    });
  }

  // Diagonal overlays using 9 phases for subtle interference pattern
  for (let k = 0; k < NUM.NINE; k += 1) {
    const theta = (k / NUM.NINE) * Math.PI;
    const x = center.x + Math.cos(theta) * horizontalSpacing * ((NUM.TWENTYTWO - NUM.SEVEN) / NUM.TWENTYTWO);
    const y = center.y + Math.sin(theta) * verticalSpacing * NUM.THREE;
    circles.push({ x, y, r: baseRadius * ((NUM.ELEVEN + NUM.THREE) / NUM.TWENTYTWO) });
  }

  return circles;
}

function drawTreeOfLifeLayer(ctx, dims, palette, NUM) {
  /* ND-safe: thin luminous paths to avoid overwhelming contrast. */
  const nodes = createTreeNodes(dims, NUM);
  const paths = createTreePaths();
  ctx.save();
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = withAlpha(pickLayer(palette.layers, 1, "#89f7fe"), 0.36);
  ctx.shadowColor = withAlpha(pickLayer(palette.layers, 1, "#89f7fe"), 0.18);
  ctx.shadowBlur = 12;
  paths.forEach(([startIndex, endIndex]) => {
    const start = nodes[startIndex];
    const end = nodes[endIndex];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  const nodeRadius = Math.min(dims.width, dims.height) / NUM.ONEFORTYFOUR * NUM.NINE / NUM.TWENTYTWO;
  ctx.fillStyle = withAlpha(pickLayer(palette.layers, 4, "#f5a3ff"), 0.82);
  ctx.strokeStyle = withAlpha(palette.ink, 0.25);
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function createTreeNodes(dims, NUM) {
  const nodes = [];
  const centerX = dims.width / 2;
  const top = dims.height / NUM.SEVEN;
  const verticalStep = (dims.height * (NUM.NINE / NUM.TWENTYTWO)) / NUM.NINE;
  const horizontalOffset = dims.width / NUM.ELEVEN;

  // Standard Tree-of-Life layout (10 sephirot)
  nodes.push({ x: centerX, y: top }); // Kether
  nodes.push({ x: centerX + horizontalOffset, y: top + verticalStep }); // Chokmah
  nodes.push({ x: centerX - horizontalOffset, y: top + verticalStep }); // Binah
  nodes.push({ x: centerX + horizontalOffset, y: top + verticalStep * 2 }); // Chesed
  nodes.push({ x: centerX - horizontalOffset, y: top + verticalStep * 2 }); // Geburah
  nodes.push({ x: centerX, y: top + verticalStep * 3 }); // Tiphereth
  nodes.push({ x: centerX + horizontalOffset, y: top + verticalStep * 4 }); // Netzach
  nodes.push({ x: centerX - horizontalOffset, y: top + verticalStep * 4 }); // Hod
  nodes.push({ x: centerX, y: top + verticalStep * 5 }); // Yesod
  nodes.push({ x: centerX, y: top + verticalStep * 6 }); // Malkuth

  return nodes;
}

function createTreePaths() {
  /* 22 paths to echo the 22 Hebrew letters while avoiding harsh diagonals. */
  return [
    [0, 1], [0, 2], [1, 2],
    [1, 3], [2, 4], [3, 4],
    [3, 5], [4, 5], [3, 6],
    [4, 7], [5, 6], [5, 7],
    [6, 7], [5, 8], [6, 8],
    [7, 8], [6, 9], [7, 9],
    [8, 9], [1, 4], [2, 3],
    [1, 5]
  ];
}

function drawFibonacciLayer(ctx, dims, palette, NUM) {
  /* ND-safe: smooth polyline approximates spiral without animation. */
  const center = { x: dims.width / 2, y: dims.height * (NUM.NINE / NUM.TWENTYTWO) };
  const scale = Math.min(dims.width, dims.height) / NUM.ONEFORTYFOUR * NUM.ELEVEN;
  const points = createFibonacciPoints(center, scale, NUM);

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = withAlpha(pickLayer(palette.layers, 3, "#ffd27f"), 0.82);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = withAlpha(pickLayer(palette.layers, 2, "#a0ffa1"), 0.58);
  const step = Math.max(1, Math.floor(points.length / NUM.NINE));
  const markerRadius = Math.min(dims.width, dims.height) / NUM.ONEFORTYFOUR * (NUM.THREE / NUM.ELEVEN);
  for (let i = 0; i < points.length; i += step) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, markerRadius, 0, Math.PI * 2);
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

function createFibonacciPoints(center, scale, NUM) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const rotations = NUM.NINE / NUM.THREE; // 3 turns
  const totalAngle = rotations * Math.PI * (NUM.TWENTYTWO / NUM.ELEVEN); // 6π
  const growth = Math.pow(phi, rotations);
  const b = Math.log(growth) / totalAngle;
  const steps = NUM.THIRTYTHREE;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = totalAngle * t;
    const radius = scale * Math.exp(b * angle);
    const x = center.x + radius * Math.cos(angle);
    const y = center.y - radius * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
}

function drawHelixLayer(ctx, dims, palette, NUM) {
  /* ND-safe: double helix rendered once; crossbars form static lattice. */
  const strands = createHelixStrands(dims, NUM);
  ctx.save();
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = withAlpha(pickLayer(palette.layers, 5, "#d0d0e6"), 0.55);
  drawPolyline(ctx, strands.strandA);
  drawPolyline(ctx, strands.strandB);

  ctx.strokeStyle = withAlpha(pickLayer(palette.layers, 0, "#b1c7ff"), 0.32);
  strands.crossLinks.forEach(link => {
    ctx.beginPath();
    ctx.moveTo(link.a.x, link.a.y);
    ctx.lineTo(link.b.x, link.b.y);
    ctx.stroke();
  });

  ctx.strokeStyle = withAlpha(palette.ink, 0.18);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dims.width / 2, dims.height / NUM.ELEVEN);
  ctx.lineTo(dims.width / 2, dims.height - dims.height / NUM.ELEVEN);
  ctx.stroke();
  ctx.restore();
}

function createHelixStrands(dims, NUM) {
  const steps = NUM.NINETYNINE;
  const marginY = dims.height / NUM.SEVEN;
  const usableHeight = dims.height - marginY * 2;
  const amplitude = Math.min(dims.width, dims.height) / NUM.THREE;
  const centerX = dims.width / 2;
  const rotations = NUM.NINE / NUM.THREE; // 3
  const fullAngle = rotations * Math.PI * (NUM.TWENTYTWO / NUM.ELEVEN); // 6π
  const strandA = [];
  const strandB = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const y = marginY + usableHeight * t;
    const angle = fullAngle * t;
    const offset = Math.sin(angle) * amplitude * (NUM.SEVEN / NUM.TWENTYTWO);
    strandA.push({ x: centerX + offset, y });
    strandB.push({ x: centerX - offset, y });
  }

  const crossLinks = [];
  const crossCount = NUM.TWENTYTWO;
  for (let j = 0; j < crossCount; j += 1) {
    const index = Math.round((j / (crossCount - 1)) * steps);
    crossLinks.push({ a: strandA[index], b: strandB[index] });
  }

  return { strandA, strandB, crossLinks };
}

function drawPolyline(ctx, points) {
  if (!points.length) {
    return;
  }
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();
}

function pickLayer(layers, index, fallback) {
  return layers && layers[index] ? layers[index] : fallback;
}

function withAlpha(hex, alpha) {
  const rgb = hexToRgb(hex || "#ffffff");
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  if (value.length === 3) {
    const r = parseInt(value[0] + value[0], 16);
    const g = parseInt(value[1] + value[1], 16);
    const b = parseInt(value[2] + value[2], 16);
    return { r, g, b };
  }
  if (value.length === 6) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
  }
  return { r: 255, g: 255, b: 255 };
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
