export async function drawLineagePlate(ctx:CanvasRenderingContext2D, w:number, h:number, lineageId:string){
  // Simple client-side loader using relative fetch; swap to tesseract-bridge if desired
  async function j(url:string){ const r=await fetch(url,{cache:"no-store"}); if(!r.ok) throw new Error(url); return r.json(); }
  const map = await j("../../cosmogenesis-learning-engine/data/overlays/lineage_atelier_map.json");
  const cfg = map.map?.[lineageId];
  const basePlate = (lineageId==="VFLM-001") ? "/assets/ateliers/atelier_pigment_haniel.png"
                 : (lineageId==="RAKU-001") ? "/assets/ateliers/atelier_geometry_michael.png"
                 : "/assets/ateliers/atelier_harmonic_gabriel.png";
  const img = new Image(); img.src = basePlate; await img.decode();
  const s = Math.min(w,h); const x=(w-s)/2, y=(h-s)/2;
  ctx.drawImage(img, x, y, s, s);
  // soft label
  ctx.fillStyle="#e8e9f0"; ctx.font="22px system-ui"; ctx.textAlign="center";
  ctx.fillText(`${lineageId} · ${ (cfg?.primary_ateliers||[]).join(" + ") }`, w/2, y + s + 32);
}
