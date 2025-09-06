/* Cathedral of Circuits -- Stone Grimoire Helper ✦
   Non-breaking add-on: adapters, ND-safe audio, contrast check, rubric, plaque badges.
   All features OFF by default; flip CathedralHelper.flags.* to enable per room or globally.
*/
export const CathedralHelper = (() => {
  // ---------- Feature Flags (global defaults) ----------
  const flags = {
    audio: false,        // ND-safe tone engine (user gesture required)
    badges: false,       // curator badges (Cosmology✓, Rites✓, etc.)
    contrast: false,     // WCAG contrast audit for stylepacks
    rubric: false        // museum rubric scoring summary
  };

  // ---------- Runtime cache ----------
  let audioCtx = null, irBuffer = null, currentNodes = [];

  // ---------- Utilities ----------
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const toRGBA = (hex, a=1) => {
    if (!hex || !/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(hex)) return {r:255,g:255,b:255,a};
    const h = hex.length===4
      ? '#'+[1,2,3].map(i => hex[i]+hex[i]).join('')
      : hex;
    return {
      r: parseInt(h.slice(1,3),16),
      g: parseInt(h.slice(3,5),16),
      b: parseInt(h.slice(5,7),16),
      a
    };
  };

  // ---------- Adapters (old↔new keys) ----------
  // Accepts either your "old" keys (route, element, toneHz, stylepack) or newer fields.
  function adaptRoom(room) {
    return {
      id: room.id,
      title: room.title || room.name,
      route: room.route || room.path,
      element: room.element || room.order || 'Aether',
      toneHz: Number(room.toneHz ?? room.tone?.hz ?? 528),
      stylepack: room.stylepack || room.theme || null,
      plaque: room.plaque || room.metaPlaque || null,
      provenance: room._provenance || room.provenance || null,
      notes: room.notes || ''
    };
  }

  // ---------- Contrast audit (WCAG 2.1 AA) ----------
  // Pass a stylepack or { fg:'#xxxxxx', bg:'#yyyyyy' }.
  function checkStylepackContrast(sp) {
    // Try to resolve common CSS var names from your packs
    const fg = sp.fg || sp.text || sp['--text'] || '#0f1012';
    const bg = sp.bg || sp.surface || sp['--stone'] || '#f4efe6';
    const c = contrastRatio(fg, bg);
    return { ratio: +c.toFixed(2), passAA: c >= 4.5, passAAA: c >= 7 };
  }
  function luminance(hex){
    const {r,g,b}=toRGBA(hex);
    const s=[r,g,b].map(v=>{
      const s=v/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055,2.4);
    });
    return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];
  }
  function contrastRatio(a,b){
    const L1=luminance(a), L2=luminance(b);
    const light=Math.max(L1,L2), dark=Math.min(L1,L2);
    return (light+0.05)/(dark+0.05);
  }

  // ---------- ND-safe audio (convolver + compressor + gain cap) ----------
  async function getCtx(){
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state !== 'running') await audioCtx.resume();
    return audioCtx;
  }
  async function loadIR(path){
    if (irBuffer) return irBuffer;
    const ctx = await getCtx();
    const buf = await (await fetch(path)).arrayBuffer();
    irBuffer = await ctx.decodeAudioData(buf);
    return irBuffer;
  }
  async function startTone({ hz=528, gain=0.26, impulseResponse='assets/ir/cathedral.wav' } = {}){
    if (!flags.audio) return { started:false };
    const root = document.documentElement;
    if (root.classList.contains('muted')) return { started:false };
    const ctx = await getCtx();

    const osc = ctx.createOscillator();
    osc.type='sine'; osc.frequency.value = hz;

    const convolver = ctx.createConvolver();
    try { convolver.buffer = await loadIR(impulseResponse); } catch {}

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value=-24; comp.knee.value=24; comp.ratio.value=12; comp.attack.value=0.003; comp.release.value=0.25;

    const g = ctx.createGain();
    const master = parseFloat(getComputedStyle(root).getPropertyValue('--master-gain')||'1');
    g.gain.value = clamp(gain, 0, 0.35) * master;

    osc.connect(convolver); convolver.connect(comp); comp.connect(g); g.connect(ctx.destination);
    osc.start();

    // auto-stop (shorter in Calm)
    const dur = root.classList.contains('calm') ? 2.5 : 4.0;
    const stop = ()=>{ try{ osc.stop() }catch{} };
    const t = setTimeout(stop, dur*1000);
    currentNodes.push({ osc, t });
    return { started:true, stop };
  }
  function stopTone(){
    while (currentNodes.length) {
      const n = currentNodes.pop();
      try { clearTimeout(n.t); n.osc.stop(); } catch {}
    }
  }

  // ---------- Museum rubric & badges ----------
  // Minimal rubric: did we declare cosmology, rites, diagrams, poetry, artifact/provenance?
  function scoreRubric({ plaqueData={}, room={} }={}){
    const fields = {
      cosmology: !!(room.element || plaqueData.intention),
      rites: !!plaqueData.technique,
      diagrams: !!plaqueData.glyph || /geometry|grid/i.test(room.geometry||''),
      poetry: !!plaqueData.reflection,
      artifact: !!room.provenance || !!plaqueData.provenance
    };
    const score = Object.values(fields).filter(Boolean).length;
    return { score, fields };
  }
  function plaqueBadgesHTML(room, plaqueData={}){
    if (!flags.badges) return '';
    const { fields } = scoreRubric({ plaqueData, room });
    const mk = (label, ok)=>`<span class="badge ${ok?'ok':'dim'}">${label}${ok?' ✓':' ·'}</span>`;
    return `<div class="badges" aria-label="Museum rubric badges">
      ${mk('Cosmology', fields.cosmology)}
      ${mk('Rites', fields.rites)}
      ${mk('Diagrams', fields.diagrams)}
      ${mk('Poetry', fields.poetry)}
      ${mk('Artifact', fields.artifact)}
    </div>`;
  }

  // ---------- Public API ----------
  return {
    flags, adaptRoom, checkStylepackContrast, startTone, stopTone, scoreRubric, plaqueBadgesHTML
  };
})();