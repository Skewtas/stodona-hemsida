// Legitimering med Mobilt BankID i chatten – via TIC Identity (api/_tic.ts).
//
// Endpointen svarar bara när självservicen är påslagen (se api/_sjalvservice.ts).
//
//   POST { samtalsId, handling: "starta" }               → { ordernummer, autoStartToken }
//   POST { samtalsId, handling: "starta", testkundId }   → { ordernummer }  (testinloggning, bara i testläget)
//   POST { samtalsId, handling: "kolla", ordernummer }   → { status: "vantar", qr, tips } | { status: "klar", namn }
//   POST { samtalsId, handling: "avbryt", ordernummer }  → { ok: true }
//
// Personnumret passerar aldrig chatten. Servern får det från TIC, matchar det
// mot exakt en kund i TimeWave och kopplar samtalet till kunden.

import { personalNamn } from './_personal';
import { sjalvserviceTillaten, SJALVSERVICE_PA, TESTLAGE, startaSignering, startaBankid, kollaSignering, avbrytSignering, TESTKUNDLISTA } from './_sjalvservice';

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
  if (!SJALVSERVICE_PA) return json({ error: 'Legitimering är inte påslagen.' }, 503);
  // I produktion bara för inloggad personal i personalchatten – även listan nedan.
  const personal = Boolean(await personalNamn(request));
  if (!sjalvserviceTillaten(personal)) return json({ error: 'Legitimering är inte påslagen.' }, 403);
  if (request.method === 'GET') {
    // Testlägets hjälplista: vilka testpersonnummer som fungerar.
    return json({ testkunder: TESTKUNDLISTA });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!franSajten(request)) return json({ error: 'Fel ursprung.' }, 403);

  let body: { samtalsId?: unknown; handling?: unknown; testkundId?: unknown; ordernummer?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ogiltig JSON' }, 400);
  }

  const samtalsId = typeof body.samtalsId === 'string' && UUID.test(body.samtalsId) ? body.samtalsId : '';
  if (!samtalsId) return json({ error: 'Saknar giltigt samtals-id.' }, 400);

  if (body.handling === 'starta') {
    const testkundId = String(body.testkundId ?? '').trim().slice(0, 20);
    if (testkundId) {
      if (!TESTLAGE && !personal) return json({ error: 'Okänd handling.' }, 400);
      const svar = await startaSignering(samtalsId, testkundId);
      return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
    }
    // BankID vill ha kundens IP-adress. Lokalt finns ingen, då används 127.0.0.1.
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const svar = await startaBankid(samtalsId, ip === '::1' ? '127.0.0.1' : ip, request.headers.get('user-agent') ?? '');
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
  }

  const ordernummer = typeof body.ordernummer === 'string' && UUID.test(body.ordernummer) ? body.ordernummer : '';
  if (!ordernummer) return json({ error: 'Saknar ordernummer.' }, 400);

  if (body.handling === 'kolla') {
    const svar = await kollaSignering(samtalsId, ordernummer);
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
  }

  if (body.handling === 'avbryt') {
    await avbrytSignering(samtalsId, ordernummer);
    return json({ ok: true });
  }

  return json({ error: 'Okänd handling.' }, 400);
}
