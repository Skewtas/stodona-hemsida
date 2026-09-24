// Instagram som kanal till Camilla.
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
//                         modellen) med snabbsvaret "Bekräfta ombokning". Bara
//                         det – eller ett tydligt "ja" direkt efter – genomför
//                         ändringen, via samma bekraftaOmbokning som webben.
//
// MÄNNISKA ELLER AI
// Svarar någon i personalen i tråden (i Instagram-appen eller Meta Business
// Suite) kommer det som ett "eko". Då pausas Camilla i samtalet i 12 timmar
// från personalens senaste meddelande, och det som skrivs under tiden förs
// in i hennes historik så att hon kan ta vid med rätt sammanhang. Camilla
// pausar sig också själv när hon lämnat över till kundservice. Före varje
// svar kontrolleras pausen igen, så AI och personal svarar aldrig samtidigt.
//
// Meta: Instagram API med Instagram-inloggning (graph.instagram.com).
// Svar får bara skickas inom 24 timmar från kundens senaste meddelande –
// Camilla svarar alltid direkt, så det gäller bara personalen.

import * as lagring from './_lagring';
import { skickaKod, mobilnummer } from './_smskod';
import { loggaInMedKod, valjSmsKonto, type SmsInloggning } from './_sjalvservice';
import type { Kort, Bekraftelse } from './_sjalvservice';
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
  type Samtalsinfo,
  type CamillaSvar,
} from './_kanaler';

const GRAPH = (process.env.IG_GRAPH_BAS || 'https://graph.instagram.com').replace(/\/+$/, '');
const VERSION = process.env.IG_GRAPH_VERSION || 'v25.0';
/** Instagram tar högst 1000 byte text per meddelande. */
const MAX_BYTE = 950;
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
export const lokalUtkorg: { till: string; text: string; snabbsvar: string[] }[] = [];

/** Snabbsvar som styr systemet i stället för att gå till Camilla. */
const SYS = 'STODONA:';

// ─── Påslaget ────────────────────────────────────────────────────────────────

/**
 * INSTAGRAM_CHAT:
 *   av   (standard) – webhooken tar emot men Camilla svarar aldrig
 *   test – Camilla svarar bara Instagram-kontona i IG_TESTARE (IGSID, kommaseparerade)
 *   pa   – Camilla svarar alla
 */
export function instagramLage(): 'av' | 'test' | 'pa' {
  const v = (process.env.INSTAGRAM_CHAT ?? '').trim().toLowerCase();
  return v === 'pa' || v === 'test' ? v : 'av';
}

export function arTestare(igsid: string): boolean {
  return (process.env.IG_TESTARE ?? '')
    .split(',')
    .map((s) => s.trim())
    .includes(igsid);
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
export async function giltigSignatur(radKropp: string, header: string | null): Promise<boolean> {
  const hemlighet = process.env.IG_APP_SECRET;
  if (!hemlighet || !header?.startsWith('sha256=')) return false;
  const vantat = await hmacHex(hemlighet, radKropp);
  const given = header.slice(7).toLowerCase();
  let diff = vantat.length ^ given.length;
  for (let i = 0; i < Math.max(vantat.length, given.length); i++) diff |= (vantat.charCodeAt(i) || 0) ^ (given.charCodeAt(i) || 0);
  return diff === 0;
}

/** Den förnyade token (se fornyaToken) går före den i miljön. */
async function token(): Promise<string | null> {
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
  const svar = await fetch(`${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(nu)}`);
  const data = (await svar.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!svar.ok || !data.access_token) return { ok: false, detaljer: data.error?.message ?? `svarade ${svar.status}` };
  const dagar = Math.floor((data.expires_in ?? 60 * 86400) / 86400);
  await lagring.spara('ig:token', { token: data.access_token, fornyad: new Date().toISOString() }, Math.max(86400, (data.expires_in ?? 60 * 86400) - 3600));
  return { ok: true, detaljer: `förnyad, gäller ${dagar} dagar` };
}

async function graph(sokvag: string, kropp: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const t = await token();
  if (!t) return { ok: false, data: { error: 'IG_ACCESS_TOKEN saknas' } };
  const svar = await fetch(`${GRAPH}/${VERSION}${sokvag}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kropp),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await svar.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: svar.ok, data };
}

/** Delar upp text som är för lång för ett Instagram-meddelande, helst vid meningsslut. */
function delaUpp(text: string): string[] {
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

/** Skickar ett svar till kunden. Snabbsvaren hamnar på sista delen. Varje utskick märks så att ekot känns igen. */
async function skickaTillKund(igsid: string, samtalsId: string, text: string, val: Snabbsval[] = []): Promise<boolean> {
  const delar = delaUpp(text || (val.length ? 'Välj ett alternativ:' : ''));
  for (const [i, del] of delar.entries()) {
    await lagring.spara(`ig:eget:${await sha(`${igsid}:${del}`)}`, 1, EGET_TTL);
    const sista = i === delar.length - 1;
    const meddelande: Record<string, unknown> = { text: del };
    if (sista && val.length) meddelande.quick_replies = val.map((v) => ({ content_type: 'text', title: v.titel, payload: v.payload }));
    if (LOKAL) {
      const snabb = sista ? val.map((v) => `${v.titel} → ${v.payload}`) : [];
      lokalUtkorg.push({ till: igsid, text: del, snabbsvar: snabb });
      console.log(`\n[lokal instagram] till ${igsid}:\n${del}${snabb.length ? `\n  snabbsvar: ${snabb.join(' | ')}` : ''}\n`);
      continue;
    }
    const svar = await graph('/me/messages', { recipient: { id: igsid }, message: meddelande });
    if (!svar.ok) {
      await logga(samtalsId, 'FEL utskick', JSON.stringify(svar.data).slice(0, 300));
      return false;
    }
    if (typeof svar.data.message_id === 'string') await lagring.spara(`ig:eget:mid:${svar.data.message_id}`, 1, EGET_TTL);
  }
  await noteraMeddelande(samtalsId, 'ai', text);
  await logga(samtalsId, 'svar skickat', `${text.slice(0, 200)}${val.length ? ` [snabbsvar: ${val.map((v) => v.titel).join(' | ')}]` : ''}`);
  return true;
}

/** "Skriver …" medan Camilla tänker. Får aldrig stoppa något. */
async function skriver(igsid: string): Promise<void> {
  if (LOKAL) return;
  await graph('/me/messages', { recipient: { id: igsid }, sender_action: 'typing_on' }).catch(() => undefined);
}

/** @användarnamn för personalens skull (inkorgen, mejlen till kundservice). */
async function hamtaAnvandarnamn(igsid: string): Promise<string> {
  if (LOKAL) return `@test_${igsid.slice(-4)}`;
  const t = await token();
  if (!t) return '';
  try {
    const svar = await fetch(`${GRAPH}/${VERSION}/${encodeURIComponent(igsid)}?fields=username,name`, {
      headers: { Authorization: `Bearer ${t}` },
      signal: AbortSignal.timeout(5000),
    });
    const d = (await svar.json().catch(() => ({}))) as { username?: string; name?: string };
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

/** Meta skickar ibland samma händelse flera gånger. Varje meddelande behandlas en gång. */
export async function forstaGangen(mid: string): Promise<boolean> {
  return lagring.lasa(`ig:mid:${mid}`, 2 * 86400);
}

/**
 * Ett meddelande från kunden. Läggs i samtalets kö; den som har samtalets lås
 * betar av kön i tur och ordning, så att kunden aldrig får svar i fel ordning
 * eller två svar på samma sak.
 */
export async function taEmot(origin: string, igsid: string, in_: Inkommande): Promise<void> {
  let info = await samtalFor('instagram', igsid);
  if (!info.visningsnamn) {
    const namn = await hamtaAnvandarnamn(igsid);
    if (namn) info = (await uppdatera(info.samtalsId, (i) => (i.visningsnamn = namn))) ?? info;
  }
  const beskrivning = [in_.text, ...in_.bilagor.map((b) => `[${b}]`)].filter(Boolean).join(' ');
  await logga(info.samtalsId, 'DM mottaget', `${info.visningsnamn || igsid}: ${in_.payload?.startsWith(SYS) ? `(val ${in_.payload})` : beskrivning.slice(0, 200)}`);
  await noteraMeddelande(info.samtalsId, 'kund', beskrivning);

  // Personalen har samtalet: Camilla håller tyst men får veta vad kunden skrev.
  if (!aiFarSvara(info)) {
    await logga(info.samtalsId, 'AI tyst', `personalen har samtalet (${info.orsak})`);
    const r = await camilla(origin, info, { handling: 'notering', notering: beskrivning, fran: 'kund' });
    if ('fel' in r) await logga(info.samtalsId, 'FEL notering', r.fel);
    // Camilla lämnade över och ingen har svarat än: kunden får veta en gång att ärendet ligger hos kundservice.
    if (info.pausAv === 'ai' && !info.pausbesked) {
      await uppdatera(info.samtalsId, (i) => (i.pausbesked = true));
      await skickaTillKund(igsid, info.samtalsId, 'Tack! Kundservice har ditt ärende och svarar dig här så snart de kan.');
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
    if (info.identifiering?.steg !== 'konto') return skickaTillKund(info.externId, samtalsId, 'Valet har gått ut. Vill du att jag skickar en ny kod?').then(() => undefined);
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
  const text = [payload || in_.text, ...in_.bilagor.map((b) => `[Kunden skickade ${b} i Instagram. Du kan inte se den, men den finns kvar i tråden för kundservice.]`)]
    .filter(Boolean)
    .join('\n');
  if (!text) return;
  await skriver(info.externId);
  await levereraCamilla(origin, info, await camilla(origin, info, { message: text }));
}

/** Tar hand om ett steg i identifieringen. Returnerar false om kunden pratar om något annat – då går meddelandet till Camilla. */
async function identifieringssteg(origin: string, info: Samtalsinfo, text: string): Promise<boolean> {
  const steg = info.identifiering!.steg;
  const skicka = (t: string, val: Snabbsval[] = []) => skickaTillKund(info.externId, info.samtalsId, t, val);
  const kompakt = text.replace(/[\s\-().]/g, '');
  const nummer = kompakt.match(/(?:\+46|0046|46|0)7\d{8}/)?.[0] ?? null;
  const avbryt = /^\s*(avbryt|nej|nej tack|strunt|glöm det)\b/i.test(text);

  if (avbryt || (steg === 'konto' && !nummer)) {
    await uppdatera(info.samtalsId, (i) => (i.identifiering = null));
    return false;
  }

  if (nummer && mobilnummer(nummer)) {
    const svar = await skickaKod(info.samtalsId, nummer, `instagram:${info.externId}`, origin, 'instagram');
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
  const skicka = (t: string, val: Snabbsval[] = []) => skickaTillKund(info.externId, info.samtalsId, t, val);
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
  await skriver(info.externId);
  // Samma mening som widgeten skickar – Camilla hämtar bokningarna och fortsätter ärendet.
  await levereraCamilla(origin, nu ?? info, await camilla(origin, nu ?? info, { message: 'Jag har legitimerat mig nu.' }));
}

/** Kunden bekräftade ombokningen. Ändringen görs av samma kod som webbchattens knapp. */
async function bekrafta(origin: string, info: Samtalsinfo, forslagId: string): Promise<void> {
  if (!/^OF-[A-Z0-9]{8}$/.test(forslagId)) return;
  await uppdatera(info.samtalsId, (i) => (i.vantandeForslag = null));
  await logga(info.samtalsId, 'kunden bekräftade', forslagId);
  await skriver(info.externId);
  const r = await camilla(origin, info, { handling: 'bekrafta', forslagId });
  if ('fel' in r) {
    // Ingen falsk bekräftelse: utan svar från systemet vet vi inte om något ändrats.
    await logga(info.samtalsId, 'FEL ombokning', `${r.status} ${r.fel}`);
    await markeraKraverAtgard(info.samtalsId, `Ombokning ${forslagId}: inget svar från systemet – kontrollera i TimeWave`);
    await skickaTillKund(info.externId, info.samtalsId, 'Jag fick inget besked från bokningssystemet, så jag kan inte lova att ändringen gick igenom. En kollega kontrollerar det och återkommer här.');
    return;
  }
  let resultat: Bekraftelse;
  try {
    resultat = JSON.parse(r.text) as Bekraftelse;
  } catch {
    await logga(info.samtalsId, 'FEL ombokning', 'oläsbart svar');
    return;
  }
  await logga(info.samtalsId, 'ombokning', `${forslagId}: ${resultat.utfall}`);
  if (resultat.utfall !== 'SUCCESS' && resultat.utfall !== 'OGILTIGT_FORSLAG' && resultat.utfall !== 'UTGANGET' && resultat.utfall !== 'PAGAR_REDAN') {
    await markeraKraverAtgard(info.samtalsId, `Ombokning ${forslagId} gick inte igenom (${resultat.utfall})`);
  }
  await leverera(origin, info, resultat.text);
  if (resultat.fortsatt) {
    await skriver(info.externId);
    await levereraCamilla(origin, (await hamtaInfo(info.samtalsId)) ?? info, await camilla(origin, info, { message: resultat.fortsatt }));
  }
}

// ─── Camillas svar till Instagram ────────────────────────────────────────────

async function levereraCamilla(origin: string, info: Samtalsinfo, svar: CamillaSvar): Promise<void> {
  if ('fel' in svar) {
    await logga(info.samtalsId, 'FEL Camilla', `${svar.status} ${svar.fel}`);
    if (svar.status === 503) return; // chatten är avstängd – personalen svarar som vanligt
    if (svar.status === 429) {
      await skickaTillKund(info.externId, info.samtalsId, svar.fel);
      return;
    }
    await markeraKraverAtgard(info.samtalsId, 'Camilla kunde inte svara');
    await skickaTillKund(info.externId, info.samtalsId, 'Jag kan tyvärr inte svara just nu. En kollega tittar på ditt meddelande och återkommer här.');
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
    await skickaTillKund(info.externId, info.samtalsId, t.text ? `${t.text}\n\n${fraga}` : fraga);
    return;
  }

  if (t.bekrafta) {
    const kort = await hamtaKortet(origin, info, t.bekrafta);
    if (!kort || kort.status !== 'vantar') {
      await logga(info.samtalsId, 'FEL sammanfattning', `${t.bekrafta} gick inte att hämta`);
      await skickaTillKund(info.externId, info.samtalsId, 'Sammanfattningen gick inte att ta fram just nu, så ingenting är ändrat. Vill du att jag hämtar tiderna igen?', snabbsvar(['Ja, visa tiderna igen', 'Nej tack']));
      return;
    }
    await uppdatera(info.samtalsId, (i) => (i.vantandeForslag = kort.id));
    await logga(info.samtalsId, 'sammanfattning visad', `${kort.id}: ${kort.fore.datum} ${kort.fore.tid} → ${kort.efter.datum} ${kort.efter.tid}, avgift ${kort.avgiftKr} kr`);
    if (t.text) await skickaTillKund(info.externId, info.samtalsId, t.text);
    await skickaTillKund(info.externId, info.samtalsId, kortText(kort), [
      { titel: 'Bekräfta ombokning', payload: `${SYS}BEKRAFTA:${kort.id}` },
      { titel: 'Avbryt', payload: 'Avbryt – jag behåller min nuvarande bokning.' },
    ]);
    return;
  }

  await skickaTillKund(info.externId, info.samtalsId, t.text, snabbsvar(t.val));
}

async function hamtaKortet(origin: string, info: Samtalsinfo, forslagId: string): Promise<Kort | null> {
  const r = await camilla(origin, info, { handling: 'kort', forslagId });
  if ('fel' in r) return null;
  try {
    return JSON.parse(r.text) as Kort;
  } catch {
    return null;
  }
}

/** Samma uppgifter som kortet i webbchatten – ur servern, aldrig ur det modellen skrivit. */
function kortText(k: Kort): string {
  return [
    `Nu: ${k.fore.datum} kl. ${k.fore.tid} med ${k.fore.stadare}`,
    `Ny tid: ${k.efter.datum} kl. ${k.efter.tid} med ${k.efter.stadare}${k.byteAvStadare ? ' (annan städare)' : ''}`,
    k.bara_detta_tillfalle ? 'Gäller bara det här tillfället – dina andra städningar ligger kvar.' : '',
    k.avgiftText,
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
export async function taEmotEko(origin: string, kundId: string, mid: string, text: string): Promise<void> {
  if (await lagring.hamta(`ig:eget:mid:${mid}`)) return;
  if (text && (await lagring.hamta(`ig:eget:${await sha(`${kundId}:${text}`)}`))) return;

  const info = await samtalFor('instagram', kundId);
  await taOver(info.samtalsId, 'Kundservice svarade i Instagram', PAUS_EFTER_PERSONAL_TIMMAR);
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
