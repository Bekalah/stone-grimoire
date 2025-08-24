// assets/js/markdown-render.js

// 1) Your original simple renderer (kept for compatibility)
export async function renderMarkdown(url, targetSel) {
  const res = await fetch(url);
  const md = await res.text();
  const target = document.querySelector(targetSel);
  target.innerHTML = "<pre>" + md.replace(/</g,"&lt;") + "</pre>";
}

// 2) Safe, minimal pretty renderer (headings, lists, code, links, blockquotes)
export async function renderMarkdownPretty(url, targetSel) {
  const res = await fetch(url);
  let md = await res.text();

  // Strip YAML front matter if present
  md = md.replace(/^---[\s\S]*?---\s*\n/, "");

  // Escape HTML
  md = md.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // Code blocks ```lang ... ```
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Headings #### ##
  md = md.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
         .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
         .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
         .replace(/^### (.*)$/gm, "<h3>$1</h3>")
         .replace(/^## (.*)$/gm, "<h2>$1</h2>")
         .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Blockquotes
  md = md.replace(/^\> (.*)$/gm, '<blockquote>$1</blockquote>');

  // Lists (ul/ol) – simple, safe pass
  // Convert list lines to <li>, then wrap contiguous blocks
  md = md.replace(/^(?:\s*[-*]\s+.*(?:\n|$))+?/gm, block => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^\s*[-*]\s+/, ''));
    return `<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>\n`;
  });
  md = md.replace(/^(?:\s*\d+\.\s+.*(?:\n|$))+?/gm, block => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^\s*\d+\.\s+/, ''));
    return `<ol>${items.map(i=>`<li>${i}</li>`).join('')}</ol>\n`;
  });

  // Links [text](url)
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs (wrap plain lines)
  md = md.replace(/^(?!<h\d|<ul>|<ol>|<li>|<pre>|<blockquote>|<\/)(.+)$/gm, '<p>$1</p>');

  const target = document.querySelector(targetSel);
  target.innerHTML = md;
}