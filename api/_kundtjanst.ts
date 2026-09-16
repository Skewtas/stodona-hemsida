// Inloggad kundtjänst i chatten: kunden legitimerar sig, ser sina fakturor och
// bokningar och kan boka om.
//
// ENDAST TESTMILJÖ. Allt här är avstängt om inte CHAT_KUNDTJANST=true, vilket
// bara vite.config.ts sätter när sajten körs lokalt. I produktion finns
// varken verktygen, knappen eller den här datan.
//
// TESTDATA, INTE RIKTIGA KUNDER. Kunder, fakturor, personal och scheman nedan
// är påhittade och ligger i minnet. En omstart av testservern återställer
// allt. Riktiga uppgifter från Fortnox (fakturor) och TimeWave (scheman och
// personal) kopplas på som ett eget steg när flödet är godkänt.
//
// SÄKERHET SOM GÄLLER ÄVEN NÄR RIKTIGA SYSTEM KOPPLAS PÅ:
//  * Verifieringen lever på servern, kopplad till samtalets id och med en
//    sista giltighetstid. Det kunden eller modellen påstår spelar ingen roll.
//  * Vilket kundkonto som gäller avgörs av verifieringen – aldrig av ett
//    kundnummer, personnummer, fakturanummer eller boknings-id i chatten.
//  * En ombokning kräver ett förslag som skapats i samma samtal, kundens
//    uttryckliga ja, och en ny kontroll av tiden när den sparas.
//  * Andra kunders bokningar och varför en medarbetare är upptagen lämnas
//    aldrig ut.
//
// OMBOKNINGSREGLER – Stodonas beslut 2026-09-16:
//  1. I första hand samma städare som redan ska till kunden.
//  2. Har den städaren ett ENGÅNGSUPPDRAG på önskad tid räknas tiden ändå som
//     ledig, om en likvärdig kollega kan ta över engångsuppdraget. Återkommande
//     kunder flyttas aldrig.
//  3. Har städaren ingen ledig tid föreslås en likvärdig kollega: samma
//     område, rätt kompetens och ledig tid inklusive restid.

export const KUNDTJANST_PA = process.env.CHAT_KUNDTJANST === 'true';

/** Hur länge en legitimering gäller innan kunden får göra om den. */
const VERIFIERING_MINUTER = 15;
/** Hur lång den simulerade BankID-signeringen tar. */
const SIMULERAD_SIGNERING_MS = 3000;
/** Hur länge ett ombokningsförslag gäller innan tiderna måste hämtas igen. */
const FORSLAG_MINUTER = 15;
/** Restid och marginal mellan två pass för samma medarbetare. */
const RESTID_MINUTER = 30;
const ARBETSDAG_START = '08:00';
const ARBETSDAG_SLUT = '17:00';

// ─── Testdata ────────────────────────────────────────────────────────────────

export interface Faktura {
  nummer: string;
  datum: string;
  forfallodatum: string;
  belopp: number;
  status: 'Betald' | 'Obetald' | 'Förfallen';
  avser: string;
}

interface Personal {
  namn: string;
  omraden: string[];
  kompetenser: string[];
}

/** Ett pass i schemat. Kundens bokningar är pass med kundens id. */
interface Pass {
  id: string;
  kundId: string;
  stadare: string;
  datum: string;
  start: string;
  slut: string;
  tjanst: string;
  omrade: string;
  typ: 'återkommande' | 'engång';
  adress?: string;
  serie?: string;
}

export interface Testkund {
  id: string;
  personnummer: string;
  namn: string;
  fakturor: Faktura[];
}

/** Påhittade kunder. Personnumren är Skatteverkets testnummer. */
const TESTKUNDER: Testkund[] = [
  {
    id: 'kund-1001',
    personnummer: '19850101-1234',
    namn: 'Anna Lind',
    fakturor: [
      { nummer: '10452', datum: '2026-09-01', forfallodatum: '2026-09-11', belopp: 1255, status: 'Betald', avser: 'Hemstädning 72 kvm, augusti' },
      { nummer: '10488', datum: '2026-09-15', forfallodatum: '2026-09-25', belopp: 1255, status: 'Obetald', avser: 'Hemstädning 72 kvm, september' },
    ],
  },
  {
    id: 'kund-1002',
    personnummer: '19700315-4321',
    namn: 'Johan Berg',
    fakturor: [{ nummer: '10399', datum: '2026-08-20', forfallodatum: '2026-08-30', belopp: 3480, status: 'Förfallen', avser: 'Flyttstädning 68 kvm' }],
  },
];

const PERSONAL: Personal[] = [
  { namn: 'Maria', omraden: ['Stockholm innerstad', 'Solna'], kompetenser: ['Hemstädning', 'Storstädning'] },
  { namn: 'Sara', omraden: ['Stockholm innerstad', 'Solna', 'Sundbyberg'], kompetenser: ['Hemstädning', 'Storstädning', 'Flyttstädning'] },
  { namn: 'Lena', omraden: ['Stockholm innerstad'], kompetenser: ['Hemstädning'] },
  { namn: 'Ahmed', omraden: ['Nacka'], kompetenser: ['Hemstädning', 'Fönsterputsning'] },
];

/**
 * Schemat är byggt så att alla tre ombokningsfallen går att prova för Anna
 * Lind, vars ordinarie städare är Maria:
 *  - torsdag 17/9 kl. 09:00: Maria har ett engångsuppdrag som Sara kan ta över
 *  - torsdag 17/9 kl. 13:00: Maria har en återkommande kund – en kollega föreslås
 *  - måndag 21/9 förmiddag: Maria är ledig
 *  - tisdag 22/9: Maria är fullbokad med återkommande kunder – en kollega föreslås
 */
const SCHEMA: Pass[] = [
  // Anna Lind – varannan vecka, fredagar 09:00.
  { id: 'BOK-77120', kundId: 'kund-1001', stadare: 'Maria', datum: '2026-09-18', start: '09:00', slut: '11:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande', adress: 'Testgatan 5, 111 51 Stockholm', serie: 'SERIE-anna' },
  { id: 'BOK-77121', kundId: 'kund-1001', stadare: 'Maria', datum: '2026-10-02', start: '09:00', slut: '11:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande', adress: 'Testgatan 5, 111 51 Stockholm', serie: 'SERIE-anna' },

  // Marias övriga pass (andra kunder – lämnas aldrig ut).
  { id: 'P-2001', kundId: 'kund-x1', stadare: 'Maria', datum: '2026-09-17', start: '08:30', slut: '11:30', tjanst: 'Storstädning', omrade: 'Solna', typ: 'engång' },
  { id: 'P-2002', kundId: 'kund-x2', stadare: 'Maria', datum: '2026-09-17', start: '13:00', slut: '16:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande' },
  { id: 'P-2003', kundId: 'kund-x3', stadare: 'Maria', datum: '2026-09-18', start: '12:00', slut: '15:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande' },
  { id: 'P-2004', kundId: 'kund-x4', stadare: 'Maria', datum: '2026-09-21', start: '14:00', slut: '16:00', tjanst: 'Hemstädning', omrade: 'Solna', typ: 'återkommande' },
  { id: 'P-2005', kundId: 'kund-x5', stadare: 'Maria', datum: '2026-09-22', start: '08:00', slut: '12:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande' },
  { id: 'P-2006', kundId: 'kund-x6', stadare: 'Maria', datum: '2026-09-22', start: '13:00', slut: '17:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande' },

  // Kollegor.
  { id: 'P-3001', kundId: 'kund-x7', stadare: 'Sara', datum: '2026-09-17', start: '13:00', slut: '16:00', tjanst: 'Flyttstädning', omrade: 'Sundbyberg', typ: 'engång' },
  { id: 'P-3002', kundId: 'kund-x8', stadare: 'Lena', datum: '2026-09-21', start: '08:00', slut: '12:00', tjanst: 'Hemstädning', omrade: 'Stockholm innerstad', typ: 'återkommande' },
];

/** Personnumren som fungerar i testlägets BankID-ruta. */
export const TESTPERSONNUMMER = TESTKUNDER.map((k) => ({ personnummer: k.personnummer, namn: k.namn }));

// ─── Verifieringar ───────────────────────────────────────────────────────────

interface Verifiering {
  kundId: string;
  giltigTill: number;
}

interface Pagaende {
  samtalsId: string;
  kundId: string;
  klarTid: number;
}

/** Testmiljön håller allt i minnet. Ingenting skrivs till någon databas. */
const verifierade = new Map<string, Verifiering>();
const pagaende = new Map<string, Pagaende>();

function kundFor(id: string): Testkund | null {
  return TESTKUNDER.find((k) => k.id === id) ?? null;
}

/**
 * Startar den simulerade signeringen. Personnumret kommer från
 * legitimeringsrutan, aldrig från chatten, och sparas inte.
 */
export function startaSignering(samtalsId: string, personnummer: string): { ordernummer: string } | { fel: string } {
  const rensat = personnummer.replace(/\s/g, '');
  const kund = TESTKUNDER.find((k) => k.personnummer === rensat);
  if (!kund) return { fel: 'I testläget fungerar bara testpersonnumren i listan.' };
  const ordernummer = crypto.randomUUID();
  pagaende.set(ordernummer, { samtalsId, kundId: kund.id, klarTid: Date.now() + SIMULERAD_SIGNERING_MS });
  return { ordernummer };
}

/** Frågar hur det går. Först när signeringen är klar kopplas kunden till samtalet. */
export function kollaSignering(samtalsId: string, ordernummer: string): { status: 'vantar' } | { status: 'klar'; namn: string } | { fel: string } {
  const order = pagaende.get(ordernummer);
  // Ordern måste höra till det här samtalet – annars går den inte att kapa.
  if (!order || order.samtalsId !== samtalsId) return { fel: 'Legitimeringen hittades inte. Börja om.' };
  if (Date.now() < order.klarTid) return { status: 'vantar' };
  pagaende.delete(ordernummer);
  const kund = kundFor(order.kundId);
  if (!kund) return { fel: 'Kundkontot kunde inte hämtas.' };
  verifierade.set(samtalsId, { kundId: kund.id, giltigTill: Date.now() + VERIFIERING_MINUTER * 60 * 1000 });
  return { status: 'klar', namn: kund.namn };
}

export function avbrytSignering(samtalsId: string, ordernummer: string): void {
  const order = pagaende.get(ordernummer);
  if (order && order.samtalsId === samtalsId) pagaende.delete(ordernummer);
}

/** Kunden bakom en verifierad session, eller null. Enda källan till vem kunden är. */
export function verifieradKund(samtalsId: string): Testkund | null {
  const v = verifierade.get(samtalsId);
  if (!v) return null;
  if (Date.now() > v.giltigTill) {
    verifierade.delete(samtalsId);
    return null;
  }
  return kundFor(v.kundId);
}

/** Hur många minuter legitimeringen gäller till. */
export function minuterKvar(samtalsId: string): number {
  const v = verifierade.get(samtalsId);
  return v ? Math.max(0, Math.round((v.giltigTill - Date.now()) / 60000)) : 0;
}

// ─── Visning ─────────────────────────────────────────────────────────────────

export function maskeratPersonnummer(personnummer: string): string {
  return `${personnummer.slice(0, 8)}-XXXX`;
}

export function fakturaradText(f: Faktura): string {
  return `Faktura ${f.nummer} · ${f.avser} · ${f.belopp} kr · fakturerad ${f.datum} · förfaller ${f.forfallodatum} · ${f.status}`;
}

const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

function veckodag(datum: string): string {
  return VECKODAGAR[new Date(`${datum}T12:00:00Z`).getUTCDay()];
}

function langd(p: { start: string; slut: string }): string {
  const timmar = (minuter(p.slut) - minuter(p.start)) / 60;
  return `${String(timmar).replace('.', ',')} ${timmar === 1 ? 'timme' : 'timmar'}`;
}

/** Kundens egna kommande bokningar, sorterade. */
export function bokningarFor(kund: Testkund): string[] {
  return SCHEMA.filter((p) => p.kundId === kund.id)
    .sort((a, b) => `${a.datum}${a.start}`.localeCompare(`${b.datum}${b.start}`))
    .map(
      (p) =>
        `${p.id} · ${veckodag(p.datum)} ${p.datum} kl. ${p.start}–${p.slut} (exakt starttid) · ${p.tjanst}, ${langd(p)} · ${p.adress} · städare ${p.stadare} (ordinarie) · ${p.serie ? 'återkommande, varannan vecka' : 'enstaka'}`
    );
}

// ─── Tider ───────────────────────────────────────────────────────────────────

function minuter(tid: string): number {
  const [h, m] = tid.split(':').map(Number);
  return h * 60 + m;
}

function tidText(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

function arVardag(datum: string): boolean {
  const dag = new Date(`${datum}T12:00:00Z`).getUTCDay();
  return dag >= 1 && dag <= 5;
}

function laggTillDagar(datum: string, dagar: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dagar);
  return d.toISOString().slice(0, 10);
}

function idagSthlm(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** Timmar från nu till passets start, i svensk tid. */
function timmarTill(datum: string, start: string): number {
  const nu = new Date();
  const sthlm = new Date(nu.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
  const mal = new Date(`${datum}T${start}:00`);
  return (mal.getTime() - sthlm.getTime()) / 3600000;
}

/** Pass som krockar med ett tidsfönster för en medarbetare, med restid på båda sidor. */
function krockar(stadare: string, datum: string, start: number, slut: number, utom: Set<string>): Pass[] {
  return SCHEMA.filter(
    (p) =>
      p.stadare === stadare &&
      p.datum === datum &&
      !utom.has(p.id) &&
      minuter(p.start) < slut + RESTID_MINUTER &&
      minuter(p.slut) + RESTID_MINUTER > start
  );
}

function kanUtfora(person: Personal, tjanst: string, omrade: string): boolean {
  return person.kompetenser.includes(tjanst) && person.omraden.includes(omrade);
}

/** En likvärdig kollega som kan ta ett pass: rätt kompetens, samma område, ledig inklusive restid. */
function likvardigKollega(pass: { tjanst: string; omrade: string; datum: string; start: number; slut: number }, inte: string[], utom: Set<string>): string | null {
  const kandidat = PERSONAL.find(
    (p) => !inte.includes(p.namn) && kanUtfora(p, pass.tjanst, pass.omrade) && krockar(p.namn, pass.datum, pass.start, pass.slut, utom).length === 0
  );
  return kandidat?.namn ?? null;
}

type Utfall =
  | { typ: 'ordinarie' }
  | { typ: 'ordinarie_med_omflyttning'; omflyttningar: { passId: string; till: string }[] }
  | null;

/**
 * Kan ordinarie städare ta tiden? Krockar bara med engångsuppdrag som en
 * likvärdig kollega kan ta över räknas som ledigt. Återkommande kunder
 * flyttas aldrig.
 */
function ordinarieKan(bokning: Pass, datum: string, start: number, slut: number): Utfall {
  const utom = new Set([bokning.id]);
  const hinder = krockar(bokning.stadare, datum, start, slut, utom);
  if (!hinder.length) return { typ: 'ordinarie' };
  if (hinder.some((p) => p.typ !== 'engång')) return null;

  const omflyttningar: { passId: string; till: string }[] = [];
  for (const p of hinder) {
    const till = likvardigKollega(
      { tjanst: p.tjanst, omrade: p.omrade, datum: p.datum, start: minuter(p.start), slut: minuter(p.slut) },
      [bokning.stadare, ...omflyttningar.map((o) => o.till)],
      utom
    );
    if (!till) return null;
    omflyttningar.push({ passId: p.id, till });
  }
  return { typ: 'ordinarie_med_omflyttning', omflyttningar };
}

// ─── Ombokningsförslag ───────────────────────────────────────────────────────

interface Forslag {
  id: string;
  samtalsId: string;
  kundId: string;
  bokningId: string;
  datum: string;
  start: string;
  slut: string;
  stadare: string;
  typ: 'ordinarie' | 'ordinarie_med_omflyttning' | 'kollega';
  omflyttningar: { passId: string; till: string }[];
  skapad: number;
  /** Bokningen som den såg ut när förslaget togs fram. Har den ändrats sedan gäller inte förslaget. */
  fore: string;
  utford?: string;
}

function avtryck(p: Pass): string {
  return `${p.datum} ${p.start} ${p.stadare}`;
}

const forslagen = new Map<string, Forslag>();

function forslagsText(f: Forslag, ordinarie: string): string {
  const vem = f.typ === 'kollega' ? `${f.stadare} (kollega – BYTE från ordinarie städare ${ordinarie})` : `${f.stadare} (ordinarie städare)`;
  return `${f.id}: ${veckodag(f.datum)} ${f.datum} kl. ${f.start}–${f.slut} · ${vem}`;
}

/**
 * Hittar förslag på nya tider för en av kundens egna bokningar.
 * Ordning: önskad tid med ordinarie städare, andra tider med ordinarie
 * städare, och – om ordinarie inte kan på önskad dag – en likvärdig kollega.
 */
export function foreslaOmbokning(
  samtalsId: string,
  kund: Testkund,
  bokningId: string,
  onskatDatum: string | null,
  onskadTid: string | null
): string {
  const bokning = SCHEMA.find((p) => p.id === bokningId && p.kundId === kund.id);
  // Samma svar oavsett om bokningen inte finns eller tillhör någon annan.
  if (!bokning) return 'Bokningen finns inte bland kundens bokningar. Hämta kundens bokningar och fråga vilken som avses.';

  const idag = idagSthlm();
  if (onskatDatum && (!/^\d{4}-\d{2}-\d{2}$/.test(onskatDatum) || onskatDatum < idag)) {
    return 'Önskat datum är ogiltigt eller har redan passerat. Fråga kunden efter ett nytt datum.';
  }
  if (onskadTid && !/^\d{2}:\d{2}$/.test(onskadTid)) onskadTid = null;

  const langdMin = minuter(bokning.slut) - minuter(bokning.start);
  const dagStart = minuter(ARBETSDAG_START);
  const sistaStart = minuter(ARBETSDAG_SLUT) - langdMin;
  const starttider: number[] = [];
  for (let t = dagStart; t <= sistaStart; t += 60) starttider.push(t);

  // Dagar att leta på: önskad dag först, sedan de närmaste vardagarna.
  const forsta = onskatDatum ?? laggTillDagar(idag, 1);
  const dagar: string[] = [];
  for (let i = 0; dagar.length < 5 && i < 14; i++) {
    const d = laggTillDagar(forsta, i);
    if (arVardag(d) && d >= idag) dagar.push(d);
  }

  const nu = Date.now();
  const skapa = (datum: string, start: number, stadare: string, typ: Forslag['typ'], omflyttningar: Forslag['omflyttningar']): Forslag => {
    const f: Forslag = {
      id: `F${forslagen.size + 1}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      samtalsId,
      kundId: kund.id,
      bokningId: bokning.id,
      datum,
      start: tidText(start),
      slut: tidText(start + langdMin),
      stadare,
      typ,
      omflyttningar,
      skapad: nu,
      fore: avtryck(bokning),
    };
    forslagen.set(f.id, f);
    return f;
  };

  const ordinarieForslag: Forslag[] = [];
  const onskadStart = onskadTid ? minuter(onskadTid) : null;

  // 1. Önskad tid med ordinarie städare.
  if (onskatDatum && onskadStart !== null && onskadStart >= dagStart && onskadStart <= sistaStart) {
    const utfall = ordinarieKan(bokning, onskatDatum, onskadStart, onskadStart + langdMin);
    if (utfall) ordinarieForslag.push(skapa(onskatDatum, onskadStart, bokning.stadare, utfall.typ, utfall.typ === 'ordinarie_med_omflyttning' ? utfall.omflyttningar : []));
  }

  // 2. Andra tider med ordinarie städare – närmast önskad tid och dag först.
  for (const datum of dagar) {
    if (ordinarieForslag.length >= 3) break;
    const ordning = [...starttider].sort((a, b) => Math.abs(a - (onskadStart ?? bokningStart(bokning))) - Math.abs(b - (onskadStart ?? bokningStart(bokning))));
    for (const start of ordning) {
      if (ordinarieForslag.length >= 3) break;
      if (datum === bokning.datum && start === minuter(bokning.start)) continue;
      if (ordinarieForslag.some((f) => f.datum === datum && Math.abs(minuter(f.start) - start) < 120)) continue;
      const utfall = ordinarieKan(bokning, datum, start, start + langdMin);
      if (utfall) ordinarieForslag.push(skapa(datum, start, bokning.stadare, utfall.typ, utfall.typ === 'ordinarie_med_omflyttning' ? utfall.omflyttningar : []));
    }
  }

  // 3. En likvärdig kollega på önskad tid – när ordinarie städare inte kan ta
  //    exakt den tid kunden bett om, eller (utan önskad tid) inte kan alls den dagen.
  const kollegaForslag: Forslag[] = [];
  const ordinarieKanOnskadDag = onskatDatum ? ordinarieForslag.some((f) => f.datum === onskatDatum) : true;
  const ordinarieKanExaktTid =
    onskatDatum && onskadTid ? ordinarieForslag.some((f) => f.datum === onskatDatum && f.start === onskadTid) : true;
  const behoverKollega = onskatDatum && (onskadTid ? !ordinarieKanExaktTid : !ordinarieKanOnskadDag);
  if (behoverKollega) {
    const tider = onskadStart !== null ? [onskadStart, ...starttider.filter((t) => t !== onskadStart)] : starttider;
    for (const start of tider) {
      const kollega = likvardigKollega(
        { tjanst: bokning.tjanst, omrade: bokning.omrade, datum: onskatDatum, start, slut: start + langdMin },
        [bokning.stadare],
        new Set([bokning.id])
      );
      if (kollega) {
        kollegaForslag.push(skapa(onskatDatum, start, kollega, 'kollega', []));
        break;
      }
    }
  }

  const alla = [...ordinarieForslag, ...kollegaForslag];
  if (!alla.length) {
    return 'Det finns inga lediga tider de närmaste dagarna, varken för ordinarie städare eller en likvärdig kollega. Erbjud att lämna över till kundservice.';
  }

  const nuvarande = `Nuvarande bokning: ${bokning.id}, ${veckodag(bokning.datum)} ${bokning.datum} kl. ${bokning.start}–${bokning.slut}, ${bokning.tjanst}, städare ${bokning.stadare}.`;
  const sent = timmarTill(bokning.datum, bokning.start) < 48;
  const villkor = sent
    ? 'VILLKOR: det är mindre än 48 timmar kvar till den nuvarande bokningen. Enligt villkoren kan 50 % debiteras vid sen ombokning – säg det i sammanfattningen och att kundservice bekräftar vad som gäller.'
    : 'Ombokningen görs mer än 48 timmar innan, så inga avgifter enligt villkoren.';
  const omOrdinarie = !onskatDatum
    ? ''
    : !ordinarieKanOnskadDag
      ? `Ordinarie städare ${bokning.stadare} har ingen ledig tid ${veckodag(onskatDatum)} ${onskatDatum}. Förklara inte varför.`
      : !ordinarieKanExaktTid
        ? `Ordinarie städare ${bokning.stadare} kan inte ${veckodag(onskatDatum)} kl. ${onskadTid}, men andra tider. Förklara inte varför.`
        : '';

  return [
    nuvarande,
    omOrdinarie,
    'Förslag (visa dem som knappar, med dag, datum, tid och vem som kommer):',
    ...alla.map((f) => forslagsText(f, bokning.stadare)),
    villkor,
    'Priset är oförändrat, eftersom tjänst och längd är desamma.',
    'Innan ändringen: sammanfatta nuvarande och ny tid, vem som kommer och om det är ett byte av städare, om den gäller bara detta tillfälle eller hela serien, pris och villkor – och be kunden bekräfta uttryckligen. Genomför först efter ett tydligt ja.',
    `Förslagen gäller i ${FORSLAG_MINUTER} minuter.`,
  ]
    .filter(Boolean)
    .join('\n');
}

function bokningStart(b: Pass): number {
  return minuter(b.start);
}

// ─── Genomför ombokning ──────────────────────────────────────────────────────

/** Kontrollerar att förslaget fortfarande går att genomföra – precis innan det sparas. */
function giltigtNu(f: Forslag, bokning: Pass): Forslag['omflyttningar'] | null {
  const start = minuter(f.start);
  const slut = minuter(f.slut);
  if (f.typ === 'kollega') {
    const person = PERSONAL.find((p) => p.namn === f.stadare);
    if (!person || !kanUtfora(person, bokning.tjanst, bokning.omrade)) return null;
    return krockar(f.stadare, f.datum, start, slut, new Set([bokning.id])).length === 0 ? [] : null;
  }
  const utfall = ordinarieKan(bokning, f.datum, start, slut);
  if (!utfall) return null;
  return utfall.typ === 'ordinarie_med_omflyttning' ? utfall.omflyttningar : [];
}

export function genomforOmbokning(samtalsId: string, kund: Testkund, forslagId: string, omfattning: string): string {
  const f = forslagen.get(forslagId);
  // Förslaget måste höra till det här samtalet och den här kunden.
  if (!f || f.samtalsId !== samtalsId || f.kundId !== kund.id) {
    return 'Förslaget hittades inte. Hämta nya förslag med foresla_ombokning och fråga kunden igen.';
  }

  // Samma förslag två gånger ger samma bekräftelse – aldrig en dubbel ändring.
  if (f.utford) return `Ändringen är redan genomförd. ${f.utford}`;

  if (Date.now() - f.skapad > FORSLAG_MINUTER * 60 * 1000) {
    forslagen.delete(forslagId);
    return 'Förslaget har gått ut. Hämta nya förslag med foresla_ombokning – tiderna kan ha ändrats.';
  }

  if (omfattning === 'hela_serien') {
    return 'Ändring av hela serien kan inte göras i chatten ännu. Erbjud att ändra bara det här tillfället, eller lämna över till kundservice för en ändring av serien.';
  }
  if (omfattning !== 'bara_detta_tillfalle') {
    return 'Omfattningen är oklar. Fråga kunden om ändringen gäller bara det här tillfället.';
  }

  const bokning = SCHEMA.find((p) => p.id === f.bokningId && p.kundId === kund.id);
  if (!bokning) return 'Bokningen hittades inte längre. Den befintliga bokningen är oförändrad. Lämna över till kundservice.';
  if (avtryck(bokning) !== f.fore) {
    forslagen.delete(forslagId);
    return 'Bokningen har ändrats sedan förslaget togs fram, så förslaget gäller inte längre. Ingenting har ändrats nu. Hämta kundens bokningar och nya förslag.';
  }

  // Ny kontroll precis innan ändringen sparas.
  const omflyttningar = giltigtNu(f, bokning);
  if (!omflyttningar) {
    forslagen.delete(forslagId);
    return 'Tiden har hunnit bli upptagen. Den befintliga bokningen är oförändrad. Förklara det för kunden och hämta nya förslag.';
  }

  const fore = `${veckodag(bokning.datum)} ${bokning.datum} kl. ${bokning.start}, ${bokning.stadare}`;

  // Engångsuppdrag som krockar lämnas över till en likvärdig kollega.
  for (const o of omflyttningar) {
    const pass = SCHEMA.find((p) => p.id === o.passId);
    if (pass) pass.stadare = o.till;
  }
  bokning.datum = f.datum;
  bokning.start = f.start;
  bokning.slut = f.slut;
  bokning.stadare = f.stadare;

  const referens = `OMB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  f.utford = `Bekräftad bokning ${bokning.id}: ${veckodag(bokning.datum)} ${bokning.datum} kl. ${bokning.start}–${bokning.slut}, ${bokning.tjanst}, städare ${bokning.stadare}. Tidigare: ${fore}. Gäller bara detta tillfälle. Referens: ${referens}.`;
  return `SPARAT I BOKNINGSSYSTEMET (testläge). ${f.utford} Visa kunden den bekräftade bokningen och referensen.`;
}
