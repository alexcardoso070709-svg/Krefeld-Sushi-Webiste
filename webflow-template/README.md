# Hanabi – Sushi & Robata (Webflow template)

Original restaurant template for the Webflow Marketplace. Fictional brand "Hanabi"; design, copy and
structure are independent of the Keyaki client site and of the "Tastoria" template.

## Preview (static prototype)

```bash
cd webflow-template
python3 build.py           # generates *.html from src/ + data/
python3 -m http.server 8000
```

The prototype is written the way Webflow stores styles: class selectors and combo classes only,
Webflow breakpoints only (991 / 767 / 479 px), no pseudo-elements, no keyframes. `css/interactions.css`
holds parent-hover effects that become Webflow Interactions.

## Pages

Home · About · Menu · Dish (CMS template) · Reservations · Contact · Gallery · Journal ·
Post (CMS template) · Style guide · Licenses · Changelog · 404 (+ Webflow password page)

## Design system

| Token | Value |
|---|---|
| Paper (background) | `#F2EDE4` |
| Sand (alt sections) | `#E8E1D5` |
| Rice (cards) | `#FFFDF9` |
| Ink (text, dark sections) | `#141613` |
| Ember (accent) | `#D4502A` |
| Matcha (tags) | `#6F7D4E` |
| Headings | Instrument Serif 400 (+ italic accent) |
| Body | Manrope 400–700 |
| Japanese accents | Noto Serif JP 500 |

## Webflow build plan

- **Components:** Navbar (native Webflow Navbar), Footer, Reservation block, Dish item, Post card, CTA band.
- **CMS collections:**
  - *Menu Categories* – name, slug, Japanese name, description, image, order (number)
  - *Dishes* – name, slug, category (reference), Japanese name, price (plain text), description,
    image, tags (option: Vegan / Vegetarian / Spicy / Chef's pick), featured (switch), allergens, pairing, portion
  - *Journal Posts* – name, slug, category, date, image, summary, body (rich text)
- **Forms:** native Webflow forms (reservation, contact, newsletter) with success/error states.
- **Interactions:** page-load fade-up on hero, scroll reveal on sections, card hover (image zoom,
  title color, arrow fill), ticker marquee loop.
- **Menu page:** native Tabs, one CMS list per category (filtered by category reference).

## Webflow build (status)

Built in the Webflow site "Alex's Groovy Site" (`6a3434fba4e1760c6191fcc1`),
staging: https://alexs-groovy-site-68b68b.webflow.io

Done via the Webflow Data API / MCP:

- All static pages, CMS template pages (Dish, Journal post, Menu category) and three shared
  components (Header, Footer, Reservation Block).
- CMS collections Menu Categories (4), Dishes (22), Journal Posts (3), all published.
- Collection lists: Menu (one list per category), Home (featured dishes, latest posts),
  Journal (featured + grid), Post template ("More stories").
- Native forms: Reservation Form, Contact Form, Newsletter Form with success/error states.
- Mobile menu: IX3 click interaction on `.menu-button` toggling `.nav-menu.is-open`
  (component-scoped to Header). Active nav link style lives in a small embed in the Header.
- Interactions (IX3, site-wide): hover on post cards, dish items, category cards and gallery
  items (scoped to the hovered element); scroll fade-up reveal on post, quote, category and dish
  cards (skipped for prefers-reduced-motion).
- SEO: static page titles/descriptions, dynamic titles/descriptions on all CMS templates,
  shared Open Graph image.
- Rich-text styling for journal posts via an embed on the post template (`.rich-text h2/h3/blockquote`).

`tools/wf_chunks.py`, `tools/wf_actions.py` and `tools/wf_before.py` turn the static prototype into
WHTML build actions; `data/webflow_site.json` and `data/webflow_assets.json` hold the Webflow IDs.

### Left for the Designer (cannot be set through the API)

1. Menu category template: add a Dishes collection list filtered by
   "Category = Current Menu Category" (the API does not accept current-item filters).
2. Utility pages (404, password) are Webflow defaults – restyle in the Designer if wanted.
3. Marketplace submission needs a Webflow creator account; the "Made in Webflow" badge
   disappears on a paid site plan.

## Images

`images/` – Pexels / Unsplash licence, free for commercial use, credits in `images/CREDITS.md`.
They are placeholders; buyers replace them with their own photography.
