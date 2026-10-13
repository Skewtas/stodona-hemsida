// Instagram-DM och Facebook Messenger som kanaler till Camilla.
//
// Båda går genom Metas Messenger-plattform och ser nästan likadana ut, så de
// delar den här adaptern. Det som skiljer (adress, token, hemlighet, gränser)
// står i PLATTFORM nedan; webhookarna är api/instagram.ts och api/messenger.ts.
//
// Det här är en ADAPTER, inte en egen chattbot. Den tar emot Instagram-DM,
// skickar dem till samma Camilla som webbchatten (api/chat.ts via
// api/_kanaler.ts) och översätter svaret till Instagram: text, snabbsvar
// och – där webbchatten har egna rutor – samma steg i textform:
//
//   [[val: A | B]]      → snabbsvar (quick replies)
//   [[bankid]]          → systemet frågar efter mobilnummer och skickar SMS-kod
//                         (samma kod och kontroll som webbchatten, api/_smskod.ts).
//                         Numret och koden når aldrig modellen.
//   [[bekrafta:OF-…]]   → sammanfattningen (hämtas från servern, inte från
//   [[bekrafta:AV-…]]     modellen) med snabbsvaret "Bekräfta ombokning" eller
//                         "Bekräfta avbokning". Bara det – eller ett tydligt
//                         "ja" direkt efter – genomför ändringen, via samma
//                         kod som webbchattens knapp.
//
// KÄLLA (annons, länk, story)
// Kommer kunden från en annons eller en länk med ?ref= sparas källan på
// samtalet. Ämnet känns igen mot våra egna tjänster – fri text från länken når
// aldrig Camilla – och hon får veta det med kundens första meddelande, så att
// öppningen handlar om det annonsen handlade om.
//
// MÄNNISKA ELLER AI
// Svarar någon i personalen i tråden (i Instagram-appen eller Meta Business
// Suite) kommer det som ett "eko". Då pausas Camilla i samtalet i 12 timmar
// från personalens senaste meddelande, och det som skrivs under tiden förs
// in i hennes historik så att hon kan ta vid med rätt sammanhang. Camilla
// pausar sig också själv när hon lämnat över till kundservice. Före varje
// svar kontrolleras pausen igen, så AI och personal svarar aldrig samtidigt.
//
// Meta: Instagram API med Instagram-inloggning (graph.instagram.com) och
// Messenger-plattformen för Facebook-sidan (graph.facebook.com).
// Svar får bara skickas inom 24 timmar från kundens senaste meddelande.
// Camilla svarar alltid direkt, men spärren i skickaTillKund gäller ändå:
// utanför fönstret skickas ingenting, vad som än har bett om det.

import * as lagring from './_lagring';
import { skickaKod, mobilnummer } from './_smskod';
import { loggaInMedKod, valjSmsKonto, type SmsInloggning } from './_sjalvservice';
import type { Kort, Bekraftelse } from './_sjalvservice';
import type { Avbokningskort } from './_avbokning';
import {
  samtalFor,
  hamtaInfo,
  uppdatera,
  noteraMeddelande,
  aiFarSvara,
  taOver,
  logga,
  camilla,
  tolkaSvar,
  markeraKraverAtgard,
  PAUS_EFTER_PERSONAL_TIMMAR,
  META_FONSTER_TIMMAR,
  kanalNamn,
  type Kalla,
  type Samtalsinfo,
  type CamillaSvar,
} from './_kanaler';

export type MetaKanal = 'instagram' | 'messenger';

interface Plattform {
  graph: string;
  /** Prefix för kanalens egna nycklar i lagringen. */
  pre: 'ig' | 'fb';
  /** Högst så många byte text per meddelande (Instagram 1000, Messenger 2000 tecken). */
  maxByte: number;
  hemlighet: () => string | undefined;
  lage: () => string | undefined;
  testare: () => string | undefined;
}

const VERSION = process.env.IG_GRAPH_VERSION || 'v25.0';
const PLATTFORM: Record<MetaKanal, Plattform> = {
  instagram: {
    graph: (process.env.IG_GRAPH_BAS || 'https://graph.instagram.com').replace(/\/+$/, ''),
    pre: 'ig',
    maxByte: 950,
    hemlighet: () => process.env.IG_APP_SECRET,
    lage: () => process.env.INSTAGRAM_CHAT,
    testare: () => process.env.IG_TESTARE,
  },
  messenger: {
    graph: (process.env.FB_GRAPH_BAS || 'https://graph.facebook.com').replace(/\/+$/, ''),
    pre: 'fb',
    maxByte: 1900,
    hemlighet: () => process.env.FB_APP_SECRET,
    lage: () => process.env.MESSENGER_CHAT,
    testare: () => process.env.FB_TESTARE,
  },
};
const plattform = (kanal: string): Plattform => PLATTFORM[kanal === 'messenger' ? 'messenger' : 'instagram'];
const MAX_SNABBSVAR = 13;
const MAX_TITEL = 20;
/** En identifiering som inte avslutats glöms efter en kvart. */
const IDENTIFIERING_MINUTER = 15;
/** Egna utskick känns igen när de kommer tillbaka som eko. */
const EGET_TTL = 15 * 60;

/**
 * LOKAL TESTMILJÖ (vite, STODONA_LOKAL=true): ingenting skickas till Meta.
 * Svaren skrivs ut i terminalen och sparas i utkorgen nedan.
 */
const LOKAL = process.env.STODONA_LOKAL === 'true';
export const lokalUtkorg: { till: string; text: string; snabbsvar: string[]; kanal?: string; samtalsId?: string }[] = [];

/** Snabbsvar som styr systemet i stället för att gå till Camilla. */
const SYS = 'STODONA:';

// ─── Påslaget ────────────────────────────────────────────────────────────────

/**
 * INSTAGRAM_CHAT respektive MESSENGER_CHAT:
 *   av   (standard) – webhooken tar emot men Camilla svarar aldrig
 *   test – Camilla svarar bara kontona i IG_TESTARE / FB_TESTARE (id:n, kommaseparerade)
 *   pa   – Camilla svarar alla
 */
export function kanalLage(kanal: MetaKanal): 'av' | 'test' | 'pa' {
  const v = (plattform(kanal).lage() ?? '').trim().toLowerCase();
  return v === 'pa' || v === 'test' ? v : 'av';
}

export const instagramLage = () => kanalLage('instagram');

export function arTestare(id: string, kanal: MetaKanal = 'instagram'): boolean {
  return (plattform(kanal).testare() ?? '')
    .split(',')
    .map((s) => s.trim())
    .includes(id);
}

// ─── Meta: signatur, token, utskick ──────────────────────────────────────────

async function hmacHex(hemlighet: string, text: string): Promise<string> {
  const nyckel = await crypto.subtle.importKey('raw', new TextEncoder().encode(hemlighet), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', nyckel, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha(text: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/** X-Hub-Signature-256 = sha256=HMAC(appens hemlighet, rå kropp). Utan giltig signatur behandlas ingenting. */
export async function giltigSignatur(radKropp: string, header: string | null, kanal: MetaKanal = 'instagram'): Promise<boolean> {
  const hemlighet = plattform(kanal).hemlighet();
  if (!hemlighet || !header?.startsWith('sha256=')) return false;
  const vantat = await hmacHex(hemlighet, radKropp);
  const given = header.slice(7).toLowerCase();
  let diff = vantat.length ^ given.length;
  for (let i = 0; i < Math.max(vantat.length, given.length); i++) diff |= (vantat.charCodeAt(i) || 0) ^ (given.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * Instagram: den förnyade token (se fornyaToken) går före den i miljön.
 * Messenger: sidans token (FB_PAGE_TOKEN) går inte ut och förnyas inte.
 */
async function token(kanal: string = 'instagram'): Promise<string | null> {
  if (kanal === 'messenger') return process.env.FB_PAGE_TOKEN || null;
  const fornyad = await lagring.hamta<{ token: string }>('ig:token').catch(() => null);
  return fornyad?.token || process.env.IG_ACCESS_TOKEN || null;
}

/**
 * Långlivade Instagram-token gäller i 60 dagar och kan förnyas när de är
 * minst ett dygn gamla. Cron-jobbet kör det här varje vecka.
 */
export async function fornyaToken(): Promise<{ ok: boolean; detaljer: string }> {
  const nu = await token();
  if (!nu) return { ok: false, detaljer: 'IG_ACCESS_TOKEN saknas' };
  const svar = await fetch(`${PLATTFORM.instagram.graph}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(nu)}`);
  const data = (await svar.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!svar.ok || !data.access_token) return { ok: false, detaljer: data.error?.message ?? `svarade ${svar.status}` };
  const dagar = Math.floor((data.expires_in ?? 60 * 86400) / 86400);
  await lagring.spara('ig:token', { token: data.access_token, fornyad: new Date().toISOString() }, Math.max(86400, (data.expires_in ?? 60 * 86400) - 3600));
  return { ok: true, detaljer: `förnyad, gäller ${dagar} dagar` };
}

async function graph(kanal: string, sokvag: string, kropp: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const t = await token(kanal);
  if (!t) return { ok: false, data: { error: kanal === 'messenger' ? 'FB_PAGE_TOKEN saknas' : 'IG_ACCESS_TOKEN saknas' } };
  const svar = await fetch(`${plattform(kanal).graph}/${VERSION}${sokvag}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kropp),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await svar.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: svar.ok, data };
}

/** Delar upp text som är för lång för ett meddelande i kanalen, helst vid meningsslut. */
function delaUpp(text: string, MAX_BYTE: number): string[] {
  const kodare = new TextEncoder();
  const delar: string[] = [];
  let kvar = text.trim();
  while (kodare.encode(kvar).length > MAX_BYTE) {
    let slut = kvar.length;
    while (kodare.encode(kvar.slice(0, slut)).length > MAX_BYTE) slut = Math.floor(slut * 0.9);
    const bit = kvar.slice(0, slut);
    const brytning = Math.max(bit.lastIndexOf('. '), bit.lastIndexOf('\n'), bit.lastIndexOf('! '), bit.lastIndexOf('? '));
    const vid = brytning > slut * 0.5 ? brytning + 1 : bit.lastIndexOf(' ') > 0 ? bit.lastIndexOf(' ') : slut;
    delar.push(kvar.slice(0, vid).trim());
    kvar = kvar.slice(vid).trim();
  }
  if (kvar) delar.push(kvar);
  return delar;
}

export interface Snabbsval {
  titel: string;
  /** Det som skickas tillbaka när kunden trycker: hela alternativet, eller ett systemval (STODONA:…). */
  payload: string;
}

/** Ett alternativ från Camilla blir ett snabbsvar – titeln kortas, hela texten följer med tillbaka. */
const snabbsvar = (val: string[]): Snabbsval[] =>
  val.slice(0, MAX_SNABBSVAR).map((v) => ({ titel: v.length > MAX_TITEL ? `${v.slice(0, MAX_TITEL - 1).trimEnd()}…` : v, payload: v.slice(0, 900) }));

/** Är Metas fönster öppet, dvs. har kunden skrivit de senaste 24 timmarna? */
export function inomFonstret(info: Pick<Samtalsinfo, 'kundSenast'>, nu = Date.now()): boolean {
  return typeof info.kundSenast === 'number' && nu - info.kundSenast < META_FONSTER_TIMMAR * 3600 * 1000;
}

/**
 * Skickar ett svar till kunden. Snabbsvaren hamnar på sista delen. Varje utskick märks så att ekot känns igen.
 * Utanför Metas 24-timmarsfönster skickas ingenting – då får kundservice ta det (de har andra regler).
 */
async function skickaTillKund(mal: Samtalsinfo, text: string, val: Snabbsval[] = []): Promise<boolean> {
  const { externId: igsid, samtalsId, kanal } = mal;
  const pf = plattform(kanal);
  // Uppgiften kan vara läst före kundens senaste meddelande – läs om innan något stoppas.
  if (!inomFonstret(mal) && !inomFonstret((await hamtaInfo(samtalsId)) ?? mal)) {
    await logga(samtalsId, 'INTE skickat', `utanför Metas ${META_FONSTER_TIMMAR}-timmarsfönster: ${text.slice(0, 120)}`);
    await markeraKraverAtgard(samtalsId, `Camilla fick inte svara – mer än ${META_FONSTER_TIMMAR} timmar sedan kunden skrev`);
    return false;
  }
  const delar = delaUpp(text || (val.length ? 'Välj ett alternativ:' : ''), pf.maxByte);
  for (const [i, del] of delar.entries()) {
    await lagring.spara(`${pf.pre}:eget:${await sha(`${igsid}:${del}`)}`, 1, EGET_TTL);
    const sista = i === delar.length - 1;
    const meddelande: Record<string, unknown> = { text: del };
    if (sista && val.length) meddelande.quick_replies = val.map((v) => ({ content_type: 'text', title: v.titel, payload: v.payload }));
    if (LOKAL) {
      const snabb = sista ? val.map((v) => `${v.titel} → ${v.payload}`) : [];
      lokalUtkorg.push({ till: igsid, text: del, snabbsvar: snabb, kanal, samtalsId });
      console.log(`\n[lokal ${kanal}] till ${igsid}:\n${del}${snabb.length ? `\n  snabbsvar: ${snabb.join(' | ')}` : ''}\n`);
      continue;
    }
    const svar = await graph(kanal, '/me/messages', { recipient: { id: igsid }, ...(kanal === 'messenger' ? { messaging_type: 'RESPONSE' } : {}), message: meddelande });
    if (!svar.ok) {
      await logga(samtalsId, 'FEL utskick', JSON.stringify(svar.data).slice(0, 300));
      return false;
    }
    if (typeof svar.data.message_id === 'string') await lagring.spara(`${pf.pre}:eget:mid:${svar.data.message_id}`, 1, EGET_TTL);
  }
  await noteraMeddelande(samtalsId, 'ai', text);
  await logga(samtalsId, 'svar skickat', `${text.slice(0, 200)}${val.length ? ` [snabbsvar: ${val.map((v) => v.titel).join(' | ')}]` : ''}`);
  return true;
}

/** "Skriver …" medan Camilla tänker. Får aldrig stoppa något. */
async function skriver(mal: Samtalsinfo): Promise<void> {
  if (LOKAL || !inomFonstret(mal)) return;
  await graph(mal.kanal, '/me/messages', { recipient: { id: mal.externId }, sender_action: 'typing_on' }).catch(() => undefined);
}

/** @användarnamn (Instagram) eller namnet (Messenger) för personalens skull (inkorgen, mejlen till kundservice). */
async function hamtaAnvandarnamn(kanal: MetaKanal, igsid: string): Promise<string> {
  if (LOKAL) return kanal === 'messenger' ? `Test ${igsid.slice(-4)}` : `@test_${igsid.slice(-4)}`;
  const t = await token(kanal);
  if (!t) return '';
  try {
    const falt = kanal === 'messenger' ? 'first_name,last_name' : 'username,name';
    const svar = await fetch(`${plattform(kanal).graph}/${VERSION}/${encodeURIComponent(igsid)}?fields=${falt}`, {
      headers: { Authorization: `Bearer ${t}` },
      signal: AbortSignal.timeout(5000),
    });
    const d = (await svar.json().catch(() => ({}))) as { username?: string; name?: string; first_name?: string; last_name?: string };
    if (kanal === 'messenger') return [d.first_name, d.last_name].filter(Boolean).join(' ').slice(0, 80);
    return d.username ? `@${d.username}${d.name ? ` (${d.name})` : ''}` : '';
  } catch {
    return '';
  }
}

// ─── Inkommande ──────────────────────────────────────────────────────────────

/** Ett meddelande från kunden, som det kom från Meta. */
export interface Inkommande {
  mid: string;
  text: string;
  /** Snabbsvarets payload, om kunden tryckte på ett. */
  payload: string | null;
  /** "bild", "video" … – det Camilla inte kan se. */
  bilagor: string[];
}

// ─── Källa: annons, länk, story ──────────────────────────────────────────────

/** Det Meta skickar med när kunden kommer från en annons eller en länk med ?ref=. */
export interface Referral {
  ref?: string;
  source?: string;
  type?: string;
  ad_id?: string;
  ads_context_data?: { ad_title?: string };
}

const AMNEN: [RegExp, string][] = [
  [/flytt/, 'Flyttstädning'],
  [/f[oö]nster|puts/, 'Fönsterputsning'],
  [/storst[aä]d/, 'Storstädning'],
  [/bygg/, 'Byggstädning'],
  [/kontor|f[oö]retag/, 'Företagsstädning'],
  [/hemst[aä]d|st[aä]dabonnemang|abonnemang|st[aä]dhj[aä]lp|veckost[aä]d/, 'Hemstädning'],
];

/** Tjänsten en annonsrubrik eller ref-kod handlar om – en av våra egna, eller ingen. */
export function amneFor(text: string): string {
  const t = text.toLowerCase();
  return AMNEN.find(([m]) => m.test(t))?.[1] ?? '';
}

/** Gör om Metas referral till vår källa. Fri text (rubrik, ref) sparas rensad och når aldrig Camilla. */
export function tolkaKalla(r: Referral | null | undefined, story = false): Kalla | null {
  if (!r && !story) return null;
  const ref = String(r?.ref ?? '').replace(/[^A-Za-z0-9_\-.]/g, '').slice(0, 60);
  const annonsId = String(r?.ad_id ?? '').replace(/\D/g, '').slice(0, 30);
  const annons = Boolean(annonsId) || String(r?.source ?? '').toUpperCase() === 'ADS';
  if (!annons && !ref && !story) return null;
  return {
    typ: annons ? 'annons' : ref ? 'lank' : 'story',
    amne: amneFor(`${r?.ads_context_data?.ad_title ?? ''} ${ref}`),
    annonsId,
    ref,
    tid: Date.now(),
  };
}

/** Sparar källan på samtalet. Den första källan gäller – en annons går ändå före en länk eller story. */
async function noteraKalla(info: Samtalsinfo, kalla: Kalla | null): Promise<Samtalsinfo> {
  if (!kalla || (info.kalla && !(kalla.typ === 'annons' && info.kalla.typ !== 'annons'))) return info;
  await logga(info.samtalsId, 'källa', `${kalla.typ}${kalla.amne ? ` · ${kalla.amne}` : ''}${kalla.annonsId ? ` · annons ${kalla.annonsId}` : ''}${kalla.ref ? ` · ref ${kalla.ref}` : ''}`);
  return (
    (await uppdatera(info.samtalsId, (i) => {
      i.kalla = kalla;
      i.kallaBerattad = false;
    })) ?? info
  );
}

/** Det Camilla får veta om källan, en gång. Bara typ och ämne ur vår egen lista. */
function kallaTillCamilla(k: Kalla, kanal: string): string {
  const fran = k.typ === 'annons' ? 'en av Stodonas annonser' : k.typ === 'story' ? 'en av Stodonas stories' : 'en av Stodonas länkar';
  return k.amne
    ? `[Kunden kom till ${kanalNamn(kanal as MetaKanal)} från ${fran} om ${k.amne.toLowerCase()}. Knyt an till det direkt i ditt svar och erbjud dig att räkna på ett upplägg – fråga inte vilken tjänst det gäller.]`
    : `[Kunden kom till ${kanalNamn(kanal as MetaKanal)} från ${fran}.]`;
}

const OPPNING: Record<string, string> = {
  Hemstädning: 'Hej! Vad kul att du är intresserad av hemstädning. Vill du att jag hjälper dig räkna på ett upplägg för ditt hem?',
  Flyttstädning: 'Hej! Vad kul att du är intresserad av flyttstädning. Vill du att jag räknar på vad det skulle kosta för din bostad?',
  Storstädning: 'Hej! Vad kul att du är intresserad av storstädning. Vill du att jag räknar på vad det skulle kosta hemma hos dig?',
  Fönsterputsning: 'Hej! Vad kul att du är intresserad av fönsterputs. Vill du att jag räknar på vad det skulle kosta hos dig?',
  Företagsstädning: 'Hej! Vad kul att du är intresserad av städning till företaget. Vill du berätta lite om lokalen, så tar jag fram ett förslag?',
  Byggstädning: 'Hej! Vad kul att du är intresserad av byggstädning. Vill du berätta lite om projektet, så tar jag fram ett förslag?',
};
const OPPNING_ALLMAN = 'Hej! Det är Camilla på Stodona. Vad kan jag hjälpa dig med?';

/**
 * Kunden öppnade tråden utan att skriva något (Kom igång-knappen, eller en
 * annons som öppnar DM:en med en knapp). Det räknas som att kunden hört av
 * sig, så Camilla får hälsa – med en öppning som passar annonsen.
 */
async function oppna(origin: string, info: Samtalsinfo): Promise<void> {
  const amne = info.kalla?.amne ?? '';
  const text = OPPNING[amne] ?? OPPNING_ALLMAN;
  await uppdatera(info.samtalsId, (i) => (i.kallaBerattad = true));
  // Camilla ska veta vad kunden redan fått läsa, så att hon inte hälsar en gång till.
  const r = await camilla(origin, info, { handling: 'notering', notering: text, fran: 'oppning', amne });
  if ('fel' in r) await logga(info.samtalsId, 'FEL notering', r.fel);
  await skickaTillKund(info, text, amne ? snabbsvar(['Ja, räkna gärna', 'Jag har en fråga']) : []);
}

/** Meta skickar ibland samma händelse flera gånger. Varje meddelande behandlas en gång. */
export async function forstaGangen(mid: string, kanal: MetaKanal = 'instagram'): Promise<boolean> {
  return lagring.lasa(`${plattform(kanal).pre}:mid:${mid}`, 2 * 86400);
}

/**
 * Ett meddelande från kunden. Läggs i samtalets kö; den som har samtalets lås
 * betar av kön i tur och ordning, så att kunden aldrig får svar i fel ordning
 * eller två svar på samma sak.
 */
export async function taEmot(origin: string, igsid: string, in_: Inkommande, kanal: MetaKanal = 'instagram', kalla: Kalla | null = null, bara: 'kalla' | 'oppning' | null = null): Promise<void> {
  let info = await samtalFor(kanal, igsid);
  if (!info.visningsnamn) {
    const namn = await hamtaAnvandarnamn(kanal, igsid);
    if (namn) info = (await uppdatera(info.samtalsId, (i) => (i.visningsnamn = namn))) ?? info;
  }
  info = await noteraKalla(info, kalla);
  // Bara en källa, utan att kunden gjort något i tråden: spara den, skriv ingenting.
  if (bara === 'kalla') return;
  // Kundens meddelande (eller tryck på en knapp) öppnar Metas fönster.
  info = (await uppdatera(info.samtalsId, (i) => (i.kundSenast = Date.now()))) ?? info;
  if (bara === 'oppning') {
    await logga(info.samtalsId, 'tråden öppnad', `${info.visningsnamn || igsid} tryckte på Kom igång`);
    if (aiFarSvara(info)) await oppna(origin, info);
    return;
  }
  const beskrivning = [in_.text, ...in_.bilagor.map((b) => `[${b}]`)].filter(Boolean).join(' ');
  await logga(info.samtalsId, `${kanal === 'messenger' ? 'meddelande' : 'DM'} mottaget`, `${info.visningsnamn || igsid}: ${in_.payload?.startsWith(SYS) ? `(val ${in_.payload})` : beskrivning.slice(0, 200)}`);
  await noteraMeddelande(info.samtalsId, 'kund', beskrivning);

  // Personalen har samtalet: Camilla håller tyst men får veta vad kunden skrev.
  if (!aiFarSvara(info)) {
    await logga(info.samtalsId, 'AI tyst', `personalen har samtalet (${info.orsak})`);
    const r = await camilla(origin, info, { handling: 'notering', notering: beskrivning, fran: 'kund' });
    if ('fel' in r) await logga(info.samtalsId, 'FEL notering', r.fel);
    // Camilla lämnade över och ingen har svarat än: kunden får veta en gång att ärendet ligger hos kundservice.
    if (info.pausAv === 'ai' && !info.pausbesked) {
      await uppdatera(info.samtalsId, (i) => (i.pausbesked = true));
      await skickaTillKund(info, 'Tack! Kundservice har ditt ärende och svarar dig här så snart de kan.');
    }
    return;
  }
  // Pausen har gått ut av sig själv – samtalet går tillbaka till Camilla.
  if (info.hanteras === 'manuell') {
    info = (await uppdatera(info.samtalsId, (i) => ((i.hanteras = 'ai'), (i.pausadTill = 0)))) ?? info;
    await logga(info.samtalsId, 'ai', 'pausen gick ut – Camilla svarar igen');
  }

  await lagring.laggTillILista(`kanal:ko:${info.samtalsId}`, in_, 20, 600);
  await arbeta(origin, info.samtalsId);
}

async function arbeta(origin: string, samtalsId: string): Promise<void> {
  const las = `kanal:las:${samtalsId}`;
  for (let varv = 0; varv < 3; varv++) {
    if (!(await lagring.lasa(las, 150))) return; // någon annan betar redan av kön
    try {
      for (let n = 0; n < 10; n++) {
        const post = await lagring.plockaAldsta<Inkommande>(`kanal:ko:${samtalsId}`);
        if (!post) break;
        // Flera korta meddelanden i rad ("hej" "vill flytta fredag") besvaras som ett.
        const samlat = [post];
        while (!post.payload) {
          const nasta = await lagring.plockaAldsta<Inkommande>(`kanal:ko:${samtalsId}`);
          if (!nasta) break;
          if (nasta.payload) {
            await behandla(origin, samtalsId, slaIhop(samlat));
            samlat.length = 0;
            samlat.push(nasta);
            break;
          }
          samlat.push(nasta);
        }
        await behandla(origin, samtalsId, slaIhop(samlat));
      }
    } catch (fel) {
      await logga(samtalsId, 'FEL', String(fel).slice(0, 300));
    } finally {
      await lagring.taBort(las);
    }
    // Kom något in precis när låset släpptes? Ta det också.
    const kvar = await lagring.lasLista(`kanal:ko:${samtalsId}`, 1);
    if (!kvar.length) return;
  }
}

function slaIhop(poster: Inkommande[]): Inkommande {
  if (poster.length === 1) return poster[0];
  return {
    mid: poster[poster.length - 1].mid,
    text: poster.map((p) => p.text).filter(Boolean).join('\n'),
    payload: null,
    bilagor: poster.flatMap((p) => p.bilagor),
  };
}

// ─── Ett meddelande i taget ──────────────────────────────────────────────────

const JA = /^\s*(ja|japp|jajamen|jajamän|ja tack|ja, tack|ja gärna|bekräfta|bekräftar|ja, bekräfta|ok|okej|kör|stämmer|det stämmer|perfekt|toppen)\s*[.!😊🙏👍]*\s*$/i;

async function behandla(origin: string, samtalsId: string, in_: Inkommande): Promise<void> {
  let info = await hamtaInfo(samtalsId);
  if (!info) return;
  const payload = in_.payload ?? '';

  // Systemval från snabbsvaren.
  if (payload.startsWith(`${SYS}BEKRAFTA:`)) return bekrafta(origin, info, payload.slice(`${SYS}BEKRAFTA:`.length));
  if (payload.startsWith(`${SYS}KONTO:`)) {
    if (info.identifiering?.steg !== 'konto') return skickaTillKund(info, 'Valet har gått ut. Vill du att jag skickar en ny kod?').then(() => undefined);
    return inloggad(origin, info, await valjSmsKonto(samtalsId, payload.slice(`${SYS}KONTO:`.length)));
  }

  // Identifieringen sköts här – mobilnumret och koden når aldrig Camilla.
  if (info.identifiering && Date.now() - info.identifiering.sedan > IDENTIFIERING_MINUTER * 60000) {
    info = (await uppdatera(samtalsId, (i) => (i.identifiering = null))) ?? info;
  }
  if (info.identifiering && !payload) {
    const hanterat = await identifieringssteg(origin, info, in_.text);
    if (hanterat) return;
    info = (await hamtaInfo(samtalsId)) ?? info;
  }

  // Ett tydligt "ja" direkt efter sammanfattningen är en bekräftelse.
  if (info.vantandeForslag && !payload && JA.test(in_.text)) return bekrafta(origin, info, info.vantandeForslag);

  // Allt annat går till Camilla. Ett nytt meddelande gör en väntande sammanfattning inaktuell.
  if (info.vantandeForslag) info = (await uppdatera(samtalsId, (i) => (i.vantandeForslag = null))) ?? info;
  let text = [payload || in_.text, ...in_.bilagor.map((b) => `[Kunden skickade ${b} i ${kanalNamn(info.kanal)}. Du kan inte se den, men den finns kvar i tråden för kundservice.]`)]
    .filter(Boolean)
    .join('\n');
  if (!text) return;
  // Första meddelandet efter en annons eller länk: Camilla får veta varifrån kunden kom.
  if (info.kalla && !info.kallaBerattad) {
    text = `${kallaTillCamilla(info.kalla, info.kanal)}\n${text}`;
    info = (await uppdatera(samtalsId, (i) => (i.kallaBerattad = true))) ?? info;
  }
  await skriver(info);
  await levereraCamilla(origin, info, await camilla(origin, info, { message: text }));
}

/** Tar hand om ett steg i identifieringen. Returnerar false om kunden pratar om något annat – då går meddelandet till Camilla. */
async function identifieringssteg(origin: string, info: Samtalsinfo, text: string): Promise<boolean> {
  const steg = info.identifiering!.steg;
  const skicka = (t: string, val: Snabbsval[] = []) => skickaTillKund(info, t, val);
  const kompakt = text.replace(/[\s\-().]/g, '');
  const nummer = kompakt.match(/(?:\+46|0046|46|0)7\d{8}/)?.[0] ?? null;
  const avbryt = /^\s*(avbryt|nej|nej tack|strunt|glöm det)\b/i.test(text);

  if (avbryt || (steg === 'konto' && !nummer)) {
    await uppdatera(info.samtalsId, (i) => (i.identifiering = null));
    return false;
  }

  if (nummer && mobilnummer(nummer)) {
    const svar = await skickaKod(info.samtalsId, nummer, `${info.kanal}:${info.externId}`, origin, info.kanal === 'messenger' ? 'messenger' : 'instagram');
    if ('fel' in svar) {
      await logga(info.samtalsId, 'identifiering', `kod kunde inte skickas: ${svar.fel}`);
      await skicka(svar.fel);
      if (svar.fel.startsWith('För många')) await uppdatera(info.samtalsId, (i) => (i.identifiering = null));
      return true;
    }
    await uppdatera(info.samtalsId, (i) => (i.identifiering = { steg: 'kod', sedan: Date.now() }));
    await logga(info.samtalsId, 'identifiering', 'SMS-kod begärd');
    await skicka('Om numret finns hos oss har du nu fått en kod med SMS. Skriv koden här.');
    return true;
  }

  if (steg === 'kod') {
    const kod = kompakt.match(/^\D{0,24}(\d{6})\D{0,24}$/)?.[1];
    if (!kod) {
      await uppdatera(info.samtalsId, (i) => (i.identifiering = null));
      return false;
    }
    return inloggad(origin, info, await loggaInMedKod(info.samtalsId, kod)).then(() => true);
  }

  // steg === 'telefon' utan nummer
  if (/\d{5,}/.test(kompakt)) {
    await skicka('Det ser inte ut som ett svenskt mobilnummer. Skriv det så här: 070-123 45 67.');
    return true;
  }
  await uppdatera(info.samtalsId, (i) => (i.identifiering = null));
  return false;
}

/** Resultatet av koden eller kontovalet. När kunden är inloggad fortsätter Camilla med ärendet. */
async function inloggad(origin: string, info: Samtalsinfo, svar: SmsInloggning): Promise<void> {
  const skicka = (t: string, val: Snabbsval[] = []) => skickaTillKund(info, t, val);
  if ('fel' in svar) {
    await logga(info.samtalsId, 'identifiering', `misslyckad: ${svar.fel}`);
    if (/ny kod/i.test(svar.fel)) {
      await uppdatera(info.samtalsId, (i) => (i.identifiering = { steg: 'telefon', sedan: Date.now() }));
      await skicka(`${svar.fel.replace(/ Be om en ny kod\.?$/, '')} Skriv ditt mobilnummer igen så skickar jag en ny kod.`);
    } else {
      await skicka(svar.fel);
    }
    return;
  }
  if (svar.status === 'valj') {
    await uppdatera(info.samtalsId, (i) => (i.identifiering = { steg: 'konto', sedan: Date.now() }));
    await logga(info.samtalsId, 'identifiering', `koden rätt, numret finns på ${svar.konton.length} konton`);
    await skicka(
      'Tack! Numret finns på flera konton hos oss. Vilket gäller det?',
      svar.konton.map((k) => ({ titel: k.namn.slice(0, MAX_TITEL), payload: `${SYS}KONTO:${k.nummer}` }))
    );
    return;
  }
  const nu = await uppdatera(info.samtalsId, (i) => {
    i.identifiering = null;
    i.kund = { nummer: svar.kundnummer, namn: svar.namn };
  });
  await logga(info.samtalsId, 'kund identifierad', `kundnummer ${svar.kundnummer}`);
  await skriver(info);
  // Samma mening som widgeten skickar – Camilla hämtar bokningarna och fortsätter ärendet.
  await levereraCamilla(origin, nu ?? info, await camilla(origin, nu ?? info, { message: 'Jag har legitimerat mig nu.' }));
}

/** Kunden bekräftade ombokningen eller avbokningen. Ändringen görs av samma kod som webbchattens knapp. */
async function bekrafta(origin: string, info: Samtalsinfo, forslagId: string): Promise<void> {
  if (!/^(OF|AV)-[A-Z0-9]{8}$/.test(forslagId)) return;
  const vad = forslagId.startsWith('AV-') ? 'avbokning' : 'ombokning';
  const Vad = vad === 'avbokning' ? 'Avbokning' : 'Ombokning';
  await uppdatera(info.samtalsId, (i) => (i.vantandeForslag = null));
  await logga(info.samtalsId, 'kunden bekräftade', forslagId);
  await skriver(info);
  const r = await camilla(origin, info, { handling: 'bekrafta', forslagId });
  if ('fel' in r) {
    // Ingen falsk bekräftelse: utan svar från systemet vet vi inte om något ändrats.
    await logga(info.samtalsId, `FEL ${vad}`, `${r.status} ${r.fel}`);
    await markeraKraverAtgard(info.samtalsId, `${Vad} ${forslagId}: inget svar från systemet – kontrollera i TimeWave`);
    await skickaTillKund(info, 'Jag fick inget besked från bokningssystemet, så jag kan inte lova att ändringen gick igenom. En kollega kontrollerar det och återkommer här.');
    return;
  }
  let resultat: Bekraftelse;
  try {
    resultat = JSON.parse(r.text) as Bekraftelse;
  } catch {
    await logga(info.samtalsId, `FEL ${vad}`, 'oläsbart svar');
    return;
  }
  await logga(info.samtalsId, vad, `${forslagId}: ${resultat.utfall}`);
  if (resultat.utfall !== 'SUCCESS' && resultat.utfall !== 'OGILTIGT_FORSLAG' && resultat.utfall !== 'UTGANGET' && resultat.utfall !== 'PAGAR_REDAN') {
    await markeraKraverAtgard(info.samtalsId, `${Vad} ${forslagId} gick inte igenom (${resultat.utfall})`);
  }
  await leverera(origin, info, resultat.text);
  if (resultat.fortsatt) {
    await skriver(info);
    await levereraCamilla(origin, (await hamtaInfo(info.samtalsId)) ?? info, await camilla(origin, info, { message: resultat.fortsatt }));
  }
}

// ─── Camillas svar till kanalen ──────────────────────────────────────────────

async function levereraCamilla(origin: string, info: Samtalsinfo, svar: CamillaSvar): Promise<void> {
  if ('fel' in svar) {
    await logga(info.samtalsId, 'FEL Camilla', `${svar.status} ${svar.fel}`);
    if (svar.status === 503) return; // chatten är avstängd – personalen svarar som vanligt
    if (svar.status === 429) {
      await skickaTillKund(info, svar.fel);
      return;
    }
    await markeraKraverAtgard(info.samtalsId, 'Camilla kunde inte svara');
    await skickaTillKund(info, 'Jag kan tyvärr inte svara just nu. En kollega tittar på ditt meddelande och återkommer här.');
    return;
  }
  await leverera(origin, info, svar.text);
}

/** Tolkar Camillas markeringar och skickar svaret – om AI:n fortfarande får svara. */
async function leverera(origin: string, info: Samtalsinfo, radtext: string): Promise<void> {
  // Har någon i personalen hunnit svara medan Camilla tänkte? Då skickas ingenting.
  // (En paus som Camilla själv satt när hon lämnade över stoppar inte hennes besked om det.)
  const aktuell = (await hamtaInfo(info.samtalsId)) ?? info;
  if (!aiFarSvara(aktuell) && aktuell.pausAv !== 'ai') {
    await logga(info.samtalsId, 'AI-svar stoppat', 'personalen tog över medan Camilla svarade');
    return;
  }
  const t = tolkaSvar(radtext);

  if (t.identifiera) {
    await uppdatera(info.samtalsId, (i) => (i.identifiering = { steg: 'telefon', sedan: Date.now() }));
    await logga(info.samtalsId, 'identifiering', 'Camilla bad kunden identifiera sig');
    const fraga = 'Skriv mobilnumret som du har registrerat hos oss, så skickar jag en kod med SMS.';
    await skickaTillKund(info, t.text ? `${t.text}\n\n${fraga}` : fraga);
    return;
  }

  if (t.bekrafta) {
    const kort = await hamtaKortet(origin, info, t.bekrafta);
    if (!kort || kort.status !== 'vantar') {
      await logga(info.samtalsId, 'FEL sammanfattning', `${t.bekrafta} gick inte att hämta`);
      await skickaTillKund(info, 'Sammanfattningen gick inte att ta fram just nu, så ingenting är ändrat. Vill du att jag hämtar tiderna igen?', snabbsvar(['Ja, visa tiderna igen', 'Nej tack']));
      return;
    }
    await uppdatera(info.samtalsId, (i) => (i.vantandeForslag = kort.id));
    const avbokning = 'typ' in kort && kort.typ === 'avbokning';
    await logga(info.samtalsId, 'sammanfattning visad', `${kort.id}: ${kort.fore.datum} ${kort.fore.tid} → ${'efter' in kort ? `${kort.efter.datum} ${kort.efter.tid}` : 'avbokas'}, avgift ${kort.avgiftKr} kr`);
    if (t.text) await skickaTillKund(info, t.text);
    await skickaTillKund(info, kortText(kort), [
      { titel: avbokning ? 'Bekräfta avbokning' : 'Bekräfta ombokning', payload: `${SYS}BEKRAFTA:${kort.id}` },
      { titel: 'Avbryt', payload: 'Avbryt – jag behåller min nuvarande bokning.' },
    ]);
    return;
  }

  await skickaTillKund(info, t.text, snabbsvar(t.val));
}

async function hamtaKortet(origin: string, info: Samtalsinfo, forslagId: string): Promise<Kort | Avbokningskort | null> {
  const r = await camilla(origin, info, { handling: 'kort', forslagId });
  if ('fel' in r) return null;
  try {
    return JSON.parse(r.text) as Kort | Avbokningskort;
  } catch {
    return null;
  }
}

/** Samma uppgifter som kortet i webbchatten – ur servern, aldrig ur det modellen skrivit. */
function kortText(k: Kort | Avbokningskort): string {
  return [
    ...('efter' in k
      ? [`Nu: ${k.fore.datum} kl. ${k.fore.tid} med ${k.fore.stadare}`, `Ny tid: ${k.efter.datum} kl. ${k.efter.tid} med ${k.efter.stadare}${k.byteAvStadare ? ' (annan städare)' : ''}`]
      : [`Avbokas: ${k.tjanst} ${k.fore.datum} kl. ${k.fore.tid} med ${k.fore.stadare}`]),
    k.bara_detta_tillfalle ? 'Gäller bara det här tillfället – dina andra städningar ligger kvar.' : '',
    // Ingen avgift: raden visas inte alls (samma som i webbchatten).
    k.avgiftKr > 0 ? k.avgiftText : '',
    k.lasläge ? '(Testläge – ingenting ändras i bokningssystemet.)' : '',
    'Sammanfattningen gäller i 10 minuter.',
  ]
    .filter(Boolean)
    .join('\n');
}

// ─── Personalen svarar i tråden ──────────────────────────────────────────────

/**
 * Ett meddelande som Stodonas konto skickat (eko). Är det inte Camillas eget
 * har en människa svarat: Camilla pausas i samtalet och får veta vad som sagts.
 */
export async function taEmotEko(origin: string, kundId: string, mid: string, text: string, kanal: MetaKanal = 'instagram'): Promise<void> {
  const pre = plattform(kanal).pre;
  if (await lagring.hamta(`${pre}:eget:mid:${mid}`)) return;
  if (text && (await lagring.hamta(`${pre}:eget:${await sha(`${kundId}:${text}`)}`))) return;

  const info = await samtalFor(kanal, kundId);
  await taOver(info.samtalsId, `Kundservice svarade i ${kanalNamn(kanal)}`, PAUS_EFTER_PERSONAL_TIMMAR);
  await uppdatera(info.samtalsId, (i) => {
    i.identifiering = null;
    i.vantandeForslag = null;
  });
  await noteraMeddelande(info.samtalsId, 'personal', text || '[bilaga]');
  if (text) {
    const r = await camilla(origin, info, { handling: 'notering', notering: text, fran: 'personal' });
    if ('fel' in r) await logga(info.samtalsId, 'FEL notering', r.fel);
  }
}

// ─── Metas händelser (gemensamt för api/instagram.ts och api/messenger.ts) ───

export interface Handelse {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    is_deleted?: boolean;
    is_unsupported?: boolean;
    quick_reply?: { payload?: string };
    attachments?: { type?: string }[];
    reply_to?: { story?: unknown };
    referral?: Referral;
  };
  postback?: { mid?: string; title?: string; payload?: string; referral?: Referral };
  /** Kunden kom in i en befintlig tråd via en annons eller länk (Messenger). */
  referral?: Referral;
}

const BILAGA: Record<string, string> = {
  image: 'en bild',
  video: 'en video',
  audio: 'ett röstmeddelande',
  file: 'en fil',
  share: 'ett delat inlägg',
  story_mention: 'en story där Stodona nämns',
  ig_reel: 'en reel',
  reel: 'en reel',
  location: 'en plats',
  fallback: 'en länk',
};

/** Knappen "Kom igång" i Messenger och Instagram (payloaden bestäms i Metas inställningar). */
const KOM_IGANG = /^(get_started|kom_igang|start)$/i;

export async function hanteraHandelse(origin: string, kanal: MetaKanal, h: Handelse): Promise<void> {
  const lage = kanalLage(kanal);
  const m = h.message;

  // Stodonas eget konto har skickat något: Camilla själv, eller personalen.
  if (m?.is_echo) {
    const kund = h.recipient?.id;
    if (!m.mid || !kund || lage === 'av' || (lage === 'test' && !arTestare(kund, kanal))) return;
    if (!(await forstaGangen(m.mid, kanal))) return;
    await taEmotEko(origin, kund, m.mid, (m.text ?? '').slice(0, 1500), kanal);
    return;
  }

  const id = h.sender?.id;
  if (!id || lage === 'av' || m?.is_deleted || m?.is_unsupported) return;
  if (lage === 'test' && !arTestare(id, kanal)) {
    // Id:t syns i Vercels logg – så hittar man sitt eget för IG_TESTARE / FB_TESTARE.
    console.log(`${kanal}: meddelande från ${id} – inte testare, Camilla svarar inte`);
    return;
  }

  const kalla = tolkaKalla(m?.referral ?? h.postback?.referral ?? h.referral, Boolean(m?.reply_to?.story));
  const tom: Inkommande = { mid: '', text: '', payload: null, bilagor: [] };

  // Bara en källa (kunden klickade på en annons eller länk men har inte skrivit): spara, skriv inget.
  if (!m && !h.postback) {
    if (kalla) await taEmot(origin, id, tom, kanal, kalla, 'kalla');
    return;
  }

  const mid = m?.mid ?? h.postback?.mid ?? `pb-${id}-${Math.floor(Date.now() / 5000)}`;
  if (!(await forstaGangen(mid, kanal))) return;

  // "Kom igång": kunden har öppnat tråden men inte skrivit något än.
  if (h.postback && KOM_IGANG.test(h.postback.payload ?? '')) {
    await taEmot(origin, id, { ...tom, mid }, kanal, kalla, 'oppning');
    return;
  }

  const bilagor = (m?.attachments ?? []).map((a) => BILAGA[a.type ?? ''] ?? 'en bilaga');
  if (m?.reply_to?.story) bilagor.push('ett svar på en av Stodonas stories');
  const in_: Inkommande = {
    mid,
    text: (m?.text ?? h.postback?.title ?? '').slice(0, 1200),
    payload: m?.quick_reply?.payload ?? h.postback?.payload ?? null,
    bilagor,
  };
  if (!in_.text && !in_.payload && !in_.bilagor.length) return;
  await taEmot(origin, id, in_, kanal, kalla);
}

// ─── Felsökning av kopplingen till Meta ──────────────────────────────────────

const FALT: Record<MetaKanal, string> = {
  instagram: 'messages,messaging_postbacks,messaging_referral',
  messenger: 'messages,messaging_postbacks,messaging_referrals',
};

async function metaAnrop(kanal: MetaKanal, metod: 'GET' | 'POST', sokvag: string): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const t = await token(kanal);
  if (!t) return { ok: false, data: { error: 'token saknas' } };
  try {
    const svar = await fetch(`${plattform(kanal).graph}/${VERSION}${sokvag}`, { method: metod, headers: { Authorization: `Bearer ${t}` }, signal: AbortSignal.timeout(10000) });
    return { ok: svar.ok, data: (await svar.json().catch(() => ({}))) as Record<string, unknown> };
  } catch (fel) {
    return { ok: false, data: { error: String(fel).slice(0, 200) } };
  }
}

/**
 * Svarar på frågan "varför kommer inga meddelanden fram?": gäller token, vilket
 * konto hör den till, och prenumererar kontot på appens webhook? Visar aldrig
 * token eller hemligheter. Med prenumerera=true slås prenumerationen på.
 */
export async function diagnos(prenumerera = false): Promise<Record<string, unknown>> {
  const ut: Record<string, unknown> = {};
  for (const kanal of ['instagram', 'messenger'] as MetaKanal[]) {
    const konto = await metaAnrop(kanal, 'GET', kanal === 'instagram' ? '/me?fields=user_id,username,account_type' : '/me?fields=id,name');
    const atgard = prenumerera && konto.ok ? await metaAnrop(kanal, 'POST', `/me/subscribed_apps?subscribed_fields=${FALT[kanal]}`) : null;
    const pren = konto.ok ? await metaAnrop(kanal, 'GET', '/me/subscribed_apps') : null;
    ut[kanal] = {
      lage: kanalLage(kanal),
      hemlighetSatt: Boolean(plattform(kanal).hemlighet()),
      testare: (plattform(kanal).testare() ?? '').split(',').filter((s) => s.trim()).length,
      token: konto.ok ? 'giltig' : 'FEL',
      konto: konto.data,
      ...(atgard ? { prenumerationSattes: atgard.data } : {}),
      prenumeration: pren?.data ?? null,
    };
  }
  return ut;
}
