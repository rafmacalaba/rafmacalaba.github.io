# Contract: portfolio-redesign

Status: APPROVED (amended 2026-08-10 — empty content, light default theme)
Commodore: opencode-go/minimax-m3
Stack: Astro 5 + TypeScript, GitHub Pages, content collections (markdown)
Base branch: main
Lane branch: feat/portfolio-redesign

## Amendment 2026-08-10

Owner will fill in real content later, section by section (Work, Writing,
About). All seed/example content is removed from the contract. Pages must
render an honest empty state until the owner commits real markdown. Default
theme is **light** (not "system"), matching quiet modernist intent.

**Removed:** seed requirement for 3 blog posts + 3 projects + 1 now doc.
**Added:** light default theme, empty-state UX on every section page.

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
      verified in both themes. Default theme = **light** (not "system").
      `BaseLayout` inline script must default to light when no stored pref.
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
- [ ] **No seed content** (amended 2026-08-10). `src/content/blog/`,
      `src/content/projects/`, and `src/content/now.md` start empty; owner
      adds real content section by section
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
      contact. Sections with empty collections render an honest empty state,
      not "no items found" — sections themselves are omitted until owner adds
      content
- [ ] `src/pages/work.astro` — heading + filter chips + narrative cards.
      Empty state shown when no projects
- [ ] `src/pages/writing.astro` — blog index, reverse chronological.
      Empty state shown when no posts
- [ ] `src/pages/about.astro` — owner-fillable structure (bio + career
      timeline + skills). Starts empty (no fake bio, no fake timeline, no
      fake skills); owner fills in via Astro frontmatter over time
- [ ] `src/pages/now.astro` — single doc page, no nav/footer chrome. Already
      handles missing now.md gracefully ("No updates yet.")
- [ ] Delete `src/pages/projects.astro` and `src/pages/highlights.astro`
- [ ] Filter chips on `/work`: client-side JS, no URL state, `aria-pressed`
- [ ] `src/scripts/filter.ts` (new) — chip toggling, ~20 lines, no framework
- [ ] `src/components/ProjectCard.astro` — narrative card for Work
- [ ] `src/components/PostCard.astro` — small card for Home + Writing index
- [ ] `src/components/NowPullQuote.astro` — 1-2 line excerpt for Home
- [ ] `src/components/Chip.astro` — filter chip primitive
- [ ] `src/styles/global.css` — extend with page-specific layouts (no clutter)

**Success criteria:**
- [ ] All 5 pages render; sections without owner content show empty state
      (not broken layout, not fake content)
- [ ] Work filter chips toggle cards without page reload (manual + screenshot)
- [ ] Now page renders without nav/footer, shows "No updates yet." when now.md
      is absent
- [ ] Mobile (375px) + desktop (1280px) screenshots for all 5 pages under
      `armada/screenshots/portfolio-redesign/`, each in empty state
- [ ] Theme defaults to **light** on first visit (no localStorage entry)

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

---

# Post-ship: portfolio-content-2026-08 (DRAFT — pending owner approval)

This is an addition to the merged `portfolio-redesign` contract. It is not a
new feature; it is the first real content pass the parent contract's amendment
reserved ("Owner will fill in real content later, section by section").

Status: DRAFT (pending owner approval)
Lane branch: `feat/portfolio-content-2026-08`

## Scope (in)

- `src/content/projects/armada.md` (new) — Work entry for
  https://github.com/rafmacalaba/armada, domain `engineering`, `featured: true`
- `src/content/blog/armada-intro.md` (new) — first blog post about armada
- `src/content/now.md` (new) — five-thread narrative (see below)
- `src/pages/index.astro` — section title "Selected work" -> "Highlights"
- `src/pages/writing.astro` — drop the "Essays and field notes, reverse
  chronological. Subscribe via RSS." paragraph. RSS link stays on the page
  only if useful elsewhere; default is to remove it with the paragraph.

## Scope (out)

- No design, schema, layout, component, or theme changes
- No new pages or routes
- No new dependencies
- No About-page bio / timeline fill
- No removal of `README.md` highlights reference

## Now narrative — five threads (owner-chosen)

1. Semantic Search, Embeddings and rerankers
2. Information Retrieval
3. Agentic Engineering (armada)
4. Infrastructure, scalable solutions
5. Open source solutions for development data

Tone: flowing paragraph, not a bullet list. Each thread woven naturally.

## Phases (single phase, no deps)

- Create the three content files (parallel-safe, disjoint files)
- Edit `src/pages/index.astro` heading text
- Edit `src/pages/writing.astro` to drop the essay blurb
- Build + check + tests pass
- Screenshot evidence in `armada/screenshots/portfolio-content-2026-08/`
- PR opened against `main` from `feat/portfolio-content-2026-08`

All prose drafts are reviewed by owner before merge. Armada blog + Now
narrative are drafted by commodore in the voyage lane.

## Success criteria

- [ ] `src/content/projects/armada.md` exists; armada appears under Featured
      on `/` (Home)
- [ ] `src/content/blog/armada-intro.md` exists; appears on `/writing` and
      `/rss.xml`
- [ ] `src/content/now.md` exists; rendered on `/` (pull quote) and `/now`
- [ ] `src/pages/index.astro` home section heading reads "Highlights"
- [ ] `src/pages/writing.astro` no longer contains "Essays and field notes,
      reverse chronological." paragraph
- [ ] `npm run build` succeeds
- [ ] `npm run check` 0 errors
- [ ] Existing tests still pass (no regressions)
- [ ] Screenshots: Home ("Highlights" + armada card), `/writing` (one
      post), `/now` (five-thread narrative), `/work` (armada entry) under
      `armada/screenshots/portfolio-content-2026-08/`
- [ ] PR open against `main`

## Risk

Low. Content-only edits on a deployed static site. No schema, route, or
design changes. Build / test regressions are the only realistic failure
mode.

## Owner review gates

- Before merge: review prose drafts in `src/content/blog/armada-intro.md`
  and `src/content/now.md`, edit as needed.
- Before merge: confirm "Selected work" -> "Highlights" rename reads right
  in context on `/`.

---

# Post-ship: portfolio-content-2026-08 v2 (DRAFT — pending owner approval)

Follow-up to the merged `portfolio-content-2026-08` PR (#6). Adds two
profiles, a Home social-icons row, and restores Now-page chrome.

Status: DRAFT (pending owner approval)
Lane branch: `feat/portfolio-content-2026-08-v2`

## Scope (in)

1. **Now page chrome** — drop `chrome={false}` in `src/pages/now.astro` so
   `SiteNav` + `SiteFooter` render. The page should still feel quiet
   (single doc, generous measure) but the top nav must show the user can
   get back to Home / Work / Writing / About.
2. **Two new profiles**:
   - HuggingFace: `https://huggingface.co/rafmacalaba`
   - Kaggle: `https://www.kaggle.com/leafar` (label: "Kaggle (Competitions Expert)")
3. **About page external links** — append both to `externalLinks` array in
   `src/pages/about.astro`. Add inline SVG icons for `huggingface` and
   `kaggle` to the existing `iconFor` switch. Match existing icon style
   (16x16, currentColor, stroke-width 2, Lucide-style).
4. **Home social icons row** — new `src/components/SocialIcons.astro`
   component, rendered in the hero section below the avatar image. Renders
   the same profile set as About page external links (GitHub, LinkedIn,
   World Bank Blogs, npm, HuggingFace, Kaggle, Email). Icons reuse the
   same SVG definitions as About (refactor to a single source so updates
   are shared).
5. **Footer** — no change. (Footer link list is empty by default; user
   wants the icons on Home, not Footer.)

## Scope (out)

- No new pages, no new routes
- No schema changes
- No design system changes (icons match existing inline-SVG pattern)
- No copy changes on About bio

## Decisions taken from owner

- Icons on Home go inside the hero section, below the avatar image,
  in the right side of the hero flex container (alongside the avatar).
- Kaggle label displays "Kaggle (Competitions Expert)" inline next to
  the icon (small text), matching the existing `World Bank Blogs` style
  in About.

## Phases (single phase, no deps)

- Refactor SVG icon definitions from `about.astro` into a small shared
  module `src/lib/social-icons.ts` (pure function returning SVG string
  by icon name)
- Update `src/pages/about.astro` to import icons + append HuggingFace +
  Kaggle
- Create `src/components/SocialIcons.astro` rendering the full profile
  list
- Update `src/pages/index.astro` hero to render `<SocialIcons />` below
  the avatar
- Update `src/pages/now.astro` to drop `chrome={false}`
- Build + check + tests pass; screenshots of Home (icons row visible),
  About (both new icons), Now (nav visible) under
  `armada/screenshots/portfolio-content-2026-08-v2/`
- PR opened against `main`

## Success criteria

- [ ] `/` shows social icons row in the hero, below the avatar
- [ ] `/` icons include GitHub, LinkedIn, World Bank Blogs, npm,
      HuggingFace, Kaggle (with "Competitions Expert" label), Email
- [ ] `/about` external-links row includes HuggingFace and Kaggle with
      matching icons and labels
- [ ] `/now` renders with `SiteNav` and `SiteFooter` (chrome restored)
- [ ] Icon definitions are shared between Home and About (single source
      in `src/lib/social-icons.ts`)
- [ ] `npm run build` succeeds
- [ ] `npm run check` 0 errors
- [ ] Existing tests still pass (no regressions)
- [ ] Screenshots: Home (icons row), About (new icons), Now (nav
      restored) under `armada/screenshots/portfolio-content-2026-08-v2/`
- [ ] PR open against `main`

## Risk

Low. UI additions to existing pages, one small component refactor to
share icon definitions. No schema, layout, or theme changes. Build / test
regressions are the only realistic failure mode.

## Owner review gates

- Before merge: confirm icon set on Home matches About (same profiles,
  same labels)
- Before merge: confirm Kaggle "Competitions Expert" reads right in
  context (About row + Home icons row)
- Before merge: confirm Now page nav doesn't feel cramped alongside the
  long-form narrative

## Resolved open questions

- Home icons row placement: inside hero, below avatar (right column)
- Kaggle label format: "Kaggle (Competitions Expert)" inline
- Icon source-of-truth: `src/lib/social-icons.ts` (shared by About + Home)
