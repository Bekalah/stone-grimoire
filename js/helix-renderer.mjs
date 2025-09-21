/**
 * Render a static "Cosmic Helix" scene into a 2D canvas context.
 *
 * Orchestrates four layered, non-animated drawing passes (background glow, vesica field with numerology grid,
 * Tree-of-Life scaffold, Fibonacci spiral, and double-helix lattice) using a normalized configuration derived from
 * the provided options.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw into.
 * @param {Object} [options] - Optional rendering configuration (width, height, palette, NUM); values are merged with sensible defaults by normaliseOptions().
 */

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

/**
 * Normalize user-provided renderer options into a safe configuration object.
 *
 * Produces an object with guaranteed numeric width and height, a validated palette,
 * and a merged numerology map. Missing or invalid fields are replaced with sensible
 * defaults (width: 1440, height: 900). Palette and NUM are passed through
 * normalisePalette and normaliseNumerology respectively.
 *
 * @param {Object} options - Partial options provided by the caller. May include:
 *   - width {number} Desired canvas width.
 *   - height {number} Desired canvas height.
 *   - palette {Object} Palette data (will be normalized).
 *   - NUM {Object} Numerology overrides (will be merged with defaults).
 * @return {{width: number, height: number, palette: Object, NUM: Object}} Normalized configuration.
 */
function normaliseOptions(options) {
  const safe = options || {};
  const width = typeof safe.width === "number" ? safe.width : 1440;
  const height = typeof safe.height === "number" ? safe.height : 900;
  const palette = normalisePalette(safe.palette);
  const NUM = normaliseNumerology(safe.NUM);
  return { width, height, palette, NUM };
}

/**
 * Normalize a user-supplied color palette, returning a safe palette object with defaults.
 *
 * Ensures the result contains:
 * - bg: background color string (default "#0b0b12"),
 * - ink: foreground/ink color string (default "#e8e8f0"),
 * - layers: an array of layer color strings (uses provided non-empty array or a sensible fallback list).
 *
 * @param {Object} [palette] - Optional input palette; may contain `bg`, `ink`, and `layers`.
 * @return {{bg: string, ink: string, layers: string[]}} Normalized palette suitable for rendering.
 */
function normalisePalette(palette) {
  const base = palette || {};
  const fallbackLayers = ["#8ba8ff", "#74d8f2", "#98f7c4", "#ffd8a8", "#f6b8ff", "#d8dcff"];
  return {
    bg: typeof base.bg === "string" ? base.bg : "#0b0b12",
    ink: typeof base.ink === "string" ? base.ink : "#e8e8f0",
    layers: Array.isArray(base.layers) && base.layers.length > 0 ? base.layers.slice() : fallbackLayers
  };
}

/**
 * Produce a numerology map by merging a provided NUM overrides object with a fixed numeric template.
 *
 * If NUM is falsy the function returns the default template. For each key in the template
 * (THREE, SEVEN, NINE, ELEVEN, TWENTYTWO, THIRTYTHREE, NINETYNINE, ONEFORTYFOUR) the value
 * from NUM is used only when it is a number; otherwise the template default is preserved.
 *
 * @param {Object} [NUM] - Optional partial overrides where numeric properties replace defaults.
 * @return {{THREE:number,SEVEN:number,NINE:number,ELEVEN:number,THIRTYTHREE:number,TWENTYTWO:number,NINETYNINE:number,ONEFORTYFOUR:number}}
 */
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

/**
 * Paints the canvas background: fills with the base dusk color and overlays a centered soft radial glow.
 *
 * The radial glow uses palette.layers[1] (falls back to palette.ink) at low alpha as the inner color and fades to transparent using palette.bg.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context to paint into.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} palette - Color palette containing at least `bg`, `ink`, and `layers` (array); `layers[1]` is used for the glow start color.
 */
function paintBackground(ctx, width, height, palette) {
  /* ND-safe base: solid dusk tone with soft radial glow. */
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

/**
 * Draws the Vesica field (two rim circles and a dashed grid) onto the canvas.
 *
 * Uses buildVesicaField(...) to compute circle and grid geometry, strokes the two
 * rim circles with a stronger alpha, then renders the grid as dashed lines.
 * Colors are taken from palette.layers with fallbacks to palette.ink; alpha values
 * are applied internally (rim ~0.8, grid ~0.35). This function mutates the provided
 * 2D canvas context by drawing these elements.
 *
 * @param {number} width - Canvas drawing width used to build the field geometry.
 * @param {number} height - Canvas drawing height used to build the field geometry.
 * @param {Object} palette - Palette object; layer 0 is used for the rim and layer 2 for the grid. If a layer is missing or invalid the function falls back to palette.ink.
 * @param {Object} NUM - Numerology constants; used for grid dash spacing and passed to buildVesicaField to determine circle positions and grid spacing.
 */
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

/**
 * Build geometry for a Vesica Piscis field: two overlapping circles and a rectangular grid clipped to their vertical span.
 *
 * The function computes two equal-radius circles centered horizontally around the canvas center and a set of
 * vertical and horizontal grid line segments that span the full diameter of the circles. Vertical grid lines are
 * placed across the diameter using NUM.TWENTYTWO spacing (centered on the canvas) and horizontal lines use
 * NUM.SEVEN spacing. Coordinates are returned in simple object shapes ready for drawing.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology constants used for spacing and sizing (must contain numeric keys: THREE, SEVEN, ELEVEN, TWENTYTWO).
 * @returns {{ circles: Array<{x:number,y:number,r:number}>, grid: Array<{ax:number,ay:number,bx:number,by:number}> }} 
 *          An object with `circles` (two circle descriptors: center x/y and radius) and `grid` (array of line segments defined by start ax/ay and end bx/by).
 */
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

/**
 * Render the "Tree of Life" scaffold (Layer 2) onto the provided 2D canvas context.
 *
 * Draws connection paths between computed Tree nodes first (semi-transparent strokes),
 * then draws filled circular nodes on top. Node positions are generated by buildTreeNodes
 * and edge pairs by buildTreePaths.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw into.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} palette - Palette used for styling; must provide `layers` (array) and `ink` (fallback color).
 * @param {Object} NUM - Numerology constants map (expects numeric entries such as `ONEFORTYFOUR`) used to compute node sizing and layout.
 */
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
  const nodeRadius = Math.max(4, Math.min(width, height) / NUM.ONEFORTYFOUR * 3);
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Compute coordinates for a 10-node "Tree of Life" scaffold arranged vertically around the canvas center.
 *
 * The layout places nodes in three vertical columns (center and two side pillars) with even vertical spacing.
 * Side pillar x-positions are offset from the canvas center by (width / NUM.THREE) / 2 and vertical spacing is
 * height / (NUM.ELEVEN + 2). Node ordering in the returned array corresponds to the renderer's expected indices.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology constants; this function reads NUM.THREE and NUM.ELEVEN to compute offsets and spacing.
 * @return {Array<{x:number,y:number}>} An array of 10 point objects representing node positions (x, y).
 */
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

/**
 * Return the adjacency list for the Tree-of-Life scaffold as index pairs.
 *
 * Each two-element array [a, b] denotes an undirected connection between node indices `a` and `b`
 * in the Tree-of-Life layout used by the renderer.
 *
 * @return {number[][]} Array of two-element index pairs representing edges between nodes.
 */
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

/**
 * Render the Layer 3 Fibonacci spiral as a static stroked polyline on the given canvas context.
 *
 * Generates spiral coordinates with buildSpiralPoints(width, height, NUM) and draws a single
 * connected path through those points. Stroke color is taken from palette.layers[4] with a
 * fallback to palette.ink, rendered at alpha 0.85 and line width 2. The function draws directly
 * to the provided 2D rendering context and preserves the context state.
 *
 * @param {number} width - Canvas width used to size the spiral.
 * @param {number} height - Canvas height used to size the spiral.
 * @param {Object} palette - Palette object; layer index 4 is used as the preferred stroke color.
 * @param {Object} NUM - Numerology constants object used by buildSpiralPoints to compute the spiral.
 */
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

/**
 * Generate a sequence of points approximating a Fibonacci-like spiral centered on the canvas.
 *
 * Produces `NUM.NINETYNINE` points by stepping an angular increment and growing the radius
 * multiplicatively using the golden ratio (phi). Radius growth is capped to remain within
 * the canvas. Points are returned in order from the spiral center outward.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology constants map; used to control counts and scale. Required keys: `NINETYNINE`, `THIRTYTHREE`, `NINE`.
 * @return {Array<{x:number,y:number}>} Array of points with `x` and `y` coordinates for the spiral polyline.
 */
function buildSpiralPoints(width, height, NUM) {
  const total = NUM.NINETYNINE;
  const centreX = width / 2;
  const centreY = height / 2;
  const baseRadius = Math.min(width, height) / NUM.THIRTYTHREE;
  const phi = (1 + Math.sqrt(5)) / 2;
  const angleStep = (Math.PI * 2) / NUM.THIRTYTHREE;
  const maxRadius = Math.min(width, height) / 2.1;
  const output = [];

  for (let i = 0; i < total; i += 1) {
    const angle = i * angleStep;
    const radius = Math.min(baseRadius * Math.pow(phi, i / NUM.NINE), maxRadius);
    output.push({
      x: centreX + Math.cos(angle) * radius,
      y: centreY + Math.sin(angle) * radius
    });
  }
  return output;
}

/**
 * Render the static double-helix lattice (two sinusoidal strands with crossbars) onto a 2D canvas.
 *
 * Draws the helix crossbars first (thin, semi-transparent lattice color) and then two stroked strands
 * (thicker, higher-opacity strand color). Colors are chosen from the provided palette (layer 5 for
 * strands, layer 0 for lattice) and rendered with preset alpha values.
 *
 * @param {Object} palette - Color palette object; used to pick layer colors for lattice and strands.
 * @param {Object} NUM - Numerology constants used to compute helix geometry and segment counts.
 */
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

/**
 * Generate point coordinates for a double-helix: two sinusoidal strands and the crossbars between them.
 *
 * The function returns evenly spaced x positions across the given width and computes two y positions per x
 * to form opposing sine-wave strands. Crossbars are the vertical segments that connect each pair of corresponding
 * points on the two strands.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology constants used to size the helix (expects numeric properties such as ONEFORTYFOUR, THREE, and ELEVEN).
 * @return {{strandA: Array<{x:number,y:number}>, strandB: Array<{x:number,y:number}>, crossbars: Array<{ax:number,ay:number,bx:number,by:number}>}} An object containing:
 *   - strandA: points for the first strand (ordered left-to-right).
 *   - strandB: points for the second strand (ordered left-to-right).
 *   - crossbars: segments connecting corresponding points on strandA and strandB.
 */
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

/**
 * Stroke a connected polyline through an ordered list of points.
 *
 * Draws a single stroked path that moves to the first point then lines to each subsequent point.
 *
 * @param {Array<{x: number, y: number}>} points - Ordered array of point objects with numeric `x` and `y` coordinates. Empty or single-item arrays result in no visible line.
 */
function drawPolyline(ctx, points) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}

/**
 * Safely select a color layer string from an array, returning a fallback when unavailable.
 *
 * @param {Array<string>|any} layers - Array of color layer values (may be missing or invalid).
 * @param {number} index - Index of the desired layer.
 * @param {string} fallback - String to return when the selected layer is not a valid string.
 * @return {string} The layer color at `index` when it is a string, otherwise the `fallback`.
 */
function pickLayer(layers, index, fallback) {
  if (!Array.isArray(layers)) return fallback;
  const tone = layers[index];
  return typeof tone === "string" ? tone : fallback;
}

/**
 * Convert a 6-digit hex color string to an `rgba()` CSS string with the given alpha.
 *
 * Accepts a hex string with or without a leading `#` (must be exactly 6 hex digits). If the input
 * is not a valid 6-digit hex string the function returns white with the provided alpha.
 *
 * @param {string} hex - 6-digit hex color (e.g. "#1a2b3c" or "1a2b3c").
 * @param {number} alpha - Alpha channel in [0,1].
 * @returns {string} The color as an `rgba(r,g,b,a)` string.
 */
function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
