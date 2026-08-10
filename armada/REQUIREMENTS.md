# Contract: personal-portfolio

Status: APPROVED
Commodore: opencode-go/minimax-m3
Stack: Astro + TypeScript, GitHub Pages, GitHub REST API (build-time)

## Goal

Sleek personal portfolio site for Rafael Macalaba. Surfaces GitHub profile
(pinned repos, languages), research papers, World Bank blogs, and talks.
Owner maintains content by editing `content/highlights.json`. Live data is
fetched from the GitHub API at build time. Deployed to GitHub Pages on push
to `master`.

## Phases (dependency-ordered)

### Phase 1 — Scaffold (no deps)
- [ ] Astro + TypeScript project under repo root (or `site/`), strict TS
- [ ] `astro.config.mjs` with `site` URL `https://rafmacalaba.github.io` and `base` `/`
- [ ] Content collection `content/highlights` backed by `content/highlights.json`
      with Zod schema (`type: paper|blog|talk|repo|other`, `title`, `url`, `date?`, `description?`, `venue?`)
- [ ] Initial `content/highlights.json` seeded from user-provided URLs:
      - World Bank blogs author page + the synthetic-data post
      - ICLR 2025 paper page
      - arXiv 2502.10263
- [ ] Base layout with header, footer, theme toggle hook, system fonts
- [ ] `.github/workflows/pages.yml` — build + deploy Pages on push to `master`
- [ ] README updated with local dev + deploy instructions

**Success criteria:**
- [ ] `npm run build` succeeds locally, outputs static site to `dist/`
- [ ] Workflow file valid, triggers on push to `master`
- [ ] `content/highlights.json` parses against schema (script check or test)

### Phase 2 — Data layer (depends on Phase 1)
- [ ] `src/lib/github.ts` — build-time fetcher: profile, pinned repos (top 6),
      top languages, contribution summary
- [ ] Read `GITHUB_TOKEN` from env when present; fall back gracefully (rate limit + cached fallback)
- [ ] `src/lib/highlights.ts` — typed accessor for the content collection, grouped by type
- [ ] Unit/integration test for the fetcher using a recorded fixture

**Success criteria:**
- [ ] Fetcher returns parsed profile + repos for fixture input
- [ ] Missing token path does not throw; logs warning, returns partial data
- [ ] Schema rejects malformed highlight entries (test)

### Phase 3 — Pages + UI (depends on Phase 2)
- [ ] `src/pages/index.astro` — hero (name, role, location, avatar), bio, highlights strip
      (latest 4 grouped by type), pinned repos grid (top 6), contact links
- [ ] `src/pages/projects.astro` — full repo grid with language filter chips
- [ ] `src/pages/highlights.astro` — chronological list grouped by type (Papers / Blogs / Talks)
- [ ] Sleek minimalist style: type scale, generous whitespace, restrained palette,
      subtle motion only (no parallax, no carousel)
- [ ] Dark / light / system theme toggle, persisted in `localStorage`
- [ ] SEO: per-page `<title>`, OG tags, favicon, `sitemap.xml` via `@astrojs/sitemap`
- [ ] Responsive: mobile-first, single-column on small screens

**Success criteria:**
- [ ] All three pages render with real GitHub data + seeded highlights
- [ ] Theme toggle persists across reload (manual test or e2e)
- [ ] Lighthouse-style smoke: no console errors, no broken images, no broken links
- [ ] Mobile screenshot at 375px + desktop at 1280px captured under `armada/screenshots/personal-portfolio/`

### Phase 4 — QA + ship (depends on Phase 3)
- [ ] QA runs evidence checklist per criterion above
- [ ] Adversary light pass on public surface (no secrets in client bundle)
- [ ] PR opened against `master` from feature lane branch

**Success criteria:**
- [ ] All Phase 1–3 criteria pass with evidence (build log + screenshots)
- [ ] `gh pr create --base master` succeeds; PR URL recorded
- [ ] No `BLOCKING` defects, no `OPEN` adversary findings

## Risk

Low. Static site, public-only GitHub data, no auth, no server-side state.
Active roles: implementer (clipper for Astro UI, galleon for fetcher +
workflow), qa. Security / adversary on standby — activate if review surface
triggers concern.

## Final success criteria

1. Every phase success criterion demonstrably true (build log + screenshots in evidence).
2. Site live at `https://rafmacalaba.github.io` after first Pages deploy from `master`.
3. PR open against `master` from lane branch; never push `master` directly.

## Owner-maintained content

Adding papers / blogs / talks = append one entry to `content/highlights.json`
and push. Build picks it up automatically.
