import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INDEX_SRC = join(ROOT, "src/pages/index.astro");
const DIST_HTML = join(ROOT, "dist/index.html");

// Regression test for ADV-001 (set:html XSS sink on GitHub profile.company).
// Two complementary checks:
//   1. Source must not inject raw HTML for the company/tagline field.
//   2. The built static HTML (if present) must contain company text as
//      escaped text, so a malicious company value like
//      '<img src=x onerror=alert(1)>' would render as the literal string,
//      not as an HTML element.

describe("ADV-001: XSS escape on profile.company", () => {
  it("src/pages/index.astro does not use set:html on tagline/company", () => {
    const src = readFileSync(INDEX_SRC, "utf-8");

    assert.ok(
      !/set:html\s*=\s*\{?tagline\}?/.test(src),
      "tagline must not be injected via set:html (XSS sink)",
    );
    assert.ok(
      !/set:html\s*=\s*\{?company\}?/.test(src),
      "company must not be injected via set:html (XSS sink)",
    );

    assert.ok(
      /<p class="hero-tagline">\{tagline\}<\/p>/.test(src),
      "hero-tagline should use Astro auto-escape",
    );
  });

  it("dist/index.html renders hero-tagline as escaped text (if built)", () => {
    if (!existsSync(DIST_HTML)) {
      // Build is not a precondition for `npm test`. If dist is absent,
      // the source-level check above is the authoritative guard.
      return;
    }
    const html = readFileSync(DIST_HTML, "utf-8");
    const match = html.match(/<p class="hero-tagline">([^<]*)<\/p>/);
    assert.ok(match, "hero-tagline paragraph not found in dist/index.html");
    const content = match[1];

    assert.ok(
      !/<[a-z]/i.test(content),
      `hero-tagline must be plain text, got: ${content}`,
    );
    assert.ok(
      !/onerror|onload|javascript:/i.test(content),
      `hero-tagline must not contain script-like content, got: ${content}`,
    );
  });
});
