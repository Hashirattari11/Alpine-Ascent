import { scrollToId } from './utils.js'

const HIDE_AFTER = 320

export function initNav() {
  const $nav = $('#siteNav'), $burger = $('#burger'), $menu = $('#mobileMenu')
  let menuOpen = false

  window.addEventListener('scroll', () => {
    $nav.toggleClass('is-glass', window.scrollY > 24)
    if (window.scrollY < 200) $nav.removeClass('is-hidden')
  }, { passive: true })
  $nav.on('focusin', () => $nav.removeClass('is-hidden'))

  const setMenu = (open) => {
    menuOpen = open
    $menu.toggleClass('is-open', open).attr('aria-hidden', String(!open))
    $burger.attr({ 'aria-expanded': String(open), 'aria-label': open ? 'Close menu' : 'Open menu' }).toggleClass('is-open', open)
    $('body').toggleClass('menu-open', open)
    $menu.find('a').attr('tabindex', open ? '0' : '-1')
  }
  setMenu(false)
  $burger.on('click', () => setMenu(!menuOpen))

  $(document).on('keydown', (e) => { if (menuOpen && e.key === 'Escape') { setMenu(false); $burger.trigger('focus') } })

  const $items = $nav.find('.nav-item--has-menu')
  const closeMenus = (except) => { $items.each(function () { if (this !== except) { $(this).removeClass('is-open').find('.nav-toggle').attr('aria-expanded', 'false') } }) }
  $nav.on('click', '[data-menu-toggle]', function (e) {
    e.preventDefault(); e.stopPropagation()
    const $item = $(this).closest('.nav-item--has-menu'); const opening = !$item.hasClass('is-open')
    closeMenus($item[0]); $item.toggleClass('is-open', opening).find('.nav-toggle').attr('aria-expanded', String(opening))
  })
  $items.on('mouseenter', function () { closeMenus(this) })
  $(document).on('click', (e) => { if (!$(e.target).closest('.site-nav').length) closeMenus(null) })
  $(document).on('keydown', (e) => { if (e.key === 'Escape') { closeMenus(null); $nav.find('.nav-toggle[aria-expanded="true"]').first().trigger('focus') } })
  $(window).on('resize', () => { if (window.innerWidth < 900) closeMenus(null) })

  const setActive = (id) => {
    $('.nav-list a, .mobile-menu a[data-nav]').each(function () {
      const on = this.dataset.nav === id
      this.classList.toggle('is-active', on); on ? this.setAttribute('aria-current', 'page') : this.removeAttribute('aria-current')
    })
    $('.nav-item--has-menu').each(function () {
      const contains = $(this).find(`.nav-flyout a[data-nav="${id}"]`).length > 0
      $(this).toggleClass('is-open-current', contains)
    })
  }

  $(document).on('click', '.nav-list a, .mobile-menu a[data-nav]', function () { setActive(this.dataset.nav); if (menuOpen) setMenu(false) })
  $(document).on('click', 'a[href^="#"]', function (e) {
    const id = this.getAttribute('href').slice(1)
    if (!id || !document.getElementById(id)) return
    e.preventDefault(); scrollToId(id)
  })

  const sections = $('main section[id]').toArray()
  if (sections.length > 1) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.dataset.nav || en.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    sections.forEach((s) => spy.observe(s))
  }
  setActive(document.documentElement.dataset.page || 'home')
}
