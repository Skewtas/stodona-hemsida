// Uppföljning av chattens leads (api/_leads.ts).
//
//   GET  med Authorization: Bearer <CRON_SECRET>   → kör förfallna uppföljningar
//        (Vercel Cron, varje timme – se vercel.json)
//   GET  ?avsluta=<kod>                            → avregistrering från länken i SMS:et
//        (stodona.se/sms-stopp/<kod> skrivs om hit)
//   GET  ?lista=1  med Authorization: Bearer <LEADS_ADMIN_PASSWORD> → leadlistan
//   POST { id, atgard: "pausa" | "ateruppta" | "stoppa" } med samma lösenord
//
// Utskicken är AV tills LEAD_UPPFOLJNING=pa är satt. I läget "test" körs allt
// utom själva SMS:et, som i stället skrivs i loggen.

import { avregistrera, korUppfoljningar, listaLeads, sattPaus, sattStatus } from './_leads';
import { arKund, skickaSms } from './_smskod';
import { lika } from './_personal';
import { timewaveKonfigurerad } from './_timewave';

export const config = { runtime: 'edge' };

const LAGE = process.env.LEAD_UPPFOLJNING === 'pa' ? 'pa' : process.env.LEAD_UPPFOLJNING === 'test' ? 'test' : 'av';
const BAS = 'https://www.stodona.se';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function bearer(request: Request): string {
  const auth = request.headers.get('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

function admin(request: Request): boolean {
  const pw = process.env.LEADS_ADMIN_PASSWORD;
  return Boolean(pw) && lika(bearer(request), pw as string);
}

function sida(rubrik: string, text: string): Response {
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Stodona</title>
<style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f6f3ee;color:#1f1f1f;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}main{background:#fff;border-radius:20px;padding:28px;max-width:360px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{font-size:15px;line-height:1.5;color:#555;margin:0}</style></head>
<body><main><h1>${rubrik}</h1><p>${text}</p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.searchParams.has('avsluta')) {
    const ok = await avregistrera(String(url.searchParams.get('avsluta')).toLowerCase());
    return ok
      ? sida('Klart', 'Du får inga fler sms från oss om det här. Vill du ha hjälp framöver finns vi i chatten på stodona.se.')
      : sida('Länken gäller inte längre', 'Du får inga fler sms om den här förfrågan.');
  }

  if (request.method === 'GET' && url.searchParams.has('lista')) {
    if (!process.env.LEADS_ADMIN_PASSWORD) return json({ error: 'LEADS_ADMIN_PASSWORD saknas i miljön' }, 503);
    if (!admin(request)) return json({ error: 'Unauthorized' }, 401);
    return json({ lage: LAGE, leads: await listaLeads(300) });
  }

  if (request.method === 'POST') {
    if (!admin(request)) return json({ error: 'Unauthorized' }, 401);
    const body = (await request.json().catch(() => ({}))) as { id?: unknown; atgard?: unknown };
    const id = typeof body.id === 'string' && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : '';
    if (!id) return json({ error: 'Saknar id.' }, 400);
    const lead =
      body.atgard === 'pausa'
        ? await sattPaus(id, true, 'personalen')
        : body.atgard === 'ateruppta'
          ? await sattPaus(id, false, 'personalen')
          : body.atgard === 'stoppa'
            ? await sattStatus(id, 'nej', 'stoppad av personalen')
            : null;
    return lead ? json({ lead }) : json({ error: 'Okänd åtgärd eller okänt lead.' }, 400);
  }

  if (request.method === 'GET') {
    const secret = process.env.CRON_SECRET;
    if (!secret || !lika(bearer(request), secret)) return json({ error: 'Unauthorized' }, 401);
    if (LAGE === 'av') return json({ lage: LAGE, info: 'Uppföljningen är avstängd (LEAD_UPPFOLJNING).' });
    const resultat = await korUppfoljningar({
      bas: BAS,
      skicka: async (mobil, text) => {
        if (LAGE === 'test') {
          console.log(`[lead-uppföljning TEST] SMS till …${mobil.slice(-3)} skickas inte:\n${text}`);
          return { ok: true };
        }
        return skickaSms(mobil, text, BAS);
      },
      // Utan TimeWave går det inte att veta om leadet har bokat – skicka då hellre inget.
      arKund: async (mobil) => {
        if (!timewaveKonfigurerad()) throw new Error('TimeWave saknas');
        return arKund(mobil);
      },
    });
    console.log(`[lead-uppföljning] ${JSON.stringify({ lage: LAGE, ...resultat })}`);
    return json({ lage: LAGE, ...resultat });
  }

  return json({ error: 'Method not allowed' }, 405);
}
