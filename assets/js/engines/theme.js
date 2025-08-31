
// theme.js -- Light/Dark swapper (ASCII-only, iPad-safe)
// Strategy: swap the main theme stylesheet href (light.css <-> dark.css),
// remember the choice in localStorage, and expose a toggle button.
// Also auto-injects the toggle into .c99-ritual if found.

const THEME_KEY = 'c99/theme';
const LIGHT_HREF = '/assets/css/light.css';
const DARK_HREF  = '/assets/css/dark.css';

function getLink() {
  // look for <link id="theme-css"> first, otherwise first stylesheet that ends with /light.css or /dark.css
  let link = document.getElementById('theme-css');
  if (link) return link;
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  return links.find(l => (l.href.endsWith('/light.css') || l.href.endsWith('/dark.css'))) || null;
}

function preferredTheme() {
  // local choice wins; otherwise respect OS; default to light
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  return m && m.matches ? 'dark' : 'light';
}

export function setTheme(mode) {
  const link = getLink();
  if (!link) return;
  const nextHref = (mode === 'dark') ? DARK_HREF : LIGHT_HREF;
  if (!link.href.endsWith(nextHref)) {
    // Use pathname form so it works from any folder depth
    link.setAttribute('href', nextHref);
  }
  document.documentElement.dataset.theme = mode; // hook if you want CSS differences
  localStorage.setItem(THEME_KEY, mode);
  updateToggleLabel();
}

export function toggleTheme() {
  const current = (document.documentElement.dataset.theme || preferredTheme());
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function updateToggleLabel() {
  const btn = document.querySelector('[data-action="theme-toggle"]');
  if (!btn) return;
  const mode = document.documentElement.dataset.theme;
  // simple, readable labels
  btn.textContent = (mode === 'dark') ? 'Sun (Light)' : 'Moon (Dark)';
  btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
}

function injectToggle() {
  // If a ritual control exists, add a theme button into it
  const holder = document.querySelector('.c99-ritual .c99-ritual__row');
  if (!holder) return;
  if (holder.querySelector('[data-action="theme-toggle"]')) return; // already there
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('data-action','theme-toggle');
  btn.addEventListener('click', toggleTheme);
  holder.appendChild(btn);
  updateToggleLabel();
}

function ensureThemeLinkId() {
  const link = getLink();
  if (link && !link.id) link.id = 'theme-css';
}

window.addEventListener('DOMContentLoaded', () => {
  ensureThemeLinkId();
  // Initialize theme immediately
  setTheme(preferredTheme());
  // Inject the toggle button if ritual UI exists
  injectToggle();

  // Also keep in sync if OS color scheme flips while browsing
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    // Only react if user has NOT explicitly chosen; if chosen, we respect that
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== 'light' && saved !== 'dark') {
      mq.addEventListener ? mq.addEventListener('change', e => {
        setTheme(e.matches ? 'dark' : 'light');
      }) : mq.addListener && mq.addListener(e => {
        setTheme(e.matches ? 'dark' : 'light');
      });
    }
  }
});