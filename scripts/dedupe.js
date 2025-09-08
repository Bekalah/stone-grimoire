// dedupe.js
// Remove consecutive duplicate lines from files.
// ND-safe: no file is altered unless duplicates are found; calm output.
import { readFileSync, writeFileSync } from 'fs';

function dedupeLines(text) {
  // Small pure function: strips consecutive duplicate lines.
  const lines = text.split('\n');
  const result = [];
  let prev = null;
  for (const line of lines) {
    if (line !== prev) {
      result.push(line);
    }
    prev = line;
  }
  return result.join('\n');
}

function dedupeFile(path) {
  const original = readFileSync(path, 'utf8');
  const cleaned = dedupeLines(original);
  if (cleaned !== original) {
    writeFileSync(path, cleaned, 'utf8');
    console.log(`deduped ${path}`);
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: node scripts/dedupe.js <file> [file...]');
  process.exit(1);
}

for (const file of files) {
  dedupeFile(file);
}
