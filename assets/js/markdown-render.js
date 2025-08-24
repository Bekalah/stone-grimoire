// Minimal pretty Markdown renderer for Codex 144:99
// Features: strip YAML front matter, headings, paragraphs, lists, code fences,
// inline code, links, blockquotes. ND-safe (no autoplay, no scripts injected).

export async function renderMarkdownPretty(url, targetSel) {
  const res = await fetch(url, { cache: "no-cache" });
  const raw = await res.text();

  // 1) Strip simple YAML front matter (--- ... --- at file start)
  const md = raw.replace(/^---[\s\S]*?---\s*/m, "");

  // 2) Tokenize by lines
  const lines = md.replace(/\r\n/g, "\n").split("\n");

  // State
  let html = "";
  let inCode = false;
  let codeLang = "";
  let listMode = null; // "ul" | "ol"
  let inBlockquote = false;

  const esc = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const closeList = () => {
    if (listMode === "ul") html += "</ul>\n";
    if (listMode === "ol") html += "</ol>\n";
    listMode = null;
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      html += "</blockquote>\n";
      inBlockquote = false;
    }
  };

  // Inline transforms: code `x`, links [txt](url)
  const inline = (s) => {
    // escape first to avoid HTML injection
    s = esc(s);
    // inline code
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // links
    s = s.replace(
      /$begin:math:display$([^$end:math:display$]+)\]$begin:math:text$([^)]+)$end:math:text$/g,
      (_m, t, u) => `<a href="${u}">${t}</a>`
    );
    return s;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code fences ```lang?
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (!inCode) {
        inCode = true;
        codeLang = fence[1] || "";
        closeList();
        closeBlockquote();
        html += `<pre><code${codeLang ? ` class="lang-${esc(codeLang)}"` : ""}>`;
      } else {
        inCode = false;
        html += "</code></pre>\n";
      }
      continue;
    }

    if (inCode) {
      html += esc(line) + "\n";
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      closeBlockquote();
      const level = h[1].length;
      const text = inline(h[2].trim());
      html += `<h${level}>${text}</h${level}>\n`;
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const body = line.replace(/^\s*>\s?/, "");
      if (!inBlockquote) {
        closeList();
        inBlockquote = true;
        html += "<blockquote>\n";
      }
      html += `<p>${inline(body)}</p>\n`;
      continue;
    } else {
      // close blockquote when leaving
      if (inBlockquote && line.trim() === "") {
        closeBlockquote();
        continue;
      }
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const item = line.replace(/^\s*\d+\.\s+/, "");
      if (listMode !== "ol") {
        closeList();
        html += "<ol>\n";
        listMode = "ol";
      }
      html += `<li>${inline(item)}</li>\n`;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const item = line.replace(/^\s*[-*]\s+/, "");
      if (listMode !== "ul") {
        closeList();
        html += "<ul>\n";
        listMode = "ul";
      }
      html += `<li>${inline(item)}</li>\n`;
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      closeList();
      closeBlockquote();
      html += "\n";
      continue;
    }

    // Paragraph
    closeList();
    closeBlockquote();
    html += `<p>${inline(line)}</p>\n`;
  }

  // Final closures
  closeList();
  closeBlockquote();

  // Inject into target; add dropcap to first non-empty paragraph
  const target = document.querySelector(targetSel);
  if (!target) return;
  target.innerHTML = html;

  const firstP = target.querySelector("p");
  if (firstP && !firstP.classList.contains("dropcap")) {
    firstP.classList.add("dropcap");
  }
}