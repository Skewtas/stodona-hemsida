// Förrendering (SSG) av de viktigaste publika sidorna så att AI-crawlers och
// sökrobotar utan JavaScript ser riktigt innehåll, per-sida-titlar och JSON-LD.
//
// Kör: node scripts/prerender.mjs   (efter `vite build`)
// - Startar en liten statisk server över dist/ (SPA-fallback).
// - På Vercel: puppeteer-core + @sparticuz/chromium (fungerar i byggmiljön).
//   Lokalt: puppeteer-core + din installerade Google Chrome.
// - Skriver dist/<route>/index.html med den färdig-renderade HTML:en.
//
// Routes läses från package.json → reactSnap.include (en enda källa).
import puppeteer from "puppeteer-core";
import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PORT = 4318;

const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));

// Routes = allt i sitemap.xml (en enda sanningskälla för vad som ska indexeras)
// unionerat med package.json → reactSnap.include. Varje URL i sitemapen MÅSTE
// förrenderas: annars serveras SPA-fallbacken (= startsidans HTML) till robotar
// utan JavaScript, vilket ger fel canonical, fel titel och duplicerat innehåll.
async function sitemapRoutes() {
  const file = join(ROOT, "public", "sitemap.xml");
  if (!existsSync(file)) return [];
  const xml = await readFile(file, "utf8");
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
    .map((m) => {
      try { return new URL(m[1]).pathname; } catch { return null; }
    })
    .filter((p) => p && p.startsWith("/"))
    .map((p) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p));
}

const ROUTES = [...new Set([
  "/",
  ...(await sitemapRoutes()),
  ...((pkg.reactSnap && pkg.reactSnap.include) || []),
])];
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 3);

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

// Välj webbläsare: Vercel/CI → @sparticuz/chromium, lokalt → installerad Chrome.
const serverless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let launchOpts;
if (serverless) {
  const chromium = (await import("@sparticuz/chromium")).default;
  launchOpts = {
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: await chromium.executablePath(),
    headless: true,
  };
  console.log("→ Vercel: @sparticuz/chromium");
} else {
  const candidates = process.platform === "darwin"
    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];
  const exe = process.env.CHROME_PATH || candidates.find((c) => existsSync(c));
  if (!exe) throw new Error("Ingen lokal Chrome hittad – sätt CHROME_PATH");
  launchOpts = { executablePath: exe, args: ["--no-sandbox", "--disable-setuid-sandbox"], headless: true };
  console.log("→ lokalt: " + exe);
}

const browser = await puppeteer.launch(launchOpts);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const queue = [...ROUTES];
let done = 0;

async function renderRoute(route) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector("#root > *", { timeout: 20000 });
    // Scrolla igenom sidan så att whileInView-innehåll ritas ut (och hamnar i DOM).
    await page.evaluate(() => new Promise((res) => {
      let y = 0;
      const tick = () => {
        window.scrollTo(0, y); y += 700;
        if (y < document.body.scrollHeight) setTimeout(tick, 25);
        else { window.scrollTo(0, 0); setTimeout(res, 250); }
      };
      tick();
    }));
    await wait(700); // låt seo.tsx uppdatera <head> och animationer landa

    // Motion sätter sitt initial-läge som inline-style (opacity: 0). Element vars
    // animation inte hann bli klar innan snapshotten fryses annars in som OSYNLIGA
    // i den statiska HTML:en – besökare utan (eller före) JS ser en tom sida.
    // Vi rensar därför bort kvarvarande initial-styles före capture.
    const unhidden = await page.evaluate(() => {
      // Frys rAF först. Annars hinner motion skriva tillbaka sitt initial-läge
      // mellan städningen och capturen på sidor där animationen är mitt i steget.
      window.requestAnimationFrame = () => 0;
      let n = 0;
      for (const el of document.querySelectorAll('[style*="opacity"]')) {
        const style = el.getAttribute('style') || '';
        if (!/opacity:\s*0(\D|$)/.test(style)) continue;
        // Rör inte det som är dolt på riktigt (t.ex. stängda dialoger).
        if (el.hasAttribute('hidden') || /display:\s*none/.test(style)) continue;
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        if (!el.getAttribute('style')) el.removeAttribute('style');
        n++;
      }
      return n;
    });

    const html = await page.content();
    const h2 = (html.match(/<h2/g) || []).length;
    const stillHidden = (html.match(/opacity:\s*0(?!\.)/g) || []).length;
    results.push({ route, html });
    console.log(
      `✓ ${++done}/${ROUTES.length} ${route}  (${(html.length / 1024).toFixed(0)} kB, ${h2} h2` +
      `${unhidden ? `, ${unhidden} synliggjorda` : ""}${stillHidden ? `, ⚠ ${stillHidden} kvar dolda` : ""})`
    );
  } catch (e) {
    done++;
    console.error(`✗ ${route}: ${e.message}`);
  } finally {
    await page.close();
  }
}

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let route = queue.shift(); route; route = queue.shift()) await renderRoute(route);
  })
);

await browser.close();
server.close();

// Skriv filerna SIST (så basskalet var orört under körningen).
// app.html = det orörda SPA-skalet. Vercels SPA-fallback pekar hit i stället för
// index.html (som nu innehåller den förrenderade STARTSIDAN) – annars skulle varje
// icke-förrenderad URL svara med startsidans innehåll och canonical.
await writeFile(join(DIST, "app.html"), BASE_HTML, "utf8");

for (const { route, html } of results) {
  const outDir = route === "/" ? DIST : join(DIST, route);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "index.html"), html, "utf8");
}
console.log(`\nFörrenderade ${results.length}/${ROUTES.length} sidor → dist/`);
const missing = ROUTES.filter((r) => !results.some((x) => x.route === r));
if (missing.length) console.warn(`⚠ Saknar förrendering (serveras som tomt SPA-skal): ${missing.join(", ")}`);
if (results.length === 0) process.exit(1);
