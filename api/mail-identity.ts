import * as store from './_lagring';
import { createMailIdentityHandler } from './_mailIdentityHandler';
import { getMailChallenge, identityKey, mailHash, matchMailCustomer } from './_mailIdentity';
import { skickaKod } from './_smskod';
import { loggaInMedKod, valjSmsKonto, valjKundFor, sjalvserviceTillaten } from './_sjalvservice';
import { uppdatera } from './_kanaler';
import type { RequestContext } from '@vercel/edge';
import type { MailDraft } from './_mailService';
export const config = { runtime: 'edge' };
export default async function handler(request: Request, context?: RequestContext) {
 return createMailIdentityHandler({
  enabled: () => process.env.MAIL_CHANNEL_ENABLED === 'true' && sjalvserviceTillaten(false),
  get: getMailChallenge,
  send: skickaKod,
  verify: loggaInMedKod,
  select: valjSmsKonto,
  match: matchMailCustomer,
  finish: async (challenge, token) => {
    const customer = await valjKundFor(challenge.sessionId, challenge.candidateId);
    if (!customer) throw new Error('Identifieringen kunde inte kopplas till ärendet.');
    await store.spara(identityKey(challenge.sessionId), { email: challenge.email, candidateId: challenge.candidateId, verifiedAt: Date.now() }, 7 * 86400);
    await uppdatera(challenge.sessionId, i => { i.kund = { nummer: customer.id, namn: customer.namn }; });
    await store.taBort(`mail:challenge:${await mailHash(token)}`);
    const resume = async () => {
      try {
        const draft = await store.hamta<MailDraft>(`mail:latest:${challenge.sessionId}`);
        if (!draft?.sourceId) return;
        const response = await fetch('https://stodona-kundservice.vercel.app/api/mail-resume', {
          method: 'POST', headers: { 'Content-Type': 'application/json', authorization: `Bearer ${process.env.MAIL_CHANNEL_SECRET}` },
          body: JSON.stringify({ messageId: draft.sourceId }), signal: AbortSignal.timeout(120000),
        });
        if (!response.ok) throw new Error(`Återupptagning ${response.status}`);
      } catch {
        await uppdatera(challenge.sessionId, i => { i.kraverAtgard = true; i.orsak = 'Kunden är identifierad men utkastet kunde inte återupptas. Kontrollera mejltråden.'; });
      }
    };
    if (context) context.waitUntil(resume()); else await resume();
  },
 })(request);
}
