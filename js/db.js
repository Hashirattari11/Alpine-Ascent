const KEY = 'aa_database'

function emptyDatabase() {
  return { enquiries: [], subscribers: [], visits: 0 }
}

export function readDatabase() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && typeof saved === 'object') {
      return {
        enquiries: Array.isArray(saved.enquiries) ? saved.enquiries : [],
        subscribers: Array.isArray(saved.subscribers) ? saved.subscribers : [],
        visits: Number(saved.visits) || 0,
      }
    }
  } catch (e) {
    return emptyDatabase()
  }
  return emptyDatabase()
}

function writeDatabase(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function addEnquiry(record) {
  const data = readDatabase()
  data.enquiries.push({
    id: 'ENQ-' + Date.now(),
    name: record.name,
    email: record.email,
    phone: record.phone,
    interest: record.interest,
    message: record.message,
    date: new Date().toISOString(),
  })
  writeDatabase(data)
  return data.enquiries.length
}

export function addSubscriber(email) {
  const data = readDatabase()
  const exists = data.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())
  if (!exists) {
    data.subscribers.push({ email: email, date: new Date().toISOString() })
    writeDatabase(data)
  }
  return data.subscribers.length
}

export function addVisit() {
  const data = readDatabase()
  data.visits += 1
  writeDatabase(data)
  return data.visits
}
