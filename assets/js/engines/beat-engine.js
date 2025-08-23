// Minimal groove engine: kick/hat pulses + tonal plucks derived from toneHz.
// Uses WebAudio only; syncs to BPM; ND-safe envelopes.

let AC, master, limiter;
let tickInt = null;
let bpm = 92;
let running = false;

function ctx(){
  if (AC) return AC;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  AC = new Ctx();
  limiter = AC.createDynamicsCompressor();
  limiter.threshold.value = -8; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.002; limiter.release.value = 0.12;
  master = AC.createGain(); master.gain.value = 0.22;
  limiter.connect(master); master.connect(AC.destination);
  return AC;
}

function envGain(time, dur, peak=0.6){
  const ac = ctx();
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  return g;
}

function kick(time){
  const ac = ctx();
  const o = ac.createOscillator();
  const g = envGain(time, 0.18, 0.7);
  o.type='sine';
  o.frequency.setValueAtTime(120, time);
  o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
  o.connect(g); g.connect(limiter);
  o.start(time); o.stop(time+0.22);
}

function hat(time){
  const ac = ctx();
  const b = ac.createBuffer(1, 2205, ac.sampleRate);
  const d = b.getChannelData(0);
  for(let i=0;i<d.length;i++){ d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.2); }
  const s = ac.createBufferSource(); s.buffer=b;
  const g = envGain(time, 0.08, 0.28);
  s.connect(g); g.connect(limiter);
  s.start(time); s.stop(time+0.09);
}

function pluck(time, hz){
  const ac = ctx();
  const o = ac.createOscillator();
  const g = envGain(time, 0.25, 0.45);
  const f = ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value = hz*3.5;
  o.type='triangle'; o.frequency.value = hz;
  o.connect(f); f.connect(g); g.connect(limiter);
  o.start(time); o.stop(time+0.26);
}

export async function startBeat({ bpmIn=92, toneHz=528 }={}){
  const ac = ctx(); if (ac.state === 'suspended') await ac.resume();
  bpm = bpmIn; running = true;
  const spb = 60 / bpm;
  let bar = 0;

  function schedule(){
    if(!running) return;
    const t0 = ac.currentTime + 0.03;
    // 4/4 bar: kick on 1 & 3, hats on 8ths, pluck on 2 & 4 tied to tone
    kick(t0 + 0*spb); kick(t0 + 2*spb);
    for(let i=0;i<8;i++) hat(t0 + i*(spb/2));
    pluck(t0 + 1*spb, toneHz*2.0);
    pluck(t0 + 3*spb, toneHz*2.5);
    bar++;
  }
  schedule();
  tickInt = setInterval(schedule, 4000 * (92/bpm)); // crude but fine for our needs
}

export function stopBeat(){
  running = false;
  if (tickInt) clearInterval(tickInt);
  tickInt = null;
}

export function setBpm(v){ bpm = Math.max(40, Math.min(160, v)); }