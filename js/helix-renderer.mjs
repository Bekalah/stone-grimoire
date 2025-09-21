
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

/**
 * Render the full static Cosmic Helix composition onto a canvas.
 *
 * Paints the background then draws, in order, the vesica field (numerology grid), the
 * Tree-of-Life scaffold, a Fibonacci curve, and a double-helix lattice. The provided
 * options object is normalized (defaults applied for width=1440, height=900, palette,
 * and numerology) before drawing. This function mutates the supplied 2D rendering context.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw into.
 * @param {Object} [options] - Rendering options; normalized by normaliseOptions() when omitted or incomplete.
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

/**
 * Normalize user options into a consistent renderer configuration.
 *
 * Converts a possibly partial options object into a fully populated config with numeric
 * width and height, a normalized palette, and a normalized numerology object.
 *
 * @param {Object} [options] - Partial options supplied by the caller.
 * @param {number} [options.width] - Canvas width; defaults to 1440 when not a number.
 * @param {number} [options.height] - Canvas height; defaults to 900 when not a number.
 * @param {Object|any} [options.palette] - Palette input forwarded to normalisePalette.
 * @param {Object|any} [options.NUM] - Numerology input forwarded to normaliseNumerology.
 * @return {{width: number, height: number, palette: Object, NUM: Object}} Normalized config.
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
 * Normalize a palette object, ensuring background, ink, and layer colors are present.
 *
 * If `palette` is missing or properties are invalid, sensible defaults are used:
 * - bg: "#0b0b12"
 * - ink: "#e8e8f0"
 * - layers: ["#8ba8ff","#74d8f2","#98f7c4","#ffd8a8","#f6b8ff","#d8dcff"]
 *
 * @param {Object} [palette] - Optional input palette. May contain `bg` (string), `ink` (string), and `layers` (string[]).
 * @return {{bg: string, ink: string, layers: string[]}} Normalized palette with `bg`, `ink`, and `layers` properties.
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
 * Normalize a numerology map by filling missing or non-numeric entries with defaults.
 *
 * If `NUM` is falsy, returns the full default mapping. For a provided object, each key
 * from the template (THREE, SEVEN, NINE, ELEVEN, TWENTYTWO, THIRTYTHREE, NINETYNINE, ONEFORTYFOUR)
 * will use the numeric value from `NUM` when present; otherwise the default value is used.
 *
 * @param {Object} [NUM] - Optional partial mapping of numerology keys to numeric values.
 * @return {{THREE:number, SEVEN:number, NINE:number, ELEVEN:number, TWENTYTWO:number, THIRTYTHREE:number, NINETYNINE:number, ONEFORTYFOUR:number}}
 *         A complete numerology object with all keys set to numbers.
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
 * Paints the canvas background: fills the entire area with the palette background
 * and overlays a centered soft radial glow.
 *
 * The radial gradient is centered at (width/2, height/2). Its inner stop uses
 * palette.layers[1] when available (falls back to palette.ink) at 18% opacity and
 * fades to fully transparent palette.bg at the outer radius.
 *
 * @param {object} palette - Palette object containing `bg` (background color), `ink`, and `layers` (array); used to select colors for the fill and glow.
 */
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

/**
 * Render the Vesica field layer (two rim circles and a dashed numerology grid) onto the provided canvas context.
 *
 * Uses buildVesicaField(width, height, NUM) to obtain geometry, strokes the circle rims using palette.layers[0]
 * (falls back to palette.ink) and renders the grid lines using palette.layers[2] (falls back to palette.ink).
 * The grid dash pattern is driven by NUM.THREE.
 *
 * @param {number} width - Canvas drawing width in pixels.
 * @param {number} height - Canvas drawing height in pixels.
 * @param {Object} palette - Palette object containing at least `ink` and `layers` (array of hex colors).
 * @param {Object} NUM - Numerology mapping (e.g., keys like `THREE`) whose numeric values influence spacing and dash lengths.
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
 * Build geometry for the Vesica field: two overlapping circles and a rectangular grid clipped to the vesica bounds.
 *
 * The function computes two equal-radius circles centered vertically and slightly offset horizontally to form a vesica
 * shape, then generates vertical and horizontal grid line segments that span the overlapping region.
 *
 * @param {number} width - Canvas width used to position and size the field.
 * @param {number} height - Canvas height used to position and size the field.
 * @param {Object} NUM - Numerology map providing numeric constants used for layout (expects keys like THREE, SEVEN, ELEVEN, TWENTYTWO).
 * @returns {{ circles: Array<{x:number,y:number,r:number}>, grid: Array<{ax:number,ay:number,bx:number,by:number}> }}
 *   An object with:
 *     - circles: two circle descriptors ({x, y, r}) for the vesica pair.
 *     - grid: an array of line segment objects ({ax, ay, bx, by}) representing vertical and horizontal grid lines across the vesica.
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
 * Render the Tree-of-Life scaffold: strokes the predefined paths then draws filled nodes.
 *
 * Draws each connection produced by buildTreePaths() as a stroked line, then renders
 * every node from buildTreeNodes(...) as a filled circle. Path stroke color comes from
 * palette.layers[3] (fallback to palette.ink) at 0.6 alpha; node fill color comes from
 * palette.layers[1] (fallback to palette.ink) at 0.9 alpha. Node radius is computed as
 * Math.max(4, Math.min(width, height) / NUM.ONEFORTYFOUR * 3).
 *
 * @param {number} width - Canvas drawing width in pixels.
 * @param {number} height - Canvas drawing height in pixels.
 * @param {Object} palette - Palette object with color tokens. Expected to include a
 *   layers array and an ink fallback (palette.ink). Layer indexes 1 and 3 are used.
 * @param {Object} NUM - Numerology constants object. Must include numeric ONEFORTYFOUR
 *   (used to scale node radius).
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
  const nodeRadius = computeNodeRadius(width, height, NUM);
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Build coordinates for the Tree-of-Life nodes laid out vertically on the canvas.
 *
 * Returns an array of 10 {x, y} positions (in canvas pixels) arranged as a central pillar
 * with two lateral pillars. Horizontal placement uses the canvas centre and a pillar offset
 * derived from width / NUM.THREE; vertical spacing divides the height into NUM.ELEVEN + 2 steps.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology map providing numeric constants (e.g., THREE, ELEVEN).
 * @return {Array<{x:number,y:number}>} Array of 10 node coordinates for drawing nodes and edges.
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
 * Provide the predefined Tree-of-Life connections as index pairs.
 *
 * Returns a static list of edges used to connect the ten Tree-of-Life nodes. Each item is a two-element
 * array [a, b] where a and b are node indices (0–9). The list encodes the scaffold's 21 connections.
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
 * Render a static Fibonacci-inspired spiral as a stroked polyline onto a canvas.
 *
 * Draws a single non-animated curve (layer 3) using points computed by buildSpiralPoints.
 * The stroke color is taken from palette.layers[4] with alpha fallback to palette.ink; stroke width is 2.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context to draw into.
 * @param {number} width - Canvas width used to position and scale the spiral.
 * @param {number} height - Canvas height used to position and scale the spiral.
 * @param {object} palette - Palette object; layer color at index 4 is preferred for the stroke.
 * @param {object} NUM - Numerology/config object used by buildSpiralPoints to determine spiral sampling and scale.
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
 * Build a sequence of Cartesian points that trace a Fibonacci-inspired (golden-ratio) spiral centered in the canvas.
 *
 * The spiral is generated by stepping an angle by 2π/NUM.THIRTYTHREE and increasing radius roughly by powers of the golden ratio (phi),
 * capped at half the smallest canvas dimension. Useful for plotting a smooth spiral polyline.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology map; function reads NUM.NINETYNINE (number of points), NUM.THIRTYTHREE (angular step divisor),
 *                       and NUM.NINE (exponential divisor for radial growth).
 * @return {Array<{x:number,y:number}>} Array of points in canvas coordinates describing the spiral, length = NUM.NINETYNINE.
 */
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

/**
 * Render the double-helix layer: two sinusoidal strands and their crossbar lattice.
 *
 * Draws 144 crossbars (from the helix builder) and two strand polylines onto the provided 2D canvas context using colors selected from the palette.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context to draw into.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} palette - Normalised palette object containing `ink`, `bg`, and `layers` color entries.
 * @param {Object} NUM - Numerology constants (normalized via normaliseNumerology) used for segment counts and sizing for the helix generation.
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
 * Build coordinates for two sinusoidal helix strands and their connecting crossbars.
 *
 * Generates discrete points for `strandA` and `strandB` distributed across the
 * given width and computes straight crossbar segments that join corresponding
 * points between the two strands.
 *
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Object} NUM - Numerology constants used for spacing and scale (expects keys such as `ONEFORTYFOUR`, `THREE`, `ELEVEN`).
 * @return {{strandA: Array<{x:number,y:number}>, strandB: Array<{x:number,y:number}>, crossbars: Array<{ax:number,ay:number,bx:number,by:number}>}} Object containing two strand point arrays and an array of crossbar segments.
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
 * Stroke a polyline connecting a sequence of points on the given 2D canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context used for drawing.
 * @param {Array<{x: number, y: number}>} points - Ordered array of points; draws a path from the first to the last point and strokes it.
 */
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


/**
 * Safely select a color string from a palette layers array.
 *
 * Returns the string at `layers[index]` when `layers` is an array and the element is a string;
 * otherwise returns `fallback`.
 *
 * @param {Array<string>|any} layers - Palette layers; may be any value but only an array is accepted.
 * @param {number} index - Index to pick from the layers array.
 * @param {string} fallback - Value to return when the requested layer is unavailable or invalid.
 * @return {string} The selected layer color or the provided fallback.
 */

function pickLayer(layers, index, fallback) {
  if (!Array.isArray(layers)) return fallback;
  const tone = layers[index];
  return typeof tone === "string" ? tone : fallback;
}

/**
 * Convert a 6-digit hex color to an `rgba(...)` CSS string with the specified alpha.
 *
 * Accepts hex strings with or without a leading `#` (e.g. `#ff8800` or `ff8800`). If the input is not a 6-character hex value, the function falls back to white (`rgba(255,255,255,alpha)`).
 *
 * @param {string} hex - Hex color string, 6 hex digits optionally prefixed with `#`.
 * @param {number} alpha - Alpha channel value in the range [0, 1].
 * @returns {string} CSS `rgba(r,g,b,a)` string representing the color with the given alpha.
 */
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
