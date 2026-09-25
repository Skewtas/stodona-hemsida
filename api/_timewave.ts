// Minimal TimeWave-klient för självservicen i chatten.
//
// Bygger på samma inloggning som bokningsmodulen (stodona-bokningsmodul,
// api/_timewave.ts): OAuth client credentials och en ny token vid 401/403.
// OBS: TimeWave gör den förra token ogiltig när en ny hämtas. Delar chatten
// nyckel med Bokis kan de knuffa ut varandra – båda förnyar då och försöker
// igen, så ingen bokning går förlorad, men chatten ska få en egen API-klient
// innan den används skarpt.
//
// Skrivning: bara twFlyttaTillfalle nedan – den enda ändring
// självservicen gör. Beteendet är testat live 2026-09-24 (se funktionen).

const BAS = process.env.TIMEWAVE_BASE_URL || 'https://api.timewave.se/v3';
const TIMEOUT_MS = 8000;

let token: string | null = null;
let tokenRequest: Promise<string> | null = null;

export function timewaveKonfigurerad(): boolean {
  return Boolean(process.env.TIMEWAVE_CLIENT_ID && process.env.TIMEWAVE_API_KEY);
}

async function hamtaToken(): Promise<string> {
  if (token) return token;
  if (tokenRequest) return tokenRequest;
  // Parallel schedule reads must not invalidate each other's access tokens.
  tokenRequest = (async () => {
    const form = new FormData();
    form.append('client_id', process.env.TIMEWAVE_CLIENT_ID ?? '');
    form.append('client_secret', process.env.TIMEWAVE_API_KEY ?? '');
    form.append('grant_type', 'client_credentials');
    const svar = await fetch(`${BAS}/oauth/token`, { method: 'POST', body: form, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!svar.ok) throw new Error(`TimeWave-inloggningen misslyckades: ${svar.status}`);
    const data = (await svar.json()) as { access_token?: string };
    if (!data.access_token) throw new Error('TimeWave-inloggningen gav ingen token');
    token = data.access_token;
    return token;
  })();
  try { return await tokenRequest; } finally { tokenRequest = null; }
}

async function anropa(bearer: string, sokvag: string): Promise<Response> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BAS}${sokvag}`, {
      headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
      signal: ac.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** GET mot TimeWave. Förnyar token en gång vid 401/403 och försöker igen vid tillfälliga fel. */
export async function twGet<T = unknown>(sokvag: string): Promise<T> {
  let svar = await anropa(await hamtaToken(), sokvag);
  for (const paus of [0, 300, 800]) {
    if (svar.ok) break;
    if (svar.status !== 401 && svar.status !== 403 && svar.status !== 429 && svar.status < 500) break;
    if (paus) await new Promise((klar) => setTimeout(klar, paus));
    if (svar.status === 401 || svar.status === 403) token = null;
    svar = await anropa(await hamtaToken(), sokvag);
  }
  if (!svar.ok) throw new Error(`TimeWave GET ${sokvag.split('?')[0]} svarade ${svar.status}`);
  const data = (await svar.json()) as T & { errors?: unknown };
  if (data && typeof data === 'object' && 'errors' in data && data.errors) {
    throw new Error(`TimeWave GET ${sokvag.split('?')[0]} gav fel: ${JSON.stringify(data.errors).slice(0, 200)}`);
  }
  return data;
}

/** Alla sidor av en listning. */
export async function twGetAlla<T>(sokvag: string): Promise<T[]> {
  const sep = sokvag.includes('?') ? '&' : '?';
  const forsta = await twGet<{ data?: T[]; last_page?: number }>(`${sokvag}${sep}page=1`);
  const sidor = Number(forsta.last_page ?? 1);
  if (!Number.isInteger(sidor) || sidor < 1 || sidor > 20) throw new Error('TimeWave-listningen kan inte hämtas fullständigt');
  const resten = await Promise.all(
    Array.from({ length: Math.max(0, sidor - 1) }, (_, i) =>
      twGet<{ data?: T[] }>(`${sokvag}${sep}page=${i + 2}`).then((r) => r.data ?? [])
    )
  );
  return [...(forsta.data ?? []), ...resten.flat()];
}

/**
 * Flyttar ETT tillfälle (en bokningsrad) till nytt datum, ny tid och städare.
 *
 * Testat live 2026-09-24: POST /missions/deviations flyttar just den
 * bokningsraden; seriens övriga tillfällen (egna rader) är orörda.
 *
 * Skrivningen görs högst en gång. Efter 401/403 har TimeWave inte utfört
 * den, så då förnyas token och den görs igen. Timeout eller 5xx betyder att
 * vi inte vet om den gick igenom – det rapporteras som osäkert, aldrig som
 * lyckat och aldrig med ett nytt försök.
 */
export async function twFlyttaTillfalle(indata: {
  bokningsrad: number;
  datum: string;
  start: string;
  slut: string;
  /**
   * Den anställda som står på bokningsraden NU. En avvikelse byter aldrig
   * städare (live 2026-09-25, varken via employee_id eller employee) – det
   * görs med twBytAnstalld efteråt.
   */
  anstalldId: number;
  kommentar: string;
}): Promise<{ ok: true } | { ok: false; fel: string; osaker: boolean }> {
  const kropp = JSON.stringify({
    bookingline_id: indata.bokningsrad,
    startdate: indata.datum,
    starttime: indata.start,
    endtime: indata.slut,
    employee_id: indata.anstalldId,
    comment: indata.kommentar.slice(0, 200),
  });
  const skicka = async (bearer: string) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      return await fetch(`${BAS}/missions/deviations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: kropp,
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };
  let svar: Response;
  try {
    svar = await skicka(await hamtaToken());
    if (svar.status === 401 || svar.status === 403) {
      token = null;
      svar = await skicka(await hamtaToken());
    }
  } catch (fel) {
    return { ok: false, fel: `Inget svar från TimeWave (${String(fel).slice(0, 100)})`, osaker: true };
  }
  const text = await svar.text().catch(() => '');
  if (svar.status >= 500) return { ok: false, fel: `TimeWave svarade ${svar.status}: ${text.slice(0, 200)}`, osaker: true };
  if (!svar.ok) return { ok: false, fel: `TimeWave svarade ${svar.status}: ${text.slice(0, 200)}`, osaker: false };
  try {
    const data = JSON.parse(text) as { data?: unknown; errors?: unknown };
    if (data.errors || data.data !== true) return { ok: false, fel: `TimeWave svarade: ${text.slice(0, 200)}`, osaker: true };
  } catch {
    return { ok: false, fel: `Oväntat svar från TimeWave: ${text.slice(0, 200)}`, osaker: true };
  }
  return { ok: true };
}

/**
 * Byter städare på ETT tillfälle: PUT /missions/bookinglines/{id} med samma
 * datum och tid och den nya anställda i "employee". Verifierat live
 * 2026-09-25 (kund 17713, rad 870628: Dzenita → Elisabet, tiden oförändrad).
 * Aldrig nytt försök efter timeout – återläsningen avgör.
 */
export async function twBytAnstalld(indata: { bokningsrad: number; datum: string; start: string; slut: string; nyAnstalldId: number }): Promise<{ ok: true } | { ok: false; fel: string; osaker: boolean }> {
  try {
    const svar = await fetch(`${BAS}/missions/bookinglines/${indata.bokningsrad}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${await hamtaToken()}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ startdate: indata.datum, starttime: indata.start, endtime: indata.slut, employee: indata.nyAnstalldId }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await svar.text().catch(() => '');
    if (!svar.ok) return { ok: false, fel: `TimeWave svarade ${svar.status} vid byte av städare: ${text.slice(0, 200)}`, osaker: svar.status >= 500 };
    return { ok: true };
  } catch (fel) {
    return { ok: false, fel: `Inget säkert svar vid byte av städare (${String(fel).slice(0, 100)})`, osaker: true };
  }
}

/**
 * Skapar en anteckning i TimeWave, t.ex. en ekonomianteckning om en avgift.
 * Typer enligt API:et: MISSION, IMPORTANT, OTHER, INVOICE, ECONOMY, ADMIN,
 * ORDER, OFFER, CRM. Skrivs som systemanvändaren TIMEWAVE_NOTE_EMPLOYEE_ID
 * (samma som bokningsmodulen). Görs högst en gång – inget nytt försök efter
 * timeout, så att det aldrig blir dubbla anteckningar.
 */
export async function twSkapaAnteckning(indata: {
  resurs: 'clients' | 'workorders' | 'workorderlines';
  resursId: number;
  typ: 'ECONOMY' | 'ADMIN' | 'IMPORTANT';
  rubrik: string;
  text: string;
  viktig?: boolean;
}): Promise<{ ok: true } | { ok: false; fel: string }> {
  const skapare = Number(process.env.TIMEWAVE_NOTE_EMPLOYEE_ID);
  if (!skapare) return { ok: false, fel: 'TIMEWAVE_NOTE_EMPLOYEE_ID saknas' };
  const kropp = JSON.stringify({
    resource_name: indata.resurs,
    resource_id: indata.resursId,
    employee_id: skapare,
    type: indata.typ,
    subject: indata.rubrik.slice(0, 128),
    content: indata.text,
    important: Boolean(indata.viktig),
    public: false,
    closed: false,
  });
  const skicka = async (bearer: string) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      return await fetch(`${BAS}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: kropp,
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let svar = await skicka(await hamtaToken());
    if (svar.status === 401 || svar.status === 403) {
      token = null;
      svar = await skicka(await hamtaToken());
    }
    const text = await svar.text().catch(() => '');
    if (!svar.ok || /"errors"/.test(text)) return { ok: false, fel: `TimeWave svarade ${svar.status}: ${text.slice(0, 200)}` };
    return { ok: true };
  } catch (fel) {
    return { ok: false, fel: `Inget svar från TimeWave (${String(fel).slice(0, 100)})` };
  }
}

// ─── Typer (bara fälten vi använder) ─────────────────────────────────────────

/** Documented at https://developer.timewave.se/missions/. Never retry a cancellation. */
export async function twAvbokaTillfalle(bokningsrad: number): Promise<{ ok: true } | { ok: false; fel: string; osaker: boolean }> {
  try {
    const response = await fetch(`${BAS}/missions/bookinglines/cancel/${bokningsrad}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${await hamtaToken()}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, fel: `TimeWave svarade ${response.status}`, osaker: response.status >= 500 };
    // Readback by the shared action service is required even after HTTP success.
    return { ok: true };
  } catch { return { ok: false, fel: 'Inget säkert svar på avbokningen från TimeWave.', osaker: true }; }
}

export interface TwKlient {
  id: number;
  number: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  deleted?: boolean;
  status?: string;
  addresses?: { city?: string; deleted?: boolean }[];
}

export interface TwMissionAnstalld {
  id: number;
  name: string;
  bookingline_id: number;
  startdate: string;
  starttime: string;
  endtime: string;
  cancelled: boolean;
  /** Tom lista utan avvikelse; ett objekt (ibland en lista) när nästa tillfälle är flyttat. */
  deviations: TwAvvikelse | TwAvvikelse[] | null;
}

export interface TwAvvikelse {
  id: number;
  employee_id: number;
  /** "ÅÅÅÅ-MM-DD HH:MM:SS" – tillfället som flyttades. */
  origin_start: string;
  origin_end: string;
  new_start: string;
  new_end: string;
  comment?: string;
}

export interface TwMission {
  id: number;
  type: string;
  recurrencyinterval_id: number | null;
  client?: { id: number; number: string; name?: string; address?: string; postal_code?: string; city?: string; workarea_name?: string | null };
  services?: { id: number; name: string; quantity?: number; price?: number; unit?: string }[];
  employees?: TwMissionAnstalld[];
}

export interface TwArbetsorderrad {
  id: number;
  deleted?: boolean;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  recurrencyinterval_id?: number | null;
  employees?: { id: number }[];
}

export interface TwAnstalld {
  id: number;
  first_name?: string;
  last_name?: string;
  availability?: { days?: Record<string, boolean>; starttime?: string; endtime?: string; weeks?: string }[];
}
