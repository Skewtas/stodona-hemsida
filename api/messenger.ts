// Vercel Edge Function: webhooken för Facebook Messenger (Stodonas Facebook-sida).
//
//   GET  ?hub.mode=subscribe&hub.verify_token=…&hub.challenge=…  → Metas verifiering
//   POST från Meta, signerad med appens hemlighet                 → meddelande till Camilla
//
// Samma Camilla och samma adapter som Instagram (api/_instagram.ts) – det enda
// som skiljer är adressen, sidans token och hemligheten. Meta vill ha 200 inom
// några sekunder, så webhooken svarar direkt och gör jobbet efteråt.
//
// Miljövariabler: MESSENGER_CHAT (av/test/pa), FB_TESTARE, FB_APP_SECRET,
// FB_VERIFY_TOKEN, FB_PAGE_TOKEN, KANAL_INTERN_NYCKEL (+ samma som chatten).

import { giltigSignatur, hanteraHandelse, type Handelse } from './_instagram';
import { lika } from './_personal';

export const config = { runtime: 'edge' };

const text = (status: number, kropp = '') => new Response(kropp, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

export default async function handler(request: Request, context?: { waitUntil?: (p: Promise<unknown>) => void }) {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    if (url.searchParams.get('hub.mode') === 'subscribe') {
      const vantat = process.env.FB_VERIFY_TOKEN ?? '';
      const givet = url.searchParams.get('hub.verify_token') ?? '';
      return vantat && lika(givet, vantat) ? text(200, url.searchParams.get('hub.challenge') ?? '') : text(403, 'Fel verifieringstoken');
    }
    return text(404);
  }

  if (request.method !== 'POST') return text(405);

  const radKropp = await request.text();
  if (!(await giltigSignatur(radKropp, request.headers.get('x-hub-signature-256'), 'messenger'))) {
    console.warn('messenger: ogiltig eller saknad signatur');
    return text(401);
  }

  let data: { object?: string; entry?: { id?: string; messaging?: Handelse[] }[] };
  try {
    data = JSON.parse(radKropp);
  } catch {
    return text(400);
  }
  if (data.object !== 'page') return text(200, 'EVENT_RECEIVED');

  const origin = url.origin;
  const jobb: Promise<unknown>[] = [];
  for (const post of data.entry ?? []) {
    for (const h of post.messaging ?? []) {
      jobb.push(hanteraHandelse(origin, 'messenger', h).catch((fel) => console.error('messenger: händelsen kunde inte hanteras', fel)));
    }
  }

  // Svara Meta direkt; Camilla arbetar vidare i bakgrunden.
  const allt = Promise.all(jobb);
  if (context?.waitUntil) context.waitUntil(allt);
  else await allt; // lokalt (vite) finns ingen waitUntil
  return text(200, 'EVENT_RECEIVED');
}
