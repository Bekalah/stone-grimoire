// platform-bridge.js -- minimal cross-device helpers

export const hasAudio =
  !!(window.AudioContext || window.webkitAudioContext);

export const isSafari =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function onFirstGesture(fn) {
  const once = (e) => { try { fn(e); } finally {
    ["pointerdown","touchstart","click","keydown"].forEach(ev =>
      window.removeEventListener(ev, once, { passive:true })
    );
  }};
  ["pointerdown","touchstart","click","keydown"].forEach(ev =>
    window.addEventListener(ev, once, { passive:true })
  );
}

export function unifyRAF() {
  // Throttle RAF on tab background across browsers
  let rid = 0;
  const _raf = (cb) => window.requestAnimationFrame(cb);
  const _caf = (id) => window.cancelAnimationFrame(id);
  return { raf: _raf, caf: _caf };
}

export function devicePixelRatioSafe() {
  const d = window.devicePixelRatio || 1;
  // Cap DPR on ultra-high density phones to avoid huge canvases
  return Math.min(d, 2);
}