import { useState } from "react";
import { Helmet } from "../seo";
import { Printer, Gift } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all";
const labelClass = "block text-sm font-medium mb-2";

// Intern mall för att skapa och skriva ut/spara presentkort som PDF.
// Dold (noindex), ej länkad – används av Stodona vid leverans.
export default function PresentkortMall() {
  const [amount, setAmount] = useState("1 000");
  const [code, setCode] = useState("STDG-A1B2");
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("");

  return (
    <div className="flex flex-col bg-bg-primary min-h-screen">
      <Helmet>
        <title>Presentkort – mall | Stodona</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Print-isolering: dölj allt utom själva kortet vid utskrift. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #gavokort, #gavokort * { visibility: visible !important; }
          #gavokort { position: fixed; inset: 0; margin: auto; box-shadow: none !important; }
          @page { size: landscape; margin: 12mm; }
        }
      `}</style>

      <div className="container-custom pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Skapa presentkort</h1>
          <p className="text-text-secondary mb-10">Fyll i uppgifterna, klicka på Skriv ut och välj “Spara som PDF”. (Intern sida.)</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Kontroller */}
            <div className="no-print space-y-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Belopp (kr)</label>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Kod</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Till (mottagare)</label>
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Ex: Anna" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Från</label>
                <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Ex: Familjen Andersson" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hälsning</label>
                <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="En personlig rad…" className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Giltigt t.o.m.</label>
                <input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} placeholder="Ex: 2027-08-31" className={inputClass} />
              </div>
              <button onClick={() => window.print()}
                className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> Skriv ut / Spara som PDF
              </button>
            </div>

            {/* Förhandsvisning / kortet */}
            <div className="flex justify-center">
              <div
                id="gavokort"
                className="relative w-full max-w-[560px] aspect-[1.6/1] rounded-[28px] overflow-hidden bg-bg-dark text-text-light shadow-2xl p-8 flex flex-col justify-between"
              >
                <div aria-hidden className="absolute -top-16 -right-10 w-60 h-60 rounded-full bg-cta-hover/25 blur-3xl" />
                <div aria-hidden className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-cta-hover/10 blur-3xl" />
                <div aria-hidden className="absolute inset-3 rounded-[22px] border border-white/10" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-display text-2xl font-bold tracking-tight">Stodona</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.3em] uppercase text-cta-hover">
                    <Gift className="w-4 h-4" /> Presentkort
                  </span>
                </div>

                <div className="relative z-10 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-text-light/60 mb-1">Värde</p>
                  <p className="font-display text-5xl md:text-6xl font-bold text-cta-hover leading-none">{amount || "0"} kr</p>
                  {(recipient || message) && (
                    <div className="mt-4 space-y-0.5">
                      {recipient && <p className="text-sm"><span className="text-text-light/60">Till:</span> {recipient}</p>}
                      {message && <p className="text-sm italic text-text-light/85">”{message}”</p>}
                      {from && <p className="text-sm"><span className="text-text-light/60">Från:</span> {from}</p>}
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-light/50">Kod</p>
                    <p className="font-bold tracking-[0.2em] text-text-light">{code || "STDG-XXXX"}</p>
                  </div>
                  <div className="text-right text-[11px] text-text-light/70 leading-relaxed">
                    {validUntil && <p>Giltigt t.o.m. {validUntil}</p>}
                    <p>Gäller alla städtjänster · boka.stodona.se</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
