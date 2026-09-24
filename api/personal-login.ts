// Inloggning till personalchatten (se api/_personal.ts).
//   POST namn, losenord (formulär) → kaka och vidare till den gömda sidan

import { PERSONALCHATT_SIDA, lika, personalKaka, personalchattPa } from './_personal';
import * as lagring from './_lagring';

/** Spärr mot gissning av lösenordet: högst 10 fel per IP-adress och 15 minuter. */
const MAX_FEL = 10;
const SPARR_SEKUNDER = 15 * 60;

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (!personalchattPa()) return new Response('Finns inte.', { status: 404 });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let namn = '';
  let losenord = '';
  try {
    const fd = await request.formData();
    // eslint-disable-next-line no-control-regex
    namn = String(fd.get('namn') ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
    losenord = String(fd.get('losenord') ?? '');
  } catch {
    /* tomt formulär */
  }

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'okand';
  const felNyckel = `personal:loginfel:${ip}`;
  const antalFel = (await lagring.hamta<number>(felNyckel).catch(() => null)) ?? 0;
  if (antalFel >= MAX_FEL) {
    return new Response('För många försök. Vänta 15 minuter och försök igen.', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!namn || !lika(losenord, process.env.PERSONAL_PW ?? '')) {
    await lagring.spara(felNyckel, antalFel + 1, SPARR_SEKUNDER).catch(() => undefined);
    return new Response(null, { status: 303, headers: { Location: `${PERSONALCHATT_SIDA}?fel=1`, 'Cache-Control': 'no-store' } });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: PERSONALCHATT_SIDA, 'Set-Cookie': await personalKaka(namn), 'Cache-Control': 'no-store' },
  });
}
