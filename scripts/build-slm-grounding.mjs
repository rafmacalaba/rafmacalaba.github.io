// Build /portable-slm/site.md: the document the site's on-device assistant answers from.
//
// The assistant reads one bounded file rather than fetching pages, because a static host has no endpoint
// that can shape a page into context. So the file has to stay current, and the content collections are
// the source of truth: this reads slm/site.md (the authored part, including the rules that keep answers
// honest) and appends a digest of every project, published post and the current /now entry.
//
// It is capped, because the manifest caps it anyway and a silent server-side cut would drop whatever
// happens to be last. Oldest writing is dropped first, and the outcome is printed so a shrinking digest
// shows up in the build log rather than being discovered later.
//
// No emojis here, per the repository conventions.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const CAP_BYTES = 8192;
const OUT = "public/portable-slm/site.md";
const SITE = "https://rafmacalaba.github.io";

const clipped = (text, max) => {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const stop = cut.lastIndexOf(" ");
  return `${stop > 0 ? cut.slice(0, stop) : cut}...`;
};

const isoDay = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10));

const readCollection = (dir) =>
  readdirSync(join("src/content", dir))
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const { data, content } = matter(readFileSync(join("src/content", dir, name), "utf8"));
      return { ...data, slug: name.replace(/\.md$/, ""), body: content };
    });

const projects = readCollection("projects").sort((left, right) => right.year - left.year);
const posts = readCollection("blog")
  .filter((post) => !post.draft)
  .sort((left, right) => right.pubDate - left.pubDate);
const now = readCollection(".").find((entry) => entry.slug === "now");

const authored = readFileSync("slm/site.md", "utf8").trim();

const projectBlocks = projects.map((project) =>
  [
    `### ${project.title} (${project.year}${project.period ? `, ${project.period}` : ""}, ${project.domain})`,
    clipped(project.summary, 320),
    project.links?.length ? `Links: ${project.links.map((link) => `${link.label} ${link.url}`).join(", ")}` : "",
    `Page: ${SITE}/work#project-${project.slug}`,
  ].filter(Boolean).join("\n"));

const postBlocks = posts.map((post) =>
  [
    `### ${post.title}`,
    `Published ${isoDay(post.pubDate)}: ${SITE}/blog/${post.slug}`,
    clipped(post.description, 240),
  ].join("\n"));

// Explicit parts, so dropping a section cannot take the wrong one with it.
const compose = (keptPosts) =>
  [
    authored,
    "---",
    "## Projects",
    projectBlocks.join("\n\n"),
    "## Writing",
    keptPosts.length ? keptPosts.join("\n\n") : "(older writing omitted to fit the size limit)",
    now ? "## What he is working on now" : "",
    now ? clipped(now.body, 1400) : "",
  ].filter(Boolean).join("\n\n");

let kept = postBlocks;
let body = compose(kept);
while (Buffer.byteLength(`${body}\n`, "utf8") > CAP_BYTES && kept.length > 0) {
  kept = kept.slice(0, kept.length - 1);
  body = compose(kept);
}
if (Buffer.byteLength(`${body}\n`, "utf8") > CAP_BYTES) {
  body = `${body.slice(0, CAP_BYTES - 64).trimEnd()}\n\n(truncated to fit the size limit)`;
}

mkdirSync("public/portable-slm", { recursive: true });
writeFileSync(OUT, `${body}\n`);

const dropped = postBlocks.length - kept.length;
console.log(`slm grounding -> ${OUT}: ${Buffer.byteLength(`${body}\n`, "utf8")} of ${CAP_BYTES} bytes, ${projects.length} projects, ${kept.length} of ${postBlocks.length} posts`);
if (dropped) console.log(`  dropped ${dropped} older post(s) to fit; shorten slm/site.md or raise maxBytes in slm/portable-slm.host.json`);
