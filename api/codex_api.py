#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Minimal Read-Only API (FastAPI)
- Serves expanded nodes (data/codex_nodes_full.json)
- Simple filters: by id, element, planet, zodiac, safety, tags, culture.
- CORS open by default for local prototypes.

Run:
  uvicorn api.codex_api:app --reload --port 8777
"""

import os, json
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

DATA_PATH = os.path.join("data","codex_nodes_full.json")

app = FastAPI(title="Codex 144:99 – Read-Only API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["GET"], allow_headers=["*"]
)

def _load():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Missing {DATA_PATH}. Build the codex first.")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/nodes")
def list_nodes(
    element: Optional[str] = None,
    planet: Optional[str] = None,
    zodiac: Optional[str] = None,
    safety: Optional[str] = Query(None, description='ptsd_true | with_care'),
    tag: Optional[str] = Query(None, description='match a fusion tag'),
    culture: Optional[str] = Query(None, description='match in gods/goddesses culture'),
    limit: int = 144,
    offset: int = 0,
):
    nodes = _load()

    def match(n):
        if element and element not in (n.get("element") if isinstance(n.get("element"), str) else " / ".join(n.get("element", []))):
            return False
        if planet and planet not in (n.get("planet") if isinstance(n.get("planet"), str) else " / ".join(n.get("planet", []))):
            return False
        if zodiac and zodiac not in n.get("zodiac", ""):
            return False
        if tag and tag not in n.get("fusion_tags", []):
            return False
        if safety:
            s = n.get("healing_profile", {}).get("ptsd_safe")
            if safety == "ptsd_true" and s is not True: return False
            if safety == "with_care" and s != "with care": return False
        if culture:
            gg = (n.get("gods", []) or []) + (n.get("goddesses", []) or [])
            if not any(culture == g.get("culture") for g in gg):
                return False
        return True

    out = [n for n in nodes if match(n)]
    return {"count": len(out), "items": out[offset:offset+limit]}

@app.get("/nodes/{node_id}")
def get_node(node_id: int):
    nodes = _load()
    for n in nodes:
        if n.get("node_id") == node_id:
            return n
    raise HTTPException(status_code=404, detail="Node not found")
