#!/usr/bin/env python3
"""Print WHTML actions inserting chunks before an anchor element: wf_before.py ANCHOR_ID PAGE_ID chunk-names..."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
anchor, page = sys.argv[1], sys.argv[2]
acts = []
for name in sys.argv[3:]:
    d = json.loads((ROOT / "build/wf" / f"{name}.json").read_text())
    a = {"build_label": name, "parent_element_id": {"component": page, "element": anchor}, "creation_position": "before", "html": d["html"]}
    if d["css"].strip(): a["css"] = d["css"].strip()
    acts.append(a)
print(json.dumps(acts, ensure_ascii=False))
