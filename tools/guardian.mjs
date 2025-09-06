// Simple local scanner to catch forbidden patterns (run: node tools/guardian.mjs)
import fs from 'fs'; import path from 'path';
const ROOT = process.cwd();
const BANNED = [
  /from\s+PIL\b/i, /import\s+PIL\b/i, // Pillow
  /requestAnimationFrame\s*\(/i, /\@keyframes\b/i, /\banimation\s*:/i, /\bautoplay\b/i, // motion
  /\/\.github\/workflows\//i // actions (path hint)
];
const SKIP = new Set(['.git','node_modules','.github/workflows']);
let bad = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    if(SKIP.has(name)) continue;
    const p = path.join(dir,name);
    const st = fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else {
      const ext = path.extname(name).toLowerCase();
      if(['.md','.html','.css','.js','.mjs','.json','.py','.yml','.yaml','.svg'].includes(ext)){
        const txt = fs.readFileSync(p,'utf8');
        for(const rule of BANNED){ if(rule.test(txt)) { bad.push(p); break; } }
      }
    }
  }
}
walk(ROOT);
if(bad.length){
  console.error('Forbidden patterns found in:\n' + bad.map(p=>' - '+p).join('\n'));
  process.exit(1);
}else{
  console.log('Guardian check passed (no forbidden patterns).');
}
