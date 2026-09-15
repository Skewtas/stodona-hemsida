// Raderar bilder och videor från chatten när de är äldre än 90 dagar.
//
// Körs av Vercel cron varje natt (vercel.json). Kräver Authorization: Bearer
// <CRON_SECRET> – Vercel skickar den automatiskt när CRON_SECRET är satt.
// Utan BLOB_READ_WRITE_TOKEN finns inga filer, och då görs ingenting.

import { list, del } from '@vercel/blob';
import { LAGRINGSDAGAR } from './_chatBilagor';

export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async function handler(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return json({ ok: true, hoppadeOver: 'BLOB_READ_WRITE_TOKEN saknas – inga filer att rensa.' });

  const grans = Date.now() - LAGRINGSDAGAR * 24 * 3600 * 1000;
  let cursor: string | undefined;
  let raderade = 0;

  do {
    const sida = await list({ prefix: 'chatt/', cursor, limit: 1000, token });
    const gamla = sida.blobs.filter((b) => new Date(b.uploadedAt).getTime() < grans).map((b) => b.url);
    if (gamla.length) {
      await del(gamla, { token });
      raderade += gamla.length;
    }
    cursor = sida.hasMore ? sida.cursor : undefined;
  } while (cursor);

  return json({ ok: true, raderade });
}
