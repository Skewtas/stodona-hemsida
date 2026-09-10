import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { track } from "../utils/analytics";

interface Meddelande {
  roll: "user" | "assistant";
  text: string;
}

const LAGRINGSNYCKEL = "stodona-chat";
const IDNYCKEL = "stodona-chat-id";

// Bara länkar till våra egna adresser görs klickbara. Skulle boten någon gång
// förmås att skriva ut en främmande länk blir den vanlig text i stället.
const TILLATNA_VARDAR = ["stodona.se", "www.stodona.se", "boka.stodona.se", "stodona.twportal.se"];

function egenLank(url: string): boolean {
  try {
    const u = new URL(url);
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

// Chatten är avstängd tills VITE_CHAT_ENABLED=true är satt i Vercel. Utan
// ANTHROPIC_API_KEY på servern kan boten ändå inte svara, och en bubbla som
// bara säger "jag når inte assistenten" är sämre än ingen bubbla alls.
const PASLAGEN = import.meta.env.VITE_CHAT_ENABLED === "true";

const TEXT = {
  SV: {
    oppna: "Öppna chatten",
    stang: "Stäng chatten",
    rubrik: "Fråga Stodona",
    underrubrik: "Svarar direkt, dygnet runt",
    valkommen: "Hej! Jag svarar på frågor om städning, priser, RUT och våra villkor. Vad undrar du över?",
    forslag: [
      "Vad kostar hemstädning?",
      "Vad ingår i en flyttstädning?",
      "Hur fungerar RUT-avdraget?",
      "Hur kopplar jag på e-faktura?",
    ],
    platshallare: "Skriv din fråga…",
    skicka: "Skicka",
    fel: "Jag når inte assistenten just nu. Ring 010-178 01 50 så hjälper vi dig direkt.",
    disclaimer: "Automatiserad assistent – kan ha fel.",
    ring: "Ring oss",
  },
  EN: {
    oppna: "Open chat",
    stang: "Close chat",
    rubrik: "Ask Stodona",
    underrubrik: "Answers instantly, around the clock",
    valkommen: "Hi! I answer questions about cleaning, prices, the RUT deduction and our terms. What would you like to know?",
    forslag: [
      "What does home cleaning cost?",
      "What is included in a move-out clean?",
      "How does the RUT deduction work?",
      "How do I set up e-invoicing?",
    ],
    platshallare: "Type your question…",
    skicka: "Send",
    fel: "I can't reach the assistant right now. Call +46 10 178 01 50 and we'll help you.",
    disclaimer: "Automated assistant – can be wrong.",
    ring: "Call us",
  },
};

/** Gör råa länkar i botens svar klickbara. */
function medLankar(text: string) {
  const bitar = text.split(/(https?:\/\/[^\s<>()]+[^\s<>().,!?])/g);
  return bitar.map((bit, i) =>
    /^https?:\/\//.test(bit) && egenLank(bit) ? (
      <a key={i} href={bit} target="_blank" rel="noopener noreferrer" className="underline break-words hover:text-cta-hover">
        {bit.replace(/^https?:\/\//, "")}
      </a>
    ) : (
      <span key={i}>{bit}</span>
    )
  );
}

export default function ChatWidget() {
  const { lang } = useLanguage();
  const s = TEXT[lang === "EN" ? "EN" : "SV"];
  const [oppen, setOppen] = useState(false);
  // Cookiebannern ligger över allt annat på mobil. Vänta med chattbubblan tills
  // besökaren svarat på den, annars krockar de på första besöket.
  const [cookiesBesvarade, setCookiesBesvarade] = useState(false);
  const [meddelanden, setMeddelanden] = useState<Meddelande[]>([]);
  const [utkast, setUtkast] = useState("");
  const [svarar, setSvarar] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [meddelanden]);

  useEffect(() => {
    if (!oppen) return;
    const vidTangent = (e: KeyboardEvent) => e.key === "Escape" && setOppen(false);
    window.addEventListener("keydown", vidTangent);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", vidTangent);
  }, [oppen]);

  async function skicka(fraga: string) {
    const rensad = fraga.trim();
    if (!rensad || svarar) return;

    const historik: Meddelande[] = [...meddelanden, { roll: "user", text: rensad }];
    setMeddelanden([...historik, { roll: "assistant", text: "" }]);
    setUtkast("");
    setSvarar(true);
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
      setSvarar(false);
    }
  }

  if (!PASLAGEN || !cookiesBesvarade) return null;

  return (
    <>
      {/* Bubblan sitter ovanför den mobila bokningsremsan (z-9990) men under
          cookiebannern (z-9999). */}
      <button
        onClick={() => {
          setOppen((v) => {
            if (!v) track("chat_open", {});
            return !v;
          });
        }}
        aria-label={oppen ? s.stang : s.oppna}
        aria-expanded={oppen}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[9995] w-14 h-14 rounded-full bg-bg-dark text-text-light shadow-xl flex items-center justify-center hover:bg-accent hover:text-text-primary transition-colors"
      >
        {oppen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
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
            <div className="bg-bg-dark text-text-light px-5 py-4 flex items-start justify-between gap-3 shrink-0">
              <div>
                <p className="font-bold leading-tight">{s.rubrik}</p>
                <p className="text-text-light/60 text-xs mt-0.5">{s.underrubrik}</p>
              </div>
              <button onClick={() => setOppen(false)} aria-label={s.stang} className="text-text-light/60 hover:text-text-light">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={listaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="bg-bg-primary rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-text-primary max-w-[85%]">
                {s.valkommen}
              </div>

              {meddelanden.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.roll === "user"
                      ? "bg-bg-dark text-text-light rounded-2xl rounded-tr-sm px-4 py-3 text-sm ml-auto max-w-[85%] whitespace-pre-wrap"
                      : "bg-bg-primary text-text-primary rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] whitespace-pre-wrap"
                  }
                >
                  {m.roll === "assistant" ? medLankar(m.text) : m.text}
                  {m.roll === "assistant" && !m.text && svarar && (
                    <span className="inline-flex gap-1 py-1" aria-label="Skriver">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60 animate-bounce [animation-delay:0.3s]" />
                    </span>
                  )}
                </div>
              ))}

              {meddelanden.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
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
                  disabled={svarar || !utkast.trim()}
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
