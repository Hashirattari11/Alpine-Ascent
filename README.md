# Alpine Ascents

A multi-page mountaineering and expedition website built with **HTML, CSS, JavaScript, Bootstrap 5, jQuery, JSON and SVG** only. There is no back end and no database.

## Tech stack

- **HTML5** — 14 pages sharing the same navbar, footer and modals
- **CSS3** — custom design system in `css/base.css`, `css/layout.css`, `css/sections.css`
- **JavaScript** — ES modules in `js/` (no framework)
- **Bootstrap 5** — grid, modals, tabs, carousel, toasts
- **jQuery** — DOM ready, events and `$.getJSON`
- **JSON** — all page content lives in `data/*.json`
- **SVG** — logo, favicon and the dotted world map on the clubs page

## Run the website

Because the pages load JSON files with JavaScript, open the site through a small local server (not by double-clicking the HTML file).

**Option 1 — VS Code**
1. Install the **Live Server** extension.
2. Right-click `index.html` → **Open with Live Server**.

**Option 2 — Python** (already installed on most systems)
```bash
python -m http.server 5173
```
Then open `http://localhost:5173`.

## Pages

| Page | Content |
| --- | --- |
| `index.html` | Hero, mission, animated stats, signature expeditions |
| `expeditions.html` | 12 expeditions with region filters and open/close itineraries |
| `history.html` | Animated timeline of mountaineering milestones |
| `types.html` | 10 flip cards explaining climbing styles |
| `techniques.html` | 12 core skills with tabs, plus the guidelines checklist |
| `sheltering.html` | 9 shelter types with field tips |
| `hazards.html` | 8 hazards with risk meters and safety tips |
| `records.html` | Tabbed record categories with count-up numbers |
| `clubs.html` | SVG world map of 22 clubs with filters and "near me" |
| `stories.html` | Client story carousel |
| `gallery.html` | Photo and video gallery with filters and a lightbox |
| `latest.html` | 12 news articles with a read-more modal |
| `guidelines.html` | 6 checklists with saved progress and a printable gear list |
| `contact.html` | Enquiry form, guide profiles and FAQ |

## Structure

```
/
├── *.html              # 14 pages
├── css/                # base.css, layout.css, sections.css
├── js/
│   ├── main.js         # entry point: starts every section on the page
│   ├── data.js         # loads JSON files
│   ├── core.js         # mount() helper: skeleton -> data -> HTML
│   ├── sections.js     # all page sections in one file
│   ├── nav.js          # navbar, dropdowns, mobile menu
│   ├── visitors.js     # visitor counter
│   ├── effects.js      # reveal, counters, tilt, cursor
│   ├── utils.js        # picture(), esc(), formatting helpers
│   └── …               # hero, ticker, preloader, location
├── data/               # clubs, expeditions, news, gallery … (JSON)
├── images/             # photography (webp), logo and world-map.svg
├── vendor/             # Bootstrap, Bootstrap Icons, jQuery (local copies)
├── netlify.toml        # static hosting headers
└── favicon.svg
```

## How the data works

Each page asks `js/data.js` for a JSON file:

```js
getResource('expeditions')   // loads data/expeditions.json
```

`js/core.js` shows a skeleton while the file loads, then renders the cards. To change content, edit the JSON file — no HTML changes are needed.

## Notes

- **Forms** validate on the client and show a success message. There is no server, so nothing is emailed or stored.
- **Visitor counter** reads the number in `data/visitors.json` and adds the visits counted in your browser (`localStorage`). It always shows a real number.
- **Map** is a dotted world map drawn in SVG. Club pins are placed from the `lat` and `lng` values in `data/clubs.json`.
- **"Find clubs near me"** uses the browser Geolocation API to sort the list by distance.
- **Videos** open in a lightbox with a YouTube embed.
- The layout works on mobile, tablet and desktop; the navbar becomes a full-screen menu below 900px.

## Deploy

The site is completely static. Upload the whole folder to any static host, or connect the repository to Netlify / GitHub Pages — no build command is required.
