// Inloggning i chatten. Kunderna identifierar sig med engångskod via SMS
// (api/_smskod.ts); testinloggning med kundnummer finns bara lokalt och för
// personalen i personalchatten. (BankID är borttaget – Mikaela 2026-09-25.)
//
//   POST { samtalsId, handling: "sms-skicka", telefon }  → { ok, meddelande }
//   POST { samtalsId, handling: "sms-kolla", kod }       → { status: "klar", namn }
//   POST { samtalsId, handling: "starta", testkundId }   → { ordernummer }       (testinloggning)
//   POST { samtalsId, handling: "kolla", ordernummer }   → { status: "vantar" } | { status: "klar", namn }
//   POST { samtalsId, handling: "avbryt", ordernummer }  → { ok: true }
//
// Endpointen svarar bara när självservicen är tillåten för anropet (se
// sjalvserviceTillaten i api/_sjalvservice.ts). Adressen heter fortfarande
// kund-bankid för att inte bryta äldre sidor i webbläsarens cache.

import { personalNamn } from './_personal';
import { skickaKod, smsKonfigurerat } from './_smskod';
import { sjalvserviceTillaten, SJALVSERVICE_PA, TESTLAGE, startaSignering, kollaSignering, avbrytSignering, loggaInMedKod, valjSmsKonto, TESTKUNDLISTA } from './_sjalvservice';

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
    // Testinloggningen (valfritt kundnummer) syns bara lokalt och för personalen – aldrig för kunder.
    return json({ testkunder: TESTLAGE || personal ? TESTKUNDLISTA : [], sms: smsKonfigurerat() });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!franSajten(request)) return json({ error: 'Fel ursprung.' }, 403);

  let body: { samtalsId?: unknown; handling?: unknown; testkundId?: unknown; ordernummer?: unknown; telefon?: unknown; kod?: unknown; kundnummer?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ogiltig JSON' }, 400);
  }

  const samtalsId = typeof body.samtalsId === 'string' && UUID.test(body.samtalsId) ? body.samtalsId : '';
  if (!samtalsId) return json({ error: 'Saknar giltigt samtals-id.' }, 400);

  // Inloggning med engångskod via SMS (api/_smskod.ts).
  if (body.handling === 'sms-skicka') {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'okand';
    const svar = await skickaKod(samtalsId, String(body.telefon ?? '').slice(0, 30), ip, new URL(request.url).origin);
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
  }
  if (body.handling === 'sms-kolla') {
    const svar = await loggaInMedKod(samtalsId, String(body.kod ?? '').slice(0, 10));
    if ('fel' in svar) return json({ error: svar.fel }, 400);
    // Numret står på flera konton: den som har telefonen väljer vilket.
    return 'konton' in svar ? json(svar) : json({ status: 'klar', namn: svar.namn });
  }
  if (body.handling === 'sms-valj') {
    const svar = await valjSmsKonto(samtalsId, String(body.kundnummer ?? ''));
    return 'fel' in svar ? json({ error: svar.fel }, 400) : json({ status: 'klar', namn: svar.namn });
  }

  if (body.handling === 'starta') {
    const testkundId = String(body.testkundId ?? '').trim().slice(0, 20);
    if (testkundId) {
      if (!TESTLAGE && !personal) return json({ error: 'Okänd handling.' }, 400);
      const svar = await startaSignering(samtalsId, testkundId);
      return 'fel' in svar ? json({ error: svar.fel }, 400) : json(svar);
    }
    return json({ error: 'Välj ett kundnummer.' }, 400);
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
