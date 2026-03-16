import { useState } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Lock, 
  EyeOff, 
  Scale
} from "lucide-react";

export default function Visselblasning() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Add a specific subject for whistleblower reports
    formData.append("_subject", "Ny visselblåsarrapport");
    
    try {
      const response = await fetch('https://formspree.io/f/xojkdewo', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setFormState("success");
        form.reset();
      } else {
        setFormState("idle");
        alert("Något gick fel. Vänligen försök igen.");
      }
    } catch (error) {
      setFormState("idle");
      alert("Ett nätverksfel uppstod. Vänligen försök igen senare.");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/stodona_right_image.jpg" 
            alt="Visselblåsning Stodona Stockholm" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
            >
              Visselblåsning hos <span className="italic font-normal text-cta-hover">Stodona</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Vi värnar om hög affärsetik och transparens. Här kan du rapportera misstankar om allvarliga oegentligheter på ett säkert och konfidentiellt sätt.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-6 space-y-8">
              <h2 className="text-3xl font-bold">Vår visselblåsarfunktion</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Stodona strävar efter att upprätthålla ett öppet affärsklimat och en hög etisk nivå. Vår visselblåsarfunktion är en viktig kanal för att fånga upp misstankar om missförhållanden som strider mot lagstiftning eller våra interna etiska riktlinjer.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Konfidentiellt & Säkert</h3>
                    <p className="text-text-secondary">Dina uppgifter hanteras med högsta sekretess och skyddas enligt gällande lagstiftning (Visselblåsarlagen).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <EyeOff className="w-6 h-6 text-text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Anonymitet</h3>
                    <p className="text-text-secondary">Du har möjlighet att vara helt anonym i din rapportering om du så önskar.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="w-6 h-6 text-text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Rättsligt skydd</h3>
                    <p className="text-text-secondary">Lagen skyddar dig som rapporterar mot repressalier eller negativa konsekvenser till följd av din anmälan.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-bg-primary rounded-2xl border border-text-primary/5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cta-hover" />
                  Vad kan rapporteras?
                </h3>
                <p className="text-text-secondary text-sm">
                  Funktionen ska användas för att rapportera allvarliga missförhållanden, såsom ekonomisk brottslighet, korruption, miljöbrott eller allvarliga former av trakasserier. För vanliga klagomål eller personalärenden hänvisar vi till vår ordinarie kundtjänst eller närmaste chef.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-6">
              <div className="card-rounded bg-bg-primary p-8 md:p-12 shadow-sm border border-text-primary/5">
                {formState === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-cta-hover/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-cta-hover" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Rapporten skickad</h2>
                    <p className="text-text-secondary text-lg mb-8">
                      Tack för ditt mod och ditt bidrag till vår verksamhet. Din rapport har skickats säkert till vår ansvariga mottagare (mikaela.wigert@stodona.se).
                    </p>
                    <button 
                      onClick={() => setFormState("idle")}
                      className="btn-primary"
                    >
                      Skicka en ny rapport
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2">Rapportera här</h2>
                    <p className="text-text-secondary mb-8">Beskriv ditt ärende så utförligt som möjligt. Du kan välja att vara anonym.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-semibold text-text-primary">Namn (valfritt)</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name"
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                          placeholder="Lämna tomt för att vara anonym"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact" className="text-sm font-semibold text-text-primary">Kontaktuppgifter (valfritt)</label>
                        <input 
                          type="text" 
                          id="contact" 
                          name="contact"
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                          placeholder="E-post eller telefon om du vill bli kontaktad"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="incident" className="text-sm font-semibold text-text-primary">Beskrivning av händelsen</label>
                        <textarea 
                          id="incident" 
                          name="incident_description"
                          rows={6}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white resize-none"
                          placeholder="Vad har hänt? När och var? Vilka var inblandade?"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={formState === "submitting"}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {formState === "submitting" ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Skickar säkert...
                          </>
                        ) : (
                          <>
                            Skicka rapport
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      
                      <p className="text-xs text-text-secondary/60 text-center leading-relaxed">
                        Din rapport skickas krypterat till mikaela.wigert@stodona.se. Vi garanterar att din identitet skyddas om du väljer att uppge den.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
