// Museum plaque: reads structure.json + stylepacks.json + alchemy.json,
// then renders a small curator card for the current room.
// Accessible, ND‑friendly, and auto-positions bottom-right.

async function j(path){ const r = await fetch(path); return r.json(); }
function rel(path){
  // Robust relative path resolver (root vs subfolders)
  const depth = location.pathname.split('/').length - 2;
  return ('../'.repeat(Math.max(0, depth))) + path;
}
function detectSection(){
  const ds = document.body.dataset.section;
  if (ds) return ds;
  const file = (location.pathname.split('/').pop() || 'index.html').replace('.html','');
  return file || 'frontispiece';
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
  const id = detectSection();
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
  }, [
    title, meta, palette, notes, toggle
  ]);

  document.body.appendChild(container);
}

// Auto-run
attachPlaque();
export { attachPlaque };
