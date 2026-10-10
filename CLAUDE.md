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
pnpm pretty     # prettier (with the Astro plugin) --write over src
```

There is no lint or test command. Run `pnpm typecheck` to validate changes.

## Environment

`MAPS_API_KEY` (Google Maps JS API) is required for the map to render — see `.env.example`. It is read via `import.meta.env.MAPS_API_KEY` in `src/components/Maps.astro` (`MAPS_LINK`) and baked into the static output at build time.

## Architecture

- **`src/pages/`** — one `.astro` file per route: `index.astro` (home), `bagisiklama.astro` (vaccination schedule), `beslenme.astro` (nutrition), `erisilebilirlik.astro` (accessibility statement), `kvkk.astro` (KVKK aydınlatma metni). Pages compose components inside `<Layout title="Page name" description="…">`; Layout supplies the header, `<main>` and footer. `kvkk.astro` lists every third-party request the site makes (Cloudflare, Umami, Google Maps on click) — update it whenever you add or remove one.
- **`src/layouts/Layout.astro`** — the single HTML shell: `<head>` (viewport with `viewport-fit=cover`, per-scheme `theme-color`, favicons), native cross-document view transitions (declared in `global.css`), Umami analytics (injected **only in prod** via `import.meta.env.PROD`), then `Header`, `<main id="main-content">` and `Footer` around the page. `title` is the page name (the clinic name is appended; omit it on the home page); `description` is required.
- **`src/components/`** — presentational section components (`Hero`, `Services`, `Doctors`, `Contact`, `Gallery`, `Header`, `Footer`, `Maps`, etc.). The home page is assembled by stacking these. Inner pages open with `PageIntro` (back link, section name, h1, optional lead slot). `Gallery` owns its single photo viewer `<dialog>`.
- **`src/lib/clinic.ts`** — single source of truth for the clinic's facts: `NAME` / `SHORT_NAME`, `ADDRESS`, `PHONES`, `LOCATION` + `DIRECTIONS` (map link), `telHref`, and the family-doctor roster (`DOCTORS`: slug, name, birim `code`, phone, assistant, weekday `hours` used in each schedule's screen-reader summary). Change a phone or address here, not in components. `slug` must match the image filenames under `assets/images/asm/doctors/<slug>.webp` and `.../schedules/<slug>_schedule.webp`, which `Doctors.astro` resolves via `import.meta.glob`.

### Conventions

- **Images**: use Astro's `<Image>` from `astro:assets` with sources under `src/assets/images/` (mostly `.webp`). Astro's `<Image>` already defaults to `loading="lazy"` and `decoding="async"`, so only pass `loading="eager"` (plus `fetchpriority="high"` for the LCP image). `Img.astro` wraps an image with a click-to-open, tap-to-zoom `<dialog>` lightbox (vanilla JS, no framework); pass `label` (+ `hint`) to render a compact row trigger instead of a full-width thumbnail. `downloads/` holds working/source images and is not part of the site.
- **Icons**: inline SVGs live in `Icon.astro` as a small name-keyed registry (`map-pin`, `phone`, `external`, `arrow`, `clock`, `menu`, `close`, `expand`), all 24px stroke icons sharing one `<svg>` wrapper; add new icons there rather than importing an icon library.
- **Design system** (based on Emil Kowalski's design-engineering skills, github.com/emilkowalski/skills): Tailwind **v4**, CSS-first — no `tailwind.config.*` file. The plugin is wired via `@tailwindcss/vite` in `astro.config.mjs`; all tokens, base styles, and reusable component classes live in `src/styles/global.css`. Calm clinical surfaces, green for actions, Ministry red only for the seal. Colors: `canvas` (page bg), `surface`/`surface-2` (cards / fills), `ink`/`ink-2`/`ink-3` (text, all ≥4.5:1 on their surfaces), `accent`/`accent-strong`/`accent-soft`/`on-accent` (brand green), `seal` (Ministry red), `hairline`. Light + dark both come from `prefers-color-scheme`: the dark values override the same `--color-*` vars on `:root`, so utilities need no `dark:` variants. Depth uses the `--elev-1`/`--elev-2`/`--elev-btn*` translucent shadows, never solid borders. Type: the system font stack (no webfonts), with `text-display` / `text-title` / `text-lead` theme sizes that carry their own tracking and leading; use `tabular-nums` for phone numbers and codes. Reusable classes in `@layer components`: `.wrap`/`.wrap-tight` (safe-area-aware containers), `.card` / `.card-link` (radius 20px; inner media uses 12px with `p-2` so the radii stay concentric), `.btn-primary`/`.btn-secondary`/`.btn-ghost`, `.chip`, `.ulink`, `.lightbox`/`.lightbox-close` (the `<dialog>` shell, backdrop and close button shared by `Img` and the gallery viewer). Section headings are two-tone (`ink` statement + `ink-3` sentence) instead of eyebrow labels.
- **Motion rules** (from the Kowalski skills): animate only `transform`/`opacity` (plus `box-shadow`/colour for state), never `transition: all`; use the `--ease-out` / `--ease-in-out` / `--ease-drawer` curves from `@theme`; UI motion stays under 300ms and exits are faster than entrances; every pressable gets `:active { scale(0.97) }`; hover styles are gated to `(hover: hover) and (pointer: fine)` (the `hover:` variant is redefined in `global.css` to do this); enter animations use `@starting-style` (popover menu, dialogs), never `scale(0)`; reduced motion keeps fades and drops movement. The only page-load animation is the hero stagger. Home-page headings and cards carry `.reveal` (in `global.css`): a CSS scroll-driven fade and 16px `translate` rise (`animation-timeline: view()`, zero JS) across the bottom 20vh of the viewport, so content in the reading area is always at rest; browsers without view timelines show it static. Animate `translate`, not `transform`, so the `:active` press scale still works. Keep it off inner reading pages and above-the-fold content, and don't add JS or IntersectionObserver reveals.
- **Tailwind v4 gotchas**: content scanning is automatic. A component-scoped `<style>` that uses `@apply` must start with `@reference '../styles/global.css';` (see `Header.astro`) — and must NOT be `is:inline`, or the `@apply` ships uncompiled to the browser. When adding a component class in `@layer components`, don't `@apply` another custom class (v4 only reliably `@apply`s utilities) — share base rules via a selector list instead (see `.btn-*`).
- **Formatting**: Prettier (`prettier-plugin-astro`) with `printWidth: 140`, single quotes, 2-space indent; run `pnpm pretty`.
