/* Auto Chapel Mount -- ND-safe, no motion/audio
 * Features:
 *  - Inserts a breadcrumb header strip at top of /chapels/*.html
 *  - Injects plaque + (optional) ritual beneath the header
 *  - Soft-stamps "Visited" (localStorage) if stamps.json lists the slug
 * Opt-out: add data-autoplaque="off" on <body> to skip all injection for a page.
 */

(async function () {
  if (window.__autoChapelMounted) return;
  window.__autoChapelMounted = true;

  const path = location.pathname.replace(/\/+$/, '');
  const m = path.match(/\/chapels\/([^\/]+)\.html$/i);
  if (!m) return;
  if (document.body && document.body.getAttribute('data-autoplaque') === 'off') return;

  const slug = m[1];

  // Helpers
  const loadJSON = async (url) => {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('fetch failed: ' + url);
      return await r.json();
    } catch {
      return null;
    }
  };
  const getTitleFallback = () => (document.title || slug).replace(/\s*--.*$/, '');

  // Data: plaque, ritual, stamps map
  const [plaque, ritual, stamps] = await Promise.all([
    loadJSON(`/assets/data/plaques/${slug}.json`),
    loadJSON(`/assets/data/rituals/${slug}.json`),
    loadJSON('/assets/data/stamps.json')
  ]);

  // Soft stamp if this slug is listed in stamps.json
  try {
    if (stamps && (stamps.chapels||[]).some(c => c.slug === slug)) {
      const LS_KEY = 'c99.stamps';
      const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      s[slug] = true;
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }
  } catch {}

  // ===== Header strip (breadcrumb) =====
  // Insert just inside <main> (or document.body as fallback), before existing content
  const main = document.querySelector('main') || document.body;
  const header = document.createElement('div');
  header.className = 'c99-card'; // styled by chapel-utils.css
  header.setAttribute('aria-label', 'Chapel Header');
  header.style.margin = '14px';
  header.style.marginTop = '16px';

  const stampState = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('c99.stamps') || '{}');
      return !!s[slug];
    } catch { return false; }
  })();

  const titleText = plaque?.title || getTitleFallback();
  const indexHref = '/chapels/index.html'; // Traveler Index

  header.innerHTML = `
    <div class="c99-meta" style="justify-content:space-between;align-items:center">
      <div>
        <strong>${titleText}</strong>
        <span class="mini" style="margin-left:.5rem;opacity:.8">${slug}</span>
      </div>
      <div class="c99-row">
        <a class="c99-btn" href="${indexHref}" aria-label="Back to Traveler Index">← Back to Index</a>
        <span class="c99-badge ${stampState ? 'got' : ''}" data-badge>${stampState ? 'Visited' : 'New'}</span>
      </div>
    </div>
  `;

  // Insert header at the very top of <main> contents
  main.insertBefore(header, main.firstChild);

  // ===== Plaque + Ritual block (below header) =====
  // If neither exists, we're done (no extra DOM)
  if (!plaque && !ritual) return;

  const block = document.createElement('section');
  block.className = 'c99-card';
  block.setAttribute('aria-label', 'Chapel Plaque');
  block.style.margin = '14px';

  let html = '';

  if (plaque) {
    html += `
      <div class="c99-plaque">
        <h2 class="plaque-title">${plaque.title || ''}</h2>
        ${plaque.intention ? `<p class="plaque-intent">${plaque.intention}</p>` : ''}
        ${
          plaque.tone
            ? `<p class="plaque-tone">Tone: ${plaque.tone.hz ?? '--'} Hz · ${plaque.tone.note ?? ''}</p>`
            : ''
        }
      </div>
    `;
  }

  if (ritual) {
    const steps = (ritual.steps || []).map(s => `<li>${s}</li>`).join('');
    const seeds = (ritual.seed_syllables || []).map(x => `<span class="c99-tag">${x}</span>`).join('');
    html += `
      <div class="c99-ritual">
        <h3 style="margin:.2rem 0">Ritual</h3>
        ${ritual.intent ? `<p class="mini">${ritual.intent}</p>` : ''}
        ${seeds ? `<p class="mini">Seeds: ${seeds}</p>` : ''}
        ${ritual.breath ? `<p class="mini">Breath: ${ritual.breath.count} · ${ritual.breath.pattern}</p>` : ''}
        ${steps ? `<ol>${steps}</ol>` : ''}
        ${
          ritual.accessibility
            ? `<p class="mini" style="margin-top:.4rem">Accessibility: ${ritual.accessibility.join(' · ')}</p>`
            : ''
        }
      </div>
    `;
  }

  block.innerHTML = html;

  // Insert after header (second child), or at end if no children
  if (header.nextSibling) main.insertBefore(block, header.nextSibling);
  else main.appendChild(block);

  // If we stamped on load, ensure header badge reflects it
  const badge = header.querySelector('[data-badge]');
  if (badge && !badge.classList.contains('got')) {
    badge.textContent = 'Visited';
    badge.classList.add('got');
  }
})();