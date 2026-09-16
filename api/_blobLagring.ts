// Det enda stället som pratar med Vercel Blob.
//
// Paketet @vercel/blob bygger på Node-moduler (undici, node:crypto) och kan
// därför bara användas i funktioner som kör i Node-miljön – inte i chattens
// edge-funktioner. Allt som rör själva lagringen samlas här och nås av
// api/chat-bilaga.ts och api/chat-bilagor.ts, som båda kör i Node.
//
// Filen börjar med understreck, så Vercel gör den inte till en egen endpoint.

import { head, del, list } from '@vercel/blob';

function nyckel(): string {
  return process.env.BLOB_READ_WRITE_TOKEN || '';
}

/** Filens storlek i byte, eller null om den inte finns. */
export async function blobStorlek(url: string): Promise<number | null> {
  const token = nyckel();
  if (!token) return null;
  try {
    return (await head(url, { token })).size;
  } catch {
    return null;
  }
}

export async function blobRadera(urls: string[]): Promise<void> {
  const token = nyckel();
  if (!urls.length || !token) return;
  await del(urls, { token });
}

/** Raderar filer under chatt/ som är äldre än angivet antal timmar. */
export async function blobRensa(maxTimmar: number): Promise<number> {
  const token = nyckel();
  if (!token) return 0;
  const grans = Date.now() - maxTimmar * 3600 * 1000;
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
  return raderade;
}
