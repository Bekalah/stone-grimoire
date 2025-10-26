import { applyTokenPalette } from '/assets/js/tokens-to-css.js';

/**
 * Fetch JSON from the given URL using a no-store cache and return the parsed body.
 *
 * Uses fetch with cache: 'no-store'. If the response has a non-OK status an Error is thrown containing the URL and HTTP status.
 *
 * @param {string} url - Resource URL to fetch.
 * @returns {Promise<any>} Parsed JSON response body.
 * @throws {Error} If the response is not ok (error message includes the URL and status).
 */
async function loadJSON(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

/**
 * Mark the document as "ND safe" and disable page motion.
 *
 * Sets `data-nd-safe="true"` on the root `<html>` element and removes the
 * `allow-motion` class from that element so styles/scripts can treat the page
 * as non-disruptive (e.g., reduce or disable animations).
 */
function ndSafe() {
  document.documentElement.setAttribute('data-nd-safe', 'true');
  document.documentElement.classList.remove('allow-motion');
}

/**
 * Load design tokens JSON from the given path and return the parsed object.
 * @param {string} path - URL or file path to the tokens JSON.
 * @return {Promise<Object|null>} The parsed JSON object on success, or `null` if loading fails (a warning is logged).
 */
async function loadTokens(path) {
  try {
    return await loadJSON(path);
  } catch (error) {
    console.warn('Failed to load tokens', error.message);
    return null;
  }
}

/**
 * Apply a token palette to the document and enforce accessibility motion preferences.
 *
 * Applies the provided design tokens via applyTokenPalette(tokens). If `tokens.a11y.motion`
 * equals `"reduce"`, removes the `allow-motion` class from the root HTML element to
 * indicate reduced-motion should be honored.
 *
 * @param {Object} tokens - Design tokens object (passed to applyTokenPalette). May include an `a11y` object with a `motion` property.
 */
function applyCSSVars(tokens) {
  if (!tokens) return;
  applyTokenPalette(tokens);
  const a11y = tokens.a11y || {};
  if (a11y.motion === 'reduce') {
    document.documentElement.classList.remove('allow-motion');
  }
}

/**
 * Load a JSON manifest from the given path.
 *
 * Attempts to fetch and parse JSON at `path`. On success returns the parsed
 * manifest object; on failure logs a warning and returns null.
 *
 * @param {string} path - URL or filesystem path to the manifest JSON.
 * @returns {Promise<Object|null>} The parsed manifest object, or `null` if loading failed.
 */
async function loadManifest(path) {
  try {
    return await loadJSON(path);
  } catch (error) {
    console.warn('Failed to load manifest', error.message);
    return null;
  }
}

window.C99Bridge = { ndSafe, loadTokens, applyCSSVars, loadManifest };
