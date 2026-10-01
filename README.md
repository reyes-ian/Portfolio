# Portfolio

Personal portfolio: a fast, responsive, accessible single page built with **Vue 3** and **Tailwind CSS**, with a hardened **PHP** contact endpoint.

## Run locally (XAMPP)

1. Start Apache in XAMPP.
2. Open `http://localhost/Professional%20Portfolio/`.
3. Optional: copy `api/config.example.php` to `api/config.php` and set your email. Messages are always saved to `storage/messages.jsonl` too.

## Edit your content

Everything is in [assets/js/content.js](assets/js/content.js). Edit the entries there; anything left empty (résumé, LinkedIn, demo links) is hidden automatically. To show the résumé button, put your PDF at `assets/resume.pdf` and set `resume` in that file. Teammate testimonials only appear when an entry has `approved: true`. Screenshots go in `assets/img/`.

## Security notes

- Contact form: single-use CSRF token, same-origin check, honeypot, minimum fill time, per-IP rate limiting, server-side validation, CR/LF stripping against header injection.
- Security headers + CSP in `.htaccess`; `storage/` and `config.php` are denied from the web.
- Vue renders text via interpolation (auto-escaped), never `v-html`.

## Deploy

- **Static + PHP host** (any shared host, or free tier of InfinityFree): upload the folder as-is.
- **Static only** (GitHub Pages / Netlify): the form needs a PHP backend, so swap it for a form service or a serverless function.
- Before launch: compile Tailwind (Play CDN is for prototyping) and remove `unsafe-eval` from the CSP.

## Accessibility & performance

Skip link, semantic landmarks, visible focus, labelled form fields, `aria-live` status, reduced-motion support, light/dark themes, lazy-loaded images.
