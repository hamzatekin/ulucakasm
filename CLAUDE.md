# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing/information site for a Turkish family health center (Aile Sağlığı Merkezi), served at https://ulucakasm.com. All user-facing content is in Turkish. Built with Astro 7 (SSG, no server runtime), Tailwind CSS v4, and TypeScript. There is no test suite and no backend — output is fully static HTML.

## Commands

Package manager is **pnpm** (Node >= 22.12). `.npmrc` sets `shamefully-hoist=true` for Astro deps.

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
- **`src/lib/staff.ts`** — the family-doctor roster (`DOCTORS`: slug, name, birim `code`, phone, assistant) plus `telHref`. Single source of truth shared by `Hero.astro` (registry index) and `Doctors.astro` (roster). `slug` must match the image filenames under `assets/images/asm/doctors/<slug>.webp` and `.../schedules/<slug>_schedule.webp`, which `Doctors.astro` resolves via `import.meta.glob`.

### Conventions

- **Images**: use Astro's `<Image>` from `astro:assets` with sources under `src/assets/images/` (mostly `.webp`). `Img.astro` wraps an image with a click-to-open `<dialog>` lightbox (vanilla JS, no framework). `downloads/` holds working/source images and is not part of the site.
- **Icons**: inline SVGs live in `Icon.astro` as a small name-keyed registry (`map-pin`, `phone`, `link`, `arrow`, `clock`, `external`, `chevron`, `menu`, `close`, `seal`); add new icons there rather than importing an icon library.
- **Design system** ("Kayıt / Registry"): Tailwind **v4**, CSS-first — no `tailwind.config.*` file. The plugin is wired via `@tailwindcss/vite` in `astro.config.mjs`; all tokens, base styles, and reusable component classes live in `src/styles/global.css`. Palette is grounded in the Sağlık Bakanlığı green+red identity, not generic teal: `paper`/`ink` (bg/text), `pine`/`pine-deep`/`pine-bright` (brand green), `sage` (fills), `seal`/`seal-soft` (Ministry red, used sparingly), `line`/`line-ink` (hairlines). Fonts: `font-display` = Bricolage Grotesque, `font-sans` = Instrument Sans, `font-mono` = JetBrains Mono (loaded in `Layout.astro`). Reusable classes defined in `@layer components`: `.wrap`/`.wrap-tight` (containers), `.eyebrow`/`.eyebrow-on-dark` (section labels), `.unit-code` (the mono birim-kodu chip with a red hexagon `::before` — the signature device), `.btn-*`, `.rule`, `.ulink`. Prefer these + utilities over new bespoke CSS.
- **Tailwind v4 gotchas**: content scanning is automatic. A component-scoped `<style>` that uses `@apply` must start with `@reference '../../styles/global.css';` (see `Header.astro`) — and must NOT be `is:inline`, or the `@apply` ships uncompiled to the browser. When adding a component class in `@layer components`, don't `@apply` another custom class (v4 only reliably `@apply`s utilities) — share base rules via a selector list instead (see `.btn-*`).
- **Formatting**: Prettier with `printWidth: 140`, single quotes, 2-space indent.
