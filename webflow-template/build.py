#!/usr/bin/env python3
"""Static preview builder for the Hanabi Webflow template.

The preview mirrors what the Webflow site renders: partials = Webflow components
(navbar, footer, reservation block), data/menu.json = CMS collections
(Categories, Dishes, Journal Posts). Output: *.html in this folder.

  {{> name}}        partial from src/partials
  {{img:key}}       image path from data/images.json
  {{cur:key}}       " w--current" on the active nav link
  {{dishes:cat}}    dish list for one category (CMS list filtered by category)
  {{featured}}      featured dishes (CMS list filtered by "Featured")
  {{categories}}    category cards
  {{posts}}         latest journal posts
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
DATA = json.loads((ROOT / "data/menu.json").read_text(encoding="utf-8"))
IMG = json.loads((ROOT / "data/images.json").read_text(encoding="utf-8"))


def esc(s):
    return html.escape(s or "", quote=True)


def img(key):
    return "images/" + IMG[key]


TAG_CLASS = {"Spicy": " is-spicy", "Chef's pick": " is-chef"}


def dish(d, thumb=True):
    tags = "".join(f'<span class="tag{TAG_CLASS.get(t, "")}">{esc(t)}</span>' for t in d["tags"])
    t = f'<div class="dish-thumb"><img class="cover-image" src="{img(d["img"])}" alt="{esc(d["name"])}" loading="lazy"></div>' if thumb else ""
    return (f'<a href="dish.html" class="dish-item">{t}<div class="dish-body"><div class="dish-head">'
            f'<span class="dish-name">{esc(d["name"])}</span><span class="dish-dots"></span>'
            f'<span class="dish-price">${esc(d["price"])}</span></div>'
            f'<p class="dish-desc">{esc(d["desc"])}</p>'
            f'{f"<div class=tag-row>{tags}</div>" if tags else ""}</div></a>')


def dishes(cat):
    return '<div class="dish-list">' + "".join(dish(d) for d in DATA["dishes"] if d["cat"] == cat) + "</div>"


def featured():
    return '<div class="dish-list">' + "".join(dish(d) for d in DATA["dishes"] if d.get("featured")) + "</div>"


def categories():
    out = []
    for c in DATA["categories"][:3]:
        n = sum(1 for d in DATA["dishes"] if d["cat"] == c["id"])
        out.append(f'<a href="menu.html" class="category-card"><div class="category-image-wrap">'
                   f'<img class="category-image" src="{img(c["image"])}" alt="{esc(c["name"])}" loading="lazy">'
                   f'<span class="category-count">{n} dishes</span></div>'
                   f'<div class="category-meta"><div class="stack-s"><span class="h4">{esc(c["name"])}</span>'
                   f'<span class="small muted">{esc(c["desc"])}</span></div><span class="circle-arrow">→</span></div></a>')
    return '<div class="grid-3">' + "".join(out) + "</div>"


def posts():
    out = []
    for p in DATA["posts"]:
        out.append(f'<a href="post.html" class="post-card"><div class="post-image-wrap">'
                   f'<img class="zoom-image" src="{img(p["img"])}" alt="{esc(p["title"])}" loading="lazy"></div>'
                   f'<div class="post-meta"><span>{esc(p["cat"])}</span><span class="meta-dot"></span><span>{esc(p["date"])}</span></div>'
                   f'<span class="post-title">{esc(p["title"])}</span><p class="paragraph small muted">{esc(p["summary"])}</p></a>')
    return '<div class="grid-3">' + "".join(out) + "</div>"


def menu_tabs():
    links, panes = [], []
    for i, c in enumerate(DATA["categories"]):
        links.append(f'<a class="menu-tab-link{" w--current" if i == 0 else ""}" data-tab="{c["id"]}">{esc(c["name"])}</a>')
        panes.append(f'<div data-pane="{c["id"]}"{"" if i == 0 else " style=display:none"}>{dishes(c["id"])}</div>')
    return (f'<div class="menu-tabs" data-tabs><div class="menu-tab-menu">{"".join(links)}</div>'
            f'<div>{"".join(panes)}</div></div>')


def partial(name):
    return (ROOT / "src/partials" / f"{name}.html").read_text(encoding="utf-8")


def expand(text, meta):
    for _ in range(3):
        text = re.sub(r"\{\{> ([\w-]+)\}\}", lambda m: partial(m.group(1)), text)
    text = re.sub(r"\{\{img:([\w-]+)\}\}", lambda m: img(m.group(1)), text)
    text = re.sub(r"\{\{cur:(\w+)\}\}", lambda m: " w--current" if meta.get("nav") == m.group(1) else "", text)
    text = re.sub(r"\{\{dishes:(\w+)\}\}", lambda m: dishes(m.group(1)), text)
    text = text.replace("{{featured}}", featured()).replace("{{categories}}", categories())
    text = text.replace("{{posts}}", posts()).replace("{{menu_tabs}}", menu_tabs())
    return text.replace("{{title}}", esc(meta.get("title"))).replace("{{desc}}", esc(meta.get("desc")))


def build():
    for page in sorted((ROOT / "src/pages").glob("*.html")):
        raw = page.read_text(encoding="utf-8")
        m = re.match(r"<!--(\{.*?\})-->\s*", raw, re.S)
        meta = json.loads(m.group(1))
        out = expand(partial("head") + partial("header") + raw[m.end():] + partial("footer"), meta)
        left = re.findall(r"\{\{[^}]+\}\}", out)
        if left:
            raise SystemExit(f"{page.name}: unresolved {left}")
        (ROOT / page.name).write_text(out, encoding="utf-8")
        print("ok", page.name)


if __name__ == "__main__":
    build()
