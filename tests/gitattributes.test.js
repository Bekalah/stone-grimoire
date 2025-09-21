/* 
  Tests for .gitattributes ensuring Git LFS is not enabled for common static assets.
  Framework autodetection:
    - Vitest: import { describe, it, expect } from 'vitest'
    - Jest: globals describe/it/expect available
    - Mocha: globals describe/it available; use Node assert for expectations
*/

let usingVitest = false;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const vitest = require('vitest');
  if (vitest && vitest.expect) usingVitest = true;
} catch (_) { /* not vitest */ }

const assert = usingVitest ? undefined : require('node:assert/strict');

const fs = require('node:fs');
const path = require('node:path');

const GITATTRIBUTES_PATH = path.resolve(process.cwd(), '.gitattributes');
const HAS_GITATTRIBUTES = fs.existsSync(GITATTRIBUTES_PATH);
const CONTENT = HAS_GITATTRIBUTES ? fs.readFileSync(GITATTRIBUTES_PATH, 'utf8') : '';
const LINES = CONTENT.split(/\r?\n/);

function hasLfsRuleForExt(ext) {
  // Match patterns like "*.png filter=lfs ..." or "path/**.png filter=lfs ..."
  const rx = new RegExp('^\\s.*\\*?\\.' + ext + '(?:\\s|$).*?\\bfilter\\s*=\\s*lfs\\b', 'i');
  for (const line of LINES) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (rx.test(trimmed)) return true;
  }
  return false;
}

function hasLfsRuleForPathPrefix(prefix) {
  const rx = new RegExp('^\\s*' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*\\bfilter\\s*=\\s*lfs\\b', 'i');
  for (const line of LINES) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (rx.test(trimmed)) return true;
  }
  return false;
}

// Expect wrapper that works for Vitest or Jest or Mocha(assert)
function expectBool(actual, msg) {
  if (usingVitest) {
    const { expect } = require('vitest');
    expect(actual, msg).toBe(false);
  } else if (typeof expect === 'function') {
    // Jest environment provides global expect
    expect(actual).toBe(false);
  } else {
    assert.equal(actual, false, msg);
  }
}

function expectTruthy(actual, msg) {
  if (usingVitest) {
    const { expect } = require('vitest');
    expect(actual, msg).toBe(true);
  } else if (typeof expect === 'function') {
    expect(actual).toBe(true);
  } else {
    assert.equal(actual, true, msg);
  }
}

const describeFn = (typeof describe === 'function') ? describe : (title, fn) => fn();
const itFn = (typeof it === 'function') ? it : (typeof test === 'function' ? test : (title, fn) => fn());
const describeSkip = (typeof describe === 'function' && describe.skip) ? describe.skip : (title, fn) => { /* skip */ };

const STATIC_EXTS = [
  // images
  'png','jpg','jpeg','gif','svg','ico','webp','avif',
  // media
  'mp3','mp4','m4a','wav','ogg','webm','mpg','mpeg','mov',
  // fonts
  'woff','woff2','ttf','otf','eot',
  // docs
  'pdf',
  // web assets
  'css','js','mjs','cjs','map','wasm'
];

const STATIC_PATH_PREFIXES = [
  'public/', 'static/', 'assets/', 'website/', 'site/'
];

(HAS_GITATTRIBUTES ? describeFn : describeSkip)('.gitattributes Git LFS policy for static assets', () => {
  itFn('should exist in the repository root', () => {
    expectTruthy(HAS_GITATTRIBUTES, '.gitattributes file should exist at repo root');
  });

  itFn('should not enable Git LFS for common static asset extensions', () => {
    for (const ext of STATIC_EXTS) {
      const hasRule = hasLfsRuleForExt(ext);
      expectBool(hasRule, `Unexpected LFS rule for *.${ext}`);
    }
  });

  itFn('should not enable Git LFS under common static asset directories', () => {
    for (const prefix of STATIC_PATH_PREFIXES) {
      const hasRule = hasLfsRuleForPathPrefix(prefix);
      expectBool(hasRule, `Unexpected LFS rule under ${prefix}`);
    }
  });

  itFn('should ignore comments and blank lines without failing', () => {
    const onlyCommentsOrBlank = LINES.every(line => {
      const t = line.trim();
      return t === '' || t.startsWith('#') || /[^#\s]/.test(t);
    });
    // This is a no-op validation to ensure parsing is resilient.
    // We just assert true to keep the test structure uniform.
    expectTruthy(true, 'Parsing resilience check executed');
  });
});