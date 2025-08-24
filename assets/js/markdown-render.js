// assets/js/markdown-render.js
// ND-safe minimal Markdown renderer (same signature as your stub).
// Adds: headings, lists, blockquotes, code, links, dropcap, optional illuminated initial.
//
// Illuminated Initial conventions (optional):
// - If the FIRST paragraph begins with either "[*A*]" or "[[A]]" (any single letter),
//   that letter becomes <span class="illuminated">A</span> and the marker is removed.

export async function renderMarkdown(url, targetSel) {
  const target = document.querySelector(targetSel);
  if (!target) return;

  let md = '';
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    md = await res.text();
  } catch (e) {
    target.innerHTML = `<p>Could not load ${url}: ${String(e).replace(/[<>]/g,'')}</p>`;
    return;
  }

  // Strip YAML front matter if present
  md = md.replace(/^---[\s\S]*?---\s*/m, "");

  // Escape helper
  const esc = s => s.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

  // Fenced code blocks
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => `\n<pre><code>${esc(code)}</code></pre>\n`);

  // Inline code
  md = md.replace(/`([^`]+?)`/g, (_, code) => `<code>${esc(code)}</code>`);

  // Blockquotes
  md = md.replace(/^\s*>\s?(.*)$/gm, '<blockquote>$1</blockquote>');

  // Headings
  md = md.replace(/^######\s?(.*)$/gm,'<h6>$1</h6>')
         .replace(/^#####\s?(.*)$/gm,'<h5>$1</h5>')
         .replace(/^####\s?(.*)$/gm,'<h4>$1</h4>')
         .replace(/^###\s?(.*)$/gm,'<h3>$1</h3>')
         .replace(/^##\s?(.*)$/gm,'<h2>$1</h2>')
         .replace(/^#\s?(.*)$/gm,'<h1>$1</h1>');

  // Links [text](url)
  md = md.replace(/$begin:math:display$([^$end:math:display$]+)\]$begin:math:text$([^)]+)$end:math:text$/g, (_, t, u) =>
    `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`
  );

  // Unordered lists (collapse consecutive groups)
  md = md.replace(/(?:^|\n)(?:- .*(?:\n- .*)+)(?=\n|$)/g, block => {
    const items = block.trim().split('\n')
      .map(l => l.replace(/^- /,'').trim())
      .map(li => `<li>${li}</li>`).join('');
    return `\n<ul>${items}</ul>`;
  });

  // Ordered lists (collapse consecutive groups)
  md = md.replace(/(?:^|\n)(?:\d+\. .*(?:\n\d+\. .*)+)(?=\n|$)/g, block => {
    const items = block.trim().split('\n')
      .map(l => l.replace(/^\d+\.\s+/,'').trim())
      .map(li => `<li>${li}</li>`).join('');
    return `\n<ol>${items}</ol>`;
  });

  // Paragraph wrapping (don’t wrap known blocks)
  let html = md.split(/\n{2,}/).map(chunk => {
    const c = chunk.trim();
    if (!c) return '';
    if (/^<(h\d|ul|ol|pre|blockquote)/.test(c)) return c;
    return `<p>${c}</p>`;
  }).join('\n');

  // Inject into target
  target.innerHTML = html;

  // ---- Ornament layer: dropcap + illuminated initial on FIRST paragraph ----
  const firstP = target.querySelector('p');
  if (firstP) {
    // Add dropcap class (your CSS already styles .dropcap:first-letter)
    firstP.classList.add('dropcap');

    // Illuminated initial markers: [*A*] or [[A]] at very start
    const txt = firstP.innerHTML;

    // Pattern 1: [*A*]...
    let m = txt.match(/^$begin:math:display$\\*([A-Za-z])\\*$end:math:display$\s*/);
    if (m) {
      const letter = m[1];
      firstP.innerHTML = `<span class="illuminated">${letter}</span>` + txt.replace(/^$begin:math:display$\\*[A-Za-z]\\*$end:math:display$\s*/, '');
    } else {
      // Pattern 2: [[A]]...
      m = txt.match(/^$begin:math:display$\\[([A-Za-z])$end:math:display$\]\s*/);
      if (m) {
        const letter = m[1];
        firstP.innerHTML = `<span class="illuminated">${letter}</span>` + txt.replace(/^$begin:math:display$\\[[A-Za-z]$end:math:display$\]\s*/, '');
      }
    }
  }
}