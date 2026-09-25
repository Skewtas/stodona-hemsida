// TESTLÄGE: ett påhittat bokningssystem för självservicen i chatten.
//
// Inga riktiga bokningar, ingen riktig personal och inget anrop till
// TimeWave. Kundnamnen i testinloggningen är bara etiketter – bokningarna,
// adresserna och priserna nedan är påhittade, även för Mikaela Wigert
// (kund 15259). Varje chattsamtal får en egen värld som räknas fram från
// dagens datum, så att testare inte krockar med varandra och så att "på
// fredag" alltid finns. Ändringar sparas i samtalets värld i ett dygn.
//
// Schemat är byggt så att alla fall i första versionen går att prova:
//  * Mikaela Wigert (15259): hemstädning varannan måndag 08:00 med Maria.
//  * Anna Lind (1234): hemstädning varannan fredag 09:00 med Maria. Den
//    närmaste fredagen ligger oftast inom 48 timmar → avgift.
//  * Johan Berg (1235): storstädning om tre vardagar – inom 5-dagarsfristen.
//  * Maria nästa vecka: luckor mån–tis, frånvarande ons, ett ENGÅNGSUPPDRAG
//    (storstädning) tors eftermiddag och fullbokad fre.
//  * Maria veckan efter: fullbokad med återkommande kunder, utom ett
//    ENGÅNGSUPPDRAG tisdag förmiddag.
//  Engångsuppdragen visar förtursregeln: en återkommande kund får tiden, och
//  engångsuppdraget blir "Utan anställd".
//
// Knapparna i testlägets banderoll kan dessutom tvinga fram felfallen: tiden
// hinner bli upptagen, TimeWave svarar fel, eller ändringen går inte att
// verifiera efteråt. Varje simulering gäller ett försök.

import * as lagring from './_lagring';
import {
  type Anstalld,
  type Bokning,
  type Bokningssystem,
  type Engangsuppdrag,
  type Kund,
  type Lucka,
  idagSthlm,
  laggTillDagar,
  minuter,
  sthlmTidpunkt,
  tidText,
  veckodagNr,
} from './_bokningssystem';

export type Simulering = 'normal' | 'upptagen' | 'fel' | 'overifierad';
export const SIMULERINGAR: Simulering[] = ['normal', 'upptagen', 'fel', 'overifierad'];

interface Personal extends Anstalld {
  omraden: string[];
  kompetenser: string[];
}

interface Pass {
  id: string;
  kundId: string;
  /** Kundens namn – bara för andra kunders uppdrag, till mejlet om förtur. Visas aldrig i chatten. */
  kundNamn?: string;
  /** null = "Utan anställd". */
  stadareId: string | null;
  datum: string;
  start: string;
  slut: string;
  typ: 'uppdrag' | 'franvaro';
  tjanst?: string;
  omrade?: string;
  adress?: string;
  prisKr?: number;
  aterkommande?: boolean;
  avbokad?: boolean;
}

interface Varld {
  version: number;
  skapad: string;
  pass: Pass[];
  simulera: Simulering;
}

/** Höjs när testdatan ändras, så att sparade världar räknas om. */
const VARLD_VERSION = 2;
const VARLD_TTL = 24 * 3600;
const ARBETSDAG_START = '08:00';
const ARBETSDAG_SLUT = '17:00';
/** Restid och marginal före och efter varje uppdrag. */
const RESTID_MINUTER = 30;
const STEG_MINUTER = 30;

const PERSONAL: Personal[] = [
  { id: '5678', namn: 'Maria', omraden: ['Stockholm innerstad', 'Solna'], kompetenser: ['Hemstädning', 'Storstädning'] },
  { id: '5679', namn: 'Sara', omraden: ['Stockholm innerstad', 'Solna', 'Sundbyberg'], kompetenser: ['Hemstädning', 'Storstädning', 'Flyttstädning'] },
  { id: '5680', namn: 'Lena', omraden: ['Stockholm innerstad'], kompetenser: ['Hemstädning'] },
  { id: '5681', namn: 'Ahmed', omraden: ['Nacka'], kompetenser: ['Hemstädning', 'Fönsterputsning'] },
];

/** Den som testar väljer vem hen "är" – ingen BankID behövs i testläget. */
const TESTKUNDER: Kund[] = [
  { id: '15259', namn: 'Mikaela Wigert' },
  { id: '1234', namn: 'Anna Lind' },
  { id: '1235', namn: 'Johan Berg' },
];

export const TESTKUNDLISTA = TESTKUNDER.map((k) => ({ id: k.id, namn: `${k.namn} (kund ${k.id})` }));

export function testkund(id: string): Kund | null {
  return TESTKUNDER.find((k) => k.id === id) ?? null;
}

// ─── Världen ─────────────────────────────────────────────────────────────────

/** Första dagen efter `datum` med veckodagen `nr` (0 = söndag). */
function nastaVeckodag(datum: string, nr: number): string {
  let d = laggTillDagar(datum, 1);
  while (veckodagNr(d) !== nr) d = laggTillDagar(d, 1);
  return d;
}

function nastaVardag(datum: string, dagar: number): string {
  let d = datum;
  let kvar = dagar;
  while (kvar > 0) {
    d = laggTillDagar(d, 1);
    if (veckodagNr(d) >= 1 && veckodagNr(d) <= 5) kvar--;
  }
  return d;
}

type Intervall = [string, string];
const HELDAG: Intervall[] = [['08:00', '12:00'], ['13:00', '17:00']];

function skapaVarld(idag: string): Varld {
  const pass: Pass[] = [];
  let lopnr = 0;
  /** En annan kunds återkommande städning. Flyttas aldrig. */
  const aterkommande = (stadareId: string, datum: string, [start, slut]: Intervall) =>
    pass.push({ id: `P-${++lopnr}`, kundId: 'annan', stadareId, datum, start, slut, typ: 'uppdrag', tjanst: 'Hemstädning', aterkommande: true });
  /** En annan kunds engångsuppdrag. Får lämna plats för en återkommande kund. */
  const engang = (stadareId: string, datum: string, [start, slut]: Intervall, tjanst: string, kundNamn: string, adress: string) =>
    pass.push({ id: `TW-77${String(++lopnr).padStart(4, '0')}`, kundId: 'annan', kundNamn, stadareId, datum, start, slut, typ: 'uppdrag', tjanst, adress, aterkommande: false });

  const fredag1 = nastaVeckodag(idag, 5);
  const fredag2 = laggTillDagar(fredag1, 14);
  const mandag = nastaVeckodag(idag, 1);
  const mandag2 = laggTillDagar(mandag, 14);
  const johansDag = nastaVardag(idag, 3);

  // Testkundernas egna bokningar.
  for (const [id, datum] of [['TW-880301', mandag], ['TW-880302', mandag2]] as const) {
    pass.push({
      id, kundId: '15259', stadareId: '5678', datum, start: '08:00', slut: '11:00', typ: 'uppdrag',
      tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', adress: 'Testvägen 1, 113 30 Stockholm (testadress)', prisKr: 1095, aterkommande: true,
    });
  }
  for (const [id, datum] of [['TW-880101', fredag1], ['TW-880102', fredag2]] as const) {
    pass.push({
      id, kundId: '1234', stadareId: '5678', datum, start: '09:00', slut: '12:00', typ: 'uppdrag',
      tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', adress: 'Testgatan 5, 111 51 Stockholm', prisKr: 1255, aterkommande: true,
    });
  }
  pass.push({
    id: 'TW-880201', kundId: '1235', stadareId: '5679', datum: johansDag, start: '09:00', slut: '14:00', typ: 'uppdrag',
    tjanst: 'Storstädning', omrade: 'Solna', adress: 'Provvägen 12, 171 45 Solna', prisKr: 3480, aterkommande: false,
  });

  for (let i = 1; i <= 28; i++) {
    const datum = laggTillDagar(idag, i);
    const dag = veckodagNr(datum);
    if (dag === 0 || dag === 6) continue;
    const vecka = datum < mandag ? -1 : Math.floor((Date.parse(datum) - Date.parse(mandag)) / (7 * 86400000));

    // Maria.
    if (datum === fredag1 || datum === fredag2) {
      aterkommande('5678', datum, ['13:00', '17:00']);
    } else if (vecka === 0 || vecka >= 2) {
      if (dag === 1) aterkommande('5678', datum, ['13:30', '16:30']);
      if (dag === 2) aterkommande('5678', datum, ['08:00', '12:30']);
      if (dag === 3 && vecka === 0) {
        pass.push({ id: `P-${++lopnr}`, kundId: 'annan', stadareId: '5678', datum, start: ARBETSDAG_START, slut: ARBETSDAG_SLUT, typ: 'franvaro' });
      }
      if (dag === 3 && vecka >= 2) aterkommande('5678', datum, ['08:00', '11:00']);
      if (dag === 4 && vecka === 0) engang('5678', datum, ['13:00', '17:00'], 'Storstädning', 'Olsson (testkund)', 'Exempelgatan 3, 171 50 Solna');
      if (dag === 4 && vecka >= 2) aterkommande('5678', datum, ['13:00', '17:00']);
      if (dag === 5) HELDAG.forEach((iv) => aterkommande('5678', datum, iv));
    } else if (vecka === 1 && dag === 2) {
      engang('5678', datum, ['08:00', '12:00'], 'Hemstädning (ett tillfälle)', 'Nilsson (testkund)', 'Provgränd 8, 113 40 Stockholm');
      aterkommande('5678', datum, ['13:00', '17:00']);
    } else {
      HELDAG.forEach((iv) => aterkommande('5678', datum, iv));
    }

    // Sara: ledig måndagar och onsdagsförmiddagar.
    if (datum !== johansDag) {
      const sara: Record<number, Intervall[]> = { 1: [], 2: [['08:00', '12:00']], 3: [['13:00', '17:00']], 4: HELDAG, 5: [['09:00', '15:00']] };
      sara[dag].forEach((iv) => aterkommande('5679', datum, iv));
    }
    // Lena: ledig fredagar och torsdagseftermiddagar.
    const lena: Record<number, Intervall[]> = { 1: HELDAG, 2: HELDAG, 3: HELDAG, 4: [['08:00', '12:00']], 5: [] };
    lena[dag].forEach((iv) => aterkommande('5680', datum, iv));
    // Ahmed jobbar bara i Nacka.
    aterkommande('5681', datum, ['08:00', '12:00']);
  }

  return { version: VARLD_VERSION, skapad: idag, pass, simulera: 'normal' };
}

const nyckel = (samtalsId: string) => `sjalv:test:varld:${samtalsId}`;

async function hamtaVarld(samtalsId: string): Promise<Varld> {
  const idag = idagSthlm();
  const sparad = await lagring.hamta<Varld>(nyckel(samtalsId));
  // En värld från i går, eller med gammal testdata, räknas om.
  if (sparad && sparad.skapad === idag && sparad.version === VARLD_VERSION) return sparad;
  const ny = skapaVarld(idag);
  await sparaVarld(samtalsId, ny);
  return ny;
}

async function sparaVarld(samtalsId: string, varld: Varld): Promise<void> {
  await lagring.spara(nyckel(samtalsId), varld, VARLD_TTL);
}

export async function hamtaSimulering(samtalsId: string): Promise<Simulering> {
  return (await hamtaVarld(samtalsId)).simulera;
}

export async function sattSimulering(samtalsId: string, lage: Simulering): Promise<void> {
  const varld = await hamtaVarld(samtalsId);
  varld.simulera = lage;
  await sparaVarld(samtalsId, varld);
}

/** Återställer samtalets testvärld till utgångsläget. */
export async function aterstallVarld(samtalsId: string): Promise<void> {
  await sparaVarld(samtalsId, skapaVarld(idagSthlm()));
}

// ─── Regler ──────────────────────────────────────────────────────────────────

function personal(id: string | null): Personal | undefined {
  return PERSONAL.find((p) => p.id === id);
}

function kanUtfora(p: Personal, tjanst: string, omrade: string): boolean {
  return p.kompetenser.includes(tjanst) && p.omraden.includes(omrade);
}

type Utfall = { ledig: false } | { ledig: true; lossas: Pass[] };

/**
 * Kan medarbetaren ta hela fönstret, med restid på båda sidor?
 * Med förtur räknas andra kunders ENGÅNGSUPPDRAG inte som hinder – de lämnar
 * plats. Återkommande kunder och frånvaro är alltid hinder.
 */
function prova(varld: Varld, stadareId: string, datum: string, start: number, slut: number, utomPass: string, fortur: boolean): Utfall {
  if (start < minuter(ARBETSDAG_START) || slut > minuter(ARBETSDAG_SLUT)) return { ledig: false };
  const hinder = varld.pass.filter(
    (p) =>
      p.stadareId === stadareId &&
      p.datum === datum &&
      !p.avbokad &&
      p.id !== utomPass &&
      (p.typ === 'franvaro' || (minuter(p.start) < slut + RESTID_MINUTER && minuter(p.slut) + RESTID_MINUTER > start))
  );
  if (!hinder.length) return { ledig: true, lossas: [] };
  if (!fortur || hinder.some((p) => p.typ === 'franvaro' || p.aterkommande || p.kundId !== 'annan')) return { ledig: false };
  return { ledig: true, lossas: hinder };
}

/** Förtur gäller bara en återkommande kund hos sin egen ordinarie städare. */
function harFortur(bokning: Bokning, stadareId: string): boolean {
  return bokning.aterkommande && stadareId === bokning.stadare.id;
}

function tillBokning(p: Pass): Bokning {
  const s = personal(p.stadareId);
  return {
    id: p.id,
    kundId: p.kundId,
    tjanst: p.tjanst ?? '',
    datum: p.datum,
    start: p.start,
    slut: p.slut,
    stadare: { id: p.stadareId ?? '', namn: s?.namn ?? 'Utan anställd' },
    adress: p.adress ?? '',
    omrade: p.omrade ?? '',
    prisKr: p.prisKr ?? 0,
    aterkommande: Boolean(p.aterkommande),
  };
}

function tillEngangsuppdrag(p: Pass): Engangsuppdrag {
  const s = personal(p.stadareId);
  return {
    id: p.id,
    kund: p.kundNamn ?? 'okänd kund',
    tjanst: p.tjanst ?? '',
    datum: p.datum,
    start: p.start,
    slut: p.slut,
    adress: p.adress ?? '',
    stadare: { id: p.stadareId ?? '', namn: s?.namn ?? 'okänd' },
  };
}

// ─── Gränssnittet ────────────────────────────────────────────────────────────

export function testsystem(samtalsId: string): Bokningssystem {
  const ref = () => `TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    namn: 'test',
    kanSokaKollegor: true,
    kanSkriva: true,

    async hamtaKund(kundId) {
      return testkund(kundId);
    },

    async hamtaBokningar(kundId) {
      const varld = await hamtaVarld(samtalsId);
      const nu = Date.now();
      return varld.pass
        .filter((p) => p.kundId === kundId && p.typ === 'uppdrag' && !p.avbokad && sthlmTidpunkt(p.datum, p.start) > nu)
        .sort((a, b) => `${a.datum}${a.start}`.localeCompare(`${b.datum}${b.start}`))
        .map(tillBokning);
    },

    async hamtaBokning(bokningId) {
      const varld = await hamtaVarld(samtalsId);
      const p = varld.pass.find((x) => x.id === bokningId && x.kundId !== 'annan' && !x.avbokad);
      return p ? tillBokning(p) : null;
    },

    async lasTillbaka(bokning) {
      return this.hamtaBokning(bokning.id);
    },

    async ledigaLuckor(bokning, franDatum, tillDatum, bara, onskadStart) {
      const varld = await hamtaVarld(samtalsId);
      const langd = minuter(bokning.slut) - minuter(bokning.start);
      const imorgon = laggTillDagar(idagSthlm(), 1);
      const kandidater = (bara ? PERSONAL.filter((p) => p.id === bara.id) : PERSONAL).filter((p) =>
        kanUtfora(p, bokning.tjanst, bokning.omrade)
      );
      // Ordinarie städare först, sedan kollegor.
      kandidater.sort((a, b) => Number(b.id === bokning.stadare.id) - Number(a.id === bokning.stadare.id));

      const luckor: Lucka[] = [];
      for (const p of kandidater) {
        const fortur = harFortur(bokning, p.id);
        for (let datum = franDatum < imorgon ? imorgon : franDatum; datum <= tillDatum; datum = laggTillDagar(datum, 1)) {
          const dag = veckodagNr(datum);
          if (dag === 0 || dag === 6) continue;
          const fria: number[] = [];
          const medFortur: number[] = [];
          for (let start = minuter(ARBETSDAG_START); start + langd <= minuter(ARBETSDAG_SLUT); start += STEG_MINUTER) {
            if (datum === bokning.datum && start === minuter(bokning.start) && p.id === bokning.stadare.id) continue;
            const utfall = prova(varld, p.id, datum, start, start + langd, bokning.id, fortur);
            if (utfall.ledig === false) continue;
            (utfall.lossas.length ? medFortur : fria).push(start);
          }
          // Högst två tider per dag och person, minst tre timmar emellan.
          // Kundens önskade klockslag först, sedan helt fria tider, och
          // tider som kräver förtur fyller på.
          const dagens: { start: number; fortur: boolean }[] = [];
          const onskad = onskadStart && /^\d{2}:\d{2}$/.test(onskadStart) ? minuter(onskadStart) : null;
          if (onskad !== null && (fria.includes(onskad) || medFortur.includes(onskad))) {
            dagens.push({ start: onskad, fortur: !fria.includes(onskad) });
          }
          for (const [lista, arFortur] of [[fria, false], [medFortur, true]] as const) {
            for (const start of lista) {
              if (dagens.length >= 2) break;
              if (dagens.every((d) => Math.abs(d.start - start) >= 180)) dagens.push({ start, fortur: arFortur });
            }
          }
          dagens.sort((a, b) => a.start - b.start);
          for (const d of dagens) {
            luckor.push({
              datum,
              start: tidText(d.start),
              slut: tidText(d.start + langd),
              stadare: { id: p.id, namn: p.namn },
              ...(d.fortur ? { fortur: true } : {}),
            });
          }
        }
      }
      return luckor;
    },

    async kontrolleraLucka(bokning, lucka) {
      const varld = await hamtaVarld(samtalsId);
      const p = personal(lucka.stadare.id);
      if (!p || !kanUtfora(p, bokning.tjanst, bokning.omrade)) return { ledig: false };

      // Simulering: en återkommande kund hinner bokas på tiden precis innan kunden bekräftar.
      if (varld.simulera === 'upptagen') {
        varld.pass.push({ id: `P-sim-${Date.now()}`, kundId: 'annan', stadareId: p.id, datum: lucka.datum, start: lucka.start, slut: lucka.slut, typ: 'uppdrag', aterkommande: true });
        varld.simulera = 'normal';
        await sparaVarld(samtalsId, varld);
        return { ledig: false };
      }
      const utfall = prova(varld, p.id, lucka.datum, minuter(lucka.start), minuter(lucka.slut), bokning.id, harFortur(bokning, p.id));
      return utfall.ledig === false ? utfall : { ledig: true, lossas: utfall.lossas.map(tillEngangsuppdrag) };
    },

    async flyttaTillfalle(bokning, lucka) {
      const varld = await hamtaVarld(samtalsId);
      const pass = varld.pass.find((p) => p.id === bokning.id && p.kundId === bokning.kundId);
      if (!pass) return { ok: false, fel: 'Bokningen finns inte i testsystemet.' };

      if (varld.simulera === 'fel') {
        varld.simulera = 'normal';
        await sparaVarld(samtalsId, varld);
        return { ok: false, fel: 'SIMULERAT: TimeWave svarade 500 Internal Server Error. Ingenting ändrades.' };
      }
      if (varld.simulera === 'overifierad') {
        // Systemet säger OK men ändringen syns inte när vi läser tillbaka.
        varld.simulera = 'normal';
        await sparaVarld(samtalsId, varld);
        return { ok: true, referens: ref() };
      }

      pass.datum = lucka.datum;
      pass.start = lucka.start;
      pass.slut = lucka.slut;
      pass.stadareId = lucka.stadare.id;
      await sparaVarld(samtalsId, varld);
      return { ok: true, referens: ref() };
    },

    async avbokaTillfalle(bokning) {
      const varld = await hamtaVarld(samtalsId);
      const pass = varld.pass.find((p) => p.id === bokning.id && p.kundId === bokning.kundId && !p.avbokad);
      if (!pass) return { ok: false, fel: 'Bokningen finns inte i testsystemet.' };
      if (varld.simulera === 'fel') {
        varld.simulera = 'normal';
        await sparaVarld(samtalsId, varld);
        return { ok: false, fel: 'SIMULERAT: TimeWave svarade 500 Internal Server Error. Ingenting ändrades.' };
      }
      if (varld.simulera === 'overifierad') {
        varld.simulera = 'normal';
        await sparaVarld(samtalsId, varld);
        return { ok: true, referens: ref() };
      }
      pass.avbokad = true;
      await sparaVarld(samtalsId, varld);
      return { ok: true, referens: ref() };
    },

    async kontrolleraAvbokad(bokning) {
      const varld = await hamtaVarld(samtalsId);
      return varld.pass.some((p) => p.id === bokning.id && p.kundId === bokning.kundId && p.avbokad === true);
    },

    async lossaAnstalld(uppdragId) {
      const varld = await hamtaVarld(samtalsId);
      const pass = varld.pass.find((p) => p.id === uppdragId);
      if (!pass) return { ok: false, fel: 'Uppdraget finns inte i testsystemet.' };
      pass.stadareId = null;
      await sparaVarld(samtalsId, varld);
      return { ok: true, referens: ref() };
    },

    async atertilldela(uppdragId, anstalld) {
      const varld = await hamtaVarld(samtalsId);
      const pass = varld.pass.find((p) => p.id === uppdragId);
      if (!pass) return { ok: false, fel: 'Uppdraget finns inte i testsystemet.' };
      pass.stadareId = anstalld.id;
      await sparaVarld(samtalsId, varld);
      return { ok: true, referens: ref() };
    },

    async anstalldPa(uppdragId) {
      const varld = await hamtaVarld(samtalsId);
      return varld.pass.find((p) => p.id === uppdragId)?.stadareId;
    },

    async hamtaFakturor(kundId) {
      // Påhittade fakturor – bara i testvärlden.
      if (!testkund(kundId)) return [];
      return [
        { nummer: '10488', datum: '2026-09-15', forfallodatum: '2026-09-25', beloppKr: 1255, rutKr: 1255, betald: false, betaldDatum: null, kreditfaktura: false, ocr: '104887', bankgiro: '123-4567' },
        { nummer: '10452', datum: '2026-09-01', forfallodatum: '2026-09-11', beloppKr: 1255, rutKr: 1255, betald: true, betaldDatum: '2026-09-09', kreditfaktura: false, ocr: '104521', bankgiro: '123-4567' },
      ];
    },

    async skapaEkonomianteckning(kundId, rubrik, text) {
      console.log(`\n[testläge] ekonomianteckning skapas INTE i testläget (kund ${kundId}):\n${rubrik}\n${text}\n`);
      return { ok: true };
    },

    async skapaArende(rubrik, text) {
      console.log(`\n[testläge] ärende till kundservice skapas INTE i testläget:\n${rubrik}\n${text}\n`);
    },
  };
}
