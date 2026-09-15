// Raderar bilder och videor från chatten som aldrig skickades till kundservice.
//
// Filerna raderas normalt direkt när ärendet mejlats till info@stodona.se. Det
// här är skyddsnätet för samtal som avbröts: allt som legat kvar längre än två
// timmar tas bort.
//
// Körs av Vercel cron varje natt (vercel.json). Kräver Authorization: Bearer
// <CRON_SECRET> – Vercel skickar den automatiskt när CRON_SECRET är satt.

import { rensaGamlaBilagor } from './_chatBilagor';

export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async function handler(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, 401);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ ok: true, hoppadeOver: 'BLOB_READ_WRITE_TOKEN saknas – inga filer att rensa.' });
  }
  return json({ ok: true, raderade: await rensaGamlaBilagor() });
}
