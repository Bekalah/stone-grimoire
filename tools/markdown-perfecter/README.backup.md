# MARKDOWN-FIXER ⚡

**Kills markdownlint errors forever!** Instant bulk fixing for entire projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)

## ⚡ **Super Fast Usage**

```bash

# Fix all markdown files in project with one command

markdown-fixer **/*.md

# Or fix everything recursively

find . -name "*.md" -exec markdown-fixer {} \;

# Preview first (safe!)

markdown-fixer **/*.md --dry-run

```text

## 🛠️ **Installation**

### **Global (Recommended)**

```bash
pnpm add -g @bekalah/markdown-fixer
npm install -g @bekalah/markdown-fixer

```text

### **Direct from GitHub**

```bash
pnpm add -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

```text

### **One-time use**

```bash
npx @bekalah/markdown-fixer **/*.md

```text

## ✨ **What it auto-fixes**

- **MD032**: Lists missing blank lines
- **MD022**: Headings missing blank lines
- **MD031**: Code blocks missing blank lines
- **MD040**: Code blocks missing language specifiers
- **MD001**: Heading level jumps

## 🛡️ **Safety first**

- ✅ **Safe preview mode** - See changes before applying
- ✅ **Automatic backups** - Creates `.backup.md` files
- ✅ **Non-destructive** - Only adds lines, never removes content
- ✅ **Zero config** - Works out of the box
- ✅ **Zero dependencies** - Pure Node.js

## 🚀 **Real-world examples**

### **Before & After**

❌ **Problem:**

```markdown

## Features

- Feature 1
- Feature 2

```javascript
console.log('hello');

```text

```text

✅ **After MARKDOWN-FIXER:**

```markdown

## Features

- Feature 1
- Feature 2

```javascript
console.log('hello');

```text

```text

## 🔧 **Integration**

### **Git hooks** (auto-fix on commit)

```bash
echo "markdown-fixer **/*.md" > .git/hooks/pre-commit

```text

### **VS Code** (hotkey to fix current file)

```json
{
  "key": "ctrl+alt+m",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "markdown-fixer \"${file}\"\n" }
}

```text

### **Build scripts**

```json
{
  "scripts": {
    "fix-md": "markdown-fixer **/*.md",
    "check-md": "markdown-fixer **/*.md --dry-run"
  }
}

```text

## 🌟 **Perfect for**

- **Open source maintainers** - Keep docs pristine
- **Dev teams** - Enforce consistent markdown
- **Technical writers** - Never format manually again
- **Solo developers** - Focus on content, not linting

---

**"Manual markdown fixes? Never again."** ⚡

Made with ❤️ by [Rebecca Lemke (Bekalah)](https://github.com/Bekalah)
