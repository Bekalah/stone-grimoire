let audioCtx, irBuffer;

async function fetchJSON(u){const r=await fetch(u); if(!r.ok) throw new Error(u); return r.json();}
async function getCtx(){audioCtx = audioCtx||new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state!=='running') await audioCtx.resume(); return audioCtx;}
async function loadIR(path){
  if(irBuffer) return irBuffer;
  const ctx = await getCtx();
  const buf = await (await fetch(path)).arrayBuffer();
  irBuffer = await ctx.decodeAudioData(buf); return irBuffer;
}

export async function initCrystalGrid(canvasSel, opts){
  const canvas = typeof canvasSel==='string'? document.querySelector(canvasSel): canvasSel;
  if(!canvas) return;
  const ctx2d = canvas.getContext('2d');

  const crystals = (await fetchJSON(opts.crystalsUrl)).crystals;
  const grids = (await fetchJSON(opts.gridsUrl)).grids;
  const grid = grids.find(g=>g.id===opts.gridId) || grids[0];
  const cById = Object.fromEntries(crystals.map(c=>[c.id,c]));

  const scale = Math.min(canvas.width, canvas.height) * 0.35;
  const cx = canvas.width/2, cy = canvas.height/2;

  // draw edges (center connections)
  ctx2d.lineWidth = 1.5; ctx2d.strokeStyle = '#777';
  (grid.nodes||[]).forEach(n=>{
    ctx2d.beginPath(); ctx2d.moveTo(cx,cy);
    ctx2d.lineTo(cx + n.pos.x*scale, cy - n.pos.y*scale);
    ctx2d.stroke();
  });

  // draw center (optional)
  if(grid.center?.crystal){
    const cc = cById[grid.center.crystal] || {};
    drawNode(cx, cy, 10, cc.color || '#ffffff');
  }

  // draw nodes + bind interactions
  const nodes = (grid.nodes||[]).map(n=>{
    const ref = cById[n.crystal] || {};
    const x = cx + n.pos.x*scale, y = cy - n.pos.y*scale;
    drawNode(x, y, 8, ref.color || '#fff');
    return { x, y, r: 12, ref };
  });

  // ND-safe: no autoplay; user gesture starts tone
  canvas.addEventListener('pointerdown', async (e)=>{
    const {left,top} = canvas.getBoundingClientRect();
    const x = e.clientX - left, y = e.clientY - top;
    const hit = nodes.find(n=> (x-n.x)**2 + (y-n.y)**2 <= n.r**2 );
    if(!hit) return;
    if(document.documentElement.classList.contains('muted')) return;
    try { await playTone(hit.ref.toneHz||528, opts.impulseResponse, 0.26); } catch {}
    // gentle bloom
    bloom(ctx2d, hit.x, hit.y, hit.ref.color||'#fff');
  }, {passive:true});

  function drawNode(x,y,r,color){
    ctx2d.beginPath(); ctx2d.arc(x,y,r,0,Math.PI*2);
    ctx2d.fillStyle = color; ctx2d.fill(); ctx2d.strokeStyle='#333'; ctx2d.stroke();
  }

  function bloom(ctx,x,y,color){
    const steps = document.documentElement.classList.contains('reduced-motion')? 12 : 24;
    let i=0; const base = hex2rgba(color, .45);
    const fade = ()=>{ i++; if(i>steps) return;
      const rr = 8 + i*2; ctx.beginPath(); ctx.arc(x,y,rr,0,Math.PI*2);
      ctx.strokeStyle = `rgba(${base.r},${base.g},${base.b},${(1 - i/steps)*0.35})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      if(!document.documentElement.classList.contains('reduced-motion')) requestAnimationFrame(fade);
    }; fade();
  }

  function hex2rgba(hex,a=1){
    const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return {r,g,b,a};
  }
}

async function playTone(hz, irPath, gain=0.25){
  const root = document.documentElement;
  const ctx = await getCtx();
  const osc = ctx.createOscillator(); osc.type='sine'; osc.frequency.value = hz;

  const conv = ctx.createConvolver();
  try { conv.buffer = await loadIR(irPath); } catch { /* dry fallback */ }

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value=-24; comp.knee.value=24; comp.ratio.value=12; comp.attack.value=0.003; comp.release.value=0.25;

  const g = ctx.createGain();
  const master = parseFloat(getComputedStyle(root).getPropertyValue('--master-gain')||'1');
  const cap = 0.35; g.gain.value = Math.min(gain, cap) * master;

  osc.connect(conv); conv.connect(comp); comp.connect(g); g.connect(ctx.destination);
  osc.start();
  // Calm mode = shorter pad
  const dur = root.classList.contains('calm') ? 2.5 : 4.0;
  setTimeout(()=>{ try{osc.stop()}catch{} }, dur*1000);
}