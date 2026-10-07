import { mount } from '../core.js'
import { esc, picture, skeleton, reduced } from '../utils.js'

const story = (s, i) => `
  <div class="carousel-item ${i === 0 ? 'active' : ''}">
    <div class="story">
      <div class="story__img zoom" data-reveal="left">
        ${picture(s.image, `${esc(s.expedition)}, ${s.year}`, { sizes: '(min-width: 992px) 50vw, 100vw' })}
        <span class="story__year">${s.year}</span>
      </div>
      <div data-reveal="right" style="--d:.12s">
        <span class="story__quote-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>${esc(s.quote)}</blockquote>
        <p class="story__name">${esc(s.name)}</p>
        <p class="story__role">${esc(s.role)}</p>
        <div class="story__exp"><span><b>${esc(s.expedition)}</b></span><span>${esc(s.result)}</span></div>
      </div>
    </div>
  </div>`

export function initStories() {
  return mount('#storiesWrap', 'stories', (items) => `
    <div id="storyCarousel" class="carousel slide" aria-label="Success stories" data-bs-interval="9000">
      <div class="carousel-inner">${items.map(story).join('')}</div>
    </div>
    <div class="story-controls" data-reveal>
      <button type="button" class="circle-btn" data-bs-target="#storyCarousel" data-bs-slide="prev" aria-label="Previous story"><i class="bi bi-chevron-left"></i></button>
      <button type="button" class="circle-btn" data-bs-target="#storyCarousel" data-bs-slide="next" aria-label="Next story"><i class="bi bi-chevron-right"></i></button>
      <p class="story-count mb-0" aria-live="polite"><b>01</b> / ${String(items.length).padStart(2, '0')}</p>
      <div class="story-dots">${items.map((_, i) => `<button type="button" aria-label="Story ${i + 1}" class="${i === 0 ? 'active' : ''}" data-bs-target="#storyCarousel" data-bs-slide-to="${i}"></button>`).join('')}</div>
    </div>`, {
    skeleton: skeleton(1, 'col-12', 520),
    label: 'our success stories',
    after: ($w, items) => {
      const c = document.getElementById('storyCarousel')
      new window.bootstrap.Carousel(c, { interval: reduced ? false : 9000, pause: 'hover', touch: true })
      c.addEventListener('slid.bs.carousel', (e) => {
        $('.story-count b').text(String(e.to + 1).padStart(2, '0'))
        $('.story-dots button').removeClass('active').eq(e.to).addClass('active')
      })
      void items
    },
  })
}
