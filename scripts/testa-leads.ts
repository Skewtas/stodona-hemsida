// Test av leadhanteringen (Camilla 2.0, kriterium D): 20 simulerade leads med
// alla stoppregler. Kör i minnet – inga SMS skickas och TimeWave rörs inte.
//
//   STODONA_LOKAL=true bun scripts/testa-leads.ts

import { skapaLead, noteraPris, noteraAktivitet, sattStatus, sattPaus, avregistrera, hamtaLead, korUppfoljningar, smsText, dagtid, type Lead } from '../api/_leads';

const TIMME = 3600_000;
// Måndag 2026-10-12 kl. 10:00 svensk tid (UTC+2).
const T0 = Date.UTC(2026, 9, 12, 8, 0, 0);
const skickade: { mobil: string; text: string; nu: number }[] = [];
const kunder = new Set<string>();
let felKontroll = new Set<string>();

const kor = (nu: number) =>
  korUppfoljningar({
    nu,
    bas: 'https://www.stodona.se',
    skicka: async (mobil, text) => { skickade.push({ mobil, text, nu }); return { ok: true }; },
    arKund: async (mobil) => { if (felKontroll.has(mobil)) throw new Error('TimeWave nere'); return kunder.has(mobil); },
  });

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const mob = (n: number) => `+4670${String(1000000 + n)}`;
async function lead(n: number, extra: Partial<{ samtycke: boolean; fornamn: string; tjanst: string }> = {}) {
  await skapaLead(id(n), { kanal: 'webbchatten', fornamn: extra.fornamn ?? `Test${n}`, telefon: mob(n), epost: `t${n}@example.com`, tjanst: extra.tjanst ?? 'Hemstädning', kvm: '80', behov: 'pris', samtycke: extra.samtycke ?? true }, T0);
  await noteraPris(id(n), { prisKr: 1255, tjanst: extra.tjanst ?? 'Hemstädning', kvm: '80' }, T0);
}
const antal = (n: number) => skickade.filter((s) => s.mobil === mob(n)).length;
let ok = 0, fel = 0;
function kolla(namn: string, villkor: boolean, info = '') { villkor ? ok++ : fel++; console.log(`${villkor ? '✓' : '✗'} ${namn}${info ? ' – ' + info : ''}`); }

// 20 leads med olika öden.
for (let n = 1; n <= 20; n++) await lead(n, n === 11 ? { samtycke: false } : n === 12 ? { tjanst: 'Flyttstädning' } : {});

// Före 24 h: inget skickas.
await kor(T0 + 23 * TIMME);
kolla('Inget skickas före 24 timmar', skickade.length === 0);

// Stoppregler som inträffar före första utskicket.
kunder.add(mob(2));                                             // 2: har bokat
await sattStatus(id(3), 'nej', 'kunden tackade nej', T0 + TIMME); // 3: nej
const l4 = (await hamtaLead(id(4))) as Lead;
await avregistrera(l4.kod, T0 + TIMME);                          // 4: avregistrerad
await sattStatus(id(5), 'overlamnad', 'klagomål', T0 + TIMME);   // 5: överlämnat klagomål
await sattPaus(id(6), true, 'Ella', T0 + TIMME);                 // 6: pausad av personal
await sattStatus(id(7), 'nej', 'stoppad av personalen', T0 + TIMME); // 7: stoppad av personal
felKontroll.add(mob(8));                                         // 8: bokningskollen misslyckas
await noteraAktivitet(id(9), T0 + 20 * TIMME);                   // 9: skrev i chatten igen efter 20 h

// Natt: 24 h + men kl. 03 → inget.
const natt = Date.UTC(2026, 9, 13, 1, 0, 0);
kolla('Kl. 03 räknas inte som dagtid', !dagtid(natt));
await kor(natt + 0);
kolla('Inget skickas på natten', skickade.length === 0);

// Dag 2 kl. 10:30 – första uppföljningen.
const D1 = T0 + 24.5 * TIMME;
const k1 = await kor(D1);
kolla('Uppföljning 1 går till leads utan stopp', antal(1) === 1 && antal(10) === 1 && antal(20) === 1);
kolla('Bokad kund får inget', antal(2) === 0 && (await hamtaLead(id(2)))!.status === 'bokad');
kolla('Nej stoppar', antal(3) === 0);
kolla('Avregistrering stoppar', antal(4) === 0 && (await hamtaLead(id(4)))!.status === 'avregistrerad');
kolla('Överlämnat klagomål stoppar', antal(5) === 0);
kolla('Pausad av personal får inget', antal(6) === 0);
kolla('Stoppad av personal får inget', antal(7) === 0);
kolla('Misslyckad bokningskoll skjuter upp i stället för att skicka', antal(8) === 0 && k1.uppskjutna.includes(id(8)));
kolla('Ny aktivitet i chatten skjuter fram uppföljningen', antal(9) === 0);
kolla('Utan samtycke skickas inget', antal(11) === 0);
kolla('Flyttkund får ingen provstädningstext', !skickade.find((s) => s.mobil === mob(12))!.text.includes('15 %'));
kolla('Hemstädkund får provstädningstexten och priset', skickade.find((s) => s.mobil === mob(1))!.text.includes('15 %') && skickade.find((s) => s.mobil === mob(1))!.text.includes('1255 kr'));
kolla('Varje SMS har avregistreringslänk', skickade.every((s) => /\/sms-stopp\/[a-z0-9]{8}$/.test(s.text)));
kolla('Varje SMS säger att det är Stodonas digitala assistent eller Camilla, Stodona', skickade.every((s) => /Camilla/.test(s.text) && /Stodona/.test(s.text)));

// Samma körning en gång till direkt: inga dubbletter.
const fore = skickade.length;
await kor(D1 + 60_000); await kor(D1 + 120_000);
kolla('Inga dubbla utskick vid upprepade körningar', skickade.length === fore, `${skickade.length} SMS`);

// 8: kollen fungerar igen en timme senare; 6: återupptas; 9: 24 h efter sin aktivitet.
felKontroll = new Set();
await sattPaus(id(6), false, 'Ella', D1);
await kor(D1 + 2 * TIMME);
kolla('Uppskjutet lead får sitt SMS när kollen fungerar', antal(8) === 1);
kolla('Återupptaget lead får sitt SMS', antal(6) === 1);
await kor(T0 + 43 * TIMME); // kl. 05 – för tidigt
kolla("Lead med ny aktivitet får inget före sina 24 h", antal(9) === 0);
await kor(T0 + 48 * TIMME); // onsdag kl. 10
kolla('Lead med ny aktivitet får SMS 24 h efter aktiviteten', antal(9) === 1);

// Efter uppföljning 1: kund 13 bokar, kund 14 tackar nej, kund 15 avregistrerar sig.
kunder.add(mob(13));
await sattStatus(id(14), 'nej', 'kunden tackade nej', D1 + TIMME);
await avregistrera((await hamtaLead(id(15)))!.kod, D1 + TIMME);

// Dag 4 (72 h) – andra uppföljningen.
await kor(T0 + 72.5 * TIMME);
kolla('Uppföljning 2 går efter 3 dagar', antal(1) === 2 && antal(20) === 2);
kolla('Bokning mellan utskicken stoppar sekvensen', antal(13) === 1 && (await hamtaLead(id(13)))!.status === 'bokad');
kolla('Nej mellan utskicken stoppar', antal(14) === 1);
kolla('Avregistrering mellan utskicken stoppar', antal(15) === 1);

// Dag 8 (168 h) – tredje och sista.
await kor(T0 + 168.5 * TIMME);
kolla('Uppföljning 3 går efter 7 dagar', antal(1) === 3);
const l1 = (await hamtaLead(id(1))) as Lead;
kolla('Efter tre SMS är sekvensen avslutad', l1.status === 'klar' && l1.nasta === null);
await kor(T0 + 400 * TIMME);
kolla('Aldrig fler än tre SMS per lead', Math.max(...Array.from({ length: 20 }, (_, i) => antal(i + 1))) === 3);
kolla('En avregistrering kan inte skrivas över', (await sattStatus(id(4), 'pris', 'försök'))!.status === 'avregistrerad');
kolla('Alla 20 leads har status', (await Promise.all(Array.from({ length: 20 }, (_, i) => hamtaLead(id(i + 1))))).every((l) => l && l.status));

console.log(`\n${ok} godkända, ${fel} underkända · ${skickade.length} simulerade SMS`);
console.log('\nExempel på SMS 1:\n' + smsText(l1, 1, 'https://www.stodona.se'));
console.log(`(${smsText(l1, 1, 'https://www.stodona.se').length} tecken)`);
process.exit(fel ? 1 : 0);
