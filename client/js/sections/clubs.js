import { mount } from '../core.js'
import { esc, picture, skeleton, fmtDate } from '../utils.js'
import { loc, requestLocation, distanceKm } from '../location.js'

const REGIONS = ['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania']
let clubs = []
let region = 'All'
let sorted = [] // by distance when location is known, else by name
let selectedId = null
let map, layer, userMarker

const inRegion = (c) => region === 'All' || c.region === region
const visibleClubs = () => sorted.filter(inRegion)

const pinIcon = (active) => L.divIcon({
  className: '',
  html: `<div class="aa-pin ${active ? 'is-active' : ''}"><span></span></div>`,
  iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30],
})

const fmtDist = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('en-US')} km`)

function popup(c) {
  return `<div class="pop">
    ${picture(c.image, `${c.name}, ${c.city}`, { sizes: '270px', cls: 'pop__img' })}
    <div class="pop__body">
      <h4>${esc(c.name)}</h4>
      <div class="pop__place">${esc(c.city)}, ${esc(c.country)}</div>
      <p>${esc(c.description)}</p>
      <a class="btn btn-gold" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span>Visit club</span></a>
    </div>
  </div>`
}

function recalc() {
  sorted = [...clubs].sort((a, b) => {
    if (loc.coords && loc.coords.lat != null) {
      const d = distanceKm(loc.coords, { lat: a.lat, lng: a.lng }) - distanceKm(loc.coords, { lat: b.lat, lng: b.lng })
      if (Math.abs(d) > 1) return d
    }
    return a.name.localeCompare(b.name)
  })
}

function renderMarkers() {
  layer.clearLayers()
  visibleClubs().forEach((c) => {
    const m = L.marker([c.lat, c.lng], { icon: pinIcon(c.id === selectedId), title: c.name, keyboard: true })
    m.bindPopup(popup(c), { maxWidth: 300, minWidth: 270, className: 'aa-pop' })
    m.on('click', () => selectClub(c.id, { pan: false }))
    layer.addLayer(m)
    if (c.id === selectedId) setTimeout(() => m.openPopup(), 0)
  })
}

function renderList() {
  const list = visibleClubs()
  $('#clubList').html(list.length ? list.map((c) => {
    const d = loc.coords ? distanceKm(loc.coords, { lat: c.lat, lng: c.lng }) : null
    return `<li class="club-item ${c.id === selectedId ? 'is-active' : ''}" data-id="${esc(c.id)}">
      <button type="button" class="club-item__btn" aria-expanded="${c.id === selectedId}">
        <span class="club-item__pin"><i class="bi bi-flag"></i></span>
        <span><span class="club-item__name">${esc(c.name)}</span><span class="club-item__place">${esc(c.city)}, ${esc(c.country)}</span></span>
        ${d != null ? `<span class="club-item__dist">${fmtDist(d)}</span>` : ''}
      </button>
      <div class="club-item__more"><div><div class="club-item__more-inner">
        <p class="mb-2">${esc(c.description)}</p>
        <p class="small mb-1 text-muted">Founded ${c.founded} · ${esc(c.members)} members</p>
        <p class="small mb-2"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a> · <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Website</a></p>
        <ul class="mini-list" aria-label="Upcoming expeditions">${c.upcoming.map((u) => `<li><span>${esc(u.title)}</span><span>${esc(u.difficulty)} · ${esc(u.duration)}</span></li>`).join('')}</ul>
        <a class="link-arrow" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span>Visit website</span><i class="bi bi-arrow-right"></i></a>
      </div></div></div>
    </li>`
  }).join('') : `<li class="load-error">No clubs match this filter.</li>`)
  const active = document.querySelector('.club-item.is-active')
  if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function selectClub(id, { pan = true } = {}) {
  selectedId = selectedId === id && !pan ? null : id
  renderList()
  renderMarkers()
  const c = clubs.find((x) => x.id === selectedId)
  if (c && pan) map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 6), { duration: 1 })
}

export function initClubs() {
  mount('#clubList', 'clubs', (data) => { clubs = data; recalc(); return '' }, {
    label: 'the club list',
    after: () => {
      $('#regionFilters').html(REGIONS.map((r) => `<button type="button" class="chip ${r === 'All' ? 'is-active' : ''}" aria-pressed="${r === 'All'}" data-region="${esc(r)}">${esc(r)}</button>`).join(''))
      $('#regionFilters').on('click', '.chip', function () {
        region = this.dataset.region
        $('#regionFilters .chip').removeClass('is-active').attr('aria-pressed', 'false')
        $(this).addClass('is-active').attr('aria-pressed', 'true')
        renderList(); renderMarkers()
      })

      const worldBounds = L.latLngBounds([84, -179], [-60, 179])
      map = L.map('clubMap', { scrollWheelZoom: false, tap: true, maxBounds: worldBounds, minZoom: 2, worldCopyJump: true })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)
      map.setView([25, 15], 3)
      map.on('click', () => { selectedId = null; renderList(); renderMarkers() })
      // re-render on container resize (flex layout changes the box)
      new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('clubMap'))
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      layer = L.layerGroup().addTo(map)
      map.scrollWheelZoom.disable() // enable on hover so page scrolling is never hijacked
      $('#clubMap').on('mouseenter', () => map.scrollWheelZoom.enable()).on('mouseleave', () => map.scrollWheelZoom.disable())

      $('#clubList').on('click', '.club-item__btn', function () { selectClub($(this).closest('.club-item').data('id')) })

      renderList(); renderMarkers()

      $('#nearMeBtn').on('click', async () => {
        $('#mapStatus').removeClass('is-error').text('Requesting your location from the browser…')
        const l = await requestLocation()
        if (l.status !== 'granted' || !l.coords) {
          $('#mapStatus').addClass('is-error').text(l.status === 'denied'
            ? 'Location permission was declined. You can enable it in your browser settings and try again.'
            : 'Your location could not be determined.')
          return
        }
        $('#mapStatus').text(`Showing clubs nearest to ${l.place}.`)
        recalc()
        if (userMarker) userMarker.remove()
        userMarker = L.marker([l.coords.lat, l.coords.lng], { icon: L.divIcon({ className: '', html: '<div class="aa-user"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(map).bindTooltip('You are here')
        map.flyTo([l.coords.lat, l.coords.lng], 4, { duration: 1.4 })
        renderList()
      })
      $(document).on('aa:location', () => { if (loc.coords) { recalc(); renderList() } })
    },
  })
}
