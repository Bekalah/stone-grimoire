// assets/js/engines/shader-engine.js
export async function mountFractalShader(canvas, opts = {}) {
  const gl = canvas.getContext('webgl');
  if (!gl) { console.warn('WebGL not available'); return null; }
  const vsSrc = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.0,1.0); }`;
  const fsSrc = await fetch('/assets/shaders/fractal.glsl').then(r=>r.text());

  const compile = (src, type) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const vs = compile(vsSrc, gl.VERTEX_SHADER);
  const fs = compile(fsSrc, gl.FRAGMENT_SHADER);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,  1,-1, -1,1,  -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uni = (n,t)=>gl.getUniformLocation(prog,n);
  const u_res = uni('u_res'), u_time=uni('u_time'), u_breath=uni('u_breath');
  const u_hz=uni('u_hz'), u_bpm=uni('u_bpm'), u_detail=uni('u_detail'), u_glow=uni('u_glow');
  const u_hue=uni('u_hue'), u_kind=uni('u_kind');

  let t0 = performance.now();
  function frame() {
    const t = (performance.now()-t0)/1000;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width!==w || canvas.height!==h) {
      canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h);
    }
    gl.useProgram(prog);
    gl.uniform2f(u_res, w, h);
    gl.uniform1f(u_time, t);
    gl.uniform1f(u_breath, 0.5+0.5*Math.sin(t*0.4));
    gl.uniform1f(u_hz, opts.hz || 528);
    gl.uniform1f(u_bpm, opts.bpm || 60);
    gl.uniform1f(u_detail, opts.detail ?? 0.6);
    gl.uniform1f(u_glow, opts.glow ?? 0.7);
    gl.uniform1f(u_hue, opts.hue ?? 210); // lapis default
    gl.uniform1i(u_kind, opts.kind ?? 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!document.documentElement.classList.contains('reduced-motion')) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return (params={})=>Object.assign(opts, params);
}