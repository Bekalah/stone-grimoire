#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const basePath = path.resolve('assets/tokens/perm-style.json');
const addPath = path.resolve('assets/tokens/perm-style.merge.json');

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJSON = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');

/**
 * Merge two values, preferring existing (base) values while filling missing entries from add.
 *
 * For arrays: returns `base` if it's non-empty, otherwise `add`.
 * For plain objects: returns a new object that contains all keys from `add` and `base` where `base` values take precedence; overlapping keys are merged recursively using the same rules.
 * For other types: returns `base` if it is defined (not null/undefined), otherwise `add`.
 *
 * This function does not mutate the input objects/arrays; it returns a new merged value for objects and returns original arrays/values as described.
 *
 * @param {*} base - The primary value whose existing entries should be kept when possible.
 * @param {*} add - The supplemental value used to fill in missing entries from `base`.
 * @return {*} The merged result.
 */
function mergeKeepExisting(base, add) {
  if (Array.isArray(base) && Array.isArray(add)) {
    return base.length ? base : add;
  }
  if (typeof base === 'object' && base && typeof add === 'object' && add) {
    const out = { ...add, ...base };
    for (const key of Object.keys(add)) {
      if (Object.prototype.hasOwnProperty.call(base, key)) {
        out[key] = mergeKeepExisting(base[key], add[key]);
      }
    }
    return out;
  }
  return base ?? add;
}

const base = fs.existsSync(basePath) ? readJSON(basePath) : {};
const add = fs.existsSync(addPath) ? readJSON(addPath) : {};

if (!Object.keys(add).length) {
  console.error('No merge JSON found. Aborting.');
  process.exit(1);
}

const merged = mergeKeepExisting(base, add);

merged.meta ??= {};
merged.meta.nd_safe = true;
merged.a11y ??= { min_contrast: 4.5, motion: 'reduce', autoplay: false, strobe: false };

const parts = String(merged?.meta?.version || '0.0.0').split('.');
if (parts.length === 3) {
  const patch = parseInt(parts[2], 10);
  parts[2] = Number.isNaN(patch) ? '1' : String(patch + 1);
  merged.meta.version = parts.join('.');
}

writeJSON(basePath, merged);
console.log('✅ perm-style.json merged (existing values preserved). New version:', merged.meta.version);
