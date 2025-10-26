#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { argv, versions } from 'node:process';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Safety & Security
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const SAFE_EXTENSIONS = ['.md', '.markdown', '.MD', '.MARKDOWN'];

// Parse command line arguments securely
function parseArgs() {
  const args = argv.slice(2);
  let filePath = null;
  let isDryRun = false;
  let showHelp = false;
  let showVersion = false;

  for (const arg of args) {
    if (arg === '--dry-run' || arg === '-d') {
      isDryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--version' || arg === '-v') {
      showVersion = true;
    } else if (!arg.startsWith('--')) {
      // Check for path traversal attacks
      if (arg.includes('../') || arg.includes('..\\') || arg.startsWith('/')) {
        throw new Error('Path contains unsafe characters');
      }
      filePath = arg;
    }
  }

  return { filePath, isDryRun, showHelp, showVersion };
}

// Validate file path and access
function validateFilePath(filePath) {
  if (!filePath) {
    throw new Error('No file path provided');
  }

  // Resolve to absolute path to prevent relative path attacks
  const absolutePath = resolve(filePath);

  // Basic security checks
  if (absolutePath.includes('..')) {
    throw new Error('Path contains unsafe parent directory references');
  }

  const ext = extname(absolutePath);
  if (!SAFE_EXTENSIONS.some(safeExt => ext === safeExt)) {
    throw new Error(`File must have markdown extension (.md, .markdown). Got: ${ext || 'none'}`);
  }

  return absolutePath;
}

// Print help information
function printHelp() {
  console.log(`
🔥 MARKDOWN-FIXER v1.0.0

Kills markdownlint errors forever! Automatically fixes:
  - MD032: Lists missing blank lines
  - MD022: Headings missing blank lines
  - MD031: Code blocks missing blank lines
  - MD040: Code blocks missing language specifiers
  - MD001: Heading level jumps

USAGE:
  markdown-fixer <file.md> [options]

OPTIONS:
  --dry-run, -d    Preview changes without applying them
  --help, -h       Show this help message
  --version, -v    Show version information

EXAMPLES:
  markdown-fixer README.md
  markdown-fixer docs/**/*.md --dry-run
  markdown-fixer **/*.md

SECURITY:
  - Only processes .md/.markdown files
  - 10MB file size limit for safety
  - Path traversal protection
  - Automatic backup creation
  - Zero external dependencies
`);
}

// Print version
function printVersion() {
  console.log(`MARKDOWN-FIXER v1.0.0`);
  console.log(`Node.js ${versions.node}`);
}

// Main argument parsing
const { filePath, isDryRun, showHelp, showVersion } = parseArgs();

if (showHelp) {
  printHelp();
  process.exit(0);
}

if (showVersion) {
  printVersion();
  process.exit(0);
}

// Validate and resolve the file path
let validatedPath;
try {
  validatedPath = validateFilePath(filePath);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  printHelp();
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

// File operation utilities
async function checkFileAccess(filePath) {
  try {
    await readFile(filePath, { encoding: 'utf8' });
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${basename(filePath)}`);
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission denied: Cannot read ${basename(filePath)}`);
    } else {
      throw new Error(`File access error: ${error.message}`);
    }
  }
}

async function createBackup(filePath, content) {
  const backupDir = dirname(filePath);
  const backupPath = resolve(backupDir, `${basename(filePath, extname(filePath))}.backup.md`);

  console.log(`💾 Creating backup: ${basename(backupPath)}`);
  await writeFile(backupPath, content, 'utf8');
  return backupPath;
}

async function main() {
  try {
    console.log(`🔧 STONE-GRIMOIRE MARKDOWN PERFECTER v1.0.0`);
    console.log(`   File: ${basename(validatedPath)}`);
    console.log(`   Path: ${dirname(validatedPath)}`);
    if (isDryRun) console.log(`   Mode: DRY RUN (no changes will be written)`);
    else console.log(`   Mode: LIVE FIX (changes will be applied)`);

    // Check file access and size
    await checkFileAccess(validatedPath);

    const content = await readFile(validatedPath, 'utf8');

    // Check file size for safety
    if (Buffer.byteLength(content, 'utf8') > MAX_FILE_SIZE) {
      throw new Error(`File too large (> ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB). Aborting for safety.`);
    }

    console.log(`   Size: ${Buffer.byteLength(content, 'utf8')} bytes`);
    console.log('');

    // Create backup before making changes
    let backupPath = null;
    if (!isDryRun) {
      try {
        backupPath = await createBackup(validatedPath, content);
        console.log('');
      } catch (backupError) {
        console.warn(`⚠️ Warning: Could not create backup: ${backupError.message}`);
        console.warn(`   Continuing without backup...`);
        console.log('');
      }
    }

    // Process the file
    const [fixedContent, changes] = fixMarkdownIssues(content);

    console.log(`📊 Results:`);
    console.log(`   ${changes} fixes applied`);

    if (changes === 0) {
      console.log('   ✨ Your markdown is already perfect!');
      if (backupPath) {
        console.log(`   (Backup unnecessary - no changes made)`);
      }
      return;
    }

    // Show summary and next steps
    if (isDryRun) {
      console.log('\n📋 DRY RUN COMPLETE');
      console.log('   Run without --dry-run to apply these fixes');
      console.log(`   Example: markdown-perfecter ${basename(validatedPath)}`);
    } else {
      try {
        await writeFile(validatedPath, fixedContent, 'utf8');
        console.log('\n✅ SUCCESS: Fixed markdown applied to file');
        if (backupPath) {
          console.log(`   📁 Backup saved: ${basename(backupPath)}`);
        }
        console.log(`   🔄 Recommended: Run again to verify no new issues were introduced`);
      } catch (writeError) {
        console.error(`❌ FAILED: Could not write to file: ${writeError.message}`);
        console.error(`   File may be read-only or locked by another process`);
        process.exit(1);
      }
    }

  } catch (error) {
    console.error(`❌ FATAL ERROR: ${error.message}`);
    console.error('\n💡 TIP: Use --help for usage information');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
