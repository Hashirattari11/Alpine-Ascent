// Visual effects: reveal-on-scroll, parallax, counters, tilt, magnetic buttons, cursor, progress bar.
// Only transform/opacity are animated for 60fps.
import { reduced, canHover, fmtNum } from './utils.js'

/* ---------- single shared scroll loop ---------- */
const subscribers = new Set()
let ticking = false
export const onScrollFrame = (fn) => { subscribers.add(fn); fn() }
const run = () => { ticking = false; subscribers.forEach((fn) => fn()) }
const request = () => {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(run)
    // Fallback when rAF is throttled to 0 fps (hidden/headless tabs).
    setTimeout(() => { if (ticking) run() }, 60)
  }
}
window.addEventListener('scroll', request, { passive: true })
window.addEventListener('resize', request)

/* ---------- reveal ---------- */
const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealObserver.unobserve(e.target) }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
  : null

let fallbackSubscribed = false
export function initReveal(root = document) {
  $(root).find('[data-reveal-group]').each(function () {
    $(this).children('[data-reveal]').each((i, c) => { if (!c.style.getPropertyValue('--d')) c.style.setProperty('--d', `${i * 0.12}s`) })
  })
  $(root).find('[data-reveal]:not([data-rv])').each(function () {
    this.dataset.rv = '1'
    if (!revealObserver || reduced) this.classList.add('is-in')
    else revealObserver.observe(this)
  })
  // Viewport fallback: reveals elements even where IntersectionObserver is unreliable.
  if (!fallbackSubscribed) {
    fallbackSubscribed = true
    onScrollFrame(() => {
      const vh = window.innerHeight
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add('is-in')
      })
    })
  }
}

/* ---------- counters ---------- */
const easeOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
export function countUp(el, to, { duration = 2000, decimals = 0, plain = false, suffix = '' } = {}) {
  const fmt = (v) => (plain ? String(Math.round(v)) : fmtNum(v, decimals)) + suffix
  el.setAttribute('aria-label', fmt(to))
  if (reduced) { el.textContent = fmt(to); return }
  const t0 = performance.now()
  let done = false
  const finish = () => { if (!done) { done = true; el.textContent = fmt(to) } }
  const step = (now) => {
    if (done) return
    const p = Math.min(1, (now - t0) / duration)
    el.textContent = fmt(to * easeOut(p))
    if (p < 1) requestAnimationFrame(step)
    else done = true
  }
  requestAnimationFrame(step)
  // rAF may be throttled to 0 fps in hidden/background pages: always land the final value.
  setTimeout(finish, duration + 120)
}

const counterObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const el = e.target
        counterObserver.unobserve(el)
        el.dataset.counted = '1'
        countUp(el, parseFloat(el.dataset.count), { plain: el.dataset.plain === '1', suffix: el.dataset.suffix || '', decimals: +(el.dataset.decimals || 0) })
      })
    }, { threshold: 0.4 })
  : null

export function initCounters(root = document) {
  $(root).find('[data-count]:not([data-counted])').each(function () {
    if (!counterObserver) { this.textContent = this.dataset.count; return }
    counterObserver.observe(this)
  })
  // Fallback: count up when in the viewport even if the observer did not fire.
  if (!counterFallback) {
    counterFallback = true
    onScrollFrame(() => {
      const vh = window.innerHeight
      document.querySelectorAll('[data-count]:not([data-counted])').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.9 && r.bottom > 0) {
          el.dataset.counted = '1'
          countUp(el, parseFloat(el.dataset.count), { plain: el.dataset.plain === '1', suffix: el.dataset.suffix || '', decimals: +(el.dataset.decimals || 0) })
        }
      })
    })
  }
}
let counterFallback = false
/** Re-arm counters inside a container (e.g. when a tab becomes visible). */
export function replayCounters(root) {
  $(root).find('[data-count]').each(function () {
    this.removeAttribute('data-counted')
    this.textContent = '0'
  })
  initCounters(root)
}

/* ---------- parallax (transform only) ---------- */
export function initParallax() {
  if (reduced) return
  const items = $('[data-parallax]').toArray()
  const vh = () => window.innerHeight
  onScrollFrame(() => {
    const y = window.scrollY
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax)
      if (el.id === 'heroSlides') {
        if (y < vh() * 1.2) el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`
        return
      }
      const host = el.parentElement.getBoundingClientRect()
      if (host.bottom < -100 || host.top > vh() + 100) return
      const offset = (host.top + host.height / 2 - vh() / 2) * -speed
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
    })
  })
}

/* ---------- progress bar ---------- */
export function initProgress() {
  const bar = document.getElementById('scrollProgress')
  onScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
  })
}

/* ---------- tilt + magnetic + cursor (desktop only, delegated) ---------- */
export function initPointerEffects() {
  if (!canHover || reduced) return

  $(document)
    .on('mouseenter', '.tilt', function () { this.classList.add('is-tilting') })
    .on('mousemove', '.tilt', function (e) {
      const r = this.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      this.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px)`
    })
    .on('mouseleave', '.tilt', function () { this.classList.remove('is-tilting'); this.style.transform = '' })

  $(document)
    .on('mousemove', '.magnetic', function (e) {
      const r = this.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      this.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`
    })
    .on('mouseleave', '.magnetic', function () { this.style.transform = '' })

  // custom cursor
  const ring = document.getElementById('cursorRing')
  const dot = document.getElementById('cursorDot')
  let mx = 0, my = 0, rx = 0, ry = 0, raf = null
  const loop = () => {
    rx += (mx - rx) * 0.16
    ry += (my - ry) * 0.16
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`
    raf = requestAnimationFrame(loop)
  }
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
    if (!document.body.classList.contains('has-cursor')) { document.body.classList.add('has-cursor'); rx = mx; ry = my }
    if (!raf) raf = requestAnimationFrame(loop)
  }, { passive: true })
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'))
  document.addEventListener('mouseenter', () => document.body.classList.add('has-cursor'))
  $(document)
    .on('mouseover', 'a, button, .chip, input, select, textarea, label, [role="tab"]', () => document.body.classList.add('cursor-hover'))
    .on('mouseout', 'a, button, .chip, input, select, textarea, label, [role="tab"]', () => document.body.classList.remove('cursor-hover'))
}
