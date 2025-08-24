<!doctype html>
<html lang=“en”>
<head>
  <meta charset=“utf-8” />
  <title>Ateliers Manifesto — Codex 144:99</title>
  <meta name=“viewport” content=“width=device-width,initial-scale=1” />
  <meta name=“description” content=“Venus Covenant — museum-grade fusion art standards for the Ateliers in Codex 144:99.” />

  <!— Site styles —>
  <link rel=“stylesheet” href=“../../assets/css/palette.css” />
  <link rel=“stylesheet” href=“../../assets/css/light.css” />
  <link rel=“stylesheet” href=“../../assets/css/folio.css” />

  <!— Optional site scripts (safe) —>
  <script src=“../../assets/js/theme.js” defer></script>
  <script src=“../../assets/js/planetary-light.js” defer></script>
</head>
<body class=“mystic” data-theme=“netzach”>
  <header>
    <div class=“navline”>
      <div><a href=“../../cathedral.html” role=“button” aria-label=“Back to Cathedral”>⟵ Back to Cathedral</a></div>
      <div><a href=“../Thelemic-Alignment-Brief.html”>Thelemic Alignment Brief</a></div>
    </div>
    <h1>Ateliers Manifesto — Venus Covenant</h1>
    <div class=“seal” aria-hidden=“true” role=“doc-subtitle”>𓂀 ✦ 93 ✦ 𓂀</div>
    <p>Fusion art standards for museum‑grade visionary work in Codex 144:99.</p>
  </header>

  <div class=“wrap”>
    <article id=“content” class=“folio” aria-label=“Ateliers Manifesto” aria-live=“polite”>
      <div class=“marginalia” aria-hidden=“true”></div>
      <p><em>Loading manifesto…</em></p>
    </article>

    <aside class=“plaque” role=“note” aria-label=“Curator Plaque”>
      <strong>Plaque — Provenance</strong><br />
      Intention: Publish atelier standards (Venus current) in a readable, actionable form.<br />
      Technique: Markdown → in‑page render; shared folio frame via <code>assets/css/folio.css</code>.<br />
      Lineage: Hilma af Klint / Emma Kunz (geometry), Rosicrucian manuscripts (illumination), visionary realism (Fuchs/Venosa).<br />
      Evidence: <code>main/05_ateliers/MANIFESTO.md</code> rendered below.<br />
      Reflection: Ritual quality without image spam; grimoire feel from typography, frame, and rubric motifs.
    </aside>
  </div>

  <footer>
    ❦ Green Man’s vine entwines; the Choir resounds. ❦<br>
    93 93/93 — Stone Grimoire · Rosslyn Pattern
  </footer>

  <noscript>
    <div class=“wrap”><p>This page renders a Markdown document. Enable JavaScript or open the raw file:
      <a href=“./MANIFESTO.md”>MANIFESTO.md</a>.</p></div>
  </noscript>

  <script type=“module”>
    import { renderMarkdownPretty } from “../../assets/js/markdown-render.js”;

    function ornamentAfterRender(container){
      // Ensure first paragraph has dropcap (renderer also does this; kept for resilience)
      const firstP = container.querySelector(“p”);
      if(firstP && !firstP.classList.contains(“dropcap”)){
        firstP.classList.add(“dropcap”);
      }
      // Small ornament on h2s (purely decorative)
      container.querySelectorAll(“h2”).forEach(h=>{
        if(!h.querySelector(“.ornament”)){
          const deco = document.createElement(“span”);
          deco.className = “ornament”;
          deco.textContent = “ ❧ “;
          deco.setAttribute(“aria-hidden”, “true”);
          h.appendChild(deco);
        }
      });
    }

    window.addEventListener(“DOMContentLoaded”, async () => {
      const target = “#content”;
      await renderMarkdownPretty(“./MANIFESTO.md”, target);
      ornamentAfterRender(document.querySelector(target));
    });
  </script>
</body>
</html>