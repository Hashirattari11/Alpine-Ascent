// mount(): the standard loading pattern for every API-driven section
// (skeleton -> fetch -> render -> hydrate, with a retry-able error state).
import { getResource } from './api.js'
import { hydrateImages, errorBlock } from './utils.js'
import { initReveal, initCounters } from './effects.js'

export function afterRender(root) {
  hydrateImages(root)
  initReveal(root)
  initCounters(root)
}

export async function mount(selector, resource, render, { skeleton = '', label = resource, after } = {}) {
  const $el = $(selector)
  // Multi-page: only hydrate sections that exist on the current page.
  if (!$el.length) return null
  const load = async () => {
    $el.attr('aria-busy', 'true').html(skeleton)
    try {
      const { data } = await getResource(resource, { force: false })
      $el.html(render(data)).attr('aria-busy', 'false')
      afterRender($el[0])
      if (after) after($el, data)
      return data
    } catch {
      $el.attr('aria-busy', 'false').html(errorBlock(label))
      $el.find('[data-retry]').one('click', load)
      return null
    }
  }
  return load()
}

export const iconTag = (name, fallback = 'triangle') => `<i class="bi bi-${name || fallback}" aria-hidden="true"></i>`
