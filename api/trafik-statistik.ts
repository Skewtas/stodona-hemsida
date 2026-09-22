// Besök på stodona.se, räknade av oss själva (middleware.ts).
//
// Varför: Google Analytics räknar bara besökare som klickat "Acceptera" i
// cookierutan, och blockeras dessutom av många webbläsare. Den här siffran
// räknas på servern, utan cookies och utan personuppgifter – bara antal
// sidvisningar per dag och per sida. Den går alltså att lita på när frågan är
// "har det blivit färre besökare?".
//
// GET /api/trafik-statistik?dagar=30   → summa per dag
// GET /api/trafik-statistik?dag=ÅÅÅÅ-MM-DD → en dag med de mest besökta sidorna
//
// Kräver Authorization: Bearer <CHAT_STATS_SECRET>. Head of hämtar hit varje
// natt. Svaret innehåller inga personuppgifter.

export const config = { runtime: 'edge' };

const MAX_DAGAR = 90;
const MAX_SIDOR = 25;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

function dagSthlm(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

/** Jämför hemligheter tecken för tecken, utan att avslöja var de skiljer sig. */
function likaHemligheter(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let skillnad = 0;
  for (let i = 0; i < a.length; i++) skillnad |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return skillnad === 0;
}

async function kv(kommandon: string[][]): Promise<unknown[]> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return [];
  const svar = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kommandon),
  });
  if (!svar.ok) throw new Error(`KV svarade ${svar.status}`);
  const rader = (await svar.json()) as { result?: unknown }[];
  return rader.map((r) => r.result);
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const hemlighet = process.env.CHAT_STATS_SECRET;
  if (!hemlighet) return json({ error: 'CHAT_STATS_SECRET saknas i miljön' }, 503);
  const angiven = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!likaHemligheter(angiven, hemlighet)) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const enDag = url.searchParams.get('dag');
  const dagar: string[] = [];

  if (enDag && /^\d{4}-\d{2}-\d{2}$/.test(enDag)) {
    dagar.push(enDag);
  } else {
    const antal = Math.min(MAX_DAGAR, Math.max(1, Number(url.searchParams.get('dagar') ?? 30)));
    for (let i = antal - 1; i >= 0; i--) dagar.push(dagSthlm(new Date(Date.now() - i * 86400000)));
  }

  try {
    const summor = (await kv(dagar.map((d) => ['GET', `trafik:${d}`]))).map((v) => Number(v ?? 0));
    // Sidfördelningen hämtas bara för enstaka dagar – annars blir svaret onödigt stort.
    let sidor: Record<string, number> = {};
    if (dagar.length <= 3) {
      const hashar = await kv(dagar.map((d) => ['HGETALL', `trafik:sidor:${d}`]));
      for (const rad of hashar) {
        const par = Array.isArray(rad) ? rad : Object.entries(rad ?? {}).flat();
        for (let i = 0; i < par.length; i += 2) {
          const sida = String(par[i]);
          sidor[sida] = (sidor[sida] ?? 0) + Number(par[i + 1] ?? 0);
        }
      }
      sidor = Object.fromEntries(
        Object.entries(sidor).sort((a, b) => b[1] - a[1]).slice(0, MAX_SIDOR)
      );
    }

    return json({
      dagar: dagar.map((dag, i) => ({ dag, besok: summor[i] })),
      totalt: summor.reduce((a, b) => a + b, 0),
      sidor,
      matning: 'egen serverräkning, utan cookies',
    });
  } catch (fel) {
    console.error('trafik-statistik:', fel);
    return json({ error: 'Kunde inte läsa besöksstatistiken.' }, 502);
  }
}
