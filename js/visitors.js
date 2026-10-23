import { getResource } from './data.js'
import { countUp } from './effects.js'
import { fmtNum } from './utils.js'

const VISITS_KEY = 'aa_extra_visits'
const SESSION_KEY = 'aa_visit_counted'

export async function initVisitors() {
  const el = document.getElementById('visitorCount')
  if (!el) return

  let count = Number(el.textContent.replace(/[^0-9]/g, '')) || 0

  try {
    const { data } = await getResource('visitors')
    count = Number(data.count) || count
  } catch (e) {
    count = count || 1
  }

  let extra = Number(localStorage.getItem(VISITS_KEY)) || 0
  if (!sessionStorage.getItem(SESSION_KEY)) {
    extra = extra + 1
    localStorage.setItem(VISITS_KEY, String(extra))
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  const total = count + extra
  el.textContent = fmtNum(total)
  el.setAttribute('aria-label', fmtNum(total) + ' visitors')
  countUp(el, total, { duration: 1600 })
}
