import type { MailChallenge } from './_mailIdentity';
type Login = { status: 'klar'; kundnummer: string } | { status: 'valj'; konton: { nummer: string }[] } | { fel: string };
type Dependencies = {
  enabled(): boolean; get(token: unknown): Promise<MailChallenge | null>;
  send(session: string, phone: string, ip: string, origin: string): Promise<{ ok: true; meddelande: string } | { fel: string }>;
  verify(session: string, code: string): Promise<Login>;
  select(session: string, customer: string): Promise<Exclude<Login, { status: 'valj' }>>;
  match(email: string): Promise<string | null>; finish(challenge: MailChallenge, token: string): Promise<void>;
};
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } });
export function createMailIdentityHandler(d: Dependencies) {
  return async (request: Request) => {
    if (!d.enabled()) return json({ error: 'Identifiering är inte tillgänglig just nu.' }, 503);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Fel ursprung.' }, 403);
    try {
      const raw = await request.text(); if (raw.length > 2000) return json({ error: 'För stor begäran.' }, 413);
      const data = JSON.parse(raw);
      const challenge = await d.get(data.token);
      if (!challenge) return json({ error: 'Länken har gått ut. Svara på mejlet så hjälper kundservice dig.' }, 410);
      if (data.action === 'send') {
        const result = await d.send(challenge.authSessionId, String(data.phone || '').slice(0, 30), request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown', new URL(request.url).origin);
        return 'fel' in result ? json({ error: result.fel }, 400) : json(result);
      }
      if (data.action !== 'verify') return json({ error: 'Okänd åtgärd.' }, 400);
      let result = await d.verify(challenge.authSessionId, String(data.code || '').slice(0, 10));
      if ('fel' in result) return json({ error: result.fel }, 400);
      if (result.status === 'valj') {
        if (!result.konton.some(k => k.nummer === challenge.candidateId)) return json({ error: 'Identifieringen kunde inte kopplas till mejlärendet. Kontakta kundservice.' }, 403);
        result = await d.select(challenge.authSessionId, challenge.candidateId);
      }
      if ('fel' in result || result.kundnummer !== challenge.candidateId || await d.match(challenge.email) !== challenge.candidateId) return json({ error: 'Identifieringen kunde inte kopplas till mejlärendet. Kontakta kundservice.' }, 403);
      await d.finish(challenge, data.token);
      return json({ ok: true, message: 'Tack! Du är identifierad. Vi fortsätter med ditt mejlärende. Du behöver inte beskriva det igen.' });
    } catch { return json({ error: 'Identifieringen kunde inte slutföras. Försök igen eller kontakta kundservice.' }, 503); }
  };
}
