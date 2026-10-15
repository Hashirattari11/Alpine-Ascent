// Visitor counter badge (top right, beside the logo). Persisted by the backend.
//
// The badge should never read "—": the live count is fetched first, and only while we are
// waiting for it (or if the API is unreachable) does it fall back to the count shipped in the
// bundled data mirror, so a real number is always on screen.
import { registerVisit } from './api.js'
import { countUp } from './effects.js'
import { fmtNum } from './utils.js'

/** Last known count from the bundled mirror, used until (or unless) the API answers. */
async function bundledCount() {
  try {
    const res = await $.getJSON('data/visitors.json')
    const n = Number(res?.count)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export async function initVisitors() {
  const el = document.getElementById('visitorCount')
  if (!el) return

  // Show something real straight away rather than a placeholder dash.
  const fallback = await bundledCount()
  if (fallback != null) {
    el.textContent = fmtNum(fallback)
    el.setAttribute('aria-label', `${fmtNum(fallback)} visitors (last saved count)`)
  }

  const count = await registerVisit()
  if (count == null) {
    if (fallback == null) {
      el.textContent = '—'
      el.setAttribute('aria-label', 'Visitor count unavailable')
      $('#visitorBadge').attr('title', 'Visitor count unavailable while offline')
    } else {
      $('#visitorBadge').attr('title', 'Showing the last saved visitor count — the server is unreachable')
    }
    return
  }
  countUp(el, count, { duration: 2200 })
  $('#visitorBadge').attr('title', 'Total visitors')
}
