let __PACKS;
async function loadPacks() {
  if (__PACKS) return __PACKS;
  const depth = location.pathname.split('/').length - 2;
  const url = ('../'.repeat(depth)) + 'assets/data/stylepacks.json';
  __PACKS = await (await fetch(url)).json();
  return __PACKS;
}
function setVar(n,v){ document.documentElement.style.setProperty(n, v); }
function removePrevMotifs(){ [...document.body.classList].filter(c=>c.startsWith('motif-')).forEach(c=>document.body.classList.remove(c)); }

export async function applyStylePack(target, packId){
  const packs = await loadPacks();
  const pack = packs.find(p=>p.id===packId) || packs[0];
  if (!pack) return null;
  const pal = pack.palette?.length ? pack.palette : ['#2f5a9e','#d4af37','#1a1a1a','#ffffff'];

  setVar('--accent', pal[0]); setVar('--accent-2', pal[1]||pal[0]);
  setVar('--ink', '#1a1a1a'); setVar('--panel', '#ffffff'); setVar('--wash', '#fff8e7'); setVar('--line', '#d9cfbf');

  if (pack.textures?.[0]) {
    document.body.style.backgroundImage = `url("${pack.textures[0]}")`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundBlendMode = 'soft-light';
  }

  removePrevMotifs();
  if (pack.motifClass) document.body.classList.add(pack.motifClass);
  document.body.dataset.pack = pack.id;
  if (target) target.dataset.pack = pack.id;

  window.applyStylePack = window.applyStylePack || applyStylePack;
  return pack;
}
