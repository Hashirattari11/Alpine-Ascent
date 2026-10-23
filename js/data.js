const cache = {}

export function getResource(name) {
  if (!cache[name]) {
    cache[name] = new Promise(function (resolve, reject) {
      $.getJSON('data/' + name + '.json')
        .done(function (data) { resolve({ data: data }) })
        .fail(function () {
          delete cache[name]
          reject(new Error('Could not load ' + name))
        })
    })
  }
  return cache[name]
}
