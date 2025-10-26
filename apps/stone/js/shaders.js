// Simple marble-esque FBM for PhysicalMaterial normal map feel (no textures needed)
window.MarbleShader = {
  uniforms: {
    time: { value: 0 },
    scale: { value: 2.0 },
    tint: { value: new THREE.Color(0.93,0.92,0.9) }
  },
  vertexShader: `
    varying vec3 vPos; varying vec3 vN;
    void main() {
      vPos = position; vN = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPos; varying vec3 vN;
    uniform float time; uniform float scale; uniform vec3 tint;

    // cheap noise
    float hash(vec3 p){ p=fract(p*0.3183099+vec3(0.1,0.2,0.3)); p*=17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p);
      float n=mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                       mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x), f.y),
                   mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                       mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x), f.y), f.z);
      return n;
    }
    float fbm(vec3 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

    void main(){
      float m = fbm(vPos*0.03*scale + vec3(0.,time*0.1,0.));
      float veins = smoothstep(0.45, 0.55, m) * 0.6;
      vec3 col = tint * (0.8 + 0.2*m) + vec3(0.15,0.13,0.12)*veins;
      gl_FragColor = vec4(col, 1.0);
    }
  `
};
