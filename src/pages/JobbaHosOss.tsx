import { Helmet } from "../seo";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Sparkles,
  Wallet,
  Clock,
  GraduationCap,
  Users,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Star,
} from "lucide-react";
import { JOBS } from "../jobsData";
import JobApplicationForm from "../components/JobApplicationForm";

const PERKS = [
  { icon: Wallet, title: "Schyssta villkor", text: "Marknadsmässig lön, försäkring och trygga anställningsvillkor." },
  { icon: Clock, title: "Flexibelt", text: "Vi gör vårt bästa för att anpassa schemat efter din vardag." },
  { icon: GraduationCap, title: "Utveckling", text: "Ordentlig introduktion, upplärning och chans att växa hos oss." },
  { icon: Users, title: "Härligt team", text: "Du blir en del av ett omtänksamt gäng som stöttar varandra." },
  { icon: Heart, title: "Meningsfullt", text: "Ditt arbete gör verklig skillnad i människors vardag." },
  { icon: ShieldCheck, title: "Tryggt varumärke", text: "Ett av Stockholms mest rekommenderade servicebolag." },
];

export default function JobbaHosOss() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Jobba hos Stodona – Lediga tjänster i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Sök jobb hos Stodona i Stockholm. Vi söker hemstädare, byggstädare, fönsterputsare, barnvakter, konsulter och underleverantörer. Enkel ansökan – bifoga CV direkt."
        />
        <link rel="canonical" href="https://stodona.se/jobba-hos-oss" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <motion.img
          src="/stodona-stad.jpg"
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/40" />
        <motion.div
          aria-hidden
          animate={{ y: [0, -24, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-20 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl z-0"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cta-hover/15 blur-3xl z-0"
        />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6"
            >
              <Sparkles className="w-4 h-4 text-cta-hover" /> Jobba med oss
            </motion.span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Bli en del av
              <br />
              <span className="italic font-normal text-cta-hover">Stodona-teamet!</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Vi växer och söker härliga, ansvarsfulla människor som vill göra skillnad i
              vardagen – i Stockholm och Stockholmsområdet. Hitta din roll och sök på
              någon minut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#tjanster" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Se lediga tjänster <ArrowDown className="w-5 h-5 ml-2" />
              </a>
              <a href="#ansok" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm">
                Gör en spontanansökan
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-text-light/85">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </span>
                4.9/5 i snittbetyg
              </span>
              <span className="text-text-light/40">·</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cta-hover" /> Ansvarsförsäkrade</span>
              <span className="text-text-light/40">·</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4 text-cta-hover" /> Härligt team</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-spacing bg-white relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-1/2 h-full bg-cta-hover/5 blur-3xl rounded-l-full z-0" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Varför jobba hos oss?</h2>
            <p className="text-text-secondary text-lg">Vi tar hand om vårt team lika bra som vi tar hand om våra kunder.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="group bg-bg-primary rounded-3xl p-8 border border-transparent hover:border-cta-hover/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-cta-hover flex items-center justify-center mb-6 transition-colors duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <p.icon className="w-7 h-7 text-cta-hover group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lediga tjänster – bild-kort som länkar till varje annons */}
      <section id="tjanster" className="section-spacing bg-bg-primary scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-cta-hover/10 blur-3xl rounded-full z-0" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              Lediga tjänster
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Hitta din roll</h2>
            <p className="text-text-secondary text-lg">Klicka på en tjänst för att läsa mer och ansöka.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOBS.map((j, i) => (
              <motion.div
                key={j.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              >
                <Link
                  to={`/jobb/${j.slug}`}
                  className="group relative block rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-80"
                >
                  <img
                    src={j.image}
                    alt={j.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[900ms] ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-500" />

                  <span className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <j.icon className="w-6 h-6 text-white" />
                  </span>
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-green-500/90 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Öppen
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-text-light">
                    <h3 className="text-2xl font-bold mb-1 drop-shadow">{j.title}</h3>
                    <p className="text-text-light/85 text-sm leading-relaxed mb-4 drop-shadow">{j.short}</p>
                    <span className="inline-flex items-center gap-2 font-bold text-cta-hover group-hover:gap-3 transition-all">
                      Läs mer & ansök <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Spontanansökan-kort */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl overflow-hidden bg-bg-dark text-text-light p-8 flex flex-col justify-center h-80 shadow-md"
            >
              <div aria-hidden className="pointer-events-none absolute -top-10 -right-8 w-48 h-48 rounded-full bg-cta-hover/25 blur-2xl" />
              <Sparkles className="w-10 h-10 text-cta-hover mb-4 relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">Hittar du ingen passande roll?</h3>
              <p className="text-text-light/75 mb-6 relative z-10">
                Vi vill ändå gärna höra från dig. Skicka en spontanansökan så hör vi av oss
                när något dyker upp.
              </p>
              <a href="#ansok" className="inline-flex items-center gap-2 font-bold text-cta-hover hover:text-white transition-colors relative z-10 self-start">
                Gör en spontanansökan <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spontanansökan / allmän ansökan */}
      <section id="ansok" className="section-spacing bg-bg-dark text-text-light scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cta-hover/20 blur-3xl rounded-full z-0" />
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 bg-cta-hover/10 blur-3xl rounded-full z-0" />
        <div className="container-custom max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Spontanansökan
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">Skicka en spontanansökan</h2>
            <p className="text-text-light/70 text-lg">
              Välj en roll eller lämna den som spontanansökan – bifoga gärna ditt CV.
            </p>
          </div>
          <JobApplicationForm defaultRole="Spontanansökan" />
        </div>
      </section>
    </div>
  );
}
