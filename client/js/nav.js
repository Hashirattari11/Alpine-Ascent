// Navbar: transparent at top → blurred glass on scroll, hides on scroll down / shows on scroll up,
// scroll-spy + click active state, full-screen mobile overlay with staggered links, keyboard accessible.
import { scrollToId } from './utils.js'
import { onScrollFrame } from './effects.js'

let current = null
let lockTimer = null

function setActive(id) {
  current = id
  $('.nav-list a, .mobile-menu a[data-nav]').each(function () {
    const on = this.dataset.nav === id
    this.classList.toggle('is-active', on)
    if (on) this.setAttribute('aria-current', 'page')
    else this.removeAttribute('aria-current')
  })
}

const lock = (id, ms = 2500) => {
  setActive(id)
  clearTimeout(lockTimer)
  lockTimer = setTimeout(() => { current = null }, ms)
}

export function initNav() {
  const $nav = $('#siteNav')
  const $burger = $('#burger')
  const $menu = $('#mobileMenu')
  let lastY = window.scrollY
  let menuOpen = false

  /* ---- glass background + hide/show on scroll direction ---- */
  onScrollFrame(() => {
    const y = window.scrollY
    $nav.toggleClass('is-glass', y > 24)
    const delta = y - lastY
    if (Math.abs(delta) > 6) {
      const hide = delta > 0 && y > 240 && !menuOpen && !$nav[0].matches(':focus-within')
      $nav.toggleClass('is-hidden', hide)
      lastY = y
    }
    if (y < 110) $nav.removeClass('is-hidden')
  })
  $nav.on('focusin', () => $nav.removeClass('is-hidden'))

  /* ---- mobile menu: full-screen overlay, staggered links, focus trap, Esc ---- */
  const setMenu = (open) => {
    menuOpen = open
    $menu.toggleClass('is-open', open).attr('aria-hidden', String(!open))
    $burger.attr({ 'aria-expanded': String(open), 'aria-label': open ? 'Close menu' : 'Open menu' })
      .toggleClass('is-open', open)
    $('body').toggleClass('menu-open', open)
    $nav.removeClass('is-hidden').addClass('is-glass')
    $menu.find('a').attr('tabindex', open ? '0' : '-1')
    if (open) setTimeout(() => $menu.find('a').eq(0).trigger('focus'), 380)
    else $burger.attr({ 'aria-expanded': 'false', 'aria-label': 'Open menu' })
  }
  setMenu(false)
  $burger.on('click', () => setMenu(!menuOpen))

  $(document).on('keydown', (e) => {
    if (!menuOpen) return
    if (e.key === 'Escape') { setMenu(false); $burger.trigger('focus'); return }
    if (e.key === 'Tab') {
      const f = $menu.find('a').add($burger).toArray()
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  })
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (m) => m.matches && menuOpen && setMenu(false))

  /* ---- link clicks update the active colour immediately (also after click, not just hover) ---- */
  $(document).on('click', '.nav-list a, .mobile-menu a[data-nav]', function () {
    lock(this.dataset.nav)
    if (menuOpen) setMenu(false)
  })
  $(document).on('click', 'a[href^="#"]', function (e) {
    const id = this.getAttribute('href').slice(1)
    if (!id || !document.getElementById(id)) return
    e.preventDefault()
    scrollToId(id)
  })
  // any manual scroll/wheel releases the click lock
  $(window).on('wheel touchstart keydown', () => { if (current) { clearTimeout(lockTimer); current = null } })

  /* ---- scroll-spy: only useful when a page has more than one section ---- */
  const sections = $('main section[id]').toArray()
  const page = document.documentElement.dataset.page || 'home'
  if (sections.length > 1) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        const id = en.target.dataset.nav || en.target.id
        if (current) { if (id === current) current = null; return }
        setActive(id)
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    sections.forEach((s) => spy.observe(s))
  }
  setActive(page)
}
