// GENERERAD FIL – ändra inte för hand.
// Skapas av scripts/fetch-prices.mjs, som körs före varje bygge och hämtar
// priserna ur boka.stodona.se/api/calculate-price. Vill du ändra ett pris
// gör du det i prismotorn, inte här.
//
// Hemstädning i Stockholm, per städtillfälle, inklusive moms och efter
// RUT-avdrag. Hämtat 2026-09-10.

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
  { sqm: 45, utanBindning: 941, m3: 906, m6: 881, m12: 855, arsbesparing: 2236, tillfallenPerAr: 26 },
  { sqm: 65, utanBindning: 1098, m3: 1057, m6: 1028, m12: 998, arsbesparing: 2600, tillfallenPerAr: 26 },
  { sqm: 70, utanBindning: 1255, m3: 1208, m6: 1175, m12: 1140, arsbesparing: 2990, tillfallenPerAr: 26 },
  { sqm: 85, utanBindning: 1255, m3: 1208, m6: 1175, m12: 1140, arsbesparing: 2990, tillfallenPerAr: 26 },
  { sqm: 100, utanBindning: 1412, m3: 1358, m6: 1322, m12: 1283, arsbesparing: 3354, tillfallenPerAr: 26 },
  { sqm: 110, utanBindning: 1569, m3: 1509, m6: 1469, m12: 1425, arsbesparing: 3744, tillfallenPerAr: 26 },
  { sqm: 140, utanBindning: 1726, m3: 1660, m6: 1616, m12: 1568, arsbesparing: 4108, tillfallenPerAr: 26 },
  { sqm: 150, utanBindning: 1726, m3: 1660, m6: 1616, m12: 1568, arsbesparing: 4108, tillfallenPerAr: 26 },
];

export const PRISER_VARJE_VECKA: Prisrad[] = [
  { sqm: 70, utanBindning: 1153, m3: 1110, m6: 1080, m12: 1048, arsbesparing: 5460, tillfallenPerAr: 52 },
];

/** Slår upp en yta, eller närmast mindre om ytan saknas. */
export function prisFor(sqm: number, rader: Prisrad[] = PRISER_VARANNAN_VECKA): Prisrad {
  const exakt = rader.find((r) => r.sqm === sqm);
  if (exakt) return exakt;
  const sorterade = [...rader].sort((a, b) => a.sqm - b.sqm);
  return sorterade.reduce((bast, r) => (r.sqm <= sqm ? r : bast), sorterade[0]);
}

export const PRIS_HAMTAT = "2026-09-10";
