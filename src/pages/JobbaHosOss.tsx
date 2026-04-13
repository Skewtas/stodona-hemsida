import { Helmet } from 'react-helmet-async';
import { useState } from "react";
import { motion } from "motion/react";
import { 
  Briefcase, 
  Heart, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Star,
  Upload,
  User,
  Coffee
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function JobbaHosOss() {
  const { lang } = useLanguage();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Hardcoded subject to match job applications
    formData.append("subject", "Jobbansökan - Stodona Hemsida");

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
      <Helmet>
        <title>Jobba hos Stodona – Bli en del av vårt team | Stodona</title>
        <meta name="description" content="Söker du jobb som lokalvårdare eller inom städ i Stockholm? Vi på Stodona letar alltid efter engagerad personal. Ansök enkelt online idag!" />
        <meta property="og:title" content="Jobba hos Stodona – Bli en del av vårt team i Stockholm" />
        <meta property="og:description" content="Bli en del av ett städbolag som bryr sig. Sök jobb hos Stodona idag." />
        <link rel="canonical" href="https://stodona.se/jobba-hos-oss" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/familj-stodona.jpg" 
            alt="Jobba hos Stodona Stockholm" 
            className="w-full h-full object-cover opacity-30"
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
              {lang === 'SV' ? 'Bli en del av' : 'Join'} <br /> 
              <span className="italic font-normal text-cta-hover">Team Stodona</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {lang === 'SV' ? 'Vi letar alltid efter engagerade och noggranna stjärnor till vårt växande städbolag i Stockholm. Här blir du inte bara en anställd, du blir en del av vår familj.' : 'We are always looking for dedicated and meticulous stars for our growing cleaning company in Stockholm. Here you don\'t just become an employee, you become part of our family.'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Intro & Benefits */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {lang === 'SV' ? 'Varför jobba med oss?' : 'Why work with us?'}
            </h2>
            <p className="text-xl text-text-secondary">
              {lang === 'SV' 
                ? 'Stodona grundades med en tydlig vision – att vara branschens bästa arbetsgivare. När vår personal mår bra, mår våra kunder bra.' 
                : 'Stodona was founded with a clear vision - to be the best employer in the industry. When our staff feel good, our customers feel good.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-cta-hover/10 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Vi bryr oss' : 'We care'}</h3>
              <p className="text-text-secondary leading-relaxed">
                {lang === 'SV' ? 'Vi satsar på god arbetsmiljö och en stark gemenskap. För oss är du otroligt viktig.' : 'We focus on a good work environment and strong community. You are incredibly important to us.'}
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-cta-hover/10 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Trygga villkor' : 'Secure conditions'}</h3>
              <p className="text-text-secondary leading-relaxed">
                {lang === 'SV' ? 'Full försäkring, kollektivavtalsliknande villkor och rättvis lön. Det är en självklarhet för oss.' : 'Full insurance coverage, collective agreement-like terms and fair pay. A given for us.'}
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-cta-hover/10 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Utbildning & support' : 'Training & support'}</h3>
              <p className="text-text-secondary leading-relaxed">
                {lang === 'SV' ? 'Du får grundlig internutbildning och vi finns alltid ett samtal bort under arbetspasset.' : 'You receive thorough internal training and we are always just a phone call away during your shift.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Info */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {lang === 'SV' ? 'Vem letar vi efter?' : 'Who are we looking for?'}
                </h2>
                <div className="prose prose-lg text-text-secondary">
                  <p>
                    {lang === 'SV' 
                    ? 'Vi söker dig som älskar att se resultat av ditt arbete, är ansvarsfull och sprider positiv energi. Erfarenhet av städning är ett stort plus, men det viktigaste är din inställning!' 
                    : 'We are looking for someone who loves seeing the results of their work, is responsible and spreads positive energy. Cleaning experience is a plus, but attitude is everything!'}
                  </p>
                  
                  <h4 className="font-bold text-text-primary mt-8 mb-4">{lang === 'SV' ? 'Krav för att söka:' : 'Requirements to apply:'}</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover mt-0.5 shrink-0" />
                      <span>{lang === 'SV' ? 'Noggrann och har ett sinne för detaljer.' : 'Meticulous with an eye for detail.'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover mt-0.5 shrink-0" />
                      <span>{lang === 'SV' ? 'Pålitlig och passar tider.' : 'Reliable and punctual.'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover mt-0.5 shrink-0" />
                      <span>{lang === 'SV' ? 'Förstår vikten av utmärkt kundservice.' : 'Understands the importance of excellent customer service.'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover mt-0.5 shrink-0" />
                      <span>{lang === 'SV' ? 'Talar svenska eller engelska obehindrat.' : 'Speaks Swedish or English fluently.'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-cta-hover/10 rounded-2xl border border-cta-hover/20 mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-6 h-6 text-cta-hover" />
                  <h4 className="font-bold text-lg">{lang === 'SV' ? 'Så går det till' : 'How it works'}</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {lang === 'SV' 
                  ? 'När vi mottagit din ansökan går vi igenom den. Om din profil stämmer överens med det vi letar efter kommer vi att kontakta dig för en kort intervju över telefon eller e-post, och därefter boka in ett personligt möte.' 
                  : 'Once we receive your application, we review it. If your profile matches what we are looking for, we will contact you for a brief phone or email interview, followed by an in-person meeting.'}
                </p>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-7">
              <div id="skicka-ansokan" className="card-rounded bg-bg-primary p-8 md:p-12 shadow-sm border border-text-primary/5">
                {formState === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-cta-hover/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-cta-hover" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{lang === 'SV' ? 'Tack för din ansökan!' : 'Thank you for your application!'}</h2>
                    <p className="text-text-secondary text-lg mb-8">
                      {lang === 'SV' ? 'Vi har mottagit dina uppgifter och återkommer till dig så snart vi kan.' : 'We have received your details and will get back to you as soon as possible.'}
                    </p>
                    <button 
                      onClick={() => setFormState("idle")}
                      className="btn-primary"
                    >
                      {lang === 'SV' ? 'Skicka en ny ansökan' : 'Submit a new application'}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2">{lang === 'SV' ? 'Skicka din ansökan' : 'Submit your application'}</h2>
                    <p className="text-text-secondary mb-8">{lang === 'SV' ? 'Berätta lite om dig själv så hörs vi snart.' : 'Tell us a bit about yourself and we will be in touch.'}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Fullständigt namn*' : 'Full name*'}</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder={lang === 'SV' ? 'För & Efternamn' : 'First & Last name'}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'E-post*' : 'Email*'}</label>
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
                          <label htmlFor="phone" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Telefonnummer*' : 'Phone number*'}</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white"
                            placeholder="070-000 00 00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="experience" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Har du städerfarenhet?' : 'Do you have cleaning experience?'}</label>
                          <select 
                            id="experience" 
                            name="experience"
                            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white appearance-none cursor-pointer"
                          >
                            <option value="Ja, över 2 år">{lang === 'SV' ? 'Ja, mer än 2 år' : 'Yes, more than 2 years'}</option>
                            <option value="Ja, upp till 2 år">{lang === 'SV' ? 'Ja, mindre än 2 år' : 'Yes, less than 2 years'}</option>
                            <option value="Nej, men jag är lättlärd">{lang === 'SV' ? 'Nej, men jag vill lära mig' : 'No, but I want to learn'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Bifoga CV (frivilligt men rekommenderat)' : 'Attach CV (optional but recommended)'}</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            id="cv-upload"
                            name="cv_attachment"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const fileName = e.target.files?.[0]?.name;
                              const label = document.getElementById('cv-label');
                              if (label && fileName) label.textContent = fileName;
                            }}
                          />
                          <label 
                            htmlFor="cv-upload"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 hover:border-cta-hover hover:bg-cta-hover/5 cursor-pointer transition-all bg-white"
                          >
                            <Upload className="w-5 h-5 text-text-secondary" />
                            <span id="cv-label" className="text-text-secondary">{lang === 'SV' ? 'Ladda upp CV (.pdf, .doc)' : 'Upload CV (.pdf, .doc)'}</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold text-text-primary">{lang === 'SV' ? 'Kort om dig själv*' : 'Briefly about yourself*'}</label>
                        <textarea 
                          id="message" 
                          name="message"
                          rows={4}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-2 focus:ring-cta-hover/20 outline-none transition-all bg-white resize-none"
                          placeholder={lang === 'SV' ? 'Varför vill du jobba med oss på Stodona?' : 'Why do you want to work with us at Stodona?'}
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
                            {lang === 'SV' ? 'Skicka ansökan' : 'Submit application'}
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      
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
