/**
 * Renders the contact section's map (light + dark) from OpenStreetMap data, so the site
 * can serve it as a plain image from its own domain: no map script, no third-party request.
 *
 * Data: the Protomaps daily planet build (OpenStreetMap, ODbL), read tile by tile over HTTP
 * Range requests. Style: @protomaps/basemaps (CC0). Drawn by MapLibre GL JS in headless
 * Chromium. The browser never touches the network: every request is answered from Node.
 *
 *   pnpm install && pnpm --dir scripts/map install   # sharp comes from the site's own deps
 *   pnpm --dir scripts/map render                     # uses the installed Google Chrome
 *   CHROMIUM_PATH=/path/to/chromium pnpm --dir scripts/map render
 *
 * Needs Node >= 22.18 (it imports src/lib/clinic.ts directly). Behind an HTTPS proxy, set NODE_USE_ENV_PROXY=1.
 *
 * Re-run it when the area changes or the clinic moves (LOCATION in src/lib/clinic.ts); the
 * map is centred on LOCATION, which is where Maps.astro draws its pin.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layers, namedFlavor } from '@protomaps/basemaps';
import { chromium } from 'playwright-core';
import { PMTiles } from 'pmtiles';
import sharp from 'sharp';
import { LOCATION } from '../../src/lib/clinic.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(here, '../../src/assets/images/map');
const MAPLIBRE_DIR = path.dirname(createRequire(import.meta.url).resolve('maplibre-gl/dist/maplibre-gl.mjs'));

// Keep in sync with Maps.astro: it shows this canvas at 1x and 2x, centred, cropped to its box.
const WIDTH = 1120;
const HEIGHT = 720;
const ZOOM = 15.6;

const ASSETS = 'https://protomaps.github.io/basemaps-assets';
const ORIGIN = 'https://render.local';

// Nudge the stock flavours towards the site's calm green-grey surfaces (global.css tokens).
const FLAVORS = {
  light: { ...namedFlavor('light'), background: '#e9ece9', earth: '#e9ece9' },
  dark: { ...namedFlavor('dark'), background: '#141a17', earth: '#1b221f' },
};

const builds = await (await fetch('https://build-metadata.protomaps.dev/builds.json')).json();
const build = builds.at(-1).key;
const archive = new PMTiles(`https://build.protomaps.com/${build}`);
console.log(`Protomaps build ${build}`);

const style = (flavor) => ({
  version: 8,
  glyphs: `${ORIGIN}/glyphs/{fontstack}/{range}.pbf`,
  sprite: `${ORIGIN}/sprites/v4/${flavor}`,
  sources: {
    protomaps: { type: 'vector', tiles: [`${ORIGIN}/tiles/{z}/{x}/{y}.mvt`], maxzoom: 15 },
  },
  layers: layers('protomaps', FLAVORS[flavor], { lang: 'tr' }),
});

const PAGE = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="/maplibre/maplibre-gl.css">
<style>html,body,#map{margin:0;width:100%;height:100%}</style>
<div id="map"></div>
<script type="module">
  import * as maplibregl from '/maplibre/maplibre-gl.mjs';
  window.draw = (style, center, zoom) => new Promise((resolve) => {
    window.view?.remove();
    window.view = new maplibregl.Map({
      container: 'map', style, center, zoom, interactive: false, attributionControl: false, fadeDuration: 0,
    });
    window.view.once('idle', resolve);
  });
</script>`;

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: 'chrome' }),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
page.on('pageerror', (err) => console.error(err));

await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== ORIGIN) return route.abort();
  const p = decodeURIComponent(url.pathname);

  if (p === '/') return route.fulfill({ contentType: 'text/html', body: PAGE });
  if (p.startsWith('/maplibre/')) return route.fulfill({ path: path.join(MAPLIBRE_DIR, path.basename(p)) });

  const tile = p.match(/^\/tiles\/(\d+)\/(\d+)\/(\d+)\.mvt$/);
  if (tile) {
    const res = await archive.getZxy(+tile[1], +tile[2], +tile[3]);
    if (!res) return route.fulfill({ status: 204 });
    return route.fulfill({ contentType: 'application/x-protobuf', body: Buffer.from(res.data) });
  }

  // fonts and sprites come from the Protomaps assets repo, fetched here rather than by the browser
  const asset = p.match(/^\/(glyphs|sprites)\/(.+)$/);
  if (asset) {
    const res = await fetch(`${ASSETS}/${asset[1] === 'glyphs' ? 'fonts' : 'sprites'}/${asset[2]}`);
    if (!res.ok) return route.fulfill({ status: res.status });
    return route.fulfill({ contentType: res.headers.get('content-type') ?? undefined, body: Buffer.from(await res.arrayBuffer()) });
  }
  return route.fulfill({ status: 404 });
});

await page.goto(`${ORIGIN}/`);
await page.waitForFunction(() => typeof window.draw === 'function');
await mkdir(OUT_DIR, { recursive: true });

for (const flavor of Object.keys(FLAVORS)) {
  await page.evaluate(([s, c, z]) => window.draw(s, c, z), [style(flavor), [LOCATION.lng, LOCATION.lat], ZOOM]);
  const png = await page.screenshot({ type: 'png' });
  const file = path.join(OUT_DIR, `map-${flavor}.webp`);
  // Near-lossless keeps the flat map colours and small labels sharp; Astro re-encodes per size.
  await writeFile(file, await sharp(png).webp({ nearLossless: true, quality: 80 }).toBuffer());
  console.log(`wrote ${path.relative(process.cwd(), file)}`);
}

await browser.close();
// A record of which data the images show, for the attribution and for the next refresh.
await writeFile(path.join(OUT_DIR, 'SOURCE.txt'), `Protomaps build ${build} (OpenStreetMap, ODbL). Rendered by scripts/map/render.mjs.\n`);
