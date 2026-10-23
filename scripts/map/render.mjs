/**
 * Builds the contact section's map from OpenStreetMap data, so the site serves all of it from
 * its own domain and no visitor request ever reaches a map company:
 *
 *   public/map/            vector tiles for the area around the clinic, plus the light and dark
 *                          styles, fonts and icons they need: what Maps.astro's MapLibre map loads
 *   src/assets/images/map/ a light and a dark picture of the same map, shown before MapLibre
 *                          loads and whenever it can't (no JS, a failed load)
 *
 * Data: the Protomaps daily planet build (OpenStreetMap, ODbL), read tile by tile over HTTP
 * Range requests. Style: @protomaps/basemaps (CC0), fonts and icons from its assets repo. The
 * pictures are drawn by MapLibre GL JS in headless Chromium from the files just written to
 * public/map, so they double as a check that the exported set is complete.
 *
 *   pnpm install && pnpm --dir scripts/map install   # sharp comes from the site's own deps
 *   pnpm --dir scripts/map render                     # uses the installed Google Chrome
 *   CHROMIUM_PATH=/path/to/chromium pnpm --dir scripts/map render
 *
 * Needs Node >= 22.18 (it imports src/lib/clinic.ts directly). Behind an HTTPS proxy, set NODE_USE_ENV_PROXY=1.
 *
 * Re-run it when the area changes or the clinic moves (LOCATION in src/lib/clinic.ts); both
 * maps are centred on LOCATION, which is where Maps.astro draws its pin.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layers, namedFlavor } from '@protomaps/basemaps';
import { chromium } from 'playwright-core';
import { PMTiles } from 'pmtiles';
import sharp from 'sharp';
import { LOCATION } from '../../src/lib/clinic.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public/map');
const IMAGE_DIR = path.join(ROOT, 'src/assets/images/map');
const MAPLIBRE_DIR = path.dirname(createRequire(import.meta.url).resolve('maplibre-gl/dist/maplibre-gl.mjs'));

// The pannable area: about 14 × 13 km around the clinic, enough for Ulucak, Kemalpaşa and the
// roads in from Bornova. Zoom 12 shows all of it; past 15 MapLibre scales up the z15 tiles.
const SPAN = { lng: 0.08, lat: 0.06 };
const BOUNDS = [LOCATION.lng - SPAN.lng, LOCATION.lat - SPAN.lat, LOCATION.lng + SPAN.lng, LOCATION.lat + SPAN.lat];
const MIN_ZOOM = 12;
const MAX_ZOOM = 15;

// Keep in sync with Maps.astro: the picture is this canvas at 1x and 2x, and the live map opens at ZOOM.
const WIDTH = 1120;
const HEIGHT = 720;
const ZOOM = 15.6;

const ASSETS = 'https://protomaps.github.io/basemaps-assets';
// Latin, Latin Extended-A (ç ğ ı İ ö ş ü) and General Punctuation cover every Turkish label.
const GLYPH_RANGES = ['0-255', '256-511', '8192-8447'];
const ORIGIN = 'https://render.local';

// Nudge the stock flavours towards the site's calm green-grey surfaces (global.css tokens).
const FLAVORS = {
  light: { ...namedFlavor('light'), background: '#e9ece9', earth: '#e9ece9' },
  dark: { ...namedFlavor('dark'), background: '#141a17', earth: '#1b221f' },
};

const fetchOk = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
};
const put = async (file, data) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
};
const slug = (font) => font.toLowerCase().replaceAll(' ', '-');
// text-font is a list of names or an expression that picks one; rename every font name inside it
const fonts = new Set();
const renameFonts = (value) => {
  if (Array.isArray(value)) return value.map(renameFonts);
  if (typeof value !== 'string' || !value.startsWith('Noto ')) return value;
  fonts.add(value);
  return slug(value);
};

const builds = await (await fetch('https://build-metadata.protomaps.dev/builds.json')).json();
const build = builds.at(-1).key;
const archive = new PMTiles(`https://build.protomaps.com/${build}`);
console.log(`Protomaps build ${build}`);

await rm(PUBLIC_DIR, { recursive: true, force: true });

// 1. Tiles: every z12–z15 tile that touches BOUNDS, stored as plain /map/tiles/{z}/{x}/{y}.mvt
//    files (Workers static assets don't answer Range requests, so no single .pmtiles archive).
const tileX = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const tileY = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};
let tiles = 0;
let bytes = 0;
for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
  for (let x = tileX(BOUNDS[0], z); x <= tileX(BOUNDS[2], z); x++) {
    for (let y = tileY(BOUNDS[3], z); y <= tileY(BOUNDS[1], z); y++) {
      const tile = await archive.getZxy(z, x, y);
      if (!tile) continue;
      await put(path.join(PUBLIC_DIR, `tiles/${z}/${x}/${y}.mvt`), Buffer.from(tile.data));
      tiles++;
      bytes += tile.data.byteLength;
    }
  }
}
console.log(`wrote ${tiles} tiles (${(bytes / 1e6).toFixed(1)} MB)`);

// 2. Styles, with the font names turned into URL-safe folder names.
for (const flavor of Object.keys(FLAVORS)) {
  const style = {
    version: 8,
    glyphs: '/map/fonts/{fontstack}/{range}.pbf',
    sprite: `/map/sprites/${flavor}`,
    sources: {
      protomaps: {
        type: 'vector',
        tiles: ['/map/tiles/{z}/{x}/{y}.mvt'],
        minzoom: MIN_ZOOM,
        maxzoom: MAX_ZOOM,
        bounds: BOUNDS,
      },
    },
    layers: layers('protomaps', FLAVORS[flavor], { lang: 'tr' }).map((layer) =>
      layer.layout?.['text-font'] ? { ...layer, layout: { ...layer.layout, 'text-font': renameFonts(layer.layout['text-font']) } } : layer,
    ),
  };
  await put(path.join(PUBLIC_DIR, `style-${flavor}.json`), JSON.stringify(style));

  // 3. Icons for the points of interest, at 1x and 2x.
  for (const file of [`${flavor}.json`, `${flavor}.png`, `${flavor}@2x.json`, `${flavor}@2x.png`]) {
    await put(path.join(PUBLIC_DIR, 'sprites', file), await fetchOk(`${ASSETS}/sprites/v4/${file}`));
  }
}

// 4. Glyphs for each font the styles name.
for (const font of fonts) {
  for (const range of GLYPH_RANGES) {
    await put(path.join(PUBLIC_DIR, `fonts/${slug(font)}/${range}.pbf`), await fetchOk(`${ASSETS}/fonts/${font}/${range}.pbf`));
  }
}
console.log(`wrote ${Object.keys(FLAVORS).length} styles, their sprites and ${fonts.size} fonts`);

// The licences that travel with what the site serves: OFL and MIT ask for their text, BSD-3 for
// MapLibre's notice (the minified bundle drops its header comment).
const notice = [
  "Third-party material served under /map and in the site's MapLibre bundle.",
  '',
  'Map data: (c) OpenStreetMap contributors, Open Database License (ODbL), https://www.openstreetmap.org/copyright',
  'Map tiles: Protomaps basemap (https://protomaps.com), a Produced Work of OpenStreetMap data.',
  'Map style: @protomaps/basemaps, CC0.',
  '',
  '== MapLibre GL JS ==',
  await readFile(path.join(MAPLIBRE_DIR, '../LICENSE.txt'), 'utf8'),
  '== Noto Sans (fonts/) ==',
  (await fetchOk(`${ASSETS}/fonts/OFL.txt`)).toString(),
  '== Icons (sprites/), derived from tangrams/icons ==',
  (await fetchOk('https://raw.githubusercontent.com/tangrams/icons/master/LICENSE.md')).toString(),
];
await put(path.join(PUBLIC_DIR, 'LICENSES.txt'), notice.join('\n'));

// 5. The pictures, drawn from the files above. Anything the map asks for that isn't there is reported.
const PAGE = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="/maplibre/maplibre-gl.css">
<style>html,body,#map{margin:0;width:100%;height:100%}</style>
<div id="map"></div>
<script type="module">
  import * as maplibregl from '/maplibre/maplibre-gl.mjs';
  window.draw = async (flavor, center, zoom) => {
    const style = await (await fetch('/map/style-' + flavor + '.json')).json();
    style.glyphs = location.origin + style.glyphs;
    style.sprite = location.origin + style.sprite;
    style.sources.protomaps.tiles = style.sources.protomaps.tiles.map((t) => location.origin + t);
    window.view?.remove();
    window.view = new maplibregl.Map({
      container: 'map', style, center, zoom, interactive: false, attributionControl: false, fadeDuration: 0,
    });
    await new Promise((resolve) => window.view.once('idle', resolve));
  };
</script>`;

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: 'chrome' }),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
page.on('pageerror', (err) => console.error(err));

const missing = new Set();
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== ORIGIN) return route.abort();
  const p = decodeURIComponent(url.pathname);
  if (p === '/') return route.fulfill({ contentType: 'text/html', body: PAGE });
  if (p.startsWith('/maplibre/')) return route.fulfill({ path: path.join(MAPLIBRE_DIR, path.basename(p)) });
  if (p.startsWith('/map/')) {
    try {
      return route.fulfill({ body: await readFile(path.join(PUBLIC_DIR, p.slice('/map/'.length))) });
    } catch {
      missing.add(p);
    }
  }
  return route.fulfill({ status: 404 });
});

await page.goto(`${ORIGIN}/`);
await page.waitForFunction(() => typeof window.draw === 'function');

for (const flavor of Object.keys(FLAVORS)) {
  await page.evaluate(([f, c, z]) => window.draw(f, c, z), [flavor, [LOCATION.lng, LOCATION.lat], ZOOM]);
  const png = await page.screenshot({ type: 'png' });
  const file = path.join(IMAGE_DIR, `map-${flavor}.webp`);
  // Near-lossless keeps the flat map colours and small labels sharp; Astro re-encodes per size.
  await put(file, await sharp(png).webp({ nearLossless: true, quality: 80 }).toBuffer());
  console.log(`wrote ${path.relative(process.cwd(), file)}`);
}
await browser.close();

// A record of which data the map shows, for the attribution and for the next refresh.
await writeFile(path.join(IMAGE_DIR, 'SOURCE.txt'), `Protomaps build ${build} (OpenStreetMap, ODbL). Built by scripts/map/render.mjs.\n`);
if (missing.size) {
  console.error(`The map asked for files that weren't exported:\n  ${[...missing].join('\n  ')}`);
  process.exitCode = 1;
}
