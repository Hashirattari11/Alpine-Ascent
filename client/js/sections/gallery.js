// Gallery: masonry grid, category filters, lazy youtube-nocookie embeds, lightbox with keyboard + swipe.
import { mount } from '../core.js'
import { esc, picture, skeleton } from '../utils.js'

const CATS = ['All', 'Peaks', 'Climbing', 'Camps', 'Glaciers & Ice', 'Videos']
let items = []
let activeImages = [] // images in current filter (lightbox order)
let lbIndex = 0

const isVideo = (g) => g.type === 'video'
const inCat = (g, cat) => cat === 'All' || (cat === 'Videos' ? isVideo(g) : !isVideo(g) && g.category === cat)

const thumb = (g, i) => `
  <figure class="g-item ${isVideo(g) ? 'g-video' : ''}" style="--i:${i}">
    <button type="button" data-lb="${esc(g.id)}" class="g-item__btn zoom" aria-label="${isVideo(g) ? 'Play video: ' : 'Open image: '}${esc(g.title)}">
      ${picture(g.image, g.title, { sizes: '(min-width: 1400px) 25vw, (min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw' })}
      ${isVideo(g) ? `<span class="g-tag">Film</span><span class="play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>` : `<span class="g-item__cap"><span>${esc(g.title)}</span><i class="bi bi-arrows-fullscreen"></i></span>`}
    </button>
  </figure>`

function renderGrid(cat) {
  const list = items.filter((g) => inCat(g, cat))
  activeImages = list.filter((g) => !isVideo(g))
  $('#galleryGrid').html(list.map((g, i) => thumb(g, i)).join('') || '<p class="load-error">Nothing in this category yet.</p>')
}

export function initGallery() {
  return mount('#galleryGrid', 'gallery', (data) => {
    items = data
    const cats = CATS.filter((c) => c !== 'Videos' && (c === 'All' || items.some((g) => !isVideo(g) && g.category === c)))
    cats.push('Videos')
    $('#galleryFilters').html(cats.map((c, i) => `<button type="button" class="chip ${i === 0 ? 'is-active' : ''}" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join(''))
    activeImages = items.filter((g) => !isVideo(g))
    return items.map((g, i) => thumb(g, i)).join('')
  }, {
    skeleton: skeleton(8, 'g-item', 260),
    label: 'the gallery',
    after: () => {
      $('#galleryFilters').on('click', '.chip', function () {
        $('#galleryFilters .chip').removeClass('is-active').attr('aria-pressed', 'false')
        $(this).addClass('is-active').attr('aria-pressed', 'true')
        renderGrid(this.dataset.cat)
      })

      const modalEl = document.getElementById('lightbox')
      const modal = new window.bootstrap.Modal(modalEl, { keyboard: true })
      const hydrate = () => $('#lbStage').html('<img id="lbImg" alt=""><figcaption id="lbCaption"></figcaption>')
      hydrate()

      const swap = (dir) => {
        if (!activeImages.length) return
        lbIndex = (lbIndex + dir + activeImages.length) % activeImages.length
        const g = activeImages[lbIndex]
        const img = document.getElementById('lbImg')
        img.classList.add('is-swapping')
        setTimeout(() => {
          img.src = `images/${g.image}.webp`
          img.alt = g.alt || g.title
          $('#lbCaption').text(g.title)
          $('#lbCount').text(`${lbIndex + 1} / ${activeImages.length}`)
          img.classList.remove('is-swapping')
        }, 160)
      }
      const open = (id) => {
        const g = items.find((x) => x.id === id)
        if (!g) return
        if (isVideo(g)) {
          $('#lbStage').html(`<div class="ratio ratio-16x9 w-100" style="max-height:75vh"><iframe src="https://www.youtube-nocookie.com/embed/${g.youtubeId}?autoplay=1&rel=0&modestbranding=1" title="${esc(g.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div><figcaption>${esc(g.title)}</figcaption>`)
          $('#lbCount').text('Film')
          modal.show()
          return
        }
        lbIndex = Math.max(0, activeImages.findIndex((x) => x.id === id))
        const img = document.getElementById('lbImg')
        img.src = `images/${g.image}.webp`
        img.alt = g.alt || g.title
        $('#lbCaption').text(g.title)
        $('#lbCount').text(`${lbIndex + 1} / ${activeImages.length}`)
        modal.show()
      }
      $('#galleryGrid').on('click', '[data-lb]', function () { open(this.dataset.lb) })
      $('#lbPrev').on('click', () => swap(-1))
      $('#lbNext').on('click', () => swap(1))
      modalEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') swap(-1)
        if (e.key === 'ArrowRight') swap(1)
      })
      modalEl.addEventListener('hidden.bs.modal', hydrate)
      let sx = 0, sy = 0
      $('#lbStage').on('touchstart', function (e) { sx = e.originalEvent.touches[0].clientX; sy = e.originalEvent.touches[0].clientY })
      $('#lbStage').on('touchend', function (e) {
        const dx = e.originalEvent.changedTouches[0].clientX - sx
        const dy = e.originalEvent.changedTouches[0].clientY - sy
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) swap(dx < 0 ? 1 : -1)
      })
    },
  })
}
