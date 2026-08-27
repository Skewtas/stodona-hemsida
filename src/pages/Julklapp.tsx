import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Gift,
  TreePine,
  Clock,
  Heart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Mail,
} from "lucide-react";
import TrustBar from "../components/TrustBar";

const REASONS = [
  { icon: Heart, title: "En present som betyder något", text: "Ge bort tid, lugn och avlastning – något alla önskar sig men få unnar sig själva." },
  { icon: Sparkles, title: "Passar alla", text: "Föräldrar, mor- och farföräldrar, kompisen med fullt upp – ett rent hem uppskattas av alla." },
  { icon: Clock, title: "Sista minuten? Inga problem", text: "Presentkortet levereras digitalt – du hinner köpa det ända in på julafton." },
  { icon: Gift, title: "Personligt och fint", text: "Snyggt formgivet presentkort med din egen hälsning till mottagaren." },
];

const FOR_WHO = [
  "Till nyblivna föräldrar som behöver avlastning",
  "Till mor- och farföräldrar som förtjänar att bli ompysslade",
  "Till den stressade vännen som aldrig hinner",
  "Till personalen eller kunden – som företagspresent",
];

const FAQS = [
  { q: "Hinner jag få julklappen i tid?", a: "Ja! Presentkortet levereras digitalt via e-post, så du kan köpa det ända in på julafton och skriva ut eller vidarebefordra direkt." },
  { q: "Hur levereras presentkortet?", a: "Du får ett snyggt formgivet presentkort digitalt – att skriva ut och lägga i en kuvert, eller skicka direkt till mottagaren." },
  { q: "Vad kan presentkortet användas till?", a: "Alla våra städtjänster – hemstädning, flyttstädning, storstädning och fönsterputsning i Stockholm." },
  { q: "Hur länge gäller det?", a: "Presentkortet är giltigt i 12 månader, så mottagaren kan använda det när det passar. (Bekräfta er giltighetstid.)" },
];

export default function Julklapp() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Julklapp: presentkort på städning i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Årets julklapp? Ge bort ett rent hem. Presentkort på städning från Stodona – levereras digitalt, perfekt även som sista minuten-julklapp i Stockholm."
        />
        <link rel="canonical" href="https://stodona.se/julklapp-stadning" />
        <meta property="og:title" content="Julklapp: presentkort på städning | Stodona" />
        <meta property="og:description" content="Ge bort ett rent hem i jul. Digitalt presentkort – hinner ända in på julafton." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/julklapp-stadning" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <motion.img src="/stodona-stad.jpg" alt="" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/40" />
        <motion.div aria-hidden animate={{ y: [0, -22, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl z-0" />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <TreePine className="w-4 h-4 text-cta-hover" /> Årets julklapp
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Ge bort ett rent hem
              <br />
              <span className="italic font-normal text-cta-hover">i jul. 🎄</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Slut på idéer? Ett presentkort på städning är julklappen som ger tid, lugn och
              mer jul åt någon du bryr dig om. Levereras digitalt – du hinner ända in på
              julafton.
            </p>
            <Link to="/presentkort" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg inline-flex">
              Köp julklappen <Gift className="w-5 h-5 ml-2" />
            </Link>
            <TrustBar light className="mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Reasons */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Därför är det årets bästa julklapp</h2>
            <p className="text-text-secondary text-lg">Prylarna glöms bort. Tid och lugn glöms aldrig.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REASONS.map((r, i) => (
              <motion.div key={r.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                className="bg-bg-primary rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <r.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-text-secondary leading-relaxed">{r.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sista minuten */}
      <section className="section-spacing bg-bg-dark text-text-light relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-96 h-96 rounded-full bg-cta-hover/15 blur-3xl" />
        <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <Mail className="w-4 h-4 text-cta-hover" /> Sista minuten
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Glömt en klapp? Fixat på minuter.</h2>
            <p className="text-text-light/85 text-lg leading-relaxed">
              Presentkortet levereras digitalt. Beställ, skriv en personlig hälsning och få
              ett snyggt presentkort att skriva ut eller skicka direkt till mottagaren –
              även på julafton.
            </p>
          </motion.div>
          <motion.ul initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            className="space-y-3">
            {FOR_WHO.map((f) => (
              <li key={f} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                <span className="font-medium">{f}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Vanliga frågor om julklappen</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {f.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cta-hover text-text-primary text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ge bort mer jul i år 🎁</h2>
          <p className="text-xl mb-10 opacity-90">Ett presentkort på städning – tid och lugn till någon du bryr dig om.</p>
          <Link to="/presentkort" className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4 inline-flex">
            Köp presentkort <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
