// assets/js/markdown-render.js
// Simple MD → HTML renderer (no external deps). Handles headings, bold/italic, lists, code blocks.
// For full fidelity later, you can swap to marked.js, but this is zero-dependency and safe for GH Pages.

export async function renderMarkdownPretty(url, targetSelector) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    const md = await res.text();
    el.innerHTML = mdToHtml(md);
  } catch (e) {
    el.innerHTML = `<pre class="md-fallback">${escapeHtml(String(e))}\n\nOpen raw: ${url}</pre>`;
  }
}

function mdToHtml(md) {
  // Protect code fences first
  const codeBlocks = [];
  const fenced = md.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.length;
    codeBlocks.push({ lang, code });
    return `@@CODEBLOCK_${i}@@`;
  });

  // Basic rules
  let html = fenced
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  // Lists
  html = html
    .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)(?!\s*<li>)/gs, "<ul>$1</ul>");

  // Paragraphs (simple)
  html = html
    .replace(/^(?!<h\d|<ul>|<li>|<pre>|<blockquote>|<\/li>|<\/ul>|<p>|<hr>|@@CODEBLOCK_).+$/gm, "<p>$&</p>");

  // Restore code blocks
  html = html.replace(/@@CODEBLOCK_(\d+)@@/g, (_, i) => {
    const { lang, code } = codeBlocks[Number(i)];
    return `<pre><code class="language-${lang || "text"}">${escapeHtml(code)}</code></pre>`;
  });

  return html;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}