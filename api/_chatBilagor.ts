// Bilagor i chatten – bilder och videor som kunden skickar, till exempel när
// något inte blev bra vid en städning.
//
// Filen börjar med understreck, så Vercel gör den inte till en egen endpoint.
// Den används av api/chat.ts, api/chat-bilaga.ts och api/chat-bilagor-rensa.ts.
//
// SÄKERHET OCH INTEGRITET
//  * Bara bilder (JPEG, PNG, WebP, HEIC) och videor (MP4, MOV, WebM). Aldrig
//    SVG, HTML, PDF eller annat som kan innehålla kod.
//  * Bilder förminskas i webbläsaren innan de skickas. Det tar också bort
//    platsdata (EXIF/GPS) från mobilbilder.
//  * Varje fil hamnar i en mapp som är en hash av samtals-id:t. Chatten tar
//    bara emot bilagor från det egna samtalets mapp, så ingen kan skicka in
//    någon annans filer eller länkar till främmande sajter.
//  * I produktion ligger filerna i Vercel Blob med slumpade, ogissbara namn och
//    raderas efter 90 dagar. Testmiljön sparar i minnet och rör aldrig Blob.

export const MAX_BILAGOR_PER_MEDDELANDE = 5;
export const MAX_BILAGOR_PER_SAMTAL = 10;
export const MAX_BILD_BYTE = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTE = 100 * 1024 * 1024;
export const LAGRINGSDAGAR = 90;

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
}

const lokalaFiler = new Map<string, LokalFil>();

export function sparaLokalt(fil: LokalFil): string {
  const id = crypto.randomUUID();
  lokalaFiler.set(id, fil);
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
  let id = '';
  try {
    const u = new URL(url);
    if (u.pathname !== '/api/chat-bilaga') return null;
    id = u.searchParams.get('id') ?? '';
  } catch {
    return null;
  }
  const fil = lokalaFiler.get(id);
  if (!fil || !(SYNLIGA_BILDTYPER as readonly string[]).includes(fil.mime)) return null;
  let binar = '';
  for (let i = 0; i < fil.bytes.length; i += 0x8000) binar += String.fromCharCode(...fil.bytes.subarray(i, i + 0x8000));
  return { mime: fil.mime as (typeof SYNLIGA_BILDTYPER)[number], base64: btoa(binar) };
}

// ─── Tak ─────────────────────────────────────────────────────────────────────

/** Räknar upp en nyckel i KV och svarar om taket är passerat. Släpper igenom om KV inte svarar. */
export async function overUppladdningstaket(nyckel: string, tak: number, ttlSekunder: number): Promise<boolean> {
  if (LOKAL) return false;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;
  const kor = async (kommando: string[]) => {
    const svar = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(kommando),
    });
    if (!svar.ok) throw new Error(`KV svarade ${svar.status}`);
    return (await svar.json()).result;
  };
  try {
    const antal = Number(await kor(['INCR', nyckel]));
    if (antal === 1) await kor(['EXPIRE', nyckel, String(ttlSekunder)]);
    return antal > tak;
  } catch (fel) {
    console.error('chat-bilaga: kunde inte räkna taket:', fel);
    return false;
  }
}

// ─── Tolkning ────────────────────────────────────────────────────────────────

/**
 * Tolkar bilagorna som webbläsaren skickar med ett meddelande. Allt som inte
 * ligger i samtalets egen mapp kastas tyst.
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
      ut.push({ url: `${egenOrigin}/api/chat-bilaga?id=${id}`, typ, mime: fil.mime, namn: fil.namn });
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
    ut.push({ url: `https://${vard}${u.pathname}`, typ, mime, namn: namn.slice(0, 80) });
  }

  return ut.filter((b, i, alla) => alla.findIndex((x) => x.url === b.url) === i);
}
