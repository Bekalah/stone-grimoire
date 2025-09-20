/**
 * Render an octagram-style decorative field into a canvas element as a static first-paint fallback.
 *
 * Draws a centered radial gradient background and eight semi-transparent radial spokes.
 * If the canvas element with the given id or its 2D context is unavailable, the function logs a warning and returns early.
 *
 * @param {string} id - DOM id of the target canvas (default "opus").
 * @param {number} W - Canvas width in pixels (default 1200).
 * @param {number} H - Canvas height in pixels (default 675).
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
