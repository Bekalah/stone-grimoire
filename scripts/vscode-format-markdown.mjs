#!/usr/bin/env node

/**
 * MARKDOWN-FIXER VS Code Formatter Integration
 * Used as a format provider for VS Code formatOnSave
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Format stdin (when called by VS Code)
async function formatFromStdin() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString('utf8');

    // Apply our markdown fixing logic (simplified version for speed)
    const fixed = fixMarkdownIssues(input);

    // Output to stdout (goes back to VS Code)
    process.stdout.write(fixed);
    process.exit(0);
  } catch (error) {
    process.stderr.write(`ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

// Simplified, fast version for real-time formatting
function fixMarkdownIssues(content) {
  const lines = content.split('\n');
  const fixed = [];
  let changes = 0;

  function addBlankLine() {
    changes++;
  }

  function fixHeadingIncrement(line, i) {
    const match = line.match(/^(#+)\s/);
    if (match) {
      const level = match[1].length;
      let prevLevel = 0;

      for (let j = fixed.length - 1; j >= 0; j--) {
        const prevMatch = fixed[j].match(/^(#+)\s/);
        if (prevMatch) {
          prevLevel = prevMatch[1].length;
          break;
        }
      }

      if (level > prevLevel + 1) {
        const intermediateLevel = '#'.repeat(prevLevel + 1);
        fixed.push(`${intermediateLevel} Section`);
        addBlankLine();
        changes++;
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let nextLine = lines[i + 1] || '';

    // MD012: Multiple consecutive blank lines
    const prevLine = fixed[fixed.length - 1];
    if (line.trim() === '' && prevLine === '') {
      continue;
    }

    // MD023: Headings must start at line beginning
    if (line.match(/^\s+#+/)) {
      fixed.push(line.trimStart());
      continue;
    }

    // MD026: Trailing punctuation in headers
    const headingMatch = line.match(/^(#+)(.+?)([!?.,]?)\s*$/);
    if (headingMatch && headingMatch[3]) {
      fixed.push(`${headingMatch[1]}${headingMatch[2]}`);
      continue;
    }

    if (line.trim() === '') {
      fixed.push(line);
      continue;
    }

    // MD040: Code blocks need language specifiers
    if (line.match(/^```$/)) {
      fixed.push('```text');
      continue;
    }

    // MD022: Headings need blank lines before
    if (line.match(/^#+/) && prevLine && prevLine.trim() !== '' && !prevLine.match(/^```/)) {
      fixed.push('');
      addBlankLine();
    }

    // MD031: Code blocks need blank lines before
    if (line.match(/^```/) && prevLine && prevLine.trim() !== '' && !prevLine.match(/^```/)) {
      fixed.push('');
      addBlankLine();
    }

    // MD030: List marker spacing
    const listMatch = line.match(/^(\s*)([-\*\+]|\d+\.)(\s+)(.+)$/);
    if (listMatch && listMatch[3] !== ' ') {
      fixed.push(`${listMatch[1]}${listMatch[2]} ${listMatch[4]}`);
      continue;
    }

    // MD032: Lists need blank lines after
    const isList = line.match(/^[-\*\+]|\d+\./);
    const isLastLineOfList = isList && !nextLine.match(/^[-\*\+]|\d+\.|^\s+/);
    if (isList && !isLastLineOfList && nextLine.match(/^[^-\*\+0-9\s]/)) {
      fixed.push(line);
      return fixed.concat('\n', fixMarkdownIssues(lines.slice(i + 1).join('\n')).split('\n')).join('\n');
    }

    fixHeadingIncrement(line, i);
    fixed.push(line);
  }

  // Final cleanup
  for (let i = 0; i < fixed.length - 1; i++) {
    if (fixed[i].match(/^#+/) && fixed[i + 1] !== '' && !fixed[i + 1].match(/^#+/)) {
      fixed.splice(i + 1, 0, '');
      i++;
    }
  }

  return fixed.join('\n');
}

// Check if called as format provider (stdin)
if (process.argv.length === 3 && process.argv[2] === '--stdin') {
  formatFromStdin();
} else {
  console.log('MARKDOWN-FIXER VS Code Formatter');
  console.log('Usage: Call with --stdin flag for VS Code integration');
  process.exit(1);
}
