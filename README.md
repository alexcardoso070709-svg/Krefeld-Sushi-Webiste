# Keyaki Sushi & Grill Krefeld – Website

Neue Website für **Restaurant Keyaki | Sushi & Grill** (All you can eat), Marktstr. 249, 47798 Krefeld.
Das Design folgt dem Webflow-Template „Tastoria“ (Typografie Cinzel/Lora, Rot `#c91409`, dunkle Hero-Bereiche, cremefarbene Sektionen).
Alle Inhalte (Preise, Öffnungszeiten, Speise- und Getränkekarte, Restaurantfotos) stammen von der bisherigen Website sushi-grill-keyaki.de.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero, Über-uns-Teaser, Kategorien, Sushi-Boxen, AYCE-Preise, beste Gerichte, Getränke, Reservierung |
| `ueber-uns.html` | Über das Restaurant |
| `speisekarte.html` | AYCE-Preise, Regeln, komplette Speisekarte (286 Positionen, Tabs inkl. „Zum Mitnehmen“) |
| `getraenke.html` | Komplette Getränkekarte inkl. Zusatzstoffe |
| `galerie.html` | Galerie mit Lightbox |
| `kontakt.html` | Reservierungs-/Kontaktformular, Adresse, Öffnungszeiten, Google Maps (erst nach Zustimmung) |
| `impressum.html`, `datenschutz.html` | Rechtstexte |

## Lokal ansehen

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Zum Ansehen ist kein Build nötig – die erzeugten `*.html`-Dateien liegen im Repository.
Die Seite kann unverändert auf jeden Webspace (oder GitHub Pages / Netlify) hochgeladen werden.

## Inhalte ändern

Quellen liegen in `src/` und `data/`, die `*.html` im Hauptordner werden erzeugt. Nach jeder Änderung:

```bash
python3 build.py
```

- `data/menu_food.json` – Speisekarte (Kategorien, Nummern, Namen, Beschreibungen, Preise)
- `data/menu_drinks.json` – Getränkekarte
- `data/images.json` – welches Foto wo verwendet wird (`r:` = Restaurantfoto, `s:` = Stockfoto)
- `data/home_selection.json` – Gerichte in „Die besten Gerichte“ auf der Startseite
- `src/pages/*.html` – Seiteninhalte, `src/partials/*.html` – Header, Footer, Reservierungsblock
- Nach neuen japanischen Texten `python3 tools/update_jp_font.py` ausführen (erneuert die Schrift-Teilmenge)

## Reservierungsformular

Das Formular braucht keinen Server. Es erstellt eine Nachricht und sendet sie per Telefon, WhatsApp oder E-Mail.
Kontaktdaten oben in `assets/js/main.js` (`CONFIG`) eintragen:

```js
WHATSAPP: "",   // z. B. "4915112345678" – leer = Button ausgeblendet
EMAIL: ""       // z. B. "info@sushi-grill-keyaki.de" – leer = Button ausgeblendet
```

Ohne WhatsApp/E-Mail bittet das Formular um einen Anruf und öffnet die Telefonwahl.

## Übernommene Stammdaten (alte Website)

- Inhaber: David Löwner (aus der Datenschutzerklärung der alten Seite)
- E-Mail: david.loewnerxu8@gmail.com (ebenda) – genutzt für Impressum, Datenschutz und den E-Mail-Button des Formulars
- Dinner-Beginn: 17:00 Uhr (Mehrheit der Angaben der alten Seite; dort teils 17:30 Uhr)
- Side Orders 200–204: AYCE-Liste 3 € / 4 €, Mitnehmen-Flyer 5–8 € – beide wie auf der alten Seite

## Livegang

- `build.py` → `SITE` enthält die Live-Domain (Canonical, Sitemap, Social-Vorschau).
- Sicherheits-Header und 404-Seite: `_headers` (Netlify/Cloudflare Pages) bzw. `.htaccess` (Apache-Webspace).
- `sitemap.xml` und `robots.txt` werden beim Build erzeugt.

## Technik

Reines HTML, CSS und JavaScript – kein Framework, keine externen Anfragen (Schriften lokal, Google Maps erst nach Klick).
