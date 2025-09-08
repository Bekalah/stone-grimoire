/*
  generate_ascii_header.js
  ND-safe static ASCII double-helix for README header.
  Uses numerology constants: height 22, width 99, twists 3.
*/

export function generateHelix(height = 22, width = 99, twists = 3) {
  const lines = [];
  for (let i = 0; i < height; i++) {
    const t = (i / (height - 1)) * Math.PI * twists - Math.PI / 2;
    const amp = width / 4;
    const center = width / 2;
    const x1 = Math.round(center + amp * Math.sin(t));
    const x2 = Math.round(center + amp * Math.sin(t + Math.PI));
    const row = Array.from({ length: width }, () => ' ');
    row[x1] = '0';
    row[x2] = '1';
    if (i % 2 === 0) {
      for (let j = Math.min(x1, x2) + 1; j < Math.max(x1, x2); j++) {
        row[j] = '-';
      }
    }
    lines.push(row.join(''));
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateHelix());
}
