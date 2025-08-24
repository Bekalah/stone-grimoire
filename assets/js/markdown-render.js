export async function renderMarkdown(url, targetSel) {
  const res = await fetch(url);
  const md = await res.text();
  const target = document.querySelector(targetSel);
  // If you want fancy parsing, load a lib like marked.js -- for now just wrap in <pre>
  target.innerHTML = "<pre>" + md.replace(/</g,"&lt;") + "</pre>";
}