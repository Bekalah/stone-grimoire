# MARKDOWN-FIXER: PUBLISHING & DISTRIBUTION GUIDE

**Make your markdown fixing tool available worldwide!** 🚀

## 🚀 **GIT PLACEMENT FIRST**

The tool must be committed to GitHub before it can be installed.

```bash
# Add the tool directory
git add tools/markdown-perfecter/

# Commit with descriptive message
git commit -m "Add MARKDOWN-FIXER v2.0 - Ultra-fast parallel markdown linting"

# Push to main branch
git push origin main
```

## 🏷️ **CREATE RELEASE TAG**

```bash
# Tag the exact release
git tag v2.0.0-markdown-fixer

# Push tags
git push origin v2.0.0-markdown-fixer
```

## 📦 **DISTRIBUTION METHODS**

### **Method 1: Direct GitHub Install (Recommended)**

Anyone can now install directly from GitHub:

```bash
# Global install (available anywhere)
pnpm add -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

# Local project install
pnpm add https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter
```

### **Method 2: NPM Publishing** (Future)

For future NPM registry publishing:

```bash
# Build and test
npm test
npm run build

# Publish to NPM
npm publish
```

### **Method 3: One-time Use**

Run immediately without installing:

```bash
# Preview fixes
npx https://github.com/Bekalah/stone-grimoire/tree/main/tools/markdown-perfecter README.md --dry-run

# Apply fixes
npx https://github.com/Bekalah/stone-grimoire/tree/main/tools/markdown-perfecter README.md
```

## 🛡️ **SECURITY NOTES**

- ✅ **No binaries** - Pure Node.js, cross-platform
- ✅ **Path validation** - Prevents directory traversal attacks
- ✅ **File size limits** - 10MB safety maximum
- ✅ **Backup creation** - Always creates `.backup.md` files

## 🎯 **READY FOR USE**

After GitHub publication, users can:

```bash
# Install globally
pnpm add -g @bekalah/markdown-fixer

# Fix entire projects instantly
markdown-fixer **/*.md

# Check what needs fixing
markdown-fixer **/*.md --dry-run
```

## 📬 **SHARING**

Share the tool with developers worldwide:

> "One command fixes all markdownlint errors forever: `pnpm add -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter`"

---

**"Making the world write better markdown, one project at a time!"** ⚡
