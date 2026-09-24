import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Send, Phone, Paperclip, Video, Loader2, ArrowDown, FlaskConical, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { track } from "../utils/analytics";

interface Bilaga {
  url: string;
  typ: "bild" | "video";
  namn: string;
}

interface Meddelande {
  roll: "user" | "assistant";
  text: string;
  bilagor?: Bilaga[];
}

/** En fil kunden valt men inte skickat än. */
interface ValdFil {
  id: string;
  fil: File;
  typ: "bild" | "video";
  forhands: string;
}

/**
 * Personalchatten (den gömda sidan /personalchatt) kör samma widget i
 * personalläge. Då skickas lage: "personal" med i varje anrop – servern slår
 * på självservicen bara för inloggad personal – och samtalet sparas separat
 * från den vanliga chatten.
 */
let chattLage: "personal" | undefined;
const nyckel = (bas: string) => (chattLage === "personal" ? `${bas}-personal` : bas);
const LAGRINGSNYCKEL = "stodona-chat";
const IDNYCKEL = "stodona-chat-id";
/** Camilla på Stodonas kundservice. Kvadratisk beskärning, 192 px för skarpa retinaskärmar. */
const AVATAR = "/camilla.webp";

// Tidtagning som liknar en människa. Först "läser" Camilla en stund utan att
// något syns, sedan visas att hon skriver, och sedan kommer texten i ungefär 35
// tecken i sekunden. Pauserna slumpas lite så det aldrig känns mekaniskt, och
// långa svar skrivs fortare så de inte drar ut.
const TICK_MS = 30;
const lasPaus = () => 900 + Math.random() * 500; // innan "skriver" syns
const skrivPaus = () => 1100 + Math.random() * 700; // prickar innan första tecknet
const teckenPerTick = (kvar: number) => (kvar > 300 ? 4 : kvar > 120 ? 2 : 1);

// Tecken räknas som kodpunkter, så en emoji aldrig klyvs på mitten under
// animationen och syns som en trasig ruta.
const antalTecken = (text: string) => Array.from(text).length;
const forstaTecken = (text: string, n: number) => Array.from(text).slice(0, n).join("");

// Bara länkar till våra egna adresser görs klickbara. Skulle boten någon gång
// förmås att skriva ut en främmande länk blir den vanlig text i stället.
const TILLATNA_VARDAR = ["stodona.se", "www.stodona.se", "boka.stodona.se", "stodona.twportal.se"];

function egenLank(url: string): boolean {
  try {
    const u = new URL(url);
    // I den lokala testmiljön pekar bokningslänken på bokningsmodulens
    // dev-server. De adresserna tillåts bara i dev, aldrig i produktionsbygget.
    if (import.meta.env.DEV && u.protocol === "http:" && (u.hostname === "127.0.0.1" || u.hostname === "localhost")) {
      return true;
    }
    return u.protocol === "https:" && TILLATNA_VARDAR.includes(u.host);
  } catch {
    return false;
  }
}

/** Samtalet identifieras med ett id; själva historiken bor på servern. */
function samtalsId(): string {
  try {
    const sparat = sessionStorage.getItem(nyckel(IDNYCKEL));
    if (sparat) return sparat;
    const nytt = crypto.randomUUID();
    sessionStorage.setItem(nyckel(IDNYCKEL), nytt);
    return nytt;
  } catch {
    return crypto.randomUUID();
  }
}

// Alltid på i den lokala testmiljön. I ett produktionsbygge krävs
// VITE_CHAT_ENABLED=true – men Layout monterar ändå bara widgeten i dev tills
// chatten är färdig.
const PASLAGEN = import.meta.env.DEV || import.meta.env.VITE_CHAT_ENABLED === "true";

// Självservicen (legitimering, egna bokningar, ombokning) finns bara i
// testläget än så länge: lokalt och på preview-deployer som byggts med
// VITE_SJALVSERVICE_TEST=true. Det är servern som avgör – den svarar bara i
// testläget och aldrig i produktion. Flaggan här sparar bara ett anrop.
const SJALVSERVICE_KAN_FINNAS =
  import.meta.env.DEV || import.meta.env.VITE_SJALVSERVICE_TEST === "true" || import.meta.env.VITE_SJALVSERVICE_KUNDER === "true";

/** Testlägets läge, från servern. */
interface Testlage {
  testlage: true;
  lage: "test" | "personal" | "kund";
  system: "test" | "timewave";
  skriver: boolean;
  inloggad: { namn: string; kundId: string } | null;
  simulera: "normal" | "upptagen" | "fel" | "overifierad";
  logg: {
    tid: string;
    bokningId: string;
    fore: string;
    efter: string;
    avgiftKr: number;
    utfall: string;
    systemsvar: string;
    forturUtanAnstalld?: string[];
    mejl?: string;
    ekonomi?: string;
    sms?: string;
  }[];
}

/** Sammanfattningen av en ombokning. Innehållet kommer från servern, aldrig från modellens text. */
interface Kort {
  id: string;
  tjanst: string;
  fore: { datum: string; tid: string; stadare: string };
  efter: { datum: string; tid: string; stadare: string };
  byteAvStadare: boolean;
  bara_detta_tillfalle: boolean;
  avgiftKr: number;
  avgiftText: string;
  status: "vantar" | "klar" | "misslyckad" | "utgangen";
  lasläge: boolean;
}

const SIMULERINGAR: { lage: Testlage["simulera"]; etikett: string }[] = [
  { lage: "normal", etikett: "Normalt" },
  { lage: "upptagen", etikett: "Tiden hinner bli upptagen" },
  { lage: "fel", etikett: "TimeWave svarar fel" },
  { lage: "overifierad", etikett: "Går inte att verifiera" },
];

async function sjalvservice<T>(handling: string, extra: Record<string, string> = {}): Promise<T | null> {
  try {
    const svar = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: samtalsId(), handling, ...(chattLage ? { lage: chattLage } : {}), ...extra }),
    });
    if (!svar.ok) return null;
    return (await svar.json()) as T;
  } catch {
    return null;
  }
}

// ─── Bilagor ─────────────────────────────────────────────────────────────────
// Samma gränser kontrolleras på servern (api/_chatBilagor.ts). Här finns de
// bara för att kunden ska få besked direkt.
const MAX_FILER = 5;
const MAX_BILD_MB = 25; // före förminskning
// Filerna skickas som bilagor i ett mejl till kundservice, och ett mejl får
// vara högst 40 MB. 25 MB räcker till ungefär 20 sekunders mobilvideo.
const MAX_VIDEO_MB = 25;
const BILD_MAXSIDA = 1600;
const TILLATNA_FILER = "image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm";
const FILANDELSE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

function filtyp(fil: File): "bild" | "video" | null {
  if (/^image\/(jpeg|png|webp|heic|heif)$/.test(fil.type) || (!fil.type && /\.(heic|heif)$/i.test(fil.name))) return "bild";
  if (/^video\/(mp4|quicktime|webm)$/.test(fil.type)) return "video";
  return null;
}

/**
 * Förminskar en bild till högst 1600 px och sparar om den som JPEG. Det gör
 * filen liten och tar bort platsdata (EXIF/GPS). Går bilden inte att läsa i
 * webbläsaren, till exempel HEIC i Chrome, skickas originalet.
 */
async function forminska(fil: File): Promise<Blob> {
  try {
    const bild = await createImageBitmap(fil, { imageOrientation: "from-image" });
    const skala = Math.min(1, BILD_MAXSIDA / Math.max(bild.width, bild.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bild.width * skala);
    canvas.height = Math.round(bild.height * skala);
    canvas.getContext("2d")?.drawImage(bild, 0, 0, canvas.width, canvas.height);
    bild.close();
    const blob = await new Promise<Blob | null>((klar) => canvas.toBlob(klar, "image/jpeg", 0.85));
    if (blob) return blob;
  } catch {
    /* skicka originalet */
  }
  return fil;
}

/** Samtalets mapp för bilagor – samma hash som servern räknar fram. */
async function samtalsMapp(id: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`stodona-bilaga:${id}`));
  return [...new Uint8Array(hash)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function laddaUpp(vald: ValdFil): Promise<Bilaga> {
  const kropp = vald.typ === "bild" ? await forminska(vald.fil) : vald.fil;
  const mime = kropp.type || (vald.typ === "bild" ? "image/heic" : "video/mp4");
  const bas = vald.fil.name.replace(/\.[^.]*$/, "").replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "fil";
  const namn = `${bas}.${FILANDELSE[mime] ?? "bin"}`;
  const id = samtalsId();

  // Testmiljön tar emot filen själv och sparar den i minnet.
  if (import.meta.env.DEV) {
    const svar = await fetch(`/api/chat-bilaga?samtal=${encodeURIComponent(id)}&namn=${encodeURIComponent(namn)}`, {
      method: "POST",
      headers: { "Content-Type": mime },
      body: kropp,
    });
    const data = await svar.json().catch(() => null);
    if (!svar.ok || typeof data?.url !== "string") throw new Error(data?.error || "uppladdningen misslyckades");
    return { url: data.url, typ: vald.typ, namn };
  }

  // I produktion går filen direkt till Vercel Blob – servern lämnar bara ut en nyckel.
  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(`chatt/${await samtalsMapp(id)}/${namn}`, kropp, {
    access: "public",
    handleUploadUrl: "/api/chat-bilaga",
    clientPayload: JSON.stringify({ samtalsId: id, typ: vald.typ }),
    contentType: mime,
    multipart: vald.typ === "video",
  });
  return { url: blob.url, typ: vald.typ, namn };
}

/** Bara våra egna bilagelänkar visas – aldrig något annat som hamnat i sessionStorage. */
function sakerBilaga(url: string): boolean {
  if (url.startsWith("/api/chat-bilaga?id=")) return true;
  try {
    const u = new URL(url);
    return (
      (u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com")) ||
      (import.meta.env.DEV && u.pathname === "/api/chat-bilaga" && (u.hostname === "127.0.0.1" || u.hostname === "localhost"))
    );
  } catch {
    return false;
  }
}

const TEXT = {
  SV: {
    oppna: "Chatta med Camilla",
    stang: "Stäng chatten",
    rubrik: "Chatta med Camilla på Stodona",
    namn: "Camilla",
    // Visas under namnet hela tiden, så kunden alltid vet att det är en
    // digital assistent – även när skrivanimationen känns mänsklig.
    underrubrik: "Stodonas digitala assistent",
    valkommen: "Välkommen till Stodona! Camilla heter jag och är assistent här på Stodona. Hur kan jag hjälpa dig? 🤍✨",
    skriver: "Camilla skriver…",
    forslag: ["Boka städning", "Ändra, boka om eller av", "Fakturafrågor", "Vad ingår?"],
    // Visas bredvid chattknappen en stund efter att sidan öppnats.
    inbjudan: "Jag hjälper dig att boka – eller om du har några frågor eller funderingar.",
    stangInbjudan: "Stäng",
    platshallare: "Skriv ett meddelande…",
    annat: "Annat",
    annatPlatshallare: "Skriv vad du tänker på…",
    skicka: "Skicka",
    fel: "Jag når inte fram just nu. Ring 010-178 01 50 så hjälper vi dig direkt.",
    ring: "Ring oss",
    bifoga: "Bifoga bild eller video",
    taBort: "Ta bort",
    laddarUpp: "Laddar upp…",
    felTyp: "Bara bilder och videor går att bifoga.",
    forStor: `Filen är för stor. Videor får vara högst ${MAX_VIDEO_MB} MB, ungefär 20 sekunder. Längre videor kan du mejla till info@stodona.se.`,
    bildSkickad: "Bild skickad",
    bankidKnapp: "Identifiera dig",
    bankidRubrik: "Identifiera dig",
    bankidTestlage: "Testinloggning (bara personal och test) – välj kund:",
    bankidVantar: "Loggar in…",
    bankidAvbryt: "Avbryt",
    bankidKlarPrefix: "Du är legitimerad som",
    bankidFel: "Legitimeringen gick inte igenom. Försök igen.",
    maxAntal: `Du kan bifoga högst ${MAX_FILER} filer åt gången.`,
    uppladdningFel: "Filen kunde inte laddas upp. Försök igen, eller ring 010-178 01 50.",
  },
  EN: {
    oppna: "Chat with Camilla",
    stang: "Close chat",
    rubrik: "Chat with Camilla at Stodona",
    namn: "Camilla",
    underrubrik: "Stodona's digital assistant",
    valkommen: "Welcome to Stodona! I'm Camilla, the assistant here at Stodona. How can I help you? 🤍✨",
    skriver: "Camilla is typing…",
    forslag: ["Book a cleaning", "Change, reschedule or cancel", "Invoice questions", "What's included?"],
    inbjudan: "I can help you book – or answer any questions you have.",
    stangInbjudan: "Close",
    platshallare: "Type a message…",
    annat: "Other",
    annatPlatshallare: "Tell me what you have in mind…",
    skicka: "Send",
    fel: "I can't get through right now. Call +46 10 178 01 50 and we'll help you.",
    ring: "Call us",
    bifoga: "Attach a photo or video",
    taBort: "Remove",
    laddarUpp: "Uploading…",
    felTyp: "Only photos and videos can be attached.",
    forStor: `The file is too large. Videos can be up to ${MAX_VIDEO_MB} MB, about 20 seconds. You can email longer videos to info@stodona.se.`,
    bildSkickad: "Photo sent",
    bankidKnapp: "Verify your identity",
    bankidRubrik: "Verify your identity",
    bankidTestlage: "Test login (staff and testing only) – pick a customer:",
    bankidVantar: "Signing in…",
    bankidAvbryt: "Cancel",
    bankidKlarPrefix: "You are verified as",
    bankidFel: "Verification failed. Please try again.",
    maxAntal: `You can attach up to ${MAX_FILER} files at a time.`,
    uppladdningFel: "The file couldn't be uploaded. Try again, or call +46 10 178 01 50.",
  },
};

// Allt som ser ut som en adress plockas ut som en enhet och blir bara en länk
// om HELA adressens värd är vår egen. "stodona.se.evil.example",
// "evil.example/stodona.se" och "info@stodona.se" förblir alltså vanlig text.
// Boten skriver korta länkar som "boka.stodona.se", med eller utan https.
const ADRESS = /((?<![\w@.-])(?:https?:\/\/(?:127\.0\.0\.1|localhost):\d{2,5}|(?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?:\/[^\s<>()]*[^\s<>().,!?])?)/gi;

/**
 * Boten avslutar ett meddelande med [[val: A | B | C]] när kunden ska välja
 * mellan fasta alternativ. Raden tas bort ur texten och blir knappar.
 * Medan svaret strömmar in döljs en halvfärdig "[[" så att markeringen aldrig
 * syns. Etiketterna renderas som vanlig text och kan inte innehålla markup.
 */
function delaUppVal(text: string): { text: string; val: string[]; bankid: boolean; bekrafta: string | null } {
  let val: string[] = [];
  // [[bekrafta:OF-…]] betyder att en sammanfattning av en ombokning ska visas som ett kort.
  const kort = text.match(/\[\[\s*bekrafta\s*:\s*(OF-[A-Z0-9]{8})\s*\]\]/i);
  text = text.replace(/\[\[\s*bekrafta\s*:[^\]]*\]\]/gi, "");
  // [[bankid]] betyder att kunden ska erbjudas legitimering. Raden blir en knapp.
  const bankid = /\[\[\s*bankid\s*\]\]/i.test(text);
  text = text.replace(/\[\[\s*bankid\s*\]\]/gi, '');
  const hittade = [...text.matchAll(/\[\[\s*val\s*:\s*([^\]]*)\]\]/gi)];
  if (hittade.length) {
    val = hittade[hittade.length - 1][1]
      .split("|")
      .map((v) => v.trim().slice(0, 48))
      .filter((v, i, alla) => v && alla.indexOf(v) === i)
      .slice(0, 8);
  }
  let ren = text.replace(/\[\[\s*val\s*:[^\]]*\]\]/gi, "").replace(/[ \t]{2,}/g, " ");
  const halvfardig = ren.lastIndexOf("[[");
  if (halvfardig !== -1 && !ren.includes("]]", halvfardig)) ren = ren.slice(0, halvfardig);
  return { text: ren.trimEnd(), val, bankid, bekrafta: kort ? kort[1].toUpperCase() : null };
}

/** Visar länken utan https och med å, ä och ö i klartext – adressen i href förblir kodad. */
function lasbarLank(bit: string): string {
  const utan = bit.replace(/^https?:\/\//, "");
  try {
    return decodeURI(utan);
  } catch {
    return utan;
  }
}

/** Gör länkar till våra egna adresser i botens svar klickbara. */
function medLankar(text: string) {
  // split med en fångstgrupp lägger varje träff på udda index.
  return text.split(ADRESS).map((bit, i) => {
    const url = /^https?:\/\//i.test(bit) ? bit : `https://${bit}`;
    return i % 2 === 1 && egenLank(url) ? (
      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="underline break-words hover:text-cta-hover">
        {lasbarLank(bit)}
      </a>
    ) : (
      <span key={i}>{bit}</span>
    );
  });
}

function Avatar({ storlek = 28 }: { storlek?: number }) {
  return (
    <img
      src={AVATAR}
      alt=""
      width={storlek}
      height={storlek}
      className="rounded-full shrink-0 object-cover ring-1 ring-text-primary/10 bg-bg-primary"
      style={{ width: storlek, height: storlek }}
    />
  );
}

function SkriverPrickar({ etikett }: { etikett: string }) {
  return (
    <span className="inline-flex items-center gap-1 py-1" role="status" aria-label={etikett}>
      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.3s]" />
    </span>
  );
}

/** "fredag 25 september" → "Fredag 25 september". */
const versal = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Ombokningskort({
  id,
  upptagen,
  laddaOm,
  onBekrafta,
  onAvbryt,
}: {
  id: string;
  /** Sant när chatten skriver eller något annat pågår. */
  upptagen: boolean;
  /** Ändras när kortet ska hämtas på nytt, t.ex. efter en bekräftelse. */
  laddaOm: number;
  onBekrafta: (id: string) => Promise<void>;
  onAvbryt: () => void;
}) {
  const [kort, setKort] = useState<Kort | null>(null);
  const [saknas, setSaknas] = useState(false);
  const [genomfor, setGenomfor] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Kortet kommer efter texten, så listan har redan scrollat. Visa hela kortet.
  useEffect(() => {
    if (kort?.status === "vantar") ref.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [kort?.status]);

  useEffect(() => {
    let aktiv = true;
    sjalvservice<Kort>("kort", { forslagId: id }).then((k) => {
      if (!aktiv) return;
      if (k) setKort(k);
      else setSaknas(true);
    });
    return () => {
      aktiv = false;
    };
  }, [id, laddaOm]);

  if (saknas) return null;
  if (!kort) {
    return (
      <div className="ml-9 mt-2 text-xs text-text-secondary flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Hämtar sammanfattningen…
      </div>
    );
  }

  const vantar = kort.status === "vantar";
  return (
    <div ref={ref} className="ml-9 mt-2 max-w-[85%] rounded-2xl border border-text-primary/15 bg-white p-4 text-sm text-text-primary shadow-sm">
      <p className="font-bold">Bekräfta ombokning</p>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-text-secondary">Nuvarande bokning</p>
        <p>{versal(kort.fore.datum)}</p>
        <p className="text-text-secondary">{kort.fore.tid} · {kort.fore.stadare}</p>
      </div>
      <ArrowDown className="w-4 h-4 my-2 text-text-secondary" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-text-secondary">Ny bokning</p>
        <p className="font-medium">{versal(kort.efter.datum)}</p>
        <p>
          {kort.efter.tid} · {kort.efter.stadare}
          {kort.byteAvStadare && <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">Annan städare</span>}
        </p>
      </div>
      {kort.bara_detta_tillfalle && <p className="mt-3 text-xs text-text-secondary">Gäller bara det här tillfället. Dina övriga städningar är oförändrade.</p>}
      <div className={`mt-3 rounded-xl px-3 py-2 text-xs ${kort.avgiftKr > 0 ? "bg-amber-50 text-amber-900" : "bg-bg-primary text-text-secondary"}`}>
        <p className="font-medium text-text-primary">Avgift för ändringen: {kort.avgiftKr} kr</p>
        {kort.avgiftKr > 0 && <p className="mt-1">{kort.avgiftText}</p>}
      </div>

      {vantar && kort.lasläge && (
        <p className="mt-3 text-xs rounded-xl px-3 py-2 bg-amber-100 text-amber-950">
          Testläge: allt kontrolleras mot TimeWave, men ändringen skrivs inte dit ännu.
        </p>
      )}
      {vantar ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={upptagen || genomfor}
            onClick={async () => {
              setGenomfor(true);
              try {
                await onBekrafta(kort.id);
              } finally {
                setGenomfor(false);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-bg-dark text-text-light font-medium hover:bg-accent hover:text-text-primary transition-colors disabled:opacity-40 inline-flex items-center gap-2"
          >
            {genomfor && <Loader2 className="w-4 h-4 animate-spin" />}
            {genomfor ? "Genomför…" : "Bekräfta ombokning"}
          </button>
          <button
            type="button"
            disabled={upptagen || genomfor}
            onClick={onAvbryt}
            className="px-4 py-2.5 rounded-xl border border-text-primary/20 hover:border-text-primary transition-colors disabled:opacity-40"
          >
            Avbryt
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs font-medium text-text-secondary">
          {kort.status === "klar" ? "✓ Genomförd" : kort.status === "misslyckad" ? "Inte genomförd" : "Sammanfattningen har gått ut"}
        </p>
      )}
    </div>
  );
}

function TestlageBanderoll({ lage, uppdatera }: { lage: Testlage; uppdatera: (l: Testlage) => void }) {
  const [oppen, setOppen] = useState(false);
  const [arbetar, setArbetar] = useState(false);
  const atgard = async (atgard: string) => {
    setArbetar(true);
    const ny = await sjalvservice<Testlage>("testlage", { atgard });
    if (ny) uppdatera(ny);
    setArbetar(false);
  };
  return (
    <div className="bg-amber-300 text-amber-950 text-[11px] shrink-0">
      <button type="button" onClick={() => setOppen((v) => !v)} className="w-full px-4 py-1.5 flex items-center gap-2 font-bold" aria-expanded={oppen}>
        <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{lage.lage === "personal" ? "PERSONALCHATT" : "TESTLÄGE"}</span>
        <span className="font-normal truncate">
          {lage.system === "timewave" ? "· RIKTIG TIMEWAVE-DATA" : ""}
          {lage.inloggad ? ` · ${lage.inloggad.namn} (kund ${lage.inloggad.kundId})` : lage.system === "test" ? " · påhittade kunder, inget går till TimeWave" : ""}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${oppen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {oppen && (
        <div className="px-4 pb-3 space-y-2 max-h-56 overflow-y-auto">
          {lage.system === "timewave" ? (
            <p>
              Riktiga bokningar och scheman från TimeWave, bara för testkundnumren.{" "}
              {lage.skriver ? "Ändringar SKRIVS till TimeWave." : "Chatten läser bara – ingenting skrivs till TimeWave."}
            </p>
          ) : (
            <p>Påhittade kunder, personal och scheman. Ingenting skickas till TimeWave eller kundservice.</p>
          )}
          {lage.system === "test" && (<>
          <p className="font-bold">Nästa bekräftelse:</p>
          <div className="flex flex-wrap gap-1.5">
            {SIMULERINGAR.map((s) => (
              <button
                key={s.lage}
                type="button"
                disabled={arbetar}
                onClick={() => atgard(s.lage)}
                className={`px-2 py-1 rounded-full border border-amber-950/30 ${lage.simulera === s.lage ? "bg-amber-950 text-amber-50" : "bg-amber-100"}`}
              >
                {s.etikett}
              </button>
            ))}
          </div>
          <button type="button" disabled={arbetar} onClick={() => atgard("aterstall")} className="underline">
            Återställ testdata
          </button>
          </>)}
          {lage.logg.length > 0 && (
            <div>
              <p className="font-bold">Logg (senaste först):</p>
              <ul className="space-y-1 mt-1 font-mono text-[10px]">
                {lage.logg.map((l) => (
                  <li key={l.tid}>
                    {l.tid.slice(11, 19)} {l.utfall} · {l.bokningId} · {l.fore} → {l.efter} · {l.avgiftKr} kr · {l.systemsvar}
                    {l.forturUtanAnstalld && l.forturUtanAnstalld.length > 0 && <> · förtur: {l.forturUtanAnstalld.join(", ")} utan anställd</>}
                    {l.ekonomi && <> · avgift: {l.ekonomi}</>}
                    {l.sms && <> · sms: {l.sms}</>}
                    {l.mejl && (
                      <details className="mt-1">
                        <summary className="cursor-pointer underline">Mejl till info@stodona.se</summary>
                        <pre className="whitespace-pre-wrap bg-amber-100 rounded p-2 mt-1">{l.mejl}</pre>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const BOTBUBBLA = "bg-bg-primary text-text-primary rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[80%] whitespace-pre-wrap";

export default function ChatWidget({ lage }: { lage?: "personal" } = {}) {
  chattLage = lage;
  const { lang } = useLanguage();
  const s = TEXT[lang === "EN" ? "EN" : "SV"];
  // Personalchatten öppnas direkt.
  const [oppen, setOppen] = useState(lage === "personal");
  /** Inbjudan bredvid chattknappen – en gång per besök, och aldrig i personalchatten. */
  const [inbjudan, setInbjudan] = useState(false);
  /** Kunden tryckte "Annat" – textfältet får en tydligare uppmaning. */
  const [annatValt, setAnnatValt] = useState(false);
  useEffect(() => {
    if (lage === "personal") return;
    let visad = false;
    try { visad = sessionStorage.getItem("stodona-chat-inbjudan") === "1"; } catch { /* strunt i det */ }
    if (visad) return;
    const id = window.setTimeout(() => setInbjudan(true), 3500);
    return () => window.clearTimeout(id);
  }, [lage]);
  const stangInbjudan = () => {
    setInbjudan(false);
    try { sessionStorage.setItem("stodona-chat-inbjudan", "1"); } catch { /* strunt i det */ }
  };
  // Cookiebannern ligger över allt annat på mobil. Chatten visas ändå direkt –
  // den kräver inget samtycke – men bubblan lyfts tills rutan är besvarad.
  const [cookiesBesvarade, setCookiesBesvarade] = useState(false);
  const [meddelanden, setMeddelanden] = useState<Meddelande[]>([]);
  const [utkast, setUtkast] = useState("");
  /** Sant medan svaret strömmar in från servern. */
  const [svarar, setSvarar] = useState(false);
  /** Vilket botsvar som skrivs ut just nu, och hur många tecken som syns. */
  const [skrivIndex, setSkrivIndex] = useState<number | null>(null);
  const [synligLangd, setSynligLangd] = useState(0);
  /** Om "Camilla skriver"-prickarna ska synas för svaret som är på väg. */
  const [prickar, setPrickar] = useState(false);
  /** null = välkomsthälsningen syns i sin helhet. */
  // Välkomsthälsningen står redan där när chatten öppnas (Mikaela 2026-09-25) –
  // ingen skrivanimation. null = hela hälsningen syns.
  const valkomstLangd = null as number | null;
  const valkomstPrickar = false;
  /** Bilder och videor som valts men inte skickats. */
  const [valda, setValda] = useState<ValdFil[]>([]);
  const [laddarUpp, setLaddarUpp] = useState(false);
  const [bilagefel, setBilagefel] = useState("");
  const filRef = useRef<HTMLInputElement>(null);
  /** Identifieringsrutan: SMS-kod för kunderna, testinloggning lokalt och för personalen. */
  const [bankidOppen, setBankidOppen] = useState(false);
  const [bankidVantar, setBankidVantar] = useState(false);
  const [bankidFel, setBankidFel] = useState("");
  const [testkunder, setTestkunder] = useState<{ id: string; namn: string }[]>([]);
  /** Inloggning med engångskod via SMS. */
  const [smsFinns, setSmsFinns] = useState(false);
  const [smsTelefon, setSmsTelefon] = useState("");
  const [smsKod, setSmsKod] = useState("");
  const [smsSkickad, setSmsSkickad] = useState(false);
  const [smsInfo, setSmsInfo] = useState("");
  /** Numret står på flera konton: kunden väljer efter rätt kod. */
  const [smsKonton, setSmsKonton] = useState<{ nummer: string; namn: string }[]>([]);
  /** Personalmiljön: valfritt kundnummer att logga in som. */
  const [valfrittKundnr, setValfrittKundnr] = useState("");
  /** Självservicens testläge, enligt servern. null = självservicen finns inte. */
  const [testlage, setTestlage] = useState<Testlage | null>(null);
  /** Räknas upp när sammanfattningskorten ska hämtas på nytt. */
  const [kortVersion, setKortVersion] = useState(0);
  const sjalvservicePa = Boolean(testlage);

  const listaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skrivStart = useRef(0);
  const pauser = useRef({ las: 0, skriv: 0 });
  const minskadRorelse = useRef(false);
  // Skrivloopen läser senaste läget via refs, så intervallet inte startas om
  // vid varje nytt tecken.
  const meddelandenRef = useRef(meddelanden);
  const svararRef = useRef(svarar);
  const synligRef = useRef(synligLangd);
  useEffect(() => { meddelandenRef.current = meddelanden; }, [meddelanden]);
  useEffect(() => { svararRef.current = svarar; }, [svarar]);
  useEffect(() => { synligRef.current = synligLangd; }, [synligLangd]);

  const skriver = svarar || skrivIndex !== null;

  useEffect(() => {
    try {
      minskadRorelse.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch { /* strunt i det */ }
  }, []);

  useEffect(() => {
    const kolla = () => {
      try {
        setCookiesBesvarade(!!localStorage.getItem("cookie-consent"));
      } catch {
        setCookiesBesvarade(true);
      }
    };
    kolla();
    const id = window.setInterval(kolla, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Samtalet överlever en omladdning, men bara i den här fliken.
  useEffect(() => {
    try {
      const sparat = sessionStorage.getItem(nyckel(LAGRINGSNYCKEL));
      if (sparat) setMeddelanden(JSON.parse(sparat));
    } catch { /* strunt i det */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(nyckel(LAGRINGSNYCKEL), JSON.stringify(meddelanden.slice(-24)));
    } catch { /* strunt i det */ }
  }, [meddelanden]);

  // Följ texten nedåt medan Camilla skriver, och scrolla även när hon skrivit
  // klart – knapparna visas först då, utan att något meddelande ändras.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const animerar = skrivIndex !== null || valkomstLangd !== null;
    lista.scrollTo({ top: lista.scrollHeight, behavior: animerar ? "auto" : "smooth" });
  }, [meddelanden, svarar, synligLangd, skrivIndex, valkomstLangd, prickar, valkomstPrickar]);

  // Frågar servern om självservicen finns, och i så fall om testläget.
  const uppdateraTestlage = async () => {
    if (!SJALVSERVICE_KAN_FINNAS && chattLage !== "personal") return;
    const lage = await sjalvservice<Testlage>("status");
    setTestlage(lage?.testlage ? lage : null);
  };
  useEffect(() => {
    if (oppen) uppdateraTestlage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oppen]);

  useEffect(() => {
    if (!oppen) return;
    const vidTangent = (e: KeyboardEvent) => e.key === "Escape" && setOppen(false);
    window.addEventListener("keydown", vidTangent);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", vidTangent);
  }, [oppen]);



  // Skriver ut botens svar tecken för tecken. Svaret strömmar in från servern i
  // bitar; loopen visar dem i jämn takt och blir klar först när strömmen är
  // slut OCH allt syns.
  useEffect(() => {
    if (skrivIndex === null) return;
    const id = window.setInterval(() => {
      const m = meddelandenRef.current[skrivIndex];
      if (!m) {
        setSkrivIndex(null);
        return;
      }
      const mal = antalTecken(delaUppVal(m.text).text);
      if (!minskadRorelse.current) {
        const gatt = Date.now() - skrivStart.current;
        if (gatt < pauser.current.las) return;
        setPrickar(true);
        if (gatt < pauser.current.las + pauser.current.skriv) return;
      }

      const nu = synligRef.current;
      const nasta = minskadRorelse.current ? mal : Math.min(mal, nu + teckenPerTick(mal - nu));
      if (nasta !== nu) {
        synligRef.current = nasta;
        setSynligLangd(nasta);
      }
      if (!svararRef.current && nasta >= mal) setSkrivIndex(null);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [skrivIndex]);

  function valjFiler(lista: FileList | null) {
    setBilagefel("");
    const nya: ValdFil[] = [];
    for (const fil of Array.from(lista ?? [])) {
      const typ = filtyp(fil);
      if (!typ) {
        setBilagefel(s.felTyp);
        continue;
      }
      if (fil.size > (typ === "video" ? MAX_VIDEO_MB : MAX_BILD_MB) * 1024 * 1024) {
        setBilagefel(s.forStor);
        continue;
      }
      nya.push({ id: crypto.randomUUID(), fil, typ, forhands: URL.createObjectURL(fil) });
    }
    const alla = [...valda, ...nya];
    if (alla.length > MAX_FILER) {
      setBilagefel(s.maxAntal);
      alla.slice(MAX_FILER).forEach((v) => URL.revokeObjectURL(v.forhands));
    }
    setValda(alla.slice(0, MAX_FILER));
    if (filRef.current) filRef.current.value = "";
    inputRef.current?.focus();
  }

  async function oppnaBankid() {
    setBankidFel("");
    setBankidOppen(true);
    try {
      const svar = await fetch("/api/kund-bankid");
      const data = await svar.json();
      if (Array.isArray(data?.testkunder)) setTestkunder(data.testkunder);
      setSmsFinns(data?.sms === true);
    } catch {
      setBankidFel(s.bankidFel);
    }
  }

  /**
   * Engångskod via SMS. Servern skickar koden bara till mobilnumret som redan
   * finns på kunden i TimeWave, och svarar likadant oavsett om numret finns.
   */
  async function smsAnrop(kropp: Record<string, string>) {
    const r = await fetch("/api/kund-bankid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samtalsId: samtalsId(), ...kropp }),
    });
    return { ok: r.ok, data: await r.json().catch(() => ({})) };
  }

  async function skickaSmsKod() {
    if (bankidVantar || !smsTelefon.trim()) return;
    setBankidFel("");
    setBankidVantar(true);
    try {
      const svar = await smsAnrop({ handling: "sms-skicka", telefon: smsTelefon });
      if (!svar.ok) throw new Error(svar.data?.error || s.bankidFel);
      setSmsSkickad(true);
      setSmsInfo(svar.data?.meddelande || "");
    } catch (f) {
      setBankidFel(f instanceof Error && f.message.length < 160 ? f.message : s.bankidFel);
    } finally {
      setBankidVantar(false);
    }
  }

  async function kontrolleraSmsKod() {
    if (bankidVantar || smsKod.length < 6) return;
    setBankidFel("");
    setBankidVantar(true);
    try {
      const svar = await smsAnrop({ handling: "sms-kolla", kod: smsKod });
      if (svar.ok && svar.data?.status === "valj" && Array.isArray(svar.data.konton)) {
        setSmsKonton(svar.data.konton);
        return;
      }
      if (!svar.ok || svar.data?.status !== "klar") throw new Error(svar.data?.error || s.bankidFel);
      inloggadMedSms();
    } catch (f) {
      setBankidFel(f instanceof Error && f.message.length < 160 ? f.message : s.bankidFel);
      setSmsKod("");
    } finally {
      setBankidVantar(false);
    }
  }

  async function valjSmsKonto(kundnummer: string) {
    if (bankidVantar) return;
    setBankidFel("");
    setBankidVantar(true);
    try {
      const svar = await smsAnrop({ handling: "sms-valj", kundnummer });
      if (!svar.ok || svar.data?.status !== "klar") throw new Error(svar.data?.error || s.bankidFel);
      inloggadMedSms();
    } catch (f) {
      setBankidFel(f instanceof Error && f.message.length < 160 ? f.message : s.bankidFel);
      setSmsKonton([]);
      setSmsSkickad(false);
      setSmsKod("");
    } finally {
      setBankidVantar(false);
    }
  }

  // Andra sidor kan öppna chatten, gärna med en färdig fråga – t.ex. korten på
  // stodona.se/chatt: window.dispatchEvent(new CustomEvent("stodona:chatt", { detail: { fraga } })).
  const skickaRef = useRef(skicka);
  skickaRef.current = skicka;
  useEffect(() => {
    if (lage === "personal") return;
    const oppna = (e: Event) => {
      const fraga = (e as CustomEvent<{ fraga?: string }>).detail?.fraga;
      stangInbjudan();
      setOppen(true);
      track("chat_open", { kalla: "chattsidan" });
      if (fraga) window.setTimeout(() => skickaRef.current(fraga), 350);
    };
    window.addEventListener("stodona:chatt", oppna);
    return () => window.removeEventListener("stodona:chatt", oppna);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lage]);

  /** Inloggad med SMS-kod: stäng rutan och låt Camilla fortsätta ärendet. */
  function inloggadMedSms() {
    setSmsKonton([]);
    setBankidOppen(false);
    setSmsSkickad(false);
    setSmsKod("");
    setSmsTelefon("");
    setSmsInfo("");
    uppdateraTestlage();
    skicka("Jag har legitimerat mig nu.");
  }

  /**
   * Testinloggningen: kunden väljer vem hen är, och servern kopplar kunden
   * till samtalet.
   */
  async function startaBankid(testkundId: string) {
    if (bankidVantar) return;
    setBankidFel("");
    setBankidVantar(true);
    try {
      const start = await fetch("/api/kund-bankid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samtalsId: samtalsId(), handling: "starta", testkundId }),
      });
      const startData = await start.json();
      if (!start.ok || !startData?.ordernummer) throw new Error(startData?.error || "start misslyckades");

      for (let forsok = 0; forsok < 30; forsok++) {
        await new Promise((klar) => setTimeout(klar, 1000));
        const koll = await fetch("/api/kund-bankid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ samtalsId: samtalsId(), handling: "kolla", ordernummer: startData.ordernummer }),
        });
        const data = await koll.json();
        if (!koll.ok) throw new Error(data?.error || "kontrollen misslyckades");
        if (data.status === "klar") {
          setBankidOppen(false);
          setBankidVantar(false);
          // Camilla bekräftar själv vem kunden är i nästa svar, så ingen egen rad här.
          uppdateraTestlage();
          skicka("Jag har legitimerat mig nu.");
          return;
        }
      }
      throw new Error("tog för lång tid");
    } catch (f) {
      setBankidFel(f instanceof Error && f.message.length < 120 ? f.message : s.bankidFel);
    } finally {
      setBankidVantar(false);
    }
  }

  function taBort(id: string) {
    const bort = valda.find((v) => v.id === id);
    if (bort) URL.revokeObjectURL(bort.forhands);
    setValda(valda.filter((v) => v.id !== id));
    setBilagefel("");
  }

  /**
   * Kunden tryckte "Bekräfta ombokning". Ändringen görs av servern – inte av
   * Camilla – och det är serverns svar som visas. Först när servern svarat
   * SUCCESS står det att bokningen är ändrad.
   */
  async function bekrafta(forslagId: string) {
    if (skriver) return;
    type Svar = { utfall: string; text: string; fortsatt?: string };
    const resultat = await sjalvservice<Svar>("bekrafta", { forslagId });
    const text = resultat?.text ?? "Jag kunde inte nå bokningssystemet, så ingenting är ändrat. Försök igen om en stund, eller ring 010-178 01 50.";
    const nya: Meddelande[] = [...meddelandenRef.current, { roll: "user", text: "Bekräfta ombokning" }, { roll: "assistant", text }];
    meddelandenRef.current = nya;
    setMeddelanden(nya);
    setKortVersion((v) => v + 1);
    track("chat_ombokning", { utfall: resultat?.utfall ?? "natverksfel" });
    uppdateraTestlage();
    // T.ex. när tiden hann bli upptagen: Camilla hämtar nya tider direkt.
    if (resultat?.fortsatt) await skicka(resultat.fortsatt, [], true);
  }

  /** @param dold skickas till Camilla utan att synas som kundens bubbla (systemets egna fortsättningar). */
  async function skicka(fraga: string, filer: ValdFil[] = [], dold = false) {
    const rensad = fraga.trim();
    if (!dold) setAnnatValt(false);
    if ((!rensad && !filer.length) || (skriver && !dold) || laddarUpp) return;

    // Filerna laddas upp först. Går det inte ligger de kvar, så kunden kan försöka igen.
    let bilagor: Bilaga[] = [];
    if (filer.length) {
      setLaddarUpp(true);
      setBilagefel("");
      try {
        bilagor = await Promise.all(filer.map(laddaUpp));
      } catch {
        setBilagefel(s.uppladdningFel);
        return;
      } finally {
        setLaddarUpp(false);
      }
      filer.forEach((v) => URL.revokeObjectURL(v.forhands));
      setValda([]);
    }

    const historik: Meddelande[] = dold
      ? [...meddelandenRef.current]
      : [...meddelandenRef.current, { roll: "user", text: rensad, ...(bilagor.length ? { bilagor } : {}) }];
    setMeddelanden([...historik, { roll: "assistant", text: "" }]);
    setUtkast("");
    setSvarar(true);
    svararRef.current = true;
    synligRef.current = 0;
    setSynligLangd(0);
    skrivStart.current = Date.now();
    pauser.current = { las: lasPaus(), skriv: skrivPaus() };
    setPrickar(false);
    setSkrivIndex(historik.length);
    track("chat_message", { length: rensad.length, bilagor: bilagor.length });

    try {
      // Bara frågan, länkarna till bilagorna och samtals-id:t skickas. Servern
      // håller historiken, så ingen kan förfalska vad boten redan sagt.
      const svar = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: samtalsId(), message: rensad, bilagor: bilagor.map((b) => ({ url: b.url })), ...(lage ? { lage } : {}) }),
      });

      if (!svar.ok) {
        const text = await svar.text();
        let meddelande = s.fel;
        try {
          const tolkat = JSON.parse(text);
          if (typeof tolkat?.error === "string") meddelande = tolkat.error;
        } catch { /* behåll standardtexten */ }
        setMeddelanden([...historik, { roll: "assistant", text: meddelande }]);
        return;
      }
      if (!svar.body) throw new Error("chat saknar svar");

      const lasare = svar.body.getReader();
      const avkodare = new TextDecoder();
      let samlat = "";
      for (;;) {
        const { done, value } = await lasare.read();
        if (done) break;
        samlat += avkodare.decode(value, { stream: true });
        setMeddelanden([...historik, { roll: "assistant", text: samlat }]);
      }
      if (!samlat.trim()) setMeddelanden([...historik, { roll: "assistant", text: s.fel }]);
    } catch {
      setMeddelanden([...historik, { roll: "assistant", text: s.fel }]);
    } finally {
      svararRef.current = false;
      setSvarar(false);
    }
  }

  if (!PASLAGEN && lage !== "personal") return null;

  const sista = meddelanden[meddelanden.length - 1];
  const knappval = sista && sista.roll === "assistant" && !skriver ? delaUppVal(sista.text).val : [];
  const bankidErbjuds = Boolean(
    sjalvservicePa && sista && sista.roll === "assistant" && !skriver && delaUppVal(sista.text).bankid && !bankidOppen
  );

  return (
    <>
      {/* Bubblan sitter ovanför den mobila bokningsremsan (z-9990) men under
          cookiebannern (z-9999). Stängd visar den Camilla, öppen ett kryss. */}
      <AnimatePresence>
        {inbjudan && !oppen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className={`fixed ${cookiesBesvarade ? "bottom-40 md:bottom-24" : "bottom-80 md:bottom-60"} right-4 md:right-8 z-[9995] max-w-[260px] rounded-2xl rounded-br-sm bg-white shadow-xl ring-1 ring-text-primary/10 pl-4 pr-8 py-3 text-sm text-text-primary`}
          >
            <button
              type="button"
              onClick={() => {
                stangInbjudan();
                setOppen(true);
                track("chat_open", { kalla: "inbjudan" });
              }}
              className="text-left"
            >
              <span className="block text-xs font-bold mb-0.5">Camilla</span>
              {s.inbjudan}
            </button>
            <button
              type="button"
              onClick={stangInbjudan}
              aria-label={s.stangInbjudan}
              className="absolute top-2 right-2 text-text-secondary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          stangInbjudan();
          setOppen((v) => {
            if (!v) track("chat_open", {});
            return !v;
          });
        }}
        aria-label={oppen ? s.stang : s.oppna}
        aria-expanded={oppen}
        className={`fixed ${cookiesBesvarade ? "bottom-24 md:bottom-8" : "bottom-64 md:bottom-44"} right-4 md:right-8 z-[9995] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
          oppen
            ? "bg-bg-dark text-text-light hover:bg-accent hover:text-text-primary"
            : "bg-bg-primary ring-2 ring-white hover:ring-accent"
        }`}
      >
        {oppen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <img src={AVATAR} alt="" className="w-full h-full rounded-full object-cover" />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Mobil: sidan bakom tonas ner när chatten är öppen. Ett tryck utanför stänger. */}
      <AnimatePresence>
        {oppen && lage !== "personal" && (
          <motion.div
            key="bakgrund"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOppen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {oppen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label={s.rubrik}
            className="fixed z-[10000] bg-white shadow-2xl flex flex-col overflow-hidden inset-x-3 bottom-40 top-20 rounded-3xl md:inset-x-auto md:top-auto md:right-8 md:bottom-28 md:w-[400px] md:h-[min(560px,calc(100vh-9rem))]"
          >
            <div className="bg-bg-dark text-text-light px-4 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="relative">
                  <Avatar storlek={40} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-bg-dark" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold leading-tight">{s.namn}</p>
                  <p className="text-text-light/60 text-xs mt-0.5">{s.underrubrik}</p>
                </div>
              </div>
              <button onClick={() => setOppen(false)} aria-label={s.stang} className="text-text-light/60 hover:text-text-light">
                <X className="w-5 h-5" />
              </button>
            </div>

            {testlage && testlage.lage !== "kund" && <TestlageBanderoll lage={testlage} uppdatera={setTestlage} />}

            <div ref={listaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
              {(valkomstLangd !== 0 || valkomstPrickar) && (
              <div className="flex items-end gap-2">
                <Avatar />
                <div className={BOTBUBBLA}>
                  {valkomstLangd === 0 ? (
                    <SkriverPrickar etikett={s.skriver} />
                  ) : valkomstLangd === null ? (
                    s.valkommen
                  ) : (
                    <>
                      <span aria-hidden="true">{forstaTecken(s.valkommen, valkomstLangd)}</span>
                      <span className="sr-only">{s.skriver}</span>
                    </>
                  )}
                </div>
              </div>
              )}

              {meddelanden.map((m, i) => {
                if (m.roll === "user") {
                  const bilagor = (m.bilagor ?? []).filter((b) => sakerBilaga(b.url));
                  return (
                    <div key={i} className="ml-auto max-w-[80%] w-fit flex flex-col items-end gap-1.5">
                      {bilagor.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {bilagor.map((b) => (
                            <a
                              key={b.url}
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative block w-24 h-24 rounded-xl overflow-hidden ring-1 ring-text-primary/10 bg-bg-dark text-text-light"
                            >
                              {b.typ === "bild" ? (
                                <>
                                  {/* Filen raderas när ärendet mejlats till kundservice – då syns texten i stället. */}
                                  <span className="absolute inset-0 flex items-center justify-center px-1.5 text-[10px] text-center">{s.bildSkickad}</span>
                                  <img
                                    src={b.url}
                                    alt={b.namn}
                                    className="relative w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.visibility = "hidden";
                                    }}
                                  />
                                </>
                              ) : (
                                <span className="w-full h-full flex flex-col items-center justify-center gap-1 px-1.5 text-[10px] text-center">
                                  <Video className="w-5 h-5" aria-hidden="true" />
                                  <span className="truncate w-full">{b.namn}</span>
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      {m.text && (
                        <div className="bg-bg-dark text-text-light rounded-2xl rounded-br-sm px-4 py-3 text-sm whitespace-pre-wrap">
                          {m.text}
                        </div>
                      )}
                    </div>
                  );
                }
                const { text: ren, bekrafta: kortId } = delaUppVal(m.text);
                const skrivsNu = i === skrivIndex;
                const synlig = skrivsNu ? forstaTecken(ren, synligLangd) : ren;
                // Under läspausen syns ingenting alls – varken bubbla eller prickar.
                if (skrivsNu && synlig.length === 0 && !prickar) return null;
                return (
                  <div key={i}>
                    <div className="flex items-end gap-2">
                      <Avatar />
                      <div className={BOTBUBBLA}>
                        {skrivsNu && synlig.length === 0 ? (
                          <SkriverPrickar etikett={s.skriver} />
                        ) : (
                          <>
                            <span aria-hidden={skrivsNu || undefined}>{medLankar(synlig)}</span>
                            {skrivsNu && <span className="sr-only">{s.skriver}</span>}
                          </>
                        )}
                      </div>
                    </div>
                    {sjalvservicePa && kortId && !skrivsNu && (
                      <Ombokningskort
                        id={kortId}
                        upptagen={skriver}
                        laddaOm={kortVersion}
                        onBekrafta={bekrafta}
                        onAvbryt={() => skicka("Avbryt – jag behåller min nuvarande bokning.")}
                      />
                    )}
                  </div>
                );
              })}

              {knappval.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 pl-9" role="group" aria-label="Välj ett alternativ">
                  {knappval.map((v) => (
                    <button
                      key={v}
                      onClick={() => skicka(v)}
                      className="text-sm px-4 py-2 rounded-full border border-text-primary/25 text-text-primary bg-white hover:bg-bg-dark hover:text-text-light hover:border-bg-dark transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                  {/* "Annat" finns alltid sist: kunden skriver själv i stället för att välja. */}
                  {!knappval.some((v) => /^annat$/i.test(v)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnnatValt(true);
                        inputRef.current?.focus();
                      }}
                      className="text-sm px-4 py-2 rounded-full border border-dashed border-text-primary/30 text-text-secondary bg-white hover:border-text-primary hover:text-text-primary transition-colors"
                    >
                      {s.annat}
                    </button>
                  )}
                </div>
              )}

              {bankidErbjuds && (
                <div className="pt-1 pl-9">
                  <button
                    onClick={oppnaBankid}
                    className="text-sm px-4 py-2.5 rounded-xl bg-bg-dark text-text-light font-medium hover:bg-accent hover:text-text-primary transition-colors"
                  >
                    {s.bankidKnapp}
                  </button>
                </div>
              )}

              {meddelanden.length === 0 && valkomstLangd === null && (
                <div className="flex flex-wrap gap-2 pt-1 pl-9">
                  {s.forslag.map((f) => (
                    <button
                      key={f}
                      onClick={() => skicka(f)}
                      className="text-xs px-3 py-2 rounded-full border border-text-primary/15 text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {sjalvservicePa && bankidOppen && (
              <div className="border-t border-text-primary/10 bg-bg-primary/60 p-4 shrink-0">
                <p className="text-sm font-bold text-text-primary">{s.bankidRubrik}</p>
                {smsFinns && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] text-text-secondary">
                      {smsSkickad ? smsInfo : "Få en kod med SMS till mobilnumret du har registrerat hos oss."}
                    </p>
                    {smsKonton.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] text-text-primary">Numret finns på flera konton. Vilket gäller det?</p>
                        {smsKonton.map((k) => (
                          <button
                            key={k.nummer}
                            type="button"
                            onClick={() => valjSmsKonto(k.nummer)}
                            disabled={bankidVantar}
                            className="text-left text-sm px-4 py-2.5 rounded-xl bg-white border border-text-primary/15 hover:border-text-primary transition-colors disabled:opacity-40"
                          >
                            {k.namn} (kund {k.nummer})
                          </button>
                        ))}
                      </div>
                    ) : !smsSkickad ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={smsTelefon}
                          onChange={(e) => setSmsTelefon(e.target.value.slice(0, 20))}
                          onKeyDown={(e) => e.key === "Enter" && skickaSmsKod()}
                          placeholder="Mobilnummer"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          disabled={bankidVantar}
                          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white border border-text-primary/15 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                        />
                        <button
                          type="button"
                          onClick={skickaSmsKod}
                          disabled={bankidVantar || !smsTelefon.trim()}
                          className="px-4 py-2.5 rounded-xl bg-bg-dark text-text-light text-sm shrink-0 disabled:opacity-40"
                        >
                          Skicka kod
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            value={smsKod}
                            onChange={(e) => setSmsKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            onKeyDown={(e) => e.key === "Enter" && kontrolleraSmsKod()}
                            placeholder="6 siffror"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            disabled={bankidVantar}
                            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white border border-text-primary/15 text-sm tracking-widest outline-none focus:ring-2 focus:ring-accent/40"
                          />
                          <button
                            type="button"
                            onClick={kontrolleraSmsKod}
                            disabled={bankidVantar || smsKod.length < 6}
                            className="px-4 py-2.5 rounded-xl bg-bg-dark text-text-light text-sm shrink-0 disabled:opacity-40"
                          >
                            Logga in
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSmsSkickad(false);
                            setSmsKod("");
                            setBankidFel("");
                          }}
                          className="text-[11px] text-text-secondary underline"
                        >
                          Fel nummer eller ingen kod? Försök igen
                        </button>
                      </>
                    )}
                  </div>
                )}
                {testkunder.length > 0 && (
                <>
                <p className="text-[11px] text-text-secondary mt-3">{s.bankidTestlage}</p>
                <div className="flex flex-col gap-2 mt-2">
                  {testkunder.some((k) => k.id === "*") && (
                    <div className="flex items-center gap-2">
                      <input
                        value={valfrittKundnr}
                        onChange={(e) => setValfrittKundnr(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Kundnummer"
                        inputMode="numeric"
                        disabled={bankidVantar}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white border border-text-primary/15 text-sm outline-none focus:ring-2 focus:ring-accent/40"
                      />
                      <button
                        type="button"
                        onClick={() => startaBankid(valfrittKundnr)}
                        disabled={bankidVantar || !valfrittKundnr}
                        className="px-4 py-2.5 rounded-xl bg-bg-dark text-text-light text-sm shrink-0 disabled:opacity-40"
                      >
                        Logga in
                      </button>
                    </div>
                  )}
                  {testkunder.filter((k) => k.id !== "*").map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => startaBankid(k.id)}
                      disabled={bankidVantar}
                      className="text-left text-sm px-4 py-2.5 rounded-xl bg-white border border-text-primary/15 hover:border-text-primary transition-colors disabled:opacity-40"
                    >
                      Logga in som {k.namn}
                    </button>
                  ))}
                </div>
                </>
                )}
                {bankidVantar && (
                  <p className="text-[11px] text-text-secondary mt-2 flex items-center gap-2" role="status">
                    <Loader2 className="w-3 h-3 animate-spin" /> {s.bankidVantar}
                  </p>
                )}
                {bankidFel && <p className="text-[11px] text-red-700 mt-2" role="alert">{bankidFel}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setBankidOppen(false);
                    setBankidFel("");
                  }}
                  disabled={bankidVantar}
                  className="text-[11px] text-text-secondary underline mt-2 disabled:opacity-40"
                >
                  {s.bankidAvbryt}
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                skicka(utkast, valda);
              }}
              className="border-t border-text-primary/10 p-3 shrink-0"
            >
              {(valda.length > 0 || bilagefel || laddarUpp) && (
                <div className="mb-2 space-y-1.5">
                  {valda.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pt-1.5 pr-1.5">
                      {valda.map((v) => (
                        <div key={v.id} className="relative shrink-0">
                          {v.typ === "bild" ? (
                            <img src={v.forhands} alt={v.fil.name} className="w-14 h-14 object-cover rounded-lg bg-bg-primary" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-bg-dark text-text-light flex items-center justify-center" title={v.fil.name}>
                              <Video className="w-5 h-5" aria-hidden="true" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => taBort(v.id)}
                            disabled={laddarUpp}
                            aria-label={`${s.taBort} ${v.fil.name}`}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg-dark text-text-light flex items-center justify-center ring-2 ring-white disabled:opacity-40"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {laddarUpp && <p className="text-[11px] text-text-secondary px-1" role="status">{s.laddarUpp}</p>}
                  {bilagefel && <p className="text-[11px] text-red-700 px-1" role="alert">{bilagefel}</p>}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={filRef}
                  type="file"
                  accept={TILLATNA_FILER}
                  multiple
                  className="hidden"
                  onChange={(e) => valjFiler(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => filRef.current?.click()}
                  disabled={skriver || laddarUpp || valda.length >= MAX_FILER}
                  aria-label={s.bifoga}
                  title={s.bifoga}
                  className="w-10 h-10 -mr-1 rounded-full text-text-secondary flex items-center justify-center shrink-0 disabled:opacity-40 hover:text-text-primary hover:bg-bg-primary transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={inputRef}
                  value={utkast}
                  onChange={(e) => setUtkast(e.target.value)}
                  placeholder={annatValt ? s.annatPlatshallare : s.platshallare}
                  maxLength={1500}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-bg-primary text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  disabled={skriver || laddarUpp || (!utkast.trim() && valda.length === 0)}
                  aria-label={s.skicka}
                  className="w-10 h-10 rounded-full bg-bg-dark text-text-light flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-accent hover:text-text-primary transition-colors"
                >
                  {laddarUpp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-end gap-3 mt-2 px-1">
                <a href="tel:0101780150" className="text-[11px] inline-flex items-center gap-1 text-text-secondary hover:text-text-primary shrink-0">
                  <Phone className="w-3 h-3" /> {s.ring}
                </a>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
