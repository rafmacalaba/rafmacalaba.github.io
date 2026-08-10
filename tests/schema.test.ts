import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { blogSchema, projectsSchema, nowSchema } from "../src/content/schema.ts";

describe("blogSchema", () => {
  it("parses a valid post with required fields", () => {
    const result = blogSchema.safeParse({
      title: "Hello",
      description: "First post.",
      pubDate: "2026-07-22",
    });
    assert.ok(result.success, JSON.stringify(result.error?.issues));
    if (result.success) {
      assert.equal(result.data.draft, false);
      assert.ok(result.data.pubDate instanceof Date);
    }
  });

  it("parses optional fields when present", () => {
    const result = blogSchema.safeParse({
      title: "Hello",
      description: "First post.",
      pubDate: "2026-07-22",
      updatedDate: "2026-08-01",
      tags: ["research", "meta"],
      draft: true,
    });
    assert.ok(result.success, JSON.stringify(result.error?.issues));
    if (result.success) {
      assert.equal(result.data.draft, true);
      assert.deepEqual(result.data.tags, ["research", "meta"]);
    }
  });

  it("rejects missing title", () => {
    const result = blogSchema.safeParse({
      description: "no title",
      pubDate: "2026-07-22",
    });
    assert.ok(!result.success);
  });

  it("rejects missing description", () => {
    const result = blogSchema.safeParse({
      title: "no desc",
      pubDate: "2026-07-22",
    });
    assert.ok(!result.success);
  });

  it("rejects missing pubDate", () => {
    const result = blogSchema.safeParse({
      title: "no date",
      description: "no date",
    });
    assert.ok(!result.success);
  });
});

describe("projectsSchema", () => {
  it("parses a valid project with required fields", () => {
    const result = projectsSchema.safeParse({
      title: "Project A",
      domain: "research",
      year: 2025,
      summary: "A research project.",
      links: [{ label: "Repo", url: "https://example.com/repo" }],
    });
    assert.ok(result.success, JSON.stringify(result.error?.issues));
    if (result.success) {
      assert.equal(result.data.featured, false);
      assert.equal(result.data.status, undefined);
    }
  });

  it("parses optional fields when present", () => {
    const result = projectsSchema.safeParse({
      title: "Project B",
      domain: "engineering",
      year: 2024,
      summary: "An engineering project.",
      links: [
        { label: "Repo", url: "https://example.com/repo" },
        { label: "Docs", url: "https://example.com/docs" },
      ],
      featured: true,
      status: "active",
    });
    assert.ok(result.success, JSON.stringify(result.error?.issues));
    if (result.success) {
      assert.equal(result.data.featured, true);
      assert.equal(result.data.status, "active");
    }
  });

  it("rejects invalid domain", () => {
    const result = projectsSchema.safeParse({
      title: "Bad domain",
      domain: "marketing",
      year: 2025,
      summary: "out of domain",
      links: [{ label: "x", url: "https://example.com" }],
    });
    assert.ok(!result.success);
  });

  it("rejects empty links array", () => {
    const result = projectsSchema.safeParse({
      title: "No links",
      domain: "policy",
      year: 2025,
      summary: "no links",
      links: [],
    });
    assert.ok(!result.success);
  });

  it("rejects non-URL link", () => {
    const result = projectsSchema.safeParse({
      title: "Bad url",
      domain: "policy",
      year: 2025,
      summary: "bad url",
      links: [{ label: "x", url: "not-a-url" }],
    });
    assert.ok(!result.success);
  });

  it("rejects missing summary", () => {
    const result = projectsSchema.safeParse({
      title: "no summary",
      domain: "research",
      year: 2025,
      links: [{ label: "x", url: "https://example.com" }],
    });
    assert.ok(!result.success);
  });
});

describe("nowSchema", () => {
  it("parses a valid now doc", () => {
    const result = nowSchema.safeParse({ updated: "2026-08-10" });
    assert.ok(result.success, JSON.stringify(result.error?.issues));
    if (result.success) {
      assert.ok(result.data.updated instanceof Date);
    }
  });

  it("rejects missing updated", () => {
    const result = nowSchema.safeParse({});
    assert.ok(!result.success);
  });
});
