// Assemble everything served from /portable-slm/: the SDK's bundle subset, this site's manifest, and the
// generated grounding document.
//
// One entry point for local development and CI, so the two cannot drift. The bundle comes from a
// portable-slm checkout (SLM_SRC, sibling by default); the manifest and slm/site.md are this repo's, and
// they win over anything the pack generates.
//
// No emojis here, per the repository conventions.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SLM_SRC = resolve(process.env.SLM_SRC ?? "../portable-slm");
const OUT = resolve("public/portable-slm");

if (!existsSync(`${SLM_SRC}/dist/embed.js`)) {
  console.error(`no built bundle at ${SLM_SRC}/dist/embed.js`);
  console.error("run `npm ci && npm run build:embed` in the portable-slm checkout first.");
  process.exit(1);
}

// The pack wipes and rewrites its output directory, so nothing of this site's may live only there.
rmSync(OUT, { recursive: true, force: true });
execFileSync(process.execPath, [`${SLM_SRC}/tools/site-pack.mjs`, "--out", OUT, "--runtimes", "onnx"], { stdio: "inherit" });

// Grounding from this repo's content, then this repo's manifest over the pack's template: the manifest is
// version-controlled here, so it is the source of truth rather than a generated starting point.
execFileSync(process.execPath, ["scripts/build-slm-grounding.mjs"], { stdio: "inherit" });
// The retrieval corpus: one document per project, post and /now entry, plus the list of them and a content
// hash derived from that content.
execFileSync(process.execPath, ["scripts/build-slm-corpus.mjs"], { stdio: "inherit" });

// The document list and the corpus version are derived from content, so they are injected rather than
// hand-maintained. Everything else in the manifest stays hand-written and reviewable.
const corpus = JSON.parse(readFileSync(`${OUT}/corpus.json`, "utf8"));
const withCorpus = (manifest) => ({
  ...manifest,
  context: { ...manifest.context, documents: corpus.documents },
  retrieval: { ...manifest.retrieval, corpusVersion: corpus.version },
});
for (const name of ["portable-slm", "keyword", "quality"]) {
  const manifest = withCorpus(JSON.parse(readFileSync(`slm/${name}.host.json`, "utf8")));
  writeFileSync(`${OUT}/${name}.host.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  copyFileSync(`slm/${name}.host.json`, `${OUT}/${name}.source.json`);
  rmSync(`${OUT}/${name}.source.json`, { force: true });
  console.log(`manifest -> ${OUT}/${name}.host.json: ${corpus.documents.length} documents, embedder ${manifest.retrieval.embedder}`);
}

console.log(`/portable-slm ready in ${OUT}`);
