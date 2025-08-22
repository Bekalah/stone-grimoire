// Alchemy Fusion Engine — fuses two angels via 7 classical operations.
// - smooth color & tone interpolation
// - stylepack handoff at mid-blend
// - ND-friendly (no strobe, slow ramps, audio only after gesture)

function rel(path){ const d = location.pathname.split('/').length - 2; return ('../'.repeat(Math.max(0,d))) + path; }
async function j(p){ return (await fetch(rel(p))).json(); }

const EASE = {
  linear: t=>t,
  sine: t=>0.5 - Math.cos(Math.PI*t)/2,
  easeInOut: t=>t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2,
  expoOut: t=>t===1?1:1-Math.pow(2,-10*t),
  expoIn: t=>t===0?0:Math.pow(2,10*t-10),
  bounce: t=>{const n1=7.5625,d1=2.75; if(t<1/d1){return n1*t*t;}
    else if(t<2/d1){return n1*(t-=1.5/d1)*t+.75;}
    else if(t<2.5/d1){return n1*(t-=2.25/d1)*t+.9375;}
    return n1*(t-=2.625/d1)*t+.984375;}
};

function hexLerp(a,b,t){
  const A=a.replace('#',''), B=b.replace('#','');
  const ar=parseInt(A.substr(0,2),16), ag=parseInt(A.substr(2,2),16), ab=parseInt(A.substr(4,2),16);
  const br=parseInt(B.substr(0,2),16), bg=parseInt(B.substr(2,2),16), bb=parseInt(B.substr(4,2),16);
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('');
}

async function toneLib(){
  const Tone = (await import('https://esm.sh/tone@14.8.39')).default;
  await Tone.start();
  const reverb = new Tone.Reverb({ decay:6, wet:0.32 }).toDestination();
  const low = new Tone.Filter({ type:'lowpass', frequency: 1600 }).connect(reverb);
  const osc = new Tone.Oscillator(528, 'sine').connect(low).start();
  return { Tone, osc, low, reverb };
}

export async function AlchemyFusion(){
  const [alchemy, angels, packs] = await Promise.all([
    j('assets/data/alchemy.json'),
    j('assets/data/angels72.json'),
    j('assets/data/stylepacks.json')
  ]);

  const getAngel = q => angels.find(a => a.id===q || a.n===q || a.name===q);
  const getElem = id => alchemy.elements.find(e=>e.id===id);
  const getOp = id => alchemy.operations.find(o=>o.id===id) || alchemy.operations.find(o=>o.id==='conjunction');
  const getPack = id => packs.find(p=>p.id===id) || packs[0];

  let audio = null;

  function setOverlayTint(color){ document.documentElement.style.setProperty('--alch-color', color); }

  async function ensurePad(freq){
    if (!audio){
      try { audio = await toneLib(); } catch { return; }
    }
    // glide frequency
    audio.Tone.getTransport().cancel();
    const now = audio.Tone.now();
    audio.osc.frequency.linearRampTo(freq, 3, now);
  }

  async function applyPack(target, packId){
    if (window.applyStylePack) return window.applyStylePack(target, packId);
    const { applyStylePack } = await import(rel('assets/js/components/style-engine.js'));
    return applyStylePack(target, packId);
  }

  function animateBlend({fromColor, toColor, dur=6000, ease='easeInOut', mid, onTick, onHalf, onEnd}){
    const E = EASE[ease] || EASE.easeInOut;
    const t0 = performance.now();
    function loop(t){
      const k = Math.min(1, (t - t0)/dur);
      const e = E(k);
      const c = hexLerp(fromColor, toColor, e);
      setOverlayTint(c);
      onTick && onTick(e, c);
      if (mid && k >= 0.5 && !loop._half){ loop._half = true; onHalf && onHalf(); }
      if (k < 1) requestAnimationFrame(loop);
      else { onEnd && onEnd(); }
    }
    requestAnimationFrame(loop);
  }

  return {
    fuse({ aId, bId, operation='conjunction', duration=6000, target=document.getElementById('pillar'), onProgress, onPackChange, onToneChange }={}){
      const A = getAngel(aId), B = getAngel(bId);
      if (!A || !B) return;
      const op = getOp(operation);
      const eFrom = getElem(op.from) || getElem(A.element);
      const eTo = getElem(op.to) || getElem(B.element);
      const colorFrom = eFrom?.color || '#999999';
      const colorTo = eTo?.color || '#ffffff';
      const packFrom = A.stylepack;
      const packTo = eTo?.stylepack || B.stylepack || A.stylepack;
      const toneFrom = A.toneHz || eFrom?.solfeggio || 528;
      const toneTo = eTo?.solfeggio || B.toneHz || 528;

      // start on packFrom; mid-handoff to packTo
      applyPack(target, packFrom).then(p=>onPackChange && onPackChange(p, 'from'));
      ensurePad(toneFrom).then(()=> onToneChange && onToneChange(toneFrom, 'from'));

      animateBlend({
        fromColor: colorFrom,
        toColor: colorTo,
        dur: duration,
        ease: op.curve || 'easeInOut',
        mid: true,
        onTick: (e, c)=> onProgress && onProgress(e, c),
        onHalf: ()=>{
          applyPack(target, packTo).then(p=>onPackChange && onPackChange(p, 'to'));
          ensurePad(toneTo).then(()=> onToneChange && onToneChange(toneTo, 'to'));
        },
        onEnd: ()=>{/* graceful end */}
      });
    }
  };
}
