/**
 * Framework: Jest (with jsdom test environment if configured)
 * If jsdom is not the default environment, these tests will still parse HTML using a DOM implementation.
 * We prefer reading the actual HTML file from disk if present; otherwise we fallback to the provided markup snapshot.
 */
const fs = require('fs');
const path = require('path');

function loadHtml() {
  // Try common locations for index.html
  const candidates = [
    'index.html',
    'public/index.html',
    'site/index.html',
    'src/index.html',
  ].map(p => path.resolve(process.cwd(), p));

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
  }

  // Fallback to the provided PR diff markup (kept in-sync with the change request)
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>COSMOGENESIS — Cathedral of Circuits</title>
  <meta name="description" content="A living grimoire: sacred geometry, techno-occult research, and spiral learning." />
  <link rel="preload" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8N0a8AAAAASUVORK5CYII=" as="image" />
  <link rel="stylesheet" href="assets/css/atelier.css" />
  <link rel="stylesheet" href="assets/css/colors.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <nav class="atelier-nav">
    <a href="#collections" class="marque-logo">COSMOGENESIS</a>
    <ul class="nav-collection">
      <li><a href="#collections">Collections</a></li>
      <li><a href="#arcana">Living Arcana</a></li>
      <li><a href="#node-system">Node System</a></li>
      <li><a href="#atelier">Atelier</a></li>
    </ul>
    <button id="calmToggle" class="btn-couture" aria-pressed="false">Calm Mode</button>
  </nav>

  <main id="main" class="vesica-bg tarot-overlay aurora">
    <section class="hero" aria-labelledby="hero-title">
      <figure class="hero-visual">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8N0a8AAAAASUVORK5CYII=" width="1280" height="720" alt="Layered circuit sigil with calm indigo gradient." />
      </figure>
      <div class="hero-copy">
        <h1 id="hero-title">Cathedral of Circuits</h1>
        <p>Spiral learning meets sacred geometry. The atelier is ND-safe, slow crafted, and focused on layered depth rather than spectacle.</p>
        <p>Calm Mode keeps transitions soft for sensory ease. Reduced motion is always respected for visitors who prefer stillness.</p>
      </div>
    </section>

    <section class="section" id="collections" aria-labelledby="collections-title">
      <h2 id="collections-title">Collections</h2>
      <p>Harmonic folios curated for different entry points into the cathedral. Every collection balances geometry, lore, and quiet research.</p>
      <div class="grid" role="list">
        <article class="card" role="listitem">
          <h3>Vesica Vault</h3>
          <p>Archetypal diagrams and meditations anchored by the vesica piscis lattice. Gentle overlays guide the eye without motion.</p>
        </article>
        <article class="card" role="listitem">
          <h3>Arc Forge</h3>
          <p>Research journals mapping circuitry to tarot correspondences. Includes sensor-friendly palettes and layered annotations.</p>
        </article>
        <article class="card" role="listitem">
          <h3>Helix Atlas</h3>
          <p>Double helix studies cross-referenced with Fibonacci harmonics. Built for offline study circles and workshop tables.</p>
        </article>
      </div>
    </section>

    <section class="section" id="arcana" aria-labelledby="arcana-title">
      <h2 id="arcana-title">Living Arcana</h2>
      <p>Interactive folios maintain one-to-one parity with the tarot lineage. Nodes are annotated with sensory-safe rituals and optional research paths.</p>
      <div class="grid" role="list">
        <article class="card" role="listitem">
          <h3>Zero - Aurora Gate</h3>
          <p>Entry sequence for seekers. Offers narrative, game, art, and research lenses without autoplay or sudden motion.</p>
        </article>
        <article class="card" role="listitem">
          <h3>XI - Circuit Choir</h3>
          <p>Focuses on harmonic resonance. Includes printable overlays and accessible annotations for collaborative study.</p>
        </article>
        <article class="card" role="listitem">
          <h3>XXII - Resonant Crown</h3>
          <p>Finale of the spiral, combining geometry renders with gentle text layers. Calibrated for mindful pacing.</p>
        </article>
      </div>
    </section>

    <section class="section" id="node-system" aria-labelledby="node-title">
      <h2 id="node-title">Node System</h2>
      <p>The node registry keeps track of living research threads. Data loads locally from <code>data/nodes.json</code> so the atlas stays offline-first.</p>
      <section id="node-list" aria-label="Cosmogenesis Chapels" aria-live="polite">
        <p class="chapel-fallback">Chapels manifest once local data loads. Offline? The Codex still holds their coordinates.</p>
      </section>
    </section>

    <section class="section" id="atelier" aria-labelledby="atelier-title">
      <h2 id="atelier-title">Atelier</h2>
      <p>Commission portals, learning labs, and calm prototypes. Void Lab remains the testing chamber for new experiments.</p>
      <div class="grid" role="list">
        <article class="card" role="listitem">
          <h3>Calm Kits</h3>
          <p>Printable rituals and sensory-friendly overlays for facilitators. Each kit includes annotations for ND needs.</p>
        </article>
        <article class="card" role="listitem">
          <h3>Node Workshops</h3>
          <p>Hands-on sessions exploring sacred geometry with layered canvases. No projectors, no flashing lights-just mindful study.</p>
        </article>
        <article class="card" role="listitem">
          <h3>Void Lab</h3>
          <p><a href="labs/void-lab.html">Enter the void lab</a> to inspect prototypes, view patch notes, and submit feedback without leaving the offline sanctuary.</p>
        </article>
      </div>
    </section>
  </main>

  <footer class="maison-footer">
    <div class="footer-marque">COSMOGENESIS</div>
    <div class="footer-links">
      <a href="#collections">Harmonic Research</a>
      <a href="#node-system">Node System Docs</a>
      <a href="https://github.com/your-org/your-repo" rel="noopener noreferrer">Open Source</a>
      <a href="#atelier">Commissions</a>
    </div>
    <p class="copyright">© MMXXV - Cathedral of Circuits</p>
  </footer>

  <script type="module" src="assets/js/calm.js"></script>
  <script type="module" src="assets/js/nodes.js"></script>
</body>
</html>`;
}

// Use the best available DOM: prefer global DOM (jest-environment-jsdom), else try jsdom package, else minimal parser.
function getDocument(html) {
  function hasGlobalDOM() {
    try {
      return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function';
    } catch (err) {
      return false;
    }
  }

  if (hasGlobalDOM()) {
    // jest jsdom environment
    document.documentElement.innerHTML = html;
    return document;
  }
  try {
    // Fallback to jsdom if available
    const { JSDOM } = require('jsdom');
    return new JSDOM(html).window.document;
  } catch (err) {
    // Minimal fallback: very limited parsing using DOMParser in happy-dom if present
    try {
      const { Window } = require('happy-dom');
      const win = new Window();
      return win.document;
    } catch (err2) {
      // Last resort: throw with a helpful message
      throw new Error(
        'No DOM environment available. Ensure jest testEnvironment is "jsdom", or install jsdom/happy-dom for parsing.'
      );
    }
  }
}

describe('site index markup (accessibility and structure)', () => {
  let html;
  let doc;

  beforeAll(() => {
    html = loadHtml();
    doc = getDocument(html);
  });

  test('document has correct language and meta tags', () => {
    const htmlEl = doc.querySelector('html');
    expect(htmlEl).toBeTruthy();
    expect(htmlEl.getAttribute('lang')).toBe('en');

    const charset = doc.querySelector('meta[charset="utf-8"]');
    expect(charset).toBeTruthy();

    const viewport = doc.querySelector('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
    expect(viewport.getAttribute('content')).toBe('width=device-width, initial-scale=1');

    const title = doc.querySelector('title');
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('COSMOGENESIS — Cathedral of Circuits');

    const desc = doc.querySelector('meta[name="description"]');
    expect(desc).toBeTruthy();
    expect(desc.getAttribute('content')).toBe(
      'A living grimoire: sacred geometry, techno-occult research, and spiral learning.'
    );
  });

  test('preload and stylesheets are linked correctly', () => {
    const preload = doc.querySelector('link[rel="preload"][as="image"]');
    expect(preload).toBeTruthy();
    expect(preload.getAttribute('href')).toContain('data:image/png;base64');

    const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
    expect(cssLinks).toEqual(['assets/css/atelier.css', 'assets/css/colors.css']);
  });

  test('skip link targets main landmark', () => {
    const skip = doc.querySelector('a.skip-link');
    expect(skip).toBeTruthy();
    expect(skip.getAttribute('href')).toBe('#main');
    const main = doc.querySelector('#main');
    expect(main).toBeTruthy();
  });

  test('navigation structure and links', () => {
    const nav = doc.querySelector('nav.atelier-nav');
    expect(nav).toBeTruthy();

    const brand = nav.querySelector('a.marque-logo');
    expect(brand).toBeTruthy();
    expect(brand.textContent.trim()).toBe('COSMOGENESIS');
    expect(brand.getAttribute('href')).toBe('#collections');

    const items = Array.from(nav.querySelectorAll('ul.nav-collection li a')).map(a => [a.textContent.trim(), a.getAttribute('href')]);
    expect(items).toEqual([
      ['Collections', '#collections'],
      ['Living Arcana', '#arcana'],
      ['Node System', '#node-system'],
      ['Atelier', '#atelier'],
    ]);

    const calmBtn = nav.querySelector('#calmToggle.btn-couture');
    expect(calmBtn).toBeTruthy();
    expect(calmBtn.getAttribute('aria-pressed')).toBe('false');
    expect(calmBtn.textContent.trim()).toBe('Calm Mode');
  });

  test('main hero content with accessible labeling', () => {
    const main = doc.querySelector('main#main.vesica-bg.tarot-overlay.aurora');
    expect(main).toBeTruthy();

    const hero = main.querySelector('section.hero[aria-labelledby="hero-title"]');
    expect(hero).toBeTruthy();

    const h1 = hero.querySelector('#hero-title');
    expect(h1).toBeTruthy();
    expect(h1.textContent.trim()).toBe('Cathedral of Circuits');

    const img = hero.querySelector('.hero-visual img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('width')).toBe('1280');
    expect(img.getAttribute('height')).toBe('720');
    expect(img.getAttribute('alt')).toMatch(/Layered circuit sigil/i);
  });

  test('collections section lists three cards with titles', () => {
    const sec = doc.querySelector('#collections.section[aria-labelledby="collections-title"]');
    expect(sec).toBeTruthy();
    const h2 = sec.querySelector('#collections-title');
    expect(h2).toBeTruthy();

    const cards = Array.from(sec.querySelectorAll('.grid[role="list"] > article.card[role="listitem"] h3')).map(h3 => h3.textContent.trim());
    expect(cards).toEqual(['Vesica Vault', 'Arc Forge', 'Helix Atlas']);
  });

  test('arcana section lists three specific entries', () => {
    const sec = doc.querySelector('#arcana.section[aria-labelledby="arcana-title"]');
    expect(sec).toBeTruthy();
    const h2 = sec.querySelector('#arcana-title');
    expect(h2).toBeTruthy();

    const cards = Array.from(sec.querySelectorAll('.grid[role="list"] > article.card[role="listitem"] h3')).map(h3 => h3.textContent.trim());
    expect(cards).toEqual(['Zero - Aurora Gate', 'XI - Circuit Choir', 'XXII - Resonant Crown']);
  });

  test('node system section has live region and fallback', () => {
    const sec = doc.querySelector('#node-system.section[aria-labelledby="node-title"]');
    expect(sec).toBeTruthy();
    const h2 = sec.querySelector('#node-title');
    expect(h2).toBeTruthy();

    const live = sec.querySelector('#node-list[aria-label="Cosmogenesis Chapels"][aria-live="polite"]');
    expect(live).toBeTruthy();

    const fallback = live.querySelector('p.chapel-fallback');
    expect(fallback).toBeTruthy();
    expect(fallback.textContent).toMatch(/Chapels manifest once local data loads/i);
  });

  test('atelier section includes Void Lab link', () => {
    const sec = doc.querySelector('#atelier.section[aria-labelledby="atelier-title"]');
    expect(sec).toBeTruthy();

    const titles = Array.from(sec.querySelectorAll('.grid[role="list"] > article.card[role="listitem"] h3')).map(h3 => h3.textContent.trim());
    expect(titles).toEqual(['Calm Kits', 'Node Workshops', 'Void Lab']);

    const voidLabLink = sec.querySelector('a[href="labs/void-lab.html"]');
    expect(voidLabLink).toBeTruthy();
    expect(voidLabLink.textContent).toMatch(/Enter the void lab/i);
  });

  test('footer contains brand, critical links, and copyright', () => {
    const footer = doc.querySelector('footer.maison-footer');
    expect(footer).toBeTruthy();

    const marque = footer.querySelector('.footer-marque');
    expect(marque).toBeTruthy();
    expect(marque.textContent.trim()).toBe('COSMOGENESIS');

    const links = Array.from(footer.querySelectorAll('.footer-links a')).map(a => [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('rel') || '']);
    expect(links).toEqual([
      ['Harmonic Research', '#collections', ''],
      ['Node System Docs', '#node-system', ''],
      ['Open Source', 'https://github.com/your-org/your-repo', 'noopener noreferrer'],
      ['Commissions', '#atelier', ''],
    ]);

    const copyright = footer.querySelector('p.copyright');
    expect(copyright).toBeTruthy();
    expect(copyright.textContent.trim()).toBe('© MMXXV - Cathedral of Circuits');
  });

  test('module scripts are correctly declared', () => {
    const scripts = Array.from(doc.querySelectorAll('script[type="module"]')).map(s => s.getAttribute('src'));
    expect(scripts).toContain('assets/js/calm.js');
    expect(scripts).toContain('assets/js/nodes.js');
  });

  describe('defensive checks and edge cases', () => {
    test('no unexpected aria-live values on non-live regions', () => {
      const nonLive = Array.from(doc.querySelectorAll('[aria-live]')).filter(el => el.id !== 'node-list');
      expect(nonLive.length).toBe(0);
    });

    test('all nav anchor hrefs reference existing in-page ids', () => {
      const ids = new Set(Array.from(doc.querySelectorAll('[id]')).map(e => `#${e.id}`));
      const navHrefs = Array.from(doc.querySelectorAll('nav a[href^="#"]')).map(a => a.getAttribute('href'));
      for (const href of navHrefs) {
        expect(ids.has(href)).toBe(true);
      }
    });
  });
});