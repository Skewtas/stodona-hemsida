// Inloggning i chatten med engångskod via SMS (SureSMS – samma konto och
// avsändare "Stodona.se" som fakturapåminnelserna och Bokis). Själva
// utskicket görs av Node-funktionen api/sms-skicka.ts.
//
// SÄKERHET
//  * Koden skickas bara till ett mobilnummer som REDAN finns på kunden i
//    TimeWave. Numret kunden skriver används bara för att leta – aldrig som
//    mottagare på egen hand. Står numret på flera konton (dubbletter, en
//    familj) får den som har telefonen välja konto EFTER rätt kod – högst
//    MAX_KONTON; fler än så räknas som ett fel i registret och ger ingen kod.
//  * Svaret är alltid detsamma ("om numret finns hos oss har vi skickat en
//    kod"), så chatten avslöjar aldrig vem som är kund.
//  * 6 siffror, gäller 10 minuter, högst 5 försök. Koden sparas bara som
//    hash, kopplad till samtalet – en kod fungerar inte i något annat samtal.
//  * Spärrar: 3 koder per samtal, 3 per mobilnummer och 10 per IP-adress
//    och kvart – mot både gissning och mot att någon SMS-bombar en kund.

import * as lagring from './_lagring';
import { twGet, type TwKlient } from './_timewave';

const KOD_SEKUNDER = 10 * 60;
const MAX_FORSOK = 5;
const SPARR_SEKUNDER = 15 * 60;
const MAX_PER_SAMTAL = 3;
const MAX_PER_NUMMER = 3;
const MAX_PER_IP = 10;
/** Så många aktiva konton får dela ett mobilnummer innan det räknas som ett registerfel. */
const MAX_KONTON = 5;


export function smsKonfigurerat(): boolean {
  return Boolean(process.env.SURESMS_API_KEY?.trim() && process.env.SMS_INTERN_NYCKEL);
}

/** Svenskt mobilnummer i formatet +467xxxxxxxx, eller null. */
export function mobilnummer(text: string): string | null {
  const t = String(text ?? '').replace(/[\s()-]/g, '');
  if (/^07\d{8}$/.test(t)) return `+46${t.slice(1)}`;
  if (/^467\d{8}$/.test(t)) return `+${t}`;
  if (/^\+467\d{8}$/.test(t)) return t;
  if (/^00467\d{8}$/.test(t)) return `+${t.slice(2)}`;
  return null;
}

/**
 * TimeWave har platshållarnummer som 070-000 00 01 på vissa kunder. Tillhör
 * ett sådant nummer en verklig person skulle den kunna logga in som kunden,
 * så uppenbart påhittade nummer får aldrig någon kod: minst sex nollor i rad
 * eller samma siffra genom hela abonnentdelen.
 */
export function platshallare(mobil: string): boolean {
  const abonnent = mobil.replace(/^\+467\d/, '');
  return /0{6}/.test(abonnent) || /^(\d)\1+$/.test(abonnent) || /^(0123456|1234567)/.test(abonnent);
}

/**
 * Skickar ett SMS från "Stodona.se" via den interna Node-funktionen
 * api/sms-skicka.ts – från Edge-miljön bryts anslutningen till SureSMS.
 * @param origin sajtens adress, t.ex. https://www.stodona.se (från anropet)
 */
export async function skickaSms(mobil: string, text: string, origin: string): Promise<{ ok: true } | { ok: false; fel: string }> {
  const nyckel = process.env.SMS_INTERN_NYCKEL;
  if (!nyckel) return { ok: false, fel: 'SMS_INTERN_NYCKEL saknas' };
  try {
    const svar = await fetch(new URL('/api/sms-skicka', origin).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-intern-nyckel': nyckel },
      body: JSON.stringify({ mobil, text }),
    });
    const data = (await svar.json().catch(() => ({}))) as { ok?: boolean; fel?: string };
    return data.ok === true ? { ok: true } : { ok: false, fel: data.fel ?? `sms-skicka svarade ${svar.status}` };
  } catch (fel) {
    return { ok: false, fel: `sms-skicka gick inte att nå: ${String(fel).slice(0, 100)}` };
  }
}

// ─── Vem har numret? ─────────────────────────────────────────────────────────

/**
 * TimeWave kan inte söka på telefonnummer. Alla aktiva kunder hämtas därför
 * (fyra anrop à 1 000) och hålls i minnet i tio minuter – bara kundnummer och
 * mobilnummer, aldrig sparat.
 */
let register: { hamtat: number; kunder: { nummer: string; mobiler: string[] }[] } | null = null;

async function kunderMedNummer(mobil: string): Promise<string[]> {
  if (!register || Date.now() - register.hamtat > 10 * 60 * 1000) {
    type Rad = TwKlient & { mobile?: string; phone?: string };
    const forsta = await twGet<{ data?: Rad[]; last_page?: number }>('/clients?page[size]=1000&page[number]=1');
    const sidor = Math.min(Number(forsta.last_page ?? 1), 20);
    const resten = await Promise.all(
      Array.from({ length: Math.max(0, sidor - 1) }, (_, i) =>
        twGet<{ data?: Rad[] }>(`/clients?page[size]=1000&page[number]=${i + 2}`).then((r) => r.data ?? [])
      )
    );
    register = {
      hamtat: Date.now(),
      kunder: [...(forsta.data ?? []), ...resten.flat()]
        .filter((k) => !k.deleted && k.status === 'active' && k.number)
        .map((k) => ({ nummer: String(k.number), mobiler: [k.mobile, k.phone].map((n) => mobilnummer(n ?? '')).filter((n): n is string => Boolean(n)) })),
    };
  }
  return register.kunder.filter((k) => k.mobiler.includes(mobil)).map((k) => k.nummer);
}

// ─── Spärrar ─────────────────────────────────────────────────────────────────

async function overTaket(nyckel: string, tak: number): Promise<boolean> {
  const antal = (await lagring.hamta<number>(nyckel)) ?? 0;
  if (antal >= tak) return true;
  await lagring.spara(nyckel, antal + 1, SPARR_SEKUNDER);
  return false;
}

async function hash(text: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function lika(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

interface Vantande {
  /** Kontona som har mobilnumret. Fler än ett: kunden väljer efter rätt kod. */
  kundnummer: string[];
  hash: string;
  forsok: number;
}

export const GENERISKT_SVAR = 'Om numret finns hos oss har vi skickat en kod med SMS. Skriv in den här.';

/**
 * Startar inloggningen. Svarar alltid samma sak utåt – vare sig numret finns
 * eller inte – utom när något av skydden slår till.
 */
export async function skickaKod(
  samtalsId: string,
  text: string,
  ip: string,
  origin: string,
  /** Var kunden skriver in koden – styr bara texten i SMS:et. */
  kanal: 'webb' | 'instagram' = 'webb'
): Promise<{ ok: true; meddelande: string } | { fel: string }> {
  const mobil = mobilnummer(text);
  if (!mobil) return { fel: 'Skriv ett svenskt mobilnummer, till exempel 070-123 45 67.' };
  if (!smsKonfigurerat()) return { fel: 'Inloggning med SMS är inte påslagen.' };

  if (
    (await overTaket(`sjalv:sms:samtal:${samtalsId}`, MAX_PER_SAMTAL)) ||
    (await overTaket(`sjalv:sms:nummer:${await hash(mobil)}`, MAX_PER_NUMMER)) ||
    (await overTaket(`sjalv:sms:ip:${ip}`, MAX_PER_IP))
  ) {
    return { fel: 'För många försök. Vänta en kvart och försök igen.' };
  }

  const traffar = platshallare(mobil) ? [] : await kunderMedNummer(mobil);
  if (traffar.length === 0 || traffar.length > MAX_KONTON) {
    // Ingen kund, eller orimligt många konton med numret: skicka ingenting, men svara som vanligt.
    if (traffar.length > MAX_KONTON) console.warn(`smskod: numret hör till ${traffar.length} kunder – ingen kod skickad`);
    await lagring.taBort(`sjalv:smskod:${samtalsId}`);
    return { ok: true, meddelande: GENERISKT_SVAR };
  }

  const kod = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
  await lagring.spara(`sjalv:smskod:${samtalsId}`, { kundnummer: traffar, hash: await hash(`${samtalsId}:${kod}`), forsok: 0 } satisfies Vantande, KOD_SEKUNDER);

  const smstext =
    kanal === 'instagram'
      ? `${kod} är din kod till Stodonas chatt på Instagram. Skriv den bara i din DM-tråd med Stodona. Den gäller i 10 minuter.`
      : `${kod} är din kod till Stodonas chatt. Den gäller i 10 minuter. Dela den aldrig – Stodona frågar aldrig efter den.`;
  const skickat = await skickaSms(mobil, smstext, origin);
  if (skickat.ok === false) {
    console.error(`smskod: ${skickat.fel}`);
    await lagring.taBort(`sjalv:smskod:${samtalsId}`);
    return { fel: 'SMS:et kunde inte skickas just nu. Försök igen om en stund.' };
  }
  return { ok: true, meddelande: GENERISKT_SVAR };
}

/** Kontrollerar koden. Rätt kod ger kundnumret – en gång. */
export async function kontrolleraKod(samtalsId: string, kod: string): Promise<{ kundnummer: string[] } | { fel: string }> {
  const nyckel = `sjalv:smskod:${samtalsId}`;
  const vantande = await lagring.hamta<Vantande>(nyckel);
  if (!vantande) return { fel: 'Koden har gått ut eller finns inte. Be om en ny kod.' };
  const rensad = String(kod ?? '').replace(/\D/g, '');
  if (!lika(await hash(`${samtalsId}:${rensad}`), vantande.hash)) {
    const forsok = vantande.forsok + 1;
    if (forsok >= MAX_FORSOK) {
      await lagring.taBort(nyckel);
      return { fel: 'Fel kod för många gånger. Be om en ny kod.' };
    }
    await lagring.spara(nyckel, { ...vantande, forsok }, KOD_SEKUNDER);
    return { fel: `Fel kod. Du har ${MAX_FORSOK - forsok} försök kvar.` };
  }
  await lagring.taBort(nyckel);
  // (Äldre väntande koder sparade ett enda kundnummer.)
  return { kundnummer: Array.isArray(vantande.kundnummer) ? vantande.kundnummer : [String(vantande.kundnummer)] };
}
