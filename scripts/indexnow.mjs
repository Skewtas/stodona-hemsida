// IndexNow – pinga Bing/Copilot m.fl. med uppdaterade URL:er.
// Körs automatiskt efter varje Vercel-bygge (postbuild, med flaggan --if-vercel)
// och kan även köras manuellt:  bun scripts/indexnow.mjs
import { readFileSync } from "node:fs";

const HOST = "stodona.se";
const KEY = "6aeae4a965c8d92ef79b3c80f54311c5";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Vid postbuild skickas --if-vercel: kör bara i Vercel-byggmiljön, hoppa över
// lokala bygg så vi inte pingar i onödan under utveckling.
if (process.argv.includes("--if-vercel") && !process.env.VERCEL) {
  console.log("IndexNow: hoppar över (inte ett Vercel-bygge).");
  process.exit(0);
}

async function ping() {
  const xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Försök två gånger – IndexNow kan svara 403 övergående precis efter deploy.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
    });
    console.log(`IndexNow (försök ${attempt}): ${res.status} ${res.statusText} – ${urls.length} URL:er`);
    if (res.ok) return;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 3000));
  }
}

try {
  await ping();
} catch (e) {
  console.log("IndexNow-fel (ignoreras – fäller aldrig bygget):", e.message);
}
// Avsluta alltid utan fel så att ett IndexNow-problem aldrig kan stoppa en deploy.
process.exit(0);
