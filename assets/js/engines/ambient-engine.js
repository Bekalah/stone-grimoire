// Ambient Engine (audio core + pub/sub) -- ASCII-only, iPad-safe
// Exposes: start(), stop(), setToneHz(hz), onToneChange(fn), getAnalyser()

const listeners = new Set();
let AC=null, osc=null, gain=null, analyser=null, convolver=null, limiter=null;
let currentHz = 528;

export function onToneChange(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
function notify(){ for(const fn of listeners) try{ fn(currentHz); }catch(e){} }

async function loadIR(ac){
  try{
    const candidates = [
      "assets/audio/ir/cathedral_small.wav",
      "assets/audio/ir/cathedral.wav"
    ];
    for(const u of candidates){
      const res = await fetch(u, {cache:"force-cache"});
      if(!res.ok) continue;
      const buf = await res.arrayBuffer();
      const audioBuf = await ac.decodeAudioData(buf);
      return audioBuf;
    }
  }catch(_){}
  return null;
}

export async function start(){
  if(AC) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();

  osc  = AC.createOscillator();
  gain = AC.createGain();
  const low  = AC.createBiquadFilter(); low.type="lowshelf"; low.frequency.value=80;  low.gain.value=-3;
  const peak = AC.createBiquadFilter(); peak.type="peaking"; peak.frequency.value=2500; peak.Q.value=.9; peak.gain.value=-4;
  const comp = AC.createDynamicsCompressor(); comp.threshold.value=-28; comp.knee.value=24; comp.ratio.value=2.2; comp.attack.value=.015; comp.release.value=.25;
  convolver  = AC.createConvolver();
  limiter    = AC.createDynamicsCompressor(); limiter.threshold.value=-4; limiter.knee.value=0; limiter.ratio.value=20; limiter.attack.value=.003; limiter.release.value=.15;
  analyser   = AC.createAnalyser(); analyser.fftSize = 1024;

  osc.type="sine"; osc.frequency.value = currentHz;
  gain.gain.value = 0.0001;

  // chain
  osc.connect(gain);
  gain.connect(low); low.connect(peak); peak.connect(comp);
  comp.connect(convolver); convolver.connect(limiter);
  limiter.connect(analyser); analyser.connect(AC.destination);

  // optional IR
  const ir = await loadIR(AC);
  if(ir) convolver.buffer = ir;

  osc.start();
  fadeTo(0.08, 600);
}

export function stop(){
  if(!AC) return;
  fadeTo(0.0001, 600);
}

export function setToneHz(hz){
  if(!AC){ currentHz = hz; notify(); return; }
  const t = AC.currentTime + 0.12;
  osc.frequency.linearRampToValueAtTime(hz, t);
  currentHz = hz; notify();
}

export function getAnalyser(){ return analyser; }
function fadeTo(v, ms){
  const now = AC.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(v, now + ms/1000);
}