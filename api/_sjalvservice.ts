// Självservice i chatten: en legitimerad kund ser och bokar om sina egna
// städningar.
//
// VAD AI:N FÅR GÖRA
// Modellen får bara läsa och föreslå, genom tre smala verktyg:
//   hamta_bokningar      – kundens egna kommande bokningar
//   hitta_nya_tider      – verkligt bokningsbara tider för en av dem
//   forbered_ombokning   – en sammanfattning med avgift, som kunden får bekräfta
// Själva ändringen kan modellen inte göra. Den görs bara när kunden trycker
// "Bekräfta ombokning" i kortet, och då anropar widgeten servern direkt
// (bekraftaOmbokning nedan). Modellen får veta resultatet först efteråt.
//
// SÄKERHET
//  * Vem kunden är avgörs av legitimeringen, som lever på servern och är
//    kopplad till samtalets id. Modellen och klienten skickar aldrig kund-id.
//  * Varje bokning, tid och förslag kontrolleras mot den legitimerade kunden.
//    En bokning som inte är kundens får samma svar som en som inte finns.
//  * Tider och förslag har id:n som servern skapat, sparade per samtal.
//    Modellen kan inte hitta på en tid som går att boka.
//  * Precis innan ändringen: är förslaget kundens, fortfarande giltigt, har
//    bokningen inte ändrats, gäller samma avgift och är tiden fortfarande
//    ledig? Därefter skrivs ändringen, läses tillbaka och jämförs. Först när
//    den stämmer får kunden "Klart".
//  * Ett lås per bokning gör att dubbelklick aldrig ger två ändringar, och
//    ett förslag som redan genomförts ger samma svar igen.
//  * Allt loggas: kund, bokning, personal, före och efter, regel, avgift,
//    bekräftelse, systemets svar och utfall.
//
// FÖRTURSREGELN (Mikaela 2026-09-24)
// Befintliga återkommande kunder har förtur hos sin ordinarie städare. Har
// städaren ett ENGÅNGSUPPDRAG hos en annan kund (storstädning, en enstaka
// hemstädning …) på tiden kunden vill ha, får den återkommande kunden tiden:
// engångsuppdraget sätts till "Utan anställd" och info@stodona.se får ett
// mejl så att kundservice hittar en ny städare. Den andra kunden nämns
// aldrig i chatten. Går ombokningen inte igenom läggs städaren tillbaka på
// engångsuppdraget.
//
// LÄGEN
//  * Testläget (lokalt/preview): testvärld eller riktiga TimeWave, testinloggning.
//  * Personalchatten (stodona.se/personalchatt): inloggad personal väljer kund.
//  * Kunderna (vanliga chatten): identifiering med SMS-kod (api/_smskod.ts),
//    bara när huvudbrytaren SJALVSERVICE_KUNDER=true är på.

import * as lagring from './_lagring';
import { skickaSms } from './_smskod';
import { personalchattPa } from './_personal';
import { bedom } from './_avbokningsregler';
import { type Bokning, type Bokningssystem, type Engangsuppdrag, type Kund, type Lucka, avtryck, datumText, idagSthlm, laggTillDagar, minuter, sthlmTidpunkt } from './_bokningssystem';
import { testsystem, testkund, hamtaSimulering, sattSimulering, aterstallVarld, SIMULERINGAR, TESTKUNDLISTA as TESTVARLDENS_KUNDER, type Simulering } from './_testBokningssystem';
import { sokKunderPaNamn, type Kundtraff } from './_timewaveSystem';
import { customerBookingActions } from './_customerBookingActions';


import { timewaveKonfigurerad } from './_timewave';

const LOKAL = process.env.STODONA_LOKAL === 'true';

/**
 * Testläget: CHAT_KUNDTJANST=true OCH antingen lokal dev-server eller en
 * Vercel preview-deploy. I produktion är det av även om variabeln råkar vara satt.
 */
export const TESTLAGE =
  process.env.CHAT_KUNDTJANST === 'true' && process.env.VERCEL_ENV !== 'production' && (LOKAL || process.env.VERCEL_ENV === 'preview');

/**
 * Självservicen KAN köras här: i testläget, eller när personalchatten finns
 * (PERSONAL_PW satt). Vem som faktiskt får använda den avgörs per anrop i
 * api/chat.ts och api/kund-bankid.ts – i produktion bara inloggad personal
 * på den gömda sidan, aldrig den vanliga chatten.
 */
/**
 * HUVUDBRYTARE för kunderna: SJALVSERVICE_KUNDER=true slår på självservicen i
 * den vanliga chatten på stodona.se, där kunden identifierar sig med SMS-kod
 * till sitt registrerade mobilnummer. Av som standard – slås på först när Mikaela säger till.
 */
export const KUNDER_PA = process.env.SJALVSERVICE_KUNDER === 'true';

export const SJALVSERVICE_PA = (TESTLAGE || personalchattPa() || KUNDER_PA) && lagring.lagringFinns();

/** Får det här anropet använda självservicen? */
export function sjalvserviceTillaten(personalchatt: boolean): boolean {
  return SJALVSERVICE_PA && (TESTLAGE || personalchatt || KUNDER_PA);
}

const VERIFIERING_MINUTER = 30;
const SIMULERAD_SIGNERING_MS = 1000;
const LUCKOR_MINUTER = 30;
/** Så länge en sammanfattning går att bekräfta. Sedan måste tiden hämtas igen. */
const FORSLAG_MINUTER = 10;
/** Stodonas regel (Mikaela 2026-09-24): kunden får alltid två förslag – helst på två olika dagar. */
const ANTAL_FORSLAG = 2;
const MAX_PERIOD_DAGAR = 14;
/**
 * Vilket bokningssystem testläget använder:
 *  test     – påhittad värld (standard)
 *  timewave – RIKTIGA bokningar i TimeWave, men bara för kundnumren i
 *             SJALVSERVICE_TESTKUNDNUMMER. Läser just nu; skriver inte.
 */
const SYSTEM: 'test' | 'timewave' = process.env.SJALVSERVICE_SYSTEM === 'timewave' && timewaveKonfigurerad() ? 'timewave' : 'test';
/** Kundnummer som får testinloggas (utan SMS-kod) mot riktiga TimeWave. Bara lokalt och i personalchatten. */
const TW_TESTKUNDER = (process.env.SJALVSERVICE_TESTKUNDNUMMER ?? '').split(',').map((s) => s.trim()).filter((s) => /^\d{1,10}$/.test(s));
/**
 * "*" = alla kundnummer. Tillåts bara lokalt och i personalchatten, där
 * personalen provar chatten som valfri kund (Mikaela 2026-09-24). Den
 * vanliga chatten når aldrig inloggningen – se sjalvserviceTillaten.
 */
const ALLA_KUNDER =
  (process.env.SJALVSERVICE_TESTKUNDNUMMER ?? '').split(',').map((s) => s.trim()).includes('*') && (LOKAL || personalchattPa() || KUNDER_PA);
const tillatenKund = (nummer: string) => ALLA_KUNDER || TW_TESTKUNDER.includes(nummer);
const LOGG_NYCKEL = `sjalv:logg:${SYSTEM}`;

function system(samtalsId: string): Bokningssystem {
  return SYSTEM === 'timewave' ? customerBookingActions() : testsystem(samtalsId);
}

function slumpId(prefix: string): string {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${[...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 8).toUpperCase()}`;
}

// ─── Testinloggning (lokalt och i personalchatten) ───────────────────────────

interface Verifiering {
  kundId: string;
  namn: string;
  giltigTill: number;
}

interface Pagaende {
  samtalsId: string;
  /** Testinloggning: kunden och när den "blir klar". */
  kundId?: string;
  namn?: string;
  klarTid?: number;
}

/** Vilka man kan logga in som i testinloggningen (lokalt och i personalchatten). */
export const TESTKUNDLISTA =
  SYSTEM === 'timewave'
    ? [...(ALLA_KUNDER ? [{ id: '*', namn: 'valfritt kundnummer' }] : []), ...TW_TESTKUNDER.map((nr) => ({ id: nr, namn: `kund ${nr} (riktig TimeWave-data)` }))]
    : TESTVARLDENS_KUNDER;

/**
 * TESTINLOGGNING – ingen SMS-kod. Den som testar väljer vilken testkund hen
 * "är". Finns bara i testläget; kunderna identifierar sig med SMS-kod (api/_smskod.ts).
 */
export async function startaSignering(samtalsId: string, testkundId: string): Promise<{ ordernummer: string } | { fel: string }> {
  if (!SJALVSERVICE_PA) return { fel: 'Legitimering är inte påslagen.' };
  // Mot riktiga TimeWave: bara kundnummer som uttryckligen är tillåtna för test.
  const kund = SYSTEM === 'timewave' ? (/^\d{1,10}$/.test(testkundId) && tillatenKund(testkundId) ? await system(samtalsId).hamtaKund(testkundId) : null) : testkund(testkundId);
  if (!kund) return { fel: 'Välj en av testkunderna i listan.' };
  const ordernummer = crypto.randomUUID();
  await lagring.spara(`sjalv:bankid:${ordernummer}`, { samtalsId, kundId: kund.id, namn: kund.namn, klarTid: Date.now() + SIMULERAD_SIGNERING_MS } satisfies Pagaende, 300);
  return { ordernummer };
}

/** Först när signeringen är klar kopplas kunden till samtalet. */
export async function kollaSignering(
  samtalsId: string,
  ordernummer: string
): Promise<{ status: 'vantar' } | { status: 'klar'; namn: string } | { fel: string }> {
  const order = await lagring.hamta<Pagaende>(`sjalv:bankid:${ordernummer}`);
  // Ordern måste höra till det här samtalet – annars går den inte att kapa.
  if (!order || order.samtalsId !== samtalsId) return { fel: 'Legitimeringen hittades inte. Börja om.' };

  if (!order.kundId || !order.namn || Date.now() < (order.klarTid ?? 0)) return { status: 'vantar' };
  await lagring.taBort(`sjalv:bankid:${ordernummer}`);
  await lagring.spara(
    `sjalv:verifierad:${samtalsId}`,
    { kundId: order.kundId, namn: order.namn, giltigTill: Date.now() + VERIFIERING_MINUTER * 60000 } satisfies Verifiering,
    VERIFIERING_MINUTER * 60
  );
  return { status: 'klar', namn: order.namn };
}

// ─── Personalchatten: välj kund på namn ──────────────────────────────────────

/** Namnen på kontona som delar ett mobilnummer – visas för den som angett rätt SMS-kod. */
export async function kontonForVal(samtalsId: string, nummer: string[]): Promise<{ nummer: string; namn: string }[]> {
  const sys = system(samtalsId);
  const konton = await Promise.all(nummer.map(async (nr) => ({ nummer: nr, namn: (await sys.hamtaKund(nr).catch(() => null))?.namn ?? '' })));
  return konton.filter((k) => k.namn);
}

/** Kopplar samtalet till kunden (personalens val, eller en godkänd SMS-kod). */
export async function valjKundFor(samtalsId: string, kundnummer: string): Promise<Kund | null> {
  if (!/^\d{1,10}$/.test(kundnummer) || !tillatenKund(kundnummer)) return null;
  const kund = await system(samtalsId).hamtaKund(kundnummer);
  if (!kund) return null;
  await lagring.spara(
    `sjalv:verifierad:${samtalsId}`,
    { kundId: kund.id, namn: kund.namn, giltigTill: Date.now() + VERIFIERING_MINUTER * 60000 } satisfies Verifiering,
    VERIFIERING_MINUTER * 60
  );
  return kund;
}

/**
 * Personalen nämner en kund vid namn. Bara i personalchatten – anroparen
 * (api/chat.ts) erbjuder verktyget enbart där. En enda träff väljs direkt.
 */
export async function sokKund(samtalsId: string, namn: string): Promise<string> {
  if (!SJALVSERVICE_PA) return 'Funktionen finns inte.';
  const fraga = namn.trim().slice(0, 80);
  let traffar: Kundtraff[];
  try {
    traffar =
      SYSTEM === 'timewave'
        ? await sokKunderPaNamn(fraga)
        : TESTVARLDENS_KUNDER.map((k) => ({ nummer: k.id, namn: k.namn.replace(/ \(kund \d+\)$/, ''), ort: 'testvärlden' })).filter((k) =>
            fraga.toLowerCase().split(/\s+/).every((o) => k.namn.toLowerCase().includes(o))
          );
  } catch (fel) {
    console.error('självservice: kundsökningen misslyckades', fel);
    return 'Kundregistret gick inte att söka i just nu. Be personalen försöka igen om en stund, eller ange kundnumret.';
  }
  if (!traffar.length) {
    return `Ingen aktiv kund matchar "${fraga}". Säg det och be personalen kontrollera stavningen eller ange kundnumret.`;
  }
  if (traffar.length === 1) {
    const kund = await valjKundFor(samtalsId, traffar[0].nummer);
    if (!kund) return 'Kunden hittades men gick inte att välja. Be personalen ange kundnumret.';
    return `EN TRÄFF – vald kund: ${kund.namn}${traffar[0].ort ? `, ${traffar[0].ort}` : ''} (kund ${kund.id}). Säg kort vem du hittat och fortsätt DIREKT med ärendet: hamta_bokningar och sedan det personalen bad om.`;
  }
  return [
    `${traffar.length} kunder matchar "${fraga}"${traffar.length >= 8 ? ' (visar de första 8 – be gärna om efternamn eller ort)' : ''}:`,
    ...traffar.map((k) => `kund ${k.nummer}: ${k.namn}${k.ort ? `, ${k.ort}` : ''}`),
    'Fråga vilken det gäller med knappar, etikett "Namn, Ort (nummer)", t.ex. "Emma Selenius, Solna (12345)". När personalen valt: valj_kund med kundnumret.',
  ].join('\n');
}

/** Personalen har valt kund (eller skrivit ett kundnummer). */
export async function valjKund(samtalsId: string, kundnummer: string): Promise<string> {
  if (!SJALVSERVICE_PA) return 'Funktionen finns inte.';
  const kund = await valjKundFor(samtalsId, kundnummer.replace(/\D/g, ''));
  if (!kund) return 'Det kundnumret finns inte bland de aktiva kunderna. Be personalen kontrollera det.';
  return `Vald kund: ${kund.namn} (kund ${kund.id}). Fortsätt DIREKT med ärendet: hamta_bokningar och sedan det personalen bad om.`;
}

export async function avbrytSignering(samtalsId: string, ordernummer: string): Promise<void> {
  const order = await lagring.hamta<Pagaende>(`sjalv:bankid:${ordernummer}`);
  if (!order || order.samtalsId !== samtalsId) return;
  await lagring.taBort(`sjalv:bankid:${ordernummer}`);
}

/** Den legitimerade kunden i samtalet, eller null. Enda källan till vem kunden är. */
export async function verifieradKund(samtalsId: string): Promise<Verifiering | null> {
  if (!SJALVSERVICE_PA) return null;
  const v = await lagring.hamta<Verifiering>(`sjalv:verifierad:${samtalsId}`);
  return v && Date.now() < v.giltigTill ? v : null;
}

const EJ_LEGITIMERAD =
  'Kunden är INTE legitimerad, eller så har legitimeringen gått ut. Visa inga uppgifter, ändra ingenting och bekräfta ingenting om något konto eller någon bokning. Be kunden legitimera sig och avsluta meddelandet med raden [[bankid]]. Du minns vad kunden ville – be inte kunden upprepa det.';

// ─── Text till modellen ──────────────────────────────────────────────────────

function langdText(b: { start: string; slut: string }): string {
  const t = (minuter(b.slut) - minuter(b.start)) / 60;
  return `${String(t).replace('.', ',')} ${t === 1 ? 'timme' : 'timmar'}`;
}

function bokningsrad(b: Bokning): string {
  return `${b.id} · ${datumText(b.datum)} (${b.datum}) kl. ${b.start}–${b.slut} · ${b.tjanst}, ${langdText(b)} · ${b.adress} · städare ${b.stadare.namn}${
    b.aterkommande ? ' · del av en återkommande serie (en ändring gäller bara det här tillfället)' : ' · enstaka bokning'
  }`;
}

function villkorsText(b: Bokning): string {
  const bed = bedom(b.tjanst, sthlmTidpunkt(b.datum, b.start), b.prisKr);
  const timmar = Math.max(0, Math.floor(bed.timmarKvar));
  return bed.inomFrist
    ? `VILLKOR (${b.id}): städningen börjar om ${timmar} timmar och ligger inom avbokningsfristen (${bed.regel.beskrivning}). En ändring kostar därför ${bed.avgiftKr} kr enligt villkoren. Nämn INTE avgiften nu – den visas i sammanfattningen i slutet, innan kunden bekräftar. Antyd aldrig att avgiften kan strykas.`
    : `VILLKOR (${b.id}): ändringen görs i god tid (${bed.regel.beskrivning}), så den kostar ingenting. Nämn det inte nu – det står i sammanfattningen i slutet.`;
}

// ─── Verktyg: hämta bokningar ────────────────────────────────────────────────

export async function hamtaBokningar(samtalsId: string): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;
  const bokningar = await system(samtalsId).hamtaBokningar(kund.kundId);
  const minuterKvar = Math.max(0, Math.round((kund.giltigTill - Date.now()) / 60000));
  const huvud = `Legitimerad kund: ${kund.namn}. Legitimeringen gäller ${minuterKvar} minuter till.`;
  if (!bokningar.length) return `${huvud}\nKunden har inga kommande bokningar.`;
  return [
    huvud,
    'Kommande bokningar (id:t är internt – skriv det aldrig till kunden):',
    ...bokningar.map(bokningsrad),
    'Fortsätt med det kunden redan bett om. Ange dag, datum, tid och städare när du nämner en bokning.',
  ].join('\n');
}

// ─── Verktyg: hitta nya tider ────────────────────────────────────────────────

interface SparadeLuckor {
  kundId: string;
  bokningId: string;
  luckor: (Lucka & { id: string })[];
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export async function hittaNyaTider(
  samtalsId: string,
  indata: { bokningId: string; franDatum: string; tillDatum: string; sammaStadare: boolean; onskadTid?: string }
): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;
  const sys = system(samtalsId);
  const bokning = await sys.hamtaBokning(indata.bokningId);
  // Samma svar oavsett om bokningen inte finns eller tillhör någon annan.
  if (!bokning || bokning.kundId !== kund.kundId) {
    return 'Bokningen finns inte bland kundens bokningar. Hämta kundens bokningar med hamta_bokningar och fråga vilken som avses.';
  }
  if (bokning.ejAndringsbar) {
    return `Det här tillfället kan inte ändras i chatten (${bokning.ejAndringsbar}). Säg det vänligt och erbjud att lämna över till kundservice.`;
  }
  if (!indata.sammaStadare && !sys.kanSokaKollegor) {
    return 'Att leta tider hos andra städare än den ordinarie går inte i chatten ännu. Säg det och erbjud att lämna över till kundservice, eller att leta en annan period med samma städare.';
  }

  const imorgon = laggTillDagar(idagSthlm(), 1);
  // Utan önskemål: leta nära den ordinarie dagen – från två dagar före till en vecka efter.
  let fran = DATUM.test(indata.franDatum) ? indata.franDatum : laggTillDagar(bokning.datum, -2);
  if (fran < imorgon) fran = imorgon;
  let till = DATUM.test(indata.tillDatum) && indata.tillDatum >= fran ? indata.tillDatum : laggTillDagar(bokning.datum, 7);
  if (till < fran) till = laggTillDagar(fran, 6);
  if (till > laggTillDagar(fran, MAX_PERIOD_DAGAR - 1)) till = laggTillDagar(fran, MAX_PERIOD_DAGAR - 1);

  const bara = indata.sammaStadare ? bokning.stadare : null;
  const onskad = indata.onskadTid && /^\d{2}:\d{2}$/.test(indata.onskadTid) ? indata.onskadTid : undefined;
  // Har kunden inte bett om en viss dag föreslås aldrig samma dag som nu – det är ingen ombokning.
  const egenDag = DATUM.test(indata.franDatum) && indata.franDatum <= bokning.datum && (!DATUM.test(indata.tillDatum) || indata.tillDatum >= bokning.datum);
  const alla = (await sys.ledigaLuckor(bokning, fran, till, bara, onskad)).filter((l) => egenDag || l.datum !== bokning.datum);
  const hittade = valjForslag(alla, onskad ?? bokning.start);
  const luckor = hittade.map((l, i) => ({ ...l, id: `T${i + 1}` }));
  await lagring.spara(`sjalv:luckor:${samtalsId}`, { kundId: kund.kundId, bokningId: bokning.id, luckor } satisfies SparadeLuckor, LUCKOR_MINUTER * 60);

  const period = `${datumText(fran)} – ${datumText(till)}`;
  const nuvarande = `Bokningen som ska flyttas: ${bokningsrad(bokning)}`;

  if (!luckor.length) {
    return [
      nuvarande,
      indata.sammaStadare && sys.kanSokaKollegor
        ? `INGA LEDIGA TIDER med ${bokning.stadare.namn} under ${period}. Säg det till kunden, utan att förklara varför, och fråga om du ska leta efter tider med någon annan i teamet. Avsluta med [[val: Ja, visa andra tider | Nej, behåll min nuvarande bokning]]. Kunden kan också välja en annan period.`
        : indata.sammaStadare
          ? `INGA LEDIGA TIDER med ${bokning.stadare.namn} under ${period}. Säg det kort, utan att förklara varför. Erbjud BARA det som går: [[val: Sök veckan efter | Behåll min nuvarande bokning]] – väljer kunden att söka vidare, använd hitta_nya_tider igen från dagen efter ${till}. Föreslå aldrig en annan städare.`
        : `INGA LEDIGA TIDER hos någon i teamet under ${period}. Fråga om kunden vill prova en annan period, eller erbjud att lämna över till kundservice.`,
      villkorsText(bokning),
    ].join('\n');
  }

  return [
    nuvarande,
    `Verkligt bokningsbara tider ${period} (kontrollerade mot schema, frånvaro, restid, område och tjänstens längd):`,
    ...luckor.map(
      (l) =>
        `${l.id}: ${datumText(l.datum)} (${l.datum}) kl. ${l.start}–${l.slut} · ${l.stadare.namn}${
          l.stadare.id === bokning.stadare.id ? ' (ordinarie städare)' : ` (ANNAN STÄDARE än ordinarie ${bokning.stadare.namn} – säg det tydligt)`
        }`
    ),
    villkorsText(bokning),
    luckor.length === 1
      ? 'Det finns bara EN ledig tid. Visa den som knapp och fråga om kunden vill ha den eller prova en annan period.'
      : 'Ge kunden exakt de här två förslagen, som knappar med korta etiketter, t.ex. "Mån 28/9 10:00". Inga andra tider finns – hitta aldrig på några. Vill kunden ha andra tider: sök igen med en annan period. När kunden valt: forbered_ombokning med tidens id (T1 eller T2).',
  ].join('\n');
}

/**
 * Två förslag av alla lediga tider: kundens önskade klockslag först om det
 * finns, annars den tidigaste tiden – och sedan en tid en annan dag. Finns
 * bara en dag blir det två tider samma dag. Samma klockslag som bokningen
 * har nu föredras, eftersom kunden ofta vill behålla sin vanliga tid.
 */
function valjForslag(alla: Lucka[], klockslag: string): Lucka[] {
  if (alla.length <= ANTAL_FORSLAG) return alla;
  const forsta = alla.find((l) => l.start === klockslag) || alla[0];
  const valda = [forsta];
  const annanDag =
    alla.find((l) => l.datum !== forsta.datum && l.start === klockslag) || alla.find((l) => l !== forsta && l.datum !== forsta.datum);
  valda.push(annanDag ?? alla.find((l) => l !== forsta)!);
  return valda.sort((a, b) => `${a.datum}${a.start}`.localeCompare(`${b.datum}${b.start}`));
}

// ─── Verktyg: förbered ombokning ─────────────────────────────────────────────

interface Forslag {
  id: string;
  samtalsId: string;
  kundId: string;
  bokningId: string;
  tjanst: string;
  aterkommande: boolean;
  fore: { datum: string; start: string; slut: string; stadare: { id: string; namn: string } };
  efter: Lucka;
  avtryck: string;
  regel: string;
  avgiftKr: number;
  timmarKvar: number;
  skapad: number;
  status: 'vantar' | 'klar' | 'misslyckad';
  svar?: Bekraftelse;
}

export async function forberedOmbokning(samtalsId: string, indata: { bokningId: string; tidId: string }): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;

  const sparade = await lagring.hamta<SparadeLuckor>(`sjalv:luckor:${samtalsId}`);
  const lucka = sparade && sparade.kundId === kund.kundId && sparade.bokningId === indata.bokningId ? sparade.luckor.find((l) => l.id === indata.tidId) : null;
  if (!lucka) return 'Tiden finns inte bland de senast hämtade tiderna, eller så har de gått ut. Hämta tider igen med hitta_nya_tider. Hitta aldrig på en tid.';

  const bokning = await system(samtalsId).hamtaBokning(indata.bokningId);
  if (!bokning || bokning.kundId !== kund.kundId) return 'Bokningen finns inte bland kundens bokningar. Hämta kundens bokningar igen.';

  const bed = bedom(bokning.tjanst, sthlmTidpunkt(bokning.datum, bokning.start), bokning.prisKr);
  const forslag: Forslag = {
    id: slumpId('OF'),
    samtalsId,
    kundId: kund.kundId,
    bokningId: bokning.id,
    tjanst: bokning.tjanst,
    aterkommande: bokning.aterkommande,
    fore: { datum: bokning.datum, start: bokning.start, slut: bokning.slut, stadare: bokning.stadare },
    efter: { datum: lucka.datum, start: lucka.start, slut: lucka.slut, stadare: lucka.stadare },
    avtryck: avtryck(bokning),
    regel: bed.regel.id,
    avgiftKr: bed.avgiftKr,
    timmarKvar: bed.timmarKvar,
    skapad: Date.now(),
    status: 'vantar',
  };
  await lagring.spara(`sjalv:forslag:${forslag.id}`, forslag, 24 * 3600);

  const byte = lucka.stadare.id !== bokning.stadare.id;
  return [
    `Sammanfattningen är klar: ${datumText(bokning.datum)} kl. ${bokning.start} med ${bokning.stadare.namn} → ${datumText(lucka.datum)} kl. ${lucka.start}–${lucka.slut} med ${lucka.stadare.namn}${byte ? ' (BYTE av städare)' : ''}.`,
    bed.avgiftKr > 0
      ? `Avgift enligt villkoren: ${bed.avgiftKr} kr (ändringen görs inom avbokningsfristen, ${bed.regel.beskrivning}). Avgiften kommer SIST: skriv först att sammanfattningen är klar, och avsluta meningen med avgiften, t.ex. "… Observera att ändringen kostar ${bed.avgiftKr} kr enligt avbokningsvillkoren."`
      : 'Avgift: 0 kr. Nämn den inte.',
    `Skriv EN kort mening, till exempel "Här är en sammanfattning – tryck Bekräfta ombokning om allt stämmer." och avsluta med den här raden exakt: [[bekrafta:${forslag.id}]]`,
    'Kortet visar nuvarande och ny tid, städare, avgift och knapparna. Upprepa inte allt i texten.',
    'Du kan INTE genomföra ändringen själv. Den görs först när kunden trycker på Bekräfta ombokning, och då svarar systemet kunden direkt. Säg aldrig att bokningen är ändrad.',
    `Sammanfattningen gäller i ${FORSLAG_MINUTER} minuter.`,
  ].join('\n');
}

// ─── Kortet i chatten ────────────────────────────────────────────────────────

export interface Kort {
  id: string;
  tjanst: string;
  fore: { datum: string; tid: string; stadare: string };
  efter: { datum: string; tid: string; stadare: string };
  byteAvStadare: boolean;
  bara_detta_tillfalle: boolean;
  avgiftKr: number;
  avgiftText: string;
  status: 'vantar' | 'klar' | 'misslyckad' | 'utgangen';
  /** Testläge mot riktiga TimeWave där ingenting skrivs. */
  lasläge: boolean;
}

/** Kortets innehåll kommer från servern – aldrig från det modellen skrivit. */
export async function hamtaKort(samtalsId: string, forslagId: string): Promise<Kort | null> {
  const kund = await verifieradKund(samtalsId);
  const f = await lagring.hamta<Forslag>(`sjalv:forslag:${forslagId}`);
  if (!f || f.samtalsId !== samtalsId || (kund && kund.kundId !== f.kundId)) return null;
  const utgangen = f.status === 'vantar' && (!kund || Date.now() - f.skapad > FORSLAG_MINUTER * 60000);
  return {
    id: f.id,
    tjanst: f.tjanst,
    fore: { datum: datumText(f.fore.datum), tid: `${f.fore.start}–${f.fore.slut}`, stadare: f.fore.stadare.namn },
    efter: { datum: datumText(f.efter.datum), tid: `${f.efter.start}–${f.efter.slut}`, stadare: f.efter.stadare.namn },
    byteAvStadare: f.fore.stadare.id !== f.efter.stadare.id,
    bara_detta_tillfalle: f.aterkommande,
    avgiftKr: f.avgiftKr,
    avgiftText:
      f.avgiftKr > 0
        ? `Städningen börjar om ${Math.max(0, Math.floor(f.timmarKvar))} timmar och ligger inom avbokningsfristen. Enligt villkoren debiteras ${f.avgiftKr} kr för ändringen.`
        : 'Ändringen görs i god tid och kostar ingenting.',
    status: utgangen ? 'utgangen' : f.status,
    lasläge: !system(samtalsId).kanSkriva,
  };
}

// ─── Bekräfta ombokning (bara från knappen, aldrig från modellen) ────────────

export type Utfall =
  | 'SUCCESS'
  | 'EJ_LEGITIMERAD'
  | 'OGILTIGT_FORSLAG'
  | 'UTGANGET'
  | 'PAGAR_REDAN'
  | 'BOKNINGEN_ANDRAD'
  | 'VILLKOR_ANDRADE'
  | 'TIDEN_UPPTAGEN'
  | 'SYSTEMFEL'
  | 'EJ_VERIFIERAD'
  | 'SKRIVNING_AV';

export interface Bekraftelse {
  utfall: Utfall;
  /** Visas för kunden som Camillas svar och sparas i samtalet. */
  text: string;
  /** Sätts när chatten ska fortsätta av sig själv, t.ex. hämta nya tider. */
  fortsatt?: string;
}

interface Loggpost {
  tid: string;
  kanal: 'chatbot';
  system: string;
  samtalsId: string;
  kundId: string;
  bokningId: string;
  forslagId: string;
  anstalldFore: string;
  anstalldEfter: string;
  fore: string;
  efter: string;
  regel: string;
  avgiftKr: number;
  kundenBekraftade: string;
  systemsvar: string;
  verifierad: boolean;
  utfall: Utfall;
  /** Engångsuppdrag som satts till "Utan anställd" enligt förtursregeln. */
  forturUtanAnstalld: string[];
  /** Mejlet till info@stodona.se, om ett skickades (i testläget: hade skickats). */
  mejl: string;
  utfortAv: string;
  /** Ekonomianteckningen om avgiften, när ombokningen kostade något. */
  ekonomi?: string;
  /** Bekräftelse-SMS till kunden efter en genomförd ombokning. */
  sms?: string;
}

interface Extra {
  forturUtanAnstalld: string[];
  mejl: string;
  /** "kunden", eller namnet på den i personalen som provade i personalmiljön. */
  utfortAv: string;
  /** Ekonomianteckningen om avgiften: "skapad", "mejlad" eller felet. Tom när ingen avgift. */
  ekonomi?: string;
  /** Bekräftelse-SMS till kunden efter en genomförd ombokning. */
  sms?: string;
}

async function logga(f: Forslag, systemnamn: string, bekraftadTid: string, utfall: Utfall, systemsvar: string, verifierad: boolean, extra: Extra): Promise<void> {
  const post: Loggpost = {
    tid: new Date().toISOString(),
    kanal: 'chatbot',
    system: systemnamn,
    samtalsId: f.samtalsId,
    kundId: f.kundId,
    bokningId: f.bokningId,
    forslagId: f.id,
    anstalldFore: `${f.fore.stadare.id} ${f.fore.stadare.namn}`,
    anstalldEfter: `${f.efter.stadare.id} ${f.efter.stadare.namn}`,
    fore: `${f.fore.datum} ${f.fore.start}-${f.fore.slut}`,
    efter: `${f.efter.datum} ${f.efter.start}-${f.efter.slut}`,
    regel: f.regel,
    avgiftKr: f.avgiftKr,
    kundenBekraftade: bekraftadTid,
    systemsvar,
    verifierad,
    utfall,
    ...extra,
  };
  console.log(`[självservice] ${JSON.stringify(post)}`);
  try {
    await lagring.laggTillILista(LOGG_NYCKEL, post, 5000);
  } catch (fel) {
    console.error('självservice: loggen kunde inte sparas', fel);
  }
}

/**
 * Mejl till kundservice. I testläget skickas ingenting – mejlet syns i
 * loggen och i testbanderollen i stället, så info@ inte fylls med testdata.
 */
async function mejlaKundservice(amne: string, text: string): Promise<string> {
  const helt = `${amne}\n\n${text}`;
  if (TESTLAGE) {
    console.log(`\n[testläge] mejl till info@stodona.se skickas INTE:\n${helt}\n`);
    return `[TESTLÄGE – skickades inte] ${helt}`;
  }
  const nyckel = process.env.RESEND_API_KEY;
  if (!nyckel) throw new Error('RESEND_API_KEY saknas');
  const svar = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${nyckel}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Stodona Chatten <info@stodona.se>', to: 'info@stodona.se', subject: amne, text }),
  });
  if (!svar.ok) throw new Error(`Resend svarade ${svar.status}`);
  return helt;
}

function engangsrad(e: Engangsuppdrag): string {
  return `- ${e.id} · ${e.tjanst} · ${datumText(e.datum)} ${e.start}–${e.slut} · ${e.kund} · ${e.adress} · tidigare städare: ${e.stadare.namn} (${e.stadare.id})`;
}

const KUNDSERVICE_VAL = '[[val: Ja, hjälp mig via kundservice | Nej tack]]';

/** @param utfortAv namnet i personalmiljön, när det är personalen som provar – annars null (kunden själv). */
/** @param origin sajtens adress, för bekräftelse-SMS:et via api/sms-skicka. */
export async function bekraftaOmbokning(samtalsId: string, forslagId: string, utfortAv: string | null = null, origin = ''): Promise<Bekraftelse> {
  const bekraftadTid = new Date().toISOString();
  const kund = await verifieradKund(samtalsId);
  if (!kund) return { utfall: 'EJ_LEGITIMERAD', text: 'Din legitimering har gått ut, så ingenting är ändrat. Legitimera dig igen så fortsätter vi.\n[[bankid]]' };

  const nyckel = `sjalv:forslag:${forslagId}`;
  const f = await lagring.hamta<Forslag>(nyckel);
  if (!f || f.samtalsId !== samtalsId || f.kundId !== kund.kundId) {
    return { utfall: 'OGILTIGT_FORSLAG', text: 'Jag hittar inte den sammanfattningen längre, så ingenting är ändrat. Vill du att jag hämtar lediga tider igen?\n[[val: Ja, visa lediga tider | Nej tack]]' };
  }
  // Samma förslag två gånger ger samma svar – aldrig en dubbel ändring.
  if (f.status !== 'vantar' && f.svar) return f.svar;
  if (Date.now() - f.skapad > FORSLAG_MINUTER * 60000) {
    return { utfall: 'UTGANGET', text: 'Sammanfattningen hann gå ut, så ingenting är ändrat. Tiderna kan ha ändrats – jag hämtar aktuella tider åt dig.', fortsatt: 'Sammanfattningen gick ut. Hämta aktuella lediga tider för samma bokning och period.' };
  }

  if (!(await lagring.lasa(`sjalv:las:${f.bokningId}`, 60))) {
    return { utfall: 'PAGAR_REDAN', text: 'Ändringen håller redan på att genomföras. Vänta ett ögonblick.' };
  }

  const sys = system(samtalsId);
  const extra: Extra = { forturUtanAnstalld: [], mejl: '', utfortAv: utfortAv ?? 'kunden' };
  const avsluta = async (utfall: Utfall, text: string, systemsvar: string, verifierad: boolean, slutgiltig: boolean, fortsatt?: string): Promise<Bekraftelse> => {
    const svar: Bekraftelse = { utfall, text, ...(fortsatt ? { fortsatt } : {}) };
    // Ett slutgiltigt utfall sparas på förslaget, så ett nytt klick ger samma svar.
    if (slutgiltig) await lagring.spara(nyckel, { ...f, status: utfall === 'SUCCESS' ? 'klar' : 'misslyckad', svar }, 24 * 3600);
    await logga(f, sys.namn, bekraftadTid, utfall, systemsvar, verifierad, extra);
    await lagring.taBort(`sjalv:las:${f.bokningId}`);
    return svar;
  };

  const ursprunglig = `${datumText(f.fore.datum)} kl. ${f.fore.start}–${f.fore.slut} med ${f.fore.stadare.namn}`;

  try {
    // 1. Bokningen ska vara kundens och se ut som när sammanfattningen gjordes.
    const bokning = await sys.hamtaBokning(f.bokningId);
    if (!bokning || bokning.kundId !== kund.kundId || avtryck(bokning) !== f.avtryck) {
      return avsluta('BOKNINGEN_ANDRAD', 'Bokningen har ändrats sedan jag tog fram sammanfattningen, så jag har inte gjort någon ändring. Jag hämtar dina bokningar igen.', 'ingen skrivning: avtrycket skilde sig', false, true, 'Bokningen hade ändrats. Hämta kundens bokningar igen och fråga hur kunden vill göra.');
    }

    // 2. Samma villkor som kunden såg. Har fristen passerats sedan dess ska kunden se den nya avgiften.
    const bed = bedom(bokning.tjanst, sthlmTidpunkt(bokning.datum, bokning.start), bokning.prisKr);
    if (bed.avgiftKr !== f.avgiftKr) {
      return avsluta('VILLKOR_ANDRADE', `Villkoren hann ändras medan du tittade: ändringen kostar nu ${bed.avgiftKr} kr enligt avbokningsreglerna. Ingenting är ändrat.\n[[val: Visa ny sammanfattning | Behåll min bokning]]`, `ingen skrivning: avgift ${f.avgiftKr} → ${bed.avgiftKr}`, false, true);
    }

    // 3. Är tiden fortfarande ledig? Med förtur: vilka engångsuppdrag får lämna plats?
    const kontroll = await sys.kontrolleraLucka(bokning, f.efter);
    if (kontroll.ledig === false) {
      return avsluta('TIDEN_UPPTAGEN', 'Den tiden hann tyvärr bli upptagen, så ingenting är ändrat. Jag hämtar nya lediga tider åt dig.', 'ingen skrivning: tiden var inte längre ledig', false, true, 'Tiden hann bli upptagen. Hämta nya lediga tider för samma bokning, period och städarval.');
    }

    // Läsläge mot riktiga TimeWave: allt är kontrollerat, men ingenting skrivs.
    if (!sys.kanSkriva) {
      return avsluta('SKRIVNING_AV', `TESTLÄGE: allt är kontrollerat – bokningen är din, avgiften stämmer och tiden är ledig i TimeWave just nu – men chatten skriver inte till TimeWave ännu. Ingenting är ändrat; din bokning är kvar ${ursprunglig}.`, 'ingen skrivning: läsläge', false, true);
    }

    const ombokning = `Kund ${f.kundId} (${kund.namn}), bokning ${f.bokningId} (${f.tjanst}): ${datumText(f.fore.datum)} ${f.fore.start}–${f.fore.slut} → ${datumText(f.efter.datum)} ${f.efter.start}–${f.efter.slut}, ${f.efter.stadare.namn} (${f.efter.stadare.id}).`;

    // 4a. Förtursregeln: engångsuppdragen blir "Utan anställd" – och kontrolleras.
    const lossade: Engangsuppdrag[] = [];
    const backa = async (): Promise<string[]> => {
      const kvar: string[] = [];
      for (const e of lossade) {
        const r = await sys.atertilldela(e.id, e.stadare).catch(() => ({ ok: false as const, fel: 'undantag' }));
        if (r.ok === false || (await sys.anstalldPa(e.id)) !== e.stadare.id) kvar.push(e.id);
      }
      return kvar;
    };
    const backaOchMeddela = async (orsak: string) => {
      if (!lossade.length) return '';
      const ejBackade = await backa();
      if (!ejBackade.length) return ' Engångsuppdragen fick tillbaka sin städare.';
      const text = `ÅTGÄRDA: en ombokning i chatten avbröts (${orsak}) och följande engångsuppdrag kunde inte få tillbaka sin städare – de står som Utan anställd:\n${lossade.filter((e) => ejBackade.includes(e.id)).map(engangsrad).join('\n')}\n\nOmbokningen som avbröts: ${ombokning}`;
      await sys.skapaArende('Chatten: engångsuppdrag utan anställd efter avbruten ombokning', text);
      extra.mejl = await mejlaKundservice('ÅTGÄRDA: engångsuppdrag utan anställd (chatten)', text).catch((fel) => `MEJLET MISSLYCKADES: ${String(fel)}`);
      return ` Engångsuppdrag som inte kunde återställas: ${ejBackade.join(', ')}.`;
    };

    for (const e of kontroll.lossas) {
      const r = await sys.lossaAnstalld(e.id);
      if (r.ok === false || (await sys.anstalldPa(e.id)) !== null) {
        const info = await backaOchMeddela(`kunde inte lossa ${e.id}`);
        return avsluta('SYSTEMFEL', `Jag kunde tyvärr inte genomföra ändringen just nu. Din bokning är oförändrad: ${ursprunglig}. Vill du att kundservice hjälper dig?\n${KUNDSERVICE_VAL}`, `förtur: kunde inte lossa ${e.id}: ${r.ok === false ? r.fel : 'anställd låg kvar'}.${info}`, false, true);
      }
      lossade.push(e);
      extra.forturUtanAnstalld.push(e.id);
    }

    // 4b. Flytta kundens tillfälle.
    const skrivning = await sys.flyttaTillfalle(bokning, f.efter, utfortAv ? `Ombokad i personalchatten av ${utfortAv}` : undefined);
    if (skrivning.ok === false) {
      if (skrivning.osaker) {
        // Vi vet inte om kundens bokning flyttades, så engångsuppdragen rörs inte – kundservice reder ut.
        const text = `Oklart om ombokningen gick igenom. ${ombokning} ${skrivning.fel}${lossade.length ? `\nUtan anställd enligt förtursregeln:\n${lossade.map(engangsrad).join('\n')}` : ''}`;
        await sys.skapaArende('Chatten: kontrollera ombokning', text);
        if (lossade.length) extra.mejl = await mejlaKundservice('KONTROLLERA: ombokning och engångsuppdrag utan anställd (chatten)', text).catch((fel) => `MEJLET MISSLYCKADES: ${String(fel)}`);
        return avsluta('EJ_VERIFIERAD', `Jag kunde inte bekräfta att ändringen gick igenom, så jag vill inte säga att den är klar. Jag har bett kundservice kontrollera bokningen. Vill du att de också hör av sig till dig?\n${KUNDSERVICE_VAL}`, skrivning.fel, false, true);
      }
      const info = await backaOchMeddela('ombokningen misslyckades');
      return avsluta('SYSTEMFEL', `Jag kunde tyvärr inte genomföra ändringen just nu. Din bokning är oförändrad: ${ursprunglig}. Vill du att kundservice hjälper dig?\n${KUNDSERVICE_VAL}`, `${skrivning.fel}${info}`, false, true);
    }

    // 5. Läs tillbaka och jämför. Först när allt stämmer är det klart.
    const efter = await sys.lasTillbaka(bokning);
    const stammer =
      efter !== null &&
      efter.kundId === kund.kundId &&
      efter.datum === f.efter.datum &&
      efter.start === f.efter.start &&
      efter.slut === f.efter.slut &&
      efter.stadare.id === f.efter.stadare.id;
    if (!stammer) {
      const text = `Systemet svarade OK (${skrivning.referens}) men bokningen ser inte ut som väntat. ${ombokning} Läst: ${efter ? avtryck(efter) : 'saknas'}.${lossade.length ? `\nUtan anställd enligt förtursregeln:\n${lossade.map(engangsrad).join('\n')}` : ''}`;
      await sys.skapaArende('Chatten: ombokning kunde inte verifieras', text);
      if (lossade.length) extra.mejl = await mejlaKundservice('KONTROLLERA: ombokning och engångsuppdrag utan anställd (chatten)', text).catch((fel) => `MEJLET MISSLYCKADES: ${String(fel)}`);
      return avsluta('EJ_VERIFIERAD', `Jag kunde inte bekräfta att ändringen gick igenom, så jag vill inte säga att den är klar. Jag har bett kundservice kontrollera bokningen. Vill du att de också hör av sig till dig?\n${KUNDSERVICE_VAL}`, `OK ${skrivning.referens}, men återläsningen skilde sig`, false, true);
    }

    // 6. Förtur: kundservice får veta vilka engångsuppdrag som behöver en ny städare.
    if (lossade.length) {
      const text = `En återkommande kund har bokat om i chatten och fått förtur hos sin ordinarie städare. Följande engångsuppdrag står nu som "Utan anställd" och behöver en ny städare:\n${lossade.map(engangsrad).join('\n')}\n\nOmbokningen: ${ombokning}`;
      extra.mejl = await mejlaKundservice(`Engångsuppdrag utan anställd – ${lossade.map((e) => e.id).join(', ')} (chatten)`, text).catch((fel) => {
        console.error('självservice: mejlet om förtur gick inte iväg', fel);
        return `MEJLET MISSLYCKADES: ${String(fel)}`;
      });
      if (extra.mejl.startsWith('MEJLET MISSLYCKADES')) await sys.skapaArende('Chatten: engångsuppdrag utan anställd', text);
    }

    // 7. Avgift för sen ombokning: ekonomianteckning på kunden i TimeWave, så
    //    att den faktureras. Går den inte att skapa mejlas ekonomin i stället –
    //    avgiften får aldrig bara försvinna.
    if (f.avgiftKr > 0) {
      const rubrik = `Avgift sen ombokning ${f.avgiftKr} kr – ska faktureras`;
      const text = [
        `Sen ombokning via Stodonas chatt (${extra.utfortAv === 'kunden' ? 'kunden själv' : `personalen: ${extra.utfortAv}`}).`,
        `Kund: ${kund.namn} (kund ${f.kundId}).`,
        `Tillfälle: ${f.tjanst}, ${datumText(f.fore.datum)} ${f.fore.start}–${f.fore.slut} → flyttat till ${datumText(f.efter.datum)} ${f.efter.start}–${f.efter.slut}.`,
        `Ombokningen gjordes ${Math.max(0, Math.floor(f.timmarKvar))} timmar före start, inom avbokningsfristen (regel ${f.regel}).`,
        `Avgift enligt villkoren: ${f.avgiftKr} kr (50 % av tillfällets kostnad). Kunden informerades och bekräftade i chatten ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
      ].join('\n');
      const anteckning = sys.skapaEkonomianteckning
        ? await sys.skapaEkonomianteckning(f.kundId, rubrik, text).catch((fel) => ({ ok: false as const, fel: String(fel) }))
        : { ok: false as const, fel: 'systemet saknar ekonomianteckningar' };
      if (anteckning.ok === true) {
        extra.ekonomi = 'ekonomianteckning skapad i TimeWave';
      } else if (anteckning.ok === false) {
        console.error('självservice: ekonomianteckningen kunde inte skapas', anteckning.fel);
        extra.ekonomi = `ekonomianteckning misslyckades (${anteckning.fel.slice(0, 120)}) – mejlad till info@`;
        extra.mejl = await mejlaKundservice(`FAKTURERA: ${rubrik} (chatten)`, `Ekonomianteckningen kunde inte skapas i TimeWave – lägg in avgiften manuellt.\n\n${text}`).catch(
          (fel) => `MEJLET MISSLYCKADES: ${String(fel)}`
        );
      }
    }

    // 8. Bekräftelse: SMS till kundens mobilnummer i TimeWave och en samlad
    //    sammanfattning till info@stodona.se (Mikaela 2026-09-25).
    const nyTid = `${datumText(f.efter.datum)} kl. ${f.efter.start}–${f.efter.slut}`;
    const mobil = sys.kundensMobil ? await sys.kundensMobil(f.kundId).catch(() => null) : null;
    const smsText =
      `Hej! Din städning är ombokad till ${nyTid} med ${f.efter.stadare.namn}.` +
      (f.avgiftKr > 0 ? ` Enligt villkoren debiteras ${f.avgiftKr} kr för ändringen.` : '') +
      ' Frågor? Hör av dig via kundportalen stodona.twportal.se eller chatten på www.stodona.se. Hälsningar Stodona';
    let smsSkickat = false;
    if (!mobil) {
      extra.sms = 'inget giltigt mobilnummer i TimeWave – inget SMS';
    } else if (TESTLAGE) {
      extra.sms = `TESTLÄGE – skickades inte: ${smsText}`;
    } else {
      const svar = await skickaSms(mobil, smsText, origin);
      smsSkickat = svar.ok;
      extra.sms = svar.ok === true ? `skickat till …${mobil.slice(-2)}` : `misslyckades (${svar.fel})`;
    }
    const sammanfattning = [
      `Ombokning genomförd i chatten av ${extra.utfortAv === 'kunden' ? 'kunden själv (inloggad med SMS-kod)' : `personalen: ${extra.utfortAv}`}.`,
      '',
      `Kund: ${kund.namn} (kund ${f.kundId})`,
      `Tjänst: ${f.tjanst}`,
      `Före: ${datumText(f.fore.datum)} kl. ${f.fore.start}–${f.fore.slut}, ${f.fore.stadare.namn}`,
      `Efter: ${nyTid}, ${f.efter.stadare.namn}${f.efter.stadare.id !== f.fore.stadare.id ? ' (BYTE av städare)' : ''}`,
      `Avgift: ${f.avgiftKr > 0 ? `${f.avgiftKr} kr – ${extra.ekonomi ?? ''}` : '0 kr'}`,
      extra.forturUtanAnstalld.length ? `Förtur: ${extra.forturUtanAnstalld.join(', ')} står nu utan anställd` : null,
      `SMS-bekräftelse till kunden: ${extra.sms}`,
      `TimeWave: ${skrivning.referens}, verifierad`,
    ]
      .filter((rad) => rad !== null)
      .join('\n');
    const sammanfattningMejl = await mejlaKundservice(`Ombokning via chatten – ${kund.namn} (kund ${f.kundId})`, sammanfattning).catch(
      (fel) => `MEJLET MISSLYCKADES: ${String(fel)}`
    );
    extra.mejl = extra.mejl ? `${extra.mejl}\n\n---\n\n${sammanfattningMejl}` : sammanfattningMejl;

    const byte = f.efter.stadare.id !== f.fore.stadare.id;
    const text = [
      'Klart! ✓ Din städning är ombokad.',
      `${datumText(f.efter.datum).replace(/^./, (c) => c.toUpperCase())} kl. ${f.efter.start}–${f.efter.slut}`,
      byte ? `${f.efter.stadare.namn} kommer den gången.` : `${f.efter.stadare.namn} kommer som vanligt.`,
      f.aterkommande ? 'Dina övriga städningar är oförändrade.' : '',
      f.avgiftKr > 0 ? `Enligt villkoren debiteras ${f.avgiftKr} kr för ändringen.` : '',
      smsSkickat ? 'Du får också en bekräftelse med SMS.' : '',
    ]
      .filter(Boolean)
      .join('\n');
    return avsluta('SUCCESS', text, `OK ${skrivning.referens}`, true, true);
  } catch (fel) {
    console.error('självservice: ombokningen avbröts', fel);
    await sys.skapaArende('Chatten: ombokning avbröts av ett fel', `Kund ${f.kundId}, bokning ${f.bokningId}. ${String(fel)}`).catch(() => {});
    return avsluta('EJ_VERIFIERAD', `Något gick fel och jag kan inte bekräfta att ändringen gick igenom, så jag vill inte säga att den är klar. Jag har bett kundservice kontrollera bokningen. Vill du att de också hör av sig till dig?\n${KUNDSERVICE_VAL}`, `undantag: ${String(fel).slice(0, 200)}`, false, true);
  }
}

// ─── Testlägets verktyg (banderollen i chatten) ──────────────────────────────

export interface Testlage {
  testlage: true;
  /** 'test' = lokalt/preview; 'personal' = den gömda personalchatten; 'kund' = vanliga chatten (ingen banderoll). */
  lage: 'test' | 'personal' | 'kund';
  system: 'test' | 'timewave';
  skriver: boolean;
  inloggad: { namn: string; kundId: string } | null;
  simulera: Simulering;
  logg: Loggpost[];
}

export async function testlageStatus(samtalsId: string, personalchatt = false): Promise<Testlage | null> {
  if (!SJALVSERVICE_PA) return null;
  const kund = await verifieradKund(samtalsId);
  const logg = (await lagring.lasLista<Loggpost>(LOGG_NYCKEL, 200)).filter((p) => p.samtalsId === samtalsId).slice(0, 10);
  const sys = system(samtalsId);
  return { testlage: true, lage: TESTLAGE ? 'test' : personalchatt ? 'personal' : 'kund', system: sys.namn, skriver: sys.kanSkriva, inloggad: kund ? { namn: kund.namn, kundId: kund.kundId } : null, simulera: SYSTEM === 'test' ? await hamtaSimulering(samtalsId) : 'normal', logg };
}

export async function testlageAtgard(samtalsId: string, atgard: string): Promise<boolean> {
  if (!SJALVSERVICE_PA || SYSTEM !== 'test') return false;
  if (atgard === 'aterstall') {
    await aterstallVarld(samtalsId);
    return true;
  }
  if ((SIMULERINGAR as string[]).includes(atgard)) {
    await sattSimulering(samtalsId, atgard as Simulering);
    return true;
  }
  return false;
}
