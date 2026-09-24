import { customerBookingActions } from './_customerBookingActions';
import { twGetAlla, type TwKlient } from './_timewave';
import * as store from './_lagring';
import { bedom } from './_avbokningsregler';
import { avtryck, idagSthlm, laggTillDagar, minuter, sthlmTidpunkt, type Bokning, type Lucka } from './_bokningssystem';

export const config = { runtime: 'edge' };
type Offer = { id: string; threadId: string; email: string; before: Bokning; target: Lucka; createdAt: number };
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const manual = (reason: string) => reply({ status: 'manual_review_required', reason });
const validDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(`${v}T12:00:00Z`)) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
const validTime = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/** Private, server-to-server adapter. Uses exactly the TimeWave engine used by chat. */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const secret = process.env.BOOKING_ACTIONS_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return reply({ error: 'Unauthorized' }, 401);
  if (!store.lagringFinns()) return manual('Beständig lagring saknas.');
  try {
    const text = await request.text();
    if (text.length > 20000) return reply({ error: 'Request too large' }, 413);
    const data = JSON.parse(text);
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !email.includes('@') || typeof data.threadId !== 'string' || !data.threadId || data.threadId.length > 500) return reply({ error: 'Invalid identity' }, 400);
    const customers = await twGetAlla<TwKlient & { email?: string; secondary_email?: string }>(`/clients?filter[email]=${encodeURIComponent(email)}`);
    const matches = [...new Map(customers.filter(c => !c.deleted && c.status === 'active' && c.email?.trim().toLowerCase() === email).map(c => [c.id, c])).values()];
    if (matches.length !== 1) return manual(matches.length ? 'Flera kunder har avsändarens mejladress.' : 'Ingen entydig aktiv kund hittades för avsändaradressen.');
    const system = customerBookingActions({ mail: true });
    const customer = await system.hamtaKund(String(matches[0].number));
    if (!customer) return manual('Kunduppgifterna kunde inte verifieras.');
    if (data.action === 'lookup') return reply({ status: 'resolved', customer, bookings: await system.hamtaBokningar(customer.id), capabilities: { reschedule: true, cancel: true, recurring: false, otherStaff: false, sameDay: true, geographicRouting: false } });
    if (data.action === 'cancel') {
      if (process.env.STODONA_LOKAL === 'true' || process.env.MAIL_BOOKING_WRITES_ENABLED !== 'true') return manual('Automatiska avbokningar via mejl är inte aktiverade.');
      const booking = typeof data.bookingId === 'string' ? await system.hamtaBokning(data.bookingId) : null;
      if (!booking || booking.kundId !== customer.id) return manual('Bokningen kunde inte knytas till kunden.');
      const expected = data.expected;
      if (!expected?.stadare || expected.id !== booking.id || expected.kundId !== customer.id || avtryck(expected) !== avtryck(booking) || expected.tjanst !== booking.tjanst || expected.adress !== booking.adress) return manual('Bokningen har ändrats sedan kundens avbokningsönskemål tolkades.');
      const result = await system.avbokaTillfalle!(booking);
      if (result.ok === false) return manual(result.fel);
      return reply({ status: 'completed', action: 'cancel', booking: { ...booking, status: 'cancelled' }, reference: result.referens });
    }
    if (data.action === 'execute') {
      if (process.env.STODONA_LOKAL === 'true') return manual('Mejlskrivning kräver beständig produktionslagring, inte lokalt minnesläge.');
      if (process.env.MAIL_BOOKING_WRITES_ENABLED !== 'true') return manual('Automatiska bokningsändringar via mejl är inte aktiverade.');
      const offer = typeof data.offerId === 'string' ? await store.hamta<Offer>(`booking-actions:offer:${data.offerId}`) : null;
      if (!offer || offer.threadId !== data.threadId || offer.email !== email || offer.before.kundId !== customer.id) return manual('Erbjudandet tillhör inte kunden och mejltråden.');
      const active = await store.hamta<string[]>(`booking-actions:active:${JSON.stringify([email, data.threadId])}`);
      if (!active?.includes(offer.id)) return manual('Erbjudandet har ersatts av en ny sökning.');
      if (Date.now() - offer.createdAt > 7 * 86400000) return reply({ status: 'search_again', reason: 'Erbjudandet har gått ut.' });
      const current = await system.hamtaBokning(offer.before.id);
      if (!current || current.kundId !== customer.id || avtryck(current) !== avtryck(offer.before)) return manual('Ursprungsbokningen har ändrats.');
      const fee = bedom(current.tjanst, sthlmTidpunkt(current.datum, current.start), current.prisKr);
      if (!Number.isFinite(fee.timmarKvar) || fee.inomFrist) return manual('Ändringen kan innebära avgift eller annan ekonomisk konsekvens.');
      const check = await system.kontrolleraLucka(current, offer.target);
      if (!check.ledig || check.lossas.length) return reply({ status: 'search_again', reason: 'Tiden hann bli upptagen.' });
      const result = await system.flyttaTillfalle(current, offer.target, 'Ombokad via Kundservice – Mail');
      if (result.ok === false) return manual(result.fel);
      // The shared action boundary already verifies the write; expose only that result.
      return reply({ status: 'completed', booking: { ...current, ...offer.target }, reference: result.referens });
    }
    if (data.action !== 'search') return manual('Åtgärden stöds inte av den gemensamma bokningsmotorn ännu.');
    const b = typeof data.bookingId === 'string' ? await system.hamtaBokning(data.bookingId) : null;
    if (!b || b.kundId !== customer.id) return manual('Bokningen kunde inte knytas till kunden.');
    if (b.ejAndringsbar) return manual(b.ejAndringsbar);
    if (data.staffId && data.staffId !== b.stadare.id) return manual('Sökning med annan personal saknas i bokningsmotorn.');
    if (data.otherStaff === true) return manual('Sökning hos team och annan personal behöver göras av Ella.');
    if (!validDate(data.from) || !validDate(data.to) || data.to < data.from || data.to > laggTillDagar(data.from, 13)) return reply({ error: 'Invalid search range (maximum 14 days)' }, 400);
    if (data.from < idagSthlm()) return reply({ status: 'search_again', reason: 'Sökperioden har passerat. Ange en aktuell period.' });
    if ((data.after && !validTime(data.after)) || (data.before && !validTime(data.before))) return reply({ error: 'Invalid time' }, 400);
    const fee = bedom(b.tjanst, sthlmTidpunkt(b.datum, b.start), b.prisKr);
    if (!Number.isFinite(fee.timmarKvar) || fee.inomFrist) return manual('Ändringen kan innebära avgift eller annan ekonomisk konsekvens.');
    const slots = (await system.ledigaLuckor(b, data.from, data.to, b.stadare, data.after || undefined))
      .filter(t => !t.fortur && (!data.after || t.start >= data.after) && (!data.before || t.start <= data.before))
      .sort((a, z) => data.asap ? `${a.datum}${a.start}`.localeCompare(`${z.datum}${z.start}`) : Math.abs(minuter(a.start) - minuter(data.after || b.start)) - Math.abs(minuter(z.start) - minuter(data.after || b.start)) || a.datum.localeCompare(z.datum));
    const chosen: Lucka[] = [];
    for (const t of slots) {
      if (chosen.length === 2) break;
      const check = await system.kontrolleraLucka(b, t);
      if (check.ledig && !check.lossas.length) chosen.push(t);
    }
    const offers: Offer[] = chosen.map(target => ({ id: crypto.randomUUID(), threadId: data.threadId, email, before: b, target, createdAt: Date.now() }));
    for (const offer of offers) await store.sparaPermanent(`booking-actions:offer:${offer.id}`, offer);
    await store.sparaPermanent(`booking-actions:active:${JSON.stringify([email, data.threadId])}`, offers.map(o => o.id));
    return reply({ status: offers.length ? 'awaiting_customer_selection' : 'no_availability', customer, booking: b, offers });
  } catch {
    return manual('Tekniskt fel: kund, bokning eller TimeWave-status kunde inte kontrolleras säkert.');
  }
}
