import { getResource } from './data.js'
import { addVisit, readDatabase } from './db.js'
import { countUp } from './effects.js'
import { fmtNum } from './utils.js'

const SESSION_KEY = 'aa_visit_counted'

export async function initVisitors() {
  const el = document.getElementById('visitorCount')
  if (!el) return

  let base = Number(el.textContent.replace(/[^0-9]/g, '')) || 0

  try {
    const { data } = await getResource('visitors')
    base = Number(data.count) || base
  } catch (e) {
    base = base || 1
  }

  let visits = 0
  try {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      addVisit()
      sessionStorage.setItem(SESSION_KEY, '1')
    }
    visits = readDatabase().visits
  } catch (e) {
    visits = 0
  }

  const total = base + visits
  el.textContent = fmtNum(total)
  el.setAttribute('aria-label', fmtNum(total) + ' visitors')
  countUp(el, total, { duration: 1600 })
}
