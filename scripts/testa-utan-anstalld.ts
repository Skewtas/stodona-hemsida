// Engångstest av förtursregelns skrivsteg mot riktiga TimeWave, på Mikaelas egen
// bokning: sätter tillfället till "Utan anställd", kontrollerar, och lägger
// tillbaka städaren. Samma funktioner som chatten använder.
//
//   STODONA_LOKAL=true bun scripts/testa-utan-anstalld.ts <missionId> <bokningsrad> <datum>

import { timewaveSystem } from '../api/_timewaveSystem';

const [mission, rad, datum] = process.argv.slice(2);
if (!mission || !rad || !/^\d{4}-\d{2}-\d{2}$/.test(datum ?? '')) throw new Error('Användning: <missionId> <bokningsrad> <datum>');
const id = `M${mission}-B${rad}@${datum}`;
const sys = timewaveSystem();

const fore = await sys.anstalldPa(id);
console.log(`Före: anställd på ${id}: ${fore}`);
if (!fore) throw new Error('Tillfället hittades inte eller saknar redan städare – avbryter.');

if (prompt('Skriv JA för att sätta Utan anställd och sedan lägga tillbaka städaren:')?.trim() !== 'JA') {
  console.log('Avbröt – ingenting ändrades.');
  process.exit(0);
}

console.log('Lossar:', await sys.lossaAnstalld(id));
const utan = await sys.anstalldPa(id);
console.log(`Efter lossning: ${utan === null ? 'Utan anställd ✓' : `fortfarande ${utan} ✗`}`);

console.log('Lägger tillbaka:', await sys.atertilldela(id, { id: fore, namn: '' }));
const efter = await sys.anstalldPa(id);
console.log(`Efter återställning: ${efter}`);
console.log(utan === null && efter === fore ? '✓ Utan anställd fungerar, och städaren är tillbaka.' : '✗ AVVIKELSE – kontrollera tillfället i TimeWave!');
