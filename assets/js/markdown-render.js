// Minimal pretty Markdown renderer (headings, lists, code, links) with safe paths.
// Auto-falls-back across ./, ../, ../../ to find the Markdown file.

const MD_BASES = ["./", "../", "../../", "../../../"];

function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function mdToHtml(md){
  // strip YAML front matter
  md = md.replace(/^---[\s\S]*?---\n/, "");

  // code fences
  md = md.replace(/```([\s\S]*?)```/g, (m, code)=> `<pre><code>${esc(code)}</code></pre>`);

  // headings
  md = md.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  md = md.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  md = md.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  md = md.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  md = md.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  md = md.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // bold / italics
  md = md.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // links [text](url)
  md = md.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, `<a href="$2">$1</a>`);

  // unordered lists
  md = md.replace(/(^|\n)\s*[-*]\s+(.+)(?=(\n[-*]\s+)|\n\n|$)/g, (m, start, item)=> `${start}<ul><li>${item}</li></ul>`);
  md = md.replace(/<\/ul>\s*<ul>/g, ""); // collapse adjacent

  // paragraphs (naive but workable)
  md = md.replace(/(^|\n)(?!<h\d|<ul>|<pre>|<\/li>|<\/ul>|<blockquote>)([^\n<][^\n]*)/g, (m, s, p)=> `${s}<p>${p}</p>`);

  return md;
}

export async function renderMarkdownPretty(url, targetSel){
  const target = document.querySelector(targetSel);
  if (!target) throw new Error("renderMarkdownPretty: target not found: "+targetSel);

  let text=null;
  for (const base of MD_BASES){
    try{
      const r = await fetch(base + url, { cache: "no-cache" });
      if (r.ok){ text = await r.text(); break; }
    }catch(_){}
  }
  if (!text){ target.innerHTML = "<p>Unable to load document.</p>"; return; }

  const html = mdToHtml(text);
  target.innerHTML = html;

  // ornaments: first paragraph dropcap if not code-first
  const firstP = target.querySelector("p");
  if (firstP && !firstP.textContent.trim().startsWith("```")){
    firstP.classList.add("dropcap");
  }
}