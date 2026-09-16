// Tar emot bilder och videor som kunden bifogar i chatten.
//
// PRODUKTION: webbläsaren laddar upp filen direkt till Vercel Blob. Den här
// endpointen lämnar bara ut en kortlivad uppladdningsnyckel, efter att ha
// kontrollerat att anropet kommer från sajten, att samtals-id:t är giltigt, att
// filen hamnar i samtalets egen mapp och att taken inte är nådda. Filtyp och
// maxstorlek låses i nyckeln, så Blob vägrar allt annat. Filerna serveras från
// Blobs egen domän, aldrig från stodona.se.
//
// TESTMILJÖN: filen skickas hit och sparas i minnet. Då kontrolleras även
// filens första byte, så en HTML-fil inte kan utge sig för att vara en bild.
// GET ?id= visar filen igen.
//
// Filerna ligger bara kvar tills ärendet mejlats till kundservice. Se
// api/_chatBilagor.ts.
//
// Kräver CHAT_ENABLED=true och i produktion BLOB_READ_WRITE_TOKEN.

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import {
  BILDTYPER,
  VIDEOTYPER,
  MAX_BILD_BYTE,
  MAX_VIDEO_BYTE,
  MAX_BILAGOR_PER_SAMTAL,
  typFor,
  mimeFranFilnamn,
  rensaFilnamn,
  samtalsMapp,
  stammerInnehallet,
  sparaLokalt,
  hamtaLokalFil,
  antalLokalaFiler,
  overUppladdningstaket,
  forstaPa,
  MAX_TIMMAR,
  // Node kräver filändelsen i importen. Edge-funktionerna buntas ihop och
  // klarar sig utan, men den här funktionen kör i Node.
} from './_chatBilagor.js';
import { blobRensa } from './_blobLagring.js';

// Kör i Node-miljön (se web-signaturen längst ned): Vercel Blobs paket bygger
// på Node-moduler och fungerar inte i edge.

const LOKAL = process.env.STODONA_LOKAL === 'true';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TAK_PER_IP_TIMME = 40;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const fel = (status: number, meddelande: string) => json({ error: meddelande }, status);

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

async function handler(request: Request): Promise<Response> {
  if (process.env.CHAT_ENABLED !== 'true') return fel(503, 'Chatten är avstängd.');

  if (request.method === 'GET') {
    if (!LOKAL) return fel(404, 'Finns inte.');
    const fil = hamtaLokalFil(new URL(request.url).searchParams.get('id') ?? '');
    if (!fil) return fel(404, 'Filen finns inte längre.');
    return new Response(fil.bytes, {
      headers: {
        'Content-Type': fil.mime,
        'Content-Length': String(fil.bytes.length),
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fil.namn)}`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; media-src 'self'; sandbox",
      },
    });
  }

  if (request.method !== 'POST') return fel(405, 'Method not allowed');
  if (!franSajten(request)) return fel(403, 'Bilagor kan bara skickas från stodona.se.');

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'okand';
  const timme = Math.floor(Date.now() / 3600000);
  if (await overUppladdningstaket(`chat:bilaga:ip:${ip}:${timme}`, TAK_PER_IP_TIMME, 3600)) {
    return fel(429, 'För många filer just nu. Försök igen om en stund.');
  }

  if (LOKAL) {
    const url = new URL(request.url);
    const samtalsId = url.searchParams.get('samtal') ?? '';
    if (!UUID.test(samtalsId)) return fel(400, 'Saknar giltigt samtals-id.');

    const mime = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    const typ = typFor(mime);
    if (!typ) return fel(415, 'Bara bilder och videor går att bifoga.');

    const max = typ === 'bild' ? MAX_BILD_BYTE : MAX_VIDEO_BYTE;
    if (Number(request.headers.get('content-length') ?? '0') > max) return fel(413, 'Filen är för stor.');
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (!bytes.length) return fel(400, 'Filen är tom.');
    if (bytes.length > max) return fel(413, 'Filen är för stor.');
    if (!stammerInnehallet(bytes, mime)) return fel(415, 'Filen verkar inte vara en bild eller video.');

    const mapp = await samtalsMapp(samtalsId);
    if (antalLokalaFiler(mapp) >= MAX_BILAGOR_PER_SAMTAL) return fel(429, `Högst ${MAX_BILAGOR_PER_SAMTAL} filer per samtal.`);

    const namn = rensaFilnamn(url.searchParams.get('namn') ?? '', mime);
    const id = sparaLokalt({ bytes, mime, namn, mapp });
    return json({ url: `/api/chat-bilaga?id=${id}`, typ, namn });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return fel(503, 'Bilagor är inte aktiverade ännu.');

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return fel(400, 'Ogiltig JSON');
  }
  // Bara nyckelutlämning. Blobs uppladdningsbekräftelser används inte.
  if (body?.type !== 'blob.generate-client-token') return fel(400, 'Okänd begäran.');

  try {
    const svar = await handleUpload({
      token,
      request,
      body,
      onBeforeGenerateToken: async (sokvag, clientPayload) => {
        let payload: { samtalsId?: unknown; typ?: unknown } = {};
        try {
          payload = JSON.parse(clientPayload ?? '{}');
        } catch {
          /* ogiltig payload – stoppas nedan */
        }
        const samtalsId = typeof payload.samtalsId === 'string' && UUID.test(payload.samtalsId) ? payload.samtalsId : '';
        if (!samtalsId) throw new Error('ogiltigt samtals-id');

        const mapp = await samtalsMapp(samtalsId);
        const mime = mimeFranFilnamn(sokvag);
        const typ = mime ? typFor(mime) : null;
        const delar = sokvag.split('/');
        if (delar.length !== 3 || delar[0] !== 'chatt' || delar[1] !== mapp || !typ || typ !== payload.typ) {
          throw new Error('ogiltig sökväg eller filtyp');
        }
        if (await overUppladdningstaket(`chat:bilaga:samtal:${mapp}`, MAX_BILAGOR_PER_SAMTAL, 24 * 3600)) {
          throw new Error('taket för samtalet är nått');
        }

        return {
          allowedContentTypes: typ === 'bild' ? BILDTYPER : VIDEOTYPER,
          maximumSizeInBytes: typ === 'bild' ? MAX_BILD_BYTE : MAX_VIDEO_BYTE,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    // Högst var tionde minut: radera filer från avbrutna samtal som legat kvar
    // längre än två timmar. Nattjobbet är skyddsnätet om ingen laddar upp.
    if (await forstaPa('chat:bilaga:rensning', 600)) {
      await blobRensa(MAX_TIMMAR).catch((f) => console.error('chat-bilaga: rensningen misslyckades:', f));
    }
    return json(svar);
  } catch (f) {
    console.error('chat-bilaga: uppladdningen nekades:', f);
    return fel(400, 'Filen kunde inte tas emot.');
  }
}

// Web-signaturen gör funktionen till en Node-funktion hos Vercel.
export default { fetch: handler };
