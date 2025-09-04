#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../');
const ART = path.join(root, 'assets', 'art');
const inbox = path.join(ART, 'inbox'), originals = path.join(ART, 'originals'),
      processed = path.join(ART, 'processed'), thumbs = path.join(ART, 'thumbs'),
      webp = path.join(ART, 'webp');
[originals, processed, thumbs, webp].forEach(p => fs.mkdirSync(p, {recursive:true}));

let sharp = null; try { sharp = require('sharp'); } catch { console.log('sharp not found -- skipping webp/thumbs'); }
const allowed = new Set(['.png','.jpg','.jpeg','.webp','.svg']);

function safeReadJSON(p){
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return null; }
}

async function main(){
  const list = fs.existsSync(inbox) ? fs.readdirSync(inbox) : [];
  const assets = [];

  for (const file of list) {
    const src = path.join(inbox, file);
    const ext = path.extname(file).toLowerCase();
    if (!allowed.has(ext)) continue;
    const safe = file.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9._-]/g,'').replace(/-+/g,'-');
    const orig = path.join(originals, safe); fs.renameSync(src, orig);
    const proc = path.join(processed, safe); fs.copyFileSync(orig, proc);

    const isRaster = ['.png','.jpg','.jpeg','.webp'].includes(ext);
    let thumbPath = '', webpPath = '';
    if (sharp && isRaster) {
      const base = safe.replace(ext,'');
      thumbPath = `assets/art/thumbs/${base}-512.jpg`;
      webpPath  = `assets/art/webp/${base}.webp`;
      try { await sharp(orig).removeAlpha().resize({width:512,withoutEnlargement:true}).jpeg({quality:82}).toFile(path.join(thumbs, `${base}-512.jpg`)); } catch {}
      try { await sharp(orig).webp({quality:82}).toFile(path.join(webp, `${base}.webp`)); } catch {}
    }
    assets.push({
      name: safe, type: ext.slice(1),
      original: `assets/art/originals/${safe}`,
      processed:`assets/art/processed/${safe}`,
      thumb: thumbPath, webp: webpPath, nd_safe: true
    });
  }

  const sgStruct    = safeReadJSON(path.resolve(root,'structure.json')) || safeReadJSON(path.resolve(root,'../structure.json'));
  const angels72    = safeReadJSON(path.resolve(root,'../cosmogenesis-learning-engine/registry/datasets/angels72.json')) ||
                      safeReadJSON(path.resolve(root,'../cosmogenesis_learning_engine/registry/datasets/angels72.json')) ||
                      safeReadJSON(path.resolve(root,'../cosmogenesis_learning_engine/registry/datasets/shem72.json'));
  const styleTokens = safeReadJSON(path.resolve(root,'assets','tokens','perm-style.json')) || { palette:{}, secondary:{}, layers:{} };

  const defaultRooms = [
    { id:"crypt", title:"The Crypt", element:"earth", stylepack:"Rosicrucian Black", tone:110, geometry:"vesica" },
    { id:"nave", title:"The Nave", element:"air", stylepack:"Angelic Chorus", tone:222, geometry:"rose-window" },
    { id:"apprentice_pillar", title:"Apprentice Pillar", element:"water", stylepack:"Hilma Spiral", tone:333, geometry:"fibonacci" },
    { id:"respawn_gate", title:"Respawn Gate", element:"fire", stylepack:"Alchemical Bloom", tone:432, geometry:"merkaba" }
  ];
  const rooms = Array.isArray(sgStruct?.rooms) && sgStruct.rooms.length ? sgStruct.rooms : defaultRooms;

  function tagFor(a){
    if(/crypt/.test(a.name)) return 'crypt';
    if(/nave/.test(a.name)) return 'nave';
    if(/apprentice|pillar/.test(a.name)) return 'apprentice_pillar';
    if(/respawn|gate/.test(a.name)) return 'respawn_gate';
    return 'misc';
  }
  const assetsByRoom = {};
  for (const a of assets) {
    const t = tagFor(a); (assetsByRoom[t] ||= []).push(a);
  }

  let angels = [];
  if (Array.isArray(angels72)) {
    angels = angels72.slice(0, 12).map((x,i) => ({
      id: x.id || `angel-${i+1}`,
      name: x.name || x.shem || `Shem-${i+1}`,
      virtue: x.virtue || x.keyword || '',
      seal: (assets.find(a => a.name.includes((x.id || `${i+1}`).toString().padStart(2,'0')))||{}).processed || '',
      gate: x.gate || (i+1)
    }));
  }

  const creatures = { dragons:[], daimons:[] };
  const oracleVelvet=[], angelArt=[], pillarArt=[], egregoreArt=[], betweenRealmAssets=[], protectionSigils=[];
  const assetEntry = a => ({ name:a.name, src:`/${a.processed}`, thumb:a.thumb?`/${a.thumb}`:'', webp:a.webp?`/${a.webp}`:'', type:a.type });
  for (const a of assets) {
    const n = a.name.toLowerCase();
    if (/dragon/.test(n)) creatures.dragons.push({
      id:a.name.replace(/\..+$/,''),
      title:"Dragon",
      frame_class:"lava-brim obsidian-sculpt obsidian-glint obsidian-facets visionary-grid",
      seal_filter:"obsidianSheen",
      src:`/${a.processed}`, thumb:a.thumb?`/${a.thumb}`:'', webp:a.webp?`/${a.webp}`:''
    });
    if (/daimon/.test(n)) creatures.daimons.push({
      id:a.name.replace(/\..+$/,''),
      title:"Daimon",
      frame_class:"raku-seal obsidian-sculpt visionary-grid",
      seal_filter:"rakuCopperIridescence",
      src:`/${a.processed}`, thumb:a.thumb?`/${a.thumb}`:'', webp:a.webp?`/${a.webp}`:''
    });
    if (/oracle|velvet/.test(n)) oracleVelvet.push(assetEntry(a));
    if (/angel/.test(n)) angelArt.push(assetEntry(a));
    if (/pillar/.test(n)) pillarArt.push(assetEntry(a));
    if (/egregore/.test(n)) egregoreArt.push(assetEntry(a));
    if (/between|narthex|veil|threshold/.test(n)) betweenRealmAssets.push({ ...assetEntry(a), class:"between-narthex" });
    if (/hamsa|evil.?eye|logo|ward/.test(n)) protectionSigils.push({ ...assetEntry(a), class:"protection-handsigil", layer:"protectionSigil" });
  }

  const visionaryAssets = assets.filter(a => /alex[-_ ]?grey|visionary|sacred|grid/.test(a.name));

  const manifest = {
    meta:{ project:"Circuitum99 × Stone Grimoire", updated:new Date().toISOString(), nd_safe:true, generator:"update-art.js" },
    tokens:{ css:"/assets/css/perm-style.css", json:"/assets/tokens/perm-style.json",
      palette:styleTokens.palette||{}, secondary:styleTokens.secondary||{}, layers:styleTokens.layers||{},
      adventure_modes:styleTokens.adventure_modes||{}, avalon:styleTokens.avalon||{}, between_realm:styleTokens.between_realm||{} },
    routes:{
      stone_grimoire:{ base:"/", chapels:"/chapels/", assets:"/assets/", bridge:"/bridge/c99-bridge.json" },
      cosmogenesis:{ tokens:"/c99/tokens/perm-style.json", css:"/c99/css/perm-style.css", public:"/c99/", bridge:"/bridge/c99-bridge.json" }
    },
    rooms: rooms.map(r => ({
      id:r.id, title:r.title, element:r.element, tone:r.tone, geometry:r.geometry, stylepack:r.stylepack,
      assets:(assetsByRoom[r.id]||[]).map(a => ({ name:a.name, thumb:`/${a.thumb}`, webp:a.webp?`/${a.webp}`:'', src:`/${a.processed}`, type:a.type }))
    })),
    angels:{ list:angels, assets:angelArt },
    creatures,
    visionary:{ overlays: visionaryAssets.map(a => ({ name:a.name, src:`/${a.processed}`, thumb:a.thumb?`/${a.thumb}`:'', webp:a.webp?`/${a.webp}`:'' })) },
    oracle: oracleVelvet,
    pillars:{ assets:pillarArt },
    egregores:{ assets:egregoreArt },
    between_realm: Object.assign({}, styleTokens.between_realm||{}, { assets:betweenRealmAssets }),
    protection:{ sigil: protectionSigils },
    rituals: styleTokens.rituals || {},
    assets: assets.map(a => ({ name:a.name, src:`/${a.processed}`, thumb:a.thumb?`/${a.thumb}`:'', webp:a.webp?`/${a.webp}`:'', type:a.type }))
  };

  const bridgeRoot = path.resolve(root, '../../bridge');
  fs.mkdirSync(bridgeRoot, {recursive:true});
  fs.writeFileSync(path.join(bridgeRoot, 'c99-bridge.json'), JSON.stringify(manifest, null, 2));
  console.log("Bridge manifest written: /bridge/c99-bridge.json");

  try {
    const c99A = path.resolve(root, '../../cosmogenesis_learning_engine/public/c99');
    const c99B = path.resolve(root, '../../cosmogenesis-learning-engine/public/c99'); // alt hyphen
    for (const c99 of [c99A, c99B]) {
      if (fs.existsSync(c99)) {
        fs.mkdirSync(path.join(c99, 'tokens'), {recursive:true});
        fs.mkdirSync(path.join(c99, 'css'), {recursive:true});
        fs.copyFileSync(path.resolve(root,'assets','tokens','perm-style.json'), path.join(c99,'tokens','perm-style.json'));
        fs.copyFileSync(path.resolve(root,'assets','css','perm-style.css'), path.join(c99,'css','perm-style.css'));
        console.log("Mirrored tokens+css to C99/public:", c99);
      }
    }
  } catch(e) { console.warn("Mirror step skipped:", e.message); }

  console.log("Art ingest complete. ND-safe ✓");
}

main().catch(e => { console.error(e); process.exit(1); });