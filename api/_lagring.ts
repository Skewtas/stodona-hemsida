// Liten nyckel–värde-lagring för självservicen i chatten.
//
// På Vercel går allt till KV (Upstash REST), eftersom en serverless-funktion
// inte har något minne mellan anropen. Lokalt (STODONA_LOKAL=true) hålls allt
// i minnet och produktionens KV rörs aldrig – samma princip som i api/chat.ts.

const LOKAL = process.env.STODONA_LOKAL === 'true';

function kvUppgifter() {
  if (LOKAL) return null;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** Finns det någon lagring som håller mellan anrop? Utan den ska självservicen inte gå att använda. */
export function lagringFinns(): boolean {
  return LOKAL || kvUppgifter() !== null;
}

async function kv(kommando: string[]): Promise<unknown> {
  const uppg = kvUppgifter();
  if (!uppg) throw new Error('KV saknas');
  const res = await fetch(uppg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${uppg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kommando),
  });
  if (!res.ok) throw new Error(`KV svarade ${res.status}`);
  return (await res.json()).result;
}

// ─── Minne (lokalt) ──────────────────────────────────────────────────────────

const minne = new Map<string, { varde: string; gar_ut: number | null }>();
const minneslistor = new Map<string, string[]>();

function minnesHamta(nyckel: string): string | null {
  const rad = minne.get(nyckel);
  if (!rad) return null;
  if (rad.gar_ut !== null && Date.now() > rad.gar_ut) {
    minne.delete(nyckel);
    return null;
  }
  return rad.varde;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function hamta<T>(nyckel: string): Promise<T | null> {
  const rad = LOKAL ? minnesHamta(nyckel) : await kv(['GET', nyckel]);
  if (typeof rad !== 'string') return null;
  try {
    return JSON.parse(rad) as T;
  } catch {
    return null;
  }
}

export async function spara(nyckel: string, varde: unknown, ttlSekunder: number): Promise<void> {
  const text = JSON.stringify(varde);
  if (LOKAL) {
    minne.set(nyckel, { varde: text, gar_ut: Date.now() + ttlSekunder * 1000 });
    return;
  }
  await kv(['SET', nyckel, text, 'EX', String(ttlSekunder)]);
}

export async function taBort(nyckel: string): Promise<void> {
  if (LOKAL) {
    minne.delete(nyckel);
    return;
  }
  await kv(['DEL', nyckel]);
}

/**
 * Ett kortlivat lås. Returnerar true om låset togs. Används så att två
 * samtidiga klick på "Bekräfta" aldrig kan ändra samma bokning två gånger.
 */
export async function lasa(nyckel: string, ttlSekunder: number): Promise<boolean> {
  if (LOKAL) {
    if (minnesHamta(nyckel) !== null) return false;
    minne.set(nyckel, { varde: '1', gar_ut: Date.now() + ttlSekunder * 1000 });
    return true;
  }
  return (await kv(['SET', nyckel, '1', 'NX', 'EX', String(ttlSekunder)])) === 'OK';
}

/** Lägger en post först i en lista som aldrig går ut av sig själv (loggen). */
export async function laggTillILista(nyckel: string, post: unknown, maxAntal: number): Promise<void> {
  const text = JSON.stringify(post);
  if (LOKAL) {
    const lista = minneslistor.get(nyckel) ?? [];
    lista.unshift(text);
    minneslistor.set(nyckel, lista.slice(0, maxAntal));
    return;
  }
  await kv(['LPUSH', nyckel, text]);
  await kv(['LTRIM', nyckel, '0', String(maxAntal - 1)]);
}

export async function lasLista<T>(nyckel: string, antal: number): Promise<T[]> {
  const rader = LOKAL ? (minneslistor.get(nyckel) ?? []).slice(0, antal) : await kv(['LRANGE', nyckel, '0', String(antal - 1)]);
  if (!Array.isArray(rader)) return [];
  return rader.flatMap((r) => {
    try {
      return [JSON.parse(String(r)) as T];
    } catch {
      return [];
    }
  });
}
