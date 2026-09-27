#!/usr/bin/env python3
"""Split built preview pages into Webflow WHTML chunks (one root element each) with only the CSS rules
not yet sent. Usage: wf_chunks.py page.html [--reset]  -> writes build/wf/<page>-NN.json"""
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent
ASSETS = json.loads((ROOT / "data/webflow_assets.json").read_text())["url"]
SENT = ROOT / "build/wf/sent_classes.json"
PAGES = {"index.html": "/", "about.html": "/about", "menu.html": "/menu", "dish.html": "/menu",
         "reservations.html": "/reservations", "contact.html": "/contact", "gallery.html": "/gallery",
         "journal.html": "/journal", "post.html": "/journal", "style-guide.html": "/style-guide",
         "licenses.html": "/licenses", "changelog.html": "/changelog", "404.html": "/"}

def parse_css(text):
    """Return list of (media or None, selector, body)."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    out, i = [], 0
    while i < len(text):
        m = re.compile(r"\s*(@media[^{]+|[^{}]+)\{").match(text, i)
        if not m:
            break
        head = m.group(1).strip()
        if head.startswith("@media"):
            depth, j = 1, m.end()
            while depth:
                depth += {"{": 1, "}": -1}.get(text[j], 0); j += 1
            for _, s, b in parse_css(text[m.end():j - 1]):
                out.append((head, s, b))
            i = j
        else:
            j = text.index("}", m.end())
            out.append((None, head, text[m.end():j].strip()))
            i = j + 1
    return out

RULES = [(m, sel.strip(), b) for m, s, b in parse_css((ROOT / "css/hanabi.css").read_text()) for sel in s.split(",")]

def classes_in(sel):
    return set(re.findall(r"\.([a-zA-Z0-9_-]+)", sel))

def top_level_chunks(html):
    """Top-level elements inside <main> plus header/footer blocks."""
    body = html.split('<div class="page-wrapper">', 1)[1].rsplit("</div>\n<script", 1)[0]
    body = re.sub(r"</?main>", "", body)
    # parse top-level elements
    chunks, depth, start = [], 0, None
    for m in re.finditer(r"<(/?)([a-zA-Z0-9]+)([^>]*?)(/?)>", body):
        closing, tag, selfclose = m.group(1), m.group(2).lower(), m.group(4)
        if tag in ("img", "input", "br", "meta", "link") or selfclose:
            if depth == 0: chunks.append(body[m.start():m.end()])
            continue
        if not closing:
            if depth == 0: start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0: chunks.append(body[start:m.end()])
    return chunks

def fix(html):
    html = re.sub(r'src="images/([^"]+)"', lambda m: f'src="{ASSETS[m.group(1)]}"', html)
    html = re.sub(r'href="([a-z0-9-]+)\.html"', lambda m: f'href="{PAGES.get(m.group(1) + ".html", "/")}"', html)
    html = re.sub(r'\s(onsubmit|data-tabs|data-tab|data-pane|loading|fetchpriority)="[^"]*"', "", html)
    html = re.sub(r"\s(data-tabs)(?=[\s>])", "", html)
    html = html.replace(" w--current", "")
    html = re.sub(r">\s+<", "><", html).strip()
    html = re.sub(r"(\S) <(span|a|strong|em)\b", r"\1&nbsp;<\2", html)
    html = re.sub(r"</(span|a|strong|em)> (\S)", r"</\1>&nbsp;\2", html)
    return html

def main():
    page = sys.argv[1]
    sent = set() if "--reset" in sys.argv or not SENT.exists() else set(json.loads(SENT.read_text()))
    html = (ROOT / page).read_text()
    chunks = top_level_chunks(html)
    # merge announce + header into one root
    if chunks and 'class="announce"' in chunks[0]:
        chunks = ['<div class="header-wrap">' + chunks[0] + chunks[1] + "</div>"] + chunks[2:]
    outdir = ROOT / "build/wf"; outdir.mkdir(parents=True, exist_ok=True)
    for n, ch in enumerate(chunks):
        if ch.startswith('<div class="header-wrap">') or ch.startswith('<footer'):
            print(f"{page[:-5]}-{n:02d}", "SKIP")
            continue
        if 'id="reserve"' in ch[:80]:
            (outdir / f"{page[:-5]}-{n:02d}.json").write_text(json.dumps({"component": "Reservation Block"}))
            print(f"{page[:-5]}-{n:02d}", "COMPONENT")
            continue
        ch = fix(ch)
        used = set(re.findall(r'class="([^"]+)"', ch))
        used = {c for grp in used for c in grp.split()}
        if 'nav-link' in used: used.add('nav-link')
        rules = []
        for media, sel, body in RULES:
            if sel.strip() in ("body", "*", "img", "a"):
                continue
            cls = classes_in(sel)
            if cls and cls <= used | sent | {"w--current"} and not cls <= sent:
                rules.append((media, sel, body))
        merged = {}
        for media, sel, body in rules:
            merged.setdefault((media, sel), []).append(body.rstrip("; "))
        rules = [(m, s_, "; ".join(b) + ";") for (m, s_), b in merged.items()]
        newly = {c for _, s, _ in rules for c in classes_in(s)}
        css = ""
        for media in [None] + sorted({m for m, _, _ in rules if m}, key=lambda x: -int(re.search(r"(\d+)px", x).group(1))):
            part = "".join(f"{s} {{ {b} }}\n" for m, s, b in rules if m == media)
            if part:
                css += part if media is None else f"{media} {{\n{part}}}\n"
        sent |= newly | (used & {c for _, s, _ in RULES for c in classes_in(s)})
        css = re.sub(r"\s*\n\s*", " ", css).replace("text-decoration: none; ", "")
        css = re.sub(r"(\.(?:button|brand|nav-link|nav-phone|text-link|footer-link|social-link|category-card|dish-item|post-card|gallery-grid-item|info-value|menu-tab-link) \{ )", r"\1text-decoration: none; ", css)
        (outdir / f"{page[:-5]}-{n:02d}.json").write_text(json.dumps({"html": ch, "css": css}, ensure_ascii=False))
        print(f"{page[:-5]}-{n:02d}", len(ch), len(css))
    SENT.write_text(json.dumps(sorted(sent)))

main()
