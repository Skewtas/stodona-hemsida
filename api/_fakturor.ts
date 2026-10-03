// Fakturainformation i chatten för den legitimerade kunden (SMS-kod).
//
// Läser kundens senaste fakturor ur bokningssystemet (TimeWave /invoices,
// filtrerat på kunden och kontrollerat en gång till) med fakturarader, OCR och
// bankgiro – allt kunden annars letar upp i kundportalen. Chatten hänvisar
// aldrig dit (Mikaela 2026-10-03). Den ändrar aldrig något på en faktura –
// frågor om belopp, avgifter eller krediteringar går till kundservice.

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

/** Vad fakturan gäller: tjänst, utförandedag, timmar och belopp före RUT. */
function innehall(f: Faktura, idag: string): string {
  if (!f.rader.length) return '';
  const rader = f.rader.map((r) => {
    const timmar = /^\d{2}:\d{2}$/.test(r.timmar) && r.timmar !== '00:00' ? `, ${Number(r.timmar.slice(0, 2)) + Number(r.timmar.slice(3)) / 60} tim`.replace('.', ',') : '';
    return `${r.tjanst}${r.datum ? ` ${dag(r.datum, idag)}` : ''}${timmar}, ${kr(Math.abs(r.beloppKr))} före RUT${r.beskrivning ? ` (${r.beskrivning})` : ''}`;
  });
  return ` · avser: ${rader.join('; ')}`;
}

function rad(f: Faktura, idag: string): string {
  if (f.kreditfaktura) {
    return `Kreditfaktura ${f.nummer} · ${dag(f.datum, idag)} · kreditering ${kr(Math.abs(f.beloppKr))} (ett avdrag – kunden ska inte betala något)${innehall(f, idag)}`;
  }
  const status = f.betald
    ? `betald${f.betaldDatum ? ` ${dag(f.betaldDatum, idag)}` : ''}`
    : f.forfallodatum && f.forfallodatum < idag
      ? `OBETALD – FÖRFALLEN ${dag(f.forfallodatum, idag)}`
      : `obetald – förfaller ${dag(f.forfallodatum, idag)}`;
  // OCR och bankgiro står med även på betalda fakturor – kunden kan fråga efter dem.
  const betala = f.ocr && f.bankgiro ? ` · bankgiro ${f.bankgiro}, OCR ${f.ocr}${f.betald ? ' (redan betald – ska inte betalas igen)' : ''}` : '';
  return `Faktura ${f.nummer} · fakturerad ${dag(f.datum, idag)} · att betala ${kr(f.beloppKr)}${f.rutKr > 0 ? ` (efter RUT-avdrag ${kr(f.rutKr)})` : ''} · ${status}${betala}${innehall(f, idag)}`;
}

/** Verktyget hamta_fakturor: kundens senaste fakturor, som text till Camilla. */
export async function hamtaFakturor(samtalsId: string): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return EJ_LEGITIMERAD;
  const sys = SYSTEM === 'timewave' ? timewaveSystem() : testsystem(samtalsId);
  if (!sys.hamtaFakturor) return 'Fakturorna går inte att visa i chatten just nu. Säg det och erbjud att kundservice mejlar uppgifterna (eskalera_till_kundservice). Hänvisa inte till kundportalen.';

  let fakturor: Faktura[];
  try {
    fakturor = await sys.hamtaFakturor(kund.kundId);
  } catch (fel) {
    console.error('fakturor: kunde inte hämtas', fel);
    return 'Fakturorna gick inte att hämta just nu. Säg det och erbjud att försöka igen om en stund, eller att kundservice mejlar uppgifterna (eskalera_till_kundservice). Hänvisa inte till kundportalen.';
  }
  if (!fakturor.length) return `Identifierad kund: ${kund.namn}. Kunden har inga fakturor hos oss.`;

  const idag = idagSthlm();
  return [
    `Identifierad kund: ${kund.namn} (kundnummer ${kund.kundId}). Senaste fakturorna, nyast först:`,
    ...fakturor.map((f) => rad(f, idag)),
    'Frågar kunden om en viss uppgift (t.ex. OCR eller om den är betald): svara på just det. Ber kunden om "fakturan", "en kopia" eller "fakturainformation": ge ALL information om den fakturan direkt – fakturanummer, fakturadatum, vad den avser (raderna), belopp att betala, RUT-avdrag, förfallodag, om den är betald, bankgiro och OCR – och fråga sedan om det räcker eller om kunden vill ha själva fakturan som PDF. Skriv belopp, datum, bankgiro och OCR exakt som ovan; hitta aldrig på eller räkna om något.',
    'Vill kunden ändå ha fakturan som PDF: säg att du lägger ett ärende så mejlar kundservice den, och lämna över med eskalera_till_kundservice (ange fakturanumret) – kunden behöver inte uppge mejl. Säg ALDRIG att du "inte kan", och nämn aldrig system, API eller tekniska skäl. Hänvisa inte till kundportalen. E-faktura: stodona.se/e-faktura.',
    'Frågor om ett belopp, en avgift, en kreditering eller en betalning som inte syns: säg att kundservice kontrollerar det och lämna över med eskalera_till_kundservice. Lova aldrig att något ändras.',
  ].join('\n');
}
