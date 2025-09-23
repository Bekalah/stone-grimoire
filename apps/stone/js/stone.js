/* global THREE, MarbleShader */
(async function(){
  // ---------- basics ----------
  const canvas = document.getElementById('viewport');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);

  const camera = new THREE.PerspectiveCamera(65, canvas.clientWidth/canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 2.0, 8.0);

  // ---------- sky / env ----------
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envMap = null;
  try {
    const hdrURL = '/shared/assets/hdri/royal_esplanade_1k.hdr'; // drop any HDRI here
    const rgbe = new THREE.RGBELoader();
    const hdrTex = await new Promise((res, rej)=> rgbe.load(hdrURL, res, undefined, rej));
    envMap = pmrem.fromEquirectangular(hdrTex).texture;
    scene.environment = envMap;
  } catch {
    // gradient sky fallback
    const sky = new THREE.HemisphereLight(0x223344, 0x000006, 0.9);
    scene.add(sky);
  }

  // ---------- lights ----------
  const key = new THREE.DirectionalLight(0xffe6b0, 1.6);
  key.position.set(4, 6, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048,2048);
  scene.add(key);

  const fill = new THREE.SpotLight(0x88bbff, 0.35, 0, Math.PI/4, 0.4, 0.8);
  fill.position.set(-6, 5, -4);
  fill.castShadow = true;
  scene.add(fill);

  const rim = new THREE.PointLight(0xff66cc, 0.25, 0);
  rim.position.set(0, 3.5, -6);
  scene.add(rim);

  // ---------- floor marble ----------
  const floorGeo = new THREE.PlaneGeometry(60, 60, 1, 1);
  const floorMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(MarbleShader.uniforms),
    vertexShader: MarbleShader.vertexShader,
    fragmentShader: MarbleShader.fragmentShader
  });
  floorMat.uniforms.scale.value = 1.6;
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ---------- nave: phyllotaxis columns (gold + crystal) ----------
  const goldenAngle = THREE.MathUtils.degToRad(137.507764);
  const group = new THREE.Group();
  scene.add(group);

  const gold = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.90,0.78,0.35),
    metalness: 0.9, roughness: 0.25, envMapIntensity: 1.0,
    clearcoat: 0.4, clearcoatRoughness: 0.25
  });

  const crystal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.85,0.92,1.0),
    metalness: 0.0, roughness: 0.02, transmission: 0.9, thickness: 0.6,
    ior: 1.45, envMapIntensity: 1.2
  });

  const colGeo = new THREE.CylinderGeometry(0.25, 0.3, 6.0, 32, 1, false);
  const capGeo = new THREE.SphereGeometry(0.32, 32, 16);
  const pillarCount = 144;

  for(let i=0;i<pillarCount;i++){
    const r = 0.35 * Math.sqrt(i+4) * 2.2;
    const a = i * goldenAngle;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const y = 3.0;

    const mat = (i%8===0) ? crystal : gold;
    const p = new THREE.Mesh(colGeo, mat);
    p.position.set(x, 3.0, z);
    p.castShadow = true; p.receiveShadow = true;

    const cap = new THREE.Mesh(capGeo, mat);
    cap.position.set(x, 6.0, z);
    cap.castShadow = true;

    group.add(p, cap);

    // subtle breathing
    p.userData.baseY = y;
  }

  // ---------- portals from your /shared/data/house.json ----------
  let portals = [];
  try {
    const house = await (await fetch('/shared/data/house.json')).json();
    const rooms = (house.rooms||[]).slice(0, 16);
    const portalGeo = new THREE.TorusGeometry(0.9, 0.06, 16, 64);
    const portalMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfa35e, metalness: 0.8, roughness: 0.15, emissive: 0x221100, emissiveIntensity: 0.35
    });
    rooms.forEach((room, idx)=>{
      const a = idx * goldenAngle;
      const r = 8 + 0.6*idx;
      const mesh = new THREE.Mesh(portalGeo, portalMat);
      mesh.position.set(Math.cos(a)*r, 2.2, Math.sin(a)*r);
      mesh.rotation.y = -a;
      mesh.castShadow = true;
      mesh.userData.room = room;
      scene.add(mesh);
      portals.push(mesh);

      // label
      const div = document.createElement('div');
      div.className = 'lbl';
      div.textContent = `${room.id} — ${room.title}`;
      Object.assign(div.style, {position:'absolute', color:'#e0c469', font:'12px system-ui', pointerEvents:'none'});
      document.body.appendChild(div);
      mesh.userData.label = div;
    });
  } catch(e){ console.warn('No house.json or labels suppressed:', e); }

  // ---------- camera controls ----------
  const controls = new THREE.PointerLockControls(camera, document.body);
  let vel = new THREE.Vector3();
  let dir = new THREE.Vector3();
  const keys = {};
  document.addEventListener('keydown', (e)=>{ keys[e.code]=true; });
  document.addEventListener('keyup', (e)=>{ keys[e.code]=false; });

  document.getElementById('enter').addEventListener('click', (e)=>{
    e.preventDefault(); controls.lock();
  });
  controls.addEventListener('lock', ()=>{});
  controls.addEventListener('unlock', ()=>{});

  // ---------- post FX ----------
  const composer = new THREE.EffectComposer(renderer);
  const rp = new THREE.RenderPass(scene, camera);
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.9, 0.8, 0.85);
  const film = new THREE.FilmPass(0.25, 0.5, 648, false);
  composer.addPass(rp); composer.addPass(bloom); composer.addPass(film);

  let fxEnabled = true;
  document.getElementById('toggleFX').addEventListener('click', (e)=>{ e.preventDefault(); fxEnabled = !fxEnabled; });

  // ---------- audio (positional Solfeggio) ----------
  const listener = new THREE.AudioListener();
  camera.add(listener);

  function makeTone(freq, pos){
    const audio = new THREE.PositionalAudio(listener);
    // WebAudio Oscillator
    const ctx = listener.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.03; // ND-safe
    osc.frequency.value = freq;
    osc.connect(gain).connect(audio.getOutput());
    osc.start();

    audio.setRefDistance(4);
    audio.setDistanceModel('inverse');
    audio.setRolloffFactor(2.0);

    const src = new THREE.Object3D();
    src.position.copy(pos);
    src.add(audio);
    scene.add(src);
    return { osc, audio, src, gain };
  }

  const tones = [
    makeTone(396, new THREE.Vector3( 6,2,-3)),
    makeTone(528, new THREE.Vector3(-4,2, 7)),
    makeTone(963, new THREE.Vector3( 0,2, 0))
  ];

  window.addEventListener('keydown', (e)=>{
    if(e.key==='g') tones[0].gain.gain.value = 0.05;
    if(e.key==='h') tones[1].gain.gain.value = 0.05;
    if(e.key==='j') tones[2].gain.gain.value = 0.05;
    if(e.code==='Space'){ tones.forEach(t=> t.gain.gain.value=0.0); }
    if(e.key==='f'){ focusNearestPortal(); }
  });

  function focusNearestPortal(){
    let best=null, bd=1e9;
    portals.forEach(p=>{
      const d = camera.position.distanceTo(p.position);
      if(d<bd){ bd=d; best=p; }
    });
    if(best){ camera.position.lerp(best.position.clone().add(new THREE.Vector3(0,1.2,2.2).applyAxisAngle(new THREE.Vector3(0,1,0), best.rotation.y)), 0.7); }
  }

  // ---------- resize ----------
  function onResize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // ---------- animate ----------
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.033);

    // gentle column breathing
    group.children.forEach((m, idx)=>{
      if(!(m instanceof THREE.Mesh)) return;
      if (m.geometry.type!=='CylinderGeometry') return;
      const wobble = Math.sin(clock.elapsedTime*0.6 + idx*0.15)*0.02;
      m.scale.x = 1.0 + wobble; m.scale.z = 1.0 - wobble;
    });

    // labels
    portals.forEach(p=>{
      if(!p.userData.label) return;
      const v = p.position.clone().project(camera);
      const x = (v.x*0.5+0.5) * window.innerWidth;
      const y = (-v.y*0.5+0.5) * window.innerHeight - 18;
      p.userData.label.style.transform = `translate(${x}px, ${y}px)`;
      p.userData.label.style.opacity = (v.z>1 || v.z<-1) ? 0 : 0.9;
    });

    // movement
    dir.set(0,0,0);
    const spd = (keys['ShiftLeft']||keys['ShiftRight']) ? 7.5 : 3.5;
    if(keys['KeyW']||keys['ArrowUp']) dir.z -= 1;
    if(keys['KeyS']||keys['ArrowDown']) dir.z += 1;
    if(keys['KeyA']||keys['ArrowLeft']) dir.x -= 1;
    if(keys['KeyD']||keys['ArrowRight']) dir.x += 1;
    dir.normalize();
    if(controls.isLocked){
      const forward = new THREE.Vector3();
      controls.getDirection(forward);
      forward.y = 0; forward.normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).negate();
      vel.addScaledVector(forward, dir.z * spd * dt);
      vel.addScaledVector(right, dir.x * spd * dt);
      camera.position.addScaledVector(vel, dt);
      vel.multiplyScalar(0.86);
    } else {
      vel.set(0,0,0);
    }

    // update shader time
    floor.material.uniforms.time.value = clock.elapsedTime;

    if(fxEnabled) composer.render(); else renderer.render(scene, camera);
  }
  animate();
})();
