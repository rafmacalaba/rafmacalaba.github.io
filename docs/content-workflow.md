# Content workflow

How to publish and update content on the portfolio site. Everything is plain
git + markdown — no CMS, no admin UI. Push to `main` and GitHub Pages deploys
on the next build.

## Where things live

| What                 | Path                            | Format                       |
| -------------------- | ------------------------------- | ---------------------------- |
| Blog posts           | `src/content/blog/<slug>.md`    | Zod-validated frontmatter    |
| Projects (Work)      | `src/content/projects/<slug>.md`| Zod-validated frontmatter    |
| Now page             | `src/content/now.md`            | Single doc with `updated`    |
| Site identity / nav  | `src/lib/site.ts`               | Typed const (nav, contact)   |
| About bio            | `src/pages/about.astro`         | Markdown page body           |

Frontmatter schemas live in `src/content/schema.ts`. If a field is wrong the
build fails — check the error.

## Add a blog post

1. Create `src/content/blog/<slug>.md` where `<slug>` becomes the URL
   (`/blog/<slug>`).
2. Fill in frontmatter:

   ```yaml
   ---
   title: "Post title"
   description: "One-sentence excerpt used on the index and in RSS."
   pubDate: 2026-08-10
   updatedDate: 2026-08-12   # optional; shown only if it differs from pubDate
   tags: ["research"]         # optional; reserved, no UI yet
   draft: false               # set true to hide from /writing and /rss.xml
   ---
   ```

3. Write the body in plain markdown. Headings start at `h2` — the page template
   renders the `h1` from `title`.
4. `git add`, commit, push to `main`. The post appears on `/writing` and
   `/rss.xml`. Drafts never do.

## Update the Now page

Edit `src/content/now.md`. Bump the `updated:` frontmatter date to today's
date — that date is shown on the page. Body is freeform; keep it short
(quarterly cadence, 1–3 sections).

## Change featured work on Home

The Home page pulls projects where `featured: true` from
`src/content/projects/`. To swap which projects appear there:

- Set `featured: false` on a project you want to drop.
- Set `featured: true` on a project you want to add (3–4 total is the sweet
  spot).

Edit `summary` to change the narrative paragraph that appears under each card
on Home and on `/work`.

## Change Home positioning or nav

Edit `src/lib/site.ts`:

- `tagline` — the one-line positioning statement under the hero.
- `navLinks` — order, label, or href for any of the 5 nav links.
- `contactLinks` — what shows in the footer (and on Home contact).

`name` is the wordmark in the top nav and the default `<title>`.

## Add a project

Create `src/content/projects/<slug>.md`:

```yaml
---
title: "Project name"
domain: "research"  # research | engineering | policy
year: 2026
summary: "2–4 sentence narrative. Lead with what it is and why it matters."
links:
  - label: "GitHub"
    url: "https://github.com/..."
  - label: "Paper"
    url: "https://..."
featured: false      # true = appears on Home Selected work
status: "active"     # active | archived; sort weight only
---
```

The `domain` field drives the filter chips on `/work`. Use only
`research`, `engineering`, or `policy` — anything else fails the schema.

## Things that are out of scope

- No URL state for filter chips on `/work`. Selection resets on reload.
- No reading-time estimate on blog posts.
- No CMS or admin UI. Edit markdown, commit, push.
- No scheduled publishing. `draft: true` is a manual gate.

## Dispatch a writing voyage

If you'd rather not write the markdown yourself, tell the commodore:

> voyage a blog post about <topic>

A lane runs: draft markdown → review → PR. You approve, merge, deploy.
