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

## Images

`images/` – Pexels / Unsplash licence, free for commercial use, credits in `images/CREDITS.md`.
They are placeholders; buyers replace them with their own photography.
