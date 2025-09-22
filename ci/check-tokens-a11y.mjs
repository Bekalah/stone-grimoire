#!/usr/bin/env node
import fs from 'node:fs';

const target = 'assets/tokens/perm-style.json';
const payload = JSON.parse(fs.readFileSync(target, 'utf8'));
const a11y = payload.a11y || {};
let ok = true;

if (typeof a11y.min_contrast !== 'number' || a11y.min_contrast < 4.5) {
  console.error('❌ min_contrast must be ≥ 4.5');
  ok = false;
}
if (a11y.autoplay !== false) {
  console.error('❌ autoplay must be false');
  ok = false;
}
if (a11y.strobe !== false) {
  console.error('❌ strobe must be false');
  ok = false;
}
if (!ok) process.exit(1);
console.log('✅ tokens a11y sane');
