// Visitor counter badge (top right, beside the logo). Persisted by the backend.
import { registerVisit } from './api.js'
import { countUp } from './effects.js'

export async function initVisitors() {
  const el = document.getElementById('visitorCount')
  const count = await registerVisit()
  if (count == null) {
    el.textContent = '—'
    el.setAttribute('aria-label', 'Visitor count unavailable')
    $('#visitorBadge').attr('title', 'Visitor count unavailable while offline')
    return
  }
  countUp(el, count, { duration: 2200 })
}
