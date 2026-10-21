import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'
import { replayCounters } from '../effects.js'

const card = (r, i) => `
  <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
    <article class="card-lux record-card tilt">
      ${picture(r.image, r.title, { sizes: '(min-width: 1200px) 300px, (min-width: 992px) 34vw, 100vw' })}
      <div class="card-lux__body">
        <p class="eyebrow mb-0"><span class="eyebrow__line"></span>${esc(r.holder)}</p>
        <p class="record-num"><span data-count="${r.value}" ${r.plain ? 'data-plain="1"' : ''} ${r.suffix ? `data-suffix="${esc(r.suffix)}"` : ''}>0</span>${r.unit ? `<small>${esc(r.unit)}</small>` : ''}</p>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.detail)}</p>
        <div class="record-foot"><span>Year</span><b>${esc(r.year)}</b></div>
      </div>
    </article>
  </div>`

const render = (groups) => `
  <ul class="nav pill-tabs" role="tablist" aria-label="Record categories">
    ${groups.map((g, i) => `<li class="nav-item" role="presentation"><button class="nav-link ${i === 0 ? 'active' : ''}" id="rec-tab-${g.id}" data-bs-toggle="pill" data-bs-target="#rec-${g.id}" type="button" role="tab" aria-controls="rec-${g.id}" aria-selected="${i === 0}">${esc(g.label)}</button></li>`).join('')}
  </ul>
  <div class="tab-content">
    ${groups.map((g, i) => `
      <div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="rec-${g.id}" role="tabpanel" aria-labelledby="rec-tab-${g.id}" tabindex="0">
        <p class="records-intro">${esc(g.intro)}</p>
        <div class="card-grid">${g.items.map(card).join('')}</div>
      </div>`).join('')}
  </div>`

export function initRecords() {
  return mount('#recordsWrap', 'records', render, {
    skeleton: `<div class="card-grid">${skeleton(3, 'card-grid-item', 300)}</div>`,
    label: 'the records',
    after: ($w) => {
      $w.find('[data-bs-toggle="pill"]').on('shown.bs.tab', (e) => {
        const pane = document.querySelector(e.target.dataset.bsTarget)
        pane.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in'))
        replayCounters(pane)
      })
    },
  })
}
