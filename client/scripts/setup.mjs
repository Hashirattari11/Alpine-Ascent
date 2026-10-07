// Copies third-party browser assets (Bootstrap, jQuery, Leaflet, Bootstrap Icons) into /client/vendor
// and mirrors the public JSON content into /client/data so the site still renders if the API is down.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const nm = (p) => path.join(root, 'node_modules', p)
const out = (p) => path.join(root, 'vendor', p)

const copy = (from, to) => {
  if (!fs.existsSync(from)) return console.warn('missing', from)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.cpSync(from, to, { recursive: true })
}

copy(nm('bootstrap/dist/css/bootstrap.min.css'), out('bootstrap/bootstrap.min.css'))
copy(nm('bootstrap/dist/js/bootstrap.bundle.min.js'), out('bootstrap/bootstrap.bundle.min.js'))
copy(nm('jquery/dist/jquery.min.js'), out('jquery/jquery.min.js'))
copy(nm('leaflet/dist/leaflet.css'), out('leaflet/leaflet.css'))
copy(nm('leaflet/dist/leaflet.js'), out('leaflet/leaflet.js'))
copy(nm('leaflet/dist/images'), out('leaflet/images'))
copy(nm('bootstrap-icons/font/bootstrap-icons.min.css'), out('bootstrap-icons/bootstrap-icons.min.css'))
copy(nm('bootstrap-icons/font/fonts'), out('bootstrap-icons/fonts'))

// Offline content fallback (everything except private/visitor data)
const dataSrc = path.join(root, '..', 'server', 'data')
const PUBLIC = ['expeditions', 'clubs', 'history', 'types', 'techniques', 'shelter', 'hazards', 'records', 'stories', 'gallery', 'news', 'guidelines', 'stats']
if (fs.existsSync(dataSrc)) {
  for (const n of PUBLIC) copy(path.join(dataSrc, `${n}.json`), path.join(root, 'data', `${n}.json`))
}
console.log('client setup complete')
