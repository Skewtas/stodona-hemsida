import * as store from './_lagring';
import { twGetAlla, type TwKlient } from './_timewave';
import { verifieradKund } from './_sjalvservice';

export const mailHash = async (value: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
export const normalEmail = (value: string) => value.trim().toLowerCase();
export type MailIdentity = { email: string; candidateId: string | null; verifiedAt?: number };
export type MailChallenge = { sessionId: string; authSessionId: string; email: string; candidateId: string; expires: number };
export const identityKey = (sessionId: string) => `mail:identity:${sessionId}`;

/** Uses the same TimeWave adapter, with exact matching after the server filter. */
export async function matchMailCustomer(email: string): Promise<string | null> {
  const normalized = normalEmail(email);
  const all = await twGetAlla<TwKlient & { email?: string }>(`/clients?filter[email]=${encodeURIComponent(normalized)}`);
  const matches = [...new Map(all.filter(c => !c.deleted && c.status === 'active' && normalEmail(c.email || '') === normalized).map(c => [c.id, c])).values()];
  return matches.length === 1 ? String(matches[0].number) : null;
}

export async function mailVerified(sessionId: string, email: string): Promise<boolean> {
  const [identity, verified] = await Promise.all([store.hamta<MailIdentity>(identityKey(sessionId)), verifieradKund(sessionId)]);
  return Boolean(identity?.candidateId && verified && identity.email === normalEmail(email) && identity.candidateId === verified.kundId);
}

export async function createMailChallenge(sessionId: string, identity: MailIdentity): Promise<string | null> {
  if (!identity.candidateId) return null;
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map(x => x.toString(16).padStart(2, '0')).join('');
  const challenge: MailChallenge = { sessionId, authSessionId: crypto.randomUUID(), email: identity.email, candidateId: identity.candidateId, expires: Date.now() + 24 * 3600000 };
  await store.spara(`mail:challenge:${await mailHash(token)}`, challenge, 86400);
  // Fragment keeps the bearer token out of HTTP request logs and Referer.
  return `/mail-identifiering.html#${token}`;
}

export async function getMailChallenge(token: unknown): Promise<MailChallenge | null> {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
  const challenge = await store.hamta<MailChallenge>(`mail:challenge:${await mailHash(token)}`);
  return challenge && challenge.expires > Date.now() ? challenge : null;
}

export async function mailSessionVerified(sessionId: string): Promise<boolean> {
  const identity = await store.hamta<MailIdentity>(identityKey(sessionId));
  return Boolean(identity && await mailVerified(sessionId, identity.email));
}
