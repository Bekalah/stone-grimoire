// Museum plaque: reads structure.json + stylepacks.json + alchemy.json,
// then renders a small curator card for the current room.
// Now robust to missing data-section: infers from filename or route.

async function j(path){ const r = await fetch(path); return r.json(); }
function rel(path){
  const depth = location.pathname.split('/').length - 2;
  return ('../'.repeat(Math.max(0, depth))) + path;
}
function filenameFromPath(){
  const last = location.pathname.split('/').pop() || 'index.html';
  return last.toLowerCase();
}
function inferIdFromFilename(file){
  // strip .html
  const base = file.endsWith('.html') ? file.slice(0, -5) : file;
  if (base === '' || base === 'index') return 'frontispiece';
  if (base === 'cathedral') return 'nave';
  return base; // e.g., lady-chapel, crypt, helix-totem, etc.
}
function detectSection(structure){
  // 1) explicit
  const ds = document.body.dataset.section;
  if (ds) return ds;

  // 2) filename inference
  const file = filenameFromPath();
  const inferred = inferIdFromFilename(file);

  // If the inferred id exists in structure, use it
  if (structure?.rooms?.some(r => r.id === inferred)) return inferred;

  // 3) try matching by route (supports subpaths and hashes)
  const path = location.pathname.replace(/\/+$/, ''); // no trailing slash
  const hash = location.hash || '';
  // prefer exact route; then filename; then anchor endings
  const byExact = structure?.rooms?.find(r => r.route && (new URL(r.route, location.origin).pathname === path));
  if (byExact) return byExact.id;

  const byFile = structure?.rooms?.find(r => r.route && r.route.toLowerCase().includes(file));
  if (byFile) return byFile.id;

  if (hash) {
    const byHash = structure?.rooms?.find(r => r.route && r.route.split('#')[1] && ('#' + r.route.split('#')[1]) === hash);
    if (byHash) return byHash.id;
  }

  // 4) fallback: frontispiece
  return 'frontispiece';
}
function el(tag, attrs={}, children=[]){
  const d = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k === 'style' && typeof v === 'object') Object.assign(d.style, v);
    else if (k.startsWith('on') && typeof v === 'function') d.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) d.setAttribute(k, v);
  });
  (Array.isArray(children)?children:[children]).forEach(c=>{
    if (c==null) return;
    d.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return d;
}
function swatch(hex){ return el('span', { class:'plq-swatch', style:{ backgroundColor: hex } }); }

async function attachPlaque(){
  // Load data
  const [structure, packs, alchemy] = await Promise.all([
    j(rel('assets/data/structure.json')),
    j(rel('assets/data/stylepacks.json')),
    j(rel('assets/data/alchemy.json'))
  ]).catch(()=>[null,null,null]);

  if (!structure) return;

  const id = detectSection(structure);
  const room = structure.rooms.find(r => r.id === id);
  if (!room) return;

  const pack = packs?.find(p=>p.id===room.stylepack);
  const elem = alchemy?.elements?.find(e=>e.id===room.element);
  const glyph = elem?.glyph || '✦';
  const tone  = room.toneHz ? `${room.toneHz} Hz` : '';
  const pal   = Array.isArray(pack?.palette) ? pack.palette.slice(0,5) : [];

  // Build plaque DOM
  const title = el('div', { class:'plq-title' }, [
    el('span', { class:'plq-glyph', 'aria-hidden':'true' }, glyph + ' '),
    el('strong', {}, room.title || 'Room')
  ]);

  const meta = el('div', { class:'plq-meta' }, [
    room.element ? el('div', { class:'plq-line' }, [`Element: ${room.element}`]) : null,
    tone ? el('div', { class:'plq-line' }, [`Tone: ${tone}`]) : null,
    pack ? el('div', { class:'plq-line' }, [`Style: ${pack.name || pack.id}`]) : null
  ].filter(Boolean));

  const palette = pal.length
    ? el('div', { class:'plq-palette', role:'img', 'aria-label':'Palette swatches' },
        pal.map(hex => swatch(hex)))
    : null;

  const notes = room.notes
    ? el('div', { class:'plq-notes' }, room.notes)
    : null;

  // Expand/collapse for small screens
  const toggle = el('button', {
    class:'plq-toggle',
    'aria-expanded':'false',
    onclick: (e)=>{
      const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
      e.currentTarget.setAttribute('aria-expanded', String(!expanded));
      container.classList.toggle('plq-open', !expanded);
    }
  }, 'Details');

  const container = el('aside', {
    class:'room-plaque',
    role:'complementary',
    'aria-label':'Room information plaque'
  }, [ title, meta, palette, notes, toggle ]);

  document.body.appendChild(container);
}

// auto-attach
attachPlaque();
export { attachPlaque };
