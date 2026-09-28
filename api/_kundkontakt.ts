// Kontaktuppgifter för en kund som identifierat sig i chatten (SMS-kod).
//
// När Camilla lämnar över till kundservice ska en identifierad kund aldrig
// behöva skriva sitt nummer eller sin mejl igen – de finns redan på kundkortet
// i TimeWave (Mikaela 2026-09-28, efter att en sjuk kund fick uppge sin mejl).

import { system, verifieradKund } from './_sjalvservice';

export async function kontaktForIdentifieradKund(samtalsId: string): Promise<{ telefon: string; epost: string; namn: string } | null> {
  const kund = await verifieradKund(samtalsId);
  if (!kund) return null;
  const sys = system(samtalsId);
  const [telefon, epost] = await Promise.all([
    sys.kundensMobil ? sys.kundensMobil(kund.kundId).catch(() => null) : null,
    sys.kundensEpost ? sys.kundensEpost(kund.kundId).catch(() => null) : null,
  ]);
  return { telefon: telefon ?? '', epost: epost ?? '', namn: kund.namn };
}
