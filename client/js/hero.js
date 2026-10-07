// Hero: crossfading slideshow with Ken Burns, floating snow canvas, and the film modal.
import { reduced, picture, esc } from './utils.js'

const FILM_ID = 'cvFt2Xcuois' // privacy-enhanced (youtube-nocookie) embed
const SLIDES = [
  { label: 'Matterhorn' },
  { label: 'Ama Dablam' },
  { label: 'Torres del Paine' },
]

function initSlides() {
  const $slides = $('#heroSlides .hero__slide')
  const $dots = $('#heroDots')
  if (!$slides.length) return
  let idx = 0
  let timer = null

  $dots.html(SLIDES.map((s, i) => `<button type="button" role="tab" aria-label="Show ${esc(s.label)}" aria-selected="${i === 0}" class="${i === 0 ? 'is-active' : ''}"></button>`).join(''))

  // lazy-load the other slides after the first paint
  const loadRest = () => $slides.filter('[data-src]').each(function () {
    const key = this.dataset.src
    $(this).html(`<img src="images/${key}-sm.webp" srcset="images/${key}-sm.webp 720w, images/${key}.webp 2200w" sizes="100vw" alt="${esc(this.dataset.alt)}" decoding="async">`).removeAttr('data-src')
  })
  if (document.readyState === 'complete') setTimeout(loadRest, 800)
  else window.addEventListener('load', () => setTimeout(loadRest, 800), { once: true })

  const show = (i) => {
    idx = (i + $slides.length) % $slides.length
    $slides.removeClass('is-active').eq(idx).addClass('is-active')
    $dots.children().removeClass('is-active').attr('aria-selected', 'false').eq(idx).addClass('is-active').attr('aria-selected', 'true')
  }
  const start = () => { stop(); if (!reduced) timer = setInterval(() => show(idx + 1), 7000) }
  const stop = () => clearInterval(timer)
  $dots.on('click', 'button', function () { loadRest(); show($(this).index()); start() })
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
  const home = document.getElementById('home') || document.getElementById('main')
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.1 }).observe(home)
}

function initSnow() {
  if (reduced) return
  const canvas = document.getElementById('snow')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let w = 0, h = 0, flakes = [], raf = null, visible = true
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = Math.min(110, Math.round(w / (w < 600 ? 22 : 15)))
    flakes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.4,
      vy: Math.random() * 0.5 + 0.18, vx: Math.random() * 0.3 - 0.1, ph: Math.random() * 6.28, a: Math.random() * 0.5 + 0.25,
    }))
  }
  const draw = (t) => {
    ctx.clearRect(0, 0, w, h)
    for (const f of flakes) {
      f.y += f.vy; f.x += f.vx + Math.sin(t / 1800 + f.ph) * 0.25
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w }
      if (f.x > w + 4) f.x = -4; else if (f.x < -4) f.x = w + 4
      ctx.globalAlpha = f.a
      ctx.fillStyle = '#f4f7fa'
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill()
    }
    raf = visible && !document.hidden ? requestAnimationFrame(draw) : null
  }
  const kick = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw) }
  resize(); kick()
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', kick)
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() }).observe(canvas)
}

function initFilm() {
  const modal = document.getElementById('filmModal')
  if (!modal) return
  modal.addEventListener('show.bs.modal', () => {
    $('#filmFrame').html(`<iframe src="https://www.youtube-nocookie.com/embed/${FILM_ID}?autoplay=1&rel=0&modestbranding=1" title="Alpine Ascents film" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`)
  })
  modal.addEventListener('hidden.bs.modal', () => $('#filmFrame').empty())
}

export function initHero() {
  initSlides()
  initSnow()
  initFilm()
}
