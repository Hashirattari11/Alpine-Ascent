import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'
import { onScrollFrame } from '../effects.js'

export function initHistory() {
  return mount('#timelineItems', 'history',
    (items) => items.map((h) => `
      <article class="t-item" data-reveal="none">
        <div class="t-card zoom" data-reveal>
          ${picture(h.image, `${h.title}: ${h.place}`, { sizes: '(min-width: 992px) 560px, 100vw' })}
          <div class="t-body">
            <p class="t-year">${esc(h.year)}</p>
            <h3 class="t-title">${esc(h.title)}</h3>
            <div class="t-meta"><span><i class="bi bi-geo-alt"></i>${esc(h.place)}</span><span><i class="bi bi-person"></i>${esc(h.people)}</span></div>
            <p class="t-text">${esc(h.text)}</p>
          </div>
        </div>
      </article>`).join(''),
    {
      skeleton: skeleton(2, 'd-block mb-4', 380),
      label: 'the timeline',
      after: () => {
        const tl = document.getElementById('timeline')
        const fill = document.getElementById('timelineFill')
        onScrollFrame(() => {
          const r = tl.getBoundingClientRect()
          const p = (window.innerHeight * 0.55 - r.top) / r.height
          fill.style.transform = `scaleY(${Math.min(1, Math.max(0, p)).toFixed(4)})`
        })
      },
    })
}
