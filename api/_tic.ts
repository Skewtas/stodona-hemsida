// Mobilt BankID via TIC Identity (https://id.tic.io/docs/api/authentication).
//
//   POST   /api/v1/auth/bankid/start      → sessionId, autoStartToken, qrStartToken, qrStartSecret
//   POST   /api/v1/auth/{sessionId}/poll  → status pending | complete | failed | cancelled (+ user)
//   DELETE /api/v1/auth/{sessionId}       → avbryter
// Nyckeln skickas i X-Api-Key och finns bara på servern (TIC_API_KEY).
//
// QR-koden räknas fram här på servern enligt BankID:s standard, så att
// qrStartSecret aldrig lämnar servern:
//   bankid.<qrStartToken>.<sekunder sedan start>.<HMAC-SHA256(qrStartSecret, sekunder)>

const BAS = 'https://id.tic.io';
const TIMEOUT_MS = 8000;

export function ticKonfigurerat(): boolean {
  return Boolean(process.env.TIC_API_KEY?.trim());
}

async function anropa(metod: 'GET' | 'POST' | 'DELETE', sokvag: string, kropp?: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const svar = await fetch(`${BAS}${sokvag}`, {
      method: metod,
      headers: { 'X-Api-Key': process.env.TIC_API_KEY?.trim() ?? '', 'Content-Type': 'application/json', Accept: 'application/json' },
      ...(kropp ? { body: JSON.stringify(kropp) } : {}),
      signal: ac.signal,
    });
    const text = await svar.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text.slice(0, 200) };
    }
    return { status: svar.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export interface TicStart {
  sessionId: string;
  autoStartToken: string;
  qrStartToken: string;
  qrStartSecret: string;
  /** När ordern startade (ms) – QR-koden räknar sekunder från den. */
  startad: number;
}

export async function ticStarta(slutanvandarIp: string, userAgent: string): Promise<TicStart> {
  const { status, data } = await anropa('POST', '/api/v1/auth/bankid/start', { endUserIp: slutanvandarIp, userAgent: userAgent.slice(0, 300) });
  if (status !== 200 || typeof data.sessionId !== 'string') {
    throw new Error(`TIC start svarade ${status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return {
    sessionId: data.sessionId,
    autoStartToken: String(data.autoStartToken ?? ''),
    qrStartToken: String(data.qrStartToken ?? ''),
    qrStartSecret: String(data.qrStartSecret ?? ''),
    startad: Date.now(),
  };
}

export type TicStatus =
  | { status: 'vantar'; tips: string }
  | { status: 'klar'; personnummer: string; namn: string }
  | { status: 'misslyckad'; tips: string };

export async function ticFraga(sessionId: string): Promise<TicStatus> {
  const { status, data } = await anropa('POST', `/api/v1/auth/${encodeURIComponent(sessionId)}/poll`);
  const s = String(data.status ?? '');
  if (status === 200 && s === 'pending') return { status: 'vantar', tips: String(data.message ?? '') };
  if (status === 200 && s === 'complete') {
    const user = (data.user ?? {}) as Record<string, unknown>;
    const personnummer = String(user.personalNumber ?? '').replace(/\D/g, '');
    if (!/^\d{12}$/.test(personnummer)) return { status: 'misslyckad', tips: 'Legitimeringen gav inget giltigt personnummer.' };
    return { status: 'klar', personnummer, namn: String(user.name ?? '') };
  }
  const hint = String(data.hintCode ?? '');
  return {
    status: 'misslyckad',
    tips:
      hint === 'userCancel' || s === 'cancelled'
        ? 'Legitimeringen avbröts.'
        : hint === 'expiredTransaction' || hint === 'startFailed'
          ? 'Tiden för legitimeringen gick ut. Försök igen.'
          : 'Legitimeringen gick inte igenom. Försök igen.',
  };
}

export async function ticAvbryt(sessionId: string): Promise<void> {
  await anropa('DELETE', `/api/v1/auth/${encodeURIComponent(sessionId)}`).catch(() => undefined);
}

/** Aktuell animerad QR-data. Byts varje sekund. */
export async function qrData(start: TicStart): Promise<string> {
  const sekunder = Math.max(0, Math.floor((Date.now() - start.startad) / 1000));
  const nyckel = await crypto.subtle.importKey('raw', new TextEncoder().encode(start.qrStartSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatur = await crypto.subtle.sign('HMAC', nyckel, new TextEncoder().encode(String(sekunder)));
  const hex = [...new Uint8Array(signatur)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `bankid.${start.qrStartToken}.${sekunder}.${hex}`;
}
