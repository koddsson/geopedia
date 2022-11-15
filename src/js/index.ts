import {Database} from './db.ts'
import {ready, html} from './utils.ts'

interface Location {
  title: string
  pageid: string
}

const db = new Database<Location>('locations')

function getCurrentPosition(): Promise<{coords: {latitude: number, longitude: number}}> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000,
    });
  })
}

async function findPagesNear(latitude: number, longitude: number): Promise<Location[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.search = new URLSearchParams({
    action: 'query',
    list: 'geosearch',
    origin: '*',
    gscoord: `${latitude}|${longitude}`,
    gsradius: '10000',
    gslimit: '1',
    format: 'json'
  }).toString()

  const headers = new Headers({Accept: 'application/json'})
  const response = await fetch(url, {headers})
  const json = await response.json()

  return json.query.geosearch
}

async function getPageText(pageid: string) {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exintro: 'true',
    explaintext: 'true',
    pageids: pageid,
    origin: '*',
    format: 'json'
  }).toString()
  
  const headers = new Headers({Accept: 'application/json'})
  const response = await fetch(url, {headers})
  const json = await response.json()
  return json.query.pages[pageid].extract
}

async function generatePlace() {
  const {coords: {latitude, longitude}} = await getCurrentPosition()
  const locations = await findPagesNear(latitude, longitude)
  const location = locations[0]

  db.save(location)

  renderLocation(location)
}

async function renderLocation(location: Location) {
  const text = await getPageText(location.pageid)

  document.querySelector('dl')?.append(...html`<dt>${location.title}</dt><dd>${text}</dd>`)
}

await ready()
for (const location of db.get()) {
  renderLocation(location)
}

document.querySelector('button')?.addEventListener('click', () => {
  generatePlace()
})

export {}
