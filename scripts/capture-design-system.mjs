// Phase 1 evidence capture: light + dark side-by-side at 1280x800
// showing the design system tokens. Uses scripts/tokens/index.html as a
// standalone showcase (no Astro runtime needed for screenshot artifact).
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "armada", "screenshots", "portfolio-redesign");
const TMP = join(OUT, "_tmp");
const TOKENS_DIR = join(__dirname, "tokens");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function startStaticServer(dir, port) {
  const server = http.createServer((req, res) => {
    let url = req.url.split("?")[0];
    if (url === "/") url = "/index.html";
    const safe = url.replace(/\.\./g, "");
    const filePath = join(dir, safe);
    try {
      const st = statSync(filePath);
      if (!st.isFile()) throw new Error("not a file");
      const ext = filePath.slice(filePath.lastIndexOf("."));
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(readFileSync(filePath));
    } catch (e) {
      res.writeHead(404);
      res.end("not found");
    }
  });
  server.listen(port, "127.0.0.1");
  return server;
}

async function captureTheme(browser, theme, base) {
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  const page = await ctx.newPage();
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
    } catch (e) {}
  }, theme);
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(700);
  const file = join(TMP, `tokens-${theme}.png`);
  await page.screenshot({ path: file, fullPage: false });
  await ctx.close();
  return file;
}

async function compose(lightPath, darkPath, outPath) {
  const sharp = (await import("sharp")).default;
  if (sharp) {
    const left = await sharp(lightPath).resize(640, 800).toBuffer();
    const right = await sharp(darkPath).resize(640, 800).toBuffer();
    await sharp({
      create: {
        width: 1280,
        height: 800,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        { input: left, left: 0, top: 0 },
        { input: right, left: 640, top: 0 },
      ])
      .png()
      .toFile(outPath);
    return;
  }
  throw new Error("sharp not available");
}

async function main() {
  await mkdir(TMP, { recursive: true });
  const server = startStaticServer(TOKENS_DIR, 4323);
  const base = "http://127.0.0.1:4323";
  try {
    const browser = await chromium.launch();
    try {
      const light = await captureTheme(browser, "light", base);
      const dark = await captureTheme(browser, "dark", base);
      const final = join(OUT, "design-system.png");
      await compose(light, dark, final);
      console.log(`saved ${final}`);
    } finally {
      await browser.close();
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
