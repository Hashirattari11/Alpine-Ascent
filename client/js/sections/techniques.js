import { mount } from '../core.js'
import { esc, picture, skeleton, pad } from '../utils.js'

const render = (list) => `
  <div class="col-lg-4" data-reveal>
    <div class="nav tech-tabs" role="tablist" aria-orientation="vertical" aria-label="Mountaineering techniques">
      ${list.map((t, i) => `
        <button class="nav-link ${i === 0 ? 'active' : ''}" id="tech-tab-${t.id}" data-bs-toggle="pill" data-bs-target="#tech-${t.id}" type="button" role="tab" aria-controls="tech-${t.id}" aria-selected="${i === 0}">
          <i class="bi bi-${esc(t.icon)}" aria-hidden="true"></i><span>${esc(t.title)}</span><small>${pad(i + 1)}</small>
        </button>`).join('')}
    </div>
  </div>
  <div class="col-lg-8" data-reveal style="--d:.12s">
    <div class="tab-content">
      ${list.map((t, i) => `
        <div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="tech-${t.id}" role="tabpanel" aria-labelledby="tech-tab-${t.id}" tabindex="0">
          <article class="tech-panel">
            ${picture(t.image, `${t.title} technique`, { sizes: '(min-width: 992px) 66vw, 100vw' })}
            <div class="tech-panel__body">
              <h3>${esc(t.title)}</h3>
              <p>${esc(t.summary)}</p>
              <ol class="steps">${t.steps.map((s) => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
              <div class="tip"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><b>Guide&rsquo;s tip</b>${esc(t.tip)}</div></div>
            </div>
          </article>
        </div>`).join('')}
    </div>
  </div>`

export function initTechniques() {
  return mount('#techWrap', 'techniques', render, {
    skeleton: `<div class="col-lg-4"><div class="skeleton" style="height:420px"></div></div><div class="col-lg-8"><div class="skeleton" style="height:620px"></div></div>`,
    label: 'the techniques',
  })
}
