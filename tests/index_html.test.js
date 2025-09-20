// Jest + JSDOM tests for index.html structure and accessibility
/**
 * Test framework: Jest with JSDOM test environment (preferred).
 * If your project uses a different runner (e.g., Vitest with jsdom), this file remains compatible.
 *
 * These tests focus on the PR diff contents for index.html, asserting structure,
 * accessibility attributes, links, headings, and critical resources.
 */

const fs = require('fs');
const path = require('path');

// Helper to load HTML into JSDOM-like environment without relying on global JSDOM config.
function loadDocument() {
  const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'index.html'), 'utf8');
  // If running under Jest with jsdom, document/window exist. Otherwise, create a DOM using JSDOM on demand.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(html);
    global.window = dom.window;
    global.document = dom.window.document;
  } else {
    document.open();
    document.write(html);
    document.close();
  }
}

describe('index.html - document metadata and head', () => {
  beforeAll(loadDocument);

  test('has correct doctype and html lang=en', () => {
    // doctype
    const hasDoctype = document.doctype && document.doctype.name === 'html';
    expect(hasDoctype).toBe(true);

    // html lang
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  test('includes required meta tags and correct title/description', () => {
    const metaCharset = document.querySelector('meta[charset="utf-8"]');
    const metaViewport = document.querySelector('meta[name="viewport"][content="width=device-width, initial-scale=1"]');
    const title = document.querySelector('title');
    const metaDescription = document.querySelector('meta[name="description"]');

    expect(metaCharset).not.toBeNull();
    expect(metaViewport).not.toBeNull();
    expect(title).not.toBeNull();
    expect(title.textContent).toBe('COSMOGENESIS — Cathedral of Circuits');
    expect(metaDescription).not.toBeNull();
    expect(metaDescription.getAttribute('content')).toBe(
      'A living grimoire: sacred geometry, techno-occult research, and spiral learning.'
    );
  });

  test('preloads base64 image and links to both stylesheets', () => {
    const preload = document.querySelector('link[rel="preload"][as="image"]');
    expect(preload).not.toBeNull();
    expect(preload.getAttribute('href')).toMatch(/^data:image\/png;base64,/);

    const css = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
    expect(css).toEqual(expect.arrayContaining(['assets/css/atelier.css', 'assets/css/colors.css']));
  });
});

describe('index.html - navigation and skip link', () => {
  beforeAll(loadDocument);

  test('provides a skip link targeting #main', () => {
    const skip = document.querySelector('a.skip-link[href="#main"]');
    expect(skip).not.toBeNull();
    expect(skip.textContent.trim()).toMatch(/Skip to content/i);
  });

  test('nav structure: marque logo, collections list, calm toggle button with aria-pressed', () => {
    const nav = document.querySelector('nav.atelier-nav');
    expect(nav).not.toBeNull();

    const logo = nav.querySelector('a.marque-logo[href="#collections"]');
    expect(logo).not.toBeNull();
    expect(logo.textContent.trim()).toBe('COSMOGENESIS');

    const items = Array.from(nav.querySelectorAll('ul.nav-collection > li > a')).map(a => a.getAttribute('href'));
    expect(items).toEqual(['#collections', '#arcana', '#node-system', '#atelier']);

    const btn = nav.querySelector('#calmToggle.btn-couture');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent.trim()).toBe('Calm Mode');
  });
});

describe('index.html - main content sections', () => {
  beforeAll(loadDocument);

  test('main has expected id and classes', () => {
    const main = document.querySelector('main#main');
    expect(main).not.toBeNull();
    const cls = main.className.split(/\s+/);
    expect(cls).toEqual(expect.arrayContaining(['vesica-bg', 'tarot-overlay', 'aurora']));
  });

  test('hero section labeled by h1 with image alt text and dimensions', () => {
    const hero = document.querySelector('section.hero[aria-labelledby="hero-title"]');
    expect(hero).not.toBeNull();

    const h1 = document.getElementById('hero-title');
    expect(h1).not.toBeNull();
    expect(h1.textContent.trim()).toBe('Cathedral of Circuits');

    const img = hero.querySelector('figure.hero-visual img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(img.getAttribute('width')).toBe('1280');
    expect(img.getAttribute('height')).toBe('720');
    expect(img.getAttribute('alt')).toMatch(/Layered circuit sigil/i);
  });

  test('collections section has correct heading, list structure, and three cards', () => {
    const section = document.querySelector('#collections.section[aria-labelledby="collections-title"]');
    expect(section).not.toBeNull();
    const h2 = document.getElementById('collections-title');
    expect(h2).not.toBeNull();
    expect(h2.textContent.trim()).toBe('Collections');

    const list = section.querySelector('.grid[role="list"]');
    expect(list).not.toBeNull();

    const items = section.querySelectorAll('article.card[role="listitem"]');
    expect(items.length).toBe(3);

    const headings = Array.from(items).map(i => i.querySelector('h3')?.textContent.trim());
    expect(headings).toEqual(['Vesica Vault', 'Arc Forge', 'Helix Atlas']);
  });

  test('arcana section includes three specific entries', () => {
    const section = document.querySelector('#arcana.section[aria-labelledby="arcana-title"]');
    expect(section).not.toBeNull();

    const cardTitles = Array.from(section.querySelectorAll('article.card h3')).map(h3 => h3.textContent.trim());
    expect(cardTitles).toEqual(['Zero - Aurora Gate', 'XI - Circuit Choir', 'XXII - Resonant Crown']);
  });

  test('node-system exposes live region with fallback paragraph', () => {
    const section = document.querySelector('#node-system.section[aria-labelledby="node-title"]');
    expect(section).not.toBeNull();

    const live = section.querySelector('#node-list[aria-live="polite"][aria-label="Cosmogenesis Chapels"]');
    expect(live).not.toBeNull();

    const fallback = live.querySelector('p.chapel-fallback');
    expect(fallback).not.toBeNull();
    expect(fallback.textContent).toMatch(/Chapels manifest once local data loads/i);
  });

  test('atelier section links to labs/void-lab.html and has three cards', () => {
    const section = document.querySelector('#atelier.section[aria-labelledby="atelier-title"]');
    expect(section).not.toBeNull();

    const items = section.querySelectorAll('article.card');
    expect(items.length).toBe(3);

    const voidLab = section.querySelector('article.card a[href="labs/void-lab.html"]');
    expect(voidLab).not.toBeNull();
    expect(voidLab.textContent).toMatch(/Enter the void lab/i);
  });
});

describe('index.html - footer and scripts', () => {
  beforeAll(loadDocument);

  test('footer contains marque, four links, and copyright', () => {
    const footer = document.querySelector('footer.maison-footer');
    expect(footer).not.toBeNull();

    const marque = footer.querySelector('.footer-marque');
    expect(marque?.textContent.trim()).toBe('COSMOGENESIS');

    const links = Array.from(footer.querySelectorAll('.footer-links a')).map(a => a.getAttribute('href'));
    expect(links).toEqual(['#collections', '#node-system', 'https://github.com/your-org/your-repo', '#atelier']);

    const openSource = footer.querySelector('.footer-links a[href="https://github.com/your-org/your-repo"]');
    expect(openSource?.getAttribute('rel')).toContain('noopener');

    const copyright = footer.querySelector('p.copyright');
    expect(copyright).not.toBeNull();
    expect(copyright.textContent).toMatch(/© MMXXV - Cathedral of Circuits/);
  });

  test('module scripts for calm and nodes are present with correct type', () => {
    const scripts = Array.from(document.querySelectorAll('script[type="module"]')).map(s => s.getAttribute('src'));
    expect(scripts).toEqual(expect.arrayContaining(['assets/js/calm.js', 'assets/js/nodes.js']));
  });
});

describe('index.html - edge cases and robustness', () => {
  beforeAll(loadDocument);

  test('all section headings are unique and non-empty', () => {
    const ids = Array.from(document.querySelectorAll('h1[id], h2[id]')).map(h => h.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
    ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/i));
  });

  test('all anchor tags have accessible text', () => {
    const anchors = Array.from(document.querySelectorAll('a'));
    anchors.forEach(a => {
      const text = (a.textContent || '').trim();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  test('no images without alt attribute', () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
      expect(img.hasAttribute('alt')).toBe(true);
      expect((img.getAttribute('alt') || '').trim().length).toBeGreaterThan(0);
    });
  });
});