import { mount } from '../core.js'
import { esc, picture, skeleton, pad } from '../utils.js'

const pips = (n) => `<span class="pips" role="img" aria-label="Difficulty ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`

const card = (t, i) => `
  <div class="col-md-6 col-xl-3" data-reveal style="--d:${(i % 4) * 0.1}s">
    <div class="type-card zoom" data-type="${esc(t.id)}">
      <div class="type-card__inner">
        <div class="type-face type-face--front">
          ${picture(t.image, `${t.title}: ${t.tagline}`, { sizes: '(min-width: 1200px) 300px, (min-width: 768px) 50vw, 100vw' })}
          <div class="type-front__body">
            <span class="type-front__num">${pad(i + 1)} &middot; ${pips(t.difficulty)}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.tagline)}</p>
            <button type="button" class="flip-btn" aria-expanded="false" aria-label="Show details for ${esc(t.title)}"><span>Explore</span><i class="bi bi-arrow-repeat"></i></button>
          </div>
        </div>
        <div class="type-face type-face--back" inert>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.summary)}</p>
          <dl class="kv">
            <dt>Best season</dt><dd>${esc(t.season)}</dd>
            <dt>Grading</dt><dd>${esc(t.gradeSystem)}</dd>
            <dt>Core skills</dt>
          </dl>
          <ul class="tag-list">${t.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <dl class="kv"><dt>Classic objectives</dt><dd>${t.iconic.map(esc).join('<br>')}</dd></dl>
          <button type="button" class="flip-btn" aria-label="Back to ${esc(t.title)} card"><i class="bi bi-arrow-left"></i><span>Back</span></button>
        </div>
      </div>
    </div>
  </div>`

const cta = `
  <div class="col-md-6 col-xl-3" data-reveal style="--d:.3s">
    <div class="type-cta">
      <p class="eyebrow"><span class="eyebrow__line"></span>Not sure?</p>
      <h3>Not sure where to start?</h3>
      <p>Tell us your experience and ambitions. A guide will design an itinerary, from your first glacier walk to an 8,000-metre peak.</p>
      <div><a href="#contact" class="btn btn-gold magnetic"><span>Talk to a guide</span><i class="bi bi-arrow-right"></i></a></div>
    </div>
  </div>`

function setFlip($card, flipped) {
  $card.toggleClass('is-flipped', flipped)
  const $front = $card.find('.type-face--front')
  const $back = $card.find('.type-face--back')
  if (flipped) { $front.attr('inert', ''); $back.removeAttr('inert') } else { $back.attr('inert', ''); $front.removeAttr('inert') }
  $front.find('.flip-btn').attr('aria-expanded', String(flipped))
  setTimeout(() => $card.find(flipped ? '.type-face--back .flip-btn' : '.type-face--front .flip-btn').trigger('focus'), 450)
}

export function initTypes() {
  return mount('#typesGrid', 'types', (types) => types.map(card).join('') + cta, {
    skeleton: skeleton(4, 'col-md-6 col-xl-3', 470),
    label: 'the climbing styles',
    after: ($grid) => {
      $grid.on('click', '.type-face--front', function (e) { setFlip($(this).closest('.type-card'), true) })
      $grid.on('click', '.type-face--back .flip-btn', function () { setFlip($(this).closest('.type-card'), false) })
      $grid.on('keydown', '.type-card', function (e) { if (e.key === 'Escape') setFlip($(this), false) })
    },
  })
}
