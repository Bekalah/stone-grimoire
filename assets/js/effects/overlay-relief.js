
// assets/js/effects/overlay-relief.js
// Living-sculpture overlay that "breathes" with tone.

import { ensureAudio, getAnalyser, onToneChange } from '../engines/ambient-engine.js';

let canvas=null, ctx=null, rafId=0;
let analyser=null, bins=null;
let img=null, ready=false;
let active=false, alpha=0.25, ro=null;

function dprCap(){ const d=window.devicePixelRatio||1; return Math.min(Math.max(1,d),2); }
function sizeCanvas(c){
  if (!c || !ctx) return;
  const d=dprCap(); const w=c.clientWidth||640; const h=c.clientHeight||360;
  c.width=Math.floor(w*d); c.height=Math.floor(h*d); ctx.setTransform(d,0,0,d,0,0);
}
function mountResize(){
  if ('ResizeObserver' in window){ ro=new ResizeObserver(()=> sizeCanvas(canvas)); ro.observe(canvas); }
  else window.addEventListener('resize', ()=> sizeCanvas(canvas), { passive:true });
}
function unmountResize(){ if(ro){ try{ro.disconnect();}catch(_){} ro=null; } }

function fallbackPattern(w,h,str){
  ctx.save(); ctx.translate(w*0.5,h*0.5); ctx.globalAlpha=0.10+str*0.10;
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=Math.max(1, Math.round(Math.min(w,h)*0.002));
  for(let i=0;i<48;i++){ ctx.rotate(Math.PI/24); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, Math.min(w,h)*0.45); ctx.stroke(); }
  ctx.restore();
}

function draw(tms){
  if(!active||!ctx) return;
  rafId=requestAnimationFrame(draw);
  const w=canvas.clientWidth||640, h=canvas.clientHeight||360, t=(tms||0)*0.001;

  let energy = 0.2 + 0.1*Math.sin(t*0.7);
  if(analyser&&bins){
    analyser.getByteFrequencyData(bins);
    let sum=0,n=0, m=Math.min(64,bins.length);
    for(let i=2;i<m;i++){ sum+=bins[i]; n++; }
    const avg=n?(sum/n):0; energy = 0.12 + (avg/255)*0.55;
  }

  ctx.clearRect(0,0,w,h);
  if(!ready || !img || !img.complete || img.naturalWidth===0){ fallbackPattern(w,h,energy); return; }

  const blur=Math.round(energy*8), bright=1+energy*0.3;
  ctx.globalAlpha = alpha + energy*0.25; ctx.filter = 'blur('+blur+'px) brightness('+bright+')';

  const arI = img.naturalWidth / img.naturalHeight;
  const arC = w / h; let dw=w, dh=h, dx=0, dy=0;
  if (arI > arC){ dh=h; dw=Math.ceil(h*arI); dx=Math.floor((w-dw)/2); }
  else { dw=w; dh=Math.ceil(w/arI); dy=Math.floor((h-dh)/2); }
  ctx.drawImage(img, dx, dy, dw, dh);

  ctx.filter='none'; ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(255,255,255,'+(0.05+energy*0.1)+')';
  ctx.lineWidth=Math.max(1, Math.round(Math.min(w,h)*0.002));
  ctx.strokeRect(0,0,w,h);
}

function start(){
  if(active) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    active=true; draw(0); cancelAnimationFrame(rafId); active=false; return;
  }
  active=true; rafId=requestAnimationFrame(draw);
}
function stop(){ active=false; cancelAnimationFrame(rafId); if(ctx&&canvas) ctx.clearRect(0,0,canvas.clientWidth||0,canvas.clientHeight||0); }

/** Mount */
export async function mountOverlayCanvas(target, opts){
  const o = Object.assign({ src:'', alpha:0.25, useAudio:true }, opts||{});
  canvas = typeof target==='string' ? document.querySelector(target) : target;
  if (!canvas) return;

  ctx = canvas.getContext('2d'); alpha = Math.max(0, Math.min(1, Number(o.alpha)));
  sizeCanvas(canvas); mountResize();

  ready=false; img=new Image(); img.decoding='async';
  img.src = o.src || canvas.getAttribute('src') || canvas.getAttribute('data-src') || ''; 
  img.onload = ()=> { ready=true; }; img.onerror=()=>{ ready=false; };

  if (o.useAudio){
    try { await ensureAudio(); } catch(_) {}
    analyser = getAnalyser(); bins = new Uint8Array(analyser.frequencyBinCount || 512);
    onToneChange(()=> start());
  }
  window.addEventListener('pointerdown', ()=> { if(!active) start(); }, { passive:true });

  return { start, stop, unmount: ()=>{ stop(); unmountResize(); canvas=ctx=img=null; ready=false; } };
}
export function reliefOn(){ start(); }
export function reliefOff(){ stop(); }