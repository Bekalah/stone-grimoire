/* global THREE, MarbleShader */
(async function(){
  const canvas = document.getElementById('viewport');

  // renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;

  // scene/camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);
  const camera = new THREE.PerspectiveCamera(65, canvas.clientWidth/canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 2.0, 8.0);

  // environment / lights
  const pmrem = new THREE.PMREMGenerator(renderer);
  try {
    const hdr = await new THREE.RGBELoader().loadAsync('/shared/assets/hdri/royal_esplanade_1k.hdr');
    scene.environment = pmrem.fromEquirectangular(hdr).texture;
  } catch { scene.add(new THREE.HemisphereLight(0x223344, 0x000006, 0.9)); }
  const key = new THREE.DirectionalLight(0xffe6b0, 1.6); key.position.set(4,6,3); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
  scene.add(new THREE.SpotLight(0x88bbff, 0.35, 0, Math.PI/4, .4, .8).position.set(-6,5,-4));
  scene.add(new THREE.PointLight(0xff66cc, .25).position.set(0,3.5,-6));

  // floor marble
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(MarbleShader.uniforms),
    vertexShader: MarbleShader.vertexShader, fragmentShader: MarbleShader.fragmentShader
  }));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);

  // pillars phyllotaxis (gold/crystal)
  const goldenAngle = THREE.MathUtils.degToRad(137.507764);
  const group = new THREE.Group(); scene.add(group);
  const gold = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.90,0.78,0.35), metalness:.9, roughness:.25, envMapIntensity:1.0, clearcoat:.4, clearcoatRoughness:.25 });
  const crystal = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.90,0.96,1.0), metalness:0, roughness:0.02, transmission:0.92, thickness:0.7, ior:1.45, envMapIntensity:1.2 });
  const col = new THREE.CylinderGeometry(0.25,0.3,6.0,32), cap = new THREE.SphereGeometry(0.32,32,16);
  for(let i=0;i<144;i++){
    const r=0.35*Math.sqrt(i+4)*2.2, a=i*goldenAngle, x=Math.cos(a)*r, z=Math.sin(a)*r;
    const mat = (i%8===0)? crystal : gold;
    const p = new THREE.Mesh(col, mat); p.position.set(x,3.0,z); p.castShadow = p.receiveShadow = true;
    const s = new THREE.Mesh(cap, mat); s.position.set(x,6.0,z); s.castShadow = true;
    group.add(p,s);
  }

  // portals from house.json
  const portals = [];
  const labels = [];
  const torus = new THREE.TorusGeometry(0.9, 0.06, 16, 64);
  const portalMat = new THREE.MeshPhysicalMaterial({ color: 0xbfa35e, metalness: .85, roughness: .18, emissive: 0x221100, emissiveIntensity: .35 });
  try {
    const house = await (await fetch('/shared/data/house.json')).json();
    (house.rooms||[]).slice(0, 32).forEach((room, idx)=>{
      const a = idx * goldenAngle, r = 8 + 0.6*idx;
      const m = new THREE.Mesh(torus, portalMat);
      m.position.set(Math.cos(a)*r, 2.2, Math.sin(a)*r); m.rotation.y = -a; m.castShadow = true;
      m.userData.room = room; scene.add(m); portals.push(m);

      // label
      const div = document.createElement('div'); div.className = 'lbl'; div.textContent = `${room.id} - ${room.title}`;
      div.style.opacity = 0; document.body.appendChild(div); labels.push(div); m.userData.label = div;
    });
  } catch(e){ console.warn('house.json missing or unreadable', e); }

  // controls
  const controls = new THREE.PointerLockControls(camera, document.body);
  const keys = {}; let vel = new THREE.Vector3(), dir = new THREE.Vector3();
  document.addEventListener('keydown', e => keys[e.code]=true);
  document.addEventListener('keyup',   e => keys[e.code]=false);
  document.getElementById('enter').onclick = e => { e.preventDefault(); controls.lock(); };

  // post FX
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.9, 0.8, 0.85);
  composer.addPass(bloom);
  const film = new THREE.FilmPass(0.25, 0.5, 648, false);
  composer.addPass(film);
  let fxEnabled = true;
  document.getElementById('toggleFX').onclick = e => { e.preventDefault(); fxEnabled = !fxEnabled; };

  // audio nodes (positional Solfeggio)
  const listener = new THREE.AudioListener(); camera.add(listener);
  function makeTone(freq, pos){
    const a = new THREE.PositionalAudio(listener);
    const ctx = listener.context, osc = ctx.createOscillator(), g = ctx.createGain();
    g.gain.value = 0.03; osc.frequency.value = freq; osc.connect(g).connect(a.getOutput()); osc.start();
    a.setRefDistance(4); a.setRolloffFactor(2.0);
    const src = new THREE.Object3D(); src.position.copy(pos); src.add(a); scene.add(src);
    return { osc, g };
  }
  const toneG = makeTone(396, new THREE.Vector3( 6,2,-3));
  const toneH = makeTone(528, new THREE.Vector3(-4,2, 7));
  const toneJ = makeTone(963, new THREE.Vector3( 0,2, 0));
  window.addEventListener('keydown', (e)=>{
    if(e.key==='g') toneG.g.gain.value = 0.05;
    if(e.key==='h') toneH.g.gain.value = 0.05;
    if(e.key==='j') toneJ.g.gain.value = 0.05;
    if(e.code==='Space'){ [toneG,toneH,toneJ].forEach(t=> t.g.gain.value=0.0); }
  });

  // picking / interaction
  const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
  let hover = null;
  function pick(){
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(portals, false);
    return hits.length ? hits[0].object : null;
  }
  window.addEventListener('mousemove', (e)=>{
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    hover = pick();
    document.body.style.cursor = hover ? 'pointer' : 'default';
  });
  window.addEventListener('keydown', (e)=>{ if(e.key==='f') focusNearest(); if(e.key==='e' && hover) interact(hover); });
  function focusNearest(){
    let best=null, bd=Infinity;
    for(const p of portals){ const d = camera.position.distanceTo(p.position); if(d<bd){bd=d; best=p;} }
    if(best){ camera.position.lerp(best.position.clone().add(new THREE.Vector3(0,1.2,2.2).applyAxisAngle(new THREE.Vector3(0,1,0), best.rotation.y)), 0.7); }
  }

  // overlay IPC: open fractal / sources / tarot / circuitum with room data
  function interact(portal){
    const room = portal.userData.room || {};
    // Primary options overlay
    const html = `
      <h3>${room.title || 'Portal'}</h3>
      <p>${room.description || ''}</p>
      <p>
        <button onclick="showSourcePack('${room.node||'C144N-000'}')">Sources</button>
        <button onclick="openFractal(${JSON.stringify({ id:room.node||'C144N-000', label: room.title||'Node', path: room.path||'', numerology:0 }).replace(/"/g,'&quot;')})">Fractal</button>
        <button onclick="document.getElementById('openOverlay').click()">Circuitum/Tarot</button>
      </p>`;
    window.openModal(html);
  }

  // labels follow portals
  function updateLabels(){
    portals.forEach(p=>{
      const v = p.position.clone().project(camera);
      const on = (v.z>-1 && v.z<1);
      const x = (v.x*0.5+0.5)*window.innerWidth, y = (-v.y*0.5+0.5)*window.innerHeight - 18;
      const el = p.userData.label; if(!el) return;
      el.style.opacity = on ? 0.9 : 0;
      if(on) el.style.transform = `translate(${x}px,${y}px)`;
    });
  }

  // resize
  function onResize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false); composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize); onResize();

  // movement
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);

    // gentle breathing
    group.children.forEach((m, i)=>{ if(m.isMesh && m.geometry.type==='CylinderGeometry'){ const wobble=Math.sin(clock.elapsedTime*0.6+i*0.15)*0.02; m.scale.x=1+wobble; m.scale.z=1-wobble; }});

    // move
    const speed = (keys['ShiftLeft']||keys['ShiftRight']) ? 7.5 : 3.5;
    dir.set(0,0,0);
    if(keys['KeyW']||keys['ArrowUp']) dir.z -= 1;
    if(keys['KeyS']||keys['ArrowDown']) dir.z += 1;
    if(keys['KeyA']||keys['ArrowLeft']) dir.x -= 1;
    if(keys['KeyD']||keys['ArrowRight']) dir.x += 1;
    if(controls.isLocked){
      const fwd = new THREE.Vector3(); controls.getDirection(fwd); fwd.y=0; fwd.normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), fwd).negate();
      vel.addScaledVector(fwd, dir.z*speed*dt);
      vel.addScaledVector(right, dir.x*speed*dt);
      camera.position.addScaledVector(vel, dt);
      vel.multiplyScalar(0.86);
    } else { vel.set(0,0,0); }

    // time -> marble veining
    floor.material.uniforms.time.value = clock.elapsedTime;

    updateLabels();

    (fxEnabled? composer : renderer).render(scene, camera);
  }
  animate();

  // lock
  document.getElementById('enter').addEventListener('click', e => { e.preventDefault(); controls.lock(); });

  // mini map (textual for now)
  try {
    const nodes = await (await fetch('/shared/data/nodes.json')).json();
    const el = document.getElementById('map');
    el.innerHTML = `<strong>Rooms loaded:</strong> ${(portals||[]).length} / Nodes sample: ${nodes.items?.length||0}`;
  } catch{}
})();
