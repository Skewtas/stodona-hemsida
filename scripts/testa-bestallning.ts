// Testar beställningen i chatten (api/_bestallning.ts) mot ett utbytt
// bokningssystem – inget anrop lämnar datorn.
//
//   STODONA_LOKAL=true bun scripts/testa-bestallning.ts

if (process.env.STODONA_LOKAL !== 'true') {
  console.error('Avbrutet: kör med STODONA_LOKAL=true, annars skrivs testbeställningar i produktionens lagring.');
  process.exit(1);
}

const { forberedBestallning, hamtaBestallningskort, bekraftaBestallning, sattChatBook } = await import('../api/_bestallning');

let fel = 0;
const kolla = (namn: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${namn}${ok ? '' : `  ${extra}`}`);
  if (!ok) fel++;
};

const SAMMANFATTNING = {
  tjanst: 'Hemstädning', kvm: 70, frekvens: 'Varannan vecka', bindningManader: 6, tillval: [],
  datum: '2026-10-22', tid: '09:00', adress: 'Sveavägen 1, 11157 Stockholm', namn: 'Anna Andersson',
  epost: 'anna@example.invalid', telefon: '0700000000', nyckel: 'Jag är hemma och öppnar',
  rabattkod: 'TRETTI', rabattProcent: 30, rabattProcentDarefter: null, prisKr: 700, prisForeRutKr: 1400, prisDarefterKr: null,
  villkor: 'chatt-2026-10-15',
};
type Anrop = { kropp: Record<string, unknown>; kund: { ip: string; ua: string } };
const anrop: Anrop[] = [];
let svar: (k: Record<string, unknown>) => { status: number; data: Record<string, unknown> } = () => ({
  status: 200, data: { ok: true, sammanfattning: SAMMANFATTNING, hash: 'h1' },
});
sattChatBook(async (kropp, kund) => {
  anrop.push({ kropp, kund });
  return svar(kropp) as never;
});

const KUND = { ip: '9.9.9.9', ua: 'test' };
const INDATA = {
  tjanst: 'Hemstädning', kvm: 70, frekvens: 'Varannan vecka', bindningstid: 6, rabattkod: ' tretti ',
  datum: '2026-10-22', tid: '09:00', fornamn: 'Anna', efternamn: 'Andersson', epost: 'anna@example.invalid',
  telefon: '0700000000', gatuadress: 'Sveavägen 1', postnummer: '111 57', ort: 'Stockholm',
  nyckelhantering: 'Jag lämnar nyckel på kontoret i Sundbyberg',
};

// 1. Granskning → kort
const text = await forberedBestallning('samtal-1', INDATA, KUND);
const id = /\[\[bekrafta:(BE-[A-Z0-9]{8})\]\]/.exec(text)?.[1] ?? '';
kolla('granskningen ger ett kort-id', Boolean(id), text);
kolla('steg granska skickas', anrop[0]?.kropp.steg === 'granska');
kolla('nyckeltexten översätts till Solna', anrop[0]?.kropp.keyHandling === 'Jag lämnar nyckel på kontoret i Solna', String(anrop[0]?.kropp.keyHandling));
kolla('postnumret rensas', anrop[0]?.kropp.postalCode === '11157');
kolla('kundens IP följer med', anrop[0]?.kund.ip === '9.9.9.9');
kolla('modellen uppmanas inte fråga om personnummer', /be aldrig om personnumret/i.test(text));

const kort = await hamtaBestallningskort('samtal-1', id);
kolla('kortet visar granskningens pris', kort?.sammanfattning.prisKr === 700 && kort.status === 'vantar');
kolla('kortet går inte att hämta från ett annat samtal', (await hamtaBestallningskort('samtal-2', id)) === null);

// 2. Rättbara fel stoppas innan bokningssystemet anropas
const fore = anrop.length;
kolla('utan villkor: nej', (await bekraftaBestallning('samtal-1', id, { personnummer: '198501011234', villkor: false, bindning: true }, KUND)).utfall === 'OGILTIGT_FORSLAG');
kolla('utan bindning: nej', (await bekraftaBestallning('samtal-1', id, { personnummer: '198501011234', villkor: true, bindning: false }, KUND)).utfall === 'OGILTIGT_FORSLAG');
kolla('trasigt personnummer: nej', (await bekraftaBestallning('samtal-1', id, { personnummer: '12', villkor: true, bindning: true }, KUND)).utfall === 'OGILTIGT_FORSLAG');
kolla('fel samtal: nej', (await bekraftaBestallning('samtal-2', id, { personnummer: '198501011234', villkor: true, bindning: true }, KUND)).utfall === 'OGILTIGT_FORSLAG');
kolla('inget anrop vid rättbara fel', anrop.length === fore);

// 3. Beställ
svar = () => ({ status: 200, data: { ok: true, bookingId: 'b1' } });
const klar = await bekraftaBestallning('samtal-1', id, { personnummer: '19850101-1234', villkor: true, bindning: true }, KUND);
kolla('beställningen går igenom', klar.utfall === 'SUCCESS' && /beställd/.test(klar.text), klar.text);
const boka = anrop[anrop.length - 1].kropp;
kolla('steg boka med hash, villkor och personnummer', boka.steg === 'boka' && boka.hash === 'h1' && boka.villkorGodkanda === true && boka.bindningGodkand === true && boka.personalNumber === '19850101-1234');
kolla('samma order som granskades', boka.discountCode === 'tretti' && boka.bindingMonths === 6 && boka.sqm === 70);
const igen = await bekraftaBestallning('samtal-1', id, { personnummer: '198501011234', villkor: true, bindning: true }, KUND);
kolla('ett andra tryck bokar inte igen', igen.utfall === 'SUCCESS' && anrop.length === fore + 1);
kolla('kortet visar Beställd', (await hamtaBestallningskort('samtal-1', id))?.status === 'klar');

// 4. Rabattkod som inte gäller
svar = () => ({ status: 422, data: { error: 'rabattkod', skal: 'requires_binding', message: 'Koden kräver 6 eller 12 månaders bindning.' } });
const kodtext = await forberedBestallning('samtal-3', { ...INDATA, bindningstid: 0 }, KUND);
kolla('ogiltig kod: bokningssystemets besked till modellen', /kräver 6 eller 12/.test(kodtext) && !/\[\[bekrafta/.test(kodtext), kodtext);

// 5. Upptagen tid vid granskning
svar = () => ({ status: 409, data: { error: 'tid_upptagen', tider: [{ date: '2026-10-23', time: '13:00' }] } });
const tidtext = await forberedBestallning('samtal-4', INDATA, KUND);
kolla('upptagen tid: nya tider', /fre 23\/10 13:00/.test(tidtext), tidtext);

// 6. Krock vid bokningen
svar = () => ({ status: 200, data: { ok: true, sammanfattning: SAMMANFATTNING, hash: 'h2' } });
const id2 = /\[\[bekrafta:(BE-[A-Z0-9]{8})\]\]/.exec(await forberedBestallning('samtal-5', INDATA, KUND))?.[1] ?? '';
svar = () => ({ status: 409, data: { error: 'tid_upptagen', tider: [] } });
const krock = await bekraftaBestallning('samtal-5', id2, { personnummer: '198501011234', villkor: true, bindning: true }, KUND);
kolla('krock: nya tider hämtas automatiskt', krock.utfall === 'TIDEN_UPPTAGEN' && Boolean(krock.fortsatt));

// 7. Inget svar alls – kan ha bokats, får aldrig försökas igen
svar = () => ({ status: 200, data: { ok: true, sammanfattning: SAMMANFATTNING, hash: 'h3' } });
const id3 = /\[\[bekrafta:(BE-[A-Z0-9]{8})\]\]/.exec(await forberedBestallning('samtal-6', INDATA, KUND))?.[1] ?? '';
svar = () => { throw new Error('timeout'); };
const tyst = await bekraftaBestallning('samtal-6', id3, { personnummer: '198501011234', villkor: true, bindning: true }, KUND);
kolla('inget svar: osäkert utfall, inget "klart"', tyst.utfall === 'EJ_VERIFIERAD' && !/Klart/.test(tyst.text));
kolla('inget svar: kortet låses', (await hamtaBestallningskort('samtal-6', id3))?.status === 'misslyckad');

// 8. Tjänster som inte beställs i chatten
kolla('fönsterputs hänvisas till länken', /forbered_bokning/.test(await forberedBestallning('samtal-7', { ...INDATA, tjanst: 'Fönsterputsning' }, KUND)));

console.log(fel ? `\n${fel} kontroller misslyckades` : '\nAlla kontroller gröna');
process.exit(fel ? 1 : 0);
