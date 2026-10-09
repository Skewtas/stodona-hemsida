// Byter städare på ETT tillfälle med PUT /missions/bookinglines/{id} (samma
// tid), läser tillbaka och skickar bekräftelse till kunden bara om det stämmer.
//
//   STODONA_LOKAL=true bun scripts/byt-stadare.ts <missionId> <kundnummer> <datum> <nyAnstalldId>
//
// 2026-09-25: avvikelsen (POST /missions/deviations) bytte inte städare, varken
// med ny anställd i employee_id eller i employee. Det här provar det andra
// dokumenterade anropet för bokningsrader.

import { twGetAlla } from '../api/_timewave';
import { timewaveSystem } from '../api/_timewaveSystem';
import { bekraftaTillKund } from '../api/_kundbekraftelse';
import { datumText } from '../api/_bokningssystem';

const BAS = process.env.TIMEWAVE_BASE_URL || 'https://api.timewave.se/v3';
const [mission, kund, datum, ny] = process.argv.slice(2);
if (!mission || !kund || !/^\d{4}-\d{2}-\d{2}$/.test(datum ?? '') || !ny) throw new Error('Användning: <missionId> <kundnummer> <datum> <nyAnstalldId>');

const rad = async () => {
  const rows = await twGetAlla<any>(`/missions?filter[id]=${mission}&filter[startdate]=${datum}&filter[enddate]=${datum}`);
  const m = rows.find((x) => String(x.id) === mission && String(x.client?.number) === kund);
  return m?.employees?.find((e: any) => e.startdate === datum && !e.cancelled) ?? null;
};

const fore = await rad();
if (!fore) throw new Error('Hittade inget aktivt tillfälle för uppdraget, kunden och dagen.');
const start = String(fore.starttime).slice(0, 5);
const slut = String(fore.endtime).slice(0, 5);
console.log(`Kund ${kund}, uppdrag ${mission}, rad ${fore.bookingline_id}: ${datum} ${start}–${slut}, nu ${fore.name} (${fore.id})`);
if (String(fore.id) === ny) throw new Error('Den anställda står redan på tillfället.');
if (prompt(`Skriv JA för att sätta anställd ${ny} på raden i TimeWave:`)?.trim() !== 'JA') {
  console.log('Avbröt – ingenting ändrades.');
  process.exit(0);
}

const form = new FormData();
form.append('client_id', process.env.TIMEWAVE_CLIENT_ID ?? '');
form.append('client_secret', process.env.TIMEWAVE_API_KEY ?? '');
form.append('grant_type', 'client_credentials');
const token = ((await (await fetch(`${BAS}/oauth/token`, { method: 'POST', body: form })).json()) as { access_token: string }).access_token;

const kropp = { startdate: datum, starttime: start, endtime: slut, employee: Number(ny) };
console.log(`PUT /missions/bookinglines/${fore.bookingline_id}`, JSON.stringify(kropp));
const svar = await fetch(`${BAS}/missions/bookinglines/${fore.bookingline_id}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify(kropp),
});
console.log('Svar:', svar.status, (await svar.text()).slice(0, 300));

const efter = await rad();
console.log('Efter:', efter ? `${efter.startdate} ${efter.starttime}–${efter.endtime}, ${efter.name} (${efter.id})` : 'saknas');
if (!efter || String(efter.id) !== ny || efter.startdate !== datum || String(efter.starttime).slice(0, 5) !== start) {
  console.log('✗ Städaren byttes INTE – ingen bekräftelse skickad.');
  process.exit(1);
}
console.log('✓ Städaren är bytt.');

const tid = `${datumText(datum)} kl. ${start}–${slut}`;
const fornamn = String(efter.name).split(' ')[0];
const kvitto = await bekraftaTillKund(
  timewaveSystem(),
  kund,
  {
    sms: `Hej! Din städning är ombokad till ${tid} med ${fornamn}. Frågor? Hantera det enkelt i chatten på Stodona.se. Hälsningar Stodona`,
    amne: `Din städning är ombokad till ${tid}`,
    mejl: `Hej!\n\nDin städning är ombokad till ${tid} med ${fornamn}.`,
  },
  'https://www.stodona.se',
  false
);
console.log('Bekräftelse till kunden:', kvitto);
