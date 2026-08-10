// Evidence capture for portfolio-content-2026-08: 4 pages, desktop only.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "armada", "screenshots", "portfolio-content-2026-08");

const PORT = "4325";
const BASE = `http://localhost:${PORT}`;

function startPreview() {
  const proc = spawn("npx", ["astro", "preview", "--port", PORT], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, HOST: "127.0.0.1" },
  });
  return proc;
}

async function waitForServer(url, timeoutMs = 30000) {
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

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "writing", path: "/writing" },
  { slug: "now", path: "/now" },
  { slug: "work", path: "/work" },
];

async function capture(browser, page) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${page.path}`, { waitUntil: "networkidle", timeout: 30000 });
  await p.waitForTimeout(500);
  const file = join(OUT, `${page.slug}.png`);
  await p.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return file;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const preview = startPreview();
  try {
    await waitForServer(`${BASE}/`);
    const browser = await chromium.launch();
    try {
      for (const pg of PAGES) {
        const f = await capture(browser, pg);
        console.log(`saved ${f}`);
      }
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
