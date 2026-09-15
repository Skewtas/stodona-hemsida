// Vercel Edge Function: chattstatistiken för en dag, till Head of.
//
// Head of hämtar härifrån varje natt och sparar i sin egen databas. Bara
// anonymiserade frågor, ämnen och utfall lämnas ut – aldrig samtal i klartext.
// Kräver CHAT_STATS_SECRET som Bearer-token och är helt stängd utan den.

import { hamtaDag, sammanstall, dagSthlm } from './_chatStatistik';

export const config = { runtime: 'edge' };

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const svar = (status: number, kropp: unknown) => new Response(JSON.stringify(kropp), { status, headers: JSON_HEADERS });

/** Jämför i konstant tid, så svarstiden inte avslöjar hur mycket som stämmer. */
function sammaHemlighet(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let skillnad = 0;
  for (let i = 0; i < x.length; i++) skillnad |= x[i] ^ y[i];
  return skillnad === 0;
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') return svar(405, { error: 'Method not allowed' });

  const hemlighet = process.env.CHAT_STATS_SECRET;
  if (!hemlighet) return svar(503, { error: 'CHAT_STATS_SECRET saknas i miljön' });

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !sammaHemlighet(token, hemlighet)) return svar(401, { error: 'Unauthorized' });

  // Standard: gårdagen, eftersom Head of hämtar efter midnatt.
  const dag = new URL(request.url).searchParams.get('dag') || dagSthlm(new Date(Date.now() - 24 * 3600 * 1000));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dag)) return svar(400, { error: 'dag ska vara ÅÅÅÅ-MM-DD' });

  const samtal = await hamtaDag(dag);
  return svar(200, { dag, sammanstallning: sammanstall(samtal), samtal });
}
