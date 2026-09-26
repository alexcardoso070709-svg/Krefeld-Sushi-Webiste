#!/usr/bin/env python3
"""Erzeugt assets/fonts/noto-sans-jp-subset.woff2 neu – nur mit den japanischen
Zeichen, die in src/ und build.py vorkommen. Nach neuen japanischen Texten ausführen."""
import re, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
text = "".join(p.read_text(encoding="utf-8") for p in [*ROOT.glob("src/**/*.html"), ROOT / "build.py"])
chars = "".join(sorted({c for c in text if ord(c) > 0x3000}))
ua = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
css_url = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP&text=" + urllib.parse.quote(chars)
css = urllib.request.urlopen(urllib.request.Request(css_url, headers=ua)).read().decode()
font_url = re.search(r"url\((\S+?)\)", css).group(1)
data = urllib.request.urlopen(urllib.request.Request(font_url, headers=ua)).read()
(ROOT / "assets/fonts/noto-sans-jp-subset.woff2").write_bytes(data)
print(f"{len(chars)} Zeichen, {len(data)} Bytes")
