# Design spec: personal-portfolio redesign

Date: 2026-08-10
Status: DRAFT
Repo: `rafmacalaba/rafmacalaba.github.io`
Stack: Astro 5 + TypeScript, GitHub Pages, content collections (markdown)

## Goal

Replace GitHub-profile presentation with story-led professional portfolio. Current
site (Phase 1-4 contract, `armada/REQUIREMENTS.md`) reads like auto-generated
GitHub profile: hero + pinned repo grid + highlights strip. New site leads with
narrative — who owner is, what he works on, why it matters. GitHub data demoted to
supporting evidence. Owner publishes blog posts, Now page, and featured work by
committing markdown files. No CMS, no JS framework.

## Audience

Three readers, two questions each:

- **Recruiters / hiring managers.** What does Rafael do, where, at what level?
  Fast scan: Home hero, featured work, Now.
- **Collaborators (researchers, engineers, policy folks).** What domains does he
  work across, what recent output? Work filter chips, Writing.
- **Peers.** Full picture: bio, career timeline, tools. About, Now.

All three want to learn in under 30 seconds: name, role, domain, signal of active
work. Site must not make them dig.

## Visual system

Quiet modernist. Reference: Vercel, Apple product pages, Linear blog. Not
decorative — structure does the work. Typography pair carries the tone:
geometric sans (body) + serif (display).

### Palette

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#FAFAF9` | `#0A0A0A` |
| `--color-fg` | near-black | near-white |
| `--color-muted` | `#6B6B6B` | `#9C9C9C` |
| `--color-accent` | `#D97706` | `#D97706` (warm amber survives both) |
| `--color-border` | `#E7E5E4` | `#262626` |

Text inverts with theme. Accent for links, hover, focus — nothing else. No accent
fills on cards; cards distinguished by borders + whitespace.

### Type

- Body: Inter (geometric sans). `--font-body`.
- Display headings: Newsreader (serif). `--font-display`.
- Load via Astro font integration or self-hosted; no external runtime fetch.
- Scale: reuse current `clamp()` approach in `src/styles/global.css`. Display
  scale wider than current: hero `clamp(2.5rem, 7vw, 4.5rem)`, section headings
  `clamp(1.75rem, 4vw, 2.5rem)`. Body 1rem / 1.6 line-height unchanged.
- Display font at reduced weight (400-500), not 700. Serif reads best light.

### Spacing

Extend current scale (`--space-1` 0.5rem through `--space-8` 4rem) with
`--space-12` 6rem, `--space-16` 8rem for editorial section rhythm. Section
padding in `rem`, consistent across pages. Max content width narrows for prose:
keep `--max-width` 72rem for Work grid, add ~42rem measure for blog body.

### Motion

Default hover transitions only. `transition: color 150ms, border-color 150ms,
opacity 200ms`. No parallax, no carousel, no scroll-triggered animation.
Reduced-motion media query respected. Current `scroll-behavior: smooth` kept.

### Dark mode

Existing `[data-theme]` toggle (`src/components/ThemeToggle.astro`, localStorage
persistence) unchanged in behavior. Re-theme tokens only. Amber accent constant
across themes.

## Information architecture

Five pages. Single top nav, same order as listed:

1. **Home** (`/`) — lead conversion page. Story + proof.
2. **Work** (`/work`) — full curated project list.
3. **Writing** (`/writing`) — blog index. `/blog/[slug]` per post. `/rss.xml`.
4. **About** (`/about`) — bio, timeline, skills.
5. **Now** (`/now`) — current focus, no chrome.

Link graph: Home → Work, Writing, About, Now (nav). Work → project external URLs
(GitHub, paper, talk). Writing → `/blog/[slug]` → rss.xml link. Now reachable
from nav + Home pull-quote. Footer: contact links + GitHub, present on all pages
except Now.

Replaces current three pages: `src/pages/index.astro`, `projects.astro`,
`highlights.astro` (`highlights` content collection superseded by `blog` +
`projects`).

## Page specs

### Home (`src/pages/index.astro`)

Purpose: 30-second answer — who, what, evidence.

Blocks in order:
1. Hero: name, role, 1-line positioning statement. No avatar card; text-led.
2. Selected work: 3-4 featured projects, narrative paragraph each (not repo
   description dump). Link to `/work` for rest.
3. Recent writing: latest 3 posts, title + date + excerpt. Link to `/writing`.
4. Now pull-quote: 1-2 sentence excerpt of current focus, link to `/now`.
5. Contact: email + social links, quiet footer.

Editable by owner: positioning line, featured project pick + narratives, pull
quote selection, contact links.
Auto-derived: post titles/excerpts from `blog` collection, project metadata from
`projects` collection.

### Work (`src/pages/work.astro`)

Purpose: full curated inventory. Evidence of range + depth.

Blocks:
1. Page heading + 1-line framing.
2. Filter chips by domain: `research` / `engineering` / `policy` (+ `all`).
   Client-side toggle, no routing, no URL param persistence (out of scope).
3. Narrative cards: title, domain, year, 2-4 sentence writeup, links (GitHub /
   paper / talk / post).

Editable: chip set fixed by schema domains; card selection + narratives + links.
Auto-derived: none from GitHub — all curated in `projects` collection.

### Writing (`src/pages/writing.astro` + `src/pages/blog/[slug].astro`)

Purpose: publish hub. Reverse-chronological index + per-post pages.

Index blocks: page heading, post list (title, pubDate, description), rss.xml
link, draft posts hidden.
Post page: title, pubDate (updatedDate if present), body via Astro markdown
rendering, prose measure, back link to `/writing`.

Editable: everything — owner writes `/blog/<slug>.md` files.
Auto-derived: index order, RSS feed, sitemap entries.

### About (`src/pages/about.astro`)

Purpose: narrative depth for peers + long-form hiring signal.

Blocks:
1. Bio: 2-3 paragraphs, story-shaped, not CV bullets.
2. Career timeline: role, org, year range — list, not graphic.
3. Skills / tools: grouped list (research, engineering, policy).

Editable: all content. Source: markdown page body or content doc — final choice
in open questions.

### Now (`src/pages/now.astro`)

Purpose: current focus. What-are-you-working-on answer. Updated quarterly.

Blocks: single markdown doc rendered without site chrome (no nav/footer), plain
page, date of last update shown. Link here from Home pull-quote and nav.

Editable: `src/content/now.md` (or `now/index.md` — open question).
Auto-derived: last-updated date from file.

## Content model

Extend `src/content/config.ts` with three collections. Existing `highlights`
collection and `src/content/schema.ts` removed once blog/projects land.

### `blog` (`src/content/blog/<slug>.md`)

Frontmatter (Zod):

- `title: string` (required)
- `description: string` (required) — index excerpt + RSS description
- `pubDate: Date` (required) — ISO
- `updatedDate?: Date` — shown when diverges from pubDate
- `tags?: string[]` — optional, reserved for future grouping, not UI now
- `draft?: boolean` — default false; true hides from index + RSS

Markdown body, plain (no MDX). `slug` = filename.

### `projects` (`src/content/projects/<slug>.md`)

Frontmatter:

- `title: string` (required)
- `domain: "research" | "engineering" | "policy"` (required) — drives Work chips
- `year: number` (required) — display + sort
- `summary: string` (required) — 2-4 sentence narrative, shown on cards
- `links: { label: string; url: string }[]` (required, ≥1) — GitHub, paper, talk, post
- `featured?: boolean` — Home Selected work pulls from this flag
- `status?: "active" | "archived"` — optional, sort weight only

Body optional; long-form case studies later. GitHub repo data no longer sole
source — owner curates narrative, links point at repos/papers.

### `now` (single doc `src/content/now.md`)

Frontmatter:

- `updated: Date` (required) — displayed on page

Body: current focus, 1-3 short sections. Single doc, not collection.

## Data sourcing

Split by source and role:

- **GitHub API (build time, `src/lib/github.ts`)**: profile fields (name, bio,
  location, avatar), pinned repos, top languages, contribution summary. Role:
  supporting evidence — feeds hero subline, "more on GitHub" links, optional
  stats line on About. Never the main content of any page.
- **Repo markdown (owner-maintained)**: blog posts, project narratives, Now,
  About bio/timeline, Home positioning line. Role: main event.

Principle: GitHub data fills in around curated stories, not the reverse. If
GitHub fetch fails, site still ships — stories intact. Existing graceful
degradation (`GITHUB_TOKEN` fallback) kept.

Where GitHub data appears concretely: Home hero avatar small + GitHub link;
Work/About "also on GitHub" link line. Pinned repo grid removed from Home.

## Interaction patterns

- **Theme toggle**: existing component, unchanged behavior.
- **Nav**: sticky top bar, minimal — site name/wordmark left, page links right,
  theme toggle end. Collapses to single-row wrap on mobile. No hamburger.
- **Work filter chips**: `all` default; click toggles visible cards, CS
  transition, no scroll reset. Keyboard accessible, `aria-pressed`.
- **Blog reading**: prose column (~42rem), serif display for post titles, body
  stays Inter. pubDate + updatedDate under title. No reading-time estimate (out
  of scope). Back link top + footer.

## Owner workflow

All via git + voyage dispatch. No CMS login.

1. **Add blog post**: create `src/content/blog/<slug>.md` with frontmatter +
   body. Commit, push to `main`. Pages builds; post appears on `/writing` +
   `/rss.xml`. Draft = set `draft: true` until ready.
2. **Update Now**: edit `src/content/now.md`, bump `updated` date. Commit, push.
   Quarterly cadence.
3. **Edit featured work**: create or edit `src/content/projects/<slug>.md`;
   set/clear `featured: true` to change Home selection; edit `summary` for
   narrative.
4. **Change Home positioning / contact**: edit content doc or config — exact
   location in open questions.

Dispatch: fleet voyage (`armada-dispatch` under `armada/`). Lane runs: clipper
(UI), galleon (content plumbing + workflow), qa. Owner never edits under
`src/components` etc. directly beyond scaffold of content files — design review
on PR.

## Deployment

Unchanged from current. `.github/workflows/pages.yml`: push to `main` triggers
build (`npm run build`) + Pages deploy. `@astrojs/rss` added to
`package.json` dependencies (build-time only). `@astrojs/sitemap` already
installed; blog + projects pages join `sitemap.xml` automatically. RSS at
`/rss.xml` from `src/pages/rss.xml.ts` (Astro endpoint).

No push from main checkout locally; PR from lane branch per armada rules.

## Out of scope

- Analytics, comments, search, newsletter capture
- MDX (future, when posts need components)
- CMS UI (future, if owner stops wanting git workflow)
- i18n
- Dark mode toggle bug fixes (handled in Phase 4)
- URL-param persistence for Work filters
- Reading-time estimates

## Success criteria

- [ ] All five pages render from content collections; build succeeds with `npm run build`
- [ ] `blog`, `projects`, `now` schemas validate; malformed entry fails `npm test`
- [ ] `/rss.xml` emits one entry per published post, excludes drafts
- [ ] `/work` filter chips toggle cards without page reload, no console errors
- [ ] Dark/light theme toggle persists, accent readable on both — screenshot evidence
- [ ] Lighthouse-style smoke: no broken links/images, mobile 375px + desktop 1280px screenshots in `armada/screenshots/`
- [ ] No BLOCKING defects, no OPEN adversary findings

## Open questions

1. Now page: single content doc (`src/content/now.md`) vs. page with content
   frontmatter? Collection loader consistency vs. simplest path.
2. Where Home positioning line + contact links live: `src/content/config.ts`
   site config vs. markdown doc? Owner-editable either way; decide on edit
   frequency.
3. About bio: markdown page body vs. content collection entry? Affects whether
   About text shows in any aggregation.
4. Projects with no domain (misc tooling): `other` domain or mandatory tri-
   domain? Chips stay 3; `other` would hide from filtering.
5. Font delivery: `@fontsource` npm packages vs. `@astrojs/fonts` vs. self-host
   woff2 in `public/fonts`? Bundle size vs. manual update.