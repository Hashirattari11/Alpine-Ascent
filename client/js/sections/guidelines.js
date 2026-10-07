import { mount } from '../core.js'
import { esc, skeleton } from '../utils.js'

const LS = 'aa_guides_checks'
const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {} } catch { return {} } }
const save = (v) => localStorage.setItem(LS, JSON.stringify(v))

const card = (c, i, checks) => {
  const done = c.items.filter((_, k) => checks[`${c.id}:${k}`]).length
  return `
  <div class="col-md-6 col-lg-4" data-reveal style="--d:${(i % 3) * 0.12}s">
    <article class="card-lux guide-card" data-guide="${esc(c.id)}">
      <div class="card-lux__body">
        <span class="icon-circle"><i class="bi bi-${esc(c.icon)}" aria-hidden="true"></i></span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.intro)}</p>
        <ul class="check-list">
          ${c.items.map((it, k) => `
            <li><label class="check"><input type="checkbox" data-key="${c.id}:${k}" ${checks[`${c.id}:${k}`] ? 'checked' : ''} /><span>${esc(it)}</span></label></li>`).join('')}
        </ul>
        <div class="guide-progress mt-auto" style="--p:${(done / c.items.length).toFixed(2)}"><em style="font-style:normal" data-count-label>${done}/${c.items.length} ready</em><span><i style="transform:scaleX(${done / c.items.length})"></i></span></div>
      </div>
    </article>
  </div>`
}

export function initGuidelines() {
  return mount('#guideGrid', 'guidelines', (g) => {
    const checks = load()
    const hasChecks = Object.values(checks).some(Boolean)
    return `
      ${g.cards.map((c, i) => card(c, i, checks)).join('')}
      <div class="col-12" data-reveal>
        <p class="text-end"><button type="button" class="btn btn-ghost btn-sm" id="resetChecks" ${hasChecks ? '' : 'hidden'}><i class="bi bi-arrow-counterclockwise"></i><span>Reset checklist</span></button></p>
      </div>`
  }, {
    skeleton: skeleton(3, 'col-md-6 col-lg-4', 460),
    label: 'the guidelines',
    after: ($el, g) => {
      $el.on('change', 'input[type="checkbox"]', function () {
        const all = load()
        all[this.dataset.key] = this.checked
        save(all)
        const [gid, k] = this.dataset.key.split(':')
        const cardEl = document.querySelector(`[data-guide="${gid}"]`)
        const total = g.cards.find((c) => c.id === gid).items.length
        const done = g.cards.find((c) => c.id === gid).items.filter((_, idx) => all[`${gid}:${idx}`]).length
        cardEl.querySelector('[data-count-label]').textContent = `${done}/${total} ready`
        cardEl.querySelector('.guide-progress span i').style.transform = `scaleX(${done / total})`
        $('#resetChecks').prop('hidden', false)
      })
      $el.on('click', '#resetChecks', () => {
        localStorage.removeItem(LS)
        $el.find('input[type="checkbox"]').prop('checked', false)
        g.cards.forEach((c) => {
          const cardEl = document.querySelector(`[data-guide="${c.id}"]`)
          cardEl.querySelector('[data-count-label]').textContent = `0/${c.items.length} ready`
          cardEl.querySelector('.guide-progress span i').style.transform = 'scaleX(0)'
        })
        $('#resetChecks').prop('hidden', true)
      })

      // gear banner
      $('#gearBanner').html(`
        <div>
          <p class="eyebrow mb-2"><span class="eyebrow__line"></span>Preparation</p>
          <h3>The expedition gear-check list</h3>
          <p>Curated by our guides: everything you need, grouped by how you pack it. Mark it off as you go, or print the whole list.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-gold magnetic" id="printGear"><i class="bi bi-printer"></i><span>Open printable list</span></button>
          <a class="btn btn-ghost magnetic" href="#guideGrid" data-scroll><i class="bi bi-check2-all"></i><span>Review categories</span></a>
        </div>`)
      $('#printGear').on('click', () => openPrintable(g))
    },
  })
}

/* Opens a printable (and downloadable via the browser's Save-as-PDF) gear checklist. */
function openPrintable(g) {
  const rows = g.gearChecklist.map((grp) => `
    <section><h2>${grp.group}</h2>
      <ul>${grp.items.map((it) => `<li><label><input type="checkbox">${esc(it)}</label></li>`).join('')}</ul>
    </section>`).join('')
  const w = window.open('', '_blank', 'width=820,height=900')
  if (!w) { alert('Your browser blocked the pop-up. Please allow pop-ups and try again.'); return }
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Alpine Ascents · Gear Checklist</title>
    <style>body{font-family:Georgia,serif;max-width:720px;margin:2.5rem auto;padding:0 1.5rem;color:#111}h1{font-size:2rem}h1 span{color:#b08f46}h2{font-size:1.15rem;margin:1.6rem 0 .5rem;border-bottom:1px solid #ddd;padding-bottom:.3rem}ul{list-style:none;padding:0}li{padding:.2rem 0}input{margin-right:.6rem;accent-color:#b08f46}@media print{button{display:none}}</style>
    </head><body><h1>Alpine <span>Ascents</span> · Expedition Gear Checklist</h1>
    <p>Everything an Alpine Ascents expedition guest should carry. Use your browser's Print dialog to save as PDF.</p>${rows}
    <button onclick="window.print()" style="margin-top:1.5rem;padding:.7rem 1.4rem">Print / Save as PDF</button>
    </body></html>`)
  w.document.close()
  w.focus()
}
