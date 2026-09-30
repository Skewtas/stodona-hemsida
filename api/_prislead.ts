// Kontaktuppgifter innan priset (Mikaela 2026-09-30).
//
// När någon frågar om pris eller visar intresse i chatten ska Camilla få
// mobilnummer OCH e-post innan hon ger ett pris, så att vi kan följa upp den
// som inte bokar. Uppgifterna sparas på samtalet (då får kunden priser resten
// av samtalet) och mejlas direkt till PRISLEAD_TILL
// (standard mikaela.wigert@stodona.se). Varje lead sparas också i en lista i
// KV, så att de kan visas någon annanstans senare.

import * as lagring from './_lagring';

const LOKAL = process.env.STODONA_LOKAL === 'true';
const TILL = process.env.PRISLEAD_TILL || 'mikaela.wigert@stodona.se';
const KONTAKT_TTL = 30 * 24 * 3600;
export const PRISLEAD_LISTA = 'chat:prisleads';

export interface Prislead {
  tid: string;
  samtalsId: string;
  kanal: string;
  fornamn: string;
  telefon: string;
  epost: string;
  tjanst: string;
  kvm: string;
  behov: string;
}

/** Har besökaren redan lämnat mobilnummer och e-post i det här samtalet? */
export async function harKontakt(samtalsId: string): Promise<boolean> {
  return (await lagring.hamta<Prislead>(`chat:kontakt:${samtalsId}`).catch(() => null)) !== null;
}

async function mejla(lead: Prislead): Promise<string> {
  const amne = `Prisförfrågan i chatten – ${lead.fornamn || lead.epost} (${lead.tjanst || 'tjänst ej angiven'})`;
  const text = [
    'Ny besökare i chatten har lämnat kontaktuppgifter för att få pris. Följ upp om hen inte bokar.',
    '',
    `Namn: ${lead.fornamn || '–'}`,
    `Mobil: ${lead.telefon}`,
    `E-post: ${lead.epost}`,
    `Tjänst: ${lead.tjanst || '–'}`,
    `Storlek: ${lead.kvm ? `${lead.kvm} kvm` : '–'}`,
    `Vad hen frågade om: ${lead.behov || '–'}`,
    `Kanal: ${lead.kanal}`,
    `Tid: ${new Date(lead.tid).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}`,
    `Samtal: ${lead.samtalsId}`,
  ].join('\n');
  if (LOKAL) {
    console.log(`\n[lokal chat] prislead mejlas INTE i testmiljön (till ${TILL}):\n${amne}\n${text}\n`);
    return 'lokalt – inte mejlat';
  }
  const nyckel = process.env.RESEND_API_KEY;
  if (!nyckel) throw new Error('RESEND_API_KEY saknas');
  const svar = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${nyckel}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Stodona Chatten <info@stodona.se>', to: TILL, reply_to: lead.epost, subject: amne, text }),
  });
  if (!svar.ok) throw new Error(`Resend svarade ${svar.status}`);
  return `mejlat till ${TILL}`;
}

/**
 * Sparar kontaktuppgifterna och mejlar dem. Svaret är text till Camilla.
 * Samma samtal mejlas bara en gång – kompletteras uppgifterna sparas de, men
 * inget nytt mejl går iväg.
 */
export async function sparaKontakt(samtalsId: string, lead: Omit<Prislead, 'tid' | 'samtalsId'>): Promise<string> {
  const nyckel = `chat:kontakt:${samtalsId}`;
  const tidigare = await lagring.hamta<Prislead>(nyckel).catch(() => null);
  const post: Prislead = { ...lead, tid: new Date().toISOString(), samtalsId };
  await lagring.spara(nyckel, post, KONTAKT_TTL);
  if (!tidigare) {
    await lagring.laggTillILista(PRISLEAD_LISTA, post, 5000).catch((fel) => console.error('prislead: listan kunde inte sparas', fel));
    await mejla(post).catch((fel) => console.error('prislead: mejlet gick inte iväg', fel));
  }
  return 'Sparat. Tacka kort och ge nu priset direkt med berakna_pris – kunden ska inte behöva fråga igen. Upprepa inte numret eller mejlen.';
}
