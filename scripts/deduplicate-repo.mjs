import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

/*
  Deduplicate consecutive duplicate lines in all tracked text files.
  Usage: node scripts/deduplicate-repo.mjs
  The script scans files tracked by git and removes repeated lines
  that appear directly one after another. Binary files are skipped.
*/

// Return array of git-tracked file paths
function listFiles() {
  return execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
}

// Simple binary check: look for null byte
function isText(buffer) {
  return !buffer.includes('\0');
}

// Remove consecutive duplicate lines from a text string
function dedupe(text) {
  const lines = text.split('\n');
  const cleaned = lines.filter((line, idx) => idx === 0 || line !== lines[idx - 1]);
  return cleaned.join('\n');
}

const files = listFiles();
let changed = 0;

for (const file of files) {
  const buf = readFileSync(file);
  if (!isText(buf)) continue;
  const text = buf.toString('utf8');
  const result = dedupe(text);
  if (result !== text) {
    writeFileSync(file, result, 'utf8');
    console.log('deduplicated', file);
    changed++;
  }
}

if (changed === 0) {
  console.log('No duplicate lines found.');
} else {
  console.log(`Deduplicated ${changed} file(s).`);
}
