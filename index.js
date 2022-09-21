function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000,
    });
  })
}

async function findPagesNear(latitude, longitude) {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.search = new URLSearchParams({
    action: 'query',
    list: 'geosearch',
    origin: '*',
    gscoord: `${latitude}|-${longitude}`,
    gsradius: 10000,
    gslimit: 1,
    format: 'json'
  }).toString()

  const headers = new Headers({Accept: 'application/json'})
  const response = await fetch(url, {headers})
  console.log(response)
  const json = await response.json()

  return json.query.geosearch
}

setInterval(async function() {
  console.log('=======>')
  const {coords: {latitude, longitude}} = await getCurrentPosition()
  const locations = await findPagesNear(latitude, longitude)
  for (const location of locations) {
    const el = document.createElement('div')
    el.innerText = location
    document.body.append(el)
  }
}, 10000)
