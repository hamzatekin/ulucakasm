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
- **`src/layouts/Layout.astro`** — the single HTML shell: `<head>` (viewport with `viewport-fit=cover`, per-scheme `theme-color`, favicons), native cross-document view transitions (declared in `global.css`), and Umami analytics (injected **only in prod** via `import.meta.env.PROD`). Default `title`/`description` are set here and overridable via props.
- **`src/components/Astro/`** — presentational section components (`Hero`, `Services`, `Doctors`, `Contact`, `Gallery`, `Header`, `Footer`, `Maps`, etc.). The home page is assembled by stacking these. Inner pages open with `PageIntro` (back link, section name, h1, optional lead slot).
- **`src/lib/const.astro`** — shared constants (`TITLE`, `MAPS_LINK`). Note this is a frontmatter-only `.astro` module, imported as `../lib/const.astro`.
- **`src/lib/utils.ts`** — `capitalizeEachWord` uses Turkish-locale casing (`toLocaleUpperCase('tr')`) — keep the `'tr'` locale for correct İ/I handling.
- **`src/lib/staff.ts`** — the family-doctor roster (`DOCTORS`: slug, name, birim `code`, phone, assistant) plus `telHref`. Single source of truth shared by `Hero.astro` (registry index) and `Doctors.astro` (roster). `slug` must match the image filenames under `assets/images/asm/doctors/<slug>.webp` and `.../schedules/<slug>_schedule.webp`, which `Doctors.astro` resolves via `import.meta.glob`.

### Conventions

- **Images**: use Astro's `<Image>` from `astro:assets` with sources under `src/assets/images/` (mostly `.webp`). `Img.astro` wraps an image with a click-to-open `<dialog>` lightbox (vanilla JS, no framework); pass `label` (+ `hint`) to render a compact row trigger instead of a full-width thumbnail. `downloads/` holds working/source images and is not part of the site.
- **Icons**: inline SVGs live in `Icon.astro` as a small name-keyed registry (`map-pin`, `phone`, `link`, `arrow`, `clock`, `external`, `chevron`, `menu`, `close`, `seal`, `calendar`, `expand`); add new icons there rather than importing an icon library.
- **Design system** (based on Emil Kowalski's design-engineering skills, github.com/emilkowalski/skills): Tailwind **v4**, CSS-first — no `tailwind.config.*` file. The plugin is wired via `@tailwindcss/vite` in `astro.config.mjs`; all tokens, base styles, and reusable component classes live in `src/styles/global.css`. Calm clinical surfaces, green for actions, Ministry red only for the seal. Colors: `canvas` (page bg), `surface`/`surface-2` (cards / fills), `ink`/`ink-2`/`ink-3` (text, all ≥4.5:1 on their surfaces), `accent`/`accent-strong`/`accent-soft`/`on-accent` (brand green), `seal` (Ministry red), `hairline`. Light + dark both come from `prefers-color-scheme`: the dark values override the same `--color-*` vars on `:root`, so utilities need no `dark:` variants. Depth uses the `--elev-1`/`--elev-2`/`--elev-btn*` translucent shadows, never solid borders. Type: the system font stack (no webfonts), with `text-display` / `text-title` / `text-lead` theme sizes that carry their own tracking and leading; use `tabular-nums` for phone numbers and codes. Reusable classes in `@layer components`: `.wrap`/`.wrap-tight` (safe-area-aware containers), `.card` / `.card-link` (radius 20px; inner media uses 12px with `p-2` so the radii stay concentric), `.btn-primary`/`.btn-secondary`/`.btn-ghost`, `.chip`, `.ulink`. Section headings are two-tone (`ink` statement + `ink-3` sentence) instead of eyebrow labels.
- **Motion rules** (from the Kowalski skills): animate only `transform`/`opacity` (plus `box-shadow`/colour for state), never `transition: all`; use the `--ease-out` / `--ease-in-out` / `--ease-drawer` curves from `@theme`; UI motion stays under 300ms and exits are faster than entrances; every pressable gets `:active { scale(0.97) }`; hover styles are gated to `(hover: hover) and (pointer: fine)` (the `hover:` variant is redefined in `global.css` to do this); enter animations use `@starting-style` (popover menu, dialogs), never `scale(0)`; reduced motion keeps fades and drops movement. The only page-load animation is the hero stagger — don't add scroll-reveal animations to sections.
- **Tailwind v4 gotchas**: content scanning is automatic. A component-scoped `<style>` that uses `@apply` must start with `@reference '../../styles/global.css';` (see `Header.astro`) — and must NOT be `is:inline`, or the `@apply` ships uncompiled to the browser. When adding a component class in `@layer components`, don't `@apply` another custom class (v4 only reliably `@apply`s utilities) — share base rules via a selector list instead (see `.btn-*`).
- **Formatting**: Prettier with `printWidth: 140`, single quotes, 2-space indent.
