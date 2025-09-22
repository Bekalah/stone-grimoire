#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../');
const artRoot = path.join(root, 'assets', 'art');
const inbox = path.join(artRoot, 'inbox');
const originals = path.join(artRoot, 'originals');
const processed = path.join(artRoot, 'processed');
const thumbs = path.join(artRoot, 'thumbs');
const webpDir = path.join(artRoot, 'webp');

[originals, processed, thumbs, webpDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  console.log('sharp not found -- skipping webp/thumb generation');
}

const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

function safeReadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function ingestArt() {
  if (!fs.existsSync(inbox)) return [];
  const list = fs.readdirSync(inbox);
  const assets = [];

  for (const file of list) {
    const ext = path.extname(file).toLowerCase();
    if (!allowedExtensions.has(ext)) continue;

    const source = path.join(inbox, file);
    const safeName = file
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/-+/g, '-');

    const originalPath = path.join(originals, safeName);
    fs.renameSync(source, originalPath);

    const processedPath = path.join(processed, safeName);
    fs.copyFileSync(originalPath, processedPath);

    const isRaster = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    let thumbPath = '';
    let webpPath = '';

    if (sharp && isRaster) {
      const base = safeName.replace(ext, '');
      thumbPath = `assets/art/thumbs/${base}-512.jpg`;
      webpPath = `assets/art/webp/${base}.webp`;
      try {
        await sharp(originalPath)
          .removeAlpha()
          .resize({ width: 512, withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .toFile(path.join(thumbs, `${base}-512.jpg`));
      } catch {}
      try {
        await sharp(originalPath)
          .webp({ quality: 82 })
          .toFile(path.join(webpDir, `${base}.webp`));
      } catch {}
    }

    assets.push({
      name: safeName,
      type: ext.slice(1),
      original: `assets/art/originals/${safeName}`,
      processed: `assets/art/processed/${safeName}`,
      thumb: thumbPath,
      webp: webpPath,
      nd_safe: true
    });
  }

  return assets;
}

function buildRooms(structureJSON) {
  const fallback = [
    { id: 'crypt', title: 'The Crypt', element: 'earth', stylepack: 'Rosicrucian Black', tone: 110, geometry: 'vesica' },
    { id: 'nave', title: 'The Nave', element: 'air', stylepack: 'Angelic Chorus', tone: 222, geometry: 'rose-window' },
    { id: 'apprentice_pillar', title: 'Apprentice Pillar', element: 'water', stylepack: 'Hilma Spiral', tone: 333, geometry: 'fibonacci' },
    { id: 'respawn_gate', title: 'Respawn Gate', element: 'fire', stylepack: 'Alchemical Bloom', tone: 432, geometry: 'merkaba' }
  ];

  if (!structureJSON || !Array.isArray(structureJSON.rooms) || !structureJSON.rooms.length) {
    return fallback;
  }
  return structureJSON.rooms;
}

function assetEntry(asset) {
  return {
    name: asset.name,
    src: `/${asset.processed}`,
    thumb: asset.thumb ? `/${asset.thumb}` : '',
    webp: asset.webp ? `/${asset.webp}` : '',
    type: asset.type
  };
}

async function main() {
  const assets = await ingestArt();

  const structureJSON =
    safeReadJSON(path.resolve(root, 'structure.json')) ||
    safeReadJSON(path.resolve(root, '../structure.json'));

  const styleTokens = safeReadJSON(path.resolve(root, 'assets', 'tokens', 'perm-style.json')) || {};

  const rooms = buildRooms(structureJSON);
  const assetsByRoom = {};
  const creatures = { dragons: [], daimons: [] };
  const visionaryAssets = [];

  const classify = (asset) => {
    const name = asset.name.toLowerCase();
    if (/crypt/.test(name)) return 'crypt';
    if (/nave/.test(name)) return 'nave';
    if (/apprentice|pillar/.test(name)) return 'apprentice_pillar';
    if (/respawn|gate/.test(name)) return 'respawn_gate';
    return 'misc';
  };

  for (const asset of assets) {
    const tag = classify(asset);
    (assetsByRoom[tag] ||= []).push(asset);

    const lower = asset.name.toLowerCase();
    if (/dragon/.test(lower)) {
      creatures.dragons.push({
        id: asset.name.replace(/\..+$/, ''),
        title: 'Dragon',
        frame_class: 'lava-brim obsidian-sculpt obsidian-glint obsidian-facets visionary-grid',
        seal_filter: 'obsidianSheen',
        src: `/${asset.processed}`,
        thumb: asset.thumb ? `/${asset.thumb}` : '',
        webp: asset.webp ? `/${asset.webp}` : ''
      });
    }
    if (/daimon/.test(lower)) {
      creatures.daimons.push({
        id: asset.name.replace(/\..+$/, ''),
        title: 'Daimon',
        frame_class: 'raku-seal obsidian-sculpt visionary-grid',
        seal_filter: 'rakuCopperIridescence',
        src: `/${asset.processed}`,
        thumb: asset.thumb ? `/${asset.thumb}` : '',
        webp: asset.webp ? `/${asset.webp}` : ''
      });
    }
    if (/alex[-_ ]?grey|visionary|sacred|grid/.test(lower)) {
      visionaryAssets.push(assetEntry(asset));
    }
  }

  const cgDataRoots = [
    path.resolve(root, '../../cosmogenesis_learning_engine/assets/data'),
    path.resolve(root, '../../cosmogenesis-learning-engine/assets/data')
  ];
  const cgDataRoot = cgDataRoots.find((dir) => fs.existsSync(dir)) || cgDataRoots[1];
  const angels72 = safeReadJSON(path.join(cgDataRoot || '', 'angels72.json')) || [];

  const manifest = {
    meta: {
      project: 'circuitum99 × Stone Grimoire',
      updated: new Date().toISOString(),
      nd_safe: true,
      generator: 'update-art.js'
    },
    tokens: {
      css: '/assets/css/perm-style.css',
      json: '/assets/tokens/perm-style.json',
      palette: styleTokens.palette || {},
      secondary: styleTokens.secondary || {},
      layers: styleTokens.layers || {},
      adventure_modes: styleTokens.adventure_modes || {},
      avalon: styleTokens.avalon || {},
      between_realm: styleTokens.between_realm || {}
    },
    routes: {
      stone_grimoire: { base: '/', chapels: '/chapels/', assets: '/assets/', bridge: '/bridge/c99-bridge.json' },
      cosmogenesis: { tokens: '/c99/tokens/perm-style.json', css: '/c99/css/perm-style.css', public: '/c99/', bridge: '/bridge/c99-bridge.json' }
    },
    rooms: rooms.map((room) => ({
      id: room.id,
      title: room.title,
      element: room.element,
      tone: room.tone,
      geometry: room.geometry,
      stylepack: room.stylepack,
      assets: (assetsByRoom[room.id] || []).map(assetEntry)
    })),
    creatures,
    visionary: { overlays: visionaryAssets },
    rituals: styleTokens.rituals || {},
    assets: assets.map(assetEntry)
  };

  manifest.angels = { list: [], assets: [] };
  if (Array.isArray(angels72) && angels72.length) {
    manifest.angels.list = angels72.slice(0, 12).map((angel, index) => ({
      id: angel.id || `angel-${index + 1}`,
      name: angel.name || angel.shem || `Shem-${index + 1}`,
      virtue: angel.virtue || angel.keyword || '',
      gate: angel.gate || index + 1,
      seal: ''
    }));
  }

  function collect(regex, css) {
    return assets
      .filter((asset) => regex.test(asset.name))
      .map((asset) => ({
        id: asset.name.replace(/\..*$/, ''),
        name: asset.name,
        css,
        src: `/${asset.processed}`,
        thumb: asset.thumb ? `/${asset.thumb}` : '',
        webp: asset.webp ? `/${asset.webp}` : ''
      }));
  }

  // Merge helper block
  manifest.adventure = Object.assign({}, styleTokens.adventure_modes || {}, manifest.adventure || {});
  manifest.avalon = manifest.avalon || styleTokens.avalon || null;
  manifest.between_realm = manifest.between_realm || styleTokens.between_realm || null;

  const respawnSteps =
    (styleTokens?.rituals?.respawn_gate && styleTokens.rituals.respawn_gate.steps) ||
    styleTokens?.rituals?.violet_flame_steps ||
    ['Invoke', 'Rotate', 'Transmute', 'Replace'];

  manifest.respawn_gate = Object.assign({}, manifest.respawn_gate, {
    alias: (styleTokens?.rituals?.respawn_gate && styleTokens.rituals.respawn_gate.alias) || 'violet_flame_gate',
    ray: (styleTokens?.rituals?.respawn_gate && styleTokens.rituals.respawn_gate.ray) ?? 6,
    optional: true,
    steps: respawnSteps,
    style: Object.assign({ class: 'respawn-gate', layer: 'respawnGate' }, (manifest?.respawn_gate && manifest.respawn_gate.style) || {})
  });

  manifest.oracle_art = collect(/oracle|luminous|gonz|velvet/i, 'oracle-velvet luminous-heart');
  manifest.angel_seals = collect(/angel|shem|seal|consecrate/i, 'consecration-angel');
  manifest.pillar_art = collect(/pillar|column|left|right|middle/i, 'egregore-card');

  const egregoreArt = collect(/egregore|eg-|arcana-|tarot-/i, 'egregore-card gonz-velvet');
  manifest.egregores = manifest.egregores || { schema: styleTokens.egregores?.schema || {}, list: [] };
  manifest.egregores.list = (manifest.egregores.list || []).concat(
    egregoreArt.map((entry) => ({
      id: entry.id,
      title: entry.id.replace(/[-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      domain: 'oracle',
      pillar: null,
      ray: styleTokens.egregores?.defaults?.ray ?? 6,
      solfeggio: 528,
      angel: null,
      tarot: null,
      color: null,
      css: entry.css,
      art: entry
    }))
  );

  if (Array.isArray(angels72) && angels72.length) {
    manifest.angels = Object.assign({}, manifest.angels, {
      consecration: angels72.map((angel, index) => ({
        id: angel.id || `angel-${index + 1}`,
        name: angel.name || angel.shem || `Shem-${index + 1}`,
        virtue: angel.virtue || angel.keyword || '',
        seal: (assets.find((asset) => asset.name.includes(String(index + 1).padStart(2, '0'))) || {}).processed || ''
      }))
    });
  }

  const betweenAssets = collect(/between|liminal|narthex|veil|threshold/i, 'between-narthex');
  if (betweenAssets.length) {
    manifest.between_realm = manifest.between_realm || { id: 'in_between_astral', title: 'The Narthex Between', optional: true };
    manifest.between_realm.assets = (manifest.between_realm.assets || []).concat(betweenAssets);
    manifest.between_realm.style = manifest.between_realm.style || { class: 'between-narthex', layer: 'inBetweenVeil' };
  }

  const wardAssets = collect(/hamsa|evil[- ]?eye|protection[-_ ]?hand|rebecca[-_ ]?respawn[-_ ]?sigil/i, 'protection-handsigil visionary-grid');
  if (wardAssets.length) {
    manifest.protection = Object.assign({}, manifest.protection || {}, {
      sigil: {
        layer: 'protectionSigil',
        geometry: 'protection_hand',
        assets: wardAssets,
        css: 'protection-handsigil'
      },
      rite: styleTokens.rituals?.witch_as_coven_protection || null
    });
  }

  const bridgeRoot = path.resolve(root, '../../bridge');
  fs.mkdirSync(bridgeRoot, { recursive: true });
  fs.writeFileSync(path.join(bridgeRoot, 'c99-bridge.json'), JSON.stringify(manifest, null, 2));
  console.log('Bridge manifest written: /bridge/c99-bridge.json');

  const mirrorTargets = [
    path.resolve(root, '../../cosmogenesis_learning_engine/public/c99'),
    path.resolve(root, '../../cosmogenesis-learning-engine/public/c99')
  ];

  for (const target of mirrorTargets) {
    if (!fs.existsSync(target)) continue;
    fs.mkdirSync(path.join(target, 'tokens'), { recursive: true });
    fs.mkdirSync(path.join(target, 'css'), { recursive: true });
    fs.copyFileSync(path.resolve(root, 'assets', 'tokens', 'perm-style.json'), path.join(target, 'tokens', 'perm-style.json'));
    fs.copyFileSync(path.resolve(root, 'assets', 'css', 'perm-style.css'), path.join(target, 'css', 'perm-style.css'));
    console.log('Mirrored tokens+css to C99/public:', target);
  }

  console.log('Art ingest complete. ND-safe ✓');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
