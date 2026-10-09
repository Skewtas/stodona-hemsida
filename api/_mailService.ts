import { mailImageBlocks, type MailAttachment } from './_mailAttachments';
import type { MailReview } from './_mailPolicy';
import type { Samtalsinfo } from './_kanaler';
import type { MailIdentity } from './_mailIdentity';

export type MailInput = { mailbox: string; messageId: string; conversationId: string; email: string; name: string; subject: string; receivedAt: string; thread: string; alreadyAnswered?: boolean; attachments?: MailAttachment[]; manualReason?: string };
export type MailDraft = { id: string; sessionId: string; sourceId: string; revision: number; status: 'prepared' | 'creating_draft' | 'drafted' | 'failed'; text: string; review: MailReview; needsIdentity: boolean; draftId?: string; updatedAt: string };
type Store = { hamta<T>(key: string): Promise<T | null>; spara(key: string, value: unknown, ttl: number): Promise<void>; lasa(key: string, ttl: number): Promise<boolean>; taBort(key: string): Promise<void>; taOperationslas(key: string, owner: string): Promise<boolean>; slappOperationslas(key: string, owner: string): Promise<void> };
export type MailDependencies = {
  store: Store; hash(value: string): Promise<string>;
  channel(externalId: string): Promise<Samtalsinfo>; getChannel(id: string): Promise<Samtalsinfo | null>; canReply(info: Samtalsinfo): boolean;
  identity(sessionId: string, email: string): Promise<MailIdentity>; verified(sessionId: string, email: string): Promise<boolean>;
  challenge(sessionId: string, identity: MailIdentity): Promise<string | null>;
  chat(info: Samtalsinfo, thread: string, attachments: MailAttachment[]): Promise<{ text: string; review: MailReview; failed?: boolean }>;
  update(info: Samtalsinfo, draft: MailDraft): Promise<void>;
  origin: string;
};
export function validMailInput(input: unknown, mailbox: string): input is MailInput {
  const m = input as MailInput;
  return Boolean(m && m.mailbox === mailbox && typeof m.messageId === 'string' && m.messageId.length > 0 && m.messageId.length < 1000 &&
    typeof m.conversationId === 'string' && m.conversationId.length > 0 && m.conversationId.length < 1000 &&
    typeof m.email === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(m.email) && m.email.length <= 254 &&
    typeof m.thread === 'string' && m.thread.length > 0 && m.thread.length <= 52000 && typeof m.subject === 'string' && m.subject.length <= 1000 &&
    typeof m.receivedAt === 'string' && Number.isFinite(Date.parse(m.receivedAt)) &&
    (m.manualReason === undefined || typeof m.manualReason === 'string' && m.manualReason.length <= 600) &&
    (!m.attachments || Array.isArray(m.attachments) && m.attachments.length <= 20 && m.attachments.every(a => typeof a.name === 'string' && a.name.length < 300 && typeof a.contentType === 'string' && (!a.text || typeof a.text === 'string' && a.text.length <= 4000) && (!a.dataBase64 || typeof a.dataBase64 === 'string' && a.dataBase64.length <= 350000))));
}
const ttl = 7 * 86400;
const emptyReview = (request: string, nextStep: string): MailReview => ({ intent: 'other', status: 'human_review', request, nextStep, checked: [], proposed: [] });
export function createMailService(d: MailDependencies) {
  return {
    async prepare(input: MailInput): Promise<{ draft?: MailDraft; duplicate?: boolean; manual?: boolean; busy?: boolean }> {
      const externalId = await d.hash(JSON.stringify([input.mailbox, input.conversationId, input.email.toLowerCase()]));
      const lock = `mail:prepare-lock:${externalId}`;
      const owner = crypto.randomUUID();
      if (!await d.store.taOperationslas(lock, owner)) return { busy: true };
      try {
        const id = await d.hash(JSON.stringify([input.mailbox, input.messageId]));
        const old = await d.store.hamta<MailDraft>(`mail:message:${id}`);
        if (input.alreadyAnswered && !old) return { duplicate: true };
        const info = await d.channel(externalId);
        if (!d.canReply(info)) return { manual: true };
        let identity: MailIdentity = { email: input.email.toLowerCase(), candidateId: null };
        let verified = false, identityFailed = false;
        try { identity = await d.identity(info.samtalsId, input.email); verified = await d.verified(info.samtalsId, input.email); }
        catch { identityFailed = true; }
        // SMS identification can resume the SAME source message once, with a new revision.
        const resume = old?.needsIdentity && verified && identity.verifiedAt && identity.verifiedAt > Date.parse(old.updatedAt) && old.status === 'drafted';
        if (old && !resume) return old.status === 'prepared' ? { draft: old } : { duplicate: true, manual: old.status !== 'drafted' };
        const revision = (old?.revision || 0) + 1;
        let result: { text: string; review: MailReview; failed?: boolean };
        try {
          if (identityFailed || input.manualReason) throw new Error('Manuell granskning krävs');
          result = await d.chat(info, JSON.stringify({ latest: { subject: input.subject, receivedAt: input.receivedAt, from: input.email }, outlookThread: input.thread, attachments: (input.attachments || []).map(({ dataBase64, ...metadata }) => metadata) }), input.attachments || []);
        } catch {
          result = { text: 'Tack för ditt mejl. Vi behöver kontrollera ditt ärende och återkommer med ett besked.', review: emptyReview(input.subject, input.manualReason || 'Systemkontrollen misslyckades. Läs hela mejltråden och hantera ärendet manuellt.'), failed: true };
        }
        const needsIdentity = /\[\[\s*bankid\s*\]\]/i.test(result.text);
        let text = result.text.replace(/\[\[\s*val\s*:([^\]]*)\]\]/gi, (_, choices: string) => '\n' + choices.split('|').map(c => `• ${c.trim()}`).join('\n'))
          .replace(/\[\[[^\]]*\]\]/g, '').trim();
        if (needsIdentity) {
          const link = await d.challenge(info.samtalsId, identity);
          if (link) { text += `\n\nIdentifiera dig säkert här: ${d.origin}${link}\n\nEfter identifieringen fortsätter vi med samma ärende.`; result.review.status = 'waiting_customer'; }
          else { text = 'Tack för ditt mejl. Kundservice behöver hjälpa dig att koppla ditt ärende till rätt kunduppgifter och återkommer till dig.'; result.review = emptyReview(input.subject, 'Avsändaradressen saknar en entydig aktiv kundmatchning. Identifiera kunden manuellt.'); }
        }
        if (input.attachments?.some(a => a.unread || a.dataBase64 && mailImageBlocks([a]).length === 0)) { result.review.status = 'human_review'; result.review.nextStep += ' Granska bilagorna i Outlook; alla bilagor har inte kunnat läsas automatiskt.'; }
        if (result.failed) result.review.status = 'human_review';
        // Human-review cases must not admit fault, waive payment, promise a credit,
        // or leak internal notes. Keep the model's analysis in the staff record.
        if (result.review.status === 'human_review') {
          text = result.review.intent === 'unclear'
            ? 'Tack för ditt mejl. Kan du beskriva lite mer vad ärendet gäller och vad du vill ha hjälp med? Då kan vi hjälpa dig vidare.'
            : result.review.intent === 'complaint'
              ? 'Tack för att du berättar. Vi tar det du beskriver på allvar och behöver gå igenom underlaget. Kundservice återkommer med besked.'
              : 'Tack för ditt mejl. Vi behöver gå igenom underlaget för ditt ärende och återkommer med besked.';
          result.review.nextStep += ' Utkastet är en neutral bekräftelse; personal formulerar eventuella följdfrågor efter kontroll.';
        }
        const draft: MailDraft = { id, sessionId: info.samtalsId, sourceId: input.messageId, revision, status: input.manualReason ? 'failed' : 'prepared', text, review: result.review, needsIdentity: needsIdentity && result.review.status !== 'human_review', updatedAt: new Date().toISOString() };
        await d.store.spara(`mail:message:${id}`, draft, ttl);
        await d.update(info, draft);
        return input.manualReason ? { manual: true } : { draft };
      } finally { await d.store.slappOperationslas(lock, owner); }
    },
    async begin(id: string, revision: number) {
      const draft = await d.store.hamta<MailDraft>(`mail:message:${id}`);
      if (!draft || draft.revision !== revision || draft.status !== 'prepared') return { granted: false };
      const channel = await d.getChannel(draft.sessionId);
      if (!channel || !d.canReply(channel)) return { granted: false };
      // A non-expiring delivery journal prevents a blind retry after createReply timed out.
      if (!await d.store.taOperationslas(`mail:delivery:${id}:${revision}`, String(revision))) return { granted: false };
      draft.status = 'creating_draft'; draft.updatedAt = new Date().toISOString();
      await d.store.spara(`mail:message:${id}`, draft, ttl);
      await d.update(channel, draft);
      return { granted: true };
    },
    async commit(id: string, revision: number, draftId: string, failed = false) {
      const draft = await d.store.hamta<MailDraft>(`mail:message:${id}`);
      if (!draft || draft.revision !== revision || !['creating_draft','drafted','failed'].includes(draft.status)) throw new Error('Ogiltig utkastkvittens');
      if (draft.status === 'drafted') return { ok: draft.draftId === draftId };
      draft.status = failed ? 'failed' : 'drafted'; draft.draftId = draftId; draft.updatedAt = new Date().toISOString();
      await d.store.spara(`mail:message:${id}`, draft, ttl);
      const info = await d.getChannel(draft.sessionId); if (info) await d.update(info, draft);
      return { ok: true };
    },
  };
}
