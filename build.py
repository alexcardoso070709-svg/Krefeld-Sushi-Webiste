#!/usr/bin/env python3
"""Statischer Seitengenerator für die Keyaki-Website.

Setzt die Seiten aus src/pages + src/partials zusammen und erzeugt die
Speise- und Getränkekarte aus data/*.json. Ausgabe: *.html im Projektstamm.

Syntax in den Quelldateien:
  <!--{"title": "...", "desc": "...", "active": "home"}-->  (erste Zeile, Metadaten)
  {{> name}}        Partial aus src/partials/name.html
  {{img:key}}       Bildpfad aus IMG
  {{active:key}}    " is-active", wenn die Seite zu diesem Menüpunkt gehört
  {{render:name}}   Ausgabe einer Render-Funktion (Speisekarte, Getränke ...)

Aufruf: python3 build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
DATA = ROOT / "data"

SITE = "https://www.sushi-grill-keyaki.de"  # Live-Domain (Canonical, Sitemap, Social-Vorschau)

R = "assets/images/restaurant/"
S = "assets/images/stock/"

# Zentrale Bildzuordnung – hier lassen sich Fotos austauschen.
IMG = json.loads((DATA / "images.json").read_text(encoding="utf-8"))
IMG = {k: (v if v.startswith(("assets/", "http")) else (R if v.startswith("r:") else S) + v[2:]) for k, v in IMG.items()}


def esc(s):
    return html.escape(s or "", quote=True)


def price_fmt(p):
    p = (p or "").strip()
    if not p:
        return ""
    return p if "€" in p else p + " €"


# ---------------------------------------------------------------- Speisen
def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


TAG_LABEL = {"vegetarisch": ("veg", "veg."), "vegan": ("veg", "vegan"), "scharf": ("hot", "scharf")}


def tags_html(tags):
    out = []
    for t in tags or []:
        key = t.lower()
        cls, label = TAG_LABEL.get(key, ("", t))
        out.append(f'<span class="menu-tag {cls}">{esc(label)}</span>')
    return f'<span class="menu-tags">{"".join(out)}</span>' if out else ""


def food_item(it, thumb=None):
    no = (it.get("no") or "").strip()
    lead = (f'<img class="menu-thumb" src="{thumb}" alt="{esc(it.get("name"))}" loading="lazy">' if thumb
            else (f'<span class="menu-no">{esc(no)}</span>' if no else ""))
    desc = f'<p class="menu-desc">{esc(it.get("desc"))}</p>' if it.get("desc") else ""
    price = price_fmt(it.get("price"))
    return (f'<div class="menu-item"><div class="menu-item-main">{lead}<div>'
            f'<h4>{esc(it.get("name"))}{tags_html(it.get("tags"))}</h4>{desc}</div></div>'
            f'{f"<span class=menu-price>{esc(price)}</span>" if price else ""}</div>')


def render_food_tabs():
    data = load("menu_food.json")
    cats = [c for c in data["categories"] if c.get("groups") and any(g.get("items") for g in c["groups"])]
    links, panes = [], []
    for i, c in enumerate(cats):
        cid = c["id"]
        act = " is-active" if i == 0 else ""
        links.append(f'<button class="tab-link{act}" data-tab="{cid}" role="tab" aria-selected="{"true" if i == 0 else "false"}">{esc(c.get("tab") or c["title"])}</button>')
        body = []
        if c.get("subtitle"):
            body.append(f'<p class="menu-note">{esc(c["subtitle"])}</p>')
        for g in c["groups"]:
            if not g.get("items"):
                continue
            if g.get("title"):
                body.append(f'<h3 class="menu-group-title">{esc(g["title"])}</h3>')
            if g.get("note"):
                body.append(f'<p class="menu-note">{esc(g["note"])}</p>')
            body += [food_item(it) for it in g["items"]]
        panes.append(f'<div class="tab-pane{act}" id="{cid}" role="tabpanel"><div class="menu-list">{"".join(body)}</div></div>')
    return (f'<div class="section-heading split"><div><span class="pretitle">私たちのメニュー</span><h2>Unsere Speisen</h2></div>'
            f'<div class="tabs-menu" role="tablist">{"".join(links)}</div></div>'
            f'<div class="tabs-content">{"".join(panes)}</div>')


def render_food_legend():
    return "".join(f"<li>{esc(n)}</li>" for n in load("menu_food.json")["legend"])


def render_home_tabs():
    """Kurzauswahl für die Startseite: Gerichte mit passendem Foto."""
    data = load("menu_food.json")
    by_id = {c["id"]: c for c in data["categories"]}
    links, panes = [], []
    for i, tab in enumerate(load("home_selection.json")["tabs"]):
        tid = f"home-tab-{i + 1}"
        act = " is-active" if i == 0 else ""
        links.append(f'<button class="tab-link{act}" data-tab="{tid}" role="tab">{esc(tab["label"])}</button>')
        cells = []
        for cat, no, img in tab["items"]:
            items = [it for g in by_id[cat]["groups"] for it in g["items"]]
            cells.append(food_item(next(it for it in items if it.get("no") == no), IMG[img]))
        panes.append(f'<div class="tab-pane{act}" id="{tid}" role="tabpanel"><div class="menu-list">{"".join(cells)}</div></div>')
    return (f'<div class="section-heading split"><div><span class="pretitle">私たちのメニュー</span><h2>Die besten Gerichte</h2></div>'
            f'<div class="tabs-menu" role="tablist">{"".join(links)}</div></div>'
            f'<div class="tabs-content">{"".join(panes)}</div>')


# ---------------------------------------------------------------- Getränke
def render_drinks_tabs():
    data = load("menu_drinks.json")
    cats = [c for c in data["categories"] if c["id"] != "zusatzstoffe"]
    links, panes = [], []
    for i, c in enumerate(cats):
        act = " is-active" if i == 0 else ""
        links.append(f'<button class="tab-link{act}" data-tab="{c["id"]}" role="tab">{esc(c.get("tab") or c["title"])}</button>')
        body = []
        for g in c["groups"]:
            if not g.get("items"):
                continue
            if g.get("title"):
                body.append(f'<h3 class="menu-group-title">{esc(g["title"])}</h3>')
            for it in g["items"]:
                sizes = it.get("sizes") or []
                prices = "".join(f'<span><small>{esc(s.get("vol"))}</small>{esc(price_fmt(s["price"]))}</span>'
                                 for s in sizes if s.get("price"))
                desc = esc(it.get("desc"))
                body.append(f'<div class="menu-item"><div class="menu-item-main"><div><h4>{esc(it["name"])}</h4>'
                            f'{f"<p class=menu-desc>{desc}</p>" if desc else ""}</div></div>'
                            f'<span class="menu-price menu-sizes">{prices}</span></div>')
        for n in c.get("public_notes") or []:
            body.append(f'<p class="menu-note">{esc(n)}</p>')
        panes.append(f'<div class="tab-pane{act}" id="{c["id"]}" role="tabpanel"><div class="menu-list">{"".join(body)}</div></div>')
    return (f'<div class="section-heading split"><div><span class="pretitle">飲み物</span><h2>Unsere Getränke</h2></div>'
            f'<div class="tabs-menu" role="tablist">{"".join(links)}</div></div>'
            f'<div class="tabs-content">{"".join(panes)}</div>')


def render_additives():
    data = load("menu_drinks.json")
    legend = next((c for c in data["categories"] if c["id"] == "zusatzstoffe"), None)
    if not legend:
        return ""
    items = "".join(f"<li>{esc(n)}</li>" for n in legend["notes"])
    return f'<ul class="additives">{items}</ul>'


RENDER = {
    "food_tabs": render_food_tabs,
    "home_tabs": render_home_tabs,
    "drinks_tabs": render_drinks_tabs,
    "additives": render_additives,
    "food_legend": render_food_legend,
}


# ---------------------------------------------------------------- Seiten
def partial(name):
    return (SRC / "partials" / f"{name}.html").read_text(encoding="utf-8")


def expand(text, meta, depth=0):
    if depth > 5:
        return text
    text = re.sub(r"\{\{> ([\w-]+)\}\}", lambda m: expand(partial(m.group(1)), meta, depth + 1), text)
    text = re.sub(r"\{\{render:([\w-]+)\}\}", lambda m: RENDER[m.group(1)](), text)
    text = re.sub(r"\{\{img:([\w-]+)\}\}", lambda m: IMG[m.group(1)], text)
    text = re.sub(r"\{\{active:(\w+)\}\}", lambda m: " is-active" if meta.get("active") == m.group(1) else "", text)
    text = text.replace("{{site}}", SITE)
    text = text.replace("{{canonical}}", "" if meta.get("slug") == "index" else meta.get("slug", "") + ".html")
    for k in ("title", "desc", "slug"):
        text = text.replace("{{" + k + "}}", esc(meta.get(k, "")))
    return text


def build():
    for page in sorted((SRC / "pages").glob("*.html")):
        raw = page.read_text(encoding="utf-8")
        m = re.match(r"<!--(\{.*?\})-->\s*", raw, re.S)
        meta = json.loads(m.group(1)) if m else {}
        meta.setdefault("slug", page.stem)
        body = raw[m.end():] if m else raw
        out = expand(partial("head") + partial("header") + body + partial("footer"), meta)
        missing = re.findall(r"\{\{[^}]+\}\}", out)
        if missing:
            raise SystemExit(f"{page.name}: unaufgelöste Platzhalter {missing}")
        (ROOT / page.name).write_text(out, encoding="utf-8")
        print("✓", page.name)
    pages = [p.stem for p in sorted((SRC / "pages").glob("*.html")) if p.stem != "404"]
    urls = "".join(f"  <url><loc>{SITE}/{'' if p == 'index' else p + '.html'}</loc></url>\n" for p in pages)
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
    print("✓ sitemap.xml, robots.txt")


if __name__ == "__main__":
    build()
