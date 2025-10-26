precision highp float;
uniform vec2  u_res;
uniform float u_time, u_breath, u_hz, u_bpm;
uniform float u_detail, u_glow, u_hue; // 0..1 detail/glow, hue in degrees
uniform int   u_kind; // 0=spiral,1=mandorla,2=kaleid,3=rings,4=cone

// helpers
float n2(vec2 p){ return fract(sin(dot(p, vec2(41.31,289.97))) * 14849.31); }
float fbm(vec2 p){
  float a=0.0, f=1.2, w=0.55;
  for(int i=0;i<5;i++){ a += w * n2(p*f); f*=1.91; w*=0.58; }
  return a;
}
vec3 hsl2rgb(float h, float s, float l){
  float c = (1.0 - abs(2.0*l-1.0)) * s;
  float x = c*(1.0-abs(mod(h/60.0,2.0)-1.0));
  float m = l - 0.5*c;
  vec3 r;
  if      (h<60.)  r=vec3(c,x,0);
  else if (h<120.) r=vec3(x,c,0);
  else if (h<180.) r=vec3(0,c,x);
  else if (h<240.) r=vec3(0,x,c);
  else if (h<300.) r=vec3(x,0,c);
  else             r=vec3(c,0,x);
  return r + m;
}

float mandorla(vec2 uv, float r, float sep){
  vec2 a = uv + vec2(sep,0.0);
  vec2 b = uv - vec2(sep,0.0);
  float ca = smoothstep(r, r-0.02, length(a));
  float cb = smoothstep(r, r-0.02, length(b));
  return min(ca, cb);
}

void main(){
  vec2 uv = (2.0*gl_FragCoord.xy - u_res) / min(u_res.x,u_res.y);
  float t = u_time;

  // Gentle camera drift (no strobe)
  float breathe = u_breath; // 0..1 slow sinus
  float z = mix(1.0, 0.85, breathe);

  // Base field
  float d = length(uv);
  float a = atan(uv.y, uv.x);
  float grain = fbm(uv*1.3 + vec2(0.1*sin(t*0.05), 0.1*cos(t*0.04)));

  // motif selector
  float motif = 0.0;
  if (u_kind==0){        // spiral
    float theta = a + 0.15*t + 0.6*grain;
    motif = smoothstep(0.65, 0.1 + 0.25*u_detail, d + 0.15*sin(6.0*theta));
  } else if (u_kind==1){ // mandorla
    motif = mandorla(uv, 0.8 - 0.05*breathe, 0.22 + 0.05*sin(t*0.07));
  } else if (u_kind==2){ // kaleid
    float k = cos(6.0*a) * exp(-d*2.0);
    motif = smoothstep(0.35, 0.85, k + 0.2*grain);
  } else if (u_kind==3){ // rings
    float rings = 0.5 + 0.5*cos(24.0*d - 2.0*breathe + 0.5*grain);
    motif = rings * smoothstep(1.1, 0.4, d);
  } else {               // cone
    float cone = smoothstep(0.7, 0.15, d + 0.15*uv.y);
    motif = cone;
  }

  // color: hue sweeps gently with breath + BPM
  float hue = mod(u_hue + 15.0*breathe + 0.25*u_bpm, 360.0);
  vec3 base = hsl2rgb(hue, 0.5, 0.55 + 0.15*motif);
  vec3 glow = hsl2rgb(mod(hue+24.0,360.0), 0.6, 0.7);

  // blend + soft vignette
  vec3 col = mix(base, glow, 0.25 + 0.5*u_glow*motif);
  col *= smoothstep(1.25, 0.2, d);

  gl_FragColor = vec4(col, 1.0);
}