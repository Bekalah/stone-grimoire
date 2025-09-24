// Simple procedural marble for floor (PBR-like look without image textures)
window.MarbleShader = {
  uniforms: {
    time: { value: 0 }, scale: { value: 2.0 },
    tint: { value: new THREE.Color(0.92,0.91,0.90) }
  },
  vertexShader: `
    varying vec3 vPos;
    void main(){ vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }
  `,
  fragmentShader: `
    varying vec3 vPos; uniform float time; uniform float scale; uniform vec3 tint;
    float hash(vec3 p){ p=fract(p*0.3183+vec3(.1,.2,.3)); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float noise(vec3 p){ vec3 i=floor(p), f=fract(p);
      float n=mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                       mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                       mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
      return n;
    }
    float fbm(vec3 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.; a*=.5; } return v; }
    void main(){
      float m = fbm(vPos*0.035*scale + vec3(0.,time*0.15,0.));
      float veins = smoothstep(.47,.53,m)*.55;
      vec3 col = tint*(.82+.22*m) + vec3(.14,.12,.11)*veins;
      gl_FragColor = vec4(col, 1.0);
    }
  `
};
