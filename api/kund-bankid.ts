// Legitimering med Mobilt BankID i chatten – SIMULERAD, endast i testmiljön.
//
// Endpointen svarar bara när CHAT_KUNDTJANST=true, vilket bara vite.config.ts
// sätter lokalt. I produktion finns den inte, och inget riktigt BankID är
// inkopplat. När en riktig leverantör väljs byts innehållet här ut, medan
// resten av flödet och säkerhetsreglerna kan vara kvar.
//
//   POST { samtalsId, handling: "starta", personnummer }  → { ordernummer }
//   POST { samtalsId, handling: "kolla",  ordernummer }   → { status } | { namn }
//   POST { samtalsId, handling: "avbryt", ordernummer }   → { ok: true }
//
// Personnumret skrivs i legitimeringsrutan, aldrig i chatten, och sparas
// aldrig i samtalet. Resultatet lagras på servern, kopplat till samtalets id.

import { KUNDTJANST_PA, startaSignering, kollaSignering, avbrytSignering, TESTPERSONNUMMER } from './_kundtjanst';

export const config = { runtime: 'edge' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });

/** Anropet ska komma från sajten själv. */
function franSajten(request: Request): boolean {
  const egen = new URL(request.url).host;
  for (const namn of ['origin', 'referer']) {
    const varde = request.headers.get(namn);
    if (!varde) continue;
    try {
      return new URL(varde).host === egen;
    } catch {
      return false;
    }
  }
  return false;
}

export default async function handler(request: Request) {
  if (!KUNDTJANST_PA) return json({ error: 'Legitimering är inte påslagen.' }, 503);
  if (request.method === 'GET') {
    // Testlägets hjälplista: vilka testpersonnummer som fungerar.
    return json({ testlage: true, personnummer: TESTPERSONNUMMER });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!franSajten(request)) return json({ error: 'Fel ursprung.' }, 403);

  let body: { samtalsId?: unknown; handling?: unknown; personnummer?: unknown; ordernummer?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ogiltig JSON' }, 400);
  }

  const samtalsId = typeof body.samtalsId === 'string' && UUID.test(body.samtalsId) ? body.samtalsId : '';
  if (!samtalsId) return json({ error: 'Saknar giltigt samtals-id.' }, 400);

  if (body.handling === 'starta') {
    const personnummer = String(body.personnummer ?? '').trim().slice(0, 20);
    const svar = startaSignering(samtalsId, personnummer);
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
  }

  const ordernummer = typeof body.ordernummer === 'string' && UUID.test(body.ordernummer) ? body.ordernummer : '';
  if (!ordernummer) return json({ error: 'Saknar ordernummer.' }, 400);

  if (body.handling === 'kolla') {
    const svar = kollaSignering(samtalsId, ordernummer);
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
  }

  if (body.handling === 'avbryt') {
    avbrytSignering(samtalsId, ordernummer);
    return json({ ok: true });
  }

  return json({ error: 'Okänd handling.' }, 400);
}
