// Shared geolocation store (HTML5 Geolocation + OpenStreetMap Nominatim reverse geocoding).
export const loc = { status: 'idle', coords: null, place: '' }
let inflight = null

const emit = () => $(document).trigger('aa:location', [loc])
const fmtCoord = (v, pos, neg) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`

async function reverseGeocode(lat, lon) {
  const key = `aa_geo_${lat.toFixed(2)}_${lon.toFixed(2)}`
  const cached = sessionStorage.getItem(key)
  if (cached) return cached
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 7000)
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&lat=${lat}&lon=${lon}`, { headers: { 'Accept-Language': 'en' }, signal: ctl.signal })
    clearTimeout(t)
    if (!r.ok) throw new Error('geocode')
    const j = await r.json()
    const a = j.address || {}
    const town = a.city || a.town || a.village || a.municipality || a.county || a.state
    const place = [town, a.country].filter(Boolean).join(', ')
    if (!place) throw new Error('empty')
    sessionStorage.setItem(key, place)
    return place
  } catch {
    return `${fmtCoord(lat, 'N', 'S')}, ${fmtCoord(lon, 'E', 'W')}`
  }
}

export function requestLocation() {
  if (loc.status === 'granted') return Promise.resolve(loc)
  if (inflight) return inflight
  if (!('geolocation' in navigator)) {
    loc.status = 'unavailable'
    emit()
    return Promise.resolve(loc)
  }
  loc.status = 'pending'
  emit()
  inflight = new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        loc.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        loc.status = 'granted'
        loc.place = await reverseGeocode(loc.coords.lat, loc.coords.lng)
        inflight = null
        emit()
        resolve(loc)
      },
      (err) => {
        loc.status = err.code === 1 ? 'denied' : 'error'
        inflight = null
        emit()
        resolve(loc)
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
    )
  })
  return inflight
}

/** Ask automatically on load unless the user has already blocked it (avoids a pointless prompt). */
export async function autoLocate() {
  try {
    const p = await navigator.permissions?.query({ name: 'geolocation' })
    if (p?.state === 'denied') { loc.status = 'denied'; emit(); return }
  } catch { /* permissions API unavailable: just ask */ }
  requestLocation()
}

export const distanceKm = (a, b) => {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
