import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'

const dots = (n, label) => `<span class="dots" role="img" aria-label="${label} ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`

const card = (s, i) => `
  <div class="col-md-6 col-lg-4" data-reveal style="--d:${(i % 3) * 0.12}s">
    <article class="card-lux shelter-card tilt zoom">
      <div class="badge-wrap">
        ${picture(s.image, `${s.title}: a mountain shelter option`, { sizes: '(min-width: 992px) 400px, 100vw' })}
        <span class="icon-badge"><i class="bi bi-${esc(s.icon)}" aria-hidden="true"></i></span>
      </div>
      <div class="card-lux__body">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.summary)}</p>
        <div class="meters">
          <div class="meter"><small>Warmth</small>${dots(s.stats.warmth, 'Warmth')}</div>
          <div class="meter"><small>Pack weight</small>${dots(s.stats.weight, 'Pack weight')}</div>
          <div class="meter"><small>Build time</small><b>${esc(s.stats.buildTime)}</b></div>
        </div>
        <button class="toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#shelter-${s.id}" aria-expanded="false" aria-controls="shelter-${s.id}"><span>Field tips</span><i class="bi bi-chevron-down" aria-hidden="true"></i></button>
        <div class="collapse" id="shelter-${s.id}"><ul class="tip-list">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      </div>
    </article>
  </div>`

export function initShelter() {
  return mount('#shelterGrid', 'shelter', (list) => list.map(card).join(''), { skeleton: skeleton(3, 'col-md-6 col-lg-4', 480), label: 'shelter guidance' })
}
