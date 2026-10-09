import chat from './chat';
import * as store from './_lagring';
import { lika } from './_personal';
import { samtalFor, hamtaInfo, aiFarSvara, uppdatera, logga } from './_kanaler';
import { createMailService, validMailInput, type MailDraft } from './_mailService';
import { mailHash, normalEmail, matchMailCustomer, mailVerified, createMailChallenge, identityKey, type MailIdentity } from './_mailIdentity';
export const config = { runtime: 'edge' };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const secret = process.env.MAIL_CHANNEL_SECRET || '';
  if (secret.length < 32 || !lika(request.headers.get('authorization') || '', `Bearer ${secret}`)) return json({ error: 'Unauthorized' }, 401);
  if (process.env.MAIL_CHANNEL_ENABLED !== 'true' || process.env.MAIL_CHANNEL_MODE !== 'draft' || !store.lagringFinns()) return json({ error: 'Mejlkanalen är inte aktiverad i utkastläge.' }, 503);
  const origin = process.env.MAIL_PUBLIC_ORIGIN || 'https://www.stodona.se';
  if (!/^https:\/\/(www\.)?stodona\.se$/.test(origin)) return json({ error: 'Identifieringsadress saknas.' }, 503);
  const service = createMailService({ store, hash: mailHash, origin,
    channel: id => samtalFor('mail', id), getChannel: hamtaInfo, canReply: aiFarSvara,
    identity: async (sessionId, email) => {
      const old = await store.hamta<MailIdentity>(identityKey(sessionId));
      if (old && old.email === normalEmail(email)) return old;
      await uppdatera(sessionId, i => { i.visningsnamn = normalEmail(email); });
      const identity = { email: normalEmail(email), candidateId: await matchMailCustomer(email) };
      await store.spara(identityKey(sessionId), identity, 7 * 86400);
      return identity;
    }, verified: mailVerified, challenge: createMailChallenge,
    chat: async (info, thread, attachments) => {
      const key = process.env.KANAL_INTERN_NYCKEL || '';
      if (key.length < 24) throw new Error('Intern kanalkoppling saknas');
      const response = await chat(new Request(`${origin}/api/chat`, { method: 'POST', headers: {
        'content-type': 'application/json', 'x-kanal-nyckel': key, 'x-kanal': 'mail', 'x-kanal-avsandare': info.externId,
      }, body: JSON.stringify({ sessionId: info.samtalsId, message: thread, mailAttachments: attachments }) }));
      if (!response.ok) throw new Error(`Chatten svarade ${response.status}`);
      return response.json();
    },
    update: async (info, draft) => {
      await uppdatera(info.samtalsId, i => {
        i.visningsnamn ||= 'Outlook-mejl';
        i.senaste = { fran: 'ai', text: `[Utkast: ${draft.status}] ${draft.review.request}`.slice(0, 300), tid: Date.now() };
        i.kraverAtgard = draft.review.status === 'human_review' || ['creating_draft','failed'].includes(draft.status);
        i.orsak = draft.review.nextStep;
      });
      // Full generated reply is retained only in restricted case storage/Outlook, not runtime logs.
      await store.spara(`mail:latest:${info.samtalsId}`, draft, 7 * 86400);
      await logga(info.samtalsId, `mejl ${draft.status}`, JSON.stringify({ sourceId: draft.sourceId, intent: draft.review.intent, checked: draft.review.checked, proposed: draft.review.proposed, status: draft.review.status }));
    },
  });
  try {
    const raw = await request.text(); if (raw.length > 1400000) return json({ error: 'Mejltråden behöver granskas manuellt.' }, 413);
    const data = JSON.parse(raw);
    if (data.action === 'prepare') {
      if (!validMailInput(data.message, process.env.MAILBOX || 'info@stodona.se')) return json({ error: 'Ogiltigt mejlunderlag.' }, 400);
      return json(await service.prepare(data.message));
    }
    if (!/^[a-f0-9]{64}$/.test(data.id || '') || !Number.isInteger(data.revision) || data.revision < 1) return json({ error: 'Ogiltig ärendereferens.' }, 400);
    if (data.action === 'begin') return json(await service.begin(data.id, data.revision));
    if (data.action === 'commit' && typeof data.draftId === 'string' && data.draftId.length <= 1000) return json(await service.commit(data.id, data.revision, data.draftId, data.failed === true));
    return json({ error: 'Okänd åtgärd.' }, 400);
  } catch { return json({ error: 'Mejlärendet behöver kontrolleras manuellt. Inga affärsändringar utförs av mejlkanalen.' }, 503); }
}
