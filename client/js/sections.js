// All page sections in one file. Each init() runs only if its container exists on the page.
import { mount } from './core.js'
import { esc, picture, skeleton, fmtDate, hydrateImages } from './utils.js'
import { replayCounters } from './effects.js'
import { postEnquiry, postNewsletter, getInterests, raiseOfflineToast } from './api.js'

const diffLabel = (n) => n <= 2 ? 'Beginner' : n <= 3 ? 'Moderate' : n <= 4 ? 'Challenging' : 'Expert'
const diffCls = (n) => n <= 2 ? 'r1' : n <= 3 ? 'r1' : n <= 4 ? 'r2' : 'r3'
const money = (e) => `${e.currency} ${e.priceFrom.toLocaleString('en-US')}`
const dots = (n) => `<span class="dots">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`

const paragraphs = (body) => body.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join('')

// ---------- About / stats ----------
export function initAbout() {
  return mount('#stats', 'stats', (stats) => stats.map((s, i) => `
    <div class="col-6 col-lg-3 stat" data-reveal style="--d:${i * 0.1}s">
      <div class="stat__num" data-count="${s.value}" data-suffix="${esc(s.suffix)}">0</div>
      <div class="stat__label">${esc(s.label)}</div>
    </div>`).join(''), { skeleton: skeleton(4, 'col-6 col-lg-3', 110), label: 'our numbers' })
}

// ---------- History ----------
export function initHistory() {
  return mount('#timelineItems', 'history', (items) => items.map((h) => `
    <article class="t-item"><div class="t-card zoom" data-reveal>
      ${picture(h.image, `${h.title}: ${h.place}`, { sizes: '(min-width: 992px) 560px, 100vw' })}
      <div class="t-body"><p class="t-year">${esc(h.year)}</p><h3 class="t-title">${esc(h.title)}</h3>
        <div class="t-meta"><span><i class="bi bi-geo-alt"></i>${esc(h.place)}</span><span><i class="bi bi-person"></i>${esc(h.people)}</span></div>
        <p class="t-text">${esc(h.text)}</p></div></div></article>`).join(''),
  { skeleton: skeleton(2, 'd-block mb-4', 380), label: 'the timeline' })
}

// ---------- Types ----------
export function initTypes() {
  const pips = (n) => `<span class="pips">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`
  const pad = (n) => String(n).padStart(2, '0')
  const card = (t, i) => `
    <div class="col-md-6 col-xl-3" data-reveal style="--d:${(i % 4) * 0.1}s">
      <div class="type-card zoom" data-type="${esc(t.id)}">
        <div class="type-card__inner">
        <div class="type-face type-face--front">
          ${picture(t.image, `${t.title}: ${t.tagline}`, { sizes: '(min-width: 1200px) 300px, 100vw' })}
          <div class="type-front__body"><span class="type-front__num">${pad(i + 1)} · ${pips(t.difficulty)}</span>
            <h3>${esc(t.title)}</h3><p>${esc(t.tagline)}</p>
            <button type="button" class="flip-btn" aria-expanded="false"><span>Explore</span><i class="bi bi-arrow-repeat"></i></button>
          </div>
        </div>
        <div class="type-face type-face--back" inert>
          <h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p>
          <dl class="kv"><dt>Best season</dt><dd>${esc(t.season)}</dd>
            <dt>Grading</dt><dd>${esc(t.gradeSystem)}</dd>
            <dt>Core skills</dt><dd>${t.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</dd>
          </dl>
          <dl class="kv"><dt>Classic objectives</dt><dd>${t.iconic.map(esc).join('<br>')}</dd></dl>
          <button type="button" class="flip-btn"><i class="bi bi-arrow-left"></i><span>Back</span></button>
        </div></div></div></div>`
  const contactHref = () => document.getElementById('contact') ? '#contact' : 'contact.html'
  const cta = `<div class="col-md-6 col-xl-3" data-reveal style="--d:.3s">
    <div class="type-cta"><p class="eyebrow"><span class="eyebrow__line"></span>Not sure?</p>
      <h3>Not sure where to start?</h3><p>Tell us your experience and ambitions. A guide will design an itinerary.</p>
      <div><a href="${contactHref()}" class="btn btn-gold"><span>Talk to a guide</span><i class="bi bi-arrow-right"></i></a></div></div></div>`
  const setFlip = ($card, flipped) => {
    $card.toggleClass('is-flipped', flipped)
    const $f = $card.find('.type-face--front'), $b = $card.find('.type-face--back')
    if (flipped) { $f.attr('inert', ''); $b.removeAttr('inert') } else { $b.attr('inert', ''); $f.removeAttr('inert') }
    $f.find('.flip-btn').attr('aria-expanded', String(flipped))
  }
  return mount('#typesGrid', 'types', (types) => types.map(card).join('') + cta, {
    skeleton: skeleton(4, 'col-md-6 col-xl-3', 470), label: 'the climbing styles',
    after: ($grid) => {
      $grid.on('click', '.type-face--front', function () { setFlip($(this).closest('.type-card'), true) })
      $grid.on('click', '.type-face--back .flip-btn', function () { setFlip($(this).closest('.type-card'), false) })
    },
  })
}

// ---------- Techniques ----------
export function initTechniques() {
  return mount('#techWrap', 'techniques', (list) => `
    <div class="col-lg-4" data-reveal>
      <div class="nav tech-tabs" role="tablist">${list.map((t, i) => `
        <button class="nav-link ${i === 0 ? 'active' : ''}" id="tech-tab-${t.id}" data-bs-toggle="pill" data-bs-target="#tech-${t.id}" type="button" role="tab" aria-selected="${i === 0}">
          <i class="bi bi-${esc(t.icon)}"></i><span>${esc(t.title)}</span><small>${String(i + 1).padStart(2, '0')}</small></button>`).join('')}</div>
    </div>
    <div class="col-lg-8" data-reveal style="--d:.12s">
      <div class="tab-content">${list.map((t, i) => `
        <div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="tech-${t.id}" role="tabpanel" aria-labelledby="tech-tab-${t.id}" tabindex="0">
          <article class="tech-panel">${picture(t.image, `${t.title} technique`, { sizes: '(min-width: 992px) 66vw, 100vw' })}
            <div class="tech-panel__body"><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p>
              <ol class="steps">${t.steps.map((s) => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
              <div class="tip"><i class="bi bi-lightbulb"></i><div><b>Guide's tip</b>${esc(t.tip)}</div></div></div></article></div>`).join('')}</div>
    </div>`, {
    skeleton: `<div class="col-lg-4"><div class="skeleton" style="height:420px"></div></div><div class="col-lg-8"><div class="skeleton" style="height:620px"></div></div>`,
    label: 'the techniques',
  })
}

// ---------- Shelter ----------
export function initShelter() {
  const card = (s, i) => `
    <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
      <article class="card-lux shelter-card tilt zoom">
        <div class="badge-wrap">${picture(s.image, `${s.title}: a mountain shelter option`, { sizes: '(min-width: 992px) 400px, 100vw' })}
          <span class="icon-badge"><i class="bi bi-${esc(s.icon)}"></i></span></div>
        <div class="card-lux__body"><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p>
          <div class="meters"><div class="meter"><small>Warmth</small>${dots(s.stats.warmth)}</div>
            <div class="meter"><small>Pack weight</small>${dots(s.stats.weight)}</div>
            <div class="meter"><small>Build time</small><b>${esc(s.stats.buildTime)}</b></div></div>
          <button class="toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#shelter-${s.id}"><span>Field tips</span><i class="bi bi-chevron-down"></i></button>
          <div class="collapse" id="shelter-${s.id}"><ul class="tip-list">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div></article></div>`
  return mount('#shelterGrid', 'shelter', (list) => list.map(card).join(''), {
    skeleton: skeleton(3, 'card-grid-item', 480), label: 'shelter guidance',
  })
}

// ---------- Hazards ----------
export function initHazards() {
  const level = (r) => r >= 5 ? 'r3' : r === 4 ? 'r2' : 'r1'
  const card = (h, i) => `
    <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
      <article class="card-lux hazard-card tilt zoom ${level(h.risk)}" data-reveal="none">
        <div class="badge-wrap">${picture(h.image, `${h.title}: mountain hazard`, { sizes: '(min-width: 992px) 400px, 100vw' })}
          <span class="risk-badge">${esc(h.riskLabel)} risk</span><span class="icon-badge"><i class="bi bi-${esc(h.icon)}"></i></span></div>
        <div class="card-lux__body"><h3>${esc(h.title)}</h3>
          <div class="risk-meter">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= h.risk ? 'on' : ''}"></i>`).join('')}</div>
          <p>${esc(h.summary)}</p>
          <div class="bars"><div class="bar" style="--v:${h.likelihood / 5}">Likelihood<span></span></div>
            <div class="bar" style="--v:${h.severity / 5}">Severity<span></span></div></div>
          <ul class="signs">${h.signs.map((s) => `<li><i class="bi bi-exclamation-circle"></i>${esc(s)}</li>`).join('')}</ul>
          <button class="toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#haz-${h.id}"><span>Safety tips</span><i class="bi bi-chevron-down"></i></button>
          <div class="collapse" id="haz-${h.id}"><ul class="tip-list">${h.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div></div></article></div>`
  return mount('#hazardGrid', 'hazards', (list) => list.map(card).join(''), {
    skeleton: skeleton(3, 'card-grid-item', 560), label: 'hazard information',
  })
}

// ---------- Records ----------
export function initRecords() {
  const card = (r, i) => `
    <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
      <article class="card-lux record-card tilt">
        ${picture(r.image, r.title, { sizes: '(min-width: 1200px) 300px, (min-width: 992px) 34vw, 100vw' })}
        <div class="card-lux__body"><p class="eyebrow mb-0"><span class="eyebrow__line"></span>${esc(r.holder)}</p>
          <p class="record-num"><span data-count="${r.value}">${r.plain ? '' : ''}0</span>${r.unit ? `<small>${esc(r.unit)}</small>` : ''}</p>
          <h3>${esc(r.title)}</h3><p>${esc(r.detail)}</p>
          <div class="record-foot"><span>Year</span><b>${esc(r.year)}</b></div></div></article></div>`
  const render = (groups) => `
    <ul class="nav pill-tabs">${groups.map((g, i) => `<li class="nav-item"><button class="nav-link ${i === 0 ? 'active' : ''}" id="rec-tab-${g.id}" data-bs-toggle="pill" data-bs-target="#rec-${g.id}" type="button" role="tab" aria-selected="${i === 0}">${esc(g.label)}</button></li>`).join('')}</ul>
    <div class="tab-content">${groups.map((g, i) => `
      <div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="rec-${g.id}" role="tabpanel" aria-labelledby="rec-tab-${g.id}" tabindex="0">
        <p class="records-intro">${esc(g.intro)}</p><div class="card-grid">${g.items.map(card).join('')}</div></div>`).join('')}</div>`
  return mount('#recordsWrap', 'records', render, {
    skeleton: `<div class="card-grid">${skeleton(3, 'card-grid-item', 300)}</div>`, label: 'the records',
    after: ($w) => { $w.find('[data-bs-toggle="pill"]').on('shown.bs.tab', (e) => {
      const pane = document.querySelector(e.target.dataset.bsTarget)
      pane.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-in'))
      replayCounters(pane) }) },
  })
}

// ---------- News ----------
export function initNews() {
  let articles = []
  const card = (n, i) => `
    <div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
      <article class="card-lux news-card tilt zoom">
        ${picture(n.image, n.title, { sizes: '(min-width: 992px) 400px, 100vw' })}
        <div class="card-lux__body"><div class="news-meta"><span class="cat"><i class="bi bi-bookmark me-1"></i>${esc(n.category)}</span>
          <time datetime="${n.date}">${fmtDate(n.date)}</time></div><h3>${esc(n.title)}</h3>
          <p class="flex-grow-1">${esc(n.excerpt)}</p>
          <button type="button" class="link-arrow" data-news="${esc(n.id)}"><span>Read more</span><i class="bi bi-arrow-right"></i></button></div></article></div>`
  return mount('#newsGrid', 'news', (data) => { articles = data; return data.map(card).join('') }, {
    skeleton: skeleton(3, 'card-grid-item', 400), label: 'the latest news',
    after: () => { $('#newsGrid').on('click', '[data-news]', function () {
      const n = articles.find((x) => x.id === this.dataset.news)
      if (!n) return
      const $content = $('#newsModalContent')
      $content.html(`<div class="position-relative news-modal__hero">${picture(n.image, n.title, { sizes: '100vw', eager: true })}
        <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close article"></button></div>
        <div class="news-article"><div class="news-meta"><span class="cat">${esc(n.category)}</span><time datetime="${n.date}">${fmtDate(n.date)}</time></div>
        <h2 id="newsModalTitle">${esc(n.title)}</h2>${paragraphs(n.body)}</div>`)
      hydrateImages($content[0])
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('newsModal')).show() }) },
  })
}

// ---------- Guidelines ----------
const LS = 'aa_guides_checks'
const loadChecks = () => { try { return JSON.parse(localStorage.getItem(LS)) || {} } catch { return {} } }
const saveChecks = (v) => localStorage.setItem(LS, JSON.stringify(v))

export function initGuidelines() {
  return mount('#guideGrid', 'guidelines', (g) => {
    const checks = loadChecks()
    const hasChecks = Object.values(checks).some(Boolean)
    const card = (c, i) => {
      const done = c.items.filter((_, k) => checks[`${c.id}:${k}`]).length
      return `<div class="card-grid-item" data-reveal style="--d:${(i % 4) * 0.08}s">
        <article class="card-lux guide-card" data-guide="${esc(c.id)}"><div class="card-lux__body">
          <span class="icon-circle"><i class="bi bi-${esc(c.icon)}"></i></span><h3>${esc(c.title)}</h3>
          <p>${esc(c.intro)}</p><ul class="check-list">${c.items.map((it, k) => `
            <li><label class="check"><input type="checkbox" data-key="${c.id}:${k}" ${checks[`${c.id}:${k}`] ? 'checked' : ''} /><span>${esc(it)}</span></label></li>`).join('')}</ul>
          <div class="guide-progress mt-auto" style="--p:${(done / c.items.length).toFixed(2)}"><em data-count-label>${done}/${c.items.length} ready</em>
            <span><i style="transform:scaleX(${done / c.items.length})"></i></span></div></div></article></div>`
    }
    return `${g.cards.map((c, i) => card(c, i)).join('')}
      <div class="col-12" data-reveal ${hasChecks ? '' : 'hidden'}><p class="text-end"><button type="button" class="btn btn-ghost btn-sm" id="resetChecks"><i class="bi bi-arrow-counterclockwise"></i><span>Reset checklist</span></button></p></div>`
  }, { skeleton: skeleton(3, 'card-grid-item', 460), label: 'the guidelines',
    after: ($el, g) => {
      $el.on('change', 'input[type="checkbox"]', function () {
        const all = loadChecks(); all[this.dataset.key] = this.checked; saveChecks(all)
        const [gid, k] = this.dataset.key.split(':')
        const cardEl = document.querySelector(`[data-guide="${gid}"]`)
        const total = g.cards.find((c) => c.id === gid).items.length
        const done = g.cards.find((c) => c.id === gid).items.filter((_, idx) => all[`${gid}:${idx}`]).length
        cardEl.querySelector('[data-count-label]').textContent = `${done}/${total} ready`
        cardEl.querySelector('.guide-progress span i').style.transform = `scaleX(${done / total})`
        $('#resetChecks').closest('.col-12').prop('hidden', false)
      })
      $el.on('click', '#resetChecks', () => {
        localStorage.removeItem(LS); $el.find('input[type="checkbox"]').prop('checked', false)
        g.cards.forEach((c) => {
          const cardEl = document.querySelector(`[data-guide="${c.id}"]`)
          cardEl.querySelector('[data-count-label]').textContent = `0/${c.items.length} ready`
          cardEl.querySelector('.guide-progress span i').style.transform = 'scaleX(0)'
        })
        $('#resetChecks').closest('.col-12').prop('hidden', true)
      })
      $('#gearBanner').html(`<div><p class="eyebrow mb-2"><span class="eyebrow__line"></span>Preparation</p>
        <h3>The expedition gear-check list</h3><p>Curated by our guides: everything you need, grouped by how you pack it.</p></div>
        <div class="actions"><button type="button" class="btn btn-gold" id="printGear"><i class="bi bi-printer"></i><span>Open printable list</span></button>
        <a class="btn btn-ghost" href="#guideGrid" data-scroll><i class="bi bi-check2-all"></i><span>Review categories</span></a></div>`)
      $('#printGear').on('click', () => {
        const rows = g.gearChecklist.map((grp) => `<section><h2>${grp.group}</h2><ul>${grp.items.map((it) => `<li><label><input type="checkbox">${esc(it)}</label></li>`).join('')}</ul></section>`).join('')
        const w = window.open('', '_blank', 'width=820,height=900')
        if (!w) { alert('Pop-up blocked. Please allow pop-ups.'); return }
        w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Gear Checklist</title>
          <style>body{font-family:Georgia,serif;max-width:720px;margin:2.5rem auto;padding:0 1.5rem;color:#111}h1{font-size:2rem}h1 span{color:#b08f46}h2{font-size:1.15rem;margin:1.6rem 0 .5rem;border-bottom:1px solid #ddd;padding-bottom:.3rem}ul{list-style:none;padding:0}li{padding:.2rem 0}input{margin-right:.6rem;accent-color:#b08f46}@media print{button{display:none}}</style>
          </head><body><h1>Alpine <span>Ascents</span> · Gear Checklist</h1><p>Use your browser's Print dialog to save as PDF.</p>${rows}
          <button onclick="window.print()" style="margin-top:1.5rem;padding:.7rem 1.4rem">Print / Save as PDF</button></body></html>`)
        w.document.close()
      })
    },
  })
}

// ---------- Clubs ----------
export function initClubs() {
  const REGIONS = ['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania']
  let clubs = [], region = 'All', selectedId = null, map, layer
  const visible = () => clubs.filter((c) => region === 'All' || c.region === region)
  const pin = (active) => `<div class="aa-pin ${active ? 'is-active' : ''}"><span></span></div>`
  const renderList = () => {
    const list = visible()
    $('#clubList').html(list.length ? list.map((c) => `<li class="club-item ${c.id === selectedId ? 'is-active' : ''}" data-id="${esc(c.id)}">
      <button type="button" class="club-item__btn"><span class="club-item__pin">${pin(c.id === selectedId)}</span>
        <span><span class="club-item__name">${esc(c.name)}</span><span class="club-item__place">${esc(c.city)}, ${esc(c.country)}</span></span></button>
      <div class="club-item__more"><div><div class="club-item__more-inner"><p class="mb-2">${esc(c.description)}</p>
        <p class="small mb-1 text-muted">Founded ${c.founded} · ${esc(c.members)} members</p></div></div></div></li>`).join('') : '<li class="load-error">No clubs match this filter.</li>')
  }
  const renderMarkers = () => {
    layer.clearLayers()
    visible().forEach((c) => { const m = L.marker([c.lat, c.lng], { title: c.name, keyboard: true })
      m.bindPopup(`<div class="pop">${picture(c.image, `${c.name}, ${c.city}`, { sizes: '270px', cls: 'pop__img' })}
        <div class="pop__body"><h4>${esc(c.name)}</h4><div class="pop__place">${esc(c.city)}, ${esc(c.country)}</div><p>${esc(c.description)}</p>
        <a class="btn btn-gold" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span>Visit club</span></a></div></div>`)
      m.on('click', () => selectClub(c.id)); layer.addLayer(m) })
  }
  const selectClub = (id) => { selectedId = selectedId === id ? null : id; renderList(); renderMarkers() }

  return mount('#clubList', 'clubs', (data) => { clubs = data; return '' }, {
    label: 'the club list',
    after: () => {
      $('#regionFilters').html(REGIONS.map((r) => `<button type="button" class="chip ${r === 'All' ? 'is-active' : ''}" data-region="${esc(r)}">${esc(r)}</button>`).join(''))
      $('#regionFilters').on('click', '.chip', function () {
        region = this.dataset.region
        $('#regionFilters .chip').removeClass('is-active').attr('aria-pressed', 'false')
        $(this).addClass('is-active').attr('aria-pressed', 'true')
        renderList(); renderMarkers()
      })
      const worldBounds = L.latLngBounds([84, -179], [-60, 179])
      map = L.map('clubMap', { scrollWheelZoom: false, tap: true, maxBounds: worldBounds, minZoom: 2, worldCopyJump: true })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      map.setView([25, 15], 3)
      layer = L.layerGroup().addTo(map)
      new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('clubMap'))
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      $('#clubList').on('click', '.club-item__btn', function () { selectClub($(this).closest('.club-item').data('id')) })
      renderList(); renderMarkers()
    },
  })
}

// ---------- Stories ----------
export function initStories() {
  return mount('#storiesWrap', 'stories', (items) => `
    <div id="storyCarousel" class="carousel slide" data-bs-interval="9000"><div class="carousel-inner">${items.map((s, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}"><div class="story">
        <div class="story__img zoom" data-reveal="left">${picture(s.image, `${esc(s.expedition)}, ${s.year}`, { sizes: '(min-width: 992px) 50vw, 100vw' })}
          <span class="story__year">${s.year}</span></div>
        <div data-reveal="right" style="--d:.12s"><span class="story__quote-mark">&ldquo;</span><blockquote>${esc(s.quote)}</blockquote>
          <p class="story__name">${esc(s.name)}</p><p class="story__role">${esc(s.role)}</p>
          <div class="story__exp"><span><b>${esc(s.expedition)}</b></span><span>${esc(s.result)}</span></div></div></div></div>`).join('')}
    <div class="story-controls" data-reveal><button type="button" class="circle-btn" data-bs-target="#storyCarousel" data-bs-slide="prev"><i class="bi bi-chevron-left"></i></button>
      <button type="button" class="circle-btn" data-bs-target="#storyCarousel" data-bs-slide="next"><i class="bi bi-chevron-right"></i></button>
      <p class="story-count mb-0"><b>01</b> / ${String(items.length).padStart(2, '0')}</p>
      <div class="story-dots">${items.map((_, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-bs-target="#storyCarousel" data-bs-slide-to="${i}"></button>`).join('')}</div></div>`, {
    skeleton: skeleton(1, 'col-12', 520), label: 'our success stories',
    after: ($w, items) => { const c = document.getElementById('storyCarousel')
      new window.bootstrap.Carousel(c, { interval: 9000, pause: 'hover', touch: true })
      c.addEventListener('slid.bs.carousel', (e) => { $('.story-count b').text(String(e.to + 1).padStart(2, '0'))
        $('.story-dots button').removeClass('active').eq(e.to).addClass('active') }) },
  })
}

// ---------- Gallery ----------
export function initGallery() {
  const CATS = ['All', 'Peaks', 'Climbing', 'Camps', 'Glaciers & Ice', 'Videos']
  const isVideo = (g) => g.type === 'video'
  const inCat = (g, cat) => cat === 'All' || (cat === 'Videos' ? isVideo(g) : !isVideo(g) && g.category === cat)
  let items = [], activeImages = [], lbIndex = 0
  const thumb = (g, i) => `<figure class="g-item ${isVideo(g) ? 'g-video' : ''}"><button type="button" data-lb="${esc(g.id)}" class="g-item__btn zoom" aria-label="${isVideo(g) ? 'Play video: ' : 'Open image: '}${esc(g.title)}">
    ${picture(g.image, g.title, { sizes: '(min-width: 1400px) 25vw, (min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw' })}
    ${isVideo(g) ? `<span class="g-tag">Film</span><span class="play"><i class="bi bi-play-fill"></i></span>` : `<span class="g-item__cap"><span>${esc(g.title)}</span><i class="bi bi-arrows-fullscreen"></i></span>`}</button></figure>`
  return mount('#galleryGrid', 'gallery', (data) => {
    items = data; activeImages = items.filter((g) => !isVideo(g))
    const cats = CATS.filter((c) => c !== 'Videos' && (c === 'All' || items.some((g) => !isVideo(g) && g.category === c))); cats.push('Videos')
    $('#galleryFilters').html(cats.map((c, i) => `<button type="button" class="chip ${i === 0 ? 'is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join(''))
    return items.map((g, i) => thumb(g, i)).join('')
  }, { skeleton: skeleton(8, 'g-item', 260), label: 'the gallery',
    after: () => {
      $('#galleryFilters').on('click', '.chip', function () {
        $('#galleryFilters .chip').removeClass('is-active').attr('aria-pressed', 'false')
        $(this).addClass('is-active').attr('aria-pressed', 'true')
        const list = items.filter((g) => inCat(g, this.dataset.cat))
        activeImages = list.filter((g) => !isVideo(g))
        $('#galleryGrid').html(list.map((g, i) => thumb(g, i)).join('') || '<p class="load-error">Nothing in this category yet.</p>')
      })
      const modalEl = document.getElementById('lightbox'), modal = new window.bootstrap.Modal(modalEl, { keyboard: true })
      const hydrate = () => $('#lbStage').html('<img id="lbImg" alt=""><figcaption id="lbCaption"></figcaption>'); hydrate()
      const swap = (dir) => { if (!activeImages.length) return
        lbIndex = (lbIndex + dir + activeImages.length) % activeImages.length
        const g = activeImages[lbIndex], img = document.getElementById('lbImg')
        img.classList.add('is-swapping')
        setTimeout(() => { img.src = `images/${g.image}.webp`; img.alt = g.alt || g.title
          $('#lbCaption').text(g.title); $('#lbCount').text(`${lbIndex + 1} / ${activeImages.length}`); img.classList.remove('is-swapping') }, 160)
      }
      const open = (id) => { const g = items.find((x) => x.id === id); if (!g) return
        if (isVideo(g)) { $('#lbStage').html(`<div class="ratio ratio-16x9 w-100" style="max-height:75vh"><iframe src="https://www.youtube-nocookie.com/embed/${g.youtubeId}?autoplay=1&rel=0&modestbranding=1" title="${esc(g.title)}" allowfullscreen loading="lazy"></iframe></div><figcaption>${esc(g.title)}</figcaption>`)
          $('#lbCount').text('Film'); modal.show(); return }
        lbIndex = Math.max(0, activeImages.findIndex((x) => x.id === id))
        const img = document.getElementById('lbImg'); img.src = `images/${g.image}.webp`; img.alt = g.alt || g.title
        $('#lbCaption').text(g.title); $('#lbCount').text(`${lbIndex + 1} / ${activeImages.length}`); modal.show()
      }
      $('#galleryGrid').on('click', '[data-lb]', function () { open(this.dataset.lb) })
      $('#lbPrev').on('click', () => swap(-1)); $('#lbNext').on('click', () => swap(1))
      modalEl.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') swap(-1); if (e.key === 'ArrowRight') swap(1) })
      modalEl.addEventListener('hidden.bs.modal', hydrate)
    },
  })
}

// ---------- Expeditions ----------
const expCard = (e, i, full) => `
    <div class="card-grid-item" data-reveal style="--d:${(i % 3) * 0.1}s">
      <article class="card-lux exp-card tilt" id="exp-${esc(e.id)}">
        <div class="badge-wrap">${picture(e.image, `${e.name}${e.height ? ` — ${e.peak}, ${e.height.toLocaleString('en-US')} m` : ''}`, { sizes: full ? '(min-width: 992px) 620px, 100vw' : '(min-width: 992px) 40vw, 100vw' })}
          <span class="risk-badge ${diffCls(e.difficulty)}">${diffLabel(e.difficulty)}</span></div>
        <div class="card-lux__body"><div class="exp-meta"><span><i class="bi bi-geo-alt"></i>${esc(e.country)}</span>
          <span><i class="bi bi-calendar3"></i>${esc(e.season)}</span><span><i class="bi bi-clock"></i>${esc(e.duration)}</span>
          <span><i class="bi bi-people"></i>max ${e.groupMax} · ${esc(e.guideRatio)}</span></div>
          <h2 class="exp-title">${esc(e.name)}</h2><p>${esc(e.summary)}</p>
          <ul class="tag-list exp-tags">${e.highlights.slice(0, 3).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          ${full ? `<button type="button" class="exp-toggle" aria-expanded="false"><span>Itinerary &amp; full details</span><i class="bi bi-chevron-down"></i></button>
            <div class="exp-more"><div class="exp-more__inner"><div class="exp-detail"><div class="exp-col">
              <h3>Day by day</h3><ol class="mini-itins">${e.itinerary.map((d) => `<li><span class="mini-itins__day">${esc(d.day)}</span><div><strong>${esc(d.title)}</strong><p>${esc(d.detail)}</p></div></li>`).join('')}</ol></div>
              <div class="exp-col"><h3>Included</h3><ul class="tip-list">${e.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
                <h3 class="mt-3">Skills needed</h3><ul class="tip-list">${e.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
                <p class="small mt-3 mb-0"><strong>Grade:</strong> ${esc(e.grade)}</p></div></div></div></div>` : ''}
          <div class="exp-foot"><div><small>From</small><strong>${esc(money(e))}</strong><small>per person</small></div>
            ${full ? `<a class="btn btn-gold btn-sm" href="contact.html"><span>Enquire</span><i class="bi bi-arrow-right"></i></a>` : `<a class="link-arrow" href="expeditions.html"><span>View details</span><i class="bi bi-arrow-right"></i></a>`}</div></div></article></div>`

export function initExpeditionsGrid() {
  return mount('#expGrid', 'expeditions', (list) => list.slice(0, 6).map((e, i) => expCard(e, i, false)).join(''), {
    skeleton: `<div class="card-grid">${skeleton(6, 'card-grid-item', 420)}</div>`, label: 'our signature expeditions',
  })
}

export async function initExpeditions() {
  const { getResource } = await import('./api.js')
  const { afterRender } = await import('./core.js')
  const $list = $('#expList'); if (!$list.length) return
  const $filters = $('#expFilters'), $count = $('#expCount')
  let all = [], region = 'All'
  const render = () => { const shown = region === 'All' ? all : all.filter((e) => e.region === region)
    $list.html(shown.map((e, i) => expCard(e, i, true)).join(''))
    $count.text(`${shown.length} of ${all.length} expeditions shown`)
    afterRender($list[0]) }
  $list.on('click', '.exp-toggle', function () {
    const $btn = $(this), open = $btn.attr('aria-expanded') !== 'true'
    $btn.attr('aria-expanded', String(open)).toggleClass('is-open', open).closest('.exp-card').toggleClass('exp-card--open', open) })
  const { data } = await getResource('expeditions'); all = data
  const regions = ['All', ...new Set(data.map((e) => e.region))]
  $filters.html(regions.map((c) => `<button type="button" class="chip ${c === 'All' ? 'is-active' : ''}" data-region="${esc(c)}">${esc(c)}</button>`).join(''))
  $filters.on('click', '.chip', function () { region = this.dataset.region
    $filters.find('.chip').removeClass('is-active').attr('aria-pressed', 'false')
    $(this).addClass('is-active').attr('aria-pressed', 'true'); render() })
  render()
}

// ---------- Contact ----------
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const FALLBACK_INTERESTS = ['Everest Base Camp Trek', 'Island Peak & Lobuche', 'Mont Blanc Ascent', 'Matterhorn Ascent', 'Denali Expedition', 'Aconcagua Expedition', 'Ski Mountaineering Haute Route', 'Introductory Mountaineering Course', 'Private / Custom Expedition', 'Corporate & Group Programmes']

export function initContact() {
  getInterests().then((r) => {
    const list = r.ok && Array.isArray(r.data) ? r.data : FALLBACK_INTERESTS
    $('#fInterest').append(list.map((x) => `<option value="${x}">${x}</option>`).join(''))
  }).catch(() => $('#fInterest').append(FALLBACK_INTERESTS.map((x) => `<option value="${x}">${x}</option>`).join('')))
  $('#fMessage').on('input', function () { $('#msgCount').text(this.value.length) })
  const setInvalid = (input, msgEl, msg) => { if (msg) { input.classList.add('is-invalid'); input.classList.remove('is-valid'); msgEl.textContent = msg } else { input.classList.remove('is-invalid'); input.classList.add('is-valid'); msgEl.textContent = '' } }
  $('#enquiryForm').on('submit', async function (e) {
    e.preventDefault(); const form = this
    const name = $('#fName').val().trim(), email = $('#fEmail').val().trim(), phone = $('#fPhone').val().trim()
    const interest = $('#fInterest').val(), message = $('#fMessage').val().trim()
    let ok = true
    setInvalid($('#fName')[0], $('#eName')[0], name.length >= 2 ? '' : 'Please enter your full name.'); ok = ok && name.length >= 2
    const emsg = emailOk(email) ? '' : 'Please enter a valid email address.'
    setInvalid($('#fEmail')[0], $('#eEmail')[0], emsg); ok = ok && !emsg
    const pmsg = phone && !/^[+()\d][\d\s().-]{5,23}$/.test(phone) ? 'Please enter a valid phone number, or leave this empty.' : ''
    setInvalid($('#fPhone')[0], $('#ePhone')[0], pmsg); ok = ok && !pmsg
    const imsg = interest ? '' : 'Please choose an expedition.'
    setInvalid($('#fInterest')[0], $('#eInterest')[0], imsg); ok = ok && !imsg
    const mmsg = message.length >= 10 ? '' : 'Tell us a little more about your expedition (at least 10 characters).'
    setInvalid($('#fMessage')[0], $('#eMessage')[0], mmsg); ok = ok && message.length >= 10
    if (!ok) return
    const btn = $('#submitBtn'); btn.prop('disabled', true).find('span').text('Sending…')
    $('#formNote').removeClass('is-error is-ok').text('')
    const res = await postEnquiry({ name, email, phone, interest, message, website: form.website.value })
    btn.prop('disabled', false).find('span').text('Send enquiry')
    if (res.ok) {
      $('#enquiryForm').addClass('is-sent').hide()
      $('#successMsg').text(res.data.message || 'Thank you. A guide will reply within one working day.')
      const s = $('#formSuccess')[0]; s.hidden = false; s.classList.add('is-shown'); s.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (res.status === 422 && res.data.errors) {
      const e = res.data.errors
      setInvalid($('#fName')[0], $('#eName')[0], e.name || '')
      setInvalid($('#fEmail')[0], $('#eEmail')[0], e.email || '')
      setInvalid($('#fPhone')[0], $('#ePhone')[0], e.phone || '')
      setInvalid($('#fInterest')[0], $('#eInterest')[0], e.interest || '')
      setInvalid($('#fMessage')[0], $('#eMessage')[0], e.message || '')
      $('#formNote').addClass('is-error').text(res.data.error || 'Please correct the highlighted fields.')
    } else {
      $('#formNote').addClass('is-error').text(res.status === 0 ? 'The server appears to be offline. Your message was not saved — please try again shortly.' : (res.data.error || 'Something went wrong. Please try again.'))
      if (res.status === 0 || res.status >= 502) raiseOfflineToast()
    }
  })
  $('#againBtn').on('click', () => { location.reload() })
  $('#newsletterForm').on('submit', async function (e) {
    e.preventDefault(); const email = $('#nlEmail').val().trim(), note = $('#nlNote')
    note.removeClass('is-error is-ok')
    if (!emailOk(email)) { note.addClass('is-error').text('Please enter a valid email address.'); return }
    const res = await postNewsletter(email)
    if (res.ok) { note.addClass('is-ok').text(res.data.message || 'You are on the list.'); this.reset() }
    else { note.addClass('is-error').text(res.data.error || 'Unable to subscribe right now.'); if (res.status === 0 || res.status >= 502) raiseOfflineToast() }
  })
}

