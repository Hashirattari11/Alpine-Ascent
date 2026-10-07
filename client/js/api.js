// REST client built on jQuery's $.ajax. Falls back to the bundled JSON mirror if the server is down.
const BASE = window.AA_API_BASE || '/api'
const TIMEOUT = 6000
const cache = new Map()

export const apiState = { offline: false }

function notifyOffline() {
  if (apiState.offline) return
  apiState.offline = true
  document.documentElement.classList.add('is-offline')
  const el = document.getElementById('offlineToast')
  if (el && window.bootstrap) bootstrap.Toast.getOrCreateInstance(el, { autohide: true, delay: 9000 }).show()
}

/** GET /api/<name> with automatic offline fallback. Resolves { data, offline }. Results are cached. */
export function getResource(name, { force = false } = {}) {
  if (!force && cache.has(name)) return cache.get(name)
  const p = new Promise((resolve, reject) => {
    $.ajax({ url: `${BASE}/${name}`, dataType: 'json', timeout: TIMEOUT })
      .done((data) => resolve({ data, offline: false }))
      .fail(() => {
        $.ajax({ url: `data/${name}.json`, dataType: 'json', timeout: TIMEOUT })
          .done((data) => { notifyOffline(); resolve({ data, offline: true }) })
          .fail(() => reject(new Error(`Could not load ${name}`)))
      })
  })
  cache.set(name, p)
  p.catch(() => cache.delete(name))
  return p
}

function send(method, path, body) {
  return new Promise((resolve) => {
    $.ajax({ url: `${BASE}${path}`, method, contentType: 'application/json', dataType: 'json', data: body ? JSON.stringify(body) : undefined, timeout: TIMEOUT })
      .done((data, _s, xhr) => resolve({ ok: true, status: xhr.status, data }))
      .fail((xhr) => {
        if (xhr.status === 0 || xhr.status >= 502) notifyOffline()
        resolve({ ok: false, status: xhr.status, data: xhr.responseJSON || {} })
      })
  })
}

export const postEnquiry = (payload) => send('POST', '/enquiry', payload)
export const postNewsletter = (email) => send('POST', '/newsletter', { email })
export const getInterests = () => send('GET', '/enquiry/interests')

const sid = () => {
  let id = sessionStorage.getItem('aa_sid')
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('aa_sid', id)
  }
  return id
}

/** Counts this browser session once (POST), otherwise just reads the counter (GET). */
export async function registerVisit() {
  const counted = sessionStorage.getItem('aa_counted')
  const res = counted ? await send('GET', '/visitors') : await send('POST', '/visitors/hit', { sessionId: sid() })
  if (res.ok && !counted) sessionStorage.setItem('aa_counted', '1')
  return res.ok ? res.data.count : null
}
