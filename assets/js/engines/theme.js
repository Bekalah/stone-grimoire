/* Theme Kernel -- ND-safe, no motion/audio
 * Location: /assets/js/engines/theme.js
 * Responsibilities:
 *  - Set light/dark/data attributes if you use them
 *  - Soft hook for planetary-hours + share-export (optional)
 *  - Auto-mount plaques/rituals on any /chapels/*.html via auto-chapel.js
 */

(function () {
  if (window.__themeKernel) return;
  window.__themeKernel = true;

  // --- Preferences (optional; keep minimal & ND-safe)
  const root = document.documentElement;
  // Example: root.setAttribute('data-theme', 'light');

  // --- Safe dynamic loader
  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // Autoloads that match your repo:
  // NOTE: Paths are absolute from site root
  const LOADS = [
    // Planetary hours tint (optional)
    '/assets/js/engines/planetary-hours.js',
    // Share / export helpers (optional)
    '/assets/js/engines/share-export.js',
    // Auto plaque + ritual injector for any /chapels/*.html
    '/assets/js/engines/auto-chapel.js'
  ];

  // Kick load after DOM is ready
  const run = async () => {
    for (const src of LOADS) { await loadScript(src); }
    // Emit an event others can listen to if they need the theme to be ready
    document.dispatchEvent(new CustomEvent('theme:ready'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();