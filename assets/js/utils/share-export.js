// assets/js/utils/share-export.js
// Composite halo+relief into a PNG, share links, short WebM (best-effort).

function cssVar(name, fallback){ try{const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v||fallback;}catch(_){return fallback;} }
function coverDraw(ctx, src, w, h){
  const sw=src.width, sh=src.height, arS=sw/Math.max(1,sh), arD=w/Math.max(1,h);
  let dw=w, dh=h, dx=0, dy=0;
  if (arS>arD){ dh=h; dw=Math.ceil(h*arS); dx=Math.floor((w-dw)/2); } else { dw=w; dh=Math.ceil(w/arS); dy=Math.floor((h-dh)/2); }
  ctx.drawImage(src, dx, dy, dw, dh);
}
export async function exportCompositePNG(o={}){
  const opts=Object.assign({ halo:'#cath-halo', relief:'#cath-relief', width:1920, height:1080, caption:'', subcaption:'', border:true, filename:'' }, o);
  const halo=(typeof opts.halo==='string')?document.querySelector(opts.halo):opts.halo;
  const relief=(typeof opts.relief==='string')?document.querySelector(opts.relief):opts.relief;
  if(!halo && !relief) throw new Error("No source canvases");

  const out=document.createElement('canvas'); out.width=Math.max(256,opts.width|0); out.height=Math.max(256,opts.height|0);
  const ctx=out.getContext('2d');

  ctx.fillStyle=cssVar('--wash','#0b0d10'); ctx.fillRect(0,0,out.width,out.height);
  if (halo) coverDraw(ctx, halo, out.width, out.height);
  if (relief){ ctx.globalCompositeOperation='screen'; coverDraw(ctx, relief, out.width, out.height); ctx.globalCompositeOperation='source-over'; }

  if (opts.border){ ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=Math.max(2, Math.round(Math.min(out.width,out.height)*0.004)); ctx.strokeRect(0,0,out.width,out.height); }
  if (opts.caption){
    const pad=Math.round(out.height*0.035), fB=Math.max(14,Math.round(out.height*0.032)), fS=Math.max(10,Math.round(out.height*0.020));
    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(pad, out.height - pad*2.2, out.width - pad*2, pad*1.7);
    ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.font='600 '+fB+'px system-ui,-apple-system,Segoe UI,Roboto,sans-serif'; ctx.textBaseline='top';
    ctx.fillText(opts.caption, pad*1.2, out.height - pad*1.9);
    if (opts.subcaption){ ctx.globalAlpha=0.9; ctx.font='400 '+fS+'px system-ui,-apple-system,Segoe UI,Roboto,sans-serif'; ctx.fillText(opts.subcaption, pad*1.2, out.height - pad*1.9 + fB + Math.round(fS*0.3)); ctx.globalAlpha=1; }
  }
  const blob = await new Promise(res=> out.toBlob(res,'image/png'));
  const fname = opts.filename || defaultFileName(opts.caption || 'Cathedral-Plate');
  downloadBlob(blob, fname+'.png');
  return blob;
}
export function defaultFileName(label){
  const t=new Date(), stamp= t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,'0')+"-"+String(t.getDate()).padStart(2,'0');
  return (label||'export').replace(/\s+/g,'_').replace(/[^a-z0-9_\-]/gi,'').slice(0,60)+"_"+stamp;
}
export function downloadBlob(blob, filename){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); }
export async function shareURL(state={}){
  const url = buildShareURL(state);
  if (navigator.share){ try{ await navigator.share({ title: state.title||'Cathedral', text: state.text||'', url }); return true; } catch(_){ } }
  try { await navigator.clipboard.writeText(url); alert('Link copied to clipboard'); return true; } catch(_) {}
  return false;
}
export function buildShareURL(state={}){
  const u=new URL(window.location.href);
  if (state.hz) u.searchParams.set('hz', String(state.hz));
  if (state.stylepack) u.searchParams.set('style', state.stylepack);
  if (state.room) u.searchParams.set('room', state.room);
  if (state.alpha!=null) u.searchParams.set('alpha', String(state.alpha));
  if (state.angel) u.searchParams.set('angel', state.angel);
  history.replaceState(null,'',u.toString()); return u.toString();
}
export async function recordCompositeWebM(halo, relief, seconds=6, fps=30){
  const h=(typeof halo==='string')?document.querySelector(halo):halo;
  const r=(typeof relief==='string')?document.querySelector(relief):relief;
  if(!h && !r) throw new Error('No source canvases');
  const w=Math.max(640,h?.width||r?.width||1280), hgt=Math.max(360,h?.height||r?.height||720);
  const out=document.createElement('canvas'); out.width=w; out.height=hgt; const ctx=out.getContext('2d');
  function composite(){ ctx.fillStyle=cssVar('--wash','#0b0d10'); ctx.fillRect(0,0,w,hgt); if(h) coverDraw(ctx,h,w,hgt); if(r){ ctx.globalCompositeOperation='screen'; coverDraw(ctx,r,w,hgt); ctx.globalCompositeOperation='source-over'; } }
  const stream=out.captureStream(fps);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : '');
  if(!mime) throw new Error('WebM recording not supported');
  const rec=new MediaRecorder(stream,{ mimeType:mime, videoBitsPerSecond:4_000_000 }); const chunks=[]; rec.ondataavailable=(e)=>{ if(e.data&&e.data.size) chunks.push(e.data); };
  const done=new Promise(res=> rec.onstop=()=> res(new Blob(chunks,{type:mime})));
  let frames=0, total=seconds*fps; rec.start();
  (function step(){ if(frames++>=total){ rec.stop(); return; } composite(); setTimeout(step, 1000/fps); })();
  const blob = await done; downloadBlob(blob, defaultFileName('Cathedral-Clip')+'.webm'); return blob;
}