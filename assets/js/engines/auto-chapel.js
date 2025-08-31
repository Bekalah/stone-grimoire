/* Auto Chapel Mount -- ND-safe, no motion/audio
 * Injects plaque + ritual into any /chapels/*.html page automatically.
 * Opt-out: add data-autoplaque="off" on <body> to skip injection on a page.
 */

(async function () {
  if (window.__autoChapelMounted) return;
  window.__autoChapelMounted = true;

  // Only run on /chapels/*.html
  const path = location.pathname.replace(/\/+$/, '');
  const match = path.match(/\/chapels\/([^\/]+)\.html$/i);
  if (!match) return;

  // Allow per-page opt-out
  if (document.body && document.body.getAttribute('data-autoplaque') === 'off') return;

  const slug = match[1];

  const loadJSON = async (url) => {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('fetch failed: ' + url);
      return await r.json();
    } catch {
      return null;
    }
  };

  // Load plaque + ritual if they exist
  const plaque = await loadJSON(`/assets/data/plaques/${slug}.json`);
  const ritual = await loadJSON(`/assets/data/rituals/${slug}.json`);

  // Create mount container
  const main = document.querySelector('main') || document.body;
  const mount = document.createElement('section');
  mount.setAttribute('aria-label', 'Chapel Plaque');
  mount.style.marginTop = '16px';
  mount.style.border = '1px solid var(--line, rgba(0,0,0,.12))';
  mount.style.borderRadius = '12px';
  mount.style.background = '#fff';
  mount.style.padding = '14px';

  // Build inner HTML (only for existing data)
  let html = '';
  if (plaque) {
    html += `
      <div class="c99-plaque">
        <h2 class="plaque-title" style="margin:.2rem 0;color:var(--accent,inherit)">${plaque.title || ''}</h2>
        ${plaque.intention ? `<p class="plaque-intent" style="font-style:italic;opacity:.85">${plaque.intention}</p>` : ''}
        ${
          plaque.tone
            ? `<p class="plaque-tone" style="font-size:.9rem;opacity:.75">Tone: ${plaque.tone.hz ?? '--'} Hz · ${plaque.tone.note ?? ''}</p>`
            : ''
        }
      </div>
    `;
  }

  if (ritual) {
    const steps = (ritual.steps || []).map(s => `<li>${s}</li>`).join('');
    const seeds = (ritual.seed_syllables || []).map(x => `<span class="tag" style="border:1px solid var(--line,rgba(0,0,0,.12));border-radius:.4rem;padding:.15rem .4rem;margin-right:.35rem">${x}</span>`).join('');
    html += `
      <div class="c99-ritual" style="margin-top:10px">
        <h3 style="margin:.2rem 0">Ritual</h3>
        ${ritual.intent ? `<p class="mini" style="opacity:.85">${ritual.intent}</p>` : ''}
        ${seeds ? `<p class="mini">Seeds: ${seeds}</p>` : ''}
        ${ritual.breath ? `<p class="mini" style="opacity:.8">Breath: ${ritual.breath.count} · ${ritual.breath.pattern}</p>` : ''}
        ${steps ? `<ol style="margin:.4rem 0 0 1.1rem">${steps}</ol>` : ''}
        ${
          ritual.accessibility
            ? `<p class="mini" style="opacity:.8;margin-top:.4rem">Accessibility: ${ritual.accessibility.join(' · ')}</p>`
            : ''
        }
      </div>
    `;
  }

  if (!html) return; // nothing to mount

  mount.innerHTML = html;

  // Insert after header if possible, else append to main
  const afterHeader = main.querySelector('header')?.nextSibling;
  if (afterHeader) main.insertBefore(mount, afterHeader);
  else main.appendChild(mount);

  // Soft stamp when page loads, if stamps.json lists this slug
  try {
    const stamps = await loadJSON('/assets/data/stamps.json');
    if (stamps && (stamps.chapels||[]).some(c => c.slug === slug)) {
      const LS_KEY = 'c99.stamps';
      const getStamps = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
      const s = getStamps(); s[slug] = true;
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }
  } catch {}
})();