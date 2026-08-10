# Adversarial Review — personal-portfolio

## ADV-001: set:html on third-party-controlled `company` field

- Session: final
- Suggested severity: MEDIUM

What I did: Reviewed `src/pages/index.astro:33` — the hero tagline uses `set:html={tagline}` where `tagline` is sourced from `profile.company` (GitHub API `company` field), with fallback `"Researcher &middot; Data Scientist"`.

Expected: Data from unverified third-party API rendered as escaped text, or sanitized before injection. `set:html` should only be used on trusted content.

Actual: Arbitrary HTML content from GitHub profile's `company` field is injected directly into the DOM without sanitization. An attacker who controls the GitHub profile can inject HTML/JS payload into the built static page. Astro's `set:html` directive is intentional raw HTML injection — the `&middot;` entity in the fallback value confirms the developer expects HTML-entity rendering in this field.

Reproduction:
1. Set a GitHub profile's company field to `<img src=x onerror=alert(1)>`.
2. Run `astro build` with that profile as the source.
3. Output HTML contains the injected payload in the hero tagline paragraph.

Screenshot: N/A

Disposition: ACCEPTED -> fix applied in src/pages/index.astro (line 12 fallback changed to Unicode middot, line 28 description no longer strips entities, line 33 set:html removed in favor of auto-escape {tagline}); regression test added at tests/xss-escape.test.ts; build/check/tests 17/17 green; grep dist/index.html confirms escaped output.

---

## Summary

| Check | Result |
|-------|--------|
| Token secrets in dist/ and src/ | CLEAN — no `ghp_`, `gho_`, `ghu_`, `ghs_`, `github_pat_`, `x-access-token:` patterns |
| GITHUB_TOKEN hardcoding | CLEAN — only `process.env.GITHUB_TOKEN` references |
| Email addresses in source | CLEAN — no private emails found |
| `set:html` usage beyond ADV-001 | CLEAN — only one occurrence at `src/pages/index.astro:33` |
| HighlightItem.astro XSS | CLEAN — uses standard Astro expressions (auto-escaped) |
| highlights.astro XSS | CLEAN — uses standard Astro expressions and HighlightItem |
| GitHub private data exposure | CLEAN — `hireable` field fetched but never rendered; no `email` field fetched |
| package.json postinstall | CLEAN — no postinstall scripts |
| devDependencies audit | CLEAN — playwright (justified), @astrojs/check, typescript only |
| .github/workflows/ | CLEAN — no workflow directory exists |
| Sitemap | CLEAN — 3 URLs: `/`, `/highlights/`, `/projects/`; no admin/dev URLs |
| dist/ pages | PRESENT — `index.html`, `projects/index.html`, `highlights/index.html` all exist |
