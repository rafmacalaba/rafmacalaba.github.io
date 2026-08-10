// Phase 4 evidence capture: blog post page at 1280px desktop.
import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "armada", "screenshots", "portfolio-redesign");

const PORT = "4325";
const BASE = `http://localhost:${PORT}`;

function startPreview() {
  return spawn("npx", ["astro", "preview", "--port", PORT], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, HOST: "127.0.0.1" },
  });
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server not ready: ${url}`);
}

async function main() {
  const preview = startPreview();
  preview.stdout.on("data", () => {});
  preview.stderr.on("data", () => {});
  try {
    await waitForServer(`${BASE}/`);
    const browser = await chromium.launch();
    try {
      const ctx = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        colorScheme: "light",
      });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/blog/why-i-publish-a-now-page/`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(500);
      const file = join(OUT, "blog-post.png");
      await page.screenshot({ path: file, fullPage: false });
      console.log(`saved ${file}`);
      await ctx.close();
    } finally {
      await browser.close();
    }
  } finally {
    preview.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
