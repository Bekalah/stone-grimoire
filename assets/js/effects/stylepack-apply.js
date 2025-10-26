// assets/js/effects/stylepack-apply.js
// Applies theme classes and CSS variables from style_matrix.json.

let _matrix = null;

async function loadMatrix(){
  if (_matrix) return _matrix;
  const r = await fetch("./assets/data/style_matrix.json", { cache:"no-store" });
  if (!r.ok) throw new Error("style_matrix.json not found");
  _matrix = await r.json();
  return _matrix;
}

function setVars(vars){
  const root = document.documentElement;
  Object.keys(vars||{}).forEach(k => {
    try { root.style.setProperty(k, String(vars[k])); } catch(_) {}
  });
}

export async function applyStylepack(slug){
  try{
    const m = await loadMatrix();
    const pack = m.stylepacks && m.stylepacks[slug];
    const body = document.body;
    Array.from(body.classList).filter(c => c.indexOf("theme-")===0).forEach(c => body.classList.remove(c));
    if (pack && slug) body.classList.add("theme-"+slug);
    if (pack && pack.vars) setVars(pack.vars);
  }catch(_){}
}