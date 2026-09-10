// Hämtar priser ur bokningssystemets prismotor och skriver dem till
// src/data/prices.generated.ts, som prissidan och abonnemangssidan importerar.
//
// Körs före vite build. Poängen är att sajtens priser aldrig ska kunna glida
// isär från vad kunden faktiskt debiteras – det gjorde de tidigare, med belopp
// två till tre gånger under prismotorns.
//
// Skriptet får ALDRIG fälla bygget. Går prismotorn inte att nå behålls den
// senast genererade filen, som är incheckad i repot.

import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "prices.generated.ts");
const API = "https://boka.stodona.se/api/calculate-price";

// Ytorna som används i tabellerna och i löptexten på de två sidorna.
const YTOR_VARANNAN = [45, 65, 70, 85, 100, 110, 140, 150];
const YTOR_VARJE = [70];

async function pris(sqm, frequency) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: "Hemstädning",
      postalCode: "11122",
      streetAddress: "Drottninggatan 1",
      sqm,
      frequency,
      extraServices: [],
      useRut: true,
      bindingMonths: 0,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${sqm} kvm ${frequency}: HTTP ${res.status}`);
  const data = await res.json();
  const perBindning = Object.fromEntries(
    (data.bindingOptions || []).map((o) => [o.months, o])
  );
  if (!perBindning[0] || !perBindning[12]) {
    throw new Error(`${sqm} kvm ${frequency}: bindingOptions saknas`);
  }
  return {
    sqm,
    frequency,
    utanBindning: perBindning[0].price,
    m3: perBindning[3]?.price ?? perBindning[0].price,
    m6: perBindning[6]?.price ?? perBindning[0].price,
    m12: perBindning[12].price,
    // Vad 12 månaders bindning sparar över hela perioden.
    arsbesparing: perBindning[12].totalSavingKr ?? 0,
    tillfallenPerAr: perBindning[12].occurrences ?? 0,
  };
}

function tsFil(varannan, varje) {
  const rad = (p) =>
    `  { sqm: ${p.sqm}, utanBindning: ${p.utanBindning}, m3: ${p.m3}, m6: ${p.m6}, m12: ${p.m12}, arsbesparing: ${p.arsbesparing}, tillfallenPerAr: ${p.tillfallenPerAr} },`;
  return `// GENERERAD FIL – ändra inte för hand.
// Skapas av scripts/fetch-prices.mjs, som körs före varje bygge och hämtar
// priserna ur boka.stodona.se/api/calculate-price. Vill du ändra ett pris
// gör du det i prismotorn, inte här.
//
// Hemstädning i Stockholm, per städtillfälle, inklusive moms och efter
// RUT-avdrag. Hämtat ${new Date().toISOString().slice(0, 10)}.

export interface Prisrad {
  sqm: number;
  utanBindning: number;
  m3: number;
  m6: number;
  m12: number;
  /** Vad 12 månaders bindning sparar över hela bindningsperioden. */
  arsbesparing: number;
  tillfallenPerAr: number;
}

export const PRISER_VARANNAN_VECKA: Prisrad[] = [
${varannan.map(rad).join("\n")}
];

export const PRISER_VARJE_VECKA: Prisrad[] = [
${varje.map(rad).join("\n")}
];

/** Slår upp en yta, eller närmast mindre om ytan saknas. */
export function prisFor(sqm: number, rader: Prisrad[] = PRISER_VARANNAN_VECKA): Prisrad {
  const exakt = rader.find((r) => r.sqm === sqm);
  if (exakt) return exakt;
  const sorterade = [...rader].sort((a, b) => a.sqm - b.sqm);
  return sorterade.reduce((bast, r) => (r.sqm <= sqm ? r : bast), sorterade[0]);
}

export const PRIS_HAMTAT = "${new Date().toISOString().slice(0, 10)}";
`;
}

try {
  const varannan = [];
  for (const sqm of YTOR_VARANNAN) varannan.push(await pris(sqm, "Varannan vecka"));
  const varje = [];
  for (const sqm of YTOR_VARJE) varje.push(await pris(sqm, "Varje vecka"));

  const ny = tsFil(varannan, varje);
  const gammal = existsSync(OUT) ? await readFile(OUT, "utf8") : "";

  // Jämför utan datumraderna, så att ett bygge utan prisändring inte ger diff.
  const utanDatum = (s) => s.replace(/Hämtat \d{4}-\d{2}-\d{2}/, "").replace(/PRIS_HAMTAT = "[^"]*"/, "");
  if (utanDatum(ny) === utanDatum(gammal)) {
    console.log(`Priser: oförändrade (${varannan.length + varje.length} uppslag).`);
  } else {
    await writeFile(OUT, ny, "utf8");
    console.log(`Priser: uppdaterade från prismotorn (${varannan.length + varje.length} uppslag).`);
    for (const p of varannan) {
      console.log(`  ${p.sqm} kvm varannan vecka: ${p.utanBindning} kr → ${p.m12} kr med 12 mån`);
    }
  }
} catch (err) {
  // Fail open: hellre gårdagens priser än ett trasigt bygge.
  const finns = existsSync(OUT);
  console.warn(`⚠ Kunde inte hämta priser: ${err.message}`);
  console.warn(finns ? "  Behåller senast genererade priser." : "  INGEN prisfil finns – bygget kommer att fela.");
  if (!finns) process.exit(1);
}
