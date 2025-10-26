# STONE-GRIMOIRE MARKDOWN PERFECTER

**Automatically fixes recurrent markdownlint violations forever!** 🔧 ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-compatible-brightgreen.svg)](https://pnpm.io/)

## 🚀 **WHAT IT FIXES**

Permanently eliminates these common markdownlint violations:
- **MD032**: Lists not surrounded by blank lines
- **MD022**: Headings not surrounded by blank lines
- **MD031**: Fenced code blocks not surrounded by blank lines
- **MD040**: Fenced code blocks missing language specifiers
- **MD001**: Heading increment violations

## 💡 **WHY THIS MATTERS**

If you're like us and kept hitting the same markdown formatting issues over and over, this tool automatically detects and applies systematic fixes for all the recurrent violations that drove you crazy.

## 🛠️ **INSTALLATION**

### **Global Installation (Recommended)**

```bash
pnpm add -g @bekalah/stone-grimoire-markdown-fixer

# OR

npm install -g @bekalah/stone-grimoire-markdown-fixer

```text

## Section

### **Local Installation**

```bash
pnpm add -D @bekalah/stone-grimoire-markdown-fixer

# OR

npm install --save-dev @bekalah/stone-grimoire-markdown-fixer

```text

## Section

### **Direct GitHub Install**

```bash
pnpm add -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

# OR

npm install -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

```text

## 🎯 **USAGE**

### **Command Line Interface**

```bash

# See what would be fixed (SAFE PREVIEW)

markdown-perfecter README.md --dry-run
md-fix docs/*.md --dry-run

# Apply all fixes automatically

markdown-perfecter README.md
md-fix docs/guide.md

# Multiple files with glob patterns

markdown-perfecter **/*.md

```text

## Section

### **Via pnpm/npx**

```bash

# Dry run preview

pnpm dlx @bekalah/stone-grimoire-markdown-fixer README.md --dry-run
npx @bekalah/stone-grimoire-markdown-fixer README.md --dry-run

# Apply fixes

pnpm dlx @bekalah/stone-grimoire-markdown-fixer README.md
npx @bekalah/stone-grimoire-markdown-fixer README.md

```text

## Section

### **Package.json Scripts**

```json
{
  "scripts": {
    "fix-md": "markdown-perfecter **/*.md",
    "fix-md-dry": "markdown-perfecter **/*.md --dry-run",
    "lint-md": "markdownlint **/*.md || fix-md"
  }
}

```text

## 📋 **EXAMPLES**

```bash

# Fix README with preview first

markdown-perfecter README.md --dry-run
markdown-perfecter README.md

# Fix all markdown in docs/

markdown-perfecter docs/**/*.md

# Fix single file

md-fix CONTRIBUTING.md

# Preview what would be changed

stone-grimoire-md-fix CHANGELOG.md --dry-run

```text

## 🔧 **WORKFLOW INTEGRATION**

### **Git Hook (Auto-fix before commit)**

```bash

# .git/hooks/pre-commit

#!/bin/sh

markdown-perfecter **/*.md

```text

## Section

### **VS Code Task**

```json
// .vscode/tasks.json
{
  "tasks": [
    {
      "label": "Fix Markdown Issues",
      "command": "markdown-perfecter",
      "args": ["${file}"]
    }
  ]
}

```text

### **GitHub Actions**

```yaml

# .github/workflows/markdown-fixes.yml

name: Fix Markdown Issues
on: [push, pull_request]

jobs:
  markdown-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @bekalah/stone-grimoire-markdown-fixer
      - run: markdown-perfecter **/*.mc

```text

## 🎪 **WHAT IT DOES**

### **Before & After Examples**

**❌ List without blank lines:**

```markdown

## Features

- Feature 1
- Feature 2

```text

**✅ Automatically becomes:**

```markdown

## Features

- Feature 1
- Feature 2

```text

**❌ Code block without language:**

```markdown

```text
console.log('hello');

```text

```text

**✅ Automatically becomes:**

```markdown

```javascript
console.log('hello');

```text

```text

**❌ Heading without spacing:**

```markdown
Some content.

## Next Section

More content.

```text

**✅ Automatically becomes:**

```markdown
Some content.

## Next Section

More content.

```text

## 🛡️ **SAFETY FEATURES**

- **Dry-run mode**: Preview all changes before applying
- **Detailed logging**: See exactly what and where fixes are applied
- **Non-destructive**: Only adds lines, never removes content
- **Cross-platform**: Works on Windows, Mac, and Linux
- **Zero dependencies**: Uses only Node.js built-ins

## 🐛 **TROUBLESHOOTING**

### **"Command not found"**

Make sure the tool is installed globally:

```bash
pnpm add -g @bekalah/stone-grimoire-markdown-fixer

# Then restart your terminal

```text

## Section

### **Permission errors on Unix systems**

You might need to make the script executable:

```bash
chmod +x node_modules/.bin/markdown-perfecter

```text

### **Node.js version requirements**

Requires Node.js 18+ for ES modules support.

## 📈 **ROADMAP**

- [ ] Add more markdownlint rule fixes
- [ ] Support for custom configuration files
- [ ] Integration with markdownlint-cli2
- [ ] Prettier-style ignore comments
- [ ] GUI for visual diff preview

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 **LICENSE**

MIT License - see the [LICENSE](https://github.com/Bekalah/stone-grimoire/blob/main/LICENSE) file for details.

## 🙏 **CREDITS**

Created by [Rebecca Lemke (Bekalah)](https://github.com/Bekalah) as part of the Stone-Grimoire project.

Fund development: [GitHub Sponsors](https://github.com/sponsors/Bekalah)

---

**"Because manually fixing the same markdown errors over and over is soul-crushing. This tool fixes them forever."** ✨
