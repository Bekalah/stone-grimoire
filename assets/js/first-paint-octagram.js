/**
 * Draws an octagram-style fallback background onto a canvas element.
 *
 * Creates a centered radial gradient and paints eight faint radial spokes from the center.
 * Intended as an ND-safe static "first paint" when images or other assets are not available.
 *
 * @param {string} [id="opus"] - ID of the target <canvas> element.
 * @param {number} [W=1200] - Canvas width in CSS pixels; also used for layout calculations.
 * @param {number} [H=675] - Canvas height in CSS pixels; also used for layout calculations.
 *
 * Side effects: sets the canvas size, fills the canvas, and draws lines. If the canvas or its
 * 2D context is not available this function logs a warning and returns without throwing.
 */
export function paintOctagram(id = "opus", W = 1200, H = 675){
  const canvas = document.getElementById(id);
  if (!canvas) {
    console.warn("Octagram canvas not found.");
    return;
  }
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.warn("Canvas 2D context unavailable.");
    return;
  }
  const gradient = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, Math.hypot(W, H) / 2);
  ["#0F0B1E", "#1d1d20", "#3b2e5a", "#bfa66b", "#dfe8ff"].forEach((tone, index) => {
    gradient.addColorStop(index / 4, tone);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#dfe8ff";
  const radius = Math.min(W, H) * 0.32;
  const cx = W / 2;
  const cy = H / 2;
  for (let index = 0; index < 8; index++){
    const angle = (Math.PI / 4) * index;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.stroke();
  }
}
