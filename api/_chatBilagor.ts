// Bilagor i chatten – bilder och videor som kunden skickar, till exempel när
// något inte blev bra vid en städning.
//
// Filen börjar med understreck, så Vercel gör den inte till en egen endpoint.
// Den används av api/chat.ts, api/chat-bilaga.ts, api/chat-bilagor-rensa.ts
// och api/lead.ts.
//
// FILERNA SPARAS INTE – Stodonas beslut 2026-09-15
//  * En fil ligger bara kvar medan samtalet pågår. När Camilla lämnar över
//    ärendet skickas filerna som bilagor i mejlet till info@stodona.se och
//    raderas direkt efter att mejlet gått iväg.
//  * Skickas inget ärende raderas filerna automatiskt: vid nästa uppladdning
//    efter två timmar, och varje natt av api/chat-bilagor-rensa.
//  * Bilder visas för Camilla bara i meddelandet de skickas i. De sparas aldrig
//    i samtalshistoriken.
//
// SÄKERHET
//  * Bara bilder (JPEG, PNG, WebP, HEIC) och videor (MP4, MOV, WebM). Aldrig
//    SVG, HTML, PDF eller annat som kan innehålla kod.
//  * Bilder förminskas i webbläsaren innan de skickas. Det tar också bort
//    platsdata (EXIF/GPS) från mobilbilder.
//  * Varje fil hamnar i en mapp som är en hash av samtals-id:t. Chatten tar
//    bara emot bilagor från det egna samtalets mapp, så ingen kan skicka in
//    någon annans filer eller länkar till främmande sajter.
//  * Allt som skickas med ett mejl ryms under Resends gräns på 40 MB.

// Själva lagringen sköts av api/chat-bilagor.ts, som kör i Node-miljön.
// Vercel Blobs paket kan inte användas härifrån, eftersom chatten kör i edge.

export const MAX_BILAGOR_PER_MEDDELANDE = 5;
export const MAX_BILAGOR_PER_SAMTAL = 10;
export const MAX_BILD_BYTE = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTE = 25 * 1024 * 1024;
/** Alla bilagor i ett mejl tillsammans. Base64 gör dem en tredjedel större, och Resend tar högst 40 MB. */
export const MAX_TOTAL_BYTE = 28 * 1024 * 1024;
/** Hur länge en fil som aldrig skickats får ligga kvar innan den rensas bort. */
export const MAX_TIMMAR = 2;

export const BILDTYPER = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const VIDEOTYPER = ['video/mp4', 'video/quicktime', 'video/webm'];
/** Bildtyper som Claude kan titta på. HEIC går vidare till kundservice men syns inte för Camilla. */
export const SYNLIGA_BILDTYPER = ['image/jpeg', 'image/png', 'image/webp'] as const;

const FILANDELSER: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

const LOKAL = process.env.STODONA_LOKAL === 'true';

export type Bilagetyp = 'bild' | 'video';

export interface Bilaga {
  url: string;
  typ: Bilagetyp;
  mime: string;
  namn: string;
  storlek: number;
}

export function typFor(mime: string): Bilagetyp | null {
  if (BILDTYPER.includes(mime)) return 'bild';
  if (VIDEOTYPER.includes(mime)) return 'video';
  return null;
}

export function mimeFranFilnamn(sokvag: string): string | null {
  const andelse = sokvag.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (andelse === 'jpeg') return 'image/jpeg';
  return Object.entries(FILANDELSER).find(([, a]) => a === andelse)?.[0] ?? null;
}

/** Ett ofarligt filnamn med rätt filändelse för typen. */
export function rensaFilnamn(namn: string, mime: string): string {
  const bas = namn.replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'fil';
  return `${bas}.${FILANDELSER[mime] ?? 'bin'}`;
}

/** Samtalets mapp: en hash av samtals-id:t, så själva id:t aldrig syns i en länk. */
export async function samtalsMapp(samtalsId: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`stodona-bilaga:${samtalsId}`));
  return [...new Uint8Array(hash)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Kontrollerar filens första byte, så en HTML-fil inte kan utge sig för att vara en bild. */
export function stammerInnehallet(b: Uint8Array, mime: string): boolean {
  if (b.length < 12) return false;
  const text = (fran: number, till: number) => String.fromCharCode(...b.subarray(fran, till));
  switch (mime) {
    case 'image/jpeg':
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/png':
      return b[0] === 0x89 && text(1, 4) === 'PNG';
    case 'image/webp':
      return text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP';
    case 'image/heic':
    case 'image/heif':
    case 'video/mp4':
    case 'video/quicktime':
      return text(4, 8) === 'ftyp';
    case 'video/webm':
      return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
    default:
      return false;
  }
}

/** Vercel Blobs publika värd för vår butik, utläst ur nyckeln. */
export function blobVard(): string | null {
  const id = (process.env.BLOB_READ_WRITE_TOKEN || '').match(/^vercel_blob_rw_([a-z0-9]+)_/i)?.[1];
  return id ? `${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

// ─── Testmiljöns lagring ─────────────────────────────────────────────────────

interface LokalFil {
  bytes: Uint8Array;
  mime: string;
  namn: string;
  mapp: string;
  skapad: number;
}

const lokalaFiler = new Map<string, LokalFil>();

export function sparaLokalt(fil: Omit<LokalFil, 'skapad'>): string {
  const grans = Date.now() - MAX_TIMMAR * 3600 * 1000;
  for (const [id, gammal] of lokalaFiler) if (gammal.skapad < grans) lokalaFiler.delete(id);
  const id = crypto.randomUUID();
  lokalaFiler.set(id, { ...fil, skapad: Date.now() });
  return id;
}

export function hamtaLokalFil(id: string): LokalFil | null {
  return lokalaFiler.get(id) ?? null;
}

export function antalLokalaFiler(mapp: string): number {
  return [...lokalaFiler.values()].filter((f) => f.mapp === mapp).length;
}

/** En bild i testmiljön som base64 – Claude kan inte hämta localhost-länkar själv. */
export function lokalBilddata(url: string): { mime: (typeof SYNLIGA_BILDTYPER)[number]; base64: string } | null {
  const fil = lokalaFiler.get(lokaltId(url));
  if (!fil || !(SYNLIGA_BILDTYPER as readonly string[]).includes(fil.mime)) return null;
  let binar = '';
  for (let i = 0; i < fil.bytes.length; i += 0x8000) binar += String.fromCharCode(...fil.bytes.subarray(i, i + 0x8000));
  return { mime: fil.mime as (typeof SYNLIGA_BILDTYPER)[number], base64: btoa(binar) };
}

function lokaltId(url: string): string {
  try {
    const u = new URL(url, 'http://lokal');
    return u.pathname === '/api/chat-bilaga' ? u.searchParams.get('id') ?? '' : '';
  } catch {
    return '';
  }
}

// ─── KV ──────────────────────────────────────────────────────────────────────

async function kvKommando(kommando: string[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (LOKAL || !url || !token) return null;
  const svar = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kommando),
  });
  if (!svar.ok) throw new Error(`KV svarade ${svar.status}`);
  return (await svar.json()).result;
}

/** Räknar upp en nyckel i KV och svarar om taket är passerat. Släpper igenom om KV inte svarar. */
export async function overUppladdningstaket(nyckel: string, tak: number, ttlSekunder: number): Promise<boolean> {
  try {
    const antal = Number(await kvKommando(['INCR', nyckel]));
    if (antal === 1) await kvKommando(['EXPIRE', nyckel, String(ttlSekunder)]);
    return antal > tak;
  } catch (fel) {
    console.error('chat-bilaga: kunde inte räkna taket:', fel);
    return false;
  }
}

/** Sant för den första som frågar under perioden – används för att inte rensa för ofta. */
export async function forstaPa(nyckel: string, ttlSekunder: number): Promise<boolean> {
  try {
    return (await kvKommando(['SET', nyckel, '1', 'NX', 'EX', String(ttlSekunder)])) === 'OK';
  } catch {
    return false;
  }
}

// ─── Tolkning, radering och rensning ─────────────────────────────────────────

/**
 * Tolkar bilagorna som webbläsaren skickar med ett meddelande. Allt som inte
 * ligger i samtalets egen mapp, eller inte finns, kastas tyst.
 */
export async function tolkaBilagor(indata: unknown, samtalsId: string, egenOrigin: string): Promise<Bilaga[]> {
  if (!Array.isArray(indata) || !samtalsId) return [];
  const mapp = await samtalsMapp(samtalsId);
  const ut: Bilaga[] = [];

  for (const rad of indata.slice(0, MAX_BILAGOR_PER_MEDDELANDE)) {
    const adress = rad && typeof rad === 'object' && typeof (rad as { url?: unknown }).url === 'string' ? (rad as { url: string }).url : '';
    let u: URL;
    try {
      u = new URL(adress, egenOrigin);
    } catch {
      continue;
    }

    if (LOKAL) {
      const id = u.searchParams.get('id') ?? '';
      const fil = u.origin === egenOrigin && u.pathname === '/api/chat-bilaga' ? lokalaFiler.get(id) : undefined;
      const typ = fil ? typFor(fil.mime) : null;
      if (!fil || !typ || fil.mapp !== mapp) continue;
      ut.push({ url: `${egenOrigin}/api/chat-bilaga?id=${id}`, typ, mime: fil.mime, namn: fil.namn, storlek: fil.bytes.length });
      continue;
    }

    const vard = blobVard();
    const delar = u.pathname.split('/');
    const mime = mimeFranFilnamn(u.pathname);
    const typ = mime ? typFor(mime) : null;
    if (!vard || u.protocol !== 'https:' || u.host !== vard || delar.length !== 4 || delar[1] !== 'chatt' || delar[2] !== mapp) continue;
    if (!mime || !typ) continue;

    let namn = delar[3];
    try {
      namn = decodeURIComponent(namn);
    } catch {
      /* behåll som det är */
    }
    ut.push({ url: `https://${vard}${u.pathname}`, typ, mime, namn: namn.slice(0, 80), storlek: 0 });
  }

  const unika = ut.filter((b, i, alla) => alla.findIndex((x) => x.url === b.url) === i);
  if (LOKAL || !unika.length) return unika;

  // Storleken hämtas från lagringen, aldrig från webbläsaren. Filer som inte
  // finns faller bort här.
  try {
    const svar = (await lagring(egenOrigin, { handling: 'granska', urls: unika.map((b) => b.url) })) as {
      storlekar?: Record<string, number>;
    };
    return unika
      .map((b) => ({ ...b, storlek: svar.storlekar?.[b.url] ?? 0 }))
      .filter((b) => b.storlek > 0);
  } catch (fel) {
    console.error('chat-bilaga: kunde inte granska filerna:', fel);
    return [];
  }
}

/** Anropar api/chat-bilagor, som är den enda delen som pratar med Vercel Blob. */
async function lagring(egenOrigin: string, kropp: Record<string, unknown>): Promise<unknown> {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET saknas');
  const svar = await fetch(new URL('/api/chat-bilagor', egenOrigin).toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kropp),
  });
  if (!svar.ok) throw new Error(`lagringen svarade ${svar.status}`);
  return svar.json();
}

/** Raderar filer – efter att de skickats till kundservice, eller om de inte kunde tas emot. */
export async function raderaBilagor(bilagor: Bilaga[], egenOrigin: string): Promise<void> {
  if (!bilagor.length) return;
  if (LOKAL) {
    for (const b of bilagor) lokalaFiler.delete(lokaltId(b.url));
    return;
  }
  try {
    await lagring(egenOrigin, { handling: 'radera', urls: bilagor.map((b) => b.url) });
  } catch (fel) {
    console.error('chat-bilaga: kunde inte radera filerna:', fel);
  }
}
