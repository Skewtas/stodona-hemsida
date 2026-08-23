// IndexNow – pinga Bing/Yandex/Copilot m.fl. med uppdaterade URL:er.
// Kör efter deploy:  bun scripts/indexnow.mjs   (eller: node scripts/indexnow.mjs)
// Läser public/sitemap.xml och skickar alla loc-URL:er till IndexNow.
import { readFileSync } from "node:fs";

const HOST = "stodona.se";
const KEY = "6aeae4a965c8d92ef79b3c80f54311c5";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
});
console.log("IndexNow:", res.status, res.statusText, "–", urls.length, "URL:er skickade");
