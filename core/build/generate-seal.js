#!/usr/bin/env node
import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(process.cwd(), 'stone-grimoire');
// Resolve project root whether directory uses underscore or hyphen
const ROOT = fs.existsSync(path.resolve(process.cwd(), 'stone_grimoire'))
  ? path.resolve(process.cwd(), 'stone_grimoire')
  : path.resolve(process.cwd(), 'stone-grimoire');
const TOKENS = path.join(ROOT, 'assets', 'tokens', 'perm-style.json');
const OUTDIR = path.join(ROOT, 'plans', 'seal');
const OUTFILE = path.join(OUTDIR, 'codex_abyssiae_monad_seal.svg');

// helpers
const loadJSON = p => { try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return null; } };
const ensure = p => fs.mkdirSync(p, { recursive:true });
const deg = a => a * Math.PI / 180;
const polar = (cx,cy,r,angleDeg) => [cx + r*Math.cos(deg(angleDeg)), cy + r*Math.sin(deg(angleDeg))];
const T = loadJSON(TOKENS) || { palette:{} };
const P = T.palette || {};
const C = (k, d='#ccc') => P[k] || d;

// datasets (fallbacks if not present)
const REG = path.resolve(ROOT,'../cosmogenesis_learning_engine/registry/datasets');
const SHEM = loadJSON(path.join(REG,'shem72.json')) || Array.from({length:72},(_,i)=>({id:i+1,name:`Shem-${i+1}`}));
// Simple placeholder names if missing:
const GOE = loadJSON(path.join(REG,'goetia72.json')) || Array.from({length:72},(_,i)=>({id:i+1,name:`Goetia-${i+1}`}));
const HEB = loadJSON(path.join(REG,'hebrew22.json')) || ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","כ","ל","מ","נ","ס","ע","פ","צ","ק","ר","ש","ת"];
const PLAN = loadJSON(path.join(REG,'planetary_archangels.json')) || [
  {name:"Michael", body:"Sol", glyph:"☉"},
  {name:"Raphael", body:"Mercury", glyph:"☿"},
  {name:"Gabriel", body:"Luna", glyph:"☾"},
  {name:"Uriel", body:"Earth", glyph:"🜨"},
  {name:"Haniel", body:"Venus", glyph:"♀"},
  {name:"Tzaphkiel", body:"Saturn", glyph:"♄"}
];

ensure(OUTDIR);

// geometry
const W=2400, H=2400, CX=W/2, CY=H/2;
const R_OUT=1060;            // 78-gate ring
const R_SHEM=900;            // 72+72 ring (alternating)
const R_BEADS=740;           // 33 beads
const R_HEX=500;             // hexagram radius
const R_VESICA=320;          // vesica enclosing monad+LuxCrux
const STROKE = 4;

// colors from perm-style
const INK   = C('bone','#f8f5ef');
const BG    = C('obsidian','#0b0b0b');
const EDGE  = C('obsidian_sheen','#191b22');
const GOLD  = C('gold','#c9a227');
const VIO   = C('violet','#460082');
const AZURE = C('raku_azure','#1F7AF3');
const COPPER= C('raku_copper','#b87333');
const SILV  = C('glint_silver','#d9e0e7');
const ASH   = C('smoke_gray','#6b6f76');
const OCTA  = '#7f00ff'; // octarine hint

// SVG buffer
let svg = [];
const push = s => svg.push(s);
const esc = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');

// base
push(`<?xml version="1.0" encoding="UTF-8"?>`);
push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Seal of Codex Abyssiae">`);
push(`<defs>
  <radialGradient id="bgGrad" cx="50%" cy="10%">
    <stop offset="0%" stop-color="${C('obsidian_rainbow','#33214e')}" stop-opacity="0.35"/>
    <stop offset="40%" stop-color="${C('obsidian_sheen','#191b22')}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${BG}" stop-opacity="1"/>
  </radialGradient>
  <filter id="softSpec"><feGaussianBlur stdDeviation="0.8"/><feComponentTransfer><feFuncA type="gamma" amplitude="0.9" exponent="1.3" offset="0"/></feComponentTransfer></filter>
</defs>`);

// background & subtle ring
push(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGrad)"/>`);
push(`<circle cx="${CX}" cy="${CY}" r="${R_OUT+60}" fill="none" stroke="${EDGE}" stroke-width="18"/>`);


// OUTER RING - 78 gates (22 Hebrew + 56 minors)
const GATES = 78, stepGate = 360/GATES;
for(let i=0;i<GATES;i++){
  const ang = -90 + i*stepGate;
  // gate notch
  const [x1,y1] = polar(CX,CY,R_OUT,ang);
  const [x2,y2] = polar(CX,CY,R_OUT-24,ang);
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SILV}" stroke-width="${STROKE}" />`);
  // labels: Hebrew letters on first 22, then simple minors (wands/cups/swords/coins marks)
  if(i<22){
    const [tx,ty] = polar(CX,CY,R_OUT-60,ang);
    push(`<text x="${tx}" y="${ty}" font-family="Junicode,serif" font-size="34" text-anchor="middle" fill="${INK}" transform="rotate(${ang} ${tx} ${ty})">${HEB[i]}</text>`);
  } else {
    const suits = ["🜍","🜄","🜁","🜃"]; // fire/water/air/earth
    const sym = suits[(i-22)%4];
    const [tx,ty] = polar(CX,CY,R_OUT-52,ang);
    push(`<text x="${tx}" y="${ty}" font-family="Junicode,serif" font-size="24" text-anchor="middle" fill="${ASH}" transform="rotate(${ang} ${tx} ${ty})">${sym}</text>`);
  }
}


// SECOND RING - 72 Shem alternating with 72 Goetia (144 ticks)
const marks = 144, stepMark = 360/marks;
for(let i=0;i<marks;i++){
  const a = -90 + i*stepMark;
  const isAngel = (i%2===0);
  const tickLen = isAngel ? 18 : 12;
  const color = isAngel ? AZURE : COPPER;
  const [m1,m2] = [polar(CX,CY,R_SHEM, a), polar(CX,CY,R_SHEM - tickLen, a)];
  push(`<line x1="${m1[0]}" y1="${m1[1]}" x2="${m2[0]}" y2="${m2[1]}" stroke="${color}" stroke-width="${isAngel?3:2}" />`);
  // names around (light, small, non-intrusive)
  if(i%6===0){ // every 6th label for legibility
    const idx = Math.floor(i/2)%72;
    const label = isAngel ? (SHEM[idx]?.name || `Shem-${idx+1}`) : (GOE[idx]?.name || `Goetia-${idx+1}`);
    const [tx,ty] = polar(CX,CY,R_SHEM-40, a);
    push(`<text x="${tx}" y="${ty}" font-family="Inter,system-ui" font-size="16" text-anchor="middle" fill="${isAngel?AZURE:COPPER}" opacity=".8" transform="rotate(${a} ${tx} ${ty})">${esc(label)}</text>`);
  }
}


// THIRD RING - 33 beads (alchemical sequence), Ars Notoria notae at 11/22/33
const BEADS = 33, stepB = 360/BEADS;
for(let i=0;i<BEADS;i++){
  const a = -90 + i*stepB;
  const [bx,by] = polar(CX,CY,R_BEADS, a);
  const color = (i<8) ? C('gonz_0','#0b0b0b') : (i<17) ? SILV : (i<26) ? C('amber','#FFC800') : C('crimson','#B7410E');
  push(`<circle cx="${bx}" cy="${by}" r="16" fill="${color}" stroke="${EDGE}" stroke-width="2"/>`);
  if(i===10||i===21||i===32){ // 11,22,33 markers
    push(`<circle cx="${bx}" cy="${by}" r="22" fill="none" stroke="${VIO}" stroke-width="3" filter="url(#softSpec)"/>`);
  }
}


// HEXAGRAM OF BLACK FLAMES - planetary archangels
const pts = [];
for(let k=0;k<6;k++){ pts.push(polar(CX,CY,R_HEX, -90 + k*60)); }
for(let k=0;k<6;k++){
  const [x1,y1] = pts[k];
  const [x2,y2] = pts[(k+2)%6]; // star connection
  push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C('gonz_1','#16121b')}" stroke-width="10"/>`);
}
// nodes + glyphs
PLAN.forEach((p,i)=>{
  const [px,py] = polar(CX,CY,R_HEX, -90 + i*60);
  push(`<circle cx="${px}" cy="${py}" r="22" fill="${C('gonz_2','#2a2140')}" stroke="${SILV}" stroke-width="3"/>`);
  push(`<text x="${px}" y="${py+8}" font-family="Junicode,serif" font-size="28" text-anchor="middle" fill="${INK}">${esc(p.glyph)}</text>`);
});


// CENTER - Vesica + Monad × LuxCrux fusion
push(`<g>
  <ellipse cx="${CX-80}" cy="${CY}" rx="${R_VESICA}" ry="${R_VESICA*0.82}" fill="none" stroke="${SILV}" stroke-width="6"/>
  <ellipse cx="${CX+80}" cy="${CY}" rx="${R_VESICA}" ry="${R_VESICA*0.82}" fill="none" stroke="${SILV}" stroke-width="6"/>
  <!-- Monad circle + point -->
  <circle cx="${CX}" cy="${CY}" r="190" fill="none" stroke="${GOLD}" stroke-width="10"/>
  <circle cx="${CX}" cy="${CY}" r="10" fill="${GOLD}"/>
  <!-- Crescent (Moon) -->
  <path d="M ${CX-40} ${CY-120} a 120 120 0 1 0 0 240 a 90 120 0 1 1 0 -240 Z" fill="${C('ink','#141414')}" stroke="${GOLD}" stroke-width="6"/>
  <!-- Cross (Earth/Body) -->
  <line x1="${CX-220}" y1="${CY}" x2="${CX+220}" y2="${CY}" stroke="${GOLD}" stroke-width="10"/>
  <line x1="${CX}" y1="${CY-220}" x2="${CX}" y2="${CY+220}" stroke="${GOLD}" stroke-width="10"/>
  <!-- Flame/Spirit -->
  <path d="M ${CX} ${CY-300} C ${CX-80} ${CY-180}, ${CX-40} ${CY-40}, ${CX} ${CY} C ${CX+40} ${CY-40}, ${CX+80} ${CY-180}, ${CX} ${CY-300} Z" fill="${OCTA}" fill-opacity=".28" stroke="${VIO}" stroke-width="5"/>
  <!-- LuxCrux overlay (your symbol) -->
  <circle cx="${CX}" cy="${CY}" r="250" fill="none" stroke="${AZURE}" stroke-width="4" stroke-opacity=".7"/>
  <path d="M ${CX-180} ${CY-180} L ${CX+180} ${CY+180} M ${CX+180} ${CY-180} L ${CX-180} ${CY+180}" stroke="${AZURE}" stroke-width="4" stroke-opacity=".7"/>
</g>`);

// HIDDEN SPIRAL — Soyga + Ars Notoria (faint)
const SOYGA = "ABHORSEMEM…SOYGA".split(''); // placeholder letter stream; replace if dataset exists

// HIDDEN SPIRAL - Soyga + Ars Notoria (faint)
const SOYGA = "ABHORSEMEM...SOYGA".split(''); // placeholder letter stream; replace if dataset exists
const turns = 3.5, ptsSpiral = 220, r0 = 260, r1 = 60;
for(let i=0;i<ptsSpiral;i++){
  const t = i/(ptsSpiral-1);
  const ang = -90 + t*(360*turns);
  const r = r0 - t*(r0 - r1);
  const [sx,sy] = polar(CX,CY,r,ang);
  if(i%14===0){
    const ch = SOYGA[(i/14)%SOYGA.length] || 'ᚠ';
    push(`<text x="${sx}" y="${sy}" font-family="Inter,system-ui" font-size="18" text-anchor="middle" fill="${VIO}" opacity=".18" transform="rotate(${ang} ${sx} ${sy})">${ch}</text>`);
  }
}

// BORDER RINGS
push(`<circle cx="${CX}" cy="${CY}" r="${R_OUT+20}" fill="none" stroke="${EDGE}" stroke-width="8"/>`);
push(`<circle cx="${CX}" cy="${CY}" r="${R_SHEM+24}" fill="none" stroke="${EDGE}" stroke-width="6"/>`);
push(`<circle cx="${CX}" cy="${CY}" r="${R_BEADS+24}" fill="none" stroke="${EDGE}" stroke-width="4"/>`);

push(`</svg>`);
fs.writeFileSync(OUTFILE, svg.join('\n'));
console.log("Seal written:", OUTFILE);
