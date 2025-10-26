# Duplicate Line Helper

This repo occasionally gains duplicate lines when commits are repeated. The `scripts/dedupe.js` tool trims consecutive duplicate lines in any file.

## Use

```bash

# clean specific files

npm run dedupe -- file1.md file2.js

# clean all tracked files

npm run dedupe -- $(git ls-files)

```text

The script rewrites a file only when duplicates are found. It is pure, offline, and depends on Node's built-in `fs` module.
