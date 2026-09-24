import * as storage from './_lagring';
import { avtryck, sthlmTidpunkt, type Bokningssystem, type Bokning, type Lucka, type Skrivresultat } from './_bokningssystem';
import { bedom } from './_avbokningsregler';
import { timewaveSystem } from './_timewaveSystem';

type Journal = { status: 'executing' | 'verified' | 'uncertain' | 'rejected'; before: Bokning; target: Lucka; result?: Skrivresultat; after?: Bokning | null; at: string };
type Storage = Pick<typeof storage, 'hamta' | 'sparaPermanent' | 'taOperationslas' | 'slappOperationslas'>;

/** One write boundary shared by mail and chat. No channel implements TimeWave writes. */
export function protectBookingActions(system: Bokningssystem, store: Storage = storage, guard?: (booking: Bokning) => string | null): Bokningssystem {
  return {
    ...system,
    async avbokaTillfalle(before) {
      if (!system.kanSkriva || !system.avbokaTillfalle || !system.kontrolleraAvbokad) return { ok: false, fel: 'Avbokning är inte tillgänglig.' };
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(['cancel', before.kundId, before.id, avtryck(before)]))))].map(x => x.toString(16).padStart(2, '0')).join('');
      const key = `booking-actions:operation:${digest}`;
      const uncertain: Skrivresultat = { ok: false, osaker: true, fel: 'KRÄVER MANUELL HANTERING – OKLAR TIMEWAVE-STATUS' };
      const owner = crypto.randomUUID();
      const locks = [`booking-actions:lock:booking:${before.id}`, `booking-actions:lock:staff:${before.stadare.id}:${before.datum}`].sort();
      const held: string[] = []; let dispatched = false, resolved = false;
      const previousResult = async (entry: { status: string; result?: Skrivresultat }): Promise<Skrivresultat> => entry.status === 'verified'
        ? (await system.kontrolleraAvbokad!(before) ? entry.result! : { ok: false, fel: 'Den tidigare avbokningen kan inte längre verifieras.' })
        : entry.result ?? uncertain;
      const journal = { before, action: 'cancel', at: new Date().toISOString() };
      try {
        const old = await store.hamta<{ status: string; result?: Skrivresultat }>(key);
        if (old) return await previousResult(old);
        for (const lock of locks) {
          if (!await store.taOperationslas(lock, owner)) return { ok: false, fel: 'Bokningen eller personalschemat är låst för kontroll.' };
          held.push(lock);
        }
        const previous = await store.hamta<{ status: string; result?: Skrivresultat }>(key);
        if (previous) return await previousResult(previous);
        const current = await system.hamtaBokning(before.id);
        if (!current || current.kundId !== before.kundId || avtryck(current) !== avtryck(before) || current.tjanst !== before.tjanst || current.adress !== before.adress) return { ok: false, fel: 'Bokningen har ändrats. Manuell kontroll krävs.' };
        const reason = guard?.(current);
        if (reason) return { ok: false, fel: reason };
        await store.sparaPermanent(key, { ...journal, status: 'executing' });
        const lastReason = guard?.(current);
        if (lastReason) {
          const result: Skrivresultat = { ok: false, fel: lastReason };
          await store.sparaPermanent(key, { ...journal, status: 'rejected', result });
          return result;
        }
        dispatched = true;
        const write = await system.avbokaTillfalle(current);
        if (write.ok === false && !write.osaker) {
          await store.sparaPermanent(key, { ...journal, status: 'rejected', result: write });
          resolved = true; return write;
        }
        if (await system.kontrolleraAvbokad(current)) {
          const result: Skrivresultat = { ok: true, referens: `verified-cancel:${digest}` };
          await store.sparaPermanent(key, { ...journal, status: 'verified', result });
          resolved = true; return result;
        }
        await store.sparaPermanent(key, { ...journal, status: 'uncertain', result: uncertain });
        return uncertain;
      } catch {
        if (dispatched) {
          await store.sparaPermanent(key, { ...journal, status: 'uncertain', result: uncertain }).catch(() => {});
          return uncertain;
        }
        return { ok: false, fel: 'Avbokningskontrollen misslyckades innan någon ändring skickades.' };
      } finally {
        if (!dispatched || resolved) for (const lock of held.reverse()) await store.slappOperationslas(lock, owner);
      }
    },
    async flyttaTillfalle(before, target, note) {
      const bytes = new TextEncoder().encode(JSON.stringify([before.kundId, before.id, avtryck(before), avtryck(target)]));
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
      const key = `booking-actions:operation:${digest}`;
      const uncertain: Skrivresultat = { ok: false, osaker: true, fel: 'KRÄVER MANUELL HANTERING – OKLAR TIMEWAVE-STATUS' };
      const replay = async (previous: Journal): Promise<Skrivresultat> => {
        if (previous.status !== 'verified') return previous.result ?? uncertain;
        const actual = await system.lasTillbaka(before);
        return actual && actual.kundId === before.kundId && avtryck(actual) === avtryck(target)
          ? previous.result! : { ok: false, fel: 'En tidigare genomförd ändring har senare ändrats igen. Manuell kontroll krävs.' };
      };
      const previous = await store.hamta<Journal>(key);
      if (previous) return replay(previous);
      if (!system.kanSkriva) return { ok: false, fel: 'Skrivning är avstängd.' };
      const owner = crypto.randomUUID();
      // Staff/day locks also prevent two different customer bookings taking one slot.
      const keys = [...new Set([
        `booking-actions:lock:booking:${before.id}`,
        `booking-actions:lock:staff:${before.stadare.id}:${before.datum}`,
        `booking-actions:lock:staff:${target.stadare.id}:${target.datum}`,
      ])].sort();
      const held: string[] = [];
      let dispatched = false;
      let resolved = false;
      const journal: Journal = { status: 'executing', before, target, at: new Date().toISOString() };
      try {
        for (const lock of keys) {
          if (!await store.taOperationslas(lock, owner)) return { ok: false, fel: 'Bokningen eller personalschemat är låst. Pågående eller oklar ändring behöver kontrolleras.' };
          held.push(lock);
        }
        const existing = await store.hamta<Journal>(key);
        if (existing) return replay(existing);
        const current = await system.hamtaBokning(before.id);
        if (!current || current.kundId !== before.kundId || avtryck(current) !== avtryck(before) || current.tjanst !== before.tjanst || current.adress !== before.adress) {
          return { ok: false, fel: 'Bokningen har ändrats. Hämta nya uppgifter.' };
        }
        const reason = guard?.(current);
        if (reason) return { ok: false, fel: reason };
        const check = await system.kontrolleraLucka(current, target);
        if (!check.ledig || check.lossas.length) return { ok: false, fel: 'Tiden är inte ledig utan att påverka andra bokningar.' };
        await store.sparaPermanent(key, journal);
        const lastReason = guard?.(current);
        if (lastReason) {
          const result: Skrivresultat = { ok: false, fel: lastReason };
          await store.sparaPermanent(key, { ...journal, status: 'rejected', result });
          return result;
        }
        dispatched = true;
        const result = await system.flyttaTillfalle(current, target, note);
        if (result.ok === false && !result.osaker) {
          await store.sparaPermanent(key, { ...journal, status: 'rejected', result });
          resolved = true;
          return result;
        }
        // Even a timeout is reconciled by reading; the write is never repeated.
        const after = await system.lasTillbaka(current);
        if (after && after.id === before.id && after.kundId === before.kundId && avtryck(after) === avtryck(target)) {
          const verified: Skrivresultat = { ok: true, referens: `verified:${digest}` };
          await store.sparaPermanent(key, { ...journal, status: 'verified', result: verified, after });
          resolved = true;
          return verified;
        }
        await store.sparaPermanent(key, { ...journal, status: 'uncertain', result: uncertain, after });
        return uncertain;
      } catch {
        if (dispatched) {
          await store.sparaPermanent(key, { ...journal, status: 'uncertain', result: uncertain }).catch(() => {});
          return uncertain;
        }
        return { ok: false, fel: 'Kontrollen kunde inte slutföras. Ingen bokningsändring skickades.' };
      } finally {
        // Unknown writes keep their locks for explicit operator reconciliation.
        if (!dispatched || resolved) for (const lock of held.reverse()) await store.slappOperationslas(lock, owner);
      }
    },
  };
}

export function customerBookingActions(options: { mail?: boolean } = {}): Bokningssystem {
  return protectBookingActions(timewaveSystem(), storage, options.mail ? booking => {
    const fee = bedom(booking.tjanst, sthlmTidpunkt(booking.datum, booking.start), booking.prisKr);
    return !Number.isFinite(fee.timmarKvar) || fee.inomFrist ? 'Ändringen kan innebära avgift. Ella behöver ta över.' : null;
  } : undefined);
}
