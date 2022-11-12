function getCurrentPosition(): Promise<{coords: {latitude: number, longitude: number}}> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000,
    });
  })
}

async function findPagesNear(latitude: number, longitude: number) {
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

function speak(text: string) {
  const synth = window.speechSynthesis;
  
  const utterThis = new SpeechSynthesisUtterance(text);

  // Pick a random english speaking voice
  const voices = synth.getVoices().filter(x => x.lang.startsWith('en-'))
  utterThis.voice = voices[Math.floor(Math.random()*voices.length)]

  synth.speak(utterThis);
}

let text: string

function triggerSpeech() {
  speak(text)
}

(async function() {
  const {coords: {latitude, longitude}} = await getCurrentPosition()
  const locations = await findPagesNear(latitude, longitude)
  if (locations.length === 0) {
    console.log('No items')
  }
  for (const location of locations) {
    text = await getPageText(location.pageid)
    const dl = document.createElement('dl')
    const dt = document.createElement('dt')
    dt.textContent = location.title
    const dd = document.createElement('dd')
    dd.textContent = text
    dl.append(dt, dd)
    
    document.body.append(dl)
  }
})()
