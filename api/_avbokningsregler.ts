// Stodonas avbokningsregler – den enda källan chatten får räkna avgifter från.
//
// Beslutade av Mikaela 2026-09-24:
//  * Kostnadsfri av- eller ombokning fram till 48 timmar före start.
//  * Storstädning, flyttstädning och byggstädning: 5 dagar före start.
//  * Senare än så debiteras 50 % av bokningens kostnad.
//
// AI:n ser bara resultatet härifrån. Den räknar aldrig själv och får aldrig
// antyda att avgiften kan strykas.

export interface Regel {
  /** Kort namn som loggas, så det går att se exakt vilken regel som gällde. */
  id: string;
  fristTimmar: number;
  avgiftProcent: number;
  beskrivning: string;
}

const STANDARD: Regel = {
  id: 'standard-48h-50',
  fristTimmar: 48,
  avgiftProcent: 50,
  beskrivning: 'kostnadsfritt fram till 48 timmar före start, därefter 50 % av kostnaden',
};

const STORA_UPPDRAG: Regel = {
  id: 'stora-uppdrag-5d-50',
  fristTimmar: 5 * 24,
  avgiftProcent: 50,
  beskrivning: 'kostnadsfritt fram till 5 dagar före start, därefter 50 % av kostnaden',
};

const LANG_FRIST = ['storstädning', 'flyttstädning', 'byggstädning'];

export function regelFor(tjanst: string): Regel {
  return LANG_FRIST.includes(tjanst.trim().toLowerCase()) ? STORA_UPPDRAG : STANDARD;
}

export interface Bedomning {
  regel: Regel;
  timmarKvar: number;
  inomFrist: boolean;
  /** Avgiften i hela kronor enligt regeln. 0 när ändringen görs i tid. */
  avgiftKr: number;
}

/**
 * Bedömer en ändring av en bokning just nu.
 * @param startTid bokningens start som tidpunkt (ms)
 * @param prisKr bokningens kostnad för kunden, från bokningssystemet
 */
export function bedom(tjanst: string, startTid: number, prisKr: number, nu = Date.now()): Bedomning {
  const regel = regelFor(tjanst);
  const timmarKvar = (startTid - nu) / 3600000;
  const inomFrist = timmarKvar < regel.fristTimmar;
  const avgiftKr = inomFrist ? Math.round((prisKr * regel.avgiftProcent) / 100) : 0;
  return { regel, timmarKvar, inomFrist, avgiftKr };
}
