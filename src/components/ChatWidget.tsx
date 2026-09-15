import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Send, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { track } from "../utils/analytics";

interface Meddelande {
  roll: "user" | "assistant";
  text: string;
}

const LAGRINGSNYCKEL = "stodona-chat";
const IDNYCKEL = "stodona-chat-id";
/** Välkomsthälsningen skrivs ut en gång per flik – sedan visas den direkt. */
const HALSATNYCKEL = "stodona-chat-halsat";
const AVATAR = "/camilla.svg";

// Skrivtakt. En tick var 30:e ms med två tecken ger ungefär 65 tecken i
// sekunden – snabbt skrivande i en chatt. Långa svar skrivs fortare så de inte
// drar ut, och prickarna syns en stund innan första tecknet kommer.
const TICK_MS = 30;
const MIN_SKRIVER_MS = 850;
const teckenPerTick = (kvar: number) => (kvar > 200 ? 8 : kvar > 80 ? 4 : 2);

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
    const sparat = sessionStorage.getItem(IDNYCKEL);
    if (sparat) return sparat;
    const nytt = crypto.randomUUID();
    sessionStorage.setItem(IDNYCKEL, nytt);
    return nytt;
  } catch {
    return crypto.randomUUID();
  }
}

// Alltid på i den lokala testmiljön. I ett produktionsbygge krävs
// VITE_CHAT_ENABLED=true – men Layout monterar ändå bara widgeten i dev tills
// chatten är färdig.
const PASLAGEN = import.meta.env.DEV || import.meta.env.VITE_CHAT_ENABLED === "true";

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
    forslag: [
      "Vad kostar hemstädning?",
      "Vad ingår i en flyttstädning?",
      "Hur fungerar RUT-avdraget?",
      "Hur kopplar jag på e-faktura?",
    ],
    platshallare: "Skriv ett meddelande…",
    skicka: "Skicka",
    fel: "Jag når inte fram just nu. Ring 010-178 01 50 så hjälper vi dig direkt.",
    disclaimer: "Digital assistent – svaren kan innehålla fel.",
    ring: "Ring oss",
  },
  EN: {
    oppna: "Chat with Camilla",
    stang: "Close chat",
    rubrik: "Chat with Camilla at Stodona",
    namn: "Camilla",
    underrubrik: "Stodona's digital assistant",
    valkommen: "Welcome to Stodona! I'm Camilla, the assistant here at Stodona. How can I help you? 🤍✨",
    skriver: "Camilla is typing…",
    forslag: [
      "What does home cleaning cost?",
      "What is included in a move-out clean?",
      "How does the RUT deduction work?",
      "How do I set up e-invoicing?",
    ],
    platshallare: "Type a message…",
    skicka: "Send",
    fel: "I can't get through right now. Call +46 10 178 01 50 and we'll help you.",
    disclaimer: "Digital assistant – answers can contain mistakes.",
    ring: "Call us",
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
function delaUppVal(text: string): { text: string; val: string[] } {
  let val: string[] = [];
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
  return { text: ren.trimEnd(), val };
}

/** Gör länkar till våra egna adresser i botens svar klickbara. */
function medLankar(text: string) {
  // split med en fångstgrupp lägger varje träff på udda index.
  return text.split(ADRESS).map((bit, i) => {
    const url = /^https?:\/\//i.test(bit) ? bit : `https://${bit}`;
    return i % 2 === 1 && egenLank(url) ? (
      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="underline break-words hover:text-cta-hover">
        {bit.replace(/^https?:\/\//, "")}
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
      className="rounded-full shrink-0 ring-1 ring-text-primary/10 bg-bg-primary"
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

const BOTBUBBLA = "bg-bg-primary text-text-primary rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[80%] whitespace-pre-wrap";

export default function ChatWidget() {
  const { lang } = useLanguage();
  const s = TEXT[lang === "EN" ? "EN" : "SV"];
  const [oppen, setOppen] = useState(false);
  // Cookiebannern ligger över allt annat på mobil. Vänta med chattbubblan tills
  // besökaren svarat på den, annars krockar de på första besöket.
  const [cookiesBesvarade, setCookiesBesvarade] = useState(false);
  const [meddelanden, setMeddelanden] = useState<Meddelande[]>([]);
  const [utkast, setUtkast] = useState("");
  /** Sant medan svaret strömmar in från servern. */
  const [svarar, setSvarar] = useState(false);
  /** Vilket botsvar som skrivs ut just nu, och hur många tecken som syns. */
  const [skrivIndex, setSkrivIndex] = useState<number | null>(null);
  const [synligLangd, setSynligLangd] = useState(0);
  /** null = välkomsthälsningen syns i sin helhet. */
  const [valkomstLangd, setValkomstLangd] = useState<number | null>(null);

  const listaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skrivStart = useRef(0);
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
      const sparat = sessionStorage.getItem(LAGRINGSNYCKEL);
      if (sparat) setMeddelanden(JSON.parse(sparat));
    } catch { /* strunt i det */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(LAGRINGSNYCKEL, JSON.stringify(meddelanden.slice(-24)));
    } catch { /* strunt i det */ }
  }, [meddelanden]);

  // Följ texten nedåt medan Camilla skriver, och scrolla även när hon skrivit
  // klart – knapparna visas först då, utan att något meddelande ändras.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const animerar = skrivIndex !== null || valkomstLangd !== null;
    lista.scrollTo({ top: lista.scrollHeight, behavior: animerar ? "auto" : "smooth" });
  }, [meddelanden, svarar, synligLangd, skrivIndex, valkomstLangd]);

  useEffect(() => {
    if (!oppen) return;
    const vidTangent = (e: KeyboardEvent) => e.key === "Escape" && setOppen(false);
    window.addEventListener("keydown", vidTangent);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", vidTangent);
  }, [oppen]);

  // Välkomsthälsningen skrivs ut första gången chatten öppnas i fliken.
  useEffect(() => {
    if (!oppen) return;
    let halsat = false;
    try { halsat = sessionStorage.getItem(HALSATNYCKEL) === "1"; } catch { /* strunt i det */ }
    if (halsat || meddelandenRef.current.length > 0 || minskadRorelse.current) {
      setValkomstLangd(null);
      return;
    }
    try { sessionStorage.setItem(HALSATNYCKEL, "1"); } catch { /* strunt i det */ }

    const text = s.valkommen;
    const mal = antalTecken(text);
    const start = Date.now();
    setValkomstLangd(0);
    const id = window.setInterval(() => {
      if (Date.now() - start < MIN_SKRIVER_MS) return;
      setValkomstLangd((n) => {
        if (n === null) return null;
        const nasta = Math.min(mal, n + teckenPerTick(mal - n));
        if (nasta >= mal) {
          window.clearInterval(id);
          return null;
        }
        return nasta;
      });
    }, TICK_MS);
    return () => {
      window.clearInterval(id);
      setValkomstLangd(null);
    };
    // Texten läses när chatten öppnas; ett språkbyte mitt i animationen spelar ingen roll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!minskadRorelse.current && Date.now() - skrivStart.current < MIN_SKRIVER_MS) return;

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

  async function skicka(fraga: string) {
    const rensad = fraga.trim();
    if (!rensad || skriver) return;

    const historik: Meddelande[] = [...meddelanden, { roll: "user", text: rensad }];
    setMeddelanden([...historik, { roll: "assistant", text: "" }]);
    setUtkast("");
    setSvarar(true);
    svararRef.current = true;
    synligRef.current = 0;
    setSynligLangd(0);
    skrivStart.current = Date.now();
    setSkrivIndex(historik.length);
    track("chat_message", { length: rensad.length });

    try {
      // Bara frågan och samtals-id:t skickas. Servern håller historiken, så
      // ingen kan förfalska vad boten redan sagt.
      const svar = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: samtalsId(), message: rensad }),
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

  if (!PASLAGEN || !cookiesBesvarade) return null;

  const sista = meddelanden[meddelanden.length - 1];
  const knappval = sista && sista.roll === "assistant" && !skriver ? delaUppVal(sista.text).val : [];

  return (
    <>
      {/* Bubblan sitter ovanför den mobila bokningsremsan (z-9990) men under
          cookiebannern (z-9999). Stängd visar den Camilla, öppen ett kryss. */}
      <button
        onClick={() => {
          setOppen((v) => {
            if (!v) track("chat_open", {});
            return !v;
          });
        }}
        aria-label={oppen ? s.stang : s.oppna}
        aria-expanded={oppen}
        className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[9995] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
          oppen
            ? "bg-bg-dark text-text-light hover:bg-accent hover:text-text-primary"
            : "bg-bg-primary ring-2 ring-white hover:ring-accent"
        }`}
      >
        {oppen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <img src={AVATAR} alt="" className="w-full h-full rounded-full" />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" aria-hidden="true" />
          </>
        )}
      </button>

      <AnimatePresence>
        {oppen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label={s.rubrik}
            className="fixed z-[9995] bg-white shadow-2xl flex flex-col overflow-hidden inset-x-3 bottom-40 top-20 rounded-3xl md:inset-x-auto md:top-auto md:right-8 md:bottom-28 md:w-[400px] md:h-[min(560px,calc(100vh-9rem))]"
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

            <div ref={listaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
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

              {meddelanden.map((m, i) => {
                if (m.roll === "user") {
                  return (
                    <div
                      key={i}
                      className="bg-bg-dark text-text-light rounded-2xl rounded-br-sm px-4 py-3 text-sm ml-auto max-w-[80%] w-fit whitespace-pre-wrap"
                    >
                      {m.text}
                    </div>
                  );
                }
                const ren = delaUppVal(m.text).text;
                const skrivsNu = i === skrivIndex;
                const synlig = skrivsNu ? forstaTecken(ren, synligLangd) : ren;
                return (
                  <div key={i} className="flex items-end gap-2">
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                skicka(utkast);
              }}
              className="border-t border-text-primary/10 p-3 shrink-0"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={utkast}
                  onChange={(e) => setUtkast(e.target.value)}
                  placeholder={s.platshallare}
                  maxLength={1500}
                  className="flex-1 px-4 py-2.5 rounded-full bg-bg-primary text-sm outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  disabled={skriver || !utkast.trim()}
                  aria-label={s.skicka}
                  className="w-10 h-10 rounded-full bg-bg-dark text-text-light flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-accent hover:text-text-primary transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 mt-2 px-1">
                <p className="text-[11px] leading-tight text-text-secondary/80">{s.disclaimer}</p>
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
