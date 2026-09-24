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

import { giltigSignatur, instagramLage, arTestare, forstaGangen, taEmot, taEmotEko, fornyaToken, lokalUtkorg, type Inkommande } from './_instagram';
import { lika } from './_personal';

export const config = { runtime: 'edge' };

interface Handelse {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    is_deleted?: boolean;
    is_unsupported?: boolean;
    quick_reply?: { payload?: string };
    attachments?: { type?: string }[];
    reply_to?: { story?: unknown };
  };
  postback?: { mid?: string; title?: string; payload?: string };
}

const BILAGA: Record<string, string> = {
  image: 'en bild',
  video: 'en video',
  audio: 'ett röstmeddelande',
  file: 'en fil',
  share: 'ett delat inlägg',
  story_mention: 'en story där Stodona nämns',
  ig_reel: 'en reel',
  reel: 'en reel',
};

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
    // Lokalt: det som hade skickats till Instagram.
    if (process.env.STODONA_LOKAL === 'true' && url.searchParams.has('utkorg')) {
      return new Response(JSON.stringify(lokalUtkorg.splice(0)), { headers: { 'Content-Type': 'application/json' } });
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

  const lage = instagramLage();
  const origin = url.origin;
  const jobb: Promise<unknown>[] = [];

  for (const post of data.entry ?? []) {
    for (const h of post.messaging ?? []) {
      jobb.push(
        hantera(origin, lage, h).catch((fel) => console.error('instagram: händelsen kunde inte hanteras', fel))
      );
    }
  }

  // Svara Meta direkt; Camilla arbetar vidare i bakgrunden.
  const allt = Promise.all(jobb);
  if (context?.waitUntil) context.waitUntil(allt);
  else await allt; // lokalt (vite) finns ingen waitUntil
  return text(200, 'EVENT_RECEIVED');
}

async function hantera(origin: string, lage: 'av' | 'test' | 'pa', h: Handelse): Promise<void> {
  const m = h.message;
  const mid = m?.mid ?? h.postback?.mid;
  if (!mid || m?.is_deleted || m?.is_unsupported) return;

  // Stodonas eget konto har skickat något: Camilla själv, eller personalen.
  if (m?.is_echo) {
    const kund = h.recipient?.id;
    if (!kund || lage === 'av' || (lage === 'test' && !arTestare(kund))) return;
    if (!(await forstaGangen(mid))) return;
    await taEmotEko(origin, kund, mid, (m.text ?? '').slice(0, 1500));
    return;
  }

  const igsid = h.sender?.id;
  if (!igsid) return;
  if (lage === 'av') return;
  if (lage === 'test' && !arTestare(igsid)) {
    // Id:t syns i Vercels logg – så hittar man sitt eget för IG_TESTARE.
    console.log(`instagram: DM från ${igsid} – inte testare, Camilla svarar inte`);
    return;
  }
  if (!(await forstaGangen(mid))) return;

  const bilagor = (m?.attachments ?? []).map((a) => BILAGA[a.type ?? ''] ?? 'en bilaga');
  if (m?.reply_to?.story) bilagor.push('ett svar på en av Stodonas stories');
  const in_: Inkommande = {
    mid,
    text: (m?.text ?? h.postback?.title ?? '').slice(0, 1200),
    payload: m?.quick_reply?.payload ?? h.postback?.payload ?? null,
    bilagor,
  };
  if (!in_.text && !in_.payload && !in_.bilagor.length) return;
  await taEmot(origin, igsid, in_);
}
