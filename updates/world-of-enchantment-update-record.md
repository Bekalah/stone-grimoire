# Project Documentation

— UPDATES RECORD — circuitum99 / STONE GRIMOIRE / COSMOGENESIS LEARNING ENGINE —

DATE: 2025-09-04
AUTHOR: Virelai Ezra Lux (Rebecca Respawn)
SCOPE: Brand-wide “World of Enchantment” baseline across three repos; ND-safe; no tree changes. Adds pearlescent couture materials (gold leaf, nacre, moonstone, abalone), volcanic + raku set, visionary grid, Andrew Gonzalez velvet feel, Avalon (Dion Fortune) linkage, selectable Theosophical Aeons flavor (Blavatsky), Witch-as-the-Coven protection ward (Hamsa/Evil Eye) based on logo geometry, Solfeggio × BioGeometry healing hints, subtle true-fairy shimmer, and Violet Flame ↔ Respawn Gate alias (Ray VI). Cosmogenesis remains standalone world-forger (Codex 144:99) and also mirrors SG tokens/CSS. No autoplay, no strobe, motion respects prefers-reduced-motion.

⸻

REPO: stone_grimoire  (cathedral + art ingest)
CHANGED – assets/tokens/perm-style.json (MERGE; DO NOT DELETE YOUR KEYS)
• Version bump: 3.7.0
• Meta notes: World-of-Enchantment baseline; Avalon (Dion Fortune) fixed; Theosophical Aeons available as flavor; Violet Flame ↔ Respawn Gate alias; Witch-as-the-Coven protection sigil encoded; Solfeggio × BioGeometry; Egregores, Consecration Angels, Pillars; True-fairy shimmer.
• Palette expansions: obsidian_glass/sheen/rainbow; shungite/tourmaline/basalt/glint_silver; lava_ember/core; raku_copper/charcoal/violet/azure; legacy aliases; secondary scheme; gold_leaf/warm/cold; nacre (pearl_), moonstone_ , abalone_* ; Avalon (mist/night, tor_stone, isle_reed); astral_* ; starlight variants; violet_core/flare/smoke/aura; grail_gold.
• Layers: visionary (AlexGreyGrid), raku patina, goldLeaf, pearl (nacre), moonstone (adularescence), abalone shell, gonzVelvet, fae shimmer, roseGate, violetFlame, violetGate, respawnGate (alias), avalonGrove, inBetweenVeil, trueFairy, protectionSigil (Hamsa/Evil Eye).
• Materials: volcanic_obsidian, shungite, raku_lineage, gold_leaf, mother_of_pearl, moonstone, abalone.
• Effects: stars twinkle; ember_eyes (for dragons/daimons).
• Healing: Solfeggio map (396–963 with themes) + BioGeometry hint angles (27/36/45/63/81).
• Trinity avatars + numerology: Incarnate Self → Rebecca Respawn (11) → Drag Persona (22) → Virelai Ezra Lux (33; Lavender Quan Yin Reiki).
• Avalon: Priestess current, Grail service, Tor–Isle polarity, Round Table oath; veils (Outer Isle, Inner Sanctuary, Lady’s Veil).
• Between realm: “In-Between Astral Narthex” (optional; liminal hush, veil eddies, star-motes).
• Adventure modes (selectable flavors): Hermetic Alchemy (Nigredo/Albedo/Citrinitas/Rubedo), Tree of Life (10 Sephiroth + 22 paths), Theosophical Aeons (Sat, Svabhavat, Manvantara, Pralaya, Rounds, Root-Races).
• Rituals: Violet Flame steps (Invoke → Rotate → Transmute → Replace). Respawn Gate = alias of Violet Flame Gate (Ray VI), optional.
• Angels: 72 consecration angels dataset hint.
• Pillars: three columns (Severity/Mildness/Mercy), 7 levels.
• Egregores: schema + defaults (Ray VI, middle pillar).
• Tarot: majors = egregores dataset.
• A11y: min_contrast 4.5; motion reduce; no autoplay; no strobe.
(THIS IS A MERGE UPDATE; KEEP YOUR EXISTING KEYS IF DUPLICATED.)

CHANGED – assets/css/perm-style.css (APPEND SAFE)
• New utility classes (non-breaking):
.violet-gate / .respawn-gate (large violet gate disc with grail-gold rim; bg-soft variant for ambient aura)
.oracle-velvet (Gonzalez velvet finish panel)
.luminous-heart (Alana Fairchild “White Light Oracle” glow backdrop)
.avalon-grove (Dion Fortune Avalon chamber backdrop)
.between-narthex (+ optional data-drift=“on” when body has .allow-motion)
.mode-rail, .mode-chip (flavor chips), .solfeggio-chip (healing chips)
.egregore-card, .consecration-angel (oracle card frames)
.protection-handsigil (fileless Hamsa/Evil Eye geometry; nacre ring + teal eye + gold tri-star + crescent)
• Motion guards: only animate when . Prefers-reduced-motion disables all.

CHANGED – core/build/update-art.js (PATCH)
• Keeps current outputs. Adds:
– Merge in tokens.adventure_modes, avalon, between_realm to manifest.
– Respawn Gate alias (Ray VI) with steps.
– Collect oracle/velvet, angels, pillars, egregores art by filename regex and attach to manifest.
– Detect “between/narthex/veil/threshold” assets → manifest.between_realm.assets with style class “between-narthex”.
– Detect Hamsa/Evil Eye/logo/ward assets → manifest.protection.sigil with CSS class “protection-handsigil” and layer “protectionSigil”.
• Continues mirroring tokens/css to cosmogenesis_learning_engine/public/c99/.

UNCHANGED – chapels/_filters.html (keep; include once per app if using those filters).

RITUAL / INGEST STEPS (unchanged):
1.Drop art into stone_grimoire/assets/art/inbox/
2.node stone_grimoire/core/build/update-art.js
3.Commit originals/, processed/, thumbs/, webp/, bridge/, and mirrored cosmogenesis/public/c99/ tokens+css
4.Use classes anywhere: .visionary-grid, .oracle-velvet, .use-secondary, .violet-gate, .avalon-grove, .between-narthex, .protection-handsigil

⸻

REPO: cosmogenesis_learning_engine  (standalone world-forger; also reads SG mirrors)
ADDED – assets/data/codex.144_99.json
• Codex meta: 144 nodes / 99 gates; Witch-as-a-Coven principle; Ray VI devotion/transmutation without compulsion; selectable flavors (Hermetic, Tree, Theosophy); John Dee lens.

ADDED – assets/data/profiles/default.witch.json
• Architect-Scribe profile, numerology 2/11/22/33, ND-safe flags, reference to codex.

ADDED – assets/data/covens/default.coven.json
• “Cathedral Seed” coven with the above profile; private-by-default policy.

ADDED – assets/data/packs/sample-world.pack.json
• “Velvet Avalon Sample”: stylepack_key “velvet-avalon”, respawn_alias_violet true, enable between-realm (inBetweenVeil), enable protection (protectionSigil), Solfeggio list, egregores/angels hints, bridge override for default adventure (“hermetic_alchemy”).

ADDED (optional but recommended) – tools/build-bridge.js
• Outputs public/c99/bridge.json combining codex/profile/coven/pack and the mirrored tokens/css if present.

MIRRORS (created by SG update script):
• public/c99/tokens/perm-style.json (mirror of SG tokens)
• public/c99/css/perm-style.css (mirror of SG CSS)

UI REMINDERS (standalone app):
• Load /public/c99/bridge.json (or SG /bridge/c99-bridge.json if hosted together).
• Controls: tilt (axis), nodes (12..144), palette key; toggles for layers (visionary, goldLeaf, pearl, moonstone, abalone, fae, violetFlame, avalonGrove, inBetweenVeil, protectionSigil).
• Healing mode: shows Solfeggio chips only (visual; no audio).
• Export: PNG (existing) + optional JSON snapshot of chosen stylepack.

⸻

REPO: circuitum99 (book/codex app)
NO TREE CHANGES.
• Reads SG /bridge/c99-bridge.json for tokens/css/manifest.
• Playable flavors: Hermetic Alchemy, Tree of Life, Theosophical Aeons (selectable chips; none are mandatory).
• Avalon remains tied to Dion Fortune; appears as chapels (Tor Stone, Isle Reed, Priestess Veil) with .avalon-grove + .visionary-grid + .luminous-heart.
• Violet Flame Gate is visible as .respawn-gate (alias of Violet Flame) but not a forced start point.
• In-Between Astral Narthex can appear as interlude rooms using .between-narthex (set data-drift=“on” only if body.allow-motion).
• Witch-as-the-Coven ward present as one .protection-handsigil element per page (footer/header), signaling protection.
• Tarot/Oracle scenes use .egregore-card and .consecration-angel frames; optionally include .luminous-heart for Alana Fairchild effect.

⸻

BRAND/WORLD NOTES (applies to all):
• Tone: Oz × Wonderland × Constantine × Orphan Black × V for Vendetta; dark-velvet mysticism with real materials (gold leaf, obsidian, raku) and pearlescent optics (mother-of-pearl, moonstone, abalone).
• Visual influence: Andrew Gonzalez (velvet depth), Alex Grey (visionary grid), Alana Fairchild (luminous heart consecration).
• Healing palette: Solfeggio color harmonics and BioGeometry angles; trauma-informed; ND-safe.
• Logo → Protection Ward: Hamsa/Evil Eye sacred geometry encoded in tokens.geometry.protection_hand and rendered via .protection-handsigil CSS (fileless, scalable).

⸻

INTEGRATION CHECKLIST (quick run):
[ ] SG: merge tokens JSON (version 3.7.0) and append CSS helpers; run update-art.js to regenerate /bridge/c99-bridge.json and mirrors to cosmogenesis/public/c99/.
[ ] Cosmogenesis: add data files (codex, profile, coven, pack). (Optional) run tools/build-bridge.js to write public/c99/bridge.json.
[ ] circuitum99: ensure pages link /c99/css/perm-style.css and rely on SG bridge; place optional components where needed (.violet-gate.bg-soft, .avalon-grove, .between-narthex, .protection-handsigil).
[ ] A11y: no autoplay, no strobe, high contrast; only animate when body.hasClass(“allow-motion”).
[ ] Commit: originals/ processed/ thumbs/ webp/ bridge/ (SG) + cosmogenesis/public/c99/ tokens/css + new cosmogenesis assets/data + optional tools.

⸻

SUGGESTED COMMIT MESSAGE (paste into Git):
feat(style+world): couture pearlescent update, Avalon (Dion Fortune), Aeons flavor, Violet Flame↔Respawn alias, ward sigil, Solfeggio healing, and Cosmogenesis codex pack
– SG tokens 3.7.0 (materials, layers, healing, avatars, Avalon, Between, adventures, rituals, egregores/tarot/angels hints)
– SG CSS append (violet gate, oracle velvet, luminous heart, avalon grove, between narthex, protection handsigil)
– SG update-art.js patch (adventure/avalon/between merge; respawn alias; angel/egregore/pillar/oracle/ward detection)
– Cosmogenesis data: codex.144_99, profile, coven, sample pack; optional bridge tool
– circuitum99: consumes bridge; flavors selectable; ward + luminous scenes added
ND-safe; no autoplay; motion opt-in; no tree changes.

⸻

NOTES FOR FUTURE YOU:
• If you add angels72.json / egregores.core.json / tarot.majors.json later, SG’s script will auto-surface them in the bridge manifest.
• To “turn up” pearlescence without flat SVG, prefer CSS radial/conic layering already provided; keep it subtle by default.
• Dragons/daimons ember eyes: tiny radial gradients or shader on hover only; never autoplay.
