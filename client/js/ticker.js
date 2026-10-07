// Bottom ticker: live date, ticking clock and the visitor's location. Gold marquee, pauses on hover.
import { pad, esc } from './utils.js'
import { loc, requestLocation, autoLocate } from './location.js'

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
const tzShort = () => (new Intl.DateTimeFormat('en-GB', { timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName') || {}).value || ''

function locationHtml() {
  switch (loc.status) {
    case 'granted': return `You are in <b>${esc(loc.place)}</b>`
    case 'pending': return 'Locating you&hellip;'
    case 'denied': return 'Location hidden. <button type="button" data-ticker-locate>Share location</button> to see where you are climbing from'
    case 'unavailable': return 'Location unavailable on this device'
    case 'error': return 'We couldn&rsquo;t determine your location. <button type="button" data-ticker-locate>Try again</button>'
    default: return 'Awaiting your location&hellip;'
  }
}

function groupHtml(hidden) {
  return `<div class="ticker__group" ${hidden ? 'aria-hidden="true"' : ''}>
    <span class="ticker__item"><i class="bi bi-calendar3"></i><b data-t="date"></b></span>
    <span class="ticker__item"><i class="bi bi-clock"></i><b data-t="time"></b><span data-t="tz"></span></span>
    <span class="ticker__item"><i class="bi bi-geo-alt-fill"></i><span data-t="loc"></span></span>
    <span class="ticker__item"><i class="bi bi-triangle"></i>Alpine Ascents &middot; Where the sky begins</span>
  </div>`
}

function tick() {
  const now = new Date()
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const date = dateFmt.format(now)
  document.querySelectorAll('[data-t="time"]').forEach((n) => (n.textContent = time))
  document.querySelectorAll('[data-t="date"]').forEach((n) => { if (n.textContent !== date) n.textContent = date })
}

function paintLocation() {
  const html = locationHtml()
  document.querySelectorAll('[data-t="loc"]').forEach((n) => (n.innerHTML = html))
  size()
}

// Duplicate the group enough times to fill the screen twice for a seamless loop.
function size() {
  const track = document.getElementById('tickerTrack')
  const first = track.querySelector('.ticker__group')
  if (!first) return
  const w = first.getBoundingClientRect().width
  if (!w) return
  const copies = track.querySelectorAll('.ticker__group').length
  track.style.setProperty('--shift', `${-100 / copies}%`)
  track.style.animationDuration = `${Math.max(30, w / 55)}s`
}

export function initTicker() {
  const track = document.getElementById('tickerTrack')
  const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / 1100))
  track.innerHTML = Array.from({ length: copies }, (_, i) => groupHtml(i > 0)).join('')
  document.querySelectorAll('[data-t="tz"]').forEach((n) => (n.textContent = tzShort()))
  tick()
  paintLocation()
  setInterval(tick, 1000)
  $(document).on('aa:location', paintLocation)
  $(document).on('click', '[data-ticker-locate]', () => { loc.status = 'idle'; requestLocation() })
  window.addEventListener('resize', size)
  autoLocate()
}
