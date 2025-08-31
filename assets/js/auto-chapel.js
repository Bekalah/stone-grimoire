/* Auto Chapel Mount -- ND-safe, no motion/audio
 * Features:
 *  - Breadcrumb header (title + back to Index + Visited badge)
 *  - Plaque + optional Ritual block (from /assets/data/plaques|rituals/<slug>.json)
 *  - Soft-stamp "Visited" via localStorage if listed in stamps.json
 *  - Prev/Next footer from assets/data/structure.json (rooms order, realm = Chapels)
 * Opt-out: add data-autoplaque="off" on <body> to skip injection for a page.
 */

(async function () {
  if (window.__autoChapelMounted) return;
  window.__autoChapelMounted = true;

  const path = location.pathname.replace(/\/+$/, '');
  const m = path.match(/\/chapels\/([^\/]+)\.html$/i);
  if (!m) return;
  if (document.body && document.body.getAttribute('data-autoplaque') === 'off') return;

  const slug = m[1];

  // ---------- helpers ----------
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

  // ---------- data ----------
  const [plaque, ritual, stamps, structure] = await Promise.all([
    loadJSON(`/assets/data/plaques/${slug}.json`),
    loadJSON(`/assets/data/rituals/${slug}.json`),
    loadJSON('/assets/data/stamps.json'),
    loadJSON('/assets/data/structure.json')
  ]);

  // Soft stamp if slug appears in stamps.json
  try {
    if (stamps && (stamps.chapels||[]).some(c => c.slug === slug)) {
      const LS_KEY = 'c99.stamps';
      const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      s[slug] = true;
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }
  } catch {}

  // ---------- header strip ----------
  const main = document.querySelector('main') || document.body;
  const header = document.createElement('div');
  header.className = 'c99-card';
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
  const indexHref = '/chapels/index.html';

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
  main.insertBefore(header, main.firstChild);

  // ---------- plaque + ritual block ----------
  if (plaque || ritual) {
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
          ${plaque.tone ? `<p class="plaque-tone">Tone: ${plaque.tone.hz ?? '--'} Hz · ${plaque.tone.note ?? ''}</p>` : ''}
        </div>`;
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
          ${ritual.accessibility ? `<p class="mini" style="margin-top:.4rem">Accessibility: ${ritual.accessibility.join(' · ')}</p>` : ''}
        </div>`;
    }
    block.innerHTML = html;

    if (header.nextSibling) main.insertBefore(block, header.nextSibling);
    else main.appendChild(block);

    // ensure header badge shows Visited if we just stamped
    const badge = header.querySelector('[data-badge]');
    if (badge && !badge.classList.contains('got')) {
      badge.textContent = 'Visited';
      badge.classList.add('got');
    }
  }

  // ---------- prev/next footer ----------
  // Build ordered chapel list from structure.json (rooms order), filter realm=Chapels
  function routeToSlug(route, id) {
    if (id) return String(id);
    if (!route) return '';
    return String(route).replace(/^chapels\//,'').replace(/\.html$/,'');
  }

  let list = [];
  if (structure && Array.isArray(structure.rooms)) {
    list = structure.rooms
      .filter(r => (r.realm || '').toLowerCase() === 'chapels')
      .map(r => ({
        slug: routeToSlug(r.route, r.id),
        title: r.title || routeToSlug(r.route, r.id),
        href: '/' + (r.route || `chapels/${routeToSlug(r.route, r.id)}.html`)
      }))
      .filter(x => x.slug);
  }

  if (list.length) {
    const idx = Math.max(0, list.findIndex(x => x.slug === slug));
    const prev = list[(idx - 1 + list.length) % list.length];
    const next = list[(idx + 1) % list.length];

    const foot = document.createElement('section');
    foot.className = 'c99-card';
    foot.setAttribute('aria-label', 'Chapel Navigation');
    foot.style.margin = '14px';
    foot.innerHTML = `
      <div class="c99-row" style="justify-content:space-between">
        <div class="c99-row">
          <a class="c99-btn" href="${prev.href}" aria-label="Previous Chapel">← ${prev.title}</a>
        </div>
        <div class="c99-row">
          <a class="c99-btn" href="${next.href}" aria-label="Next Chapel">${next.title} →</a>
        </div>
      </div>
    `;
    main.appendChild(foot);
  }
})();