import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { highlightSchema, highlightsArraySchema } from "../src/content/schema.ts";

const loadJson = (name: string) =>
  JSON.parse(
    readFileSync(join(import.meta.dirname, "..", "src", "content", name), "utf-8")
  );

describe("highlightSchema", () => {
  it("parses a valid entry with all fields", () => {
    const entry = {
      type: "paper",
      title: "Test Paper",
      url: "https://example.com",
      date: "2025-01-15",
      description: "A test",
      venue: "ICLR 2025",
    };
    const result = highlightSchema.safeParse(entry);
    assert.ok(result.success, `Expected success, got ${JSON.stringify(result.error)}`);
  });

  it("parses a valid entry with only required fields", () => {
    const entry = {
      type: "blog",
      title: "My Blog",
      url: "https://example.com/blog",
    };
    const result = highlightSchema.safeParse(entry);
    assert.ok(result.success);
  });

  it("rejects entry missing title", () => {
    const entry = {
      type: "talk",
      url: "https://example.com/talk",
    };
    const result = highlightSchema.safeParse(entry);
    assert.ok(!result.success);
  });

  it("rejects invalid type value", () => {
    const entry = {
      type: "invalid",
      title: "Bad Type",
      url: "https://example.com",
    };
    const result = highlightSchema.safeParse(entry);
    assert.ok(!result.success);
  });

  it("rejects missing url", () => {
    const entry = {
      type: "repo",
      title: "No URL",
    };
    const result = highlightSchema.safeParse(entry);
    assert.ok(!result.success);
  });
});

describe("highlightsArraySchema", () => {
  it("parses the seed data successfully", () => {
    const raw = loadJson("highlights.json");
    const result = highlightsArraySchema.safeParse(raw);
    assert.ok(result.success, `Expected success, got ${JSON.stringify(result.error?.issues)}`);
  });
});
