// Simple visual effects: reveal on scroll, counters, tilt, cursor, progress bar.
import { reduced, canHover, fmtNum } from './utils.js'

export function initReveal(root = document) {
  $(root).find('[data-reveal]').each(function () { this.classList.add('is-in') })
}

export function countUp(el, to, { duration = 2000, decimals = 0, plain = false, suffix = '' } = {}) {
  const fmt = (v) => (plain ? String(Math.round(v)) : fmtNum(v, decimals)) + suffix
  const start = performance.now()
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    el.textContent = fmt(to)
  }
  const timer = setTimeout(finish, duration + 100)
  const step = () => {
    if (finished) return
    const p = Math.min(1, (performance.now() - start) / duration)
    el.textContent = fmt(to * p)
    if (p < 1) requestAnimationFrame(step)
    else { clearTimeout(timer); finish() }
  }
  requestAnimationFrame(step)
}

export function initCounters(root = document) {
  $(root).find('[data-count]').each(function () {
    countUp(this, parseFloat(this.dataset.count), { plain: this.dataset.plain === '1', suffix: this.dataset.suffix || '', decimals: +(this.dataset.decimals || 0) })
  })
}

export function replayCounters(root) {
  $(root).find('[data-count]').each(function () { this.textContent = '0'; countUp(this, parseFloat(this.dataset.count)) })
}

export function initParallax() {
  if (reduced) return
  const items = $('[data-parallax]').toArray()
  window.addEventListener('scroll', () => {
    const y = window.scrollY
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax)
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(0)}px, 0)`
    })
  }, { passive: true })
}

export function initProgress() {
  const bar = document.getElementById('scrollProgress')
  if (!bar) return
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
  }, { passive: true })
}

export function initPointerEffects() {
  if (!canHover || reduced) return
  const ring = document.getElementById('cursorRing')
  const dot = document.getElementById('cursorDot')
  if (!ring || !dot) return
  let mx = 0, my = 0, rx = 0, ry = 0, raf = null
  const loop = () => {
    rx += (mx - rx) * 0.3; ry += (my - ry) * 0.3
    ring.style.transform = `translate3d(${rx.toFixed(0)}px, ${ry.toFixed(0)}px, 0)`
    raf = requestAnimationFrame(loop)
  }
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
    document.body.classList.add('has-cursor')
    if (!raf) raf = requestAnimationFrame(loop)
  }, { passive: true })
  $(document).on('mouseenter', '.tilt', function () { this.style.transition = 'none' })
  $(document).on('mousemove', '.tilt', function (e) {
    const r = this.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    this.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(0)}deg) rotateY(${(px * 6).toFixed(0)}deg) translateY(-6px)`
  })
  $(document).on('mouseleave', '.tilt', function () { this.style.transition = ''; this.style.transform = '' })
}
