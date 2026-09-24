import test from 'node:test';
import assert from 'node:assert/strict';
import { protectBookingActions } from '../api/_customerBookingActions';
import type { Bokning, Bokningssystem, Lucka } from '../api/_bokningssystem';
import { twGet, twGetAlla } from '../api/_timewave';

const before: Bokning = { id: 'M1-B1', kundId: '1', datum: '2026-10-09', start: '09:00', slut: '12:00', stadare: { id: '2', namn: 'Maria' }, tjanst: 'Hemstädning', adress: 'Testadress', omrade: 'Test', prisKr: 1000, aterkommande: true };
const target: Lucka = { datum: '2026-10-12', start: '13:00', slut: '16:00', stadare: before.stadare };
function setup() {
  const records = new Map<string, unknown>(); const locks = new Map<string, string>(); let actual = structuredClone(before), writes = 0;
  const store = { hamta: async <T>(key: string) => (records.get(key) as T) ?? null, sparaPermanent: async (key: string, value: unknown) => { records.set(key, structuredClone(value)); }, taOperationslas: async (key: string, owner: string) => { if (locks.has(key)) return false; locks.set(key, owner); return true; }, slappOperationslas: async (key: string, owner: string) => { if (locks.get(key) === owner) locks.delete(key); } };
  const backend = { kanSkriva: true, hamtaBokning: async () => structuredClone(actual), lasTillbaka: async () => structuredClone(actual), kontrolleraLucka: async () => ({ ledig: true, lossas: [] }), flyttaTillfalle: async () => { writes++; actual = { ...actual, ...target }; return { ok: true, referens: 'test' }; } } as unknown as Bokningssystem;
  return { store, backend, locks, records, get writes() { return writes; }, change: (b: Bokning) => { actual = b; } };
}
test('shared action verifies once and safely replays without a second write', async () => {
  const f = setup(); const service = protectBookingActions(f.backend, f.store);
  assert.equal((await service.flyttaTillfalle(before, target)).ok, true);
  assert.equal((await service.flyttaTillfalle(before, target)).ok, true);
  assert.equal(f.writes, 1); assert.equal(f.locks.size, 0);
});
test('timeout with verified readback succeeds without retry', async () => {
  const f = setup(); const write = f.backend.flyttaTillfalle;
  f.backend.flyttaTillfalle = async (...args) => { await write(...args); return { ok: false, osaker: true, fel: 'timeout' }; };
  assert.equal((await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target)).ok, true);
  assert.equal(f.writes, 1);
});
test('unverified write retains locks and blocks retries across instances', async () => {
  const f = setup(); let calls = 0;
  f.backend.flyttaTillfalle = async () => { calls++; throw Error('network timeout'); };
  const result = await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target);
  assert.equal(result.ok, false); assert.ok(f.locks.size > 0);
  await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target);
  assert.equal(calls, 1);
});
test('different bookings competing for same staff/day cannot execute simultaneously', async () => {
  const f = setup(); let release!: () => void; const barrier = new Promise<void>(r => { release = r; });
  let started!: () => void; const ready = new Promise<void>(r => { started = r; });
  const write = f.backend.flyttaTillfalle;
  f.backend.flyttaTillfalle = async (...args) => { started(); await barrier; return write(...args); };
  const first = protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target);
  await ready;
  const secondBooking = { ...before, id: 'M2-B2' };
  const other = { ...f.backend, hamtaBokning: async () => secondBooking };
  const second = await protectBookingActions(other, f.store).flyttaTillfalle(secondBooking, target);
  assert.equal(second.ok, false); release(); await first; assert.equal(f.writes, 1);
});
test('changed original or conflicting slot never writes', async () => {
  const f = setup(); f.change({ ...before, slut: '13:00' });
  assert.equal((await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target)).ok, false);
  assert.equal(f.writes, 0);
  f.change(before); f.backend.kontrolleraLucka = async () => ({ ledig: false });
  assert.equal((await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target)).ok, false);
  assert.equal(f.writes, 0);
});
test('old success is not returned when booking has since changed again', async () => {
  const f = setup(); const service = protectBookingActions(f.backend, f.store);
  await service.flyttaTillfalle(before, target); f.change(before);
  assert.equal((await service.flyttaTillfalle(before, target)).ok, false); assert.equal(f.writes, 1);
});
test('fee guard under lock blocks write even when prior checks passed', async () => {
  const f = setup(); let checks = 0;
  const service = protectBookingActions(f.backend, f.store, () => ++checks === 1 ? null : 'Avgiftsgränsen passerades');
  assert.equal((await service.flyttaTillfalle(before, target)).ok, false); assert.equal(f.writes, 0); assert.equal(f.locks.size, 0);
});
test('journal failure after external write preserves quarantine', async () => {
  const f = setup(); const save = f.store.sparaPermanent; let count = 0;
  f.store.sparaPermanent = async (...args) => { if (++count > 1) throw Error('storage down'); await save(...args); };
  assert.equal((await protectBookingActions(f.backend, f.store).flyttaTillfalle(before, target)).ok, false);
  assert.equal(f.writes, 1); assert.ok(f.locks.size > 0);
});

test('parallel TimeWave reads share one token request', async t => {
  let tokens = 0;
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    if (String(url).endsWith('/oauth/token')) { tokens++; return Response.json({ access_token: 'test-token' }); }
    return Response.json({ data: [] });
  });
  await Promise.all([twGet('/missions'), twGet('/employees'), twGet('/workorderlines')]);
  assert.equal(tokens, 1);
});

test('incomplete TimeWave pagination fails closed instead of offering unsafe slots', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [], last_page: 21 }));
  await assert.rejects(twGetAlla('/missions'));
});

test('cancellation is verified and never replayed as a second cancellation', async () => {
  const f = setup(); let cancelled = false, calls = 0;
  f.backend.avbokaTillfalle = async () => { calls++; cancelled = true; return { ok: true, referens: 'cancel' }; };
  f.backend.kontrolleraAvbokad = async () => cancelled;
  const service = protectBookingActions(f.backend, f.store);
  assert.equal((await service.avbokaTillfalle!(before)).ok, true);
  assert.equal((await service.avbokaTillfalle!(before)).ok, true);
  assert.equal(calls, 1); assert.equal(f.locks.size, 0);
});

test('missing cancellation readback is uncertain and retains locks', async () => {
  const f = setup(); let calls = 0;
  f.backend.avbokaTillfalle = async () => { calls++; return { ok: true, referens: 'cancel' }; };
  f.backend.kontrolleraAvbokad = async () => false;
  const service = protectBookingActions(f.backend, f.store);
  assert.equal((await service.avbokaTillfalle!(before)).ok, false);
  await service.avbokaTillfalle!(before);
  assert.equal(calls, 1); assert.ok(f.locks.size > 0);
});
