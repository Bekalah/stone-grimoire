#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Characters to flag: smart quotes, en/em dashes, ellipsis
const BAD_CHARS = /[\u2018\u2019\u201C\u201D\u2013\u2014\u2026]/;
// File extensions to scan
const EXTENSIONS = new Set(['.js', '.json', '.py', '.css']);

let found = false;

function checkFile(file) {
  const data = fs.readFileSync(file, 'utf8');
  data.split(/\n/).forEach((line, idx) => {
    if (BAD_CHARS.test(line)) {
      console.log(`${file}:${idx + 1}: ${line}`);
      found = true;
    }
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'plans' || entry.name === 'node_modules' || entry.name === 'recovery') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      checkFile(full);
    }
  }
}

walk(path.resolve(process.cwd()));

if (found) {
  console.error('Typographic punctuation detected.');
  process.exit(1);
} else {
  console.log('No typographic punctuation found.');
}
