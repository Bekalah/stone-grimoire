#!/usr/bin/env node

/**
 * STONE-GRIMOIRE MARKDOWN AUTOFIXER
 *
 * Automatically fixes recurrent markdownlint violations:
 * - MD032: Lists not surrounded by blank lines
 * - MD022: Headings not surrounded by blank lines
 * - MD031: Fenced code blocks not surrounded by blank lines
 * - MD040: Fenced code blocks without language specifiers
 * - MD001: Heading increment issues
 *
 * Usage: node scripts/fix-markdown-issues.mjs <file.md> [--dry-run]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { argv } from 'node:process';

// In pnpm scripts, arguments are passed differently
// Look for --dry-run flag and markdown file
const args = argv.slice(2);
const isDryRun = args.includes('--dry-run');
const filePath = args.find(arg => arg.endsWith('.md') && !arg.startsWith('--'));

if (!filePath) {
  console.error('\nUsage:');
  console.error('  Direct: node scripts/fix-markdown-issues.mjs <file.md> [--dry-run]');
  console.error('  Via pnpm: pnpm run fix-markdown <file.md> [--dry-run]');
  console.error('  Via pnpm (dry): pnpm run fix-markdown-dry <file.md>');
  console.error('\nExamples:');
  console.error('  node scripts/fix-markdown-issues.mjs README.md --dry-run');
  console.error('  pnpm run fix-markdown README_STONE_GRIMOIRE_MASTER.md');
  process.exit(1);
}

if (!filePath) {
  console.error('Usage: node scripts/fix-markdown-issues.mjs <file.md> [--dry-run]');
  console.error('Example: node scripts/fix-markdown-issues.mjs README_STONE_GRIMOIRE_MASTER.md --dry-run');
  process.exit(1);
}

function fixMarkdownIssues(content) {
  const lines = content.split('\n');
  const fixed = [];
  let changes = 0;

  function addBlankLine() {
    changes++;
    if (!isDryRun) console.log(`  + Added blank line at line ${fixed.length + 1}`);
  }

  function fixHeadingIncrement(line, i) {
    // Check MD001: Headings should increment by one level
    const match = line.match(/^(#+)\s/);
    if (match) {
      const level = match[1].length;
      let prevLevel = 0;

      // Look backward for previous heading level
      for (let j = fixed.length - 1; j >= 0; j--) {
        const prevMatch = fixed[j].match(/^(#+)\s/);
        if (prevMatch) {
          prevLevel = prevMatch[1].length;
          break;
        }
      }

      // If this jumps more than one level, add an intermediate level
      if (level > prevLevel + 1) {
        const intermediateLevel = '#'.repeat(prevLevel + 1);
        fixed.push(`${intermediateLevel} Section`);
        addBlankLine();
        changes++;
        if (!isDryRun) console.log(`  + Added intermediate heading level ${prevLevel + 1} at line ${fixed.length}`);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    const prevLine = fixed[fixed.length - 1] || '';

    // Skip empty lines for now
    if (line.trim() === '') {
      fixed.push(line);
      continue;
    }

    // MD031: Fenced code blocks should be surrounded by blank lines
    if (line.match(/^```/) && prevLine.trim() !== '') {
      fixed.push('');
      addBlankLine();
    }

    // MD040: Fenced code blocks should have language specifiers
    if (line.match(/^```$/)) {
      fixed.push('```text');
      changes++;
      if (!isDryRun) console.log(`  + Added 'text' language specifier to code block at line ${fixed.length + 1}`);
      continue;
    }

    // MD022: Headings should be surrounded by blank lines
    if (line.match(/^#+/) && prevLine.trim() !== '') {
      fixed.push('');
      addBlankLine();
    }

    fixHeadingIncrement(line, i);

    // Add the current line
    fixed.push(line);

    // MD032: Lists should be surrounded by blank lines
    const isList = line.match(/^[-\*\+]|\d+\./);
    const isLastLineOfList = isList && !nextLine.match(/^[-\*\+]|\d+\.|^\s+/);

    if (isList && !isLastLineOfList && nextLine.match(/^[^-\*\+0-9\s]/)) {
      // Next line starts something that's not a list or indented continuation
      fixed.push('');
      addBlankLine();
    }
  }

  // Final cleanup: ensure headers at end have blank lines if followed by content
  for (let i = 0; i < fixed.length - 1; i++) {
    if (fixed[i].match(/^#+/) && fixed[i + 1] !== '' && !fixed[i + 1].match(/^#+/)) {
      fixed.splice(i + 1, 0, '');
      addBlankLine();
      i++; // Skip the line we just added
    }
  }

  return [fixed.join('\n'), changes];
}

async function main() {
  try {
    console.log(`🔧 STONE-GRIMOIRE MARKDOWN AUTOFIXER`);
    console.log(`   Processing: ${filePath}`);
    if (isDryRun) console.log(`   DRY RUN: No changes will be written`);
    console.log('');

    const content = await readFile(filePath, 'utf8');
    const [fixed, changes] = fixMarkdownIssues(content);

    console.log(`✅ Processing complete:`);
    console.log(`   ${changes} fixes applied`);

    if (changes === 0) {
      console.log('   No issues found - your markdown is perfect!');
      return;
    }

    if (isDryRun) {
      console.log('\n📋 Dry run summary - see changes above');
      console.log('💡 Run without --dry-run to apply fixes');
    } else {
      await writeFile(filePath, fixed);
      console.log('\n💾 Changes written to file');
      console.log(`🔄 Run again to check for any remaining issues`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
