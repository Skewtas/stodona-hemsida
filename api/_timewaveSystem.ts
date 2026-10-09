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
// ANDRA STÄDARE: aktiva städare med kundens tjänst i TimeWave (högst 12 per
// sökning), samma schemakontroll som för ordinarie städare. Området vägs inte
// in ännu – bara restid som marginal.
//
// INTE KLART ÄNNU: förtur och engångsbokningar hos kunden.

import {
  twFlyttaTillfalle,
  twBytAnstalld,
  twSkapaAnteckning,
  twAvbokaTillfalle,
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
  type Engangsuppdrag,
  type Kund,
  type Kontroll,
  type Lucka,
  idagSthlm,
  laggTillDagar,
  minuter,
  sthlmTidpunkt,
  tidText,
  veckodagNr,
} from './_bokningssystem';
import { mobilnummer, platshallare } from './_smskod';

const RESTID_MINUTER = 30;
const STEG_MINUTER = 30;
/** Hur långt fram kundens bokningar visas. */
const HORISONT_DAGAR = 56;
const SKRIVNING_AV = 'SKRIVNING AVSTÄNGD: chatten skriver inte till TimeWave (SJALVSERVICE_TW_SKRIV). Ingenting ändrades.';
const SKRIVER = process.env.SJALVSERVICE_TW_SKRIV === 'true';
/** Byte av städare (verifierat live 2026-09-25). Kan stängas av med SJALVSERVICE_BYT_STADARE=false. */
const BYT_STADARE = process.env.SJALVSERVICE_BYT_STADARE !== 'false';
const FORTUR = process.env.SJALVSERVICE_FORTUR !== 'false';

/**
 * Ett ENGÅNGSUPPDRAG i TimeWave: typen "single" (flyttstädning, storstädning,
 * byggstädning …) eller en "serie" med intervall 6 / tjänsten "… ett tillfälle",
 * som i praktiken är en enstaka städning. Allt annat räknas som återkommande.
 */
function arEngang(m: TwMission): boolean {
  return m.type !== 'reccurent' || Number(m.recurrencyinterval_id) === 6 || /ett tillf[aä]lle|eng[aå]ng/i.test(m.services?.[0]?.name ?? '');
}

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
  // Kundens rabatt i procent på tjänsteraden (t.ex. 50) ska med – annars blir
  // både priset och avgiften vid sen ändring räknade på fullpris.
  const rabatt = Math.min(100, Math.max(0, Number(tjanst.discount ?? 0) || 0));
  return Math.round(tjanst.price * antal * (/tim/i.test(tjanst.unit ?? '') ? timmar : 1) * (1 - rabatt / 100));
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
    tjanstId: m.services?.[0]?.id ? String(m.services[0].id) : undefined,
    datum: rad.startdate,
    start,
    slut,
    stadare: utanStadare ? { id: '', namn: 'ingen städare tilldelad ännu' } : { id: String(rad.id), namn: fornamn(rad.name) },
    adress: [k?.address, [k?.postal_code, k?.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    omrade: k?.workarea_name ?? '',
    prisKr: prisFor(m, start, slut),
    // Kundtyp 1 = privatperson (RUT-avdrag), 2 = företag.
    rut: Number(k?.type) === 1,
    aterkommande: !arEngang(m),
    ...(utanStadare ? { ejAndringsbar: 'Ingen städare är tilldelad än, så kundservice behöver hjälpa till med ändringen.' } : {}),
  };
}

// ─── Städarens schema ────────────────────────────────────────────────────────

interface Upptaget {
  nyckel: string;
  datum: string;
  start: number;
  slut: number;
  /** Satt när det är en annan kunds engångsuppdrag – kan lämna plats enligt förtursregeln. */
  engang?: Engangsuppdrag;
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

/** Alla arbetsorderrader som startar i perioden – samma för alla städare, så de kan hämtas en gång. */
async function raderIPeriod(fran: string, till: string): Promise<TwArbetsorderrad[][]> {
  const datum: string[] = [];
  for (let d = fran; d <= till; d = laggTillDagar(d, 1)) datum.push(d);
  return Promise.all(datum.map((d) => twGetAlla<TwArbetsorderrad>(`/workorderlines?filter[start_date]=${d}`)));
}

async function schema(anstalldId: string, fran: string, till: string, forhamtade?: TwArbetsorderrad[][]): Promise<{ anstalld: TwAnstalld; upptaget: Upptaget[] }> {
  const [anstalldSvar, missions, rader] = await Promise.all([
    twGet<{ data?: TwAnstalld } & TwAnstalld>(`/employees/${encodeURIComponent(anstalldId)}`),
    twGetAlla<TwMission>(`/missions?filter[employee_id]=${encodeURIComponent(anstalldId)}&filter[startdate]=${fran}&filter[enddate]=${till}`),
    forhamtade ?? raderIPeriod(fran, till),
  ]);
  const anstalld = (anstalldSvar.data ?? anstalldSvar) as TwAnstalld;

  const upptaget: Upptaget[] = [];
  for (const m of missions) {
    for (const rad of m.employees ?? []) {
      if (String(rad.id) !== anstalldId || rad.cancelled || !rad.starttime || !rad.endtime) continue;
      if (rad.startdate < fran || rad.startdate > till) continue;
      const nyckel = `M${m.id}-B${rad.bookingline_id}`;
      const start = hhmm(rad.starttime);
      const slut = hhmm(rad.endtime);
      const k = m.client;
      upptaget.push({
        nyckel,
        datum: rad.startdate,
        start: minuter(start),
        slut: minuter(slut),
        ...(arEngang(m)
          ? {
              engang: {
                // Datumet följer med, så att raden kan hittas igen (lossa/återtilldela).
                id: `${nyckel}@${rad.startdate}`,
                kund: `${k?.name ?? 'kund'} (kund ${k?.number ?? '?'})`,
                tjanst: m.services?.[0]?.name ?? 'Städning',
                datum: rad.startdate,
                start,
                slut,
                adress: [k?.address, [k?.postal_code, k?.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
                stadare: { id: anstalldId, namn: fornamn(rad.name) },
              },
            }
          : {}),
      });
    }
  }
  for (const rad of rader.flat()) {
    if (rad.deleted || !(rad.employees ?? []).some((e) => String(e.id) === anstalldId)) continue;
    // Engångsrader finns alltid också som uppdrag (typ "single") och räknas där – med
    // förturen. Arbetsorderraden kan dessutom ligga kvar med städaren efter "Utan anställd".
    if (!rad.recurrencyinterval_id || Number(rad.recurrencyinterval_id) === 6) continue;
    const u = { nyckel: `W${rad.id}`, datum: rad.start_date, start: minuter(hhmm(rad.start_time)), slut: minuter(hhmm(rad.end_time)) };
    // Samma uppdrag kan finnas både som mission och som rad – räkna det en gång.
    if (!upptaget.some((x) => x.datum === u.datum && x.start === u.start && x.slut === u.slut)) upptaget.push(u);
  }
  return { anstalld, upptaget };
}

/**
 * Går tiden att boka? Med förtur (en återkommande kund, Mikaela 2026-09-24/28)
 * räknas andra kunders ENGÅNGSUPPDRAG som lediga: de listas i "lossas" och
 * blir "Utan anställd" först när kunden bekräftar. Återkommande städningar,
 * frånvaro och annat som inte går att identifiera flyttas aldrig.
 */
function prova(anstalld: TwAnstalld, upptaget: Upptaget[], datum: string, start: number, slut: number, utom: string, fortur: boolean): Kontroll {
  const tid = arbetstid(anstalld, datum);
  if (!tid || start < tid.start || slut > tid.slut) return { ledig: false };
  const hinder = upptaget.filter((u) => u.datum === datum && u.nyckel !== utom && u.start < slut + RESTID_MINUTER && u.slut + RESTID_MINUTER > start);
  if (!hinder.length) return { ledig: true, lossas: [] };
  if (!fortur || hinder.some((u) => !u.engang)) return { ledig: false };
  // Ett engångsuppdrag som redan har börjat lämnar aldrig plats.
  if (hinder.some((u) => sthlmTidpunkt(u.datum, tidText(u.start)) <= Date.now())) return { ledig: false };
  return { ledig: true, lossas: hinder.map((u) => u.engang!) };
}

/** Förtur: en återkommande kund får tider där en annan kund har ett engångsuppdrag. */
function harFortur(bokning: Bokning): boolean {
  // Engångsuppdraget flyttas till en ledig kollega (lossaAnstalld). Stängs av
  // med SJALVSERVICE_FORTUR=false.
  return FORTUR && bokning.aterkommande;
}

/** Lediga tider för en städare: högst två per dag, minst tre timmar emellan – önskat klockslag först. */
function luckorFor(anstalld: TwAnstalld, upptaget: Upptaget[], bokning: Bokning, fran: string, till: string, onskad: number | null, stadare: { id: string; namn: string }): Lucka[] {
  const langd = minuter(bokning.slut) - minuter(bokning.start);
  const luckor: Lucka[] = [];
  for (let datum = fran; datum <= till; datum = laggTillDagar(datum, 1)) {
    const tid = arbetstid(anstalld, datum);
    if (!tid) continue;
    const fria: number[] = [];
    /** Tider som blir lediga när ett engångsuppdrag lämnar plats (förtur). */
    const medFortur: number[] = [];
    for (let start = tid.start; start + langd <= tid.slut; start += STEG_MINUTER) {
      if (sthlmTidpunkt(datum, tidText(start)) <= Date.now()) continue;
      if (datum === bokning.datum && tidText(start) === bokning.start && stadare.id === bokning.stadare.id) continue;
      const utfall = prova(anstalld, upptaget, datum, start, start + langd, bokning.id, harFortur(bokning));
      if (utfall.ledig) (utfall.lossas.length ? medFortur : fria).push(start);
    }
    // Helt fria tider först; förturstider fyller på.
    const alla = [...fria, ...medFortur];
    const dagens: number[] = onskad !== null && alla.includes(onskad) ? [onskad] : [];
    for (const start of alla) {
      if (dagens.length >= 2) break;
      if (dagens.every((d) => Math.abs(d - start) >= 180)) dagens.push(start);
    }
    for (const start of dagens.sort((a, b) => a - b)) {
      luckor.push({ datum, start: tidText(start), slut: tidText(start + langd), stadare, ...(medFortur.includes(start) ? { fortur: true } : {}) });
    }
  }
  return luckor;
}

/** Kan städaren utföra tjänsten? (Tjänsterna står på den anställda i TimeWave.) */
function kanUtfora(anstalld: TwAnstalld, tjanstId: string | undefined): boolean {
  if (!tjanstId) return false;
  const tjanster = (anstalld as TwAnstalld & { services?: { id: string | number }[] }).services ?? [];
  return tjanster.some((t) => String(t.id) === tjanstId);
}

/** Högst så många kollegor gås igenom per sökning – annars blir svaret för långsamt. */
const MAX_KOLLEGOR = 12;

async function hamtaMission(missionId: number): Promise<TwMission | null> {
  const svar = await twGet<{ data?: TwMission[] | TwMission }>(`/missions/${missionId}`);
  return (Array.isArray(svar.data) ? svar.data[0] : svar.data) ?? null;
}

/** Uppdraget och bokningsraden för ett engångsuppdrag, id "M{mission}-B{rad}@{datum}". */
export async function engangsuppdrag(uppdragId: string): Promise<{ mission: TwMission; rad: TwMissionAnstalld } | null> {
  const t = /^M(\d{1,10})-B(\d{1,10})@(\d{4}-\d{2}-\d{2})$/.exec(uppdragId);
  if (!t) return null;
  const rader = await twGetAlla<TwMission>(`/missions?filter[id]=${t[1]}&filter[startdate]=${t[3]}&filter[enddate]=${t[3]}`);
  const mission = rader.find((x) => String(x.id) === t[1]);
  const rad = mission?.employees?.find((e) => String(e.bookingline_id) === t[2] && !e.cancelled);
  return mission && rad ? { mission, rad } : null;
}

async function engangsrad(uppdragId: string): Promise<TwMissionAnstalld | null> {
  return (await engangsuppdrag(uppdragId))?.rad ?? null;
}

/**
 * En kollega som kan ta över ett engångsuppdrag: aktiv, har tjänsten i
 * TimeWave, arbetar den tiden och är helt ledig (med restid) – aldrig någon som
 * redan står på samma uppdrag, och aldrig genom att tränga undan något annat.
 */
export async function hittaErsattare(mission: TwMission, rad: TwMissionAnstalld): Promise<{ id: string; namn: string } | null> {
  const tjanstId = mission.services?.[0]?.id;
  if (!tjanstId) return null;
  const redanPa = new Set((mission.employees ?? []).map((e) => String(e.id)));
  const kandidater = (await twGetAlla<TwAnstalld>(`/employees?filter[service_id]=${encodeURIComponent(String(tjanstId))}&filter[status]=active`))
    .filter((a) => !redanPa.has(String(a.id)) && (a.availability ?? []).length > 0)
    .slice(0, MAX_KOLLEGOR);
  if (!kandidater.length) return null;
  const start = minuter(hhmm(rad.starttime));
  const slut = minuter(hhmm(rad.endtime));
  const rader = await raderIPeriod(rad.startdate, rad.startdate);
  for (let i = 0; i < kandidater.length; i += 4) {
    const omgang = await Promise.all(
      kandidater.slice(i, i + 4).map(async (k) => {
        try {
          const { anstalld, upptaget } = await schema(String(k.id), rad.startdate, rad.startdate, rader);
          const utfall = prova(anstalld, upptaget, rad.startdate, start, slut, '', false);
          if (utfall.ledig === false) return null;
          const namn = [anstalld.first_name, anstalld.last_name].filter(Boolean).join(' ') || 'kollega';
          return { id: String(k.id), namn: fornamn(namn) };
        } catch {
          return null;
        }
      })
    );
    const traff = omgang.find((x) => x !== null);
    if (traff) return traff;
  }
  return null;
}

// ─── Gränssnittet ────────────────────────────────────────────────────────────

export function timewaveSystem(): Bokningssystem {
  return {
    namn: 'timewave',
    kanSokaKollegor: BYT_STADARE,
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
      const idag = idagSthlm();
      const fran = franDatum < idag ? idag : franDatum;
      const till = tillDatum;
      if (till < fran) return [];
      const onskad = onskadStart && /^\d{2}:\d{2}$/.test(onskadStart) ? minuter(onskadStart) : null;

      // Ordinarie städare.
      if (bara) {
        if (bara.id !== bokning.stadare.id) return [];
        const { anstalld, upptaget } = await schema(bara.id, fran, till);
        return luckorFor(anstalld, upptaget, bokning, fran, till, onskad, bara);
      }

      // Kollegor: aktiva städare med samma tjänst i TimeWave, utom ordinarie.
      if (!bokning.tjanstId) return [];
      const kandidater = (
        await twGetAlla<TwAnstalld>(`/employees?filter[service_id]=${encodeURIComponent(bokning.tjanstId)}&filter[status]=active`)
      )
        .filter((a) => String(a.id) !== bokning.stadare.id && (a.availability ?? []).length > 0)
        .slice(0, MAX_KOLLEGOR);
      if (!kandidater.length) return [];
      const rader = await raderIPeriod(fran, till);
      const luckor: Lucka[] = [];
      // Fyra åt gången, så att TimeWave inte överbelastas.
      for (let i = 0; i < kandidater.length; i += 4) {
        const omgang = await Promise.all(
          kandidater.slice(i, i + 4).map(async (k) => {
            try {
              const { anstalld, upptaget } = await schema(String(k.id), fran, till, rader);
              const namn = [anstalld.first_name, anstalld.last_name].filter(Boolean).join(' ') || 'kollega';
              return luckorFor(anstalld, upptaget, bokning, fran, till, onskad, { id: String(k.id), namn: fornamn(namn) });
            } catch {
              return [];
            }
          })
        );
        luckor.push(...omgang.flat());
      }
      return luckor.sort((x, y) => `${x.datum}${x.start}`.localeCompare(`${y.datum}${y.start}`));
    },

    async kontrolleraLucka(bokning, lucka) {
      if (sthlmTidpunkt(lucka.datum, lucka.start) <= Date.now()) return { ledig: false };
      const { anstalld, upptaget } = await schema(lucka.stadare.id, lucka.datum, lucka.datum);
      // En kollega måste fortfarande kunna utföra tjänsten.
      if (lucka.stadare.id !== bokning.stadare.id && !kanUtfora(anstalld, bokning.tjanstId)) return { ledig: false };
      const utfall = prova(anstalld, upptaget, lucka.datum, minuter(lucka.start), minuter(lucka.slut), bokning.id, harFortur(bokning));
      if (utfall.ledig === false || !utfall.lossas.length) return utfall;
      // Förtur: varje engångsuppdrag som ska lämna plats måste ha en ledig kollega som kan ta det.
      for (const e of utfall.lossas) {
        const traff = await engangsuppdrag(e.id);
        if (!traff || !(await hittaErsattare(traff.mission, traff.rad))) return { ledig: false };
      }
      return utfall;
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
      if (lucka.stadare.id !== bokning.stadare.id && !BYT_STADARE) {
        return { ok: false, fel: 'Byte av städare är inte påslaget i chatten. Ingenting ändrades.' };
      }
      const svar = await twFlyttaTillfalle({
        bokningsrad: rad.bookingline_id,
        datum: lucka.datum,
        start: lucka.start,
        slut: lucka.slut,
        anstalldId: rad.id,
        kommentar: `${notering ?? 'Ombokad av kunden i chatten'} (${bokning.datum} ${bokning.start} → ${lucka.datum} ${lucka.start}).`,
      });
      if (svar.ok === false) return { ok: false, fel: svar.fel, osaker: svar.osaker };
      // En avvikelse byter aldrig städare – det görs på bokningsraden efteråt.
      if (lucka.stadare.id !== String(rad.id)) {
        const byte = await twBytAnstalld({ bokningsrad: rad.bookingline_id, datum: lucka.datum, start: lucka.start, slut: lucka.slut, nyAnstalldId: Number(lucka.stadare.id) });
        if (byte.ok === false) {
          // Tiden är redan flyttad men med fel städare – kundservice måste rätta. Återläsningen avgör.
          return { ok: false, fel: `Tiden flyttades men städaren kunde inte bytas till ${lucka.stadare.namn}: ${byte.fel}`, osaker: true };
        }
        return { ok: true, referens: 'TimeWave-avvikelse + byte av städare' };
      }
      return { ok: true, referens: 'TimeWave-avvikelse' };
    },

    // Förtursregeln (Mikaela 2026-10-03): engångsuppdraget flyttas till en ledig
    // kollega som kan utföra tjänsten. "Utan anställd" går inte att sätta via
    // API:et (employee 0 ger 500), men byte till en annan städare fungerar.
    // Anroparen kontrollerar efteråt med anstalldPa.
    async lossaAnstalld(uppdragId) {
      if (!SKRIVER) return { ok: false, fel: SKRIVNING_AV };
      const traff = await engangsuppdrag(uppdragId);
      if (!traff) return { ok: false, fel: `Engångsuppdraget ${uppdragId} hittades inte.` };
      const { rad, mission } = traff;
      const ny = await hittaErsattare(mission, rad);
      if (!ny) return { ok: false, fel: `Ingen ledig kollega kan ta engångsuppdraget ${uppdragId}.` };
      const svar = await twBytAnstalld({ bokningsrad: rad.bookingline_id, datum: rad.startdate, start: hhmm(rad.starttime), slut: hhmm(rad.endtime), nyAnstalldId: Number(ny.id) });
      return svar.ok === true ? { ok: true, referens: `ny städare: ${ny.namn} (${ny.id})` } : svar;
    },
    async avbokaTillfalle(bokning) {
      if (!SKRIVER) return { ok: false, fel: SKRIVNING_AV };
      const id = tolkaId(bokning.id);
      if (!id) return { ok: false, fel: 'Ogiltigt boknings-id.' };
      const result = await twAvbokaTillfalle(id.rad);
      return result.ok === true ? { ok: true, referens: 'TimeWave-avbokning' } : result;
    },
    async kontrolleraAvbokad(bokning) {
      const id = tolkaId(bokning.id);
      if (!id) return false;
      // Cancelled records are explicitly requested. Missing data is NOT success.
      const rows = await twGetAlla<TwMission>(`/missions?filter[id]=${id.mission}&filter[client_id]=${(await klientForNummer(bokning.kundId))?.id ?? 0}&filter[startdate]=${bokning.datum}&filter[enddate]=${bokning.datum}&filter[cancelled]=1`);
      const mission = rows.find(m => m.id === id.mission && String(m.client?.number) === bokning.kundId);
      return mission?.employees?.some(row => row.bookingline_id === id.rad && row.startdate === bokning.datum && row.cancelled === true) === true;
    },
    async atertilldela(uppdragId, anstalld) {
      if (!SKRIVER) return { ok: false, fel: SKRIVNING_AV };
      const rad = await engangsrad(uppdragId);
      if (!rad) return { ok: false, fel: `Engångsuppdraget ${uppdragId} hittades inte.` };
      const svar = await twBytAnstalld({ bokningsrad: rad.bookingline_id, datum: rad.startdate, start: hhmm(rad.starttime), slut: hhmm(rad.endtime), nyAnstalldId: Number(anstalld.id) });
      return svar.ok === true ? { ok: true, referens: 'TimeWave: städaren tillbaka' } : svar;
    },
    /** Vem står på engångsuppdraget nu? null = Utan anställd, undefined = hittades inte. */
    async anstalldPa(uppdragId) {
      const rad = await engangsrad(uppdragId);
      if (!rad) return undefined;
      return !rad.id || /^utan\b/i.test(String(rad.name ?? '').trim()) ? null : String(rad.id);
    },
    async skapaArende(rubrik, text) {
      console.log(`\n[självservice/timewave] ärende skapas inte i TimeWave ännu:\n${rubrik}\n${text}\n`);
    },

    async hamtaFakturor(kundId) {
      const k = await klientForNummer(kundId);
      if (!k) return [];
      type TwFaktura = {
        number?: string; invoice_date?: string; due_date?: string; total?: string | number; taxreduction?: string | number;
        payed?: string | number | boolean; payed_date?: string | null; deleted?: boolean | number; credit_of_id?: number | null;
        credited?: boolean | number; ocr?: string; company_bg?: string; client_id?: number; id?: number | string;
      };
      type TwFakturarad = { invoice_id?: string | number; service_name?: string; delivery_date?: string; hours?: string; total_including_vat?: string | number; description?: string };
      const rader = await twGetAlla<TwFaktura>(`/invoices?filter[client_id]=${k.id}`);
      const egna = rader
        // Dubbelkolla att fakturan verkligen är kundens, och hoppa över raderade.
        .filter((f) => Number(f.client_id) === Number(k.id) && !Number(f.deleted) && f.number)
        .sort((a, b) => String(b.invoice_date).localeCompare(String(a.invoice_date)))
        .slice(0, 6);
      // Fakturaraderna hämtas på TimeWaves INTERNA faktura-id (inte fakturanumret –
      // samma siffra kan vara en annan kunds faktura), och bara för kundens egna fakturor.
      const egnaId = egna.map((f) => String(f.id ?? '')).filter((id) => /^\d+$/.test(id));
      const fakturarader = egnaId.length
        ? await twGetAlla<TwFakturarad>(`/invoicelines?invoice_ids=${egnaId.join(',')}`).catch(() => [] as TwFakturarad[])
        : [];
      return egna
        .map((f) => ({
          rader: fakturarader
            .filter((r) => egnaId.includes(String(r.invoice_id)) && String(r.invoice_id) === String(f.id))
            .map((r) => ({
              tjanst: String(r.service_name ?? 'Tjänst'),
              datum: String(r.delivery_date ?? '').slice(0, 10),
              timmar: String(r.hours ?? '').slice(0, 5),
              beloppKr: Math.round(Number(r.total_including_vat ?? 0)),
              beskrivning: String(r.description ?? '').slice(0, 120),
            })),
          nummer: String(f.number),
          datum: String(f.invoice_date ?? '').slice(0, 10),
          forfallodatum: String(f.due_date ?? '').slice(0, 10),
          beloppKr: Math.round(Number(f.total ?? 0)),
          rutKr: Math.round(Number(f.taxreduction ?? 0)),
          betald: Boolean(Number(f.payed)) || Boolean(f.payed_date),
          betaldDatum: f.payed_date ? String(f.payed_date).slice(0, 10) : null,
          kreditfaktura: Boolean(f.credit_of_id),
          ocr: String(f.ocr ?? ''),
          bankgiro: String(f.company_bg ?? ''),
        }));
    },

    async hamtaUtforda(kundId) {
      const k = await klientForNummer(kundId);
      if (!k) return [];
      const idag = idagSthlm();
      const missions = await twGetAlla<TwMission>(`/missions?filter[client_id]=${k.id}&filter[startdate]=${laggTillDagar(idag, -120)}&filter[enddate]=${idag}`);
      const nu = Date.now();
      const utforda = [];
      for (const m of missions) {
        if (String(m.client?.number) !== String(k.number)) continue;
        for (const rad of m.employees ?? []) {
          if (rad.cancelled || !rad.startdate || sthlmTidpunkt(rad.startdate, hhmm(rad.endtime)) > nu) continue;
          const utan = !rad.id || /^utan\b/i.test(String(rad.name ?? '').trim());
          utforda.push({ datum: rad.startdate, start: hhmm(rad.starttime), slut: hhmm(rad.endtime), tjanst: m.services?.[0]?.name ?? 'Städning', stadare: utan ? '' : fornamn(rad.name) });
        }
      }
      return utforda.sort((a, b) => `${b.datum}${b.start}`.localeCompare(`${a.datum}${a.start}`)).slice(0, 10);
    },

    async kundensMobil(kundId) {
      const k = (await klientForNummer(kundId)) as (TwKlient & { mobile?: string; phone?: string }) | null;
      if (!k) return null;
      for (const nummer of [k.mobile, k.phone]) {
        const mobil = mobilnummer(nummer ?? '');
        if (mobil && !platshallare(mobil)) return mobil;
      }
      return null;
    },

    async kundensEpost(kundId) {
      const k = (await klientForNummer(kundId)) as (TwKlient & { email?: string }) | null;
      const epost = k?.email?.trim() ?? '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost) ? epost : null;
    },

    async skapaEkonomianteckning(kundId, rubrik, text) {
      if (!SKRIVER) return { ok: false, fel: SKRIVNING_AV };
      const k = await klientForNummer(kundId);
      if (!k) return { ok: false, fel: `Kund ${kundId} hittades inte i TimeWave.` };
      return twSkapaAnteckning({ resurs: 'clients', resursId: k.id, typ: 'ECONOMY', rubrik, text, viktig: true });
    },
  };
}
