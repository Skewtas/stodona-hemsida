// Bekräftelse till kunden efter varje ändring i schemat som chatten gör.
//
// Mikaela 2026-09-25: "alla ändringar i schemat måste bekräftas med ett mail
// eller sms". SMS till mobilnumret i TimeWave i första hand; saknas det eller
// misslyckas utskicket går ett mejl till kundens e-postadress. Går ingetdera
// säger resultatet det tydligt, så att info@ kan kontakta kunden.

import { skickaSms } from './_smskod';
import type { Bokningssystem } from './_bokningssystem';

export interface KundBekraftelse {
  /** Hur kunden fick bekräftelsen – null betyder att kunden INTE fått någon. */
  kanal: 'sms' | 'mejl' | null;
  /** Rad till loggen och mejlet till info@. */
  logg: string;
}

function dolj(epost: string): string {
  const [namn, doman] = epost.split('@');
  return `${namn.slice(0, 2)}…@${doman}`;
}

export async function bekraftaTillKund(
  sys: Bokningssystem,
  kundId: string,
  innehall: { sms: string; amne: string; mejl: string },
  origin: string,
  testlage: boolean
): Promise<KundBekraftelse> {
  const mobil = sys.kundensMobil ? await sys.kundensMobil(kundId).catch(() => null) : null;
  let smsFel = 'inget giltigt mobilnummer i TimeWave';
  if (mobil) {
    if (testlage) return { kanal: 'sms', logg: `TESTLÄGE – SMS skickades inte: ${innehall.sms}` };
    const svar = await skickaSms(mobil, innehall.sms, origin);
    if (svar.ok === true) return { kanal: 'sms', logg: `SMS skickat till …${mobil.slice(-2)}` };
    smsFel = `SMS misslyckades (${svar.fel})`;
  }

  const epost = sys.kundensEpost ? await sys.kundensEpost(kundId).catch(() => null) : null;
  if (!epost) return { kanal: null, logg: `${smsFel}; ingen e-postadress – KUNDEN HAR INTE FÅTT NÅGON BEKRÄFTELSE` };
  if (testlage) return { kanal: 'mejl', logg: `${smsFel}; TESTLÄGE – mejl skickades inte: ${innehall.amne}` };
  try {
    const nyckel = process.env.RESEND_API_KEY;
    if (!nyckel) throw new Error('RESEND_API_KEY saknas');
    const svar = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${nyckel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Stodona <info@stodona.se>',
        to: epost,
        reply_to: 'info@stodona.se',
        subject: innehall.amne,
        text: `${innehall.mejl}\n\nFrågor? Svara på det här mejlet, eller skriv till oss via kundportalen stodona.twportal.se eller chatten på www.stodona.se.\n\nHälsningar\nStodona`,
      }),
    });
    if (!svar.ok) throw new Error(`Resend svarade ${svar.status}`);
    return { kanal: 'mejl', logg: `${smsFel}; mejl skickat till ${dolj(epost)}` };
  } catch (fel) {
    return { kanal: null, logg: `${smsFel}; mejlet misslyckades (${String(fel).slice(0, 100)}) – KUNDEN HAR INTE FÅTT NÅGON BEKRÄFTELSE` };
  }
}
