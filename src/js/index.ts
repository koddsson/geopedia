import { Database } from './database';
import { ready, html } from './utils';

interface Location {
  title: string;
  pageid: number;
  primary: string;
  ns: number;
  lat: number;
  lon: number;
  dist: number;
}

interface LocationEntry {
  id: string;
  location: Location;
}

const database = new Database<LocationEntry>('locations');

function getCurrentPosition(): Promise<{
  coords: { latitude: number; longitude: number };
}> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60_000,
    });
  });
}

async function findPagesNear(
  latitude: number,
  longitude: number,
): Promise<Location[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    list: 'geosearch',
    origin: '*',
    gscoord: `${latitude}|${longitude}`,
    gsradius: '10000',
    gslimit: '1',
    format: 'json',
  }).toString();

  const headers = new Headers({ Accept: 'application/json' });
  const response = await fetch(url, { headers });
  const json = await response.json();

  return json.query.geosearch;
}

const pageTextCache = new Database<{ id: string; extract: string }>(
  'page-text-cache',
);

async function getPageText(pageid: string) {
  const cacheHit = pageTextCache.get(pageid);
  if (cacheHit) {
    return cacheHit.extract;
  }
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exintro: 'true',
    explaintext: 'true',
    pageids: pageid,
    origin: '*',
    format: 'json',
  }).toString();

  const headers = new Headers({ Accept: 'application/json' });
  const response = await fetch(url, { headers });
  const json = await response.json();
  const extract = json.query.pages[pageid].extract;
  pageTextCache.save({ id: pageid, extract });
  return extract;
}

async function generatePlace() {
  const {
    coords: { latitude, longitude },
  } = await getCurrentPosition();
  const locations = await findPagesNear(latitude, longitude);
  const location = locations[0];

  database.save({ id: location.pageid.toString(), location });

  renderLocation(location);
}

async function renderLocation(location: Location) {
  const text = await getPageText(location.pageid.toString());

  document
    .querySelector('#locations')
    ?.prepend(
      ...html`<article><h2>${location.title}</h2><div>${text}</div><div class="location-actions"><button data-remove-location="${location.pageid}">Remove</button><div></article>`,
    );
}

await ready();
const entries = database.getAll().sort();
for (const { location } of entries) {
  await renderLocation(location);
}

document.querySelector('#find-nearest-place')?.addEventListener('click', () => {
  generatePlace();
});

document.addEventListener('click', function (event) {
  const target = event.target as HTMLElement;
  if (target.matches('button[data-remove-location]')) {
    const id = target.dataset.removeLocation!;
    database.remove(id);
    target.closest('article')?.remove();
  }
});

export {};
