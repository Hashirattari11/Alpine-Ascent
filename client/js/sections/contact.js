// Contact form + newsletter: client-side validation, server save, success animation.
import { postEnquiry, postNewsletter, getInterests } from '../api.js'

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

export function initContact() {
  // populate the interest select
  getInterests().then((r) => {
    const list = r.ok && Array.isArray(r.data) ? r.data : FALLBACK_INTERESTS
    $('#fInterest').append(list.map((x) => `<option value="${x}">${x}</option>`).join(''))
  }).catch(() => $('#fInterest').append(FALLBACK_INTERESTS.map((x) => `<option value="${x}">${x}</option>`).join('')))

  $('#fMessage').on('input', function () { $('#msgCount').text(this.value.length) })

  const setInvalid = (input, msgEl, msg) => {
    if (msg) { input.classList.add('is-invalid'); input.classList.remove('is-valid'); msgEl.textContent = msg }
    else { input.classList.remove('is-invalid'); input.classList.add('is-valid'); msgEl.textContent = '' }
  }

  $('#enquiryForm').on('submit', async function (e) {
    e.preventDefault()
    const form = this
    const name = $('#fName').val().trim()
    const email = $('#fEmail').val().trim()
    const phone = $('#fPhone').val().trim()
    const interest = $('#fInterest').val()
    const message = $('#fMessage').val().trim()
    let ok = true
    setInvalid($('#fName')[0], $('#eName')[0], name.length >= 2 ? '' : 'Please enter your full name.'); ok &&= name.length >= 2
    const emsg = emailOk(email) ? '' : 'Please enter a valid email address.'
    setInvalid($('#fEmail')[0], $('#eEmail')[0], emsg); ok &&= !emsg
    const pmsg = phone && !/^[+()\d][\d\s().-]{5,23}$/.test(phone) ? 'Please enter a valid phone number, or leave this empty.' : ''
    setInvalid($('#fPhone')[0], $('#ePhone')[0], pmsg); ok &&= !pmsg
    const imsg = interest ? '' : 'Please choose an expedition.'
    setInvalid($('#fInterest')[0], $('#eInterest')[0], imsg); ok &&= !imsg
    const mmsg = message.length >= 10 ? '' : 'Tell us a little more about your expedition (at least 10 characters).'
    setInvalid($('#fMessage')[0], $('#eMessage')[0], mmsg); ok &&= message.length >= 10
    if (!ok) return

    const btn = $('#submitBtn')
    btn.prop('disabled', true).find('span').text('Sending…')
    $('#formNote').removeClass('is-error is-ok').text('')
    const res = await postEnquiry({ name, email, phone, interest, message, website: form.website.value })
    btn.prop('disabled', false).find('span').text('Send enquiry')

    if (res.ok) {
      $('#enquiryForm').addClass('is-sent').hide()
      $('#successMsg').text(res.data.message || 'Thank you. A guide will reply within one working day.')
      const s = $('#formSuccess')[0]
      s.hidden = false
      s.classList.add('is-shown')
      s.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    }
  })

  $('#againBtn').on('click', () => { location.reload() }) // simplest reliable reset

  $('#newsletterForm').on('submit', async function (e) {
    e.preventDefault()
    const email = $('#nlEmail').val().trim()
    const note = $('#nlNote')
    note.removeClass('is-error is-ok')
    if (!emailOk(email)) { note.addClass('is-error').text('Please enter a valid email address.'); return }
    const res = await postNewsletter(email)
    if (res.ok) { note.addClass('is-ok').text(res.data.message || 'You are on the list.'); this.reset() }
    else note.addClass('is-error').text(res.data.error || 'Unable to subscribe right now.')
  })

  // sensible behaviour after "Send another"
}

const FALLBACK_INTERESTS = [
  'Everest Base Camp Trek', 'Island Peak & Lobuche', 'Mont Blanc Ascent', 'Matterhorn Ascent',
  'Denali Expedition', 'Aconcagua Expedition', 'Ski Mountaineering Haute Route',
  'Introductory Mountaineering Course', 'Private / Custom Expedition', 'Corporate & Group Programmes',
]
