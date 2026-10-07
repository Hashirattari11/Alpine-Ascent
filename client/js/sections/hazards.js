import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'

const level = (r) => (r >= 5 ? 'r3' : r === 4 ? 'r2' : 'r1')

const card = (h, i) => `
  <div class="col-md-6 col-lg-4" data-reveal style="--d:${(i % 3) * 0.12}s">
    <article class="card-lux hazard-card tilt zoom ${level(h.risk)}" data-reveal="none">
      <div class="badge-wrap">
        ${picture(h.image, `${h.title}: mountain hazard`, { sizes: '(min-width: 992px) 400px, 100vw' })}
        <span class="risk-badge">${esc(h.riskLabel)} risk</span>
        <span class="icon-badge"><i class="bi bi-${esc(h.icon)}" aria-hidden="true"></i></span>
      </div>
      <div class="card-lux__body">
        <h3>${esc(h.title)}</h3>
        <div class="risk-meter" role="img" aria-label="Risk level ${h.risk} of 5, ${esc(h.riskLabel)}">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= h.risk ? 'on' : ''}"></i>`).join('')}</div>
        <p>${esc(h.summary)}</p>
        <div class="bars">
          <div class="bar" style="--v:${h.likelihood / 5}">Likelihood<span></span></div>
          <div class="bar" style="--v:${h.severity / 5}">Severity<span></span></div>
        </div>
        <ul class="signs" aria-label="Warning signs">${h.signs.map((s) => `<li><i class="bi bi-exclamation-circle"></i>${esc(s)}</li>`).join('')}</ul>
        <button class="toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#haz-${h.id}" aria-expanded="false" aria-controls="haz-${h.id}"><span>Safety tips</span><i class="bi bi-chevron-down" aria-hidden="true"></i></button>
        <div class="collapse" id="haz-${h.id}"><ul class="tip-list">${h.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      </div>
    </article>
  </div>`

export function initHazards() {
  return mount('#hazardGrid', 'hazards', (list) => list.map(card).join(''), {
    skeleton: skeleton(3, 'col-md-6 col-lg-4', 560),
    label: 'hazard information',
    after: ($g) => {
      // bar animation is keyed off .is-in on the card
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { threshold: 0.25 })
      $g.find('.hazard-card').each((_, el) => io.observe(el))
    },
  })
}
