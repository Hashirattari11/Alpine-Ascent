import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')

/** Public, read-only content collections exposed at GET /api/<name>. */
export const RESOURCES = [
  'expeditions',
  'clubs',
  'history',
  'types',
  'techniques',
  'shelter',
  'hazards',
  'records',
  'stories',
  'gallery',
  'news',
  'guidelines',
  'stats',
]

export const file = (name) => path.join(DATA_DIR, `${name}.json`)

export async function readJson(name, fallback) {
  try {
    return JSON.parse(await fs.readFile(file(name), 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT' && fallback !== undefined) return fallback
    throw err
  }
}

// Writes are serialised per file and made atomic (temp file + rename)
// so concurrent requests can never corrupt the JSON store.
const queues = new Map()
export function updateJson(name, fallback, mutator) {
  const run = async () => {
    const current = await readJson(name, fallback)
    const next = await mutator(current)
    const tmp = `${file(name)}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(next, null, 2))
    await fs.rename(tmp, file(name))
    return next
  }
  const prev = queues.get(name) ?? Promise.resolve()
  const job = prev.then(run, run)
  queues.set(name, job.catch(() => {}))
  return job
}
