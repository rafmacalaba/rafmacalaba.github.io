// Capture screenshots of the three built pages at two viewports.
// Uses astro preview on :4321. Assumes `npm run build` has already run.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "armada", "screenshots", "personal-portfolio");

const BASE = "http://localhost:4321";

const TARGETS = [
  { name: "home-desktop", path: "/", viewport: { width: 1280, height: 800 } },
  { name: "home-mobile", path: "/", viewport: { width: 375, height: 812 } },
  {
    name: "projects-desktop",
    path: "/projects",
    viewport: { width: 1280, height: 800 },
  },
  {
    name: "highlights-mobile",
    path: "/highlights",
    viewport: { width: 375, height: 812 },
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const t of TARGETS) {
      const ctx = await browser.newContext({
        viewport: t.viewport,
        deviceScaleFactor: 1,
        colorScheme: "light",
      });
      const page = await ctx.newPage();
      const url = `${BASE}${t.path}`;
      console.log(`> ${t.name}: ${url} @ ${t.viewport.width}x${t.viewport.height}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      // Give theme JS + fonts a beat to settle
      await page.waitForTimeout(300);
      const file = join(OUT, `${t.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`  saved ${file}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
