# MASTER_UPDATE_NO_CI_FINAL_PLUS_ALEXGREY.md

# PURPOSE: Preserve old SG style, add volcanic obsidian + Raku reiki, KEEP Alex Grey/visionary layer, and add a Secondary palette.
# NOTE: No tree changes. Uses existing folders only.

# PATHS (unchanged)
stone_grimoire/assets/tokens/perm-style.json
stone_grimoire/assets/css/perm-style.css
stone_grimoire/chapels/_filters.html
stone_grimoire/core/build/update-art.js
cosmogenesis_learning_engine/public/c99/css/perm-style.css      (mirrored by update-art.js)
cosmogenesis_learning_engine/public/c99/tokens/perm-style.json   (mirrored by update-art.js)
cosmogenesis_learning_engine/public/c99/filters/_filters.html    (manual copy below if desired)
bridge/c99-bridge.json
bridge/c99-bridge.js

# 1) TOKENS — merge/overwrite (adds secondary palette + visionary layers, keeps everything else)
stone_grimoire/assets/tokens/perm-style.json
{
  “meta”: {
    “name”: “circuitum99 — Perm Style”,
    “version”: “2.1.0”,
    “author”: “Virelai Ezra Lux”,
    “materials_version”: “obsidian-volcanic-1.0”,
    “nd_safe”: true,
    “notes”: “Legacy SG + Secondary palette + Volcanic Obsidian + Raku Reiki + Visionary (Alex Grey) layer.”
  },
  “palette”: {
    “void”:”#0B0B0B”,”ink”:”#141414”,”bone”:”#F8F5EF”,
    “indigo”:”#280050”,”violet”:”#460082”,”blue”:”#0080FF”,”green”:”#00FF80”,”amber”:”#FFC800”,”light”:”#FFFFFF”,
    “crimson”:”#B7410E”,”gold”:”#C9A227”,”obsidian”:”#0B0B0B”,
    “rose_quartz”:”#FFB6C1”,”teal_glow”:”#00CED1”,”violet_alt”:”#8A2BE2”,
    “gonz_0”:”#0b0b0b”,”gonz_1”:”#16121b”,”gonz_2”:”#2a2140”,”gonz_3”:”#5e4ba8”,”gonz_4”:”#e6e6e6”,

    “obsidian_glass”:”#0f1014”,”obsidian_sheen”:”#191b22”,”obsidian_rainbow”:”#33214e”,
    “shungite_ink”:”#0a0b0c”,”tourmaline_ridge”:”#121318”,”basalt_ash”:”#2b2f36”,”glint_silver”:”#d9e0e7”,
    “lava_ember”:”#ff4b1f”,”lava_core”:”#ff7a00”,
    “raku_copper”:”#b87333”,”raku_charcoal”:”#1a1a1a”,”raku_violet”:”#6E00FF”,”raku_azure”:”#1F7AF3”,”smoke_gray”:”#6b6f76”,

    “bg_legacy”:”#0e0e12”,”ink_legacy”:”#e9e7e1”,”gold_legacy”:”#d4af37”,”rose_legacy”:”#b4435d”,”lapis_legacy”:”#2f5a9e”,
    “ash_legacy”:”#6b6f76”,”line_legacy”:”#22242a”,”muted_legacy”:”#b9b6ad”,”accent_legacy”:”#7fd8b3”
  },
  “secondary”: {
    “bg”:”#0d0e14”,”ink”:”#ECE7DE”,”edge”:”#1D2028”,
    “sun”:”#F2C14E”,”sea”:”#3FA7D6”,”fern”:”#24D6A9”,”rose”:”#D65A8A”,”amethyst”:”#7B5DD6”
  },
  “layers”: {
    “visionary”: {
      “name”: “AlexGreyGrid”,
      “alpha”: 0.22,
      “scale”: 1.0,
      “line”: “#4a4f63”,
      “highlight”: “#aab3ff”,
      “pattern”: “sacred-grid”
    },
    “patina”: {
      “name”: “RakuBloom”,
      “alpha”: 0.18,
      “copper”: “raku_copper”,
      “violet”: “raku_violet”,
      “azure”: “raku_azure”
    }
  },
  “line”: { “hair”: 1, “primary”: 2, “pillar”: 3 },
  “typography”: {
    “display”: “’EB Garamond’,’Junicode’,serif”,
    “gothic”: “’Cinzel’,serif”,
    “ui”: “’Inter’,system-ui,sans-serif”,
    “scale”: { “h1”: 1.6, “h2”: 1.2, “h3”: 1.0, “body”: 1.0, “small”: 0.9 }
  },
  “geometry”: { “vesica_ratio”: 1.732, “spine_33”: true, “pillars_21”: true, “gates_99”: true },
  “materials”: {
    “volcanic_obsidian”: { “roughness”: 0.33, “specular”: 0.58, “ior”: 1.53, “anisotropy”: 0.28, “microfracture_density”: 0.24, “conchoidal”: 0.4, “inclusions”: { “graphitic”: 0.20, “pyritic”: 0.07, “iridescence”: 0.18 } },
    “shungite”: { “carbon_load”: 0.85, “flake_scale”: 0.18, “matte_ratio”: 0.35, “silver_glint”: 0.08 },
    “raku_lineage”: { “copper_bloom”: 0.62, “charcoal_halo”: 0.42, “violet_kiln”: 0.22, “smoke_vignette”: 0.18 }
  },
  “a11y”: { “min_contrast”: 4.5, “motion”: “reduce”, “autoplay”: false, “strobe”: false }
}

# 2) CSS — replace file (preserves SG, adds Secondary + Visionary layer classes)
stone_grimoire/assets/css/perm-style.css
:root{
  /* primary palette */
  —void:#0B0B0B; —ink:#141414; —bone:#F8F5EF; —indigo:#280050; —violet:#460082; —blue:#0080FF; —green:#00FF80; —amber:#FFC800; —light:#FFFFFF; —crimson:#B7410E; —gold:#C9A227; —obsidian:#0B0B0B;
  —gonz-0:#0b0b0b; —gonz-1:#16121b; —gonz-2:#2a2140; —gonz-3:#5e4ba8; —gonz-4:#e6e6e6;
  /* volcanic + raku */
  —obsidian-glass:#0f1014; —obsidian-sheen:#191b22; —obsidian-rainbow:#33214e; —shungite-ink:#0a0b0c; —tourmaline-ridge:#121318; —basalt-ash:#2b2f36; —glint-silver:#d9e0e7; —lava-ember:#ff4b1f; —lava-core:#ff7a00; —raku-copper:#b87333; —raku-charcoal:#1a1a1a; —raku-violet:#6E00FF; —raku-azure:#1F7AF3; —smoke-gray:#6b6f76;
  /* legacy aliases preserved */
  —bg:#0e0e12