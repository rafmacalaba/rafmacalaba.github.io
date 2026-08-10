import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST_BLOG = join(ROOT, "dist/blog");

function listDirs(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path).filter((f) => statSync(join(path, f)).isDirectory());
}

describe("Blog route", () => {
  it("dist/blog/<slug>/index.html exists for each published post", () => {
    assert.ok(existsSync(DIST_BLOG), "dist/blog should exist after build");
    const slugs = listDirs(DIST_BLOG);
    // 3 published + 0 draft = 3 blog pages
    assert.equal(slugs.length, 3);
  });

  it("draft post is not generated as a route", () => {
    if (!existsSync(DIST_BLOG)) return;
    const slugs = listDirs(DIST_BLOG);
    assert.ok(
      !slugs.includes("draft-post"),
      "draft post must not have a generated route",
    );
  });

  it("blog index (/writing) does not list the draft post", () => {
    const writingPath = join(ROOT, "dist/writing/index.html");
    if (!existsSync(writingPath)) return;
    const html = readFileSync(writingPath, "utf-8");
    assert.ok(
      !/draft-post/i.test(html),
      "draft post slug must not appear in /writing index",
    );
    assert.ok(
      !/Draft post/i.test(html),
      "draft post title must not appear in /writing index",
    );
  });
});
