// Utförda städningar i chatten för den identifierade kunden – det kunden
// annars ser i kundportalen (Mikaela 2026-10-03: hänvisa aldrig dit).

import { system, verifieradKund } from './_sjalvservice';
import { datumText, idagSthlm } from './_bokningssystem';

/** Verktyget hamta_utforda_stadningar: kundens senaste städningar, som text till Camilla. */
export async function hamtaUtforda(samtalsId: string): Promise<string> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) {
    return 'Kunden är INTE identifierad, eller så har identifieringen gått ut. Visa ingenting. Be kunden identifiera sig och avsluta meddelandet med raden [[bankid]].';
  }
  const sys = system(samtalsId);
  if (!sys.hamtaUtforda) return 'Utförda städningar går inte att visa i chatten just nu. Säg det och erbjud att kundservice återkommer med uppgifterna.';
  try {
    const lista = await sys.hamtaUtforda(kund.kundId);
    if (!lista.length) return `Identifierad kund: ${kund.namn}. Inga utförda städningar de senaste fyra månaderna.`;
    const iar = idagSthlm().slice(0, 4);
    return [
      `Identifierad kund: ${kund.namn}. Senast utförda städningar, nyast först:`,
      ...lista.map((u) => `${datumText(u.datum)}${u.datum.slice(0, 4) === iar ? '' : ` ${u.datum.slice(0, 4)}`} kl. ${u.start}–${u.slut} · ${u.tjanst}${u.stadare ? ` · ${u.stadare}` : ''}`),
      'Svara bara på det kunden frågar om. Gäller frågan något som gick fel vid en städning: beklaga, lyft nöjd-kund-garantin och lämna över till kundservice.',
    ].join('\n');
  } catch (fel) {
    console.error('utforda: kunde inte hämtas', fel);
    return 'Utförda städningar gick inte att hämta just nu. Säg det och erbjud att försöka igen om en stund.';
  }
}
