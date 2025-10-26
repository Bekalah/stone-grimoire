/* Plaque Loader -- ND-safe
 * Usage: <div data-plaque></div> → auto-populates from /assets/data/plaques/<slug>.json
 */
(async function () {
  if (window.__plaqueEngineInitialized) return;
  window.__plaqueEngineInitialized = true;

  async function loadJSON(url) {
    const r = await fetch(url, {cache: 'no-store'});
    if (!r.ok) throw new Error("Missing " + url);
    return r.json();
  }

  window.renderPlaque = async function (slug) {
    try {
      const box = document.querySelector('[data-plaque]');
      if (!box) return;
      const plaque = await loadJSON(`/assets/data/plaques/${slug}.json`);

      box.innerHTML = `
        <h2 class="plaque-title">${plaque.title}</h2>
        <p class="plaque-intent">${plaque.intention}</p>
        <p class="plaque-tone">Tone: ${plaque.tone?.hz || "--"} Hz · ${plaque.tone?.note || ""}</p>
      `;
    } catch (err) {
      console.warn("Plaque missing:", slug, err);
    }
  };
})();