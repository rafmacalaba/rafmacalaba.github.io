# Rafael Macalaba — Personal Portfolio

Static personal portfolio built with [Astro](https://astro.build) and TypeScript.
Deployed to GitHub Pages on push to `master`.

## Local dev

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Build

```bash
npm run build
```

Output in `dist/`. Preview with `npm run preview`.

## Type checking

```bash
npm run check
```

## Testing

```bash
npm test
```

## Deployment

Push to `master`. GitHub Actions builds and deploys to Pages.
Configured in `.github/workflows/pages.yml`.

## Content

Edit `src/content/highlights.json` to add papers, blogs, talks, or repos.
Schema validates at build time.
