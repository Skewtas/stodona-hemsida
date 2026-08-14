import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Baby,
  Heart,
  Clock,
  Wallet,
  GraduationCap,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const perks = [
  { icon: Clock, title: "Flexibla tider", text: "Jobba när det passar dig – dagtid, kvällar eller helger. Du styr din egen tillgänglighet." },
  { icon: Wallet, title: "Schysst betalt", text: "Marknadsmässig och trygg lön, med kollektivavtalsenliga villkor och försäkring." },
  { icon: Heart, title: "Meningsfullt", text: "Gör verklig skillnad i familjers vardag och i barns utveckling – varje dag." },
  { icon: GraduationCap, title: "Utbildning ingår", text: "Vi utbildar dig i HLR och första hjälpen för barn, och stöttar din utveckling." },
  { icon: Users, title: "Samma familjer", text: "Bygg riktiga, långsiktiga relationer med familjer som lär känna och uppskattar dig." },
  { icon: Sparkles, title: "Ett tryggt varumärke", text: "Bli en del av ett av Stockholms mest rekommenderade servicebolag." },
];

const requirements = [
  "Du är minst 18 år och älskar att umgås med barn.",
  "Du har erfarenhet av barn – som barnvakt, inom förskola/skola, som storasyskon eller liknande.",
  "Du är ansvarsfull, punktlig och trygg att ha omkring sig.",
  "Du kan visa upp utdrag ur belastningsregistret och lämna referenser.",
  "Du talar svenska eller engelska (fler språk är ett plus).",
];

const steps = [
  { step: "01", title: "Skicka ansökan", text: "Fyll i vår ansökan – det tar bara ett par minuter." },
  { step: "02", title: "Vi hör av oss", text: "Känns det som en match bjuder vi in dig till en personlig intervju." },
  { step: "03", title: "Kontroll & introduktion", text: "Vi tar referenser, kontrollerar registerutdrag och ger dig en grundlig introduktion." },
  { step: "04", title: "Välkommen till teamet", text: "Vi matchar dig med familjer som passar dig – och du är igång!" },
];

export default function BarnvaktJobb() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Jobba som barnvakt i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Sök jobb som barnvakt hos Stodona i Stockholm. Flexibla tider, schysst betalt och ett meningsfullt jobb där du gör skillnad. Skicka din ansökan idag."
        />
        {/* Dold sida – ska inte indexeras eller länkas */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <div className="absolute inset-0 z-0">
          <img src="/familj-stodona.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/90 via-bg-dark/65 to-bg-dark/35"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <Baby className="w-4 h-4 text-cta-hover" />
              Vi anställer barnvakter
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Få betalt för att
              <br />
              <span className="italic font-normal text-cta-hover">göra skillnad.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-10 drop-shadow-md">
              Älskar du barn? Bli barnvakt hos Stodona. Flexibla tider, schysst betalt
              och ett jobb som faktiskt betyder något – för familjer och för dig.
            </p>
            <a href="#ansokan" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Skicka din ansökan <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Varför jobba hos oss?</h2>
            <p className="text-text-secondary text-lg">
              Vi tar hand om vårt team lika bra som vi tar hand om familjerna vi hjälper.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="bg-bg-primary rounded-3xl p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <p.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vem vi söker */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              Vem vi söker
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Är det här du?
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Du behöver ingen perfekt CV – men ett stort hjärta, sunt förnuft och
              genuin omtanke om barn. Vi lär dig resten.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {requirements.map((r) => (
              <li key={r} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">{r}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Så går det till */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-14 text-center"
          >
            Så går ansökan till
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-bg-primary rounded-3xl p-7"
              >
                <span className="text-3xl font-bold text-cta-hover font-display">{s.step}</span>
                <h3 className="text-lg font-bold mt-3 mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ansökan CTA */}
      <section id="ansokan" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
            Skicka din ansökan
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Redo att göra skillnad?</h2>
          <p className="text-text-light/80 text-lg mb-10">
            Fyll i vår ansökan så lär vi känna dig. Det tar bara några minuter – vi ser
            fram emot att höra från dig!
          </p>
          <Link to="/barnvakt-ansokan" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg inline-flex">
            Till ansökan <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <p className="mt-12 text-text-light/70">
            Söker du istället barnpassning?{" "}
            <Link to="/barnpassning" className="text-cta-hover font-medium hover:underline">
              Läs om vår barnpassning här
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
