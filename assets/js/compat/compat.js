// assets/js/compat/compat.js
export const Compat = {
  hasModules: !!window.import,
  hasAudioContext: !!(window.AudioContext || window.webkitAudioContext),
  hasOfflineAudio: !!window.OfflineAudioContext,
  canDownloadAttribute: (() => {
    const a = document.createElement('a');
    return 'download' in a;
  })(),
  dpr() {
    return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  },
  prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  onFirstGesture(fn) {
    let done = false;
    const go = () => { if (!done) { done = true; cleanup(); try{ fn(); }catch(_){} } };
    const cleanup = () => {
      ['pointerdown','touchstart','keydown','mousedown','click','visibilitychange'].forEach(ev => {
        window.removeEventListener(ev, go, true);
      });
    };
    ['pointerdown','touchstart','keydown','mousedown','click','visibilitychange'].forEach(ev => {
      window.addEventListener(ev, go, true);
    });
  },
  // iOS/Safari sometimes blocks download+blob. Fallback to new tab dataURL.
  safeDownloadBlob(blob, filename = 'download.bin') {
    const a = document.createElement('a');
    if (this.canDownloadAttribute) {
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
    } else {
      // fallback: open in new tab (lets user "Share/Save")
      const r = new FileReader();
      r.onload = () => window.open(r.result, '_blank', 'noopener');
      r.readAsDataURL(blob);
    }
  }
};