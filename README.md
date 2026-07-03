# Frank Teng — UX Portfolio

Personal portfolio of Frank Teng, product designer & UX researcher.
Live at **https://halcykon.github.io/UXPortfolio/**

## What's inside

| Page | Content |
|---|---|
| `index.html` | Home — intro, selected work, Lab (side projects), contact |
| `mayo-telehealth.html` | Mayo Clinic — scaling COVID-era telehealth into a sustainable platform |
| `exxonmobil-upstream.html` | ExxonMobil — spatial data validation for petrophysicists |
| `nasa-WADs.html` | NASA Kennedy / TOSC — digitizing Work Authorization Documents for SLS |
| `socialAR.html` | Carnegie Mellon — AR for conference networking (HoloLens research) |

## Stack

None. That's the point.

- Hand-written semantic **HTML5** — no builders, no frameworks
- One shared stylesheet, `css/style.css` — custom properties for color, type, and spacing tokens
- ~20 lines of vanilla JS (`js/main.js`) for the mobile nav toggle
- Fonts: [Inter](https://fonts.google.com/specimen/Inter) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts

## Local development

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploying

GitHub Pages serves the repository root from `main`. Any merge to `main` deploys
automatically within a minute or two.

## Editing checklist

When adding or editing a case study:

1. Copy an existing case page as the template (header, hero, meta grid, numbered sections, footer).
2. Give the page a unique `<title>`, `<meta name="description">`, canonical URL, and Open Graph tags.
3. Every image needs real `alt` text, `width`/`height` attributes, and `loading="lazy"` (except the hero).
4. Keep the heading order: one `<h1>` per page, `<h2>` per section, `<h3>` inside.
5. Add the page to `sitemap.xml`.

## Notes

- `project.mobirise` is the legacy Mobirise builder file from the previous version
  of this site. It is no longer used — kept for reference only.
- Images live in `assets/images/`. Several research artifacts are large PNGs;
  consider converting to WebP if page weight becomes a concern.
