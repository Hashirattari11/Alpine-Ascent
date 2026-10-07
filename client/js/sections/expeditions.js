// Expeditions: full catalogue (with itineraries) on /expeditions and a preview grid on the home page.
import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'

const DIFF = [
  { max: 2, label: 'Beginner', cls: 'r1' },
  { max: 3, label: 'Moderate', cls: 'r1' },
  { max: 4, label: 'Challenging', cls: 'r2' },
  { max: 5, label: 'Expert', cls: 'r3' },
]
const diffOf = (n) => DIFF.find((d) => n <= d.max) || DIFF[DIFF.length - 1]
const money = (e) => `${e.currency} ${e.priceFrom.toLocaleString('en-US')}`

const dots = (n) => `<span class="dots" role="img" aria-label="Difficulty ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`

const card = (e, i, full) => `
  <div class="col-lg-6" data-reveal style="--d:${(i % 2) * 0.12}s">
    <article class="card-lux exp-card tilt" id="exp-${esc(e.id)}">
      <div class="badge-wrap">
        ${picture(e.image, `${e.name}${e.height ? ` — ${e.peak}, ${e.height.toLocaleString('en-US')} m` : ''}`, { sizes: full ? '(min-width: 992px) 620px, 100vw' : '(min-width: 992px) 40vw, 100vw' })}
        <span class="risk-badge ${diffOf(e.difficulty).cls}">${esc(diffOf(e.difficulty).label)}</span>
      </div>
      <div class="card-lux__body">
        <div class="exp-meta">
          <span><i class="bi bi-geo-alt"></i>${esc(e.country)}</span>
          <span><i class="bi bi-calendar3"></i>${esc(e.season)}</span>
          <span><i class="bi bi-clock"></i>${esc(e.duration)}</span>
          <span><i class="bi bi-people"></i>max ${e.groupMax} · ${esc(e.guideRatio)}</span>
        </div>
        <h2 class="exp-title">${esc(e.name)}</h2>
        <p>${esc(e.summary)}</p>
        <ul class="tag-list exp-tags">${e.highlights.slice(0, 3).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        ${full ? `
        <div class="exp-detail">
          <div class="exp-col">
            <h3>Day by day</h3>
            <ol class="mini-itins">
              ${e.itinerary.map((d) => `<li><span class="mini-itins__day">${esc(d.day)}</span><div><strong>${esc(d.title)}</strong><p>${esc(d.detail)}</p></div></li>`).join('')}
            </ol>
          </div>
          <div class="exp-col">
            <h3>Included</h3>
            <ul class="tip-list">${e.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            <h3 class="mt-3">Skills needed</h3>
            <ul class="tip-list">${e.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
            <p class="small mt-3 mb-0" style="color:var(--muted)"><strong style="color:var(--text)">Grade:</strong> ${esc(e.grade)}</p>
          </div>
        </div>` : ''}
        <div class="exp-foot">
          <div><small>From</small><strong>${esc(money(e))}</strong><small>per person</small></div>
          ${full ? `<a class="btn btn-gold btn-sm" href="contact.html"><span>Enquire</span><i class="bi bi-arrow-right"></i></a>` : `<a class="link-arrow" href="expeditions.html"><span>View details</span><i class="bi bi-arrow-right"></i></a>`}
        </div>
      </div>
    </article>
  </div>`

export function initExpeditionsGrid() {
  return mount('#expGrid', 'expeditions', (list) => list.slice(0, 6).map((e, i) => card(e, i, false)).join(''), {
    skeleton: skeleton(6, 'col-lg-6', 420),
    label: 'our signature expeditions',
  })
}

// The catalogue needs its data before rendering the region filters, so it fetches itself.
export async function initExpeditions() {
  const { getResource } = await import('../api.js')
  const { afterRender } = await import('../core.js')
  const $list = $('#expList')
  if (!$list.length) return
  const $filters = $('#expFilters')
  const $count = $('#expCount')
  let all = []
  let region = 'All'

  const render = () => {
    const shown = region === 'All' ? all : all.filter((e) => e.region === region)
    $list.html(shown.map((e, i) => card(e, i, true)).join(''))
    $count.text(`${shown.length} of ${all.length} expeditions shown`)
    afterRender($list[0])
  }

  const { data } = await getResource('expeditions')
  all = data
  const regions = ['All', ...new Set(data.map((e) => e.region))]
  $filters.html(regions.map((c) => `<button type="button" class="chip ${c === 'All' ? 'is-active' : ''}" aria-pressed="${c === 'All'}" data-region="${esc(c)}">${esc(c)}</button>`).join(''))
  $filters.on('click', '.chip', function () {
    region = this.dataset.region
    $filters.find('.chip').removeClass('is-active').attr('aria-pressed', 'false')
    $(this).addClass('is-active').attr('aria-pressed', 'true')
    render()
  })
  render()
}
