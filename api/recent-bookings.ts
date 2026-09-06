// Vercel Edge Function: senaste RIKTIGA bokningarna, kraftigt avidentifierade.
//
// GET  – publik. Returnerar max 5 poster: { firstName, service, ts }.
//        Inget efternamn, ingen adress, ingen e-post, ingen kontaktuppgift.
//        Tom lista om inget riktigt har kommit in – då visas ingen toast alls.
// POST – skyddad med RECENT_BOOKINGS_TOKEN. Bokningssystemet (boka.stodona.se)
//        anropar den när en bokning bekräftas.
//
// Sajten hittar ALDRIG på bokningar. Finns ingen data visas ingenting.

export const config = {
  runtime: 'edge',
};

// Hur länge en bokning får visas i toasten.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SHOWN = 5;
const MAX_STORED = 20;
const KV_KEY = 'recent_bookings';

// Endast tjänster vi faktiskt säljer får visas – skyddar mot skräp i flödet.
const ALLOWED_SERVICES = [
  'hemstädning',
  'flyttstädning',
  'storstädning',
  'fönsterputsning',
  'företagsstädning',
  'byggstädning',
  'trappstädning',
  'kontorsstädning',
  'textiltvätt',
  'barnpassning',
];

type Booking = { firstName: string; service: string; ts: string };

async function kvRequest(url: string, token: string, command: string[]) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  return res.json();
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Behåll bara förnamnet, och bara om det ser ut som ett namn.
function toFirstName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const first = raw.trim().split(/\s+/)[0] || '';
  if (first.length < 2 || first.length > 20) return null;
  if (!/^[\p{L}][\p{L}\-']*$/u.test(first)) return null;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function toService(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  return ALLOWED_SERVICES.includes(s) ? s : null;
}

const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });

export default async function handler(request: Request) {
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  const INGEST_TOKEN = process.env.RECENT_BOOKINGS_TOKEN;

  if (request.method === 'GET') {
    if (!KV_URL || !KV_TOKEN) return json({ bookings: [] }, 200, 'public, max-age=60');

    try {
      const result = await kvRequest(KV_URL, KV_TOKEN, ['LRANGE', KV_KEY, '0', String(MAX_STORED)]);
      const now = Date.now();
      const bookings: Booking[] = (result.result || [])
        .map((item: string) => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        })
        .filter((b: Booking | null): b is Booking => {
          if (!b || !b.firstName || !b.service || !b.ts) return false;
          const age = now - new Date(b.ts).getTime();
          return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS;
        })
        .slice(0, MAX_SHOWN)
        // Skicka bara de tre fälten vidare, aldrig hela objektet.
        .map((b: Booking) => ({ firstName: b.firstName, service: b.service, ts: b.ts }));

      return json({ bookings }, 200, 'public, max-age=60');
    } catch (error) {
      console.error('recent-bookings KV read error:', error);
      return json({ bookings: [] }, 200, 'public, max-age=60');
    }
  }

  if (request.method === 'POST') {
    if (!INGEST_TOKEN) return json({ error: 'RECENT_BOOKINGS_TOKEN saknas i miljön' }, 503);

    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!safeEqual(token, INGEST_TOKEN)) return json({ error: 'Unauthorized' }, 401);

    if (!KV_URL || !KV_TOKEN) return json({ error: 'KV inte konfigurerat' }, 503);

    try {
      const data = await request.json();
      const firstName = toFirstName(data.firstName ?? data.name);
      const service = toService(data.service);
      if (!firstName || !service) {
        return json({ error: 'Ogiltigt förnamn eller tjänst' }, 400);
      }

      const booking: Booking = { firstName, service, ts: new Date().toISOString() };
      await kvRequest(KV_URL, KV_TOKEN, ['LPUSH', KV_KEY, JSON.stringify(booking)]);
      await kvRequest(KV_URL, KV_TOKEN, ['LTRIM', KV_KEY, '0', String(MAX_STORED - 1)]);

      return json({ success: true });
    } catch (error) {
      console.error('recent-bookings write error:', error);
      return json({ error: 'Internal server error' }, 500);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}
