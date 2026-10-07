// Builds the multi-page site: a shared shell (head, navbar, footer, ticker, modals)
// assembled with per-page content from client/pages/*.html.
// Run: npm run pages   (also runs automatically on install/dev).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAGES_DIR = path.join(ROOT, 'client', 'pages')
const OUT_DIR = path.join(ROOT, 'client')

/** Navigation model — single source of truth for the menu and footer links. */
export const PAGES = [
  { slug: 'index', nav: 'home', label: 'Home', title: 'Alpine Ascents | Luxury Mountaineering Expeditions & Guided Climbs', desc: 'Alpine Ascents leads safe, challenging and unforgettable mountaineering expeditions for climbers of every level: Everest, Mont Blanc, Matterhorn, Denali and beyond.', og: 'hero-matterhorn' },
  { slug: 'expeditions', nav: 'expeditions', label: 'Expeditions', title: 'Guided Expeditions | Alpine Ascents', desc: 'Ten guided expeditions from beginner alpine courses to Everest, Denali and Aconcagua: difficulty, season, duration, price, itinerary and what is included.', og: 'karakoram-dawn' },
  { slug: 'history', nav: 'history', label: 'History', title: 'History of Mountaineering | Alpine Ascents', desc: 'Two centuries of mountaineering history: Mont Blanc 1786, the Matterhorn, Mallory and Irvine, Hillary and Tenzing on Everest, K2 in 1954 and the winter ascent of K2 in 2021.', og: 'himalaya-snow' },
  { slug: 'types', nav: 'types', label: 'Types', title: 'Types & Styles of Climbing | Alpine Ascents', desc: 'Alpine, rock, ice, expedition, bouldering, trekking peaks and ski mountaineering: seven ways to meet the mountain, with grades, seasons and classic objectives.', og: 'dolomites' },
  { slug: 'techniques', nav: 'techniques', label: 'Techniques', title: 'Mountaineering Techniques | Alpine Ascents', desc: 'Rope work, belaying, crampon and ice axe technique, self-arrest, route finding, acclimatisation and navigation: the seven core skills every mountaineer should master.', og: 'snow-aerial' },
  { slug: 'sheltering', nav: 'sheltering', label: 'Sheltering', title: 'Sheltering in the Mountains | Alpine Ascents', desc: 'Bivouacs, four-season tents, snow caves, igloos and mountain huts: how to build a warm, safe camp above the clouds.', og: 'red-tent' },
  { slug: 'hazards', nav: 'hazards', label: 'Hazards', title: 'Mountain Hazards & Safety | Alpine Ascents', desc: 'Avalanches, altitude sickness, crevasses, weather, rockfall, hypothermia and frostbite: warning signs, risk levels and safety practices.', og: 'snow-forest' },
  { slug: 'records', nav: 'records', label: 'Records', title: 'Mountaineering Records | Alpine Ascents', desc: 'Highest peaks, historic first ascents, fastest records, youngest and oldest summiteers and the women who redefined the sport.', og: 'summit-sunrise' },
  { slug: 'clubs', nav: 'clubs', label: 'Clubs & Map', title: 'Mountaineering Clubs & Map | Alpine Ascents', desc: 'An interactive world map of mountaineering clubs and organisations, with region filters and clubs nearest to you.', og: 'nz-peaks' },
  { slug: 'stories', nav: 'stories', label: 'Stories', title: 'Success Stories | Alpine Ascents', desc: 'Voices from our camps and expeditions: first-time climbers, families and seasoned alpinists on summits from Mont Blanc to the Himalaya.', og: 'milky-way' },
  { slug: 'gallery', nav: 'gallery', label: 'Gallery', title: 'Gallery | Alpine Ascents', desc: 'Mountain photography and short films: peaks, camps, glaciers and technique tutorials from the world’s great ranges.', og: 'patagonia-torres' },
  { slug: 'latest', nav: 'latest', label: 'Latest', title: 'Latest Developments | Alpine Ascents', desc: 'News from the high places: glacier retreat, new gear technology, fresh routes, rescue technology and record ascents.', og: 'winter-lake' },
  { slug: 'guidelines', nav: 'guidelines', label: 'Guidelines', title: 'General Guidelines & Gear List | Alpine Ascents', desc: 'Fitness training, gear, permits, leave-no-trace, insurance and emergency protocol — plus a printable expedition gear checklist.', og: 'moraine' },
  { slug: 'contact', nav: 'contact', label: 'Contact', title: 'Contact & Enquiries | Alpine Ascents', desc: 'Talk to a guide about your expedition: Mont Blanc, Matterhorn, Denali, Aconcagua, the Himalaya and more.', og: 'aurora' },
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const navLink = (p, active, cls = 'nav-list') => {
  const on = p.nav === active
  return `<li><a href="${p.slug}.html" data-nav="${p.nav}"${on ? ' class="is-active" aria-current="page"' : ''}>${esc(p.label)}</a></li>`
}

const shell = ({ page, content, apiBase }) => {
  const active = page.nav
  const nav = PAGES.map((p) => navLink(p, active)).join('\n            ')
  const mobile = PAGES.map((p, i) => `<li style="--i:${i}"><a href="${p.slug}.html" data-nav="${p.nav}"${p.nav === active ? ' class="is-active" aria-current="page"' : ''}><small>${String(i + 1).padStart(2, '0')}</small>${esc(p.label)}</a></li>`).join('')
  const explore = ['expeditions', 'history', 'types', 'techniques', 'records']
  const prepare = ['sheltering', 'hazards', 'guidelines', 'clubs', 'stories']
  const link = (n) => PAGES.find((p) => p.nav === n)
  const list = (keys) => keys.map((n) => `<li><a href="${link(n).slug}.html">${esc(link(n).label)}</a></li>`).join('')

  return `<!doctype html>
<html lang="en" data-bs-theme="dark" data-page="${active}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.desc)}" />
    <meta name="theme-color" content="#0B0F14" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Alpine Ascents" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.desc)}" />
    <meta property="og:image" content="images/${page.og}.webp" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:image" content="images/${page.og}.webp" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" />
${page.slug === 'index' ? '    <link rel="preload" as="image" href="images/hero-matterhorn.webp" fetchpriority="high" />\n' : ''}
    <link rel="stylesheet" href="vendor/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" href="vendor/bootstrap-icons/bootstrap-icons.min.css" />
    <link rel="stylesheet" href="vendor/leaflet/leaflet.css" />
    <link rel="stylesheet" href="css/base.css" />
    <link rel="stylesheet" href="css/layout.css" />
    <link rel="stylesheet" href="css/sections.css" />
    <script>
      window.__errs = []
      window.addEventListener('error', (e) => window.__errs.push(\`\${e.message} @ \${e.filename}:\${e.lineno}\`))
      window.addEventListener('unhandledrejection', (e) => window.__errs.push('rejected: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)))
    </script>
    <script type="application/ld+json">
      { "@context": "https://schema.org", "@type": "Organization", "name": "Alpine Ascents", "description": "Premium guided mountaineering and expedition company.", "slogan": "Where the Sky Begins", "sameAs": ["https://www.instagram.com/", "https://www.youtube.com/", "https://www.facebook.com/"] }
    </script>
  </head>

  <body class="is-loading" data-page="${active}">
    <a class="skip-link" href="#main">Skip to content</a>

    <div class="preloader" id="preloader" role="status" aria-label="Loading Alpine Ascents">
      <div class="preloader__inner">
        <svg class="preloader__mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path class="pl-path" pathLength="1" d="M3 41 L18.500 12 L25.500 25 L30.500 17 L45 41 Z" stroke="#C9A961" stroke-width="1.600" stroke-linejoin="round" stroke-linecap="round" />
          <path class="pl-cap" d="M13.800 21 L18.500 12 L23.200 20.700 L19.500 19 L16.800 22.200 Z" fill="#F4F7FA" />
        </svg>
        <p class="preloader__word">ALPINE <b>ASCENTS</b></p>
        <div class="preloader__bar"><span></span></div>
      </div>
    </div>

    <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
    <div class="cursor-ring" id="cursorRing" aria-hidden="true"></div>
    <div class="cursor-dot" id="cursorDot" aria-hidden="true"></div>

    <header class="site-nav" id="siteNav">
      <div class="site-nav__inner">
        <a class="brand" href="index.html" aria-label="Alpine Ascents, home">
          <img src="images/logo-mark.svg" width="40" height="40" alt="" />
          <span class="brand__word">ALPINE <b>ASCENTS</b></span>
        </a>

        <nav class="site-nav__menu" aria-label="Primary">
          <ul class="nav-list" id="navList">
            ${nav}
          </ul>
        </nav>

        <div class="site-nav__right">
          <div class="visitor-badge" id="visitorBadge" title="Total visitors" aria-live="polite">
            <i class="bi bi-people" aria-hidden="true"></i>
            <span class="visitor-badge__label">Visitors</span>
            <strong id="visitorCount" aria-label="Visitor count loading">&mdash;</strong>
          </div>
          <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <div class="mobile-menu" id="mobileMenu" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Site menu">
      <div class="mobile-menu__bg" aria-hidden="true"></div>
      <nav aria-label="Mobile primary"><ul class="mobile-menu__list" id="mobileList">${mobile}</ul></nav>
      <p class="mobile-menu__foot">Where the sky begins &middot; <a href="contact.html" data-nav="contact">Plan your ascent</a></p>
    </div>

    <main id="main" tabindex="-1">
${content}
    </main>

    <footer class="site-footer" aria-label="Site footer">
      <div class="container">
        <div class="row g-5 footer-top">
          <div class="col-lg-4">
            <a class="brand mb-3" href="index.html"><img src="images/logo-mark.svg" width="44" height="44" alt="" /><span class="brand__word">ALPINE <b>ASCENTS</b></span></a>
            <p class="footer-blurb">Premium guided mountaineering since 1998. Safe, challenging and unforgettable expeditions on the world&rsquo;s great peaks.</p>
            <div class="socials" aria-label="Social media">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Alpine Ascents on Instagram"><i class="bi bi-instagram"></i></a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="Alpine Ascents on YouTube"><i class="bi bi-youtube"></i></a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Alpine Ascents on Facebook"><i class="bi bi-facebook"></i></a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Alpine Ascents on X"><i class="bi bi-twitter-x"></i></a>
            </div>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h3 class="footer-h">Explore</h3>
            <ul class="footer-links list-unstyled">${list(explore)}</ul>
          </div>
          <div class="col-6 col-md-3 col-lg-2">
            <h3 class="footer-h">Prepare</h3>
            <ul class="footer-links list-unstyled">${list(prepare)}</ul>
          </div>
          <div class="col-md-6 col-lg-4">
            <h3 class="footer-h">The Summit Letter</h3>
            <p class="footer-blurb small">Quarterly notes from the mountains: new expeditions, route reports and safety advice.</p>
            <form class="newsletter" id="newsletterForm" novalidate>
              <label for="nlEmail" class="visually-hidden">Email address</label>
              <div class="input-group">
                <input type="email" class="form-control" id="nlEmail" placeholder="Your email address" autocomplete="email" required />
                <button class="btn btn-gold" type="submit" aria-label="Subscribe"><i class="bi bi-arrow-right"></i></button>
              </div>
              <p class="form-note mt-2 mb-0" id="nlNote" role="status"></p>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="mb-0">&copy; <span id="year">2026</span> Alpine Ascents. All rights reserved. Photography via <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">Unsplash</a>.</p>
          <a href="#main" class="to-top" data-scroll aria-label="Back to top"><span>Back to top</span><i class="bi bi-arrow-up"></i></a>
        </div>
      </div>
    </footer>

    <div class="ticker" id="ticker" role="region" aria-label="Current date, time and your location">
      <div class="ticker__track" id="tickerTrack"></div>
    </div>

    <div class="toast-container position-fixed top-0 end-0 p-3 offline-toast">
      <div id="offlineToast" class="toast" role="status" aria-live="polite" aria-atomic="true">
        <div class="toast-body"><i class="bi bi-wifi-off me-2"></i>Our server is unreachable. Showing saved content; forms are temporarily unavailable.<button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button></div>
      </div>
    </div>

    <div class="modal fade" id="filmModal" tabindex="-1" aria-labelledby="filmTitle" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered"><div class="modal-content">
        <div class="modal-header border-0"><h2 class="modal-title h5" id="filmTitle">Alpine Ascents &middot; The film</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
        <div class="modal-body p-0"><div class="ratio ratio-16x9" id="filmFrame"></div></div>
      </div></div>
    </div>

    <div class="modal fade" id="newsModal" tabindex="-1" aria-labelledby="newsModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"><div class="modal-content" id="newsModalContent"></div></div>
    </div>

    <div class="modal fade lightbox" id="lightbox" tabindex="-1" aria-label="Image viewer" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen"><div class="modal-content">
        <button type="button" class="btn-close lightbox__close" data-bs-dismiss="modal" aria-label="Close viewer"></button>
        <button type="button" class="lightbox__nav lightbox__nav--prev" id="lbPrev" aria-label="Previous image"><i class="bi bi-chevron-left"></i></button>
        <figure class="lightbox__stage" id="lbStage"><img id="lbImg" alt="" /><figcaption id="lbCaption"></figcaption></figure>
        <button type="button" class="lightbox__nav lightbox__nav--next" id="lbNext" aria-label="Next image"><i class="bi bi-chevron-right"></i></button>
        <p class="lightbox__count" id="lbCount" aria-live="polite"></p>
      </div></div>
    </div>

    <script src="vendor/jquery/jquery.min.js"></script>
    <script src="vendor/bootstrap/bootstrap.bundle.min.js"></script>
    <script src="vendor/leaflet/leaflet.js"></script>
${apiBase ? `<script>window.AA_API_BASE=${JSON.stringify(apiBase)};</script>\n` : ''}    <script type="module" src="js/main.js"></script>
  </body>
</html>
`
}

export function buildPages() {
  // AA_API_BASE lets the static front end talk to a separately hosted API
  // (e.g. Railway/Render) instead of its own origin. Empty = same origin.
  let apiBase = (process.env.AA_API_BASE || '').trim()
  if (apiBase && !/\/api\/?$/.test(apiBase)) apiBase += '/api'
  if (apiBase) console.log(`API base: ${apiBase}`)
  let count = 0
  for (const page of PAGES) {
    const file = path.join(PAGES_DIR, `${page.slug}.html`)
    if (!fs.existsSync(file)) {
      console.warn('missing page content:', path.relative(ROOT, file))
      continue
    }
    const content = fs.readFileSync(file, 'utf8').trim()
    fs.writeFileSync(path.join(OUT_DIR, `${page.slug}.html`), shell({ page, content, apiBase }))
    count++
  }
  console.log(`built ${count} pages -> ${path.relative(ROOT, OUT_DIR)}`)
}

if (process.argv[1] && process.argv[1].endsWith('build-pages.mjs')) buildPages()
