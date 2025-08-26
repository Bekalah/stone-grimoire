// assets/js/audio/offline-render.js
// Offline render of a short tone to WAV (ASCII only).

export async function renderToneWav({ hz = 528, seconds = 6, sampleRate = 48000 }) {
  const length = Math.max(1, Math.floor(seconds * sampleRate));
  const ctx = new OfflineAudioContext(1, length, sampleRate);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = hz;

  const gain = ctx.createGain();
  const startGain = 0.0001;
  const peakGain = 0.12; // ND-safe, gentle
  const endGain = 0.0001;

  const now = 0;
  const dur = seconds;

  gain.gain.setValueAtTime(startGain, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.25);
  gain.gain.setValueAtTime(peakGain, now + dur - 0.25);
  gain.gain.linearRampToValueAtTime(endGain, now + dur);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);

  const buf = await ctx.startRendering();
  return audioBufferToWavBlob(buf);
}

// Utility: convert AudioBuffer to 16-bit WAV Blob
function audioBufferToWavBlob(buffer) {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // interleave
  const chData = [];
  let length = buffer.length * numCh * 2; // 16-bit
  for (let c = 0; c < numCh; c++) chData.push(buffer.getChannelData(c));

  const interleaved = new Int16Array(buffer.length * numCh);
  let idx = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, chData[c][i]));
      interleaved[idx++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  }

  // WAV header
  const wav = new ArrayBuffer(44 + interleaved.length * 2);
  const view = new DataView(wav);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + interleaved.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numCh, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numCh * bitDepth / 8, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numCh * bitDepth / 8, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, interleaved.length * 2, true);

  // PCM samples
  const wavBytes = new Uint8Array(wav);
  wavBytes.set(new Uint8Array(interleaved.buffer), 44);

  return new Blob([wavBytes], { type: "audio/wav" });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}