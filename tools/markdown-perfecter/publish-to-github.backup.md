# PUBLISHING STONE-GRIMOIRE MARKDOWN PERFECTER TO GITHUB

## 🚀 **QUICK PUBLISH VIA GITHUB (No NPM Required)**

### **Step 1: Commit the tool to GitHub**

```bash
git add tools/markdown-perfecter/
git commit -m "Add STONE-GRIMOIRE MARKDOWN PERFECTER tool"
git push origin main

```text

### **Step 2: Tag the release**

```bash
git tag v1.0.0-markdown-perfecter

git push origin v1.0.0-markdown-perfecter

```text

## 📦 **HOW OTHERS CAN INSTALL VIA GITHUB**

### **Direct GitHub Install (pnpm - preferred)**

```bash

# Global installation

pnpm add -g https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

# Local project installation

pnpm add https://github.com/Bekalah/stone-grimoire.git#tools/markdown-perfecter

```text

## Section
### **Via npx (one-time use)**

```bash

# Run without installing

npx https://github.com/Bekalah/stone-grimoire/tree/main/tools/markdown-perfecter README.md --dry-run
