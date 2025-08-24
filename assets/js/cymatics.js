// assets/js/cymatics.js
import { ensureAudio, getAnalyser, onToneChange } from './ambient-engine.js';

let ctx = null, canvas = null, rafId = 0, analyser = null, data = null;
let active = false, currentHz = 528;

function size(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function draw(){
  if (!active || !ctx || !analyser) return;
  rafId = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(data);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const cx = w/2, cy = h/2;
  ctx.clearRect(0,0,w,h);

  // Background soft haze
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,w,h);
  ctx.globalAlpha = 1;

  // Mandala petals from frequency bins
  const petals = 24; // gentle symmetry
  const baseR = Math.min(cx,cy) * 0.38;
  const scale = 0.005 + (currentHz/20000); // tiny breathing from tone
  ctx.save();
  ctx.translate(cx, cy);

  for (let p=0; p<petals; p++){
    const theta = (p/petals) * Math.PI*2;
    ctx.save();
    ctx.rotate(theta);

    // sample a bin for this petal
    const i = Math.floor((p / petals) * data.length);
    const amp = data[i] / 255; // 0..1
    const r1 = baseR * (1 + amp*0.8);
    const r2 = baseR * (1.5 + amp*1.2);

    // gradient stroke
    const grd = ctx.createLinearGradient(0,-r2, 0, r2);
    grd.addColorStop(0, 'rgba(211, 175, 55, 0.26)'); // gold
    grd.addColorStop(1, 'rgba(139, 92, 158, 0.22)'); // hilma violet

    ctx.strokeStyle = grd;
    ctx.lineWidth = 1 + amp*1.5;

    ctx.beginPath();
    // bezier "petal"
    ctx.moveTo(0, r1);
    ctx.bezierCurveTo(r2*0.25, r1*0.5, r2*0.5, -r1*0.5, 0, -r2);
    ctx.bezierCurveTo(-r2*0.5, -r1*0.5, -r2*0.25, r1*0.5, 0, r1);
    ctx.stroke();

    // inner ring
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(0,0, baseR*(1+amp*0.2), 0, Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // slow spin tied to frequency
  ctx.restore();
}

function start(){
  if (active) return;
  active = true;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    // Respect user: do not animate; draw a still frame
    draw(); cancelAnimationFrame(rafId); active = false; return;
  }
  rafId = requestAnimationFrame(draw);
}

function stop(){
  active = false;
  cancelAnimationFrame(rafId);
  if (ctx) ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
}

export async function mountCymaticsCanvas(selector = '#cymatics'){
  canvas = document.querySelector(selector);
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  size();
  window.addEventListener('resize', size, {passive:true});

  await ensureAudio();
  analyser = getAnalyser();
  const bins = analyser?.frequencyBinCount || 512;
  data = new Uint8Array(bins);

  // Start/stop visuals when tone changes from the plaque button
  onToneChange((hz)=>{ currentHz = hz; start(); });

  // Also start when user clicks anywhere to resume audio context (mobile/iPad)
  window.addEventListener('click', ()=>{ if (currentHz) start(); }, {once:false});
}

// Optional public toggles (if you want to wire UI later)
export function cymaticsOn(){ start(); }
export function cymaticsOff(){ stop(); }