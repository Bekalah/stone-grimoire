// Cymatic Bloom (ND-safe). Draws if <canvas id="cymatic"> exists on the page.

(function(){
  function start() {
    const cvs = document.getElementById("cymatic");
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    function resize(){
      const w = cvs.clientWidth || 640;
      const h = cvs.clientHeight || 360;
      cvs.width = w * DPR; cvs.height = h * DPR;
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    resize(); addEventListener("resize", resize);

    const analyser = (window.Ambient && window.Ambient.analyser) ? window.Ambient.analyser() : null;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    let t = 0;
    function frame(){
      t += 0.006;
      const w = cvs.width / DPR, h = cvs.height / DPR;
      ctx.clearRect(0,0,w,h);
      // background wash
      ctx.fillStyle = getStyle("--wash","#fff8e7");
      ctx.fillRect(0,0,w,h);

      const cx = w*0.5, cy = h*0.5;
      let amp = 0.2;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        // low-mid energy average
        let sum=0, n=0;
        for (let i=2;i<40 && i<data.length;i++){ sum += data[i]; n++; }
        const avg = n? sum/n : 0;
        amp = 0.15 + (avg/255)*0.35;
      }

      // radial petals
      const petals = 24;
      for(let i=0;i<petals;i++){
        const a = (i/petals)*Math.PI*2 + t*0.7;
        const r1 = Math.min(w,h)*0.12 * (1+amp*0.6);
        const r2 = r1*(1.8+0.6*Math.sin(t+i*0.3));
        const x1 = cx + Math.cos(a)*r1, y1 = cy + Math.sin(a)*r1;
        const x2 = cx + Math.cos(a)*r2, y2 = cy + Math.sin(a)*r2;
        ctx.strokeStyle = getStyle("--accent","rgba(47,90,158,0.35)");
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }

      // soft aureole
      ctx.strokeStyle = getStyle("--accent-2","rgba(212,175,55,0.4)");
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const R = Math.min(w,h)*0.32*(1+0.1*Math.sin(t));
      ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();

      requestAnimationFrame(frame);
    }
    function getStyle(v, def){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || def; }
    frame();
  }
  document.addEventListener("DOMContentLoaded", start);
})();
