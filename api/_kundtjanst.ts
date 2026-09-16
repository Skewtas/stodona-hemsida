// Inloggad kundtjänst i chatten: kunden legitimerar sig och får se sina
// fakturor och bokningar.
//
// ENDAST TESTMILJÖ. Allt här är avstängt om inte CHAT_KUNDTJANST=true, vilket
// bara vite.config.ts sätter när sajten körs lokalt. I produktion finns
// varken verktygen, knappen eller den här datan.
//
// TESTDATA, INTE RIKTIGA KUNDER. Fakturorna och bokningarna nedan är påhittade.
// Riktiga uppgifter från Fortnox (fakturor) och TimeWave (scheman och städare)
// kopplas på som ett eget steg, när flödet är godkänt. Då slipper vi ha riktiga
// kunders uppgifter i en testchatt.
//
// SÄKERHETEN SOM GÄLLER ÄVEN NÄR RIKTIGA SYSTEM KOPPLAS PÅ:
//  * Verifieringen lever på servern, kopplad till samtalets id och med en
//    sista giltighetstid. Det kunden eller modellen påstår spelar ingen roll.
//  * Vilket kundkonto som gäller avgörs av verifieringen – aldrig av ett
//    kundnummer, personnummer eller fakturanummer som kunden skriver.
//  * Personnumret skrivs aldrig i chatten, utan i legitimeringsrutan, och
//    sparas aldrig i samtalet. Det visas alltid maskerat.

export const KUNDTJANST_PA = process.env.CHAT_KUNDTJANST === 'true';

/** Hur länge en legitimering gäller innan kunden får göra om den. */
const VERIFIERING_MINUTER = 15;
/** Hur lång den simulerade BankID-signeringen tar. */
const SIMULERAD_SIGNERING_MS = 3000;

export interface Faktura {
  nummer: string;
  datum: string;
  forfallodatum: string;
  belopp: number;
  status: 'Betald' | 'Obetald' | 'Förfallen';
  avser: string;
}

export interface Bokning {
  id: string;
  datum: string;
  tid: string;
  tjanst: string;
  langd: string;
  adress: string;
  stadare: string;
  serie: string;
}

export interface Testkund {
  id: string;
  personnummer: string;
  namn: string;
  fakturor: Faktura[];
  bokningar: Bokning[];
}

/** Påhittade kunder. Personnumren är Skatteverkets testnummer. */
const TESTKUNDER: Testkund[] = [
  {
    id: 'kund-1001',
    personnummer: '19850101-1234',
    namn: 'Anna Lind',
    fakturor: [
      { nummer: '10452', datum: '2026-09-01', forfallodatum: '2026-09-11', belopp: 1255, status: 'Betald', avser: 'Hemstädning 72 kvm, augusti' },
      { nummer: '10488', datum: '2026-09-15', forfallodatum: '2026-09-25', belopp: 1255, status: 'Obetald', avser: 'Hemstädning 72 kvm, september' },
    ],
    bokningar: [
      { id: 'BOK-77120', datum: '2026-09-18', tid: '09:00', tjanst: 'Hemstädning', langd: '2 timmar', adress: 'Testgatan 5, 111 51 Stockholm', stadare: 'Maria', serie: 'Varannan vecka' },
      { id: 'BOK-77121', datum: '2026-10-02', tid: '09:00', tjanst: 'Hemstädning', langd: '2 timmar', adress: 'Testgatan 5, 111 51 Stockholm', stadare: 'Maria', serie: 'Varannan vecka' },
    ],
  },
  {
    id: 'kund-1002',
    personnummer: '19700315-4321',
    namn: 'Johan Berg',
    fakturor: [
      { nummer: '10399', datum: '2026-08-20', forfallodatum: '2026-08-30', belopp: 3480, status: 'Förfallen', avser: 'Flyttstädning 68 kvm' },
    ],
    bokningar: [],
  },
];

/** Personnumren som fungerar i testlägets BankID-ruta. */
export const TESTPERSONNUMMER = TESTKUNDER.map((k) => ({ personnummer: k.personnummer, namn: k.namn }));

// ─── Verifieringar ───────────────────────────────────────────────────────────

interface Verifiering {
  kundId: string;
  giltigTill: number;
}

interface Pagaende {
  samtalsId: string;
  kundId: string;
  klarTid: number;
}

/** Testmiljön håller allt i minnet. Ingenting skrivs till någon databas. */
const verifierade = new Map<string, Verifiering>();
const pagaende = new Map<string, Pagaende>();

function kundFor(id: string): Testkund | null {
  return TESTKUNDER.find((k) => k.id === id) ?? null;
}

/**
 * Startar den simulerade signeringen. Personnumret kommer från
 * legitimeringsrutan, aldrig från chatten, och sparas inte.
 */
export function startaSignering(samtalsId: string, personnummer: string): { ordernummer: string } | { fel: string } {
  const rensat = personnummer.replace(/\s/g, '');
  const kund = TESTKUNDER.find((k) => k.personnummer === rensat);
  if (!kund) return { fel: 'I testläget fungerar bara testpersonnumren i listan.' };
  const ordernummer = crypto.randomUUID();
  pagaende.set(ordernummer, { samtalsId, kundId: kund.id, klarTid: Date.now() + SIMULERAD_SIGNERING_MS });
  return { ordernummer };
}

/** Frågar hur det går. Först när signeringen är klar kopplas kunden till samtalet. */
export function kollaSignering(samtalsId: string, ordernummer: string): { status: 'vantar' } | { status: 'klar'; namn: string } | { fel: string } {
  const order = pagaende.get(ordernummer);
  // Ordern måste höra till det här samtalet – annars går den inte att kapa.
  if (!order || order.samtalsId !== samtalsId) return { fel: 'Legitimeringen hittades inte. Börja om.' };
  if (Date.now() < order.klarTid) return { status: 'vantar' };
  pagaende.delete(ordernummer);
  const kund = kundFor(order.kundId);
  if (!kund) return { fel: 'Kundkontot kunde inte hämtas.' };
  verifierade.set(samtalsId, { kundId: kund.id, giltigTill: Date.now() + VERIFIERING_MINUTER * 60 * 1000 });
  return { status: 'klar', namn: kund.namn };
}

export function avbrytSignering(samtalsId: string, ordernummer: string): void {
  const order = pagaende.get(ordernummer);
  if (order && order.samtalsId === samtalsId) pagaende.delete(ordernummer);
}

/** Kunden bakom en verifierad session, eller null. Enda källan till vem kunden är. */
export function verifieradKund(samtalsId: string): Testkund | null {
  const v = verifierade.get(samtalsId);
  if (!v) return null;
  if (Date.now() > v.giltigTill) {
    verifierade.delete(samtalsId);
    return null;
  }
  return kundFor(v.kundId);
}

export function glomVerifiering(samtalsId: string): void {
  verifierade.delete(samtalsId);
}

/** Hur många minuter legitimeringen gäller till, för att kunna säga det till kunden. */
export function minuterKvar(samtalsId: string): number {
  const v = verifierade.get(samtalsId);
  return v ? Math.max(0, Math.round((v.giltigTill - Date.now()) / 60000)) : 0;
}

// ─── Uppgifter ───────────────────────────────────────────────────────────────

export function maskeratPersonnummer(personnummer: string): string {
  return `${personnummer.slice(0, 8)}-XXXX`;
}

export function fakturaradText(f: Faktura): string {
  return `Faktura ${f.nummer} · ${f.avser} · ${f.belopp} kr · fakturerad ${f.datum} · förfaller ${f.forfallodatum} · ${f.status}`;
}

export function bokningsradText(b: Bokning): string {
  return `${b.id} · ${b.datum} kl. ${b.tid} · ${b.tjanst}, ${b.langd} · ${b.adress} · städare ${b.stadare} · ${b.serie}`;
}
