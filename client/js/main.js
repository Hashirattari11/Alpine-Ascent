// Entry point: each page boots the shared chrome and only the sections it contains.
import { loadImageMeta, hydrateImages } from './utils.js'
import { initReveal, initCounters, initParallax, initProgress, initPointerEffects } from './effects.js'
import { runPreloader } from './preloader.js'
import { initNav } from './nav.js'
import { initVisitors } from './visitors.js'
import { initTicker } from './ticker.js'
import { initHero } from './hero.js'
import { initAbout } from './sections/about.js'
import { initHistory } from './sections/history.js'
import { initTypes } from './sections/types.js'
import { initTechniques } from './sections/techniques.js'
import { initShelter } from './sections/shelter.js'
import { initHazards } from './sections/hazards.js'
import { initRecords } from './sections/records.js'
import { initClubs } from './sections/clubs.js'
import { initStories } from './sections/stories.js'
import { initGallery } from './sections/gallery.js'
import { initNews } from './sections/news.js'
import { initGuidelines } from './sections/guidelines.js'
import { initContact } from './sections/contact.js'
import { initExpeditionsGrid, initExpeditions } from './sections/expeditions.js'

// Mount functions keyed by the container each one needs. Pages simply omit sections.
const SECTIONS = {
  '#stats': initAbout,
  '#timelineItems': initHistory,
  '#typesGrid': initTypes,
  '#techWrap': initTechniques,
  '#shelterGrid': initShelter,
  '#hazardGrid': initHazards,
  '#recordsWrap': initRecords,
  '#clubList': initClubs,
  '#storiesWrap': initStories,
  '#galleryGrid': initGallery,
  '#newsGrid': initNews,
  '#guideGrid': initGuidelines,
  '#expGrid': initExpeditionsGrid,
}

const ASYNC_SECTIONS = {
  '#expList': initExpeditions,
}

$(function () {
  document.documentElement.classList.add('js')

  const year = document.getElementById('year')
  if (year) year.textContent = new Date().getFullYear()

  // Shared chrome
  initNav()
  initHero()
  initProgress()
  initParallax()
  initPointerEffects()
  initTicker()
  initVisitors()
  initCounters(document)
  initReveal(document)

  // Page content (after image metadata is available for blur-up placeholders)
  loadImageMeta().then(() => {
    hydrateImages(document)
    const jobs = Object.entries(SECTIONS)
      .filter(([sel]) => document.querySelector(sel))
      .map(([, init]) => { try { return init() } catch (e) { console.error(e); return null } })
      .concat(Object.entries(ASYNC_SECTIONS)
        .filter(([sel]) => document.querySelector(sel))
        .map(([, init]) => { try { return init() } catch (e) { console.error(e); return null } }))
    const boot = Promise.all(jobs).catch(() => {})
    if ($('#enquiryForm').length || $('#newsletterForm').length) initContact()
    runPreloader(boot)
  })
})
