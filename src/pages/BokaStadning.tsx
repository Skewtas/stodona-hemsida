import { Helmet } from "../seo";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FullBookingForm } from "../components/FullBookingForm";
import TrustBar from "../components/TrustBar";
import { CheckCircle2, ShieldCheck, Clock, Star, HelpCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { bookingUrl } from "../utils/bookingUrl";

/** Stegen i bokningen – samma flöde oavsett vilken tjänst du bokar. */
const STEPS = [
  {
    sv: { title: "Berätta om ditt hem", text: "Ange bostadens storlek, hur ofta du vill ha städat och vilken tjänst det gäller. Det tar under en minut." },
    en: { title: "Tell us about your home", text: "Enter the size of your home, how often you want cleaning and which service you need. It takes less than a minute." },
  },
  {
    sv: { title: "Se ditt pris direkt", text: "Du får ett prisförslag på skärmen med RUT-avdraget redan avdraget – inga dolda avgifter." },
    en: { title: "See your price instantly", text: "You get a price proposal on screen with the RUT deduction already applied – no hidden fees." },
  },
  {
    sv: { title: "Välj en tid som passar", text: "Vi har ofta lediga tider redan samma vecka. Vid akuta behov kan vi ibland komma redan nästa dag." },
    en: { title: "Choose a time that suits you", text: "We often have times available the same week. For urgent needs we can sometimes come the next day." },
  },
  {
    sv: { title: "Vi hör av oss och kommer igång", text: "Du får en bekräftelse och möter ditt team. Samma team kommer sedan tillbaka varje gång." },
    en: { title: "We get in touch and get started", text: "You receive a confirmation and meet your team. The same team then returns every time." },
  },
];

/** Vad kunden bör ha till hands innan bokningen – minskar antalet frågor efteråt. */
const PREPARE = [
  { sv: "Bostadens yta i kvadratmeter och antal rum", en: "Your home's size in square metres and number of rooms" },
  { sv: "Hur ofta du vill ha städat – varje vecka, varannan vecka eller enstaka tillfälle", en: "How often you want cleaning – weekly, every other week or a one-off" },
  { sv: "Eventuella tillval, till exempel fönsterputsning eller ugn invändigt", en: "Any add-ons, for example window cleaning or oven interior" },
  { sv: "Hur vi kommer in: nyckel, portkod eller om du är hemma", en: "How we get in: key, door code or whether you are home" },
  { sv: "Personnummer för RUT-avdraget – vi sköter ansökan åt dig", en: "Your personal ID number for the RUT deduction – we handle the application" },
];

const SERVICES = [
  { to: "/hemstadning", sv: { name: "Hemstädning", desc: "Regelbunden städning med samma team varje gång." }, en: { name: "Home cleaning", desc: "Recurring cleaning with the same team every time." } },
  { to: "/flyttstadning", sv: { name: "Flyttstädning", desc: "Grundlig städning med garanti inför besiktning." }, en: { name: "Move-out cleaning", desc: "Thorough cleaning with a guarantee before inspection." } },
  { to: "/storstadning", sv: { name: "Storstädning", desc: "Djuprengöring av ugn, kyl/frys, skåp och badrum." }, en: { name: "Deep cleaning", desc: "Deep cleaning of oven, fridge/freezer, cabinets and bathroom." } },
  { to: "/fonsterputsning", sv: { name: "Fönsterputsning", desc: "In- och utsida samt mellan glasen – utan ränder." }, en: { name: "Window cleaning", desc: "Inside, outside and between the panes – streak free." } },
  { to: "/foretagsstadning", sv: { name: "Företagsstädning", desc: "Kontor och lokaler efter ert schema." }, en: { name: "Office cleaning", desc: "Offices and premises on your schedule." } },
  { to: "/byggstadning", sv: { name: "Byggstädning", desc: "Efter renovering eller nybygge – grovt till fint." }, en: { name: "Post-construction cleaning", desc: "After renovation or new build – rough to fine." } },
];

const FAQS = [
  {
    sv: { q: "Hur snabbt kan ni komma?", a: "Vi har ofta lediga tider redan samma vecka. Vid akuta behov kan vi ibland komma redan nästa dag – ring oss på 010-178 01 50 så löser vi det." },
    en: { q: "How quickly can you come?", a: "We often have times available the same week. For urgent needs we can sometimes come the next day – call us on +46 10 178 01 50." },
  },
  {
    sv: { q: "Behöver jag vara hemma under städningen?", a: "Nej. De flesta av våra kunder lämnar en nyckel som vi förvarar säkert, eller en portkod. Vi är fullt ansvarsförsäkrade." },
    en: { q: "Do I need to be home during the cleaning?", a: "No. Most of our customers leave a key that we store securely, or a door code. We are fully insured." },
  },
  {
    sv: { q: "Vad kostar det?", a: "Priset baseras på bostadens storlek och hur ofta du städar. Med RUT-avdraget betalar du bara halva arbetskostnaden, och du ser ditt pris direkt i bokningen – vi kan även ge fast pris per tillfälle." },
    en: { q: "What does it cost?", a: "The price is based on the size of your home and how often you book. With the RUT deduction you pay only half the labour cost, and you see your price directly when booking – we can also offer a fixed price per occasion." },
  },
  {
    sv: { q: "Hur betalar jag?", a: "Vi skickar faktura efter utförd tjänst med 10 dagars betalningsvillkor. RUT-avdraget är redan avdraget på fakturan." },
    en: { q: "How do I pay?", a: "We invoice after the service with 10 days payment terms. The RUT deduction is already applied on the invoice." },
  },
  {
    sv: { q: "Kan jag ändra eller avboka min tid?", a: "Ja, hör av dig till oss i god tid så bokar vi om utan kostnad. Alla villkor står på vår sida om avbokning." },
    en: { q: "Can I change or cancel my booking?", a: "Yes, contact us in good time and we will rebook at no cost. All terms are on our cancellation page." },
  },
  {
    sv: { q: "Binder jag upp mig?", a: "Nej. Du kan boka enstaka tillfällen eller abonnemang utan bindningstid, och säga upp med en kalendermånads varsel." },
    en: { q: "Am I tied to a contract?", a: "No. You can book single occasions or a subscription with no lock-in, and cancel with one calendar month's notice." },
  },
];

export default function BokaStadning() {
  const { lang } = useLanguage();
  const sv = lang === "SV";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.sv.q,
      acceptedAnswer: { "@type": "Answer", text: f.sv.a },
    })),
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Så bokar du städning hos Stodona",
    description: "Boka hemstädning, flyttstädning eller storstädning i Stockholm på under en minut.",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.sv.title,
      text: s.sv.text,
    })),
  };
  return (
    <div className="pt-32 pb-20 min-h-screen bg-bg-primary/30">
      <Helmet>
        <title>Boka städning online – Pris på 60 sekunder | Stodona</title>
        <meta name="description" content="Boka hemstädning, flyttstädning eller storstädning i Stockholm online. Se prisförslag direkt, välj tid och boka på 60 sekunder. RUT-avdrag ingår." />
        <meta property="og:title" content="Boka städning online – Pris på 60 sekunder | Stodona" />
        <meta property="og:description" content="Se pris direkt och boka din städning online på 60 sekunder. RUT-avdrag ingår!" />
        <link rel="canonical" href="https://stodona.se/boka-stadning" />
        <meta property="og:url" content="https://stodona.se/boka-stadning" />
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Info & Trust */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                {lang === 'SV' ? 'Bokning' : 'Booking'}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
                {lang === 'SV' ? 'Boka din städning' : 'Book your cleaning'} <br />
                <span className="text-cta-hover italic font-normal">{lang === 'SV' ? 'på 60 sekunder' : 'in 60 seconds'}</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {lang === 'SV' ? 'Fyll i dina uppgifter nedan för att se ditt pris direkt och boka en tid som passar dig. Vi tar hand om resten.' : 'Fill in your details below to see your price immediately and book a time that suits you. We take care of the rest.'}
              </p>
              <a
                href={bookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                {lang === 'SV' ? 'Boka städning här' : 'Book cleaning here'} →
              </a>
              <TrustBar className="mt-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{lang === 'SV' ? '100% Kundnöjdhetsgaranti' : '100% Satisfaction Guarantee'}</h3>
                  <p className="text-sm text-text-secondary">{lang === 'SV' ? 'Det som beställts ska bli perfekt. Är du mot förmodan inte nöjd, åtgärdar vi det kostnadsfritt.' : 'What is ordered should be perfect. If you are not satisfied, we will fix it completely free of charge.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{lang === 'SV' ? 'Ingen bindningstid' : 'No commitment'}</h3>
                  <p className="text-sm text-text-secondary">{lang === 'SV' ? 'Boka enstaka tillfällen eller abonnemang utan krångliga kontrakt.' : 'Book individual occasions or subscriptions without complicated contracts.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{lang === 'SV' ? 'RUT-avdrag direkt' : 'RUT tax deduction directly'}</h3>
                  <p className="text-sm text-text-secondary">{lang === 'SV' ? 'Vi sköter all administration med Skatteverket åt dig.' : 'We handle all administration with the Swedish Tax Agency for you.'}</p>
                </div>
              </div>
            </motion.div>

            <div className="pt-4 px-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold">4.9/5</span>
              </div>
              <p className="text-sm text-text-secondary italic">
                {lang === 'SV' ? '"Bästa städbolaget jag anlitat. Proffsigt bemötande och fantastiskt resultat!"' : '"Best cleaning company I\'ve hired. Professional treatment and fantastic results!"'}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-6 bg-cta-hover/10 rounded-2xl border border-cta-hover/20 text-center"
            >
              <p className="font-medium mb-3">
                {lang === 'SV' ? 'Vill du boka direkt i vårt bokningssystem?' : 'Want to book directly in our booking system?'}
              </p>
              <a
                href={bookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                {lang === 'SV' ? 'Gå till boka.stodona.se' : 'Go to boka.stodona.se'}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </motion.div>
          </div>

          {/* Right Side: Widget */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <FullBookingForm />
            </motion.div>
          </div>
        </div>

        {/* Så går det till */}
        <section className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {sv ? "Så går bokningen till" : "How booking works"}
          </h2>
          <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
            {sv
              ? "Fyra enkla steg från förfrågan till ett städat hem. Du binder inte upp dig på något."
              : "Four simple steps from request to a clean home. You are not tied to anything."}
          </p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.sv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-3xl p-7 border border-text-primary/5 shadow-sm"
              >
                <div className="w-11 h-11 bg-bg-primary rounded-2xl flex items-center justify-center text-lg font-bold text-cta-hover mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2">{sv ? step.sv.title : step.en.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{sv ? step.sv.text : step.en.text}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Förbered + vad ingår */}
        <section className="mt-24 max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {sv ? "Det här är bra att ha till hands" : "Have this ready"}
            </h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              {sv
                ? "Bokningen går snabbast om du har följande klart. Är du osäker på något löser vi det tillsammans efteråt."
                : "Booking is fastest if you have the following ready. If you are unsure about something we sort it out together afterwards."}
            </p>
            <ul className="space-y-4">
              {PREPARE.map((item) => (
                <li key={item.sv} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{sv ? item.sv : item.en}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {sv ? "Vad kostar det?" : "What does it cost?"}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              {sv ? (
                <>
                  Priset baseras på <strong className="text-text-primary">bostadens storlek</strong>. Som privatperson betalar
                  du bara halva arbetskostnaden tack vare RUT-avdraget – vi drar av det direkt på fakturan och sköter all
                  administration med Skatteverket. Du ser ditt pris innan du bekräftar bokningen.
                </>
              ) : (
                <>
                  The price is based on <strong className="text-text-primary">the size of your home</strong>. As a private individual
                  you pay only half the labour cost thanks to the RUT deduction – we apply it directly on the invoice and
                  handle all administration with the Swedish Tax Agency. You see your price before confirming.
                </>
              )}
            </p>
            <p className="text-text-secondary leading-relaxed mb-6">
              {sv
                ? "Faktura skickas efter utfört uppdrag med 10 dagars betalningsvillkor. Vill du ha ett fast pris per städtillfälle ordnar vi det."
                : "We invoice after the service with 10 days payment terms. If you prefer a fixed price per occasion, we can arrange that."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/priser" className="btn-primary inline-flex items-center gap-2">
                {sv ? "Se alla priser" : "See all prices"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/rut-avdrag" className="btn-secondary">
                {sv ? "Om RUT-avdraget" : "About the RUT deduction"}
              </Link>
            </div>
          </div>
        </section>

        {/* Tjänster att boka */}
        <section className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {sv ? "Vad vill du boka?" : "What would you like to book?"}
          </h2>
          <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
            {sv
              ? "Alla tjänster till privatpersoner berättigar till RUT-avdrag. Du kan kombinera flera tjänster vid samma tillfälle."
              : "All services for private individuals qualify for the RUT deduction. You can combine several services on the same occasion."}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.to}
                to={service.to}
                className="bg-white rounded-3xl p-7 border border-text-primary/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <h3 className="font-bold text-lg mb-2">{sv ? service.sv.name : service.en.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{sv ? service.sv.desc : service.en.desc}</p>
                <span className="text-sm font-bold inline-flex items-center gap-1.5 text-cta-hover">
                  {sv ? "Läs mer" : "Read more"} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            {sv ? "Vanliga frågor om bokning" : "Common questions about booking"}
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.sv.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {sv ? f.sv.q : f.en.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{sv ? f.sv.a : f.en.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-text-secondary mt-8">
            {sv ? (
              <>
                Hittar du inte svaret? Se <Link to="/faq" className="text-cta-hover font-medium hover:underline">vanliga frågor</Link>,{" "}
                villkoren för <Link to="/avbokning" className="text-cta-hover font-medium hover:underline">avbokning</Link> eller{" "}
                <Link to="/kontakt" className="text-cta-hover font-medium hover:underline">kontakta oss</Link>.
              </>
            ) : (
              <>
                Can&rsquo;t find the answer? See our <Link to="/faq" className="text-cta-hover font-medium hover:underline">FAQ</Link>,{" "}
                the <Link to="/avbokning" className="text-cta-hover font-medium hover:underline">cancellation terms</Link> or{" "}
                <Link to="/kontakt" className="text-cta-hover font-medium hover:underline">contact us</Link>.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
