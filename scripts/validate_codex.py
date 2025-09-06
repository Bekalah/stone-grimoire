#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Codex 144:99 – Integrity Validator
- Verifies that expanded nodes in data/codex_nodes_full.json match their lock_hash.
- Also offers a quick consistency check on required fields.

Run:
  python scripts/validate_codex.py
"""

import json, os, sys, hashlib

REQUIRED_TOP = [
    "node_id","name","locked","egregore_id","shem_angel","goetic_demon",
    "gods","goddesses","chakra","planet","zodiac","element","platonic_solid",
    "geometry","art_style","function","ritual_use","fusion_tags",
    "solfeggio_freq","music_profile","color_scheme","healing_profile","symbolic_keywords"
]

EXPANDED_PATH = os.path.join("data","codex_nodes_full.json")

def compute_lock_hash(node_no_hash: dict) -> str:
    """Recreate lock hash exactly like build_codex.py (sort_keys=True, UTF-8)."""
    payload = json.dumps(node_no_hash, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()

def main():
    if not os.path.exists(EXPANDED_PATH):
        print(f"[ERROR] Missing {EXPANDED_PATH}. Run scripts/build_codex.py first.", file=sys.stderr)
        sys.exit(2)

    with open(EXPANDED_PATH,"r",encoding="utf-8") as f:
        nodes = json.load(f)

    ok = True
    seen_ids = set()
    for n in nodes:
        # basic structural checks
        for key in REQUIRED_TOP:
            if key not in n:
                ok = False
                print(f"[FAIL] node {n.get('node_id','?')}: missing key '{key}'")

        nid = n.get("node_id")
        if nid in seen_ids:
            ok = False
            print(f"[FAIL] duplicate node_id {nid}")
        seen_ids.add(nid)

        if not n.get("locked", False):
            ok = False
            print(f"[FAIL] node {nid}: locked flag must be True")

        # lock_hash validation
        lock_hash = n.get("lock_hash")
        if not lock_hash:
            ok = False
            print(f"[FAIL] node {nid}: missing lock_hash")
        else:
            n_copy = dict(n)
            n_copy.pop("lock_hash", None)
            calc = compute_lock_hash(n_copy)
            if calc != lock_hash:
                ok = False
                print(f"[FAIL] node {nid}: lock_hash mismatch (calc {calc[:12]}..., file {lock_hash[:12]}...)")

    if ok:
        print(f"[OK] {len(nodes)} nodes validated. All lock_hash values match and structure is sane.")
        sys.exit(0)
    else:
        print("[ERROR] Validation failed. See messages above.", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
