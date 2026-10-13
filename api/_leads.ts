// Leadhantering och uppföljning (Camilla 2.0, fas 3 – Mikaela 2026-10-13).
//
// Ett LEAD är en besökare som lämnat mobilnummer och e-post i chatten för att
// få pris. Varje lead har en status och ett nästa steg:
//
//   ny → pris (fått prisförslag) → bokning_paborjad (fått bokningslänk) → bokad
//                    ↘ nej · avregistrerad · overlamnad (klagomål/ärende) · klar
//
// UPPFÖLJNING: SMS efter cirka 24 timmar, 3 dagar och 7 dagar, räknat från
// kundens senaste aktivitet i chatten. Bara dagtid, och bara till leads som
// informerats om det när de lämnade numret (samtycke). Sekvensen stoppas av:
//   * bokning (numret finns på en aktiv kund i TimeWave)
//   * nej från kunden (Camillas verktyg avsluta_uppfoljning)
//   * avregistrering (länken i varje SMS)
//   * överlämnat klagomål eller annat ärende till kundservice
//   * personalen (pausa eller stoppa i adminpanelen)
// Samma steg skickas aldrig två gånger (lås per lead och steg).
//
// Allt som rör tid och utskick går genom parametrar (nu, skicka, arKund), så
// att reglerna går att testa utan att något SMS skickas.

import * as lagring from './_lagring';

export type Leadstatus = 'ny' | 'pris' | 'bokning_paborjad' | 'bokad' | 'nej' | 'avregistrerad' | 'overlamnad' | 'klar';

export interface Lead {
  /** Samtalets id – ett lead per samtal. */
  id: string;
  /** Kort kod till avregistreringslänken i SMS:en. */
  kod: string;
  skapad: number;
  senastAktiv: number;
  kanal: string;
  /** Annons, länk eller story som samtalet kom från (Instagram, Messenger) – för attributionen. */
  kalla?: string;
  fornamn: string;
  telefon: string;
  epost: string;
  tjanst: string;
  kvm: string;
  behov: string;
  /** Pris per tillfälle efter RUT, ur prismotorn, när kunden fått ett förslag. */
  prisKr: number | null;
  status: Leadstatus;
  /** Sant när kunden informerats om att vi återkommer med SMS. Utan det skickas inget. */
  samtycke: boolean;
  pausad: boolean;
  /** Antal uppföljningar som har skickats (0–3). */
  steg: number;
  /** När nästa uppföljning tidigast ska gå, eller null när sekvensen är slut. */
  nasta: number | null;
  handelser: { tid: number; text: string }[];
}

const TIMME = 3600_000;
/** Uppföljning 1, 2 och 3 – timmar efter kundens senaste aktivitet. */
export const STEG_TIMMAR = [24, 72, 168];
const LEAD_TTL = 120 * 24 * 3600;
const INDEX_NASTA = 'leads:nasta';
const INDEX_ALLA = 'leads:alla';
/** Statusar där uppföljningen fortfarande pågår. */
const AKTIVA: Leadstatus[] = ['ny', 'pris', 'bokning_paborjad'];

const nyckel = (id: string) => `lead:${id}`;

function slumpkod(): string {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return [...b].map((x) => (x % 36).toString(36)).join('');
}

export async function hamtaLead(id: string): Promise<Lead | null> {
  return lagring.hamta<Lead>(nyckel(id)).catch(() => null);
}

async function sparaLead(l: Lead): Promise<void> {
  l.handelser = l.handelser.slice(-30);
  await lagring.spara(nyckel(l.id), l, LEAD_TTL);
  await lagring.indexera(INDEX_ALLA, l.id, l.skapad);
  if (l.nasta !== null && AKTIVA.includes(l.status) && !l.pausad && l.samtycke) await lagring.indexera(INDEX_NASTA, l.id, l.nasta);
  else await lagring.taBortUrIndex(INDEX_NASTA, l.id);
}

function handelse(l: Lead, text: string, nu: number) {
  l.handelser.push({ tid: nu, text });
}

/** Nästa uppföljning räknas från kundens senaste aktivitet. */
function planera(l: Lead) {
  l.nasta = l.steg < STEG_TIMMAR.length ? l.senastAktiv + STEG_TIMMAR[l.steg] * TIMME : null;
}

/** Skapar leadet när kunden lämnat mobil och e-post (eller kompletterar ett som finns). */
export async function skapaLead(
  id: string,
  uppgifter: Pick<Lead, 'kanal' | 'kalla' | 'fornamn' | 'telefon' | 'epost' | 'tjanst' | 'kvm' | 'behov'> & { samtycke: boolean },
  nu = Date.now()
): Promise<Lead> {
  const fanns = await hamtaLead(id);
  const l: Lead = fanns
    ? { ...fanns, ...uppgifter, samtycke: fanns.samtycke || uppgifter.samtycke, senastAktiv: nu }
    : { id, kod: slumpkod(), skapad: nu, senastAktiv: nu, prisKr: null, status: 'ny', pausad: false, steg: 0, nasta: null, handelser: [], ...uppgifter };
  if (!fanns) {
    handelse(l, `Lämnade kontaktuppgifter (${l.kanal}${l.kalla ? `, ${l.kalla}` : ''})`, nu);
    await lagring.spara(`lead:kod:${l.kod}`, id, LEAD_TTL);
  }
  if (AKTIVA.includes(l.status)) planera(l);
  await sparaLead(l);
  return l;
}

/** Kunden skrev något i chatten: uppföljningen skjuts fram, räknat från nu. */
export async function noteraAktivitet(id: string, nu = Date.now()): Promise<void> {
  const l = await hamtaLead(id);
  if (!l || !AKTIVA.includes(l.status)) return;
  // Skriv inte för varje meddelande – en gång i kvarten räcker för planeringen.
  if (nu - l.senastAktiv < 15 * 60_000) return;
  l.senastAktiv = nu;
  planera(l);
  await sparaLead(l);
}

/** Kunden fick ett prisförslag. */
export async function noteraPris(id: string, pris: { prisKr: number; tjanst: string; kvm: string }, nu = Date.now()): Promise<void> {
  const l = await hamtaLead(id);
  if (!l) return;
  l.prisKr = pris.prisKr;
  if (pris.tjanst) l.tjanst = pris.tjanst;
  if (pris.kvm) l.kvm = pris.kvm;
  l.senastAktiv = nu;
  if (l.status === 'ny') l.status = 'pris';
  handelse(l, `Fick pris: ${pris.tjanst} ${pris.kvm} kvm, ${pris.prisKr} kr`, nu);
  if (AKTIVA.includes(l.status)) planera(l);
  await sparaLead(l);
}

/** Byter status. Alla statusar utom de aktiva avslutar uppföljningen. */
export async function sattStatus(id: string, status: Leadstatus, orsak: string, nu = Date.now()): Promise<Lead | null> {
  const l = await hamtaLead(id);
  if (!l) return null;
  if (l.status === status) return l;
  // En avregistrering eller ett nej får aldrig skrivas över av en mildare status.
  if ((l.status === 'avregistrerad' || l.status === 'nej' || l.status === 'bokad') && AKTIVA.includes(status)) return l;
  l.status = status;
  handelse(l, `${status}: ${orsak}`, nu);
  if (AKTIVA.includes(status)) planera(l);
  else l.nasta = null;
  await sparaLead(l);
  return l;
}

/** Personalen pausar eller återupptar uppföljningen. */
export async function sattPaus(id: string, pausad: boolean, vem: string, nu = Date.now()): Promise<Lead | null> {
  const l = await hamtaLead(id);
  if (!l) return null;
  l.pausad = pausad;
  handelse(l, `${pausad ? 'Pausad' : 'Återupptagen'} av ${vem}`, nu);
  await sparaLead(l);
  return l;
}

/** Avregistrering via länken i SMS:et. */
export async function avregistrera(kod: string, nu = Date.now()): Promise<boolean> {
  if (!/^[a-z0-9]{8}$/.test(kod)) return false;
  const id = await lagring.hamta<string>(`lead:kod:${kod}`).catch(() => null);
  if (!id) return false;
  return (await sattStatus(id, 'avregistrerad', 'kunden tryckte på länken i SMS:et', nu)) !== null;
}

export async function listaLeads(antal = 200): Promise<Lead[]> {
  const ider = await lagring.senasteIIndex(INDEX_ALLA, antal);
  const leads = await Promise.all(ider.map((id) => hamtaLead(id)));
  return leads.filter((l): l is Lead => l !== null);
}

// ─── Utskicket ───────────────────────────────────────────────────────────────

/** Klockslag i Stockholm, 0–23. */
function timmeSthlm(nu: number): number {
  return Number(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', hour12: false }).format(new Date(nu)));
}

/** SMS skickas bara dagtid: 09–19 svensk tid. */
export function dagtid(nu: number): boolean {
  const t = timmeSthlm(nu);
  return t >= 9 && t < 19;
}

/** Texten för uppföljning 1, 2 eller 3. Bara verifierade uppgifter ur leadet. */
export function smsText(l: Lead, steg: number, bas: string): string {
  const namn = l.fornamn ? ` ${l.fornamn.split(/\s+/)[0]}` : '';
  const tjanst = (l.tjanst || 'städning').toLowerCase();
  const pris = l.prisKr ? ` (${l.prisKr} kr per gång efter RUT)` : '';
  const prova = /hemst/i.test(tjanst) ? ' Du kan testa oss med 15 % på första städningen, utan bindning.' : '';
  const slut = `\nInga fler sms: ${bas}/sms-stopp/${l.kod}`;
  const chatt = `${bas.replace(/^https?:\/\/(www\.)?/, '')}/chatt`;
  if (steg === 1) {
    return `Hej${namn}! Det är Camilla på Stodona. Har du några frågor om förslaget på ${tjanst}${pris}?${prova} Skriv till mig här: ${chatt}${slut}`;
  }
  if (steg === 2) {
    return `Hej igen${namn}! Vill du att jag tar fram lediga tider för din ${tjanst}? Det tar någon minut: ${chatt} /Camilla, Stodona${slut}`;
  }
  return `Hej${namn}! En sista hälsning från mig: ditt förslag på ${tjanst} finns kvar om du vill komma igång. Jag hjälper dig här: ${chatt} /Camilla, Stodona${slut}`;
}

export interface Korning {
  skickade: string[];
  stoppade: string[];
  uppskjutna: string[];
  fel: string[];
}

/**
 * Går igenom leads vars uppföljning har förfallit och skickar nästa SMS.
 * @param skicka skickar ett SMS; @param arKund sant om numret nu är kund i bokningssystemet
 */
export async function korUppfoljningar(dep: {
  nu?: number;
  bas: string;
  skicka: (mobil: string, text: string) => Promise<{ ok: true } | { ok: false; fel: string }>;
  arKund: (mobil: string) => Promise<boolean>;
  max?: number;
}): Promise<Korning> {
  const nu = dep.nu ?? Date.now();
  const ut: Korning = { skickade: [], stoppade: [], uppskjutna: [], fel: [] };
  if (!dagtid(nu)) return ut;

  for (const id of await lagring.upptillIIndex(INDEX_NASTA, nu, dep.max ?? 40)) {
    const l = await hamtaLead(id);
    if (!l) {
      await lagring.taBortUrIndex(INDEX_NASTA, id);
      continue;
    }
    // Reglerna kontrolleras igen här – indexet kan vara äldre än leadet.
    if (!AKTIVA.includes(l.status) || l.pausad || !l.samtycke || l.nasta === null || l.steg >= STEG_TIMMAR.length) {
      await lagring.taBortUrIndex(INDEX_NASTA, id);
      continue;
    }
    if (l.nasta > nu) continue;

    try {
      // Har leadet blivit kund? Då stoppas sekvensen.
      if (await dep.arKund(l.telefon)) {
        await sattStatus(id, 'bokad', 'numret finns på en aktiv kund i bokningssystemet', nu);
        ut.stoppade.push(id);
        continue;
      }
    } catch (fel) {
      // Går det inte att kontrollera skickar vi hellre senare än fel.
      l.nasta = nu + TIMME;
      await sparaLead(l);
      ut.uppskjutna.push(id);
      continue;
    }

    const steg = l.steg + 1;
    // Lås per lead och steg: samma uppföljning går aldrig iväg två gånger.
    if (!(await lagring.lasa(`lead:las:${id}:${steg}`, 30 * 24 * 3600))) {
      l.steg = steg;
      planera(l);
      await sparaLead(l);
      continue;
    }
    const svar = await dep.skicka(l.telefon, smsText(l, steg, dep.bas));
    if (svar.ok === false) {
      handelse(l, `Uppföljning ${steg} kunde inte skickas: ${svar.fel.slice(0, 100)}`, nu);
      // Låset ligger kvar, så samma steg försöks inte igen – nästa steg går som planerat.
      ut.fel.push(id);
    } else {
      handelse(l, `Uppföljning ${steg} skickad med SMS`, nu);
      ut.skickade.push(id);
    }
    l.steg = steg;
    planera(l);
    if (l.nasta === null) {
      l.status = 'klar';
      handelse(l, 'Uppföljningen är avslutad (tre SMS)', nu);
    }
    await sparaLead(l);
  }
  return ut;
}
