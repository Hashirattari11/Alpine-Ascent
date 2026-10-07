export const INTERESTS = [
  'Everest Base Camp Trek',
  'Island Peak & Lobuche',
  'Mont Blanc Ascent',
  'Matterhorn Ascent',
  'Denali Expedition',
  'Aconcagua Expedition',
  'Ski Mountaineering Haute Route',
  'Introductory Mountaineering Course',
  'Private / Custom Expedition',
  'Corporate & Group Programmes',
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d][\d\s().-]{5,23}$/

const clean = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim() : '')

/** Validates and normalises an enquiry payload. Returns { errors, value }. */
export function validateEnquiry(body = {}) {
  const value = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    interest: clean(body.interest),
    message: clean(body.message),
  }
  const errors = {}
  if (value.name.length < 2 || value.name.length > 80) errors.name = 'Please enter your full name (2–80 characters).'
  if (!EMAIL.test(value.email) || value.email.length > 120) errors.email = 'Please enter a valid email address.'
  if (value.phone && !PHONE.test(value.phone)) errors.phone = 'Please enter a valid phone number.'
  if (!INTERESTS.includes(value.interest)) errors.interest = 'Please choose an expedition of interest.'
  if (value.message.length < 10) errors.message = 'Tell us a little more (at least 10 characters).'
  else if (value.message.length > 2000) errors.message = 'Message is too long (2000 characters maximum).'
  return { errors, value }
}

export function validateEmail(email) {
  const v = clean(email).toLowerCase()
  return EMAIL.test(v) && v.length <= 120 ? v : null
}
