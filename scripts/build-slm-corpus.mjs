// Build /portable-slm/corpus/: the documents the on-device assistant retrieves from.
//
// The earlier approach handed the assistant one 8 KB digest with every summary clipped to a few hundred
// characters, so the cap decided what it could know about the site. This emits one document per project,
// per published post and for the current /now entry, carrying their actual text, and writes a list of them
// for the manifest. Retrieval then returns the two or three sections that match a question instead of a
// pre-chewed summary of everything.
//
// Each document is the text itself. A trailing "Page: https://..." line used to name the source, and it made
// `page` and `source` into query terms pointing at metadata: asked "what is this page about", retrieval
// returned those tails and the model correctly reported that it had been given links and titles. The section
// label already names the document, which is where provenance belongs.
//
// It also writes corpus.json: the document list and a content hash. The hash is the manifest's
// corpusVersion, so an index is rebuilt when the content changes and not when it does not.
//
// No emojis here, per the repository conventions.
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const OUT = "public/portable-slm/corpus";
const isoDay = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10));

const readCollection = (dir) =>
  readdirSync(join("src/content", dir))
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const { data, content } = matter(readFileSync(join("src/content", dir, name), "utf8"));
      return { ...data, slug: name.replace(/\.md$/, ""), body: content.trim() };
    });

const projects = readCollection("projects").sort((left, right) => right.year - left.year);
const posts = readCollection("blog")
  .filter((post) => !post.draft)
  .sort((left, right) => right.pubDate - left.pubDate);
const now = readCollection(".").find((entry) => entry.slug === "now");

// The authored part of slm/site.md: who this is, how to reach him, and the rules that keep answers honest.
// The digest that used to be appended here is exactly what retrieval replaces.
const authored = readFileSync("slm/site.md", "utf8")
  .replace(/^<!--[\s\S]*?-->\s*/m, "")
  .split(/^---\s*$/m)[0]
  .trim();

const documents = [
  {
    path: "about.md",
    label: "about",
    text: authored,
  },
  ...projects.map((project) => ({
    path: `work/${project.slug}.md`,
    label: `work/${project.slug}`,
    text: [
      `# ${project.title}`,
      `${project.year}${project.period ? `, ${project.period}` : ""}${project.domain ? `, ${project.domain}` : ""}`,
      project.summary || "",
      project.body || "",
      project.links?.length ? `Links: ${project.links.map((link) => `${link.label} ${link.url}`).join(", ")}` : "",
    ].filter(Boolean).join("\n\n"),
  })),
  ...posts.map((post) => ({
    path: `writing/${post.slug}.md`,
    label: `writing/${post.slug}`,
    text: [
      `# ${post.title}`,
      `Published ${isoDay(post.pubDate)}`,
      post.description || "",
      post.body || "",
    ].filter(Boolean).join("\n\n"),
  })),
  ...(now ? [{
    path: "now.md",
    label: "now",
    text: `# What he is working on now\n\n${now.body}`,
  }] : []),
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const doc of documents) {
  const target = join(OUT, doc.path);
  mkdirSync(join(target, ".."), { recursive: true });
  writeFileSync(target, `${doc.text.trim()}\n`);
}

// The corpus version is a hash of the content, so it changes when the content does and is stable when it
// does not. A date would rebuild every index on every deploy.
const version = createHash("sha256")
  .update(documents.map((doc) => `${doc.path}\n${doc.text}`).join("\n"))
  .digest("hex")
  .slice(0, 16);

writeFileSync("public/portable-slm/corpus.json", `${JSON.stringify({
  version,
  documents: documents.map((doc) => ({ url: `/portable-slm/corpus/${doc.path}`, label: doc.label })),
}, null, 2)}\n`);

const bytes = documents.reduce((sum, doc) => sum + Buffer.byteLength(doc.text), 0);
console.log(`slm corpus -> ${OUT}: ${documents.length} documents, ${(bytes / 1024).toFixed(0)} KB, version ${version}`);
