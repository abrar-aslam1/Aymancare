# AymanCare

Marketing site for AymanCare Primary & Urgent Care (4 clinics across Dallas–Fort Worth).

Built with [Astro](https://astro.build) — each page is a static HTML file with its own URL, title, and meta description.

## Develop

```sh
npm install
npm run dev        # local dev server at localhost:4321
npm run build      # production build → dist/
```

## Structure

- `src/layouts/Base.astro` — shared head (SEO meta, JSON-LD), nav, footer, and site JS
- `src/pages/` — one file per page; the file path is the URL (e.g. `src/pages/locations/mesquite.astro` → `/locations/mesquite/`)
- `src/pages/blog/` — blog posts; add a new `.astro` file here to publish a new article
- `src/styles/global.css` — all site styles
- `public/images/` — static images (served at `/images/...`)

## Deploy

Netlify builds from `netlify.toml` (`npm run build`, publishes `dist/`). The booking
form uses Netlify Forms and redirects to `/thank-you/` on submit.

Legacy hash URLs from the old single-page site (`/#page-...`) are redirected to
their new pages by a script in the layout head.

`scripts/split.mjs` is the one-shot migration script that generated this structure
from the old single-file `index.html` (kept for reference; index.html now lives in
git history only).
