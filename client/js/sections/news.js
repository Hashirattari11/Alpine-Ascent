import { mount } from '../core.js'
import { esc, picture, skeleton, fmtDate, hydrateImages } from '../utils.js'

const paragraphs = (body) => body.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join('')
let articles = []

const card = (n, i) => `
  <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
    <article class="card-lux news-card tilt zoom">
      ${picture(n.image, n.title, { sizes: '(min-width: 992px) 400px, 100vw' })}
      <div class="card-lux__body">
        <div class="news-meta"><span class="cat"><i class="bi bi-bookmark me-1"></i>${esc(n.category)}</span><time datetime="${n.date}">${fmtDate(n.date)}</time></div>
        <h3>${esc(n.title)}</h3>
        <p class="flex-grow-1">${esc(n.excerpt)}</p>
        <button type="button" class="link-arrow" data-news="${esc(n.id)}"><span>Read more</span><i class="bi bi-arrow-right"></i></button>
      </div>
    </article>
  </div>`

export function initNews() {
  return mount('#newsGrid', 'news', (data) => {
    articles = data
    return data.map(card).join('')
  }, {
    skeleton: skeleton(3, 'card-grid-item', 400),
    label: 'the latest news',
    after: () => {
      $('#newsGrid').on('click', '[data-news]', function () {
        const n = articles.find((x) => x.id === this.dataset.news)
        if (!n) return
        const $content = $('#newsModalContent')
        $content.html(`
          <div class="position-relative news-modal__hero">
            ${picture(n.image, n.title, { sizes: '100vw', eager: true })}
            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close article"></button>
          </div>
          <div class="news-article">
            <div class="news-meta"><span class="cat">${esc(n.category)}</span><time datetime="${n.date}">${fmtDate(n.date)}</time></div>
            <h2 id="newsModalTitle">${esc(n.title)}</h2>
            ${paragraphs(n.body)}
          </div>`)
        // the hero is injected after boot, so it needs the blur-up wiring applied here
        hydrateImages($content[0])
        window.bootstrap.Modal.getOrCreateInstance(document.getElementById('newsModal')).show()
      })
    },
  })
}
