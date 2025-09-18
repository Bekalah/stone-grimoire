// nodes.js — offline-first loader for node registry
const grid = document.getElementById('nodeGrid');
const source = '../data/nodes.json';

/**
 * Create the HTML markup for a node card.
 * Small pure function keeps rendering predictable and readable.
 */
function renderCard(node) {
  return `
    <article class="card" role="listitem">
      <h3>${node.title}</h3>
      <p>${node.summary}</p>
    </article>
  `;
}

/**
 * Render a friendly fallback message when data is unavailable.
 */
function renderFallback(message) {
  grid.innerHTML = `
    <article class="card" role="listitem">
      <h3>Node registry offline</h3>
      <p>${message}</p>
    </article>
  `;
}

async function loadNodes() {
  if (!grid) return;
  try {
    const response = await fetch(source, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const payload = await response.json();
    const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
    if (!nodes.length) {
      renderFallback('No nodes registered yet. Calm archives will populate soon.');
      return;
    }
    grid.innerHTML = nodes.map(renderCard).join('');
  } catch (error) {
    console.warn('Node registry could not load.', error);
    renderFallback('Local data missing. Check data/nodes.json for updates.');
  }
}

loadNodes();
