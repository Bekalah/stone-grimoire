// nodes.js — paints chapels with thelemic path palettes and hydrates node data
import paths from '../../palettes/thelemic_letters.json' assert { type: 'json' };

const registry = Array.isArray(paths?.paths) ? paths.paths : [];
const pathIndex = new Map();
for (const entry of registry) {
  if (entry?.letter && !pathIndex.has(entry.letter)) pathIndex.set(entry.letter, entry);
  if (entry?.thelemicPath && !pathIndex.has(entry.thelemicPath)) pathIndex.set(entry.thelemicPath, entry);
  if (entry?.id && !pathIndex.has(entry.id)) pathIndex.set(entry.id, entry);
}

function tintValue(base, fallback) {
  if (typeof base === 'string' && base.startsWith('#') && base.length === 7) {
    return `${base}20`;
  }
  return fallback;
}

/** call after you render a “chapel” element */
export function paintChapel(el, thelemicPath) {
  if (!el) return;
  const key = typeof thelemicPath === 'string' ? thelemicPath : '';
  const normalized = key.trim();
  const p = pathIndex.get(normalized) || pathIndex.get(normalized.toUpperCase());
  if (!p) return;
  if (p.primary) el.style.setProperty('--path-primary', p.primary);
  if (p.secondary) el.style.setProperty('--path-secondary', p.secondary);
  const accents = Array.isArray(p.accents) ? p.accents : [];
  el.style.setProperty('--vesica-a', accents[0] || tintValue(p.primary, '#ffffff12'));
  el.style.setProperty('--vesica-b', accents[1] || tintValue(p.secondary, '#ffffff10'));
  el.classList.add('vesica-bg', 'tarot-overlay', 'aurora');
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim().length);
  if (typeof value === 'string') return value.trim().length ? [value.trim()] : [];
  return [];
}

function renderList(label, items) {
  const list = normalizeList(items);
  if (!list.length) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'chapel-listing';
  const heading = document.createElement('p');
  heading.className = 'chapel-label';
  heading.textContent = label;
  wrapper.appendChild(heading);
  const ul = document.createElement('ul');
  ul.className = 'chapel-items';
  for (const item of list) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
  wrapper.appendChild(ul);
  return wrapper;
}

function renderFallback(root, message) {
  root.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'chapel-fallback';
  p.textContent = message;
  root.appendChild(p);
}

function renderNode(node) {
  const card = document.createElement('section');
  card.className = 'chapel';
  if (node.thelemicPath) {
    card.setAttribute('data-path', node.thelemicPath);
  }

  const header = document.createElement('header');
  const title = document.createElement('h2');
  title.textContent = node.name || node.title || node.id || 'Unnamed Chapel';
  header.appendChild(title);

  if (node.type) {
    const tag = document.createElement('p');
    tag.className = 'chapel-type';
    tag.textContent = node.type;
    header.appendChild(tag);
  }

  card.appendChild(header);

  const loreText = node.lore || node.summary;
  if (loreText) {
    const lore = document.createElement('p');
    lore.className = 'lore';
    lore.textContent = loreText;
    card.appendChild(lore);
  }

  const curriculum = renderList('Curriculum', node.curriculum);
  if (curriculum) card.appendChild(curriculum);

  if (node.labProtocol) {
    const protocol = document.createElement('p');
    protocol.className = 'chapel-protocol';
    protocol.textContent = node.labProtocol;
    card.appendChild(protocol);
  }

  const assets = renderList('Assets', node.assets);
  if (assets) card.appendChild(assets);

  if (node.lab) {
    const button = document.createElement('button');
    button.className = 'open-lab';
    button.type = 'button';
    button.setAttribute('data-lab', node.lab);
    button.textContent = 'Enter Lab';
    card.appendChild(button);
  }

  paintChapel(card, node.thelemicPath);
  return card;
}

/* sample progressive enhancement hookup */
export async function hydrateNodes() {
  const root = document.getElementById('node-list');
  if (!root) return;
  let nodes = [];
  try {
    const r = await fetch('data/nodes.json', { cache: 'no-store' });
    const payload = await r.json();
    nodes = Array.isArray(payload) ? payload : [];
  } catch {
    renderFallback(root, 'Local node data could not be reached. Offline chapel notes remain available in the Codex.');
    return;
  }

  if (!nodes.length) {
    renderFallback(root, 'No chapels registered yet. Add entries to data/nodes.json to manifest them.');
    return;
  }

  root.innerHTML = '';
  for (const node of nodes) {
    const chapel = renderNode(node);
    root.appendChild(chapel);
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('.open-lab');
    if (!b) return;
    const href = b.getAttribute('data-lab') || '';
    try {
      const u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return;
      const w = window.open(u.href, '_blank', 'noopener,noreferrer');
      if (w) w.opener = null;
    } catch {
      // noop — invalid URLs are ignored for safety
    }
  });
}

document.addEventListener('DOMContentLoaded', hydrateNodes);
