// Preloader: logo + rising mountain line, then reveal. Skipped faster on repeat visits in a session.
import { reduced } from './utils.js'

export function runPreloader(extraWait = Promise.resolve()) {
  return new Promise((resolve) => {
    const seen = sessionStorage.getItem('aa_intro')
    const minTime = reduced ? 200 : seen ? 900 : 2100
    const maxTime = 5000
    const start = performance.now()
    const heroImg = document.querySelector('.hero__slide.is-active img')
    const heroReady = heroImg && !heroImg.complete
      ? new Promise((r) => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }) })
      : Promise.resolve()

    Promise.race([Promise.all([heroReady, extraWait]), new Promise((r) => setTimeout(r, maxTime))]).then(() => {
      const wait = Math.max(0, minTime - (performance.now() - start))
      setTimeout(() => {
        sessionStorage.setItem('aa_intro', '1')
        $('#preloader').addClass('is-done').attr('aria-hidden', 'true')
        $('body').removeClass('is-loading').addClass('is-ready')
        setTimeout(() => $('#preloader').remove(), 1500)
        resolve()
      }, wait)
    })
  })
}
