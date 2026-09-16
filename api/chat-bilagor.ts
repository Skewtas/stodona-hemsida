// Lagringstjänst för chattens bilagor, bara för våra egna serverdelar.
//
// Kör i Node-miljön, eftersom Vercel Blobs paket kräver det. Chatten kör i
// edge-miljön och frågar hit i stället för att prata med lagringen själv.
//
//   POST { handling: "granska", urls: [...] }  → hur stor varje fil är
//   POST { handling: "radera",  urls: [...] }  → raderar filerna
//   GET                                        → nattens rensning (Vercel cron)
//
// Kräver Authorization: Bearer <CRON_SECRET>. Vercel skickar den automatiskt
// till cron-jobbet. Bara filer i chattens egen mapp i vår Blob-butik godtas,
// så nyckeln kan aldrig användas för att radera något annat.

// Node kräver filändelsen i importen, till skillnad från edge-funktionerna.
import { blobStorlek, blobRadera, blobRensa } from './_blobLagring.js';
import { blobVard, MAX_TIMMAR } from './_chatBilagor.js';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function auktoriserad(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
}

/** Bara adresser till chattens mapp i vår egen Blob-butik. */
function egnaUrler(urls: unknown): string[] {
  const vard = blobVard();
  if (!vard || !Array.isArray(urls)) return [];
  return urls
    .filter((u): u is string => typeof u === 'string')
    .filter((u) => {
      try {
        const x = new URL(u);
        return x.protocol === 'https:' && x.host === vard && x.pathname.startsWith('/chatt/');
      } catch {
        return false;
      }
    })
    .slice(0, 20);
}

async function handler(request: Request): Promise<Response> {
  if (!auktoriserad(request)) return json({ error: 'Unauthorized' }, 401);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: 'Lagringen är inte aktiverad.' }, 503);

  if (request.method === 'GET') return json({ ok: true, raderade: await blobRensa(MAX_TIMMAR) });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let kropp: { handling?: unknown; urls?: unknown };
  try {
    kropp = await request.json();
  } catch {
    return json({ error: 'Ogiltig JSON' }, 400);
  }
  const urler = egnaUrler(kropp.urls);

  if (kropp.handling === 'granska') {
    const storlekar: Record<string, number> = {};
    for (const url of urler) {
      const storlek = await blobStorlek(url);
      if (storlek !== null) storlekar[url] = storlek;
    }
    return json({ storlekar });
  }

  if (kropp.handling === 'radera') {
    try {
      await blobRadera(urler);
    } catch (fel) {
      console.error('chat-bilagor: kunde inte radera:', fel);
      return json({ error: 'Kunde inte radera filerna.' }, 502);
    }
    return json({ ok: true, raderade: urler.length });
  }

  return json({ error: 'Okänd handling' }, 400);
}

// Web-signaturen gör funktionen till en Node-funktion hos Vercel.
export default { fetch: handler };
