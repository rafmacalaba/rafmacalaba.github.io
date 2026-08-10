// Phase 3 evidence capture: mobile (375) + desktop (1280) for all 5 pages.
// Also captures a "Work filtered to research" screenshot for chip evidence.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "armada", "screenshots", "portfolio-redesign");

const PORT = "4324";
const BASE = `http://localhost:${PORT}`;

function startPreview() {
  const proc = spawn("npx", ["astro", "preview", "--port", PORT], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, HOST: "127.0.0.1" },
  });
  proc.stdout.on("data", (b) => process.stdout.write(`[preview] ${b}`));
  proc.stderr.on("data", (b) => process.stderr.write(`[preview] ${b}`));
  return proc;
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

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "work", path: "/work" },
  { slug: "writing", path: "/writing" },
  { slug: "about", path: "/about" },
  { slug: "now", path: "/now" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
];

async function capturePage(browser, page, viewport) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${page.path}`, { waitUntil: "networkidle", timeout: 30000 });
  await p.waitForTimeout(500);
  const file = join(OUT, `${page.slug}-${viewport.name}.png`);
  await p.screenshot({ path: file, fullPage: false });
  await ctx.close();
  return file;
}

async function captureWorkFiltered(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/work`, { waitUntil: "networkidle", timeout: 30000 });
  await p.waitForTimeout(500);
  await p.click("[data-filter-value='research']");
  await p.waitForTimeout(300);
  const file = join(OUT, "work-filtered-research.png");
  await p.screenshot({ path: file, fullPage: false });
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
      for (const page of PAGES) {
        for (const vp of VIEWPORTS) {
          const f = await capturePage(browser, page, vp);
          console.log(`saved ${f}`);
        }
      }
      const filtered = await captureWorkFiltered(browser);
      console.log(`saved ${filtered}`);
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
