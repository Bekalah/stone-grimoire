# Project Documentation

<!doctype html>
<html lang=“en”>
<head>
  <meta charset=“utf-8”>
  <title>Ateliers Manifesto — Codex 144:99</title>
  <meta name=“viewport” content=“width=device-width,initial-scale=1”>
  <meta name=“description” content=“Venus Covenant — museum-grade fusion art standards for the Ateliers in Codex 144:99.”>

  <!— Core site styles —>
  <link rel=“stylesheet” href=“/assets/css/palette.css”>
  <link rel=“stylesheet” href=“/assets/css/light.css”>
  <!— Grimoire folio styling (shared parchment/rubric/dropcap) —>
  <link rel=“stylesheet” href=“/assets/css/folio.css”>

  <!— Subtle theme/planetary tinting —>
  <script src=“/assets/js/theme.js” defer></script>
  <script src=“/assets/js/planetary-light.js” defer></script>
</head>
<body class=“mystic” data-theme=“netzach”>
  <header role=“banner”>
    <div class=“navline” role=“navigation” aria-label=“Breadcrumbs”>
      <div><a href=“../../cathedral.html”>⟵ Back to Cathedral</a></div>
      <div><a href=“../Thelemic-Alignment-Brief.html”>Thelemic Alignment Brief</a></div>
    </div>
    <h1>Ateliers Manifesto — Venus Covenant</h1>
    <div class=“seal” aria-hidden=“true”>𓂀 ✦ 93 ✦ 𓂀</div>
    <p>Fusion art standards for museum-grade visionary work in Codex 144:99.</p>
  </header>

  <div class=“wrap”>
    <article id=“content” class=“folio” aria-label=“Ateliers Manifesto” aria-live=“polite”>
      <div class=“marginalia” aria-hidden=“true”></div>
      <p><em>Loading manifesto…</em></p>
    </article>

    <aside class=“plaque” role=“note” aria-label=“Curator Plaque”>
      <strong>Plaque — Provenance</strong><br>
      Intention: Publish atelier standards (Venus current) in a readable, actionable form.<br>
      Technique: Markdown render via markdown-render.js; parchment and rubric via folio.css; palette from palette.css + light.css.<br>
      Lineage: Hilma af Klint, Emma Kunz, Rosicrucian manuscripts, visionary realism lineages.<br>
      Evidence: main/05_ateliers/MANIFESTO.md (this page renders it live).<br>
      Reflection: Ritual quality without image spam; grimoire feel from typography and rubric motifs.
    </aside>
  </div>

  <footer>
    ❦ Green Man’s vine entwines; the Choir resounds. ❦<br>
    93 93/93 — Stone Grimoire · Rosslyn Pattern
  </footer>

  <noscript>
    <div class=“wrap”>
      <p>This page renders a Markdown document. Enable JavaScript or open the raw file:
        <a href=“./MANIFESTO.md”>MANIFESTO.md</a>.
      </p>
    </div>
  </noscript>

  <!— Markdown renderer —>
  <script type=“module”>
    import { renderMarkdownPretty } from “/assets/js/markdown-render.js”;

    function ornamentAfterRender(containerSelector){
      const el = document.querySelector(containerSelector);
      if(!el) return;
      // Dropcap on first paragraph
      const firstP = el.querySelector(“p”);
      if(firstP && !firstP.classList.contains(“dropcap”)){
        firstP.classList.add(“dropcap”);
      }
    }

    window.addEventListener(“DOMContentLoaded”, async () => {
      await renderMarkdownPretty(“./MANIFESTO.md”, “#content”);
      ornamentAfterRender(“#content”);
    });
  </script>
</body>
</html>
