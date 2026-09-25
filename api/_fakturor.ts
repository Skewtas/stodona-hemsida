// Fakturainformation i chatten för den legitimerade kunden (SMS-kod).
//
// Läser kundens senaste fakturor ur bokningssystemet (TimeWave /invoices,
// filtrerat på kunden och kontrollerat en gång till). Chatten ändrar aldrig
// något på en faktura – frågor om belopp, avgifter eller krediteringar går
// till kundservice.

import { verifieradKund } from './_sjalvservice';
import { timewaveSystem } from './_timewaveSystem';
import { testsystem } from './_testBokningssystem';
import { timewaveKonfigurerad } from './_timewave';
import { datumText, idagSthlm, type Faktura } from './_bokningssystem';

const SYSTEM = process.env.SJALVSERVICE_SYSTEM === 'timewave' && timewaveKonfigurerad() ? 'timewave' : 'test';

const EJ_LEGITIMERAD =
  'Kunden är INTE identifierad, eller så har identifieringen gått ut. Visa inga fakturor och bekräfta ingenting om något konto. Be kunden identifiera sig och avsluta meddelandet med raden [[bankid]]. Du minns vad kunden ville – be inte kunden upprepa det.';

function kr(belopp: number): string {
  return `${belopp.toLocaleString('sv-SE')} kr`;
}

/** "23 september" – med årtal om det inte är i år. */
function dag(datum: string, idag: string): string {
  return datum.slice(0, 4) === idag.slice(0, 4) ? datumText(datum) : `${datumText(datum)} ${datum.slice(0, 4)}`;
}

function rad(f: Faktura, idag: string): string {
  if (f.kreditfaktura) {
    return `Kreditfaktura ${f.nummer} · ${dag(f.datum, idag)} · kreditering ${kr(Math.abs(f.beloppKr))} (ett avdrag – kunden ska inte betala något)`;
  }
  const status = f.betald
    ? `betald${f.betaldDatum ? ` ${dag(f.betaldDatum, idag)}` : ''}`
    : f.forfallodatum && f.forfallodatum < idag
      ? `OBETALD – FÖRFALLEN ${dag(f.forfallodatum, idag)}`
      : `obetald – förfaller ${dag(f.forfallodatum, idag)}`;
  const betala = !f.betald && f.ocr && f.bankgiro ? ` · betalas till bankgiro ${f.bankgiro} med OCR ${f.ocr}` : '';
  return `Faktura ${f.nummer} · fakturerad ${dag(f.datum, idag)} · att betala ${kr(f.beloppKr)}${f.rutKr > 0 ? ` (efter RUT-avdrag ${kr(f.rutKr)})` : ''} · ${status}${betala}`;
}

/** Verktyget hamta_fakturor: kundens senaste fakturor, som text till Camilla. */
export async function hamtaFakturor(samtalsId: string): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;
  const sys = SYSTEM === 'timewave' ? timewaveSystem() : testsystem(samtalsId);
  if (!sys.hamtaFakturor) return 'Fakturorna går inte att visa i chatten just nu. Hänvisa till kundportalen stodona.twportal.se.';

  let fakturor: Faktura[];
  try {
    fakturor = await sys.hamtaFakturor(kund.kundId);
  } catch (fel) {
    console.error('fakturor: kunde inte hämtas', fel);
    return 'Fakturorna gick inte att hämta just nu. Säg det och hänvisa till kundportalen stodona.twportal.se, där alla fakturor finns.';
  }
  if (!fakturor.length) return `Identifierad kund: ${kund.namn}. Kunden har inga fakturor hos oss.`;

  const idag = idagSthlm();
  return [
    `Identifierad kund: ${kund.namn}. Senaste fakturorna, nyast först:`,
    ...fakturor.map((f) => rad(f, idag)),
    'Svara bara på det kunden frågar om – oftast den senaste eller en obetald faktura. Skriv belopp, datum, bankgiro och OCR exakt som ovan; hitta aldrig på eller räkna om något.',
    'Kopia på fakturan (PDF) finns i kundportalen stodona.twportal.se. E-faktura: stodona.se/e-faktura.',
    'Frågor om ett belopp, en avgift, en kreditering eller en betalning som inte syns: säg att kundservice kontrollerar det och lämna över med eskalera_till_kundservice. Lova aldrig att något ändras.',
  ].join('\n');
}
