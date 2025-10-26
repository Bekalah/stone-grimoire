// assets/js/effects/crystal-grid.js
// Draws a Seed-of-Life style grid with Platonic nodes; taps bloom tones; simple cymatic pulses.
// Paths assume data in assets/data/*. ASCII-only.

function lerp(a,b,t){ return a + (b - a) * t; }
function dist(x1,y1,x2,y2){ const dx=x1-x2, dy=y1-y2; return Math.hypot(dx,dy); }
function circle(ctx,x,y,r,fill,stroke){
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 1.25; ctx.stroke(); }
}

function toneColor(hz){
  // gentle mapping: low->warm, high->cool
  if (hz >= 900) return "#c7b8ff";
  if (hz >= 800) return "#89a4ff";
  if (hz >= 700) return "#80dfff";
  if (hz >= 600) return "#caa44a";
  if (hz >= 500) return "#a8d39b";
  return "#e6b0a8";
}

function solidMeta(solid){
  // canonical five + aether (icosa/dodeca pair)
  // returns {name, hz, key}
  switch(solid){
    case "tetra": return { name:"Tetrahedron (Fire)",    hz:741, key:"F#"};
    case "cube":  return { name:"Cube (Earth)",          hz:396, key:"G"};
    case "octa":  return { name:"Octahedron (Air)",      hz:528, key:"C"};
    case "icosa": return { name:"Icosahedron (Water)",   hz:639, key:"E"};
    case "dodec": return { name:"Dodecahedron (Aether)", hz:963, key:"B"};
    default:      return { name:"Crystal", hz:528, key:"C" };
  }
}

function placeNodes(w,h){
  // Seed-of-Life: one center + 6 around; map solids across the ring
  const cx = w*0.5, cy = h*0.52;
  const R = Math.min(w,h)*0.22;
  const nodes = [];
  const ring = [
    "cube","tetra","octa","icosa","dodec","tetra"
  ];
  // center (sun / octa default)
  nodes.push({ x:cx, y:cy, r:18, id:"center", solid:"octa", ...solidMeta("octa") });

  for (let i=0;i<6;i++){
    const a = (Math.PI*2) * (i/6);
    const x = cx + Math.cos(a)*R;
    const y = cy + Math.sin(a)*R;
    const s = ring[i%ring.length];
    nodes.push({ x, y, r:16, id:"n"+i, solid:s, ...solidMeta(s) });
  }
  return nodes;
}

export async function mountCrystalGrid(canvas, opts={}){
  const ctx = canvas.getContext("2d");
  const analyser = opts.analyser || null;
  const nodes = placeNodes(canvas.width, canvas.height);
  const pulses = new Map(); // id -> {t:0..1, color}

  // background parchment + flower arcs
  function drawSeed(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const W=canvas.width, H=canvas.height;
    // parchment wash
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#fffaf0");
    g.addColorStop(1,"#f3efe6");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // seed circles
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#d9cfbf";
    ctx.lineWidth = 1.25;
    const cx=W*0.5, cy=H*0.52, R=Math.min(W,H)*0.22;
    circle(ctx,cx,cy,R*2.0,null,"#e2d8c6"); // large aureole
    for (let i=0;i<6;i++){
      const a = (Math.PI*2)*(i/6);
      const x = cx + Math.cos(a)*R;
      const y = cy + Math.sin(a)*R;
      circle(ctx, x, y, R, null, "#e2d8c6");
    }
    circle(ctx,cx,cy,R,null,"#d7cbb7");
    ctx.restore();

    // nodes
    for (const n of nodes){
      const col = toneColor(n.hz);
      circle(ctx, n.x, n.y, n.r+2, "#ffffff", "#ccbfae");
      circle(ctx, n.x, n.y, n.r, col, "#725e3f");
      // tiny glyph dot
      circle(ctx, n.x, n.y, 2.2, "#ffffff", null);
    }
  }

  function drawPulses(dt){
    // proc analyser energy
    let energy = 0.18;
    if (analyser){
      const size = 128;
      const arr = new Uint8Array(size);
      analyser.getByteTimeDomainData(arr);
      // compute normalized variance
      let mean=0; for (let i=0;i<size;i++) mean+=arr[i]; mean/=size;
      let varSum=0; for (let i=0;i<size;i++){ const d=arr[i]-mean; varSum+=d*d; }
      const v = Math.sqrt(varSum/size)/128; // ~0..1
      energy = 0.12 + Math.min(0.35, v*0.7);
    }

    pulses.forEach((p,id) => {
      p.t += dt * 0.6; // speed
      const n = nodes.find(k => k.id===id);
      if (!n || p.t>1){ pulses.delete(id); return; }
      const r = lerp(n.r+4, n.r+160, p.t);
      const a = (1-p.t) * 0.45;
      ctx.save();
      ctx.globalAlpha = a;
      circle(ctx, n.x, n.y, r, null, p.color);
      ctx.restore();
    });

    // breathing aureole around center by energy
    const c = nodes[0];
    const rr = lerp(60, 120, energy);
    ctx.save();
    ctx.globalAlpha = 0.12 + energy*0.18;
    circle(ctx, c.x, c.y, rr, null, "#caa44a");
    ctx.restore();
  }

  let last = performance.now();
  function frame(t){
    const dt = Math.min(1/30, (t-last)/1000);
    last = t;
    drawSeed();
    drawPulses(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function hitTest(x,y){
    for (let i=nodes.length-1;i>=0;i--){
      const n = nodes[i];
      if (dist(x,y,n.x,n.y) <= n.r+6) return n;
    }
    return null;
  }

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width/rect.width);
    const y = (e.clientY - rect.top) * (canvas.height/rect.height);
    const n = hitTest(x,y);
    if (!n) return;
    // pulse
    pulses.set(n.id, { t:0, color: toneColor(n.hz) });
    // callback to ambient engine
    if (typeof opts.onSelect === "function") opts.onSelect(n);
    // plaque tooltip (title)
    canvas.title = n.name + " -- " + n.hz + " Hz";
  });

  // Harmonize chord: briefly pulse all five solids with staggered ramps
  async function harmonize(){
    const order = ["cube","tetra","octa","icosa","dodec"];
    const chosen = nodes.filter(n => order.includes(n.solid));
    let i = 0;
    const evt = new CustomEvent("crystal:status", { detail: "harmonize" });
    window.dispatchEvent(evt);

    for (const n of chosen){
      setTimeout(() => { pulses.set(n.id, { t:0, color: toneColor(n.hz) }); }, i*120);
      i++;
    }
  }

  window.addEventListener("crystal:harmonize", harmonize);
}