import { mount } from '../core.js'
import { esc, skeleton } from '../utils.js'

export function initAbout() {
  return mount('#stats', 'stats',
    (stats) => stats.map((s, i) => `
      <div class="col-6 col-lg-3 stat" data-reveal style="--d:${i * 0.1}s">
        <div class="stat__num" data-count="${s.value}" data-suffix="${esc(s.suffix)}" aria-label="${s.value}${esc(s.suffix)}">0</div>
        <div class="stat__label">${esc(s.label)}</div>
      </div>`).join(''),
    { skeleton: skeleton(4, 'col-6 col-lg-3', 110), label: 'our numbers' })
}
