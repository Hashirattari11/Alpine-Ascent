import { loadImageMeta, hydrateImages } from './utils.js'
import { initReveal, initCounters, initParallax, initProgress, initPointerEffects } from './effects.js'
import { runPreloader } from './preloader.js'
import { initNav } from './nav.js'
import { initVisitors } from './visitors.js'
import { initTicker } from './ticker.js'
import { initHero } from './hero.js'
import * as sections from './sections.js'

const SECTIONS = {
  '#stats': sections.initAbout,
  '#timelineItems': sections.initHistory,
  '#typesGrid': sections.initTypes,
  '#techWrap': sections.initTechniques,
  '#shelterGrid': sections.initShelter,
  '#hazardGrid': sections.initHazards,
  '#recordsWrap': sections.initRecords,
  '#clubList': sections.initClubs,
  '#storiesWrap': sections.initStories,
  '#galleryGrid': sections.initGallery,
  '#newsGrid': sections.initNews,
  '#guideGrid': sections.initGuidelines,
  '#expGrid': sections.initExpeditionsGrid,
}
const ASYNC_SECTIONS = { '#expList': sections.initExpeditions }

$(function () {
  document.documentElement.classList.add('js')
  const year = document.getElementById('year')
  if (year) year.textContent = new Date().getFullYear()

  initNav(); initHero(); initProgress(); initParallax(); initPointerEffects()
  initTicker(); initVisitors(); initCounters(document); initReveal(document)

  loadImageMeta().then(() => {
    hydrateImages(document)
    Object.entries(SECTIONS).forEach(([sel, init]) => { if (document.querySelector(sel)) init() })
    Object.entries(ASYNC_SECTIONS).forEach(([sel, init]) => { if (document.querySelector(sel)) init() })
    if ($('#enquiryForm').length || $('#newsletterForm').length) sections.initContact()
    runPreloader()
  })
})
