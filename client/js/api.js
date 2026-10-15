// REST client built on jQuery's $.ajax. Falls back to the bundled JSON mirror if the server is down.
const BASE = window.AA_API_BASE || '/api'
const TIMEOUT = 6000
const cache = new Map()

export const apiState = { offline: false }

// Reading saved content while the API is down is a perfectly good state, not an error to
// shout about on every page load. The notice is kept quiet: the .is-offline class is what
// styles things, and the toast is only raised when the visitor actually tries to submit a form.
function notifyOffline() {
  if (apiState.offline) return
  apiState.offline = true
  document.documentElement.classList.add('is-offline')
  raiseOfflineToast()
}

/** Called by the forms when a submission fails, so the message arrives when it is relevant. */
export function raiseOfflineToast() {
  const el = document.getElementById('offlineToast')
  if (!el || !window.bootstrap) return
  bootstrap.Toast.getOrCreateInstance(el, { autohide: true, delay: 6000 }).show()
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
