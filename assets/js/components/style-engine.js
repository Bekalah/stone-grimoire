// Style Engine — applies a stylepack (palette, motif, textures) to the page/pillar.
let __PACKS;
async function loadPacks() {
  if (__PACKS) return __PACKS;
  const depth = location.pathname.split('/').length - 2;
  const url = ('../'.repeat(depth)) + 'assets/data/stylepacks.json';
  __PACKS = await (await fetch(url)).json();
  return __PACKS;
}
function setCSSVar(name, val){ document.documentElement.style.setProperty(name, val); }
function choosePalette(p){ return (p && p.length ? p : ['#6c6c6c','#999','#222','#eee']); }
function removePrevMotifs(){
  const classes = Array.from(document.body.classList).filter(c=>c.startsWith('motif-'));
  classes.forEach(c=>document.body.classList.remove(c));
}
export async function applyStylePack(target, packId){
  const packs = await loadPacks();
  const pack = packs.find(p=>p.id===packId) || packs[0];
  if (!pack) return null;
  const pal = choosePalette(pack.palette);
  // Basic variables (palette.css can map these across the UI)
  setCSSVar('--accent', pal[0]);
  setCSSVar('--accent-2', pal[1] || pal[0]);
  setCSSVar('--ink', '#1a1a1a');
  setCSSVar('--panel', '#ffffff');
  setCSSVar('--wash', '#fff8e7');
  setCSSVar('--line', '#d9cfbf');
  // Textures (optional; safe if not present)
  if (pack.textures && pack.textures[0]) {
    document.body.style.backgroundImage = `url("${pack.textures[0]}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundBlendMode = 'soft-light';
  }
  // Motif class
  removePrevMotifs();
  if (pack.motifClass) document.body.classList.add(pack.motifClass);
  document.body.dataset.pack = pack.id;
  // Target hook (e.g., your #pillar)
  if (target) {
    target.dataset.pack = pack.id;
    target.style.setProperty('--glow', '0.35');
    target.style.setProperty('--accent', pal[0]);
  }
  // expose for global usage
  window.applyStylePack = window.applyStylePack || applyStylePack;
  return pack;
}
