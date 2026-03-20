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
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";

export default function Kontakt() {
  const { lang } = useLanguage();
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
              {lang === 'SV' ? 'Kontakta' : 'Contact'} <span className="italic font-normal text-cta-hover">Stodona</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {lang === 'SV' ? 'Vi finns här för att svara på dina frågor och hjälpa dig att hitta den perfekta städlösningen för ditt hem eller företag.' : 'We are here to answer your questions and help you find the perfect cleaning solution for your home or business.'}
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
                <h2 className="text-3xl font-bold mb-8">{lang === 'SV' ? 'Hör av dig till oss' : 'Get in touch'}</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{lang === 'SV' ? 'Ring oss' : 'Call us'}</h3>
                      <p className="text-text-secondary">010-178 01 50</p>
                      <p className="text-sm text-text-secondary/60 mt-1">{lang === 'SV' ? 'Vardagar: 08:00 - 17:00' : 'Weekdays: 08:00 - 17:00'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{lang === 'SV' ? 'E-posta oss' : 'Email us'}</h3>
                      <p className="text-text-secondary">info@stodona.se</p>
                      <p className="text-sm text-text-secondary/60 mt-1">{lang === 'SV' ? 'Vi svarar oftast inom 48h' : 'We usually respond within 48h'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{lang === 'SV' ? 'Här finns vårt kontor' : 'Our office'}</h3>
                      <p className="text-text-secondary">{lang === 'SV' ? 'Ågatan 12B, Sundbyberg. (endast bokade besök)' : 'Ågatan 12B, Sundbyberg. (by appointment only)'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-text-primary/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">{lang === 'SV' ? 'Ansvarsförsäkrade' : 'Fully insured'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">{lang === 'SV' ? '100% Nöjd-garanti' : '100% Satisfaction guarantee'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">{lang === 'SV' ? 'Snabba svar' : 'Quick responses'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-cta-hover" />
                  <span className="text-sm font-medium">{lang === 'SV' ? 'Personlig service' : 'Personal service'}</span>
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
                    <h2 className="text-3xl font-bold mb-4">{lang === 'SV' ? 'Tack för ditt meddelande!' : 'Thank you for your message!'}</h2>
                    <p className="text-text-secondary text-lg mb-8">
                      {lang === 'SV' ? 'Vi har tagit emot din förfrågan och återkommer till dig så snart vi kan, vanligtvis inom 48h.' : 'We have received your inquiry and will get back to you as soon as possible, usually within 48h.'}
                    </p>
                    <button 
                      onClick={() => setFormState("idle")}
                      className="btn-primary"
                    >
                      {lang === 'SV' ? 'Skicka ett nytt meddelande' : 'Send a new message'}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2">{lang === 'SV' ? 'Skicka ett meddelande' : 'Send a message'}</h2>
                    <p className="text-text-secondary mb-8">{lang === 'SV' ? 'Fyll i formuläret nedan så kontaktar vi dig inom kort.' : 'Fill in the form below and we will contact you shortly.'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Namn' : 'Name'}</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder={lang === 'SV' ? 'Ditt fullständiga namn' : 'Your full name'}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'E-post' : 'Email'}</label>
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
                          <label htmlFor="phone" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Telefonnummer' : 'Phone number'}</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone"
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder="070-000 00 00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Ärende' : 'Subject'}</label>
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
                        <label htmlFor="message" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Meddelande' : 'Message'}</label>
                        <textarea 
                          id="message" 
                          name="message"
                          rows={4}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white resize-none"
                          placeholder={lang === 'SV' ? 'Hur kan vi hjälpa dig?' : 'How can we help you?'}
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
                            {lang === 'SV' ? 'Skickar...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            {lang === 'SV' ? 'Skicka meddelande' : 'Send message'}
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      
                      <p className="text-xs text-text-secondary/60 text-center">
                        {lang === 'SV' ? 'Genom att skicka formuläret godkänner du att vi hanterar dina personuppgifter i enlighet med vår integritetspolicy.' : 'By submitting the form, you agree that we handle your personal data in accordance with our privacy policy.'}
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
