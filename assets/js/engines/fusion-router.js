// assets/js/engines/fusion-router.js
// Data-driven fusion of numerology/Soyga, zodiac decans, 72 angels/daemons, and stylepacks.

import { setToneHz } from './ambient-engine.js';
import { applyStylepack } from '../effects/stylepack-apply.js';

let NUM=null, DEC=null, STY=null;

async function loadJSON(url){
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error("Failed to load "+url);
  return await r.json();
}

export async function ensureFusionMaps(){
  if (!NUM) NUM = await loadJSON('./assets/data/numerology_map.json');
  if (!DEC) DEC = await loadJSON('./assets/data/decans_72_map.json');
  if (!STY) STY = await loadJSON('./assets/data/style_matrix.json');
  return { NUM, DEC, STY };
}

function pickStyle(slug){ if (slug && STY?.stylepacks?.[slug]) applyStylepack(slug); }

export function resolveFusion(query){
  let hz = Number(query.hz)||null;
  let stylepack = query.stylepack || null;
  const meta = { name:'', element:'', stylepack: stylepack||'' };

  if (query.angelId && NUM?.entries){
    const e = NUM.entries.find(x => x.angel && (String(x.angel.id) === String(query.angelId)));
    if (e){ hz = hz || Number(e.toneHz)||null; stylepack = stylepack || e.stylepack; meta.name = e.angel.name; }
  }

  if ((query.decan && query.zodiac) && DEC?.decans){
    const d = DEC.decans.find(v => v.zodiac === query.zodiac && Number(v.decan) === Number(query.decan));
    if (d && d.angels && d.angels.length) meta.name = meta.name || d.angels[0].name;
  }

  if (query.pillar && NUM?.entries){
    const e = NUM.entries.find(x => x.pillar && x.pillar.toLowerCase() === String(query.pillar).toLowerCase());
    if (e){ hz = hz || Number(e.toneHz)||null; stylepack = stylepack || e.stylepack; }
  }

  if (stylepack) { pickStyle(stylepack); meta.stylepack = stylepack; }
  if (hz) setToneHz(hz, meta);
  return { hz, stylepack, meta };
}