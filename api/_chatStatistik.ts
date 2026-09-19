// Statistik om vad kunder frågar chatten om.
//
// Filen börjar med understreck, så Vercel gör den inte till en egen endpoint –
// den importeras bara av api/chat.ts.
//
// INTEGRITET – bestämt av Stodona 2026-09-15:
//  * Vi sparar ämnen, hur samtalet slutade och själva frågorna – men frågorna
//    anonymiseras innan de sparas: e-post, telefonnummer, personnummer,
//    postnummer, gatuadresser och namn efter "jag heter" byts ut.
//  * Allt sparas i 90 dagar och försvinner sedan av sig självt.
//  * Anonymiseringen är ett skyddsnät, inte en garanti: ett namn eller en
//    adress som kunden skriver på ett oväntat sätt kan slinka igenom. Därför
//    visas frågorna bara för inloggad personal och sparas aldrig för evigt.

/** Byter ut personuppgifter i en fråga mot en markering som [telefon]. */
export function anonymisera(text: string): string {
  return (
    text
      // E-post först – den innehåller siffror som annars kan tolkas som nummer.
      .replace(/[^\s@<>"']+@[^\s@<>"']+\.[a-zA-Z]{2,}/g, "[e-post]")
      // Mobilnummer skrivna i ett svep (0701234567) – innan personnumret, som annars tar dem.
      .replace(/\b07\d{8}\b/g, "[telefon]")
      // Personnummer: ÅÅÅÅMMDD-XXXX, ÅÅMMDD-XXXX, med eller utan skiljetecken.
      .replace(/\b(?:19|20)?\d{6}[-+ ]?\d{4}\b/g, "[personnummer]")
      // Telefonnummer som börjar med +46, 0046 eller 0, med mellanslag eller bindestreck.
      .replace(/(?:\+46|0046|\b0)[\s-]?\d{1,3}(?:[\s-]?\d{2,4}){2,4}\b/g, "[telefon]")
      // Gatuadress med husnummer, t.ex. "Storgatan 5" eller "Sveavägen 12B".
      .replace(
        /\b[A-ZÅÄÖ][a-zåäöé]+(?:gatan|vägen|gränd|torget|backen|stigen|allén|plan|väg|gata|leden|parken)\s+\d+[A-Za-z]?\b/g,
        "[adress]"
      )
      // Postnummer "111 51" eller "11151" – efter adressen, så husnummer inte slås ihop.
      .replace(/\b\d{3}\s?\d{2}\b(?!\s*(?:kvm|kr|m2|st|%))/g, "[postnummer]")
      // Namn efter en presentation. Frasen matchas oavsett stor bokstav ("Jag
      // heter"), men själva namnet måste börja med versal – annars skulle
      // "jag heter inte så" också rensas.
      .replace(
        /\b([Jj]ag heter|[Mm]itt namn är|[Nn]amnet är|[Dd]et är)\s+[A-ZÅÄÖ][a-zåäöé]+(?:\s+[A-ZÅÄÖ][a-zåäöé]+)?/g,
        "$1 [namn]"
      )
  );
}

/**
 * Ämnen enligt Stodonas regel 4, "Vanliga kategorier". En fråga kan ha flera
 * ämnen. Matchar ingenting blir det "övrigt".
 */
const AMNESMONSTER: [string, RegExp][] = [
  ["pris", /\b(pris|priser|kostar|kosta|kostnad|billig|dyr|offert)\b|\bkr\b/i],
  ["boka städning", /\b(boka|bokning|bokar)\b/i],
  ["lediga tider", /\b(ledig|lediga|när kan ni|kan ni komma|när kommer|vilken dag|vilka dagar|tid på|tider)\b/i],
  ["hemstädning", /hemstäd/i],
  ["storstädning", /storstäd/i],
  ["flyttstädning", /flyttstäd|\bflytta\b|\bflyttar\b/i],
  ["fönsterputs", /fönster/i],
  ["företagsstädning", /företag|kontor|trapphus|trappstäd|byggstäd/i],
  ["ombokning", /omboka|ombokning|ändra (min |tid)|flytta (min |städ|tiden)/i],
  ["avbokning", /avboka|avbokning|ställa in|ställ in/i],
  ["faktura", /faktura|e-faktura/i],
  ["betalning", /betal|autogiro|swish|kort\b/i],
  ["rut-avdrag", /\brut\b/i],
  ["reklamation", /missnöjd|reklam|inte nöjd|dåligt städat|missade|slarv/i],
  ["skada", /sönder|skada|trasig|förstör/i],
  ["uppsägning", /säga upp|uppsägning|avsluta (mitt|abonnemang|städ)/i],
  ["pausa städning", /pausa|\bpaus\b/i],
  ["nycklar", /nyckel|nycklar|portkod|larm|kommer inte in/i],
  ["jobba hos stodona", /jobba hos|lediga jobb|ansöka|söka jobb|anställning/i],
];

export function amnenFor(text: string): string[] {
  const hittade = AMNESMONSTER.filter(([, monster]) => monster.test(text)).map(([namn]) => namn);
  return hittade.length ? hittade : ["övrigt"];
}

/** Hur ett samtal slutade, utifrån vilka verktyg boten använde. */
export type Utfall = "bokningsutkast" | "överlämnat" | "lead" | "pris" | "tider" | "bara frågor";

export function utfallFor(verktyg: Record<string, number>): Utfall {
  if (verktyg.forbered_bokning) return "bokningsutkast";
  if (verktyg.eskalera_till_kundservice) return "överlämnat";
  if (verktyg.skicka_lead) return "lead";
  if (verktyg.visa_lediga_tider) return "tider";
  if (verktyg.berakna_pris) return "pris";
  return "bara frågor";
}

// ─── Lagring ─────────────────────────────────────────────────────────────────

const LOKAL = process.env.STODONA_LOKAL === "true";
// 7 dagar matchar SAMTAL_TTL_SEKUNDER i chat.ts så Head of hinner spegla
// hela dialogen till sitt eget arkiv innan den försvinner (Mikaela
// 2026-09-19: "vill kunna söka, men de kan tas bort efter en vecka").
const TTL_SEKUNDER = 7 * 24 * 3600;
const MAX_FRAGOR_PER_SAMTAL = 20;

export interface SamtalsStatistik {
  /** Anonymt id – en hash av samtals-id:t, så det inte går att koppla till webbläsaren. */
  id: string;
  /** Dagen samtalet startade, i svensk tid. */
  dag: string;
  startad: string;
  uppdaterad: string;
  antalFragor: number;
  fragor: { tid: string; text: string; amnen: string[] }[];
  verktyg: Record<string, number>;
  /** Ärendetyper när boten lämnat över, t.ex. "ombokning". */
  arenden: string[];
  utfall: Utfall;
}

/** Testmiljön sparar i minnet och rör aldrig produktionens KV. */
const lokalaSamtal = new Map<string, SamtalsStatistik>();
const lokalaDagar = new Map<string, Set<string>>();

function kvUppgifter() {
  if (LOKAL) return null;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function kv(kommando: string[]): Promise<unknown> {
  const uppg = kvUppgifter();
  if (!uppg) return null;
  const res = await fetch(uppg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${uppg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(kommando),
  });
  if (!res.ok) throw new Error(`KV svarade ${res.status}`);
  return (await res.json()).result;
}

export function dagSthlm(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

async function anonymtId(samtalsId: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`stodona-chatt:${samtalsId}`));
  return [...new Uint8Array(hash)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function lasSamtal(id: string): Promise<SamtalsStatistik | null> {
  if (LOKAL) return lokalaSamtal.get(id) ?? null;
  const rad = await kv(["GET", `chat:stat:${id}`]);
  return typeof rad === "string" ? (JSON.parse(rad) as SamtalsStatistik) : null;
}

async function sparaSamtal(s: SamtalsStatistik): Promise<void> {
  if (LOKAL) {
    lokalaSamtal.set(s.id, s);
    if (!lokalaDagar.has(s.dag)) lokalaDagar.set(s.dag, new Set());
    lokalaDagar.get(s.dag)!.add(s.id);
    return;
  }
  if (!kvUppgifter()) return;
  await kv(["SET", `chat:stat:${s.id}`, JSON.stringify(s), "EX", String(TTL_SEKUNDER)]);
  await kv(["SADD", `chat:stat:dag:${s.dag}`, s.id]);
  await kv(["EXPIRE", `chat:stat:dag:${s.dag}`, String(TTL_SEKUNDER)]);
}

async function uppdatera(samtalsId: string, andra: (s: SamtalsStatistik) => void): Promise<void> {
  // Statistiken får aldrig stoppa eller fördröja ett svar till kunden.
  try {
    const id = await anonymtId(samtalsId);
    const nu = new Date().toISOString();
    const s: SamtalsStatistik = (await lasSamtal(id)) ?? {
      id, dag: dagSthlm(), startad: nu, uppdaterad: nu, antalFragor: 0, fragor: [], verktyg: {}, arenden: [], utfall: "bara frågor",
    };
    andra(s);
    s.uppdaterad = nu;
    s.utfall = utfallFor(s.verktyg);
    await sparaSamtal(s);
  } catch (fel) {
    console.error("chattstatistik: kunde inte spara:", fel);
  }
}

/** Anropas för varje fråga. Texten anonymiseras innan den sparas. */
export function registreraFraga(samtalsId: string, fraga: string): Promise<void> {
  // Sido-effekt: indexera raw samtalsId per dag så Head of kan hämta hela
  // dialogen (chat:samtal:<id>) för att bygga sitt sökbara arkiv.
  // Detta INDEX innehåller inga samtalstexter — bara id:n.
  (async () => {
    try {
      if (!LOKAL && kvUppgifter()) {
        const dag = dagSthlm();
        await kv(["SADD", `chat:samtal-ider:${dag}`, samtalsId]);
        await kv(["EXPIRE", `chat:samtal-ider:${dag}`, String(TTL_SEKUNDER)]);
      }
    } catch (fel) { console.error("chattstatistik: kunde inte indexera id:", fel); }
  })();
  return uppdatera(samtalsId, (s) => {
    s.antalFragor += 1;
    if (s.fragor.length < MAX_FRAGOR_PER_SAMTAL) {
      s.fragor.push({ tid: new Date().toISOString(), text: anonymisera(fraga).slice(0, 300), amnen: amnenFor(fraga) });
    }
  });
}

/** Alla raw samtalsIds som startade en viss dag (för dialog-hämtning). */
export async function hamtaSamtalsIderForDag(dag: string): Promise<string[]> {
  if (LOKAL) return [];
  if (!kvUppgifter()) return [];
  const ider = (await kv(["SMEMBERS", `chat:samtal-ider:${dag}`])) as string[] | null;
  return ider ?? [];
}

/** Anropas när boten använder ett verktyg – det avgör hur samtalet slutade. */
export function registreraVerktyg(samtalsId: string, verktyg: string, arende?: string): Promise<void> {
  return uppdatera(samtalsId, (s) => {
    s.verktyg[verktyg] = (s.verktyg[verktyg] ?? 0) + 1;
    if (arende && !s.arenden.includes(arende)) s.arenden.push(arende);
  });
}

/** Alla samtal som startade en viss dag. */
export async function hamtaDag(dag: string): Promise<SamtalsStatistik[]> {
  if (LOKAL) return [...(lokalaDagar.get(dag) ?? [])].map((id) => lokalaSamtal.get(id)!).filter(Boolean);
  if (!kvUppgifter()) return [];
  const ider = (await kv(["SMEMBERS", `chat:stat:dag:${dag}`])) as string[] | null;
  if (!ider?.length) return [];
  const rader = (await kv(["MGET", ...ider.map((id) => `chat:stat:${id}`)])) as (string | null)[];
  return rader.filter((r): r is string => typeof r === "string").map((r) => JSON.parse(r) as SamtalsStatistik);
}

/** Siffror för en dag – det Head of sparar långsiktigt. */
export function sammanstall(samtal: SamtalsStatistik[]) {
  const amnen: Record<string, number> = {};
  const utfall: Record<string, number> = {};
  let antalFragor = 0;
  for (const s of samtal) {
    antalFragor += s.antalFragor;
    utfall[s.utfall] = (utfall[s.utfall] ?? 0) + 1;
    const samtalsAmnen = new Set(s.fragor.flatMap((f) => f.amnen));
    for (const a of samtalsAmnen) amnen[a] = (amnen[a] ?? 0) + 1;
  }
  return { antalSamtal: samtal.length, antalFragor, amnen, utfall };
}
