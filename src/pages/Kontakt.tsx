import { Helmet } from "../seo";
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
  Upload,
  User,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import { bookingUrl } from "../utils/bookingUrl";

/** Rätt kanal för rätt ärende – kortar ner svarstiden för både kund och oss. */
interface Errand {
  sv: { title: string; text: string; action: string };
  en: { title: string; text: string; action: string };
  /** "booking" = extern bokningslänk. Annars intern route i `to`. */
  href?: "booking";
  to?: string;
}
const ERRANDS: Errand[] = [
  {
    sv: { title: "Boka städning", text: "Snabbast är att boka online – du ser priset direkt och väljer en ledig tid." , action: "Boka online" },
    en: { title: "Book cleaning", text: "The fastest way is to book online – you see the price directly and pick an available time.", action: "Book online" },
    href: "booking",
  },
  {
    sv: { title: "Ändra, pausa eller avboka en tid", text: "Ring eller mejla oss i god tid så bokar vi om utan kostnad. Villkoren finns på avbokningssidan.", action: "Villkor för avbokning" },
    en: { title: "Change, pause or cancel a booking", text: "Call or email us in good time and we will rebook at no cost. The terms are on the cancellation page.", action: "Cancellation terms" },
    to: "/avbokning",
  },
  {
    sv: { title: "Pris- eller offertförfrågan", text: "Se prisexempel och timpris på prissidan, eller be oss räkna fram ett fast pris för ditt hem.", action: "Se priser" },
    en: { title: "Price or quote request", text: "See price examples and the hourly rate on our pricing page, or ask us for a fixed price for your home.", action: "See prices" },
    to: "/priser",
  },
  {
    sv: { title: "Reklamation eller synpunkt", text: "Kontakta oss inom 24 timmar efter städningen så kommer vi tillbaka och åtgärdar utan extra kostnad.", action: "Läs om vår kvalitet" },
    en: { title: "Complaint or feedback", text: "Contact us within 24 hours after the cleaning and we will come back and fix it at no extra cost.", action: "About our quality" },
    to: "/kvalitet-och-trygghet",
  },
  {
    sv: { title: "Faktura- och betalningsfrågor", text: "Vi fakturerar efter utfört uppdrag med 10 dagars betalningsvillkor, med RUT-avdraget redan avdraget.", action: "Om RUT-avdraget" },
    en: { title: "Invoice and payment questions", text: "We invoice after the service with 10 days payment terms, with the RUT deduction already applied.", action: "About the RUT deduction" },
    to: "/rut-avdrag",
  },
  {
    sv: { title: "Söka jobb hos oss", text: "Vi anställer städare, fönsterputsare och barnvakter i Stockholm – se lediga tjänster och ansök direkt.", action: "Lediga tjänster" },
    en: { title: "Apply for a job", text: "We hire cleaners, window cleaners and babysitters in Stockholm – see open positions and apply directly.", action: "Open positions" },
    to: "/jobba-hos-oss",
  },
];

const AREAS = [
  { name: "Solna", to: "/solna" },
  { name: "Sundbyberg", to: "/sundbyberg" },
  { name: "Bromma", to: "/bromma" },
  { name: "Lidingö", to: "/lidingo" },
  { name: "Ekerö", to: "/ekero" },
  { name: "Nacka", to: "/nacka" },
  { name: "Täby", to: "/taby" },
  { name: "Danderyd", to: "/danderyd" },
  { name: "Djursholm", to: "/djursholm" },
  { name: "Sollentuna", to: "/sollentuna" },
  { name: "Järfälla", to: "/jarfalla" },
  { name: "Huddinge", to: "/huddinge" },
  { name: "Haninge", to: "/haninge" },
  { name: "Vaxholm", to: "/vaxholm" },
  { name: "Upplands Väsby", to: "/upplands-vasby" },
  { name: "Södermalm", to: "/sodermalm" },
  { name: "Östermalm", to: "/ostermalm" },
  { name: "Vasastan", to: "/vasastan" },
];

const CONTACT_FAQS = [
  {
    sv: { q: "Hur snabbt svarar ni?", a: "Vi svarar på mejl och formulär oftast inom 48 timmar, vardagar. Behöver du svar snabbare är telefon 010-178 01 50 bästa vägen – vi har öppet vardagar 10:00–16:00." },
    en: { q: "How quickly do you reply?", a: "We usually reply to emails and form submissions within 48 hours on weekdays. If you need a faster answer, call +46 10 178 01 50 – we are open weekdays 10:00–16:00." },
  },
  {
    sv: { q: "Kan jag besöka ert kontor?", a: "Vårt kontor ligger på Sommarvägen 5 i Solna och tar emot bokade besök. Hör av dig i förväg så bokar vi en tid." },
    en: { q: "Can I visit your office?", a: "Our office is at Sommarvägen 5 in Solna and receives visitors by appointment. Contact us in advance to book a time." },
  },
  {
    sv: { q: "Vilka områden arbetar ni i?", a: "Vi städar i hela Stockholmsområdet, bland annat Solna, Sundbyberg, Bromma, Lidingö, Ekerö, Nacka, Täby, Danderyd, Sollentuna, Järfälla, Huddinge, Haninge och innerstaden. Bor du strax utanför – hör av dig, vi utökar området löpande." },
    en: { q: "Which areas do you serve?", a: "We clean across the Stockholm area, including Solna, Sundbyberg, Bromma, Lidingö, Ekerö, Nacka, Täby, Danderyd, Sollentuna, Järfälla, Huddinge, Haninge and the inner city. If you live just outside – get in touch, we keep expanding." },
  },
  {
    sv: { q: "Jag är redan kund – var hanterar jag mina bokningar?", a: "I kundportalen ser du dina kommande och utförda städningar. Ändringar av tider gör du enklast genom att ringa eller mejla oss." },
    en: { q: "I am already a customer – where do I manage my bookings?", a: "In the customer portal you can see your upcoming and completed cleanings. Changes to times are easiest to make by calling or emailing us." },
  },
  {
    sv: { q: "Är ni försäkrade och har F-skatt?", a: "Ja. Stodona AB (org.nr 559201-1059) är fullt ansvarsförsäkrat, har F-skattsedel och alla städare är anställda hos oss med kollektivavtalsenliga villkor." },
    en: { q: "Are you insured and registered for F-tax?", a: "Yes. Stodona AB (company reg. no. 559201-1059) is fully insured, holds an F-tax certificate, and all cleaners are employed by us on collective agreement terms." },
  },
];

export default function Kontakt() {
  const { lang } = useLanguage();
  const sv = lang === "SV";
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakta Stodona",
    url: "https://stodona.se/kontakt",
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": "https://stodona.se/#business",
      name: "Stodona",
      telephone: "+46101780150",
      email: "info@stodona.se",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Sommarvägen 5",
        postalCode: "169 31",
        addressLocality: "Solna",
        addressCountry: "SE",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "10:00",
          closes: "16:00",
        },
      ],
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CONTACT_FAQS.map((f) => ({
      "@type": "Question",
      name: f.sv.q,
      acceptedAnswer: { "@type": "Answer", text: f.sv.a },
    })),
  };

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
      <Helmet>
        <title>Kontakta Stodona – Städning i Stockholm | Stodona</title>
        <meta name="description" content="Kontakta Stodona för frågor om hemstädning, flyttstädning och företagsstädning i Stockholm. Ring 010-178 01 50 eller fyll i vårt kontaktformulär." />
        <meta property="og:title" content="Kontakta Stodona – Städning i Stockholm | Stodona" />
        <meta property="og:description" content="Kontakta oss för frågor om städning i Stockholm. Ring, maila eller fyll i formuläret." />
        <link rel="canonical" href="https://stodona.se/kontakt" />
        <meta property="og:url" content="https://stodona.se/kontakt" />
        <script type="application/ld+json">{JSON.stringify(contactSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
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
                      <p className="text-sm text-text-secondary/60 mt-1">{lang === 'SV' ? 'Vardagar: 10:00 - 16:00' : 'Weekdays: 10:00 - 16:00'}</p>
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
                      <p className="text-text-secondary">{lang === 'SV' ? 'Sommarvägen 5, 169 31 Solna. (endast bokade besök)' : 'Sommarvägen 5, 169 31 Solna. (by appointment only)'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{lang === 'SV' ? 'Kundportal' : 'Customer Portal'}</h3>
                      <p className="text-text-secondary">
                        {lang === 'SV' 
                          ? 'Är du redan kund hos oss? Logga in för att hantera dina bokningar. ' 
                          : 'Are you already a customer? Log in to manage your bookings. '}<br />
                        <Link to="/kundportalen" className="text-cta-hover font-medium hover:underline inline-flex items-center gap-1 mt-1">
                          {lang === 'SV' ? 'Gå till kundportalen' : 'Go to customer portal'}
                        </Link>
                      </p>
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

      {/* Vilket ärende gäller det? */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {sv ? "Vilket ärende gäller det?" : "What is your errand?"}
          </h2>
          <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
            {sv
              ? "Här hittar du snabbaste vägen framåt. Du kan alltid ringa, mejla eller fylla i formuläret ovan i stället."
              : "Here is the fastest way forward. You can always call, email or use the form above instead."}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ERRANDS.map((e, i) => {
              const copy = sv ? e.sv : e.en;
              return (
                <motion.div
                  key={e.sv.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-3xl p-7 border border-text-primary/5 shadow-sm flex flex-col"
                >
                  <h3 className="font-bold text-lg mb-2">{copy.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-5 grow">{copy.text}</p>
                  {e.href === "booking" ? (
                    <a
                      href={bookingUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold inline-flex items-center gap-1.5 text-cta-hover"
                    >
                      {copy.action} <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link to={e.to!} className="text-sm font-bold inline-flex items-center gap-1.5 hover:text-cta-hover transition-colors">
                      {copy.action} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Områden */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {sv ? "Vi städar i hela Stockholm" : "We clean across Stockholm"}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10">
            {sv
              ? "Från innerstaden till förorterna – välj ditt område för att se vad vi erbjuder just där. Bor du strax utanför? Hör av dig, vi utökar vårt område löpande."
              : "From the inner city to the suburbs – choose your area to see what we offer there. Live just outside? Get in touch, we keep expanding our area."}
          </p>
          <ul className="flex flex-wrap justify-center gap-3">
            {AREAS.map((a) => (
              <li key={a.to}>
                <Link
                  to={a.to}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-bg-primary text-sm font-medium hover:bg-cta-hover/20 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-cta-hover" /> {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ + företagsuppgifter */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            {sv ? "Vanliga frågor om att kontakta oss" : "Common questions about contacting us"}
          </h2>
          <div className="space-y-4">
            {CONTACT_FAQS.map((f) => (
              <div key={f.sv.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {sv ? f.sv.q : f.en.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{sv ? f.sv.a : f.en.a}</p>
              </div>
            ))}
          </div>

          <dl className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-2xl p-5 border border-text-primary/5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-cta-hover">{sv ? "Företag" : "Company"}</dt>
              <dd className="mt-1.5 text-text-secondary">Stodona AB · {sv ? "org.nr" : "reg. no."} 559201-1059</dd>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-text-primary/5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-cta-hover">{sv ? "Adress" : "Address"}</dt>
              <dd className="mt-1.5 text-text-secondary">Sommarvägen 5, 169 31 Solna</dd>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-text-primary/5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-cta-hover">{sv ? "Telefontider" : "Phone hours"}</dt>
              <dd className="mt-1.5 text-text-secondary">{sv ? "Vardagar 10:00–16:00" : "Weekdays 10:00–16:00"}</dd>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-text-primary/5">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-cta-hover">{sv ? "Svarstid mejl" : "Email response time"}</dt>
              <dd className="mt-1.5 text-text-secondary">{sv ? "Oftast inom 48 timmar" : "Usually within 48 hours"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Helpful Links Section */}
      <section className="py-16 bg-bg-primary">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">{lang === 'SV' ? 'Populära sidor' : 'Popular pages'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link to="/hemstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Hemstädning' : 'Home Cleaning'}</span>
            </Link>
            <Link to="/flyttstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Flyttstädning' : 'Move-Out Cleaning'}</span>
            </Link>
            <a href={bookingUrl()} className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Boka städning' : 'Book Cleaning'}</span>
            </a>
            <Link to="/priser" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Priser' : 'Pricing'}</span>
            </Link>
            <Link to="/faq" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Vanliga frågor' : 'FAQ'}</span>
            </Link>
            <Link to="/om-oss" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Om oss' : 'About us'}</span>
            </Link>
            <Link to="/kundportalen" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Kundportal' : 'Customer Portal'}</span>
            </Link>
            <Link to="/recensioner" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="font-medium text-sm">{lang === 'SV' ? 'Recensioner' : 'Reviews'}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
