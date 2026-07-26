# Syed Muhammad Awais Raza - Neon AI Portfolio

A premium, responsive, multi-page portfolio built with semantic HTML, modern CSS and vanilla JavaScript. It has no frontend framework dependency, so it loads quickly and can be deployed directly to Vercel.

## Included

- Animated neural-particle background and ambient neon lighting
- Glass navigation, mobile menu, scroll progress and reduced-motion support
- Pointer spotlight and hover illumination on cards
- Hero, about, services, skills, timeline, leadership, certificates and contact sections
- 12 searchable/filterable project cards
- Dedicated case-study page for every project
- PDF report for every project in `public/reports/`
- Real CV at `public/cv/Awais-Raza-CV.pdf`
- Certificate previews and PDFs
- Optional Vercel contact API using Resend, with automatic `mailto:` fallback
- No broken external image dependencies or runtime CDN requirements

## Run locally

Opening `index.html` directly can block the JSON fetch in some browsers. Start a small local server instead:

```bash
cd Awais_Raza_Neon_Portfolio
python -m http.server 8000
```

Open `http://localhost:8000`.

## Project reports and links

Each project's PDF is stored here:

```text
public/reports/<project-slug>.pdf
```

The project page automatically links to the matching PDF, for example:

```text
projects/weighted-yolo/index.html
public/reports/weighted-yolo.pdf
```

To replace a report, keep the same filename. To add a new project, follow `ADDING_A_PROJECT.md`.

## Update exact GitHub repository links

The current case studies use your GitHub profile because exact repository URLs were not supplied for every project. Edit each project's `links` or the GitHub button in:

```text
assets/data/projects.json
```

## Optional contact form setup

The form works immediately through a `mailto:` fallback. To send directly from the website after Vercel deployment:

1. Create a Resend account and API key.
2. Add the variables from `.env.example` in Vercel Project Settings > Environment Variables.
3. Use a verified sending domain for `RESEND_FROM` in production.

## Vercel deployment later

The folder is already Vercel-ready. Import the folder/repository as a new Vercel project and deploy with the default settings. No build command is required for the static frontend; `/api/contact.js` is detected as a serverless function.

## Important personalization

- Replace `assets/images/avatar.svg` with a real professional photo later. Keep the filename or update the path in `index.html`.
- Replace generic GitHub profile links with exact repository links.
- Add remaining certificate PDFs and previews as they become available.
- Update `robots.txt` and add a sitemap after the final Vercel domain is known.
