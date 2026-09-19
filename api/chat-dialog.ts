// Vercel Edge Function: hämta hela dialogen för Head ofs sökbara arkiv.
//
// Head of speglar dialogerna dagligen via /api/chatt/import-daily och
// sparar 7 dagar (samma som här) — så att personal kan söka efter
// "hittade inte städaren" eller liknande utan att gräva i KV.
//
// GDPR: dialogerna innehåller det kunder faktiskt skriver. Beslut av
// Mikaela 2026-09-19 att spara dem i 7 dagar för sökbarhet. Kort TTL
// gör risken hanterbar men integritetstexten på stodona.se måste
// spegla att sådant sparas.
//
// Kräver CHAT_STATS_SECRET (samma som chat-statistik).

import { hamtaSamtalsIderForDag, dagSthlm } from './_chatStatistik';

export const config = { runtime: 'edge' };

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const svar = (status: number, kropp: unknown) =>
  new Response(JSON.stringify(kropp), { status, headers: JSON_HEADERS });

/** Konstant-tids-jämförelse så svarstiden inte avslöjar hemlighetens längd. */
function sammaHemlighet(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let skillnad = 0;
  for (let i = 0; i < x.length; i++) skillnad |= x[i] ^ y[i];
  return skillnad === 0;
}

function kvUppgifter() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function kv(kommando: string[]): Promise<unknown> {
  const u = kvUppgifter();
  if (!u) return null;
  const res = await fetch(u.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${u.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(kommando),
  });
  if (!res.ok) throw new Error(`KV svarade ${res.status}`);
  return (await res.json()).result;
}

interface Meddelande { role: string; content: any; }

export default async function handler(request: Request) {
  if (request.method !== 'GET') return svar(405, { error: 'Method not allowed' });

  const hemlighet = process.env.CHAT_STATS_SECRET;
  if (!hemlighet) return svar(503, { error: 'CHAT_STATS_SECRET saknas' });

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !sammaHemlighet(token, hemlighet)) return svar(401, { error: 'Unauthorized' });

  const url = new URL(request.url);
  const dag = url.searchParams.get('dag') || dagSthlm(new Date(Date.now() - 24 * 3600 * 1000));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dag)) return svar(400, { error: 'dag ska vara ÅÅÅÅ-MM-DD' });

  const enId = url.searchParams.get('id');

  // Ett specifikt samtal → hämta bara det
  if (enId) {
    const rad = await kv(['GET', `chat:samtal:${enId}`]);
    if (typeof rad !== 'string') return svar(404, { error: 'Samtalet finns inte (eller har utgått)', id: enId });
    return svar(200, { dag, dialoger: [{ id: enId, meddelanden: normalisera(JSON.parse(rad)) }] });
  }

  // Alla samtal från en dag
  const ider = await hamtaSamtalsIderForDag(dag);
  if (!ider.length) return svar(200, { dag, dialoger: [] });

  // Hämta i batchar om 50 för att inte träffa någon KV-gräns
  const dialoger: Array<{ id: string; meddelanden: Meddelande[] }> = [];
  for (let i = 0; i < ider.length; i += 50) {
    const batch = ider.slice(i, i + 50);
    const rader = (await kv(['MGET', ...batch.map((id) => `chat:samtal:${id}`)])) as (string | null)[];
    rader.forEach((rad, idx) => {
      if (typeof rad === 'string') {
        try {
          const meddelanden = normalisera(JSON.parse(rad));
          if (meddelanden.length > 0) {
            dialoger.push({ id: batch[idx], meddelanden });
          }
        } catch { /* trasig rad — hoppa */ }
      }
    });
  }

  return svar(200, { dag, dialoger });
}

/**
 * KV lagrar Anthropic MessageParam[] (role + content). Vi förenklar till
 * ren text — tool-call/tool-result markeras separat så Head ofs vy kan
 * visa dem tydligt utan att behöva förstå Claude-formatet.
 */
function normalisera(raw: any): Meddelande[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m: any) => {
    if (typeof m?.content === 'string') return { role: m.role, content: m.content };
    if (Array.isArray(m?.content)) {
      const text = m.content
        .filter((b: any) => b?.type === 'text' && typeof b.text === 'string')
        .map((b: any) => b.text)
        .join('\n');
      const hasTool = m.content.some((b: any) => b?.type === 'tool_use' || b?.type === 'tool_result');
      return {
        role: m.role,
        content: hasTool ? (text || '[verktygsanrop]') : text,
        ...(hasTool ? { verktyg: true } : {}),
      };
    }
    return { role: m?.role || 'unknown', content: '' };
  });
}
