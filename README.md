# Alpine Ascents

A premium, dark, cinematic multi-page website for the "Alpine Ascents" mountaineering & expeditions brand.

- **Front end:** plain HTML, CSS, JavaScript, **Bootstrap 5** and **jQuery**
- **Structure:** 14 real HTML pages sharing one shell (navbar, footer, ticker, modals), generated from partials by a small build script
- **Map:** **Leaflet** + dark-themed OpenStreetMap tiles (no API key) with browser Geolocation + OpenStreetMap Nominatim reverse geocoding
- **Back end:** Node.js + Express serving a JSON file data store, REST API, visitor counter, enquiry/newsletter forms
- One command dev: `npm run dev` starts server and front end together

## Requirements

- Node.js 18+ and npm 9+

## Install & Run

```bash
npm install        # installs root, /server and /client dependencies
npm run dev        # starts API on :3001 and the front end on :5173
```

Open the site at `http://localhost:5173`.

To serve the production build from the API server itself on port 3001:

```bash
npm start
```

## Pages

| Page | Content |
| --- | --- |
| `index.html` | Full-screen hero, mission statement, animated statistics, signature expeditions preview, why-us/team section |
| `expeditions.html` | Ten guided expeditions with region filters, day-by-day itineraries, inclusions, pricing |
| `history.html` | Vertical animated timeline of 17 mountaineering milestones |
| `types.html` | Ten flip-card climbing styles |
| `techniques.html` | Twelve core skills, tabbed |
| `sheltering.html` | Seven shelter types with expandable field tips |
| `hazards.html` | Eight hazards with risk meters, signs and safety tips |
| `records.html` | Five tabbed record categories with count-up numbers |
| `clubs.html` | Leaflet world map of 22 clubs, region filters, geolocation |
| `stories.html` | Client story carousel (12 stories) |
| `gallery.html` | 36-item masonry gallery with category filters and video lightbox |
| `latest.html` | Ten news articles with read-more modal |
| `guidelines.html` | Six checklists with saved progress plus a printable gear list |
| `contact.html` | Enquiry form, guide profiles and a six-question FAQ |

## Project structure

```
/
├── package.json            # root scripts (concurrently runs server+client)
├── scripts/
│   ├── build-pages.mjs     # assembles the 13 pages from the shared shell + partials
│   └── download-images.mjs # downloads/optimises imagery into client/images
├── client/
│   ├── pages/              # per-page content partials (source for the build)
│   ├── *.html              # generated pages (do not edit by hand)
│   ├── package.json
│   ├── dev-server.mjs      # tiny static server that proxies /api -> :3001
│   ├── scripts/setup.mjs   # copies vendor assets (bootstrap, jquery, leaflet)
│   ├── vendor/             # bootstrap, jquery, leaflet, bootstrap-icons (local)
│   ├── css/                # base.css, layout.css, sections.css design system
│   ├── js/                 # utils, api, effects (reveal/parallax/counters/cursor),
│   │                       # core, nav, preloader, visitors, ticker, hero + sections/
│   ├── images/             # downloaded/optimised photography (webp) + logo
│   └── data/               # mirror of public JSON collections + images.json (LQIP)
├── server/
│   ├── index.js            # Express app: REST API, visitors, enquiry, static client
│   ├── package.json
│   ├── lib/                # store.js (atomic JSON updates), validate.js
│   └── data/               # clubs.json ... news.json, guidelines.json, visitors.json
└── docs/                   # documentation report (see below)
```

After editing anything in `client/pages/`, run `npm run pages` to regenerate the HTML.
`npm run dev` and `npm start` both rebuild automatically.

## Deploy

The site is split deliberately so each half goes to the host that suits it:
**static front end on Vercel**, **Express API on Railway or Render** (a persistent
disk, because the visitor counter and enquiry form write JSON files).

### 1. Front end → Vercel

`vercel.json` is already committed (output directory `client`, build
`npm run pages && npm --prefix client run setup`).

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

In the Vercel project settings add one environment variable, pointing at your API:

```
AA_API_BASE=https://your-api.up.railway.app
```

(The value must include `/api`; if you omit it the build appends it automatically.)
Without this variable the front end calls `/api` on its own origin and every request 404s.

### 2. API → Railway / Render

These hosts give you a real writable filesystem, so the JSON store keeps working.

**Railway** — new project → *Deploy from GitHub repo* → it detects `server/`.
Set the start command to `npm start` and the root directory to the repo root.

**Render** — new *Web Service* → root directory `server`, build `npm install`,
start `npm start`.

Either way the API listens on the platform-assigned port (`PORT` is read from the
environment) and serves both `/api/*` and, if you prefer a single origin, the
static client as well.

### Notes

- CORS is already open (`cors()` in `server/index.js`), so a Vercel origin and a
  Railway origin can talk to each other without extra configuration.
- The front end ships a bundled copy of every content collection in `client/data/`,
  so all pages still render (with an offline notice) if the API is unreachable.
- Forms and the visitor counter need the API to be up. Everything else is static.

## API

All endpoints are served from the Express server (default `http://localhost:3001`, proxied at `/api` from the dev front end).

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api` | API index |
| GET | `/api/health` | Health check |
| GET | `/api/<resource>` | Public content collection. One of: `clubs`, `history`, `types`, `techniques`, `shelter`, `hazards`, `records`, `stories`, `gallery`, `news`, `guidelines`, `stats` |
| GET | `/api/visitors` | Current visitor count |
| POST | `/api/visitors/hit` | Increments the count once per browser session (send `{ "sessionId": "..." }`) |
| POST | `/api/enquiry` | Validates & stores an enquiry into `enquiries.json` |
| GET | `/api/enquiry/interests` | List of expedition interests for the form select |
| POST | `/api/newsletter` | Validates & stores a newsletter subscription |

## Notes / assumptions

- Content copy is factual and written inline in `server/data/*.json`. All JSON collections are mirrored into `client/data/*` at install time so the page still renders from bundled JSON data (with an offline toast shown) when the API is unreachable.
- Visitor counting uses `sessionStorage`: one increment per browser tab session.
- Geolocation is only requested on user action ("Find clubs near me", "Share location" link in the ticker) unless the browser already grants it; permission-denied states fall back to a polite message.
- `prefers-reduced-motion` is respected: marquee animation, preloader draw-in, cross-fades and countdowns shorten or settle instantly.
- Club popup/list items link out to external sites with `target="_blank" rel="noopener noreferrer"`.
- Assets under `client/images` were downloaded from Unsplash at build time so the site does not hotlink imagery.
# Alpine-Ascent
