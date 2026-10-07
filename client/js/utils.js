// Shared helpers: escaping, formatting, responsive images, smooth scrolling.
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const fmtDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', opts)

export const pad = (n) => String(n).padStart(2, '0')
export const fmtNum = (n, decimals = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals })

/* ---------- Images: blur-up placeholders + dimensions come from data/images.json ---------- */
let imageMeta = {}
export async function loadImageMeta() {
  try {
    imageMeta = await $.getJSON('data/images.json')
  } catch {
    imageMeta = {}
  }
}
export const imgMeta = (key) => imageMeta[key] || { w: 1600, h: 1067, lqip: '' }
export const imgRatio = (key) => {
  const m = imgMeta(key)
  return (m.w / m.h).toFixed(4)
}

/** Returns markup for a responsive, lazy, blur-up image. The wrapper's size is controlled by CSS. */
export function picture(key, alt = '', { eager = false, sizes = '(min-width: 992px) 33vw, 100vw', cls = '' } = {}) {
  const m = imgMeta(key)
  const bg = m.lqip ? `background-image:url(${m.lqip})` : ''
  return `<span class="img-wrap ${cls}" style="${bg}"><img src="images/${key}-sm.webp" srcset="images/${key}-sm.webp 720w, images/${key}.webp 1600w" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span>`
}

/** Wires up load/error handling for images inside `root` (blur-up fade, gradient fallback). */
export function hydrateImages(root = document) {
  $(root).find('img[width]:not([data-h])').each(function () {
    const img = this
    img.dataset.h = '1'
    const done = () => img.classList.add('is-loaded')
    if (img.complete && img.naturalWidth) done()
    else {
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', () => { img.classList.add('is-error'); $(img).parent('.img-wrap').addClass('is-failed') }, { once: true })
    }
  })
}

export const skeleton = (n = 3, cls = 'col-md-6 col-lg-4', height = 340) =>
  Array.from({ length: n }, () => `<div class="${cls}" aria-hidden="true"><div class="skeleton" style="height:${height}px"></div></div>`).join('')

export const errorBlock = (label) =>
  `<div class="col-12"><div class="load-error" role="alert"><i class="bi bi-cloud-slash"></i><p class="mb-3">We couldn&rsquo;t load ${esc(label)}. Please check your connection.</p><button type="button" class="btn btn-ghost btn-sm" data-retry>Try again</button></div></div>`

/* ---------- Smooth scrolling to sections ---------- */
export function scrollToId(id, { hash = true } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  const behavior = reduced ? 'auto' : 'smooth'
  el.scrollIntoView({ behavior, block: 'start' })
  if (hash) history.replaceState(null, '', `#${id}`)
  // Lazy content can shift layout mid-scroll: re-align once scrolling settles.
  let t
  const settle = () => {
    clearTimeout(t)
    t = setTimeout(() => {
      window.removeEventListener('scroll', settle)
      const off = el.getBoundingClientRect().top
      if (Math.abs(off) > 6 && id !== 'home') window.scrollTo({ top: window.scrollY + off, behavior: 'auto' })
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }, 140)
  }
  window.addEventListener('scroll', settle, { passive: true })
  settle()
}

export function debounce(fn, ms = 150) {
  let t
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
}
