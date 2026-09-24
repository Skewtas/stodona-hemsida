// Självservicens bokningssystem mot RIKTIGA TimeWave.
//
// TILLFÄLLEN: med datumfilter (/missions?filter[startdate]&filter[enddate])
// returnerar TimeWave varje tillfälle i en serie som en egen mission med egen
// bokningsrad (bookingline_id) – med redan gjorda flyttar inräknade. Utan
// datumfilter visas bara ett tillfälle per serie. Testat live 2026-09-24.
//
// LEDIGA TIDER räknas fram för kundens ordinarie städare ur
//  * arbetstiden i /employees/{id} (availability, udda/jämna veckor tolkas)
//  * städarens alla tillfällen i perioden (/missions?filter[employee_id] + datum)
//  * engångsjobb och övriga rader per dag (/workorderlines?filter[start_date])
//  * 30 minuters restid före och efter varje uppdrag
// Frånvaro ligger i TimeWave som vanliga rader i schemat och blockerar därför.
//
// SKRIVNING: POST /missions/deviations flyttar just den bokningsraden (det
// tillfället) till nytt datum och ny tid – testat live 2026-09-24. Ändringen
// läses tillbaka och jämförs innan kunden får "Klart". Kräver
// SJALVSERVICE_TW_SKRIV=true.
//
// INTE KLART ÄNNU: andra städare än den ordinarie, förtur och
// engångsbokningar hos kunden.

import {
  twFlyttaTillfalle,
  twGet,
  twGetAlla,
  type TwAnstalld,
  type TwArbetsorderrad,
  type TwKlient,
  type TwMission,
  type TwMissionAnstalld,
} from './_timewave';
import {
  type Bokning,
  type Bokningssystem,
  type Kund,
  type Lucka,
  idagSthlm,
  laggTillDagar,
  minuter,
  sthlmTidpunkt,
  tidText,
  veckodagNr,
} from './_bokningssystem';

const RESTID_MINUTER = 30;
const STEG_MINUTER = 30;
/** Hur långt fram kundens bokningar visas. */
const HORISONT_DAGAR = 56;
const SKRIVNING_AV = 'SKRIVNING AVSTÄNGD: chatten skriver inte till TimeWave (SJALVSERVICE_TW_SKRIV). Ingenting ändrades.';
const SKRIVER = process.env.SJALVSERVICE_TW_SKRIV === 'true';

const INTERVALL_DAGAR: Record<number, number> = { 1: 7, 2: 14, 3: 21, 4: 28 };

const klientCache = new Map<string, TwKlient>();

async function klientForNummer(nummer: string): Promise<TwKlient | null> {
  const cachad = klientCache.get(nummer);
  if (cachad) return cachad;
  const svar = await twGet<{ data?: TwKlient[] | TwKlient }>(`/clients/findByNumber/${encodeURIComponent(nummer)}`);
  const lista = Array.isArray(svar.data) ? svar.data : svar.data ? [svar.data] : [];
  // Exakt träff på kundnumret, och aldrig en borttagen kund.
  const traffar = lista.filter((k) => String(k.number) === nummer && !k.deleted);
  if (traffar.length !== 1) return null;
  klientCache.set(nummer, traffar[0]);
  return traffar[0];
}

/**
 * Aktiva kunder med ett visst personnummer (12 siffror). TimeWave har
 * personnummer i blandade format (10 eller 12 siffror, med eller utan
 * bindestreck), så alla varianter söks och jämförs siffra för siffra.
 */
export async function kunderForPersonnummer(personnummer: string): Promise<TwKlient[]> {
  if (!/^\d{12}$/.test(personnummer)) return [];
  const kort = personnummer.slice(2);
  const varianter = [personnummer, kort, `${personnummer.slice(0, 8)}-${personnummer.slice(8)}`, `${kort.slice(0, 6)}-${kort.slice(6)}`];
  const svar = await Promise.all(
    varianter.map((v) => twGet<{ data?: (TwKlient & { personal_number?: string })[] }>(`/clients?filter[personal_number]=${encodeURIComponent(v)}`).then((r) => r.data ?? []))
  );
  const traffar = new Map<number, TwKlient>();
  for (const k of svar.flat()) {
    const siffror = String(k.personal_number ?? '').replace(/\D/g, '');
    const samma = siffror === personnummer || (siffror.length === 10 && siffror === kort);
    if (samma && !k.deleted) traffar.set(k.id, k);
  }
  return [...traffar.values()];
}

// ─── Namnsökning (bara personalchatten) ──────────────────────────────────────

export interface Kundtraff {
  nummer: string;
  namn: string;
  ort: string;
}

/**
 * TimeWave kan inte söka kunder på namn (bara id, nummer, e-post och
 * personnummer). Personalchatten hämtar därför alla aktiva kunder – fyra
 * anrop à 1 000 – och söker själv. Registret (nummer, namn, ort) hålls bara i
 * minnet i tio minuter och sparas aldrig.
 */
let register: { hamtat: number; kunder: Kundtraff[] } | null = null;
const REGISTER_MS = 10 * 60 * 1000;

async function kundregister(): Promise<Kundtraff[]> {
  if (register && Date.now() - register.hamtat < REGISTER_MS) return register.kunder;
  // Med page[size] heter sidnumret page[number] – "page=2" ger sida 1 igen.
  const forsta = await twGet<{ data?: TwKlient[]; last_page?: number }>('/clients?page[size]=1000&page[number]=1');
  const sidor = Math.min(Number(forsta.last_page ?? 1), 20);
  const resten = await Promise.all(
    Array.from({ length: Math.max(0, sidor - 1) }, (_, i) => twGet<{ data?: TwKlient[] }>(`/clients?page[size]=1000&page[number]=${i + 2}`).then((r) => r.data ?? []))
  );
  const kunder = [...(forsta.data ?? []), ...resten.flat()]
    .filter((k) => !k.deleted && k.status === 'active' && k.number)
    .map((k) => ({
      nummer: String(k.number),
      namn: [k.first_name, k.last_name].filter(Boolean).join(' ').trim() || String(k.company_name ?? '').trim(),
      ort: (k.addresses ?? []).find((a) => !a.deleted && a.city)?.city?.trim() ?? '',
    }))
    .filter((k) => k.namn);
  register = { hamtat: Date.now(), kunder };
  return kunder;
}

const jamforbar = (t: string) => t.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();

/** Aktiva kunder vars namn innehåller alla ord i frågan. Exakt namn först. */
export async function sokKunderPaNamn(fraga: string): Promise<Kundtraff[]> {
  const ord = jamforbar(fraga).split(' ').filter((o) => o.length >= 2);
  if (!ord.length) return [];
  const exakt = jamforbar(fraga);
  return (await kundregister())
    .filter((k) => ord.every((o) => jamforbar(k.namn).includes(o)))
    .sort((a, b) => Number(jamforbar(b.namn) === exakt) - Number(jamforbar(a.namn) === exakt) || a.namn.localeCompare(b.namn, 'sv'))
    .slice(0, 8);
}

function hhmm(tid: string): string {
  return String(tid ?? '').slice(0, 5);
}

function tolkaId(id: string): { mission: number; rad: number } | null {
  const m = /^M(\d{1,10})-B(\d{1,10})$/.exec(id);
  return m ? { mission: Number(m[1]), rad: Number(m[2]) } : null;
}

function fornamn(namn: string): string {
  const f = String(namn ?? '').trim().split(/\s+/)[0] ?? '';
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : 'din städare';
}

/** Kundens kostnad för ett tillfälle, så gott den går att läsa ur tjänsteraden. */
function prisFor(m: TwMission, start: string, slut: string): number {
  const tjanst = m.services?.[0];
  if (!tjanst?.price) return 0;
  const timmar = (minuter(slut) - minuter(start)) / 60;
  const antal = Number(tjanst.quantity ?? 1);
  return Math.round(tjanst.price * antal * (/tim/i.test(tjanst.unit ?? '') ? timmar : 1));
}

/** Bokningens id: mission och bokningsrad – ett tillfälle. */
function tillBokning(m: TwMission, rad: TwMissionAnstalld): Bokning {
  const k = m.client;
  const start = hhmm(rad.starttime);
  const slut = hhmm(rad.endtime);
  // "Utan anställd" i TimeWave: ingen städare är tilldelad än.
  const utanStadare = !rad.id || /^utan\b/i.test(String(rad.name ?? '').trim());
  return {
    id: `M${m.id}-B${rad.bookingline_id}`,
    kundId: String(k?.number ?? ''),
    tjanst: m.services?.[0]?.name ?? 'Städning',
    datum: rad.startdate,
    start,
    slut,
    stadare: utanStadare ? { id: '', namn: 'ingen städare tilldelad ännu' } : { id: String(rad.id), namn: fornamn(rad.name) },
    adress: [k?.address, [k?.postal_code, k?.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    omrade: k?.workarea_name ?? '',
    prisKr: prisFor(m, start, slut),
    aterkommande: Boolean(INTERVALL_DAGAR[Number(m.recurrencyinterval_id)]),
    ...(utanStadare ? { ejAndringsbar: 'Ingen städare är tilldelad än, så kundservice behöver hjälpa till med ändringen.' } : {}),
  };
}

// ─── Städarens schema ────────────────────────────────────────────────────────

interface Upptaget {
  nyckel: string;
  datum: string;
  start: number;
  slut: number;
}

function isoVecka(datum: string): number {
  const d = new Date(`${datum}T12:00:00Z`);
  const dag = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dag + 3);
  const forstaTorsdag = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - forstaTorsdag.getTime()) / 86400000 - 3 + ((forstaTorsdag.getUTCDay() + 6) % 7)) / 7);
}

const VECKODAGSNYCKEL = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Arbetstiden en viss dag, eller null. Udda/jämna veckor tolkas; okända mönster räknas som ledig dag. */
function arbetstid(anstalld: TwAnstalld, datum: string): { start: number; slut: number } | null {
  for (const block of anstalld.availability ?? []) {
    if (!block?.days?.[VECKODAGSNYCKEL[veckodagNr(datum)]] || !block.starttime || !block.endtime) continue;
    const veckor = (block.weeks ?? 'all').toLowerCase();
    const udda = isoVecka(datum) % 2 === 1;
    if (veckor === 'all' || (veckor === 'odd' && udda) || (veckor === 'even' && !udda)) {
      return { start: minuter(hhmm(block.starttime)), slut: minuter(hhmm(block.endtime)) };
    }
  }
  return null;
}

async function schema(anstalldId: string, fran: string, till: string): Promise<{ anstalld: TwAnstalld; upptaget: Upptaget[] }> {
  const datum: string[] = [];
  for (let d = fran; d <= till; d = laggTillDagar(d, 1)) if (veckodagNr(d) >= 1 && veckodagNr(d) <= 5) datum.push(d);

  const [anstalldSvar, missions, rader] = await Promise.all([
    twGet<{ data?: TwAnstalld } & TwAnstalld>(`/employees/${encodeURIComponent(anstalldId)}`),
    twGetAlla<TwMission>(`/missions?filter[employee_id]=${encodeURIComponent(anstalldId)}&filter[startdate]=${fran}&filter[enddate]=${till}`),
    Promise.all(datum.map((d) => twGet<{ data?: TwArbetsorderrad[] }>(`/workorderlines?filter[start_date]=${d}`).then((r) => r.data ?? []))),
  ]);
  const anstalld = (anstalldSvar.data ?? anstalldSvar) as TwAnstalld;

  const upptaget: Upptaget[] = [];
  for (const m of missions) {
    for (const rad of m.employees ?? []) {
      if (String(rad.id) !== anstalldId || rad.cancelled || !rad.starttime || !rad.endtime) continue;
      if (rad.startdate < fran || rad.startdate > till) continue;
      upptaget.push({ nyckel: `M${m.id}-B${rad.bookingline_id}`, datum: rad.startdate, start: minuter(hhmm(rad.starttime)), slut: minuter(hhmm(rad.endtime)) });
    }
  }
  for (const rad of rader.flat()) {
    if (rad.deleted || !(rad.employees ?? []).some((e) => String(e.id) === anstalldId)) continue;
    const u = { nyckel: `W${rad.id}`, datum: rad.start_date, start: minuter(hhmm(rad.start_time)), slut: minuter(hhmm(rad.end_time)) };
    // Samma uppdrag kan finnas både som mission och som rad – räkna det en gång.
    if (!upptaget.some((x) => x.datum === u.datum && x.start === u.start && x.slut === u.slut)) upptaget.push(u);
  }
  return { anstalld, upptaget };
}

function ledig(anstalld: TwAnstalld, upptaget: Upptaget[], datum: string, start: number, slut: number, utom: string): boolean {
  const tid = arbetstid(anstalld, datum);
  if (!tid || start < tid.start || slut > tid.slut) return false;
  return !upptaget.some(
    (u) => u.datum === datum && u.nyckel !== utom && u.start < slut + RESTID_MINUTER && u.slut + RESTID_MINUTER > start
  );
}

async function hamtaMission(missionId: number): Promise<TwMission | null> {
  const svar = await twGet<{ data?: TwMission[] | TwMission }>(`/missions/${missionId}`);
  return (Array.isArray(svar.data) ? svar.data[0] : svar.data) ?? null;
}

// ─── Gränssnittet ────────────────────────────────────────────────────────────

export function timewaveSystem(): Bokningssystem {
  return {
    namn: 'timewave',
    kanSokaKollegor: false,
    kanSkriva: SKRIVER,

    async hamtaKund(kundNummer) {
      const k = await klientForNummer(kundNummer);
      if (!k) return null;
      const namn = [k.first_name, k.last_name].filter(Boolean).join(' ') || k.company_name || `kund ${k.number}`;
      return { id: String(k.number), namn } satisfies Kund;
    },

    async hamtaBokningar(kundNummer) {
      const k = await klientForNummer(kundNummer);
      if (!k) return [];
      const idag = idagSthlm();
      const missions = await twGetAlla<TwMission>(`/missions?filter[client_id]=${k.id}&filter[startdate]=${idag}&filter[enddate]=${laggTillDagar(idag, HORISONT_DAGAR)}`);
      const nu = Date.now();
      const bokningar: Bokning[] = [];
      for (const m of missions) {
        // Dubbelkolla att uppdraget verkligen är kundens.
        if (String(m.client?.number) !== String(k.number)) continue;
        for (const rad of m.employees ?? []) {
          if (rad.cancelled || !rad.startdate || sthlmTidpunkt(rad.startdate, hhmm(rad.starttime)) <= nu) continue;
          bokningar.push(tillBokning(m, rad));
        }
      }
      return bokningar.sort((a, b) => `${a.datum}${a.start}`.localeCompare(`${b.datum}${b.start}`));
    },

    async hamtaBokning(bokningId) {
      const id = tolkaId(bokningId);
      if (!id) return null;
      const m = await hamtaMission(id.mission);
      const rad = m?.employees?.find((e) => e.bookingline_id === id.rad && !e.cancelled);
      return m && rad ? tillBokning(m, rad) : null;
    },

    async lasTillbaka(bokning) {
      return this.hamtaBokning(bokning.id);
    },

    async ledigaLuckor(bokning, franDatum, tillDatum, bara, onskadStart) {
      // Bara ordinarie städare i det här steget.
      if (!bara || bara.id !== bokning.stadare.id) return [];
      const imorgon = laggTillDagar(idagSthlm(), 1);
      const fran = franDatum < imorgon ? imorgon : franDatum;
      const till = tillDatum;
      if (till < fran) return [];
      const { anstalld, upptaget } = await schema(bara.id, fran, till);
      const langd = minuter(bokning.slut) - minuter(bokning.start);
      const onskad = onskadStart && /^\d{2}:\d{2}$/.test(onskadStart) ? minuter(onskadStart) : null;

      const luckor: Lucka[] = [];
      for (let datum = fran; datum <= till; datum = laggTillDagar(datum, 1)) {
        const tid = arbetstid(anstalld, datum);
        if (!tid) continue;
        const fria: number[] = [];
        for (let start = tid.start; start + langd <= tid.slut; start += STEG_MINUTER) {
          if (datum === bokning.datum && tidText(start) === bokning.start) continue;
          if (ledig(anstalld, upptaget, datum, start, start + langd, bokning.id)) fria.push(start);
        }
        // Högst två tider per dag, minst tre timmar emellan – önskat klockslag först.
        const dagens: number[] = onskad !== null && fria.includes(onskad) ? [onskad] : [];
        for (const start of fria) {
          if (dagens.length >= 2) break;
          if (dagens.every((d) => Math.abs(d - start) >= 180)) dagens.push(start);
        }
        for (const start of dagens.sort((a, b) => a - b)) {
          luckor.push({ datum, start: tidText(start), slut: tidText(start + langd), stadare: bara });
        }
      }
      return luckor;
    },

    async kontrolleraLucka(bokning, lucka) {
      if (lucka.stadare.id !== bokning.stadare.id) return { ledig: false };
      const { anstalld, upptaget } = await schema(lucka.stadare.id, lucka.datum, lucka.datum);
      return ledig(anstalld, upptaget, lucka.datum, minuter(lucka.start), minuter(lucka.slut), bokning.id)
        ? { ledig: true, lossas: [] }
        : { ledig: false };
    },

    async flyttaTillfalle(bokning, lucka, notering) {
      if (!SKRIVER) return { ok: false, fel: SKRIVNING_AV };
      const id = tolkaId(bokning.id);
      if (!id) return { ok: false, fel: 'Ogiltigt boknings-id.' };
      // Tillfället ska se ut exakt som när kunden bekräftade – annars rör vi det inte.
      const m = await hamtaMission(id.mission);
      const rad = m?.employees?.find((e) => e.bookingline_id === id.rad && !e.cancelled);
      if (!m || !rad || rad.startdate !== bokning.datum || hhmm(rad.starttime) !== bokning.start || String(rad.id) !== bokning.stadare.id) {
        return { ok: false, fel: 'Tillfället har ändrats i TimeWave sedan kunden bekräftade. Ingenting ändrades.' };
      }
      const svar = await twFlyttaTillfalle({
        bokningsrad: rad.bookingline_id,
        datum: lucka.datum,
        start: lucka.start,
        slut: lucka.slut,
        anstalldId: Number(lucka.stadare.id),
        kommentar: `${notering ?? 'Ombokad av kunden i chatten'} (${bokning.datum} ${bokning.start} → ${lucka.datum} ${lucka.start}).`,
      });
      if (svar.ok === false) return { ok: false, fel: svar.fel, osaker: svar.osaker };
      return { ok: true, referens: 'TimeWave-avvikelse' };
    },

    async lossaAnstalld() {
      return { ok: false, fel: 'Förtur finns inte mot TimeWave ännu. Ingenting ändrades.' };
    },
    async atertilldela() {
      return { ok: false, fel: 'Förtur finns inte mot TimeWave ännu. Ingenting ändrades.' };
    },
    async anstalldPa() {
      return undefined;
    },
    async skapaArende(rubrik, text) {
      console.log(`\n[självservice/timewave] ärende skapas inte i TimeWave ännu:\n${rubrik}\n${text}\n`);
    },
  };
}
