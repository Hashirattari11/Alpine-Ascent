# Alpine Ascents

A multi-page mountaineering and expedition website built with **HTML, CSS, JavaScript, Bootstrap 5, jQuery, JSON and SVG** only. There is no back end: content lives in JSON files and form submissions are saved in the browser.

## Tech stack

- **HTML5** — 14 pages sharing the same navbar, footer and modals
- **CSS3** — custom design system in `css/base.css`, `css/layout.css`, `css/sections.css`
- **JavaScript** — ES modules in `js/` (no framework)
- **Bootstrap 5** — grid, modals, tabs and carousel
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
│   ├── db.js           # browser database (enquiries, subscribers, visits)
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

## How the database works

The site uses JSON for its database. There are two layers.

### 1. Content database — `data/*.json`

Each page asks `js/data.js` for a JSON file:

```js
getResource('expeditions')   // loads data/expeditions.json
```

`js/core.js` shows a skeleton while the file loads, then renders the cards. To change content, edit the JSON file — no HTML changes are needed. The files are:

| File | Table |
| --- | --- |
| `data/expeditions.json` | 12 expeditions |
| `data/clubs.json` | 22 clubs with coordinates |
| `data/news.json` | 12 articles |
| `data/gallery.json` | photos and videos |
| `data/history.json` | timeline events |
| `data/stories.json` | client stories |
| `data/records.json` | record categories |
| `data/techniques.json` | 12 skills |
| `data/guidelines.json` | checklists |
| `data/shelter.json` | shelter types |
| `data/hazards.json` | mountain hazards |
| `data/types.json` | climbing styles |
| `data/stats.json` | home page statistics |
| `data/images.json` | image metadata |
| `data/visitors.json` | visitor counter base number |

### 2. Browser database — `js/db.js`

Static hosting has no server, so form submissions are stored in the browser with `localStorage` under the key `aa_database`. It has three tables:

| Table | Contents |
| --- | --- |
| `enquiries` | every valid contact form submission: id, name, email, phone, interest, message and date |
| `subscribers` | newsletter emails; duplicate addresses are ignored |
| `visits` | number of browser sessions that opened the site |

The visitor badge shows the base number from `data/visitors.json` plus the `visits` count. A visit is counted once per tab session, so moving between pages does not change the number.

To inspect the database: open DevTools → **Application** → **Local Storage** → your site URL → `aa_database`. You can also run this in the Console:

```js
JSON.parse(localStorage.getItem('aa_database'))
```

Because the data is stored locally, enquiries and subscribers stay in that browser and are not shared between devices. A server and a real database would be needed for that.

## Notes

- **Forms** validate on the client and save the record in the browser database (`js/db.js`) before showing the success message. Nothing is emailed.
- **Visitor counter** reads the base number in `data/visitors.json` and adds the visits stored in `aa_database`. It always shows a real number.
- **Map** is a dotted world map drawn in SVG. Club pins are placed from the `lat` and `lng` values in `data/clubs.json`.
- **"Find clubs near me"** uses the browser Geolocation API to sort the list by distance.
- **Videos** open in a lightbox with a YouTube embed.
- The layout works on mobile, tablet and desktop; the navbar becomes a full-screen menu below 900px.

## Deploy

The site is completely static. Upload the whole folder to any static host, or connect the repository to Netlify / GitHub Pages — no build command is required.
