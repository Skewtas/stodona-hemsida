// Samtalslagret: det som är gemensamt för alla kanaler som pratar med Camilla.
//
//   KANALER          webbchatten · Instagram · (Messenger, WhatsApp, mejl …)
//        ↓
//   SAMTALSLAGRET    den här filen: vem är vem, vem svarar (AI eller människa),
//        ↓           händelselogg och inkorgens index
//   CAMILLA          api/chat.ts – samma prompt, regler, verktyg och spärrar
//        ↓
//   SJÄLVSERVICE     api/_sjalvservice.ts, prismotorn, boka.stodona.se, TimeWave
//
// En ny kanal (t.ex. WhatsApp) behöver bara en adapter som tar emot
// meddelanden, anropar camilla() här och skickar svaret tillbaka – precis som
// api/_instagram.ts. Ingen affärslogik ska ligga i adaptern.
//
// Varje externt konto (ett Instagram-id, ett telefonnummer …) får ett eget
// samtals-id i samma format som webbchatten. Därmed fungerar allt som redan
// är kopplat till samtals-id: historiken, SMS-inloggningen, bokningsförslagen,
// statistiken och dialogarkivet i Head of.

import * as lagring from './_lagring';
import { lika } from './_personal';

export type Kanal = 'webb' | 'instagram';
export const EXTERNA_KANALER: readonly Kanal[] = ['instagram'];

const KANAL_NAMN: Record<Kanal, string> = { webb: 'Webbchatten', instagram: 'Instagram' };
export const kanalNamn = (k: Kanal) => KANAL_NAMN[k] ?? k;

/** Samma livslängd som samtalen i api/chat.ts. */
const SAMTAL_TTL_SEKUNDER = 7 * 24 * 3600;
const INKORG = 'kanal:inkorg';
/** Så länge AI:n håller tyst efter att en människa skrivit i samtalet. */
export const PAUS_EFTER_PERSONAL_TIMMAR = 12;
/** Så länge AI:n håller tyst efter att den själv lämnat över till kundservice. */
export const PAUS_EFTER_OVERLAMNING_TIMMAR = 48;

/** Identifieringen på kanaler utan widgetens inloggningsruta. */
export interface Identifiering {
  steg: 'telefon' | 'kod' | 'konto';
  sedan: number;
}

export interface Samtalsinfo {
  samtalsId: string;
  kanal: Kanal;
  /** Kanalens eget id för personen, t.ex. Instagram-scoped id (IGSID). */
  externId: string;
  /** Det personalen känner igen, t.ex. @användarnamn. */
  visningsnamn: string;
  /** Vem som svarar just nu. "manuell" = AI:n är tyst tills pausadTill passerat eller någon släpper samtalet. */
  hanteras: 'ai' | 'manuell';
  pausadTill: number;
  /** Vem som pausade: personalen, eller Camilla själv när hon lämnade över. */
  pausAv: 'personal' | 'ai' | null;
  /** Kunden har fått beskedet att kundservice har ärendet (skickas en gång per paus). */
  pausbesked: boolean;
  /** Varför samtalet är manuellt, eller varför det kräver åtgärd. */
  orsak: string;
  kraverAtgard: boolean;
  /** TimeWave-kunden, när personen identifierat sig med SMS-kod. */
  kund: { nummer: string; namn: string } | null;
  identifiering: Identifiering | null;
  /** Ombokningsförslaget som väntar på kundens bekräftelse (OF-…). */
  vantandeForslag: string | null;
  senaste: { fran: 'kund' | 'ai' | 'personal'; text: string; tid: number } | null;
  skapad: number;
}

const infoNyckel = (samtalsId: string) => `kanal:samtal:${samtalsId}`;

// ─── Samtal per extern person ────────────────────────────────────────────────

/**
 * Samtalet för en person i en kanal. Samma person får samma samtal så länge
 * det lever (7 dagar sedan senaste meddelandet), sedan ett nytt.
 */
export async function samtalFor(kanal: Kanal, externId: string): Promise<Samtalsinfo> {
  const idNyckel = `kanal:id:${kanal}:${externId}`;
  const befintligt = await lagring.hamta<string>(idNyckel);
  if (befintligt) {
    const info = await hamtaInfo(befintligt);
    if (info) return info;
  }
  const info: Samtalsinfo = {
    samtalsId: crypto.randomUUID(),
    kanal,
    externId,
    visningsnamn: '',
    hanteras: 'ai',
    pausadTill: 0,
    pausAv: null,
    pausbesked: false,
    orsak: '',
    kraverAtgard: false,
    kund: null,
    identifiering: null,
    vantandeForslag: null,
    senaste: null,
    skapad: Date.now(),
  };
  await lagring.spara(idNyckel, info.samtalsId, SAMTAL_TTL_SEKUNDER);
  await sparaInfo(info);
  return info;
}

export async function hamtaInfo(samtalsId: string): Promise<Samtalsinfo | null> {
  return lagring.hamta<Samtalsinfo>(infoNyckel(samtalsId));
}

async function sparaInfo(info: Samtalsinfo): Promise<void> {
  await lagring.spara(infoNyckel(info.samtalsId), info, SAMTAL_TTL_SEKUNDER);
  await lagring.spara(`kanal:id:${info.kanal}:${info.externId}`, info.samtalsId, SAMTAL_TTL_SEKUNDER);
  await lagring.indexera(INKORG, info.samtalsId, info.senaste?.tid ?? info.skapad);
}

/** Läser om, ändrar och sparar – alltid på det senast sparade, så att två steg inte skriver över varandra. */
export async function uppdatera(samtalsId: string, andring: (info: Samtalsinfo) => void): Promise<Samtalsinfo | null> {
  const info = await hamtaInfo(samtalsId);
  if (!info) return null;
  andring(info);
  await sparaInfo(info);
  return info;
}

export async function noteraMeddelande(samtalsId: string, fran: 'kund' | 'ai' | 'personal', text: string): Promise<void> {
  await uppdatera(samtalsId, (i) => {
    i.senaste = { fran, text: text.slice(0, 300), tid: Date.now() };
  });
}

// ─── AI eller människa ───────────────────────────────────────────────────────

/** Får Camilla svara i samtalet just nu? En utgången paus släpps av sig själv. */
export function aiFarSvara(info: Samtalsinfo): boolean {
  return info.hanteras === 'ai' || Date.now() >= info.pausadTill;
}

/** En människa tar över: AI:n svarar inte förrän pausen gått ut eller samtalet släpps. */
export async function taOver(samtalsId: string, orsak: string, timmar: number, av: 'personal' | 'ai' = 'personal'): Promise<void> {
  await uppdatera(samtalsId, (i) => {
    i.hanteras = 'manuell';
    i.pausadTill = Date.now() + timmar * 3600 * 1000;
    i.pausAv = av;
    i.pausbesked = false;
    i.orsak = orsak;
  });
  await logga(samtalsId, 'manuell', `${orsak} – AI pausad i ${timmar} h`);
}

/** Lämnar tillbaka samtalet till Camilla. */
export async function slappTillAi(samtalsId: string, av: string): Promise<void> {
  await uppdatera(samtalsId, (i) => {
    i.hanteras = 'ai';
    i.pausadTill = 0;
    i.pausAv = null;
    i.orsak = '';
    i.kraverAtgard = false;
  });
  await logga(samtalsId, 'ai', `AI aktiverad igen av ${av}`);
}

/**
 * Camilla har lämnat över till kundservice (eskalera_till_kundservice). På
 * kanaler där personalen svarar i samma tråd håller AI:n tyst tills någon
 * tagit hand om ärendet, så att kunden aldrig får två svar.
 */
export async function markeraOverlamnad(samtalsId: string, arende: string): Promise<void> {
  const info = await hamtaInfo(samtalsId);
  if (!info || info.kanal === 'webb') return;
  await uppdatera(samtalsId, (i) => {
    i.kraverAtgard = true;
  });
  await taOver(samtalsId, `Överlämnat till kundservice${arende ? ` (${arende})` : ''}`, PAUS_EFTER_OVERLAMNING_TIMMAR, 'ai');
}

export async function markeraKraverAtgard(samtalsId: string, orsak: string): Promise<void> {
  const info = await uppdatera(samtalsId, (i) => {
    i.kraverAtgard = true;
    if (!i.orsak) i.orsak = orsak;
  });
  if (info) await logga(samtalsId, 'kräver åtgärd', orsak);
}

// ─── Logg ────────────────────────────────────────────────────────────────────

export interface Handelse {
  tid: string;
  handelse: string;
  detaljer: string;
}

/**
 * Händelseloggen per samtal: mottaget, identifierad, verktyg, bekräftelse,
 * skickat, fel. Går också till Vercels logg, så att ett fel går att följa
 * steg för steg. Kan aldrig stoppa samtalet.
 */
export async function logga(samtalsId: string, handelse: string, detaljer = ''): Promise<void> {
  const post: Handelse = { tid: new Date().toISOString(), handelse, detaljer: detaljer.slice(0, 500) };
  console.log(`[kanal ${samtalsId.slice(0, 8)}] ${handelse}${detaljer ? `: ${post.detaljer}` : ''}`);
  try {
    await lagring.laggTillILista(`kanal:logg:${samtalsId}`, post, 200, SAMTAL_TTL_SEKUNDER);
  } catch (fel) {
    console.error('kanaler: kunde inte logga', fel);
  }
}

export async function hamtaLogg(samtalsId: string, antal = 100): Promise<Handelse[]> {
  return lagring.lasLista<Handelse>(`kanal:logg:${samtalsId}`, antal);
}

// ─── Inkorgen ────────────────────────────────────────────────────────────────

/** De senaste samtalen i alla externa kanaler – underlaget för en gemensam inkorg. */
export async function inkorg(antal = 50): Promise<Samtalsinfo[]> {
  await lagring.rensaIndex(INKORG, Date.now() - SAMTAL_TTL_SEKUNDER * 1000);
  const ider = await lagring.senasteIIndex(INKORG, antal);
  const rader = await Promise.all(ider.map((id) => hamtaInfo(id)));
  return rader.filter((r): r is Samtalsinfo => r !== null);
}

// ─── Anropet till Camilla ────────────────────────────────────────────────────

/** Är anropet ett internt kanalanrop? Nyckeln känner bara sajtens egen server. */
export function internNyckelOk(request: Request): boolean {
  const nyckel = process.env.KANAL_INTERN_NYCKEL ?? '';
  return nyckel.length >= 24 && lika(request.headers.get('x-kanal-nyckel') ?? '', nyckel);
}

export type CamillaSvar = { ok: true; text: string } | { ok: false; status: number; fel: string };

/**
 * Skickar ett meddelande till Camilla – samma endpoint, prompt, verktyg och
 * regler som webbchatten – och väntar in hela svaret.
 *
 * @param kropp  som webbchattens: { message } för en fråga, { handling, forslagId } för knapparna.
 */
export async function camilla(origin: string, info: Samtalsinfo, kropp: Record<string, unknown>): Promise<CamillaSvar> {
  const nyckel = process.env.KANAL_INTERN_NYCKEL;
  if (!nyckel) return { ok: false, status: 503, fel: 'KANAL_INTERN_NYCKEL saknas' };
  try {
    const svar = await fetch(new URL('/api/chat', origin).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kanal-nyckel': nyckel,
        'x-kanal': info.kanal,
        'x-kanal-avsandare': info.externId,
        'x-kanal-kontakt': encodeURIComponent(info.visningsnamn || info.externId),
      },
      body: JSON.stringify({ sessionId: info.samtalsId, ...kropp }),
      signal: AbortSignal.timeout(100_000),
    });
    const text = await svar.text();
    if (!svar.ok) {
      let fel = text.slice(0, 200);
      try {
        fel = (JSON.parse(text) as { error?: string }).error ?? fel;
      } catch {
        /* inte JSON */
      }
      return { ok: false, status: svar.status, fel };
    }
    return { ok: true, text };
  } catch (fel) {
    return { ok: false, status: 0, fel: String(fel).slice(0, 200) };
  }
}

// ─── Camillas markeringar ────────────────────────────────────────────────────

export interface TolkatSvar {
  text: string;
  /** [[val: A | B]] – knappar. */
  val: string[];
  /** [[bankid]] – kunden ska identifiera sig. */
  identifiera: boolean;
  /** [[bekrafta:OF-…]] – en ombokning väntar på kundens bekräftelse. */
  bekrafta: string | null;
}

/** Samma markeringar som widgeten tolkar (delaUppVal i src/components/ChatWidget.tsx). */
export function tolkaSvar(radtext: string): TolkatSvar {
  let text = radtext;
  const kort = text.match(/\[\[\s*bekrafta\s*:\s*(OF-[A-Z0-9]{8})\s*\]\]/i);
  text = text.replace(/\[\[\s*bekrafta\s*:[^\]]*\]\]/gi, '');
  const identifiera = /\[\[\s*bankid\s*\]\]/i.test(text);
  text = text.replace(/\[\[\s*bankid\s*\]\]/gi, '');
  let val: string[] = [];
  text = text.replace(/\[\[\s*val\s*:([^\]]*)\]\]/gi, (_, lista: string) => {
    val = lista
      .split('|')
      .map((v) => v.trim())
      .filter((v) => v && v.toLowerCase() !== 'annat');
    return '';
  });
  // Ingen annan intern markering får nå kunden.
  text = text.replace(/\[\[[^\]]*\]\]/g, '').replace(/[ \t]+\n/g, '\n').trim();
  return { text, val: val.slice(0, 12), identifiera, bekrafta: kort ? kort[1].toUpperCase() : null };
}
