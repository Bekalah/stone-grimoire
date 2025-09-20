/**
 * Test suite: .gitattributes Git LFS policy
 *
 * Framework: Jest (describe/it/expect syntax).
 * Purpose: Validate that static assets are not tracked via Git LFS, per PR diff note:
 *   "# Git LFS disabled for static assets"
 *
 * These tests read the repo's .gitattributes and assert policy decisions:
 *  - File exists and is readable
 *  - Contains the documentation comment
 *  - No static asset globs map to LFS filters
 *  - If LFS filters exist, they do not include the static extensions list
 */

const fs = require('fs');
const path = require('path');

const GITATTRIBUTES_PATH = path.resolve(process.cwd(), '.gitattributes');

const STATIC_EXTS = [
  'png','jpg','jpeg','gif','svg','webp','ico',
  'css','js','map',
  'woff','woff2','ttf','eot','otf',
  'mp4','mp3','webm','ogg','pdf'
];

// Build patterns like: *.png, *.jpg, etc.
const STATIC_GLOBS = STATIC_EXTS.map(ext => `*.${ext}`);

// Regex helpers
const LFS_ATTR_RE = /\b(filter|diff|merge)=lfs\b/;          // any LFS attribute
const LFS_LINE_RE = /\bfilter=lfs\b.*\b(diff|merge)=lfs\b|\b(diff|merge)=lfs\b.*\bfilter=lfs\b|\bfilter=lfs\b/;
const COMMENT_MARKER_RE = /Git LFS disabled for static assets/i;

function readGitattributesSafe() {
  if (!fs.existsSync(GITATTRIBUTES_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(GITATTRIBUTES_PATH, 'utf8');
  // Normalize CRLF/LF and drop trailing spaces for stable parsing
  return raw.split(/\r?\n/).map(l => l.replace(/\s+$/,''));
}

function parseAttributes(lines) {
  // Return array of {pattern, attrsRaw, line, lineNo}
  const entries = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    // Split by whitespace: first token is pattern, rest are attributes
    const parts = trimmed.split(/\s+/);
    const pattern = parts.shift();
    const attrsRaw = parts.join(' ');
    entries.push({ pattern, attrsRaw, line, lineNo: idx + 1 });
  });
  return entries;
}

describe('.gitattributes LFS policy for static assets', () => {
  it('should exist at repository root', () => {
    expect(fs.existsSync(GITATTRIBUTES_PATH)).toBe(true);
  });

  it('should be readable and not empty', () => {
    const lines = readGitattributesSafe();
    expect(Array.isArray(lines)).toBe(true);
    expect(lines && lines.length).toBeGreaterThan(0);
  });

  it('should include a documentation comment indicating static assets are not using LFS', () => {
    const lines = readGitattributesSafe();
    expect(lines).not.toBeNull();
    const joined = lines.join('\n');
    expect(joined).toMatch(COMMENT_MARKER_RE);
  });

  it('should not map typical static asset globs to Git LFS filters', () => {
    const lines = readGitattributesSafe();
    expect(lines).not.toBeNull();
    const entries = parseAttributes(lines);

    // Find entries whose pattern matches any static glob or wildcard variants
    // We’ll check both exact matches like *.png and broader globs like *.{png,jpg}
    const offenders = [];

    for (const e of entries) {
      const p = e.pattern;
      // quick checks for exact *.ext globs
      if (STATIC_GLOBS.includes(p) && LFS_ATTR_RE.test(e.attrsRaw)) {
        offenders.push(e);
        continue;
      }
      // check brace expansions: *.{png,jpg,svg}
      const braceMatch = p.match(/^\*\.\{([^}]+)\}$/);
      if (braceMatch) {
        const exts = braceMatch[1].split(',').map(s => s.trim().toLowerCase());
        const intersects = exts.some(x => STATIC_EXTS.includes(x));
        if (intersects && LFS_ATTR_RE.test(e.attrsRaw)) {
          offenders.push(e);
          continue;
        }
      }
      // broad wildcard like *.*
      if (p === '*.*' && LFS_ATTR_RE.test(e.attrsRaw)) {
        // This is too broad and would capture static assets inadvertently
        offenders.push(e);
        continue;
      }
      // directory patterns like public/** or assets/**
      if ((/^(public|assets|static|dist)\//i).test(p) && LFS_ATTR_RE.test(e.attrsRaw)) {
        offenders.push(e);
        continue;
      }
    }

    const explain = offenders.map(o => `line ${o.lineNo}: ${o.line}`).join('\n');
    expect(explain).toBe(''); // Fail with offender details if not empty
  });

  it('should allow LFS for non-static large binaries without catching static assets (if present)', () => {
    const lines = readGitattributesSafe();
    expect(lines).not.toBeNull();
    const entries = parseAttributes(lines);

    const lfsEntries = entries.filter(e => LFS_ATTR_RE.test(e.attrsRaw));
    if (lfsEntries.length === 0) {
      // No LFS usage at all; treat as pass
      expect(true).toBe(true);
      return;
    }

    // Verify none of the LFS patterns overlap with our static file extensions.
    const staticCaught = [];
    for (const e of lfsEntries) {
      const p = e.pattern;
      // Quick heuristics: if pattern is too broad, it might catch static assets.
      const couldCatchStatics =
        p === '*.*' ||
        p === '*' ||
        (/^\*\.\{[^}]+\}$/).test(p) && STATIC_EXTS.some(x => new RegExp(`\\b${x}\\b`, 'i').test(p)) ||
        STATIC_GLOBS.includes(p) ||
        (/^(public|assets|static|dist)\//i).test(p);

      if (couldCatchStatics) {
        staticCaught.push(e);
      }
    }

    const explain = staticCaught.map(o => `line ${o.lineNo}: ${o.line}`).join('\n');
    expect(explain).toBe(''); // Fail with details if any LFS patterns catch static assets
  });

  it('should not contain generic LFS attributes applied globally without exclusions', () => {
    const lines = readGitattributesSafe();
    expect(lines).not.toBeNull();
    const entries = parseAttributes(lines);

    // Global patterns we consider risky:
    // *.* or * with LFS attributes without a negation rule for static assets.
    const risky = entries.filter(e => (e.pattern === '*.*' || e.pattern === '*') && LFS_LINE_RE.test(e.attrsRaw));

    // Look for explicit negations for static assets, e.g.:
    // *.png -filter -diff -merge
    const hasNegationsForStatics = (pattern) => {
      // We're lenient: any negative attribute line for a static glob means exclusions exist.
      return lines.some(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return false;
        // Check for each static glob with a leading '-' attribute
        return STATIC_GLOBS.some(glob => {
          return trimmed.startsWith(glob + ' ') && /(?:^|\s)-(?:filter|diff|merge)\b/.test(trimmed);
        });
      });
    };

    const offenders = risky.filter(e => !hasNegationsForStatics(e.pattern));
    const explain = offenders.map(o => `line ${o.lineNo}: ${o.line}`).join('\n');
    expect(explain).toBe('');
  });
});