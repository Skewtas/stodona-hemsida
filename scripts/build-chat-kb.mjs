// Bygger chattbotens kunskapsbank ur sajtens egna sidor.
//
// Skriptet öppnar sidorna i en riktig webbläsare och plockar ut texten i
// <main>, så att boten svarar utifrån det som faktiskt står på stodona.se –
// inte ur en handskriven sammanfattning som kan glida isär från sidorna.
//
// Kör:  bun x vite --port 5173     (i en annan flik)
//       node scripts/build-chat-kb.mjs [http://localhost:5173]
//
// Resultatet hamnar i src/data/chatKunskap.generated.ts och ska committas.

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const BAS = process.argv[2] || "http://localhost:5173";
const MAX_TECKEN_PER_SIDA = 3500;

const SIDOR = [
  ["/hemstadning", "Hemstädning"],
  ["/flyttstadning", "Flyttstädning"],
  ["/storstadning", "Storstädning"],
  ["/fonsterputsning", "Fönsterputsning"],
  ["/foretagsstadning", "Företagsstädning"],
  ["/byggstadning", "Byggstädning"],
  ["/trappstadning", "Trappstädning"],
  ["/bodstadning", "Bodstädning"],
  ["/barnpassning", "Barnpassning"],
  ["/priser", "Priser"],
  ["/stadabonnemang", "Städabonnemang"],
  ["/rut-avdrag", "RUT-avdrag"],
  ["/e-faktura", "E-faktura"],
  ["/avbokning", "Avbokning och ombokning"],
  ["/villkor", "Villkor"],
  ["/sa-arbetar-vi", "Så arbetar vi"],
  ["/kvalitet-och-trygghet", "Kvalitet och trygghet"],
  ["/kundportalen", "Kundportalen"],
  ["/byta-stadbolag", "Byta städbolag"],
  ["/om-oss", "Om oss"],
  ["/kontakt", "Kontakt"],
  ["/faq", "Vanliga frågor"],
  ["/varva-en-van", "Värva en vän"],
  ["/presentkort", "Presentkort"],
];

const KROM = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => fs.existsSync(p));

if (!KROM) {
  console.error("Hittar ingen Chrome att köra. Avbryter utan att skriva över kunskapsbanken.");
  process.exit(1);
}

/** Klipper bort tomrader, dubbletter och sådant som bara är knapptext. */
function stada(text) {
  const rader = text
    .split("\n")
    .map((r) => r.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const sedda = new Set();
  const behall = [];
  for (const rad of rader) {
    if (rad.length < 2) continue;
    if (sedda.has(rad)) continue;
    sedda.add(rad);
    behall.push(rad);
  }
  return behall.join("\n").slice(0, MAX_TECKEN_PER_SIDA);
}

const webblasare = await puppeteer.launch({ executablePath: KROM, headless: true, args: ["--no-sandbox"] });
const sida = await webblasare.newPage();
await sida.setViewport({ width: 1280, height: 900 });

const avsnitt = [];
for (const [rutt, titel] of SIDOR) {
  try {
    await sida.goto(BAS + rutt, { waitUntil: "networkidle0", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 400));
    const rå = await sida.evaluate(() => document.querySelector("main")?.innerText || "");
    const text = stada(rå);
    if (text.length < 120) {
      console.warn(`⚠︎  ${rutt} gav bara ${text.length} tecken – hoppas över`);
      continue;
    }
    avsnitt.push({ rutt, titel, text });
    console.log(`✓  ${rutt} (${text.length} tecken)`);
  } catch (fel) {
    console.warn(`⚠︎  ${rutt} kunde inte läsas: ${fel.message}`);
  }
}
await webblasare.close();

if (avsnitt.length < SIDOR.length / 2) {
  console.error("För få sidor lästes in. Kunskapsbanken lämnas orörd.");
  process.exit(1);
}

const datum = new Date().toISOString().slice(0, 10);
const rader = [
  "// GENERERAD FIL – ändra inte för hand.",
  "// Skapas av scripts/build-chat-kb.mjs, som läser sidorna på sajten och sparar",
  "// texten i <main>. Kör om skriptet när sidorna ändrats:",
  "//   bun x vite --port 5173",
  "//   node scripts/build-chat-kb.mjs",
  "// Hämtat " + datum + " från " + avsnitt.length + " sidor.",
  "",
  "export interface Sidavsnitt {",
  "  rutt: string;",
  "  titel: string;",
  "  text: string;",
  "}",
  "",
  "export const SIDINNEHALL: Sidavsnitt[] = " + JSON.stringify(avsnitt, null, 2) + ";",
  "",
];
const fil = rader.join("\n");

const utfil = path.join(HÄR, "..", "src", "data", "chatKunskap.generated.ts");
fs.writeFileSync(utfil, fil);
const tecken = avsnitt.reduce((n, a) => n + a.text.length, 0);
console.log(`\nSkrev ${utfil} – ${avsnitt.length} sidor, ${tecken} tecken (~${Math.round(tecken / 3.5)} tokens).`);
