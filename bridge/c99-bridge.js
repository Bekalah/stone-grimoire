import { applyTokenPalette } from '/assets/js/tokens-to-css.js';

async function loadJSON(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

function ndSafe() {
  document.documentElement.setAttribute('data-nd-safe', 'true');
  document.documentElement.classList.remove('allow-motion');
}

async function loadTokens(path) {
  try {
    return await loadJSON(path);
  } catch (error) {
    console.warn('Failed to load tokens', error.message);
    return null;
  }
}

function applyCSSVars(tokens) {
  if (!tokens) return;
  applyTokenPalette(tokens);
  const a11y = tokens.a11y || {};
  if (a11y.motion === 'reduce') {
    document.documentElement.classList.remove('allow-motion');
  }
}

async function loadManifest(path) {
  try {
    return await loadJSON(path);
  } catch (error) {
    console.warn('Failed to load manifest', error.message);
    return null;
  }
}

window.C99Bridge = { ndSafe, loadTokens, applyCSSVars, loadManifest };
