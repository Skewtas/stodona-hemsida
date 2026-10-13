// Vercel Edge Function: webhooken för Instagram-DM.
//
//   GET  ?hub.mode=subscribe&hub.verify_token=…&hub.challenge=…  → Metas verifiering
//   GET  med Authorization: Bearer CRON_SECRET                    → förnyar Instagram-token (cron)
//   POST från Meta, signerad med appens hemlighet                 → DM till Camilla
//
// Meta vill ha 200 inom några sekunder, men Camilla kan behöva längre tid
// (verktyg, TimeWave). Därför svarar webhooken direkt och gör jobbet efteråt
// med waitUntil. Allt om hur DM:en besvaras finns i api/_instagram.ts.
//
// Miljövariabler: INSTAGRAM_CHAT (av/test/pa), IG_TESTARE, IG_APP_SECRET,
// IG_VERIFY_TOKEN, IG_ACCESS_TOKEN, KANAL_INTERN_NYCKEL (+ samma som chatten).

import { giltigSignatur, hanteraHandelse, fornyaToken, diagnos, lokalUtkorg, type Handelse } from './_instagram';
import { lika } from './_personal';

export const config = { runtime: 'edge' };

const text = (status: number, kropp = '') => new Response(kropp, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

export default async function handler(request: Request, context?: { waitUntil?: (p: Promise<unknown>) => void }) {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    // Metas verifiering när webhooken läggs in i appen.
    if (url.searchParams.get('hub.mode') === 'subscribe') {
      const vantat = process.env.IG_VERIFY_TOKEN ?? '';
      const givet = url.searchParams.get('hub.verify_token') ?? '';
      return vantat && lika(givet, vantat) ? text(200, url.searchParams.get('hub.challenge') ?? '') : text(403, 'Fel verifieringstoken');
    }
    // Cron: förnya den långlivade token innan den går ut (60 dagar).
    const cron = process.env.CRON_SECRET ?? '';
    if (cron && lika(request.headers.get('authorization') ?? '', `Bearer ${cron}`)) {
      const r = await fornyaToken();
      console.log(`instagram: token ${r.ok ? 'förnyad' : 'INTE förnyad'} – ${r.detaljer}`);
      return new Response(JSON.stringify(r), { status: r.ok ? 200 : 502, headers: { 'Content-Type': 'application/json' } });
    }
    // Felsökning av kopplingen till Meta (båda kanalerna). Kräver adminlösenordet.
    if (url.searchParams.has('diagnos')) {
      const pw = process.env.LEADS_ADMIN_PASSWORD ?? '';
      if (!pw || !lika(request.headers.get('authorization') ?? '', `Bearer ${pw}`)) return text(401);
      return new Response(JSON.stringify(await diagnos(url.searchParams.get('prenumerera') === 'ja'), null, 2), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }
    // Lokalt: det som hade skickats till Instagram.
    if (process.env.STODONA_LOKAL === 'true' && url.searchParams.has('utkorg')) {
      // ?utkorg=<id> tar bara den mottagarens meddelanden, så att två tester kan köra samtidigt.
      const till = url.searchParams.get('utkorg');
      const mina = till && till !== '1' ? lokalUtkorg.filter((u) => u.till === till) : lokalUtkorg.slice();
      for (const u of mina) lokalUtkorg.splice(lokalUtkorg.indexOf(u), 1);
      return new Response(JSON.stringify(mina), { headers: { 'Content-Type': 'application/json' } });
    }
    return text(404);
  }

  if (request.method !== 'POST') return text(405);

  const radKropp = await request.text();
  if (!(await giltigSignatur(radKropp, request.headers.get('x-hub-signature-256')))) {
    console.warn('instagram: ogiltig eller saknad signatur');
    return text(401);
  }

  let data: { object?: string; entry?: { id?: string; messaging?: Handelse[] }[] };
  try {
    data = JSON.parse(radKropp);
  } catch {
    return text(400);
  }
  if (data.object !== 'instagram') return text(200, 'EVENT_RECEIVED');

  const origin = url.origin;
  const jobb: Promise<unknown>[] = [];

  for (const post of data.entry ?? []) {
    for (const h of post.messaging ?? []) {
      jobb.push(
        hanteraHandelse(origin, 'instagram', h).catch((fel) => console.error('instagram: händelsen kunde inte hanteras', fel))
      );
    }
  }

  // Svara Meta direkt; Camilla arbetar vidare i bakgrunden.
  const allt = Promise.all(jobb);
  if (context?.waitUntil) context.waitUntil(allt);
  else await allt; // lokalt (vite) finns ingen waitUntil
  return text(200, 'EVENT_RECEIVED');
}
