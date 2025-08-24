// Minimal, ND-safe Markdown → HTML renderer with pretty mode.
// Supports: headings, bold/italic, inline code, code blocks, lists, links, blockquotes.
// Strips YAML front matter. Escapes HTML by default to avoid injection.

function escapeHtml(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function stripFrontMatter(md){
  if (md.startsWith("---")) {
    const parts = md.split(/\n---\s*\n/);
    if (parts.length > 1) return parts.slice(1).join("\n---\n");
  }
  return md;
}

function mdToHtml(md){
  // Normalize line endings
  md = md.replace(/\r\n?/g,"\n");

  // Code fences (triple backticks)
  md = md.replace(/```([\s\S]*?)```/g, (m, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Blockquotes
  md = md.replace(/(^|\n)>\s?(.*)(?=\n|$)/g, (m, pre, text) => {
    return `${pre}<blockquote>${text}</blockquote>`;
  });

  // Headings #..######
  md = md.replace(/^(#{1,6})\s*(.+)$/gm, (m, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${escapeHtml(text)}</h${level}>`;
  });

  // Lists (unordered)
  // Merge consecutive lines into <ul><li>..</li></ul>
  md = md.replace(/(?:^|\n)(?:-|\*)\s+.+(?:\n(?:-|\*)\s+.+)*/g, block => {
    const items = block.trim().split("\n").map(line => {
      const txt = line.replace(/^(-|\*)\s+/, "");
      return `<li>${inline(txt)}</li>`;
    }).join("");
    return `\n<ul>${items}</ul>`;
  });

  // Ordered lists: 1. 2. ...
  md = md.replace(/(?:^|\n)\d+\.\s+.+(?:\n\d+\.\s+.+)*/g, block => {
    const items = block.trim().split("\n").map(line => {
      const txt = line.replace(/^\d+\.\s+/, "");
      return `<li>${inline(txt)}</li>`;
    }).join("");
    return `\n<ol>${items}</ol>`;
  });

  // Paragraphs (anything not already wrapped)
  // Split by blank lines, wrap in <p> unless starts with <h|<ul|<ol|<pre|<blockquote
  const chunks = md.split(/\n{2,}/).map(chunk => {
    const trimmed = chunk.trim();
    if (!trimmed) return "";
    if (/^<(h\d|ul|ol|pre|blockquote)/.test(trimmed)) return trimmed;
    return `<p>${inline(trimmed)}</p>`;
  }).join("\n");

  return chunks;

  // Inline transforms
  function inline(t){
    // links [text](url)
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) => {
      const safeUrl = escapeHtml(url);
      return `<a href="${safeUrl}">${escapeHtml(txt)}</a>`;
    });
    // bold **text**
    t = t.replace(/\*\*([^*]+)\*\*/g, (m, x) => `<strong>${escapeHtml(x)}</strong>`);
    // italics *text*
    t = t.replace(/\*([^*]+)\*/g, (m, x) => `<em>${escapeHtml(x)}</em>`);
    // inline code `x`
    t = t.replace(/`([^`]+)`/g, (m, x) => `<code>${escapeHtml(x)}</code>`);
    return t;
  }
}

export async function renderMarkdown(url, targetSel){
  const res = await fetch(url);
  const raw = await res.text();
  const md = stripFrontMatter(raw);
  const html = mdToHtml(md);
  const target = document.querySelector(targetSel);
  target.innerHTML = html;
}

export async function renderMarkdownPretty(url, targetSel){
  await renderMarkdown(url, targetSel);
  const host = document.querySelector(targetSel);
  // Apply dropcap to the first paragraph, if any
  const firstP = host.querySelector("p");
  if (firstP && !firstP.classList.contains("dropcap")) {
    firstP.classList.add("dropcap");
  }
  // Small ornament: add marginalia DIV if missing
  if (!host.querySelector(".marginalia")) {
    const vine = document.createElement("div");
    vine.className = "marginalia";
    vine.setAttribute("aria-hidden","true");
    host.prepend(vine);
  }
}