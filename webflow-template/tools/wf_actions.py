#!/usr/bin/env python3
"""Print WHTML builder actions for chunk files: wf_actions.py PARENT_ELEMENT_ID PAGE_ID chunk-names..."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
parent, page = sys.argv[1], sys.argv[2]
acts = []
for name in sys.argv[3:]:
    d = json.loads((ROOT / "build/wf" / f"{name}.json").read_text())
    if "component" in d:
        continue
    a = {"build_label": name, "parent_element_id": {"component": page, "element": parent}, "creation_position": "append", "html": d["html"]}
    if d["css"].strip(): a["css"] = d["css"].strip()
    acts.append(a)
print(json.dumps(acts, ensure_ascii=False))
