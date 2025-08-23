export async function startFractal(canvas, params = {}) {
  const gl = canvas.getContext('webgl', { antialias:true, alpha:false });
  if (!gl) throw new Error('WebGL not available');

  const fragSrc = await fetch('../assets/shaders/fractal.glsl', {cache:'no-store'}).then(r=>r.text());
  const vsSrc = `attribute vec2 a_pos; void main(){ gl_Position=vec4(a_pos,0.,1.);} `;
  function sh(t,s){ const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog); if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw gl.getProgramInfoLog(prog);
  gl.useProgram(prog);

  const a_pos = gl.getAttribLocation(prog,'a_pos');
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(a_pos); gl.vertexAttribPointer(a_pos,2,gl.FLOAT,false,0,0);

  const u = {
    res: gl.getUniformLocation(prog,'u_res'),
    time: gl.getUniformLocation(prog,'u_time'),
    breath: gl.getUniformLocation(prog,'u_breath'),
    hz: gl.getUniformLocation(prog,'u_hz'),
    bpm: gl.getUniformLocation(prog,'u_bpm'),
    detail: gl.getUniformLocation(prog,'u_detail'),
    glow: gl.getUniformLocation(prog,'u_glow'),
    hue: gl.getUniformLocation(prog,'u_hue'),
    kind: gl.getUniformLocation(prog,'u_kind')
  };

  const dpr = Math.min(2, window.devicePixelRatio||1);
  function resize(){
    const w = canvas.clientWidth || 960;
    const h = canvas.clientHeight || 540;
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
  }
  resize(); addEventListener('resize', resize, {passive:true});

  let start = performance.now(), running = true;
  let state = {
    hz: params.hz ?? 528,
    bpm: params.bpm ?? 92,
    detail: params.detail ?? 0.85,
    glow: params.glow ?? 0.8,
    hue: params.hue ?? 38,
    kind: params.kind ?? 0
  };

  function apply(){
    gl.uniform1f(u.hz, state.hz);
    gl.uniform1f(u.bpm, state.bpm);
    gl.uniform1f(u.detail, state.detail);
    gl.uniform1f(u.glow, state.glow);
    gl.uniform1f(u.hue, state.hue);
    gl.uniform1i(u.kind, state.kind|0);
  }
  apply();

  function frame(now){
    if (!running) return;
    const t = (now - start)/1000;
    gl.uniform1f(u.time, t);
    // slow sinus breath locked to BPM (cycle ~ 4 bars)
    const beatSec = 60.0 / Math.max(1, state.bpm);
    const cycle = 8.0 * beatSec; // ~8s at 60bpm
    const breath = 0.5 + 0.5 * Math.sin((t/cycle)*6.28318);
    gl.uniform1f(u.breath, breath);

    gl.drawArrays(gl.TRIANGLES,0,6);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    stop(){ running=false; },
    set(params={}){
      Object.assign(state, params);
      apply();
    }
  };
}