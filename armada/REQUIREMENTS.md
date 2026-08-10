# Contract: portfolio-redesign

Status: APPROVED
Commodore: opencode-go/minimax-m3
Stack: Astro 5 + TypeScript, GitHub Pages, content collections (markdown)
Base branch: main
Lane branch: feat/portfolio-redesign

## Goal

Replace the GitHub-profile-feeling Phase 1-4 site with a story-led professional
portfolio. 5 pages (Home, Work, Writing, About, Now). Quiet modernist + warm
amber accent. Inter + Newsreader pairing. Owner publishes blog posts, Now
updates, and featured work by committing markdown files (typically via a voyage
lane). No CMS, no JS framework.

Reference design: `docs/superpowers/specs/2026-08-10-portfolio-redesign-design.md`.

## Phases (dependency-ordered)

### Phase 1 — Design system (no deps)

- [ ] `src/styles/global.css` — extend token layer: palette (light + dark),
      type scale (Inter + Newsreader), spacing scale (add 12/16 rem), motion
      (default hover transitions only)
- [ ] Fonts: prefer `@fontsource-variable/inter` and `@fontsource-variable/newsreader`
      (self-hosted, no external runtime); place under `src/styles/` and import
      from `global.css`
- [ ] `src/components/ThemeToggle.astro` — unchanged behavior; accent token
      verified in both themes
- [ ] `src/components/SiteNav.astro` (new) — sticky top bar, wordmark left,
      nav links right, theme toggle end, no hamburger
- [ ] `src/components/SiteFooter.astro` (new) — quiet footer, contact links,
      copyright
- [ ] `src/layouts/BaseLayout.astro` — accepts 5 link list, no per-page chrome
      overrides needed for normal pages
- [ ] `public/fonts/` — none; use `@fontsource` packages
- [ ] Owner workflow doc: `docs/content-workflow.md` (concise)

**Success criteria:**
- [ ] `npm run build` succeeds
- [ ] `npm run check` 0 errors
- [ ] `armada/screenshots/portfolio-redesign/design-system.png` — light + dark
      side-by-side at 1280x800 showing tokens (single page placeholder is fine)

### Phase 2 — Content model (depends on Phase 1)

- [ ] `src/content/schema.ts` — add `blog`, `projects`, `now` schemas (Zod)
- [ ] `src/content/config.ts` — register new collections; remove `highlights`
- [ ] `tests/schema.test.ts` — extend with positive + negative cases for each
      new schema
- [ ] Remove `src/content/highlights.json` and `src/lib/highlights.ts`
- [ ] Seed: 3 example blog posts under `src/content/blog/`, 3 example projects
      under `src/content/projects/`, 1 `now.md` document
- [ ] `src/lib/content.ts` (new) — typed accessors: `getPublishedPosts()`,
      `getFeaturedProjects()`, `getProjects({ domain? })`, `getNow()`

**Success criteria:**
- [ ] All 17 prior tests still pass (no regressions)
- [ ] New schema tests pass: >= 6 new cases (3 blog, 3 projects, 1 now)
- [ ] Malformed frontmatter fails its schema test
- [ ] Drafts filtered out of `getPublishedPosts()`

### Phase 3 — Page rebuild (depends on Phase 2)

- [ ] `src/pages/index.astro` — story-led: hero (name, role, 1-line positioning),
      Selected work (3-4 featured), Recent writing (3 latest), Now pull-quote,
      contact
- [ ] `src/pages/work.astro` — heading + filter chips + narrative cards
- [ ] `src/pages/writing.astro` — blog index, reverse chronological
- [ ] `src/pages/about.astro` — long bio + career timeline + skills
- [ ] `src/pages/now.astro` — single doc page, no nav/footer chrome
- [ ] Delete `src/pages/projects.astro` and `src/pages/highlights.astro`
- [ ] Filter chips on `/work`: client-side JS, no URL state, `aria-pressed`
- [ ] `src/scripts/filter.ts` (new) — chip toggling, ~20 lines, no framework
- [ ] `src/components/ProjectCard.astro` — narrative card for Work
- [ ] `src/components/PostCard.astro` — small card for Home + Writing index
- [ ] `src/components/NowPullQuote.astro` — 1-2 line excerpt for Home
- [ ] `src/components/Chip.astro` — filter chip primitive
- [ ] `src/styles/global.css` — extend with page-specific layouts (no clutter)

**Success criteria:**
- [ ] All 5 pages render with seed content
- [ ] Work filter chips toggle cards without page reload (manual + screenshot)
- [ ] Now page renders without nav/footer
- [ ] Mobile (375px) + desktop (1280px) screenshots for all 5 pages under
      `armada/screenshots/portfolio-redesign/`

### Phase 4 — Blog subsystem (depends on Phase 3)

- [ ] `src/pages/blog/[slug].astro` — per-post page, prose measure ~42rem,
      title + dates + back link
- [ ] `src/pages/rss.xml.ts` — Astro endpoint, `rss.xml` route, drafts excluded
- [ ] `tests/rss.test.ts` — snapshot test on RSS output XML
- [ ] `tests/blog.test.ts` — drafts excluded from index, /blog/[slug] route
      accessible

**Success criteria:**
- [ ] `/rss.xml` emits one item per published post; drafts excluded
- [ ] `/blog/[slug]` renders any non-draft post
- [ ] Drafts hidden from `/writing` and `/rss.xml`
- [ ] `armada/screenshots/portfolio-redesign/blog-post.png` — 1 published post
      page at 1280px

### Phase 5 — QA + ship (depends on Phase 4)

- [ ] QA full evidence gate (Phase 1-4 criteria)
- [ ] Adversary light pass: no secrets in client bundle, no `set:html` sinks,
      no private data leaked
- [ ] PR opened against `main` from `feat/portfolio-redesign`
- [ ] After merge, first deploy verifies site live with new pages

**Success criteria:**
- [ ] All Phase 1-4 criteria pass with evidence
- [ ] PR open / merged; site live at https://rafmacalaba.github.io
- [ ] No BLOCKING defects, no OPEN adversary findings

## Risk

Low. UI rebuild on existing repo. No auth, no server state, no migrations of
runtime data. Markdown content is additive; existing GitHub data fetcher from
prior voyage is preserved where still useful (profile avatar, hero subline).
Font addition is a build-time dependency.

## Final success criteria

1. All 5 pages deployed and live at https://rafmacalaba.github.io
2. Every Phase 1-4 success criterion demonstrably true with evidence
3. Owner can publish a blog post by committing `src/content/blog/<slug>.md`
   and pushing to `main`; PR optional but supported
4. No BLOCKING defects, no OPEN adversary findings

## Owner workflow

- **Add blog post**: create `src/content/blog/<slug>.md` with frontmatter
  (`title`, `description`, `pubDate`, optional `updatedDate`, `tags`, `draft`)
  + body. Commit, push to `main`. Pages deploys.
- **Update Now**: edit `src/content/now.md`, bump `updated` frontmatter,
  commit, push.
- **Change featured work**: edit `src/content/projects/<slug>.md`; set
  `featured: true` / `featured: false` to change Home selection.
- **Dispatch a writing voyage**: tell the commodore
  "voyage a blog post about <topic>"; lane runs, drafts commit, PR opens.

## Resolved open questions

- Now page: single doc `src/content/now.md` (loader via `glob` + parse)
- Home positioning + contact: configurable in `src/lib/site.ts` (typed const,
  single source of truth)
- About bio: markdown page body in `src/pages/about.astro` frontmatter (no
  collection)
- Projects domain: `research` | `engineering` | `policy` only — out-of-domain
  projects filtered out or rejected by schema
- Fonts: `@fontsource-variable/inter` + `@fontsource-variable/newsreader`,
  npm packages, bundled at build time
