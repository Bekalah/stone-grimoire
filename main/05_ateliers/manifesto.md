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
    /* ===== Grimoire Folio Styling ===== */

    /* Parchment palette (re-uses your CSS vars for harmony) */
    :root{
      —parch-bg: #f8f2e6;
      —parch-edge: #e7dbc6;
      —ink-2: #2a2320;
      —rubric: #8b2b2b;     /* rubrication red */
      —gold:  #caa44a;      /* gilded accents */
      —vine:  #9b8b6a;      /* marginal vine */
    }

    body.mystic{
      margin:0;
      color:var(—ink-2);
      font: 18px/1.62 Georgia, “Iowan Old Style”, serif;
      background: radial-gradient(circle at 50% 18%, var(—parch-bg) 80%, #efe7d9 100%);
    }

    header, footer{
      margin:18px auto; max-width:1000px; text-align:center;
      background: #fff8e7;
      border:1px solid var(—line);
      border-radius:12px; padding:14px 18px;
      box-shadow: 0 1px 0 #fff inset, 0 0 0 3px rgba(202,164,74,.08) inset;
    }
    header h1{ margin:.2rem 0 .3rem; color:var(—accent) }
    header .seal{ font-size:1.1rem; color:var(—accent-2); margin:.25rem 0 }
    .navline{ display:flex; gap:10px; justify-content:space-between; font-size:.95rem }

    .wrap{ max-width:1000px; margin:0 auto; padding:10px 14px 24px }

    /* Ornate folio frame */
    .folio{
      position:relative;
      background: #fcf6e9;
      border:1px solid var(—parch-edge);
      border-radius:14px;
      padding:26px 24px;
      box-shadow:
        0 0 0 4px rgba(255,255,255,.6) inset,
        0 1px 18px rgba(0,0,0,.05);
    }

    /* Corner ornaments (inline SVG, no extra files) */
    .folio:before, .folio:after{
      content:””;
      position:absolute; width:90px; height:90px; opacity:.22; pointer-events:none
    }
    .folio:before{
      left:-6px; top:-6px;
      background-image:url(‘data:image/svg+xml;utf8,<svg xmlns=“http://www.w3.org/2000/svg” width=“90” height=“90”><path d=“M8,70 C18,55 30,48 44,40 C56,33 66,24 74,14” fill=“none” stroke=“%23caa44a” stroke-width=“2”/><circle cx=“72” cy=“16” r=“3” fill=“%238b2b2b”/></svg>’);
      background-size:90px 90px;
    }
    .folio:after{
      right:-6px; bottom:-6px; transform:scale(-1,-1);
      background-image:url(‘data:image/svg+xml;utf8,<svg xmlns=“http://www.w3.org/2000/svg” width=“90” height=“90”><path d=“M8,70 C18,55 30,48 44,40 C56,33 66,24 74,14” fill=“none” stroke=“%23caa44a” stroke-width=“2”/><circle cx=“72” cy=“16” r=“3” fill=“%238b2b2b”/></svg>’);
      background-size:90px 90px;
    }

    /* Marginal vine (subtle, PD-manuscript vibe) */
    .folio .marginalia{
      position:absolute; left:-12px; top:40px; bottom:40px; width:10px; opacity:.18; pointer-events:none;
      background-image:url(‘data:image/svg+xml;utf8,<svg xmlns=“http://www.w3.org/2000/svg” width=“10” height=“400”><path d=“M5,0 C6,50 4,90 6,140 C4,190 6,230 5,280 C6,320 4,360 6,400” fill=“none” stroke=“%239b8b6a” stroke-width=“1.2”/><circle cx=“5” cy=“60” r=“1.6” fill=“%23caa44a”/><circle cx=“5” cy=“210” r=“1.6” fill=“%238b2b2b”/></svg>’);
      background-repeat:repeat-y;
      display:none; /* turned on by wide screens */
    }
    @media (min-width: 1000px){
      .folio .marginalia{ display:block; }
    }

    /* Rubricated headings (red smallcaps underline) */
    .folio h1,.folio h2,.folio h3,.folio h4{
      color:var(—ink-2); margin:1rem 0 .4rem;
      font-variant: small-caps;
      letter-spacing:.02em;
      position:relative;
    }
    .folio h2{
      padding-bottom:.2rem;
    }
    .folio h2:after{
      content:””; position:absolute; left:0; bottom:-.2rem; width:140px; height:3px;
      background: linear-gradient(90deg, var(—rubric), transparent);
      border-radius:2px;
    }

    /* Drop cap on first paragraph */
    .folio .dropcap:first-letter{
      float:left; font-size:3.1rem; line-height:.9; margin:.12rem .45rem 0 0;
      font-weight:700; color:var(—rubric);
      text-shadow: 0 1px 0 #fff;
    }

    /* Illuminated initials (optional span) */
    .folio .illuminated{
      display:inline-block; padding:.1rem .45rem .15rem;
      border:1px solid rgba(202,164,74,.5);
      background: linear-gradient(#fff8e7,#f8eedd);
      border-radius:6px; color:var(—gold); font-weight:700;
      box-shadow: inset 0 0 4px rgba(202,164,74,.35);
    }

    /* Body copy */
    .folio p{ margin:.7rem 0; }
    .folio blockquote{
      margin:.7rem 0; padding:.5rem .8rem;
      border-left:4px solid var(—gold);
      background: #fffaf0;
      color:#5a534b;
    }

    /* Lists with fleurons (❧) instead of bullets */
    .folio ul{ margin:.5rem 0 .9rem 1.3rem }
    .folio ul li{ margin:.25rem 0; }
    .folio ul li::marker{
      content:”❧  “; color:var(—rubric); font-size:1rem;
    }

    .plaque{
      margin-top:14px; font-size:.92rem; color:#6b6257; background:#fff;
      border:1px solid var(—line); border-radius:10px; padding:10px 12px
    }

    a{ color:var(—accent); text-decoration:none } a:hover{ text-decoration:underline }

    /* Prefer-reduced-motion: no glitter shifts */
    @media (prefers-reduced-motion: reduce){
      *{ animation: none !important; transition: none !important }
    }
  </style>
</head>
<body class=“mystic” data-theme=“netzach”>
  <header>
    <div class=“navline”>
      <div><a href=“../../cathedral.html”>⟵ Back to Cathedral</a></div>
      <div><a href=“../Thelemic-Alignment-Brief.html”>Thelemic Alignment Brief</a></div>
    </div>
    <h1>Ateliers Manifesto — Venus Covenant</h1>
    <div class=“seal” aria-hidden=“true”>𓂀 ✦ 93 ✦ 𓂀</div>
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
      Technique: Markdown → in‑page render; parchment & rubric via inline CSS; palette from <code>palette.css</code> + <code>light.css</code>.<br />
      Lineage: Hilma af Klint / Emma Kunz (geometry), Rosicrucian manuscripts (illumination), visionary realism (Fuchs/Venosa).<br />
      Evidence: <code>main/05_ateliers/MANIFESTO.md</code> (this page renders it live).<br />
      Reflection: Ritual quality without image spam; grimoire feel from typography, frame, and rubric motifs.
    </aside>
  </div>

  <footer>
    ❦ Green Man’s vine entwines; the Choir resounds. ❦<br>
    93 93/93 — Stone Grimoire · Rosslyn Pattern
  </footer>

  <noscript>
    <div class=“wrap”><p>This page renders a Markdown document. Please enable JavaScript or open the raw file:
      <a href=“./MANIFESTO.md”>MANIFESTO.md</a>.</p></div>
  </noscript>

  <script type=“module”>
    import { applyRoom } from “../../assets/js/cathedral-engine.js”;
    import { renderMarkdownPretty } from “../../assets/js/markdown-render.js”;

    // After render: apply dropcap to the first paragraph and minor ornaments
    function ornamentAfterRender(container){
      const firstP = container.querySelector(“p”);
      if(firstP && !firstP.classList.contains(“dropcap”)){
        firstP.classList.add(“dropcap”);
      }
      // Optional: make the very first letter an illuminated initial if user wraps it in [*A*] style later
      // (kept simple for now; your markdown stays unchanged)
    }

    window.addEventListener(“DOMContentLoaded”, async () => {
      applyRoom(“atelier-manifesto”);
      const target = “#content”;
      await renderMarkdownPretty(“./MANIFESTO.md”, target);
      ornamentAfterRender(document.querySelector(target));
    });
  </script>
</body>
</html>