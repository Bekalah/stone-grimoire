<!doctype html>
<html lang=“en”>
<head>
  <meta charset=“utf-8” />
  <title>Ateliers Manifesto — Codex 144:99</title>
  <meta name=“viewport” content=“width=device-width,initial-scale=1” />
  <meta name=“description” content=“Venus Covenant — museum-grade fusion art standards for the Ateliers in Codex 144:99.” />

  <!— Site styles (same stack as cathedral.html) —>
  <link rel=“stylesheet” href=“../../assets/css/palette.css” />
  <link rel=“stylesheet” href=“../../assets/css/light.css” />
  <script src=“../../assets/js/theme.js” defer></script>
  <script src=“../../assets/js/planetary-light.js” defer></script>

  <style>
    body.mystic{ background: radial-gradient(circle at 50% 18%, var(—bg) 78%, #ece7dc 100%);
      color: var(—ink); font: 18px/1.6 Georgia, “Iowan Old Style”, serif; margin:0 }
    header, footer{
      margin:18px auto; max-width:1000px; background:var(—wash);
      border:1px solid var(—line); border-radius:12px; padding:14px 18px; text-align:center
    }
    header h1{ margin:.2rem 0 .3rem; color:var(—accent) }
    header .seal{ font-size:1.1rem; color:var(—accent-2); margin:.25rem 0 }
    .wrap{ max-width:1000px; margin:0 auto; padding:10px 14px 24px }
    .folio{
      background:var(—panel); border:1px solid var(—line); border-radius:12px;
      padding:18px 20px; box-shadow: inset 0 0 40px rgba(0,0,0,.04)
    }
    /* Museum-grade Markdown typesetting */
    .folio h1,.folio h2,.folio h3,.folio h4{ color:var(—accent-2); margin:1rem 0 .4rem }
    .folio h1{font-size:1.6rem}.folio h2{font-size:1.3rem}.folio h3{font-size:1.1rem}
    .folio p{ margin:.65rem 0 }
    .folio ul,.folio ol{ margin:.5rem 0 .8rem 1.2rem }
    .folio li{ margin:.25rem 0 }
    .folio code{ background:#fff; border:1px solid var(—line); padding:.05rem .3rem; border-radius:6px }
    .folio pre code{ display:block; padding:.6rem; overflow:auto }
    .folio blockquote{ margin:.6rem 0; padding:.4rem .8rem; border-left:3px solid var(—accent-2); background:var(—wash) }
    .plaque{
      margin-top:14px; font-size:.92rem; color:#6b6257; background:#fff; border:1px solid var(—line);
      border-radius:10px; padding:10px 12px
    }
    .navline{ display:flex; gap:10px; justify-content:space-between; font-size:.95rem }
    a{ color:var(—accent); text-decoration:none } a:hover{ text-decoration:underline }
  </style>
</head>
<body class=“mystic” data-theme=“netzach”>
  <header>
    <div class=“navline”>
      <div><a href=“../../cathedral.html”>⟵ Back to Cathedral</a></div>
      <div><a href=“../../main/Thelemic-Alignment-Brief.html”>Thelemic Alignment Brief</a></div>
    </div>
    <h1>Ateliers Manifesto — Venus Covenant</h1>
    <div class=“seal” aria-hidden=“true”>𓂀 ✦ 93 ✦ 𓂀</div>
    <p>Fusion art standards for museum‑grade visionary work in Codex 144:99.</p>
  </header>

  <div class=“wrap”>
    <article id=“content” class=“folio” aria-label=“Ateliers Manifesto”>
      <p><em>Loading manifesto…</em></p>
    </article>

    <aside class=“plaque” role=“note” aria-label=“Curator Plaque”>
      <strong>Plaque — Provenance</strong><br />
      Intention: Publish atelier standards (Venus current) in a readable, actionable form.<br />
      Technique: Markdown → in‑page render; palette & light via <code>palette.css</code> + <code>light.css</code>.<br />
      Lineage: Hilma af Klint / Emma Kunz (geometry), Rosicrucian manuscripts (illumination), visionary realism (Fuchs/Venosa).<br />
      Evidence: <code>main/05_ateliers/MANIFESTO.md</code> (this page renders it live).<br />
      Reflection: Manifesto drives consistent quality without locking creativity; optional style overrides can be layered later.
    </aside>
  </div>

  <footer>
    ❦ Green Man’s vine entwines; the Choir resounds. ❦<br>
    93 93/93 — Stone Grimoire · Rosslyn Pattern
  </footer>

  <script type=“module”>
    import { applyRoom } from “../../assets/js/cathedral-engine.js”;
    import { renderMarkdownPretty } from “../../assets/js/markdown-render.js”;

    window.addEventListener(“DOMContentLoaded”, async () => {
      applyRoom(“atelier-manifesto”); // harmless if room is not in structure.json yet
      await renderMarkdownPretty(“../../main/05_ateliers/MANIFESTO.md”, “#content”);
    });
  </script>
</body>
</html>