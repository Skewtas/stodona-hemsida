// Vercel Edge Function: inkorgen för samtal i andra kanaler än webbchatten.
//
// Underlaget för en gemensam kundservicevy (t.ex. i Head of): kanal, kund,
// status, senaste meddelande, om AI eller människa har samtalet, om det
// kräver åtgärd – och händelseloggen för felsökning.
//
//   GET                         → { samtal: [...] }  de senaste 50
//   GET  ?id=<samtalsId>        → { samtal, logg }    ett samtal med loggen
//   POST { samtalsId, handling: "ta-over" }  → Camilla tystnar i samtalet (24 h)
//   POST { samtalsId, handling: "slapp" }    → Camilla svarar igen
//
// Behörighet: Authorization: Bearer CHAT_STATS_SECRET (Head of), eller
// inloggad personal (samma inloggning som stodona.se/personalchatt).

import { personalNamn, lika } from './_personal';
import { inkorg, hamtaInfo, hamtaLogg, taOver, slappTillAi, aiFarSvara, kanalNamn, type Samtalsinfo } from './_kanaler';

export const config = { runtime: 'edge' };

const svar = (status: number, kropp: unknown) =>
  new Response(JSON.stringify(kropp), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

async function vem(request: Request): Promise<string | null> {
  const hemlighet = process.env.CHAT_STATS_SECRET ?? '';
  const auth = request.headers.get('authorization') ?? '';
  if (hemlighet && auth.startsWith('Bearer ') && lika(auth.slice(7), hemlighet)) return 'Head of';
  return personalNamn(request);
}

/** Det inkorgen visar. Kanalens interna id följer inte med. */
function rad(i: Samtalsinfo) {
  return {
    samtalsId: i.samtalsId,
    kanal: i.kanal,
    kanalNamn: kanalNamn(i.kanal),
    kontakt: i.visningsnamn,
    kund: i.kund,
    hanteras: aiFarSvara(i) ? 'ai' : 'manuell',
    pausadTill: aiFarSvara(i) ? null : new Date(i.pausadTill).toISOString(),
    orsak: i.orsak,
    kraverAtgard: i.kraverAtgard,
    vantandeOmbokning: i.vantandeForslag,
    senaste: i.senaste && { ...i.senaste, tid: new Date(i.senaste.tid).toISOString() },
    skapad: new Date(i.skapad).toISOString(),
  };
}

export default async function handler(request: Request) {
  const person = await vem(request);
  if (!person) return svar(401, { error: 'Obehörig' });

  if (request.method === 'GET') {
    const id = new URL(request.url).searchParams.get('id');
    if (id) {
      const info = await hamtaInfo(id);
      if (!info) return svar(404, { error: 'Samtalet finns inte (eller har gått ut).' });
      return svar(200, { samtal: rad(info), logg: await hamtaLogg(id) });
    }
    return svar(200, { samtal: (await inkorg(50)).map(rad) });
  }

  if (request.method !== 'POST') return svar(405, { error: 'Method not allowed' });
  let body: { samtalsId?: unknown; handling?: unknown };
  try {
    body = await request.json();
  } catch {
    return svar(400, { error: 'Ogiltig JSON' });
  }
  const id = typeof body.samtalsId === 'string' ? body.samtalsId : '';
  if (!id || !(await hamtaInfo(id))) return svar(404, { error: 'Samtalet finns inte.' });

  if (body.handling === 'ta-over') await taOver(id, `${person} tog över samtalet`, 24);
  else if (body.handling === 'slapp') await slappTillAi(id, person);
  else return svar(400, { error: 'Okänd handling.' });
  return svar(200, { samtal: rad((await hamtaInfo(id))!) });
}
