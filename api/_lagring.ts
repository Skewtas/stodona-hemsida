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
  const data = await res.json();
  if (data.error) throw new Error('KV-kommandot misslyckades');
  return data.result;
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

/** Beständiga operationsjournaler får inte försvinna innan ett osäkert utfall är utrett. */
export async function sparaPermanent(nyckel: string, varde: unknown): Promise<void> {
  const text = JSON.stringify(varde);
  if (LOKAL) { minne.set(nyckel, { varde: text, gar_ut: null }); return; }
  await kv(['SET', nyckel, text]);
}

/** Lås utan automatisk utgång: en krasch kräver utredning, inte en ny skrivning. */
export async function taOperationslas(nyckel: string, agare: string): Promise<boolean> {
  if (LOKAL) {
    if (minnesHamta(nyckel) !== null) return false;
    minne.set(nyckel, { varde: agare, gar_ut: null });
    return true;
  }
  return await kv(['SET', nyckel, agare, 'NX']) === 'OK';
}

export async function slappOperationslas(nyckel: string, agare: string): Promise<void> {
  if (LOKAL) { if (minnesHamta(nyckel) === agare) minne.delete(nyckel); return; }
  await kv(['EVAL', "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end", '1', nyckel, agare]);
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

/**
 * Lägger en post först i en lista. Utan ttl går listan aldrig ut av sig själv
 * (självservicens logg); med ttl förnyas utgången vid varje ny post.
 */
export async function laggTillILista(nyckel: string, post: unknown, maxAntal: number, ttlSekunder?: number): Promise<void> {
  const text = JSON.stringify(post);
  if (LOKAL) {
    const lista = minneslistor.get(nyckel) ?? [];
    lista.unshift(text);
    minneslistor.set(nyckel, lista.slice(0, maxAntal));
    return;
  }
  await kv(['LPUSH', nyckel, text]);
  await kv(['LTRIM', nyckel, '0', String(maxAntal - 1)]);
  if (ttlSekunder) await kv(['EXPIRE', nyckel, String(ttlSekunder)]);
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

// ─── Sorterat index (inkorgen) ───────────────────────────────────────────────

const minnesindex = new Map<string, Map<string, number>>();

/** Sätter en medlems poäng i ett sorterat index, t.ex. senaste aktivitet per samtal. */
export async function indexera(nyckel: string, medlem: string, poang: number): Promise<void> {
  if (LOKAL) {
    const index = minnesindex.get(nyckel) ?? new Map<string, number>();
    index.set(medlem, poang);
    minnesindex.set(nyckel, index);
    return;
  }
  await kv(['ZADD', nyckel, String(poang), medlem]);
}

/** De senaste medlemmarna i indexet, högst poäng först. */
export async function senasteIIndex(nyckel: string, antal: number): Promise<string[]> {
  if (LOKAL) {
    return [...(minnesindex.get(nyckel) ?? new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, antal)
      .map(([m]) => m);
  }
  const rader = await kv(['ZREVRANGE', nyckel, '0', String(antal - 1)]);
  return Array.isArray(rader) ? rader.map(String) : [];
}

/** Rensar bort medlemmar med lägre poäng än gränsen (gamla samtal). */
export async function rensaIndex(nyckel: string, underPoang: number): Promise<void> {
  if (LOKAL) {
    const index = minnesindex.get(nyckel);
    index?.forEach((p, m) => p < underPoang && index.delete(m));
    return;
  }
  await kv(['ZREMRANGEBYSCORE', nyckel, '-inf', `(${underPoang}`]);
}

/** Tar ut den äldsta posten ur en lista som fylls med laggTillILista – atomiskt, så två arbetare aldrig får samma post. */
export async function plockaAldsta<T>(nyckel: string): Promise<T | null> {
  let rad: unknown;
  if (LOKAL) {
    const lista = minneslistor.get(nyckel) ?? [];
    rad = lista.pop() ?? null;
  } else {
    rad = await kv(['RPOP', nyckel]);
  }
  if (typeof rad !== 'string') return null;
  try {
    return JSON.parse(rad) as T;
  } catch {
    return null;
  }
}
