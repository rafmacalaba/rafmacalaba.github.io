import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST_RSS = join(ROOT, "dist/rss.xml");

describe("RSS feed", () => {
  let xml = "";

  before(() => {
    if (!existsSync(DIST_RSS)) return;
    xml = readFileSync(DIST_RSS, "utf-8");
  });

  it("dist/rss.xml exists after build", () => {
    assert.ok(
      existsSync(DIST_RSS),
      "dist/rss.xml should exist after `npm run build`",
    );
  });

  it("emits one <item> per published post", () => {
    if (!existsSync(DIST_RSS)) return;
    const items = xml.match(/<item>/g) ?? [];
    assert.equal(items.length, 5);
  });

  it("items include title, description, pubDate, link", () => {
    if (!existsSync(DIST_RSS)) return;
    const items = xml.split("<item>").slice(1);
    for (const raw of items) {
      const item = raw.split("</item>")[0];
      assert.ok(/<title>/.test(item), "item must contain <title>");
      assert.ok(/<description>/.test(item), "item must contain <description>");
      assert.ok(/<pubDate>/.test(item), "item must contain <pubDate>");
      assert.ok(/<link>/.test(item), "item must contain <link>");
    }
  });

  it("draft post is excluded", () => {
    if (!existsSync(DIST_RSS)) return;
    assert.ok(
      !/draft-post/.test(xml),
      "draft post slug must not appear in rss.xml",
    );
    assert.ok(
      !/Draft post/i.test(xml),
      "draft post title must not appear in rss.xml",
    );
  });

  it("feed channel has title and description", () => {
    if (!existsSync(DIST_RSS)) return;
    assert.ok(/<title>/.test(xml), "channel must contain <title>");
    assert.ok(/<description/.test(xml), "channel must contain <description> element");
  });
});

after(() => {});
