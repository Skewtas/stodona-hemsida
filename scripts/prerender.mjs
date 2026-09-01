// Förrendering (SSG) av de viktigaste publika sidorna så att AI-crawlers och
// sökrobotar utan JavaScript ser riktigt innehåll, per-sida-titlar och JSON-LD.
//
// Kör: node scripts/prerender.mjs   (efter `vite build`)
// - Startar en liten statisk server över dist/ (SPA-fallback).
// - Driver din installerade Chrome (channel: "chrome"); på Vercel faller den
//   tillbaka till Playwrights egen Chromium.
// - Skriver dist/<route>/index.html med den färdig-renderade HTML:en.
//
// Routes läses från package.json → reactSnap.include (en enda källa).
import { chromium } from "playwright";
import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PORT = 4318;

const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const ROUTES = (pkg.reactSnap && pkg.reactSnap.include) || ["/"];

const MIME = {
  ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".mp4": "video/mp4", ".ico": "image/x-icon", ".txt": "text/plain",
  ".xml": "application/xml", ".woff": "font/woff", ".woff2": "font/woff2",
};

// Basskalet hålls i minnet så att förrenderade filer aldrig serveras UNDER körningen.
const BASE_HTML = await readFile(join(DIST, "index.html"), "utf8");

const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent((req.url || "/").split("?")[0]);
  const ext = extname(p);
  if (ext) {
    const file = join(DIST, p);
    if (existsSync(file)) {
      try {
        const buf = await readFile(file);
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.end(buf);
        return;
      } catch { /* fall through */ }
    }
  }
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(BASE_HTML); // SPA-fallback
});
await new Promise((r) => server.listen(PORT, r));

let browser;
try {
  browser = await chromium.launch({ channel: "chrome", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  console.log("→ använder installerad Chrome");
} catch {
  browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  console.log("→ använder Playwright-Chromium");
}

const results = [];
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#root > *", { timeout: 20000 });
    // Scrolla igenom sidan så att whileInView-innehåll ritas ut (och lägg i DOM).
    await page.evaluate(() => new Promise((res) => {
      let y = 0;
      const tick = () => {
        window.scrollTo(0, y); y += 700;
        if (y < document.body.scrollHeight) setTimeout(tick, 25);
        else { window.scrollTo(0, 0); setTimeout(res, 250); }
      };
      tick();
    }));
    await page.waitForTimeout(400); // låt seo.tsx uppdatera <head>
    const html = await page.content();
    const h2 = (html.match(/<h2/g) || []).length;
    results.push({ route, html });
    console.log(`✓ ${route}  (${(html.length / 1024).toFixed(0)} kB, ${h2} h2)`);
  } catch (e) {
    console.error(`✗ ${route}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();

// Skriv filerna SIST (så basskalet var orört under körningen).
for (const { route, html } of results) {
  const outDir = route === "/" ? DIST : join(DIST, route);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "index.html"), html, "utf8");
}
console.log(`\nFörrenderade ${results.length}/${ROUTES.length} sidor → dist/`);
if (results.length === 0) process.exit(1);
