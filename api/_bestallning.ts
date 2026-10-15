// Beställning av städning direkt i chatten – samma säkra väg som ombokningen:
//
//  1. forberedBestallning (verktyg): skickar beställningen till
//     boka.stodona.se/api/chat-book steg "granska". Där kontrolleras
//     rabattkoden, priset räknas med formulärets egen prismotor och tiden
//     kontrolleras mot schemat. Ingenting bokas.
//  2. Kortet i chatten visar sammanfattningen ur granskningen – aldrig
//     modellens text. Kunden fyller i personnummer för RUT-avdraget I KORTET
//     (det går direkt till bokningssystemet och syns aldrig i samtalet eller
//     för modellen), kryssar i villkoren och trycker Beställ.
//  3. bekraftaBestallning: bara från knappen. Steg "boka" i chat-book skapar
//     bokningen genom /api/book – samma väg som formuläret: tiden låses,
//     bekräftelsemejlet går ut och bokningen synkas till TimeWave.
//
// Fönsterputsning och företagsstädning bokas fortfarande i formuläret
// (forbered_bokning ger länken). CHATT_BESTALLNING=av stänger av allt här.

import * as lagring from './_lagring';
import { regelFor } from './_avbokningsregler';
import { datumText } from './_bokningssystem';
import { slumpId, type Bekraftelse } from './_sjalvservice';

export const BESTALLNING_PA = process.env.CHATT_BESTALLNING !== 'av';
export const BESTALLNING_ID = /^BE-[A-Z0-9]{8}$/;
export const BESTALLNING_TJANSTER = ['Hemstädning', 'Storstädning', 'Flyttstädning', 'Byggstädning'];
/** Så länge kortet går att bekräfta. Sedan räknas pris och tid om. */
const GILTIG_MINUTER = 20;
const BOKNING_BAS = (process.env.BOKNING_BAS || 'https://boka.stodona.se').replace(/\/+$/, '');

const FREKVENSER = ['Engång', 'Varje vecka', 'Varannan vecka', 'Var tredje vecka', 'Var fjärde vecka'];
const NYCKELHANTERING = [
  'Jag är hemma och öppnar',
  'Jag lämnar nyckel på kontoret i Solna',
  'Annat sätt (beskriv i rutan ovan)',
];

function rent(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

/** Det granskningen i bokningssystemet svarar med – det kunden godkänner. */
interface Sammanfattning {
  tjanst: string;
  kvm: number;
  frekvens: string;
  bindningManader: number;
  tillval: string[];
  datum: string;
  tid: string;
  adress: string;
  namn: string;
  epost: string;
  telefon: string;
  nyckel: string;
  rabattkod: string | null;
  rabattProcent: number;
  rabattProcentDarefter: number | null;
  prisKr: number;
  prisForeRutKr: number | null;
  prisDarefterKr: number | null;
  villkor: string;
}

interface Bestallning {
  id: string;
  samtalsId: string;
  /** Exakt det som skickades till granskningen – skickas likadant vid bokningen. */
  order: Record<string, unknown>;
  sammanfattning: Sammanfattning;
  hash: string;
  skapad: number;
  status: 'vantar' | 'klar' | 'misslyckad';
}

type ChatBookSvar = {
  status: number;
  data: {
    ok?: boolean;
    error?: string;
    skal?: string;
    message?: string;
    sammanfattning?: Sammanfattning;
    hash?: string;
    tider?: { date: string; time: string }[];
    bookingId?: string;
  };
};

/** Anropet till boka.stodona.se. Utbytbart i test. */
export let anropaChatBook = async (kropp: Record<string, unknown>, kund: { ip: string; ua: string }): Promise<ChatBookSvar> => {
  const hemlighet = process.env.CHAT_DRAFT_SECRET;
  if (!hemlighet) throw new Error('CHAT_DRAFT_SECRET saknas');
  const svar = await fetch(`${BOKNING_BAS}/api/chat-book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-chat-secret': hemlighet,
      'x-chat-client-ip': kund.ip,
      'x-chat-user-agent': kund.ua,
    },
    body: JSON.stringify(kropp),
    // Bokningen synkar mot TimeWave och skickar mejl – ge den tid.
    signal: AbortSignal.timeout(kropp.steg === 'boka' ? 45000 : 20000),
  });
  return { status: svar.status, data: await svar.json().catch(() => ({})) };
};
export function sattChatBook(f: typeof anropaChatBook): void {
  anropaChatBook = f;
}

const veckodag = (d: string) => ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'][new Date(`${d}T12:00:00Z`).getUTCDay()];
const kortDag = (d: string) => `${veckodag(d)} ${Number(d.slice(8))}/${Number(d.slice(5, 7))}`;

const FEL_TILL_MODELLEN: Record<string, string> = {
  tjanst_ej_i_chatten: 'Den tjänsten går inte att beställa i chatten. Använd forbered_bokning så får kunden en förifylld länk.',
  ogiltig_yta: 'Ytan ser inte rätt ut. Fråga kunden hur många kvadratmeter bostaden är.',
  ogiltig_bindning: 'Bindningstiden måste vara 0, 3, 6 eller 12 månader. Fråga kunden.',
  ogiltigt_tillval: 'Ett av tillvalen finns inte för den tjänsten. Fråga kunden igen och använd bara tillvalen i verktygets lista.',
  ogiltigt_datum: 'Datumet ser inte rätt ut. Hämta tider med visa_lediga_tider.',
  datum_for_tidigt: 'Tidigaste dag att beställa är i morgon. Hämta tider med visa_lediga_tider.',
  ogiltig_tid: 'Klockslaget ser inte rätt ut. Hämta tider med visa_lediga_tider.',
  namn_saknas: 'Både för- och efternamn behövs. Fråga efter det som saknas.',
  ogiltig_epost: 'E-postadressen ser inte giltig ut. Be kunden om den igen.',
  ogiltig_telefon: 'Telefonnumret ser inte giltigt ut. Be kunden om det igen.',
  ofullstandig_adress: 'Adressen är ofullständig. Be om gatuadress, postnummer och ort – en sak i taget.',
  nyckelhantering_saknas: 'Fråga hur vi kommer in: [[val: Jag är hemma och öppnar | Jag lämnar nyckel på kontoret | Annat sätt]]',
};

// ─── Verktyg: förbered beställning ───────────────────────────────────────────

export async function forberedBestallning(
  samtalsId: string,
  indata: Record<string, unknown>,
  kund: { ip: string; ua: string }
): Promise<string> {
  const tjanst = BESTALLNING_TJANSTER.find((t) => t.toLowerCase() === rent(indata.tjanst, 40).toLowerCase());
  if (!tjanst) return FEL_TILL_MODELLEN.tjanst_ej_i_chatten;

  const onskadNyckel = rent(indata.nyckelhantering, 80).toLowerCase().replace('i sundbyberg', 'i solna');
  const nyckel = onskadNyckel
    ? NYCKELHANTERING.find((k) => k.toLowerCase() === onskadNyckel) ?? NYCKELHANTERING.find((k) => k.toLowerCase().startsWith(onskadNyckel))
    : undefined;
  const frekvens = FREKVENSER.find((f) => f.toLowerCase() === rent(indata.frekvens, 30).toLowerCase()) ?? 'Engång';

  const order: Record<string, unknown> = {
    service: tjanst,
    sqm: Math.round(Number(indata.kvm)),
    frequency: frekvens,
    bindingMonths: Number(indata.bindningstid ?? 0) || 0,
    extraServices: Array.isArray(indata.tillval) ? indata.tillval.map((x) => rent(x, 60)).filter(Boolean).slice(0, 6) : [],
    discountCode: rent(indata.rabattkod, 40).replace(/\s/g, ''),
    date: rent(indata.datum, 10),
    time: rent(indata.tid, 5),
    firstName: rent(indata.fornamn, 60),
    lastName: rent(indata.efternamn, 60),
    email: rent(indata.epost, 254),
    phone: rent(indata.telefon, 30),
    streetAddress: rent(indata.gatuadress, 120),
    postalCode: rent(indata.postnummer, 10).replace(/\D/g, ''),
    city: rent(indata.ort, 60),
    keyHandling: nyckel ?? '',
    portCode: rent(indata.portkod, 40),
    hasPets: indata.husdjur === true,
    message: rent(indata.meddelande, 800),
  };

  let svar: ChatBookSvar;
  try {
    svar = await anropaChatBook({ ...order, steg: 'granska' }, kund);
  } catch (fel) {
    console.error('chat: chat-book (granska) gick inte att nå:', fel);
    return 'Beställningen gick inte att förbereda just nu. Använd forbered_bokning med samma uppgifter, så får kunden en förifylld länk i stället.';
  }
  const { status, data } = svar;

  if (status === 422 && data.error === 'rabattkod') {
    return [
      `Rabattkoden ${String(order.discountCode).toUpperCase()} gäller inte för den här beställningen. Bokningssystemets besked: "${rent(data.message, 300)}"`,
      'Säg det kort och vänligt med bokningssystemets ord. Fråga om kunden vill beställa utan koden, ändra det som krävs för koden (t.ex. bindningstid) eller använda en annan kod. Hitta aldrig på en annan rabatt.',
    ].join(' ');
  }
  if (status === 409 && data.error === 'tid_upptagen') {
    const tider = (data.tider ?? []).map((t) => `${kortDag(t.date)} ${t.time} (${t.date})`);
    return tider.length
      ? `Tiden ${order.date} ${order.time} är inte längre ledig. Närmaste lediga tider: ${tider.join(', ')}. Säg det kort och visa dem som knappar. När kunden valt: forbered_bestallning igen med den nya tiden.`
      : 'Tiden är inte längre ledig och schemat visar inga andra tider just nu. Använd visa_lediga_tider från en senare dag, eller erbjud att kundservice hör av sig.';
  }
  if (status === 400 && data.error && FEL_TILL_MODELLEN[data.error]) return FEL_TILL_MODELLEN[data.error];
  if (status !== 200 || !data.ok || !data.sammanfattning || !data.hash) {
    console.error('chat: chat-book (granska) svarade', status, data.error);
    return 'Beställningen gick inte att förbereda just nu. Använd forbered_bokning med samma uppgifter, så får kunden en förifylld länk i stället.';
  }

  const b: Bestallning = {
    id: slumpId('BE'),
    samtalsId,
    order,
    sammanfattning: data.sammanfattning,
    hash: data.hash,
    skapad: Date.now(),
    status: 'vantar',
  };
  await lagring.spara(`bestall:${b.id}`, b, 24 * 3600);

  const s = b.sammanfattning;
  const rabatt = s.rabattkod ? ` med rabattkoden ${s.rabattkod} (${s.rabattProcent} %)` : '';
  const darefter = s.prisDarefterKr !== null ? `, därefter ${s.prisDarefterKr} kr per tillfälle` : '';
  return [
    `Beställningen är granskad: ${s.tjanst.toLowerCase()} ${s.kvm} kvm ${kortDag(s.datum)} kl. ${s.tid}${rabatt} – ${s.prisKr} kr${s.frekvens !== 'Engång' ? ' per tillfälle' : ''} efter RUT-avdrag${darefter}.`,
    `Skriv EN kort mening, till exempel "Här är din beställning – fyll i personnummer för RUT-avdraget, godkänn villkoren och tryck Beställ." och avsluta med den här raden exakt: [[bekrafta:${b.id}]]`,
    'Kortet visar allt, rutan för personnummer och knappen. Upprepa inte sammanfattningen och be aldrig om personnumret i chatten.',
    'Du kan INTE boka själv. Bokningen görs först när kunden trycker Beställ, och då svarar systemet kunden direkt. Säg aldrig att något är bokat innan dess.',
    `Kortet gäller i ${GILTIG_MINUTER} minuter.`,
  ].join('\n');
}

// ─── Kortet i chatten ────────────────────────────────────────────────────────

export interface Bestallningskort {
  typ: 'bestallning';
  id: string;
  sammanfattning: Omit<Sammanfattning, 'villkor'> & { datumText: string };
  avbokningsregel: string;
  status: 'vantar' | 'klar' | 'misslyckad' | 'utgangen';
}

export async function hamtaBestallningskort(samtalsId: string, id: string): Promise<Bestallningskort | null> {
  const b = await lagring.hamta<Bestallning>(`bestall:${id}`);
  if (!b || b.samtalsId !== samtalsId) return null;
  const utgangen = b.status === 'vantar' && Date.now() - b.skapad > GILTIG_MINUTER * 60000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { villkor, ...s } = b.sammanfattning;
  return {
    typ: 'bestallning',
    id: b.id,
    sammanfattning: { ...s, datumText: datumText(s.datum) },
    avbokningsregel: `Av- och ombokning: ${regelFor(s.tjanst).beskrivning}.`,
    status: utgangen ? 'utgangen' : b.status,
  };
}

// ─── Beställ (bara från knappen) ─────────────────────────────────────────────

export async function bekraftaBestallning(
  samtalsId: string,
  id: string,
  kundens: { personnummer: string; villkor: boolean; bindning: boolean },
  kund: { ip: string; ua: string }
): Promise<Bekraftelse> {
  const b = await lagring.hamta<Bestallning>(`bestall:${id}`);
  if (!b || b.samtalsId !== samtalsId) return { utfall: 'OGILTIGT_FORSLAG', text: 'Jag hittar inte beställningen. Vill du att jag tar fram den igen?' };
  if (b.status === 'klar') return { utfall: 'SUCCESS', text: 'Din beställning är redan klar – bekräftelsen finns i din mejl.' };
  if (b.status !== 'vantar') return { utfall: 'OGILTIGT_FORSLAG', text: 'Den här beställningen gick inte igenom. Vill du att jag tar fram en ny?' };
  if (Date.now() - b.skapad > GILTIG_MINUTER * 60000) {
    return { utfall: 'UTGANGET', text: 'Sammanfattningen hann gå ut, så jag tar fram en ny med aktuellt pris och tid.', fortsatt: '[Beställningskortet gick ut. Ta fram en ny sammanfattning med forbered_bestallning och samma uppgifter.]' };
  }
  // Fel i kortet stoppas här, utan att låset tas – kunden rättar och trycker igen.
  if (!kundens.villkor) return { utfall: 'OGILTIGT_FORSLAG', text: 'Du behöver godkänna villkoren innan du kan beställa.' };
  if (b.sammanfattning.bindningManader > 0 && !kundens.bindning) {
    return { utfall: 'OGILTIGT_FORSLAG', text: 'Du behöver godkänna bindningstiden innan du kan beställa.' };
  }
  if (!/^(19|20)?\d{6}[-+]?\d{4}$/.test(kundens.personnummer.replace(/\s/g, ''))) {
    return { utfall: 'OGILTIGT_FORSLAG', text: 'Personnumret ser inte rätt ut. Skriv det som ÅÅÅÅMMDD-XXXX i rutan.' };
  }

  // Två tryck – eller två flikar – får aldrig bli två bokningar.
  if (!(await lagring.lasa(`bestall:las:${id}`, 120))) {
    return { utfall: 'PAGAR_REDAN', text: 'Beställningen håller redan på att genomföras – vänta några sekunder.' };
  }
  const klar = async (status: Bestallning['status']) => lagring.spara(`bestall:${id}`, { ...b, status }, 24 * 3600);

  let svar: ChatBookSvar;
  try {
    svar = await anropaChatBook(
      {
        ...b.order,
        steg: 'boka',
        hash: b.hash,
        personalNumber: kundens.personnummer,
        villkorGodkanda: true,
        bindningGodkand: kundens.bindning,
      },
      kund
    );
  } catch (fel) {
    // Svaret uteblev: bokningen KAN ha gått igenom. Kortet låses som
    // misslyckat (inget nytt försök härifrån) och kundservice kontrollerar.
    console.error('chat: chat-book (boka) gav inget svar:', fel);
    await klar('misslyckad');
    return {
      utfall: 'EJ_VERIFIERAD',
      text: 'Bokningssystemet svarade inte i tid, så jag kan inte se om beställningen gick igenom. Får du ett bekräftelsemejl inom några minuter är allt klart. Annars – ring oss på 010-178 01 50 eller mejla info@stodona.se, så ordnar vi det.',
    };
  }
  const { status, data } = svar;

  if (status === 200 && data.ok) {
    await klar('klar');
    const s = b.sammanfattning;
    return {
      utfall: 'SUCCESS',
      text: `Klart! Din ${s.tjanst.toLowerCase()} är beställd ${datumText(s.datum)} kl. ${s.tid}. En bekräftelse är på väg till ${s.epost}. Vi ser fram emot att komma till dig!`,
    };
  }

  // Inget bokades. Låset släpps så att kunden kan försöka igen där det är meningsfullt.
  await lagring.taBort(`bestall:las:${id}`);
  if (status === 409 && data.error === 'tid_upptagen') {
    await klar('misslyckad');
    return {
      utfall: 'TIDEN_UPPTAGEN',
      text: 'Tiden hann tyvärr bokas av någon annan precis nu. Jag tar fram nya tider åt dig.',
      fortsatt: `[Tiden ${b.sammanfattning.datum} ${b.sammanfattning.tid} hann bli upptagen. Hämta nya tider med visa_lediga_tider och ta sedan fram en ny beställning med forbered_bestallning.]`,
    };
  }
  if (status === 409 && data.error === 'andrad') {
    await klar('misslyckad');
    return {
      utfall: 'VILLKOR_ANDRADE',
      text: 'Priset eller villkoren hann ändras sedan sammanfattningen togs fram, så jag tar fram en ny.',
      fortsatt: '[Priset ändrades innan kunden beställde. Ta fram en ny sammanfattning med forbered_bestallning och samma uppgifter.]',
    };
  }
  if (status === 400 && data.error === 'personnummer') {
    return { utfall: 'OGILTIGT_FORSLAG', text: 'Personnumret ser inte rätt ut. Skriv det som ÅÅÅÅMMDD-XXXX i rutan.' };
  }
  if (status === 422 && data.error === 'rabattkod') {
    await klar('misslyckad');
    return {
      utfall: 'VILLKOR_ANDRADE',
      text: `Rabattkoden gick inte att använda: ${rent(data.message, 300)}`,
      fortsatt: '[Rabattkoden godtogs inte vid beställningen. Fråga om kunden vill beställa utan koden.]',
    };
  }
  console.error('chat: chat-book (boka) svarade', status, data.error);
  await klar('misslyckad');
  return {
    utfall: 'SYSTEMFEL',
    text: `Beställningen gick tyvärr inte igenom${data.message ? `: ${rent(data.message, 300)}` : '.'} Ingenting är bokat. Vill du att kundservice hör av sig, eller vill du boka på boka.stodona.se?`,
  };
}
