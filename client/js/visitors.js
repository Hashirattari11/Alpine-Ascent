import { registerVisit } from './api.js'
import { countUp } from './effects.js'
import { fmtNum } from './utils.js'

async function bundledCount() { try { const res = await $.getJSON('data/visitors.json'); const n = Number(res?.count); return Number.isFinite(n) && n > 0 ? n : null } catch { return null } }

export async function initVisitors() {
  const el = document.getElementById('visitorCount'); if (!el) return
  const fallback = await bundledCount()
  if (fallback != null) { el.textContent = fmtNum(fallback); el.setAttribute('aria-label', `${fmtNum(fallback)} visitors`) }
  const count = await registerVisit()
  if (count == null) { if (fallback == null) { el.textContent = '—'; el.setAttribute('aria-label', 'Visitor count unavailable') } return }
  countUp(el, count, { duration: 2200 })
}
