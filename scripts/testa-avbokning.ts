// Engångstest: avbokar ETT tillfälle på Mikaelas egen kund (15259) i riktiga
// TimeWave, långt fram i tiden, och kontrollerar att bara det tillfället
// försvann. Visar allt och frågar innan något skrivs.
//
//   STODONA_LOKAL=true bun scripts/testa-avbokning.ts   (lås och journal i minnet)
//
// Återställ efteråt i TimeWave (ångra avbokningen på tillfället som skrivs ut).

import { customerBookingActions } from '../api/_customerBookingActions';
import { bekraftaTillKund } from '../api/_kundbekraftelse';
import { datumText } from '../api/_bokningssystem';


const KUND = '15259';
const sys = customerBookingActions();
const fore = await sys.hamtaBokningar(KUND);
if (fore.length < 2) throw new Error('För få bokningar att testa på.');
const mal = fore[fore.length - 1];

console.log(`Kund ${KUND} har ${fore.length} kommande tillfällen:`);
for (const b of fore) console.log(`  ${b.id}  ${b.datum} ${b.start}–${b.slut}  ${b.stadare.namn}`);
console.log(`\nAvbokar det SISTA: ${mal.id}  ${mal.datum} ${mal.start}–${mal.slut}`);

const svar = prompt('Skriv JA för att avboka det tillfället i TimeWave:');
if (svar?.trim() !== 'JA') {
  console.log('Avbröt – ingenting ändrades.');
  process.exit(0);
}

const resultat = await sys.avbokaTillfalle!(mal);
console.log('\nResultat:', resultat);
console.log('Står som avbokat i TimeWave:', await sys.kontrolleraAvbokad!(mal));

const efter = await sys.hamtaBokningar(KUND);
const saknas = fore.filter((b) => !efter.some((e) => e.id === b.id)).map((b) => b.id);
console.log(`\nEfter: ${efter.length} tillfällen. Försvann: ${saknas.join(', ') || 'inget'}`);
console.log(saknas.length === 1 && saknas[0] === mal.id ? '✓ Bara det valda tillfället avbokades.' : '✗ AVVIKELSE – kontrollera i TimeWave!');

// Bekräftelse till kunden – samma väg som chatten (SMS, annars mejl).
if (resultat.ok === true && saknas.length === 1 && saknas[0] === mal.id) {
  const tid = `${datumText(mal.datum)} kl. ${mal.start}–${mal.slut}`;
  const kvitto = await bekraftaTillKund(
    sys,
    KUND,
    {
      sms: `Hej! Din städning ${tid} är avbokad. Dina övriga städningar är kvar som vanligt. Frågor? Hantera det enkelt i chatten på Stodona.se. Hälsningar Stodona`,
      amne: `Din städning ${datumText(mal.datum)} är avbokad`,
      mejl: `Hej!\n\nDin städning (${mal.tjanst}) ${tid} med ${mal.stadare.namn} är avbokad. Dina övriga städningar är kvar som vanligt.`,
    },
    'https://www.stodona.se',
    false
  );
  console.log('Bekräftelse till kunden:', kvitto);
}
