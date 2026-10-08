// Assemble everything served from /portable-slm/: the SDK's bundle subset, this site's manifest, and the
// generated grounding document.
//
// One entry point for local development and CI, so the two cannot drift. The bundle comes from a
// portable-slm checkout (SLM_SRC, sibling by default); the manifest and slm/site.md are this repo's, and
// they win over anything the pack generates.
//
// No emojis here, per the repository conventions.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";
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
copyFileSync("slm/portable-slm.host.json", `${OUT}/portable-slm.host.json`);

console.log(`/portable-slm ready in ${OUT}`);
