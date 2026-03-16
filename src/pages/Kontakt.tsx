import { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  MessageSquare,
  Upload
} from "lucide-react";

export default function Kontakt() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
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
            src="/stodona-stad.jpg" 
            alt="Kontakta Stodona Stockholm" 
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
              Kontakta <span className="italic font-normal text-cta-hover">Stodona</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Vi finns här för att svara på dina frågor och hjälpa dig att hitta den perfekta städlösningen för ditt hem eller företag.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8">Hör av dig till oss</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Ring oss</h3>
                      <p className="text-text-secondary">010-178 01 50</p>
                      <p className="text-sm text-text-secondary/60 mt-1">Vardagar: 08:00 - 17:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">E-posta oss</h3>
                      <p className="text-text-secondary">info@stodona.se</p>
                      <p className="text-sm text-text-secondary/60 mt-1">Vi svarar oftast inom 48h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Här finns vårt kontor</h3>
                      <p className="text-text-secondary">Ågatan 12B, Sundbyberg. (endast bokade besök)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-text-primary/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">Ansvarsförsäkrade</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">100% Nöjd-garanti</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">Snabba svar</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">Personlig service</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
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
                    <h2 className="text-3xl font-bold mb-4">Tack för ditt meddelande!</h2>
                    <p className="text-text-secondary text-lg mb-8">
                      Vi har tagit emot din förfrågan och återkommer till dig så snart vi kan, vanligtvis inom 48h.
                    </p>
                    <button 
                      onClick={() => setFormState("idle")}
                      className="btn-primary"
                    >
                      Skicka ett nytt meddelande
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2">Skicka ett meddelande</h2>
                    <p className="text-text-secondary mb-8">Fyll i formuläret nedan så kontaktar vi dig inom kort.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold text-text-primary">Namn</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder="Ditt fullständiga namn"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold text-text-primary">E-post</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder="din@epost.se"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-semibold text-text-primary">Telefonnummer</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone"
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder="070-000 00 00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-semibold text-text-primary">Ärende</label>
                          <select 
                            id="subject" 
                            name="subject"
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white appearance-none cursor-pointer"
                          >
                            <option value="boka">Boka städning</option>
                            <option value="andra">Ändra/omboka/avboka tid</option>
                            <option value="pris">Pris- och offertförfrågan</option>
                            <option value="faktura">Faktura eller betalningsfråga</option>
                            <option value="synpunkter">Synpunkter eller reklamation</option>
                            <option value="jobb">Söka jobb</option>
                            <option value="ovrigt">Övrigt</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary">Bifoga dokument (valfritt)</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            id="file-upload"
                            name="attachment"
                            className="hidden"
                            onChange={(e) => {
                              const fileName = e.target.files?.[0]?.name;
                              const label = document.getElementById('file-label');
                              if (label && fileName) label.textContent = fileName;
                            }}
                          />
                          <label 
                            htmlFor="file-upload"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 hover:border-cta-hover hover:bg-cta-hover/5 cursor-pointer transition-all bg-white"
                          >
                            <Upload className="w-5 h-5 text-text-secondary" />
                            <span id="file-label" className="text-text-secondary">Välj fil att ladda upp...</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold text-text-primary">Meddelande</label>
                        <textarea 
                          id="message" 
                          name="message"
                          rows={4}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white resize-none"
                          placeholder="Hur kan vi hjälpa dig?"
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
                            Skickar...
                          </>
                        ) : (
                          <>
                            Skicka meddelande
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      
                      <p className="text-xs text-text-secondary/60 text-center">
                        Genom att skicka formuläret godkänner du att vi hanterar dina personuppgifter i enlighet med vår integritetspolicy.
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
