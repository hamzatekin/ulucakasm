# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing/information site for a Turkish family health center (Aile Sağlığı Merkezi), served at https://ulucakasm.com. All user-facing content is in Turkish. Built with Astro 5 (SSG, no server runtime), Tailwind CSS, and TypeScript. There is no test suite and no backend — output is fully static HTML.

## Commands

Package manager is **pnpm** (Node >= 20). `.npmrc` sets `shamefully-hoist=true` for Astro deps.

```bash
pnpm install
pnpm dev        # local dev server
pnpm build      # production build to ./dist
pnpm preview    # preview the production build
pnpm typecheck  # astro check (type + template diagnostics)
pnpm pretty     # prettier --write over src
```

There is no lint or test command. Run `pnpm typecheck` to validate changes.

## Environment

`MAPS_API_KEY` (Google Maps JS API) is required for the map to render — see `.env.example`. It is read via `import.meta.env.MAPS_API_KEY` in `src/lib/const.astro` (`MAPS_LINK`).

## Architecture

- **`src/pages/`** — one `.astro` file per route: `index.astro` (home), `bagisiklama.astro` (vaccination schedule), `beslenme.astro` (nutrition). Pages compose components and wrap them in `Layout`.
- **`src/layouts/Layout.astro`** — the single HTML shell: `<head>` (meta, fonts, favicons), Astro `ClientRouter` view transitions, and Umami analytics (injected **only in prod** via `import.meta.env.PROD`). Default `title`/`description` are set here and overridable via props.
- **`src/components/Astro/`** — presentational section components (`Hero`, `Services`, `Doctors`, `Contact`, `Gallery`, `Header`, `Footer`, `Maps`, etc.). The home page is assembled by stacking these.
- **`src/lib/const.astro`** — shared constants (`TITLE`, `MAPS_LINK`). Note this is a frontmatter-only `.astro` module, imported as `../lib/const.astro`.
- **`src/lib/utils.ts`** — `capitalizeEachWord` uses Turkish-locale casing (`toLocaleUpperCase('tr')`) — keep the `'tr'` locale for correct İ/I handling.

### Conventions

- **Images**: use Astro's `<Image>` from `astro:assets` with sources under `src/assets/images/` (mostly `.webp`). `Img.astro` wraps an image with a click-to-open `<dialog>` lightbox (vanilla JS, no framework). `downloads/` holds working/source images and is not part of the site.
- **Icons**: inline SVGs live in `Icon.astro` as a small name-keyed registry (`map-pin` | `link` | `phone`); add new icons there rather than importing an icon library.
- **Styling**: Tailwind with a custom theme in **`tailwind.config.mjs`** (`primary` green palette, `ministry` red, `surface`, and `font-sans` → `Plus Jakarta Sans`). Keep this as the only Tailwind config — Tailwind resolves `.cjs`/`.js` before `.mjs`, so re-adding a second config file will silently shadow this theme. Component-scoped `<style>` blocks are used for anything beyond utilities.
- **Formatting**: Prettier with `printWidth: 140`, single quotes, 2-space indent.
