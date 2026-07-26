# Add or update a project

## 1. Add project data

Open `assets/data/projects.json` and copy an existing object. Keep a unique lowercase `slug`, such as:

```json
{
  "slug": "new-ai-project",
  "title": "New AI Project",
  "category": "Full-Stack AI",
  "status": "Completed",
  "year": "2026"
}
```

Fill in the problem, approach, your role, tools, evidence, metrics and key takeaways. This keeps the portfolio focused on thinking and results rather than only screenshots.

## 2. Add a cover

Place a cover at:

```text
assets/images/projects/new-ai-project-cover.svg
```

Then set `cover` in the JSON to that path.

## 3. Add the case-study page

Create:

```text
projects/new-ai-project/index.html
```

Copy another project's `index.html` and change only:

```html
<body data-project-slug="new-ai-project">
```

Also update its title and meta description.

## 4. Add the PDF report

Place the report at:

```text
public/reports/new-ai-project.pdf
```

The project detail page links to this location automatically by slug.

## 5. Add gallery images

Place images under `assets/images/projects/` and add paths beginning with `../../` in the project's `gallery` array, because galleries render from nested project pages.
