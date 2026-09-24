// Gränssnittet mot bokningssystemet för självservicen i chatten.
//
// Chatten pratar aldrig direkt med TimeWave. Allt går genom det här
// gränssnittet, som har två implementationer:
//  * test     – påhittade kunder, personal och scheman (api/_testBokningssystem.ts)
//  * timewave – det riktiga systemet (kopplas in i ett senare steg)
//
// Gränssnittet är avsiktligt smalt: det finns ingen generell "anropa
// TimeWave"-väg, bara de handlingar självservicen behöver.

export interface Anstalld {
  id: string;
  namn: string;
}

export interface Kund {
  id: string;
  namn: string;
}

export interface Bokning {
  id: string;
  kundId: string;
  tjanst: string;
  /** ÅÅÅÅ-MM-DD, svensk tid. */
  datum: string;
  /** HH:MM, svensk tid. */
  start: string;
  slut: string;
  stadare: Anstalld;
  adress: string;
  omrade: string;
  /** Kundens kostnad för tillfället, ur bokningssystemet. Grund för avgiften. */
  prisKr: number;
  aterkommande: boolean;
  /** Tjänstens id i bokningssystemet – för att hitta kollegor som kan utföra den. */
  tjanstId?: string;
  /** Satt när tillfället inte kan ändras i chatten, med orsaken. */
  ejAndringsbar?: string;
}

/** En tid som bokningssystemet sagt är bokningsbar för en viss medarbetare. */
export interface Lucka {
  datum: string;
  start: string;
  slut: string;
  stadare: Anstalld;
  /** Sant när tiden kräver att ett engångsuppdrag lämnar plats (förtursregeln). Visas aldrig för kunden. */
  fortur?: boolean;
}

/**
 * En annan kunds ENGÅNGSUPPDRAG som krockar med en ombokning hos ordinarie
 * städare. Enligt förtursregeln blir det "Utan anställd" så att den
 * återkommande kunden får sin städning, och kundservice får ett mejl.
 */
export interface Engangsuppdrag {
  id: string;
  kund: string;
  tjanst: string;
  datum: string;
  start: string;
  slut: string;
  adress: string;
  stadare: Anstalld;
}

/** Svaret på "går den här tiden att boka just nu?". */
export type Kontroll =
  | { ledig: false }
  /** `lossas` = engångsuppdrag som får lämna plats enligt förtursregeln. Tom när tiden är helt fri. */
  | { ledig: true; lossas: Engangsuppdrag[] };

export type Skrivresultat =
  | { ok: true; referens: string }
  /** `osaker` = vi vet inte om ändringen gick igenom (t.ex. timeout). Ska aldrig tolkas som lyckat. */
  | { ok: false; fel: string; osaker?: boolean };

export interface Bokningssystem {
  namn: 'test' | 'timewave';
  /** Kan leta tider hos andra städare än den ordinarie. */
  kanSokaKollegor: boolean;
  /** Kan skriva ändringar. Är det av svarar skrivningarna med fel och ingenting ändras. */
  kanSkriva: boolean;
  hamtaKund(kundId: string): Promise<Kund | null>;
  /** Kundens kommande bokningar. */
  hamtaBokningar(kundId: string): Promise<Bokning[]>;
  hamtaBokning(bokningId: string): Promise<Bokning | null>;
  /** Läser bokningen som den ser ut i systemet just nu, efter en flytt. Används för verifieringen. */
  lasTillbaka(bokning: Bokning): Promise<Bokning | null>;
  /**
   * Verkligt bokningsbara tider för bokningens tjänst och längd mellan två
   * datum. `bara` begränsar till en medarbetare (samma städare); null betyder
   * alla som kan utföra tjänsten i bokningens område.
   *
   * FÖRTURSREGELN (Mikaela 2026-09-24): är bokningen återkommande räknas
   * ordinarie städares ENGÅNGSUPPDRAG hos andra kunder inte som hinder –
   * befintliga återkommande kunder har förtur. Andra kunders återkommande
   * städningar, frånvaro och arbetstid är alltid hinder. Helt fria tider
   * föredras framför tider som kräver förtur.
   *
   * `onskadStart` (HH:MM): har kunden bett om ett klockslag prövas det först
   * varje dag och tas med om det går att boka.
   */
  ledigaLuckor(bokning: Bokning, franDatum: string, tillDatum: string, bara: Anstalld | null, onskadStart?: string): Promise<Lucka[]>;
  /** Ny kontroll precis innan en ändring sparas, med vilka engångsuppdrag som i så fall får lämna plats. */
  kontrolleraLucka(bokning: Bokning, lucka: Lucka): Promise<Kontroll>;
  /** Flyttar ETT tillfälle. Övriga tillfällen i en återkommande serie ska vara orörda. */
  /** `notering` följer med ändringen (t.ex. vem i personalen som gjorde den). */
  flyttaTillfalle(bokning: Bokning, lucka: Lucka, notering?: string): Promise<Skrivresultat>;
  /** Explicit single-occurrence cancellation; absence is never proof of cancellation. */
  avbokaTillfalle?(bokning: Bokning): Promise<Skrivresultat>;
  kontrolleraAvbokad?(bokning: Bokning): Promise<boolean>;
  /** Sätter ett uppdrag till "Utan anställd". */
  lossaAnstalld(uppdragId: string): Promise<Skrivresultat>;
  /** Lägger tillbaka en anställd på ett uppdrag – används om en ombokning måste backas. */
  atertilldela(uppdragId: string, anstalld: Anstalld): Promise<Skrivresultat>;
  /** Vem som står på ett uppdrag just nu (null = utan anställd), för verifiering. */
  anstalldPa(uppdragId: string): Promise<string | null | undefined>;
  /**
   * Ekonomianteckning på kunden, t.ex. om en avgift för sen ombokning som ska
   * faktureras. Saknas metoden, eller misslyckas den, mejlas ekonomin i stället.
   */
  skapaEkonomianteckning?(kundId: string, rubrik: string, text: string): Promise<{ ok: true } | { ok: false; fel: string }>;
  /** Kundens mobilnummer (+467…) ur kundregistret, för bekräftelse-SMS. null om det saknas eller är en platshållare. */
  kundensMobil?(kundId: string): Promise<string | null>;
  /** Ärende till kundservice när något behöver ses över manuellt. */
  skapaArende(rubrik: string, text: string): Promise<void>;
}

// ─── Tid ─────────────────────────────────────────────────────────────────────

export function minuter(tid: string): number {
  const [h, m] = tid.split(':').map(Number);
  return h * 60 + m;
}

export function tidText(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function laggTillDagar(datum: string, dagar: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dagar);
  return d.toISOString().slice(0, 10);
}

/** 0 = söndag … 6 = lördag. */
export function veckodagNr(datum: string): number {
  return new Date(`${datum}T12:00:00Z`).getUTCDay();
}

export function idagSthlm(nu = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu);
}

/** Tidpunkten (ms) för ett datum och klockslag i svensk tid, med sommartid. */
export function sthlmTidpunkt(datum: string, tid: string): number {
  const utc = Date.parse(`${datum}T${tid}:00Z`);
  // Hur långt före UTC Stockholm ligger just den dagen.
  const delar = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(utc));
  const v = (typ: string) => Number(delar.find((d) => d.type === typ)?.value);
  const somLokal = Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute'));
  return utc - (somLokal - utc);
}

const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** "fredag 25 september" */
export function datumText(datum: string): string {
  const [, m, d] = datum.split('-').map(Number);
  return `${VECKODAGAR[veckodagNr(datum)]} ${d} ${MANADER[m - 1]}`;
}

/** Oföränderligt avtryck av det som får ändras. Skiljer det sig har bokningen ändrats av någon annan. */
export function avtryck(b: Pick<Bokning, 'datum' | 'start' | 'slut' | 'stadare'>): string {
  return `${b.datum} ${b.start}-${b.slut} ${b.stadare.id}`;
}
