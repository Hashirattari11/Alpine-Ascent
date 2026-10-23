export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const fmtDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', opts)
export const pad = (n) => String(n).padStart(2, '0')
export const fmtNum = (n, decimals = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals })

let imageMeta = {}
export async function loadImageMeta() { try { imageMeta = await $.getJSON('data/images.json') } catch { imageMeta = {} } }
export const imgMeta = (key) => imageMeta[key] || { w: 1600, h: 1067, lqip: '' }
export const imgRatio = (key) => { const m = imgMeta(key); return (m.w / m.h).toFixed(4) }
export const FALLBACK_IMAGE = 'hero-matterhorn'
export const safeImageKey = (key) => (key && imageMeta[key] ? key : FALLBACK_IMAGE)

export function picture(key, alt = '', { eager = false, sizes = '(min-width: 992px) 33vw, 100vw', cls = '' } = {}) {
  const k = safeImageKey(key); const m = imgMeta(k); const bg = m.lqip ? `background-image:url(${m.lqip})` : ''
  const swap = k === FALLBACK_IMAGE ? '' : ` onerror="this.onerror=null;this.src='images/${FALLBACK_IMAGE}-sm.webp'"`
  return `<span class="img-wrap ${cls}" style="${bg}"><img src="images/${k}-sm.webp" srcset="images/${k}-sm.webp 720w, images/${k}.webp 1600w" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${swap} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span>`
}

export function hydrateImages(root = document) {
  $(root).find('.img-wrap img, img[width]').not('[data-h]').each(function () {
    const img = this; img.dataset.h = '1'; const done = () => img.classList.add('is-loaded')
    if (img.complete && img.naturalWidth) done()
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', () => { img.classList.add('is-error'); $(img).parent('.img-wrap').addClass('is-failed') }, { once: true }) }
  })
}

export const skeleton = (n = 3, cls = 'col-md-6 col-lg-4', height = 340) => Array.from({ length: n }, () => `<div class="${cls}" aria-hidden="true"><div class="skeleton" style="height:${height}px"></div></div>`).join('')
export const errorBlock = (label) => `<div class="col-12"><div class="load-error" role="alert"><i class="bi bi-cloud-slash"></i><p class="mb-3">We couldn&rsquo;t load ${esc(label)}. Please check your connection.</p><button type="button" class="btn btn-ghost btn-sm" data-retry>Try again</button></div></div>`

export function scrollToId(id, { hash = true } = {}) {
  const el = document.getElementById(id); if (!el) return
  const behavior = reduced ? 'auto' : 'smooth'; el.scrollIntoView({ behavior, block: 'start' })
  if (hash) history.replaceState(null, '', `#${id}`)
}

export function debounce(fn, ms = 150) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) } }
