# Adding a Certificate

The certificate section is data-driven. You do not need to edit `index.html`.

## A. Certificate with a preview image and optional PDF

1. Put the preview image here:

   `assets/images/certificates/your-certificate.png`

2. Put the original PDF here when available:

   `public/certificates/your-certificate.pdf`

3. Open `assets/data/certificates.json` and add an object before the final `]`:

```json
{
  "title": "Certificate title",
  "issuer": "Issuing organization",
  "date": "Month Year",
  "image": "assets/images/certificates/your-certificate.png",
  "pdf": "public/certificates/your-certificate.pdf"
}
```

Use an empty PDF value when there is no PDF:

```json
"pdf": ""
```

## B. Text-only credential

Use empty `image` and `pdf` values. It will appear under **Additional credentials**.

```json
{
  "title": "Python for Data Science",
  "issuer": "Anaconda",
  "date": "2024",
  "image": "",
  "pdf": ""
}
```

## Image recommendations

- PNG or JPG
- Landscape ratio close to 1.42:1
- At least 1200 px wide for sharp previews
- Keep filenames lowercase and use hyphens instead of spaces

## Important

Run the portfolio through a local server because the browser loads the JSON file dynamically:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
