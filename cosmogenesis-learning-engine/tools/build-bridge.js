#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = (relative) => path.join(root, 'assets', 'data', relative);
const outDir = path.join(root, 'public', 'c99');
fs.mkdirSync(outDir, { recursive: true });

const readJSON = (relative) => {
  try {
    return JSON.parse(fs.readFileSync(dataPath(relative), 'utf8'));
  } catch {
    return null;
  }
};

const codex = readJSON('codex.144_99.json') || {};
const witch = readJSON('profiles/default.witch.json') || {};
const coven = readJSON('covens/default.coven.json') || {};
const pack = readJSON('packs/sample-world.pack.json') || {};

const tokensPath = path.join(outDir, 'tokens', 'perm-style.json');
const cssPath = path.join(outDir, 'css', 'perm-style.css');

const manifest = {
  meta: { project: 'Cosmogenesis Learning Engine', updated: new Date().toISOString(), nd_safe: true },
  routes: { tokens: '/c99/tokens/perm-style.json', css: '/c99/css/perm-style.css' },
  codex,
  witch,
  coven,
  pack,
  style: {
    tokens: fs.existsSync(tokensPath) ? '/c99/tokens/perm-style.json' : '',
    css: fs.existsSync(cssPath) ? '/c99/css/perm-style.css' : ''
  }
};

fs.writeFileSync(path.join(outDir, 'bridge.json'), JSON.stringify(manifest, null, 2));
console.log('Cosmogenesis bridge.json written');
