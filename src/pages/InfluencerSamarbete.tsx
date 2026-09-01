import { useEffect, useRef, useState } from "react";
import { Helmet } from "../seo";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  Sparkles,
  Heart,
  CalendarClock,
  Camera,
  CheckCircle2,
  BadgeCheck,
  AtSign,
  Link2,
  ArrowRight,
  ChevronDown,
  Send,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Info,
  Quote as QuoteIcon,
  MoveHorizontal,
  X,
} from "lucide-react";

/**
 * DOLD influencer-landningssida (noindex, ej i meny/sitemap/sök, ej publikt länkad).
 * Nås endast via direktlänk (svårgissad URL i App.tsx).
 *
 * ▸ Enkelt att uppdatera: ändra CONFIG nedan för rabatt, taggning, kontakt, rabattkod.
 * ▸ Byt ut bild/video mot Stodonas skarpa lifestyle-material där så önskas.
 *   Platshållare som MÅSTE bytas före lansering är tydligt markerade (citat + före/efter).
 */
const CONFIG = {
  rabatt: 50, // procent
  taggHandle: "@stodona",
  kontaktNamn: "din kontaktperson hos Stodona",
  kontaktEpost: "info@stodona.se",
  kontaktTelefon: "010-178 01 50",
  rabattkod: "", // valfri – lämna tom om ingen används
  heroVideo: "/stodona-hero.mp4",
  heroPoster: "/hero-poster.jpg",
};

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-text-primary/10 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

/* ————————————————————————————————————————————————
   Små hjälpkomponenter
———————————————————————————————————————————————— */

// Tunn progressindikator högst upp.
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 bg-cta-hover origin-left z-[60]"
      aria-hidden
    />
  );
}

// Fade + slide-up när innehåll scrollas fram.
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Bild med mjuk parallax vid scroll (avstängd vid reduced motion).
function ParallaxImage({
  src,
  alt,
  className = "",
  rounded = "rounded-[28px]",
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);
  return (
    <div ref={ref} className={`overflow-hidden ${rounded} ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ y, scale: 1.18 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Animerad procentsiffra (räknar upp till CONFIG.rabatt).
function CountPercent() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(CONFIG.rabatt);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * CONFIG.rabatt));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);
  return <span ref={ref}>{val}</span>;
}

/* ————————————————————————————————————————————————
   Data
———————————————————————————————————————————————— */

const STEG = [
  {
    tag: "01",
    title: "Boka",
    text: "Du bokar din städning enligt vår överenskommelse.",
    img: "/stodona_left_image.jpg",
    alt: "Bokning av städning i mobilen",
    icon: CalendarClock,
  },
  {
    tag: "02",
    title: "Njut",
    text: "Stodona tar hand om städningen – du får tid till annat.",
    img: "/stodona-damm.jpg",
    alt: "Professionell städare i en ljus, elegant hemmiljö",
    icon: Sparkles,
  },
  {
    tag: "03",
    title: "Dela",
    text: "Publicera minst en story under samma kalendervecka.",
    img: "/familj-stodona.jpg",
    alt: "Person som filmar sitt nystädade hem med telefonen",
    icon: Camera,
  },
];

const TIMELINE = [
  { day: "Måndag", label: "Städningen utförs", icon: Sparkles },
  { day: "Tis–sön", label: "Publicera din story", icon: Camera },
  { day: "Sön 23.59", label: "Veckan avslutas", icon: CalendarClock },
];

const REQ = [
  { icon: Camera, title: "Minst en story", text: "En story per överenskommet städtillfälle." },
  { icon: CalendarClock, title: "Samma kalendervecka", text: "Publicera samma vecka som städningen utförs." },
  { icon: AtSign, title: "Tagga Stodona", text: `Nämn och tagga ${CONFIG.taggHandle}.` },
  { icon: Info, title: "Överenskommen info", text: "Ta med länk, rabattkod eller annat ni bestämt." },
  { icon: BadgeCheck, title: "Reklammärkning", text: "Märk tydligt som betalt samarbete enligt reglerna." },
  { icon: Link2, title: "Skicka bevis", text: "Skärmbild eller länk till din kontaktperson." },
];

const GALLERY = [
  { src: "/stodona-stad.jpg", alt: "Skinande rent kök efter städning", cap: "Ett skinande kök" },
  { src: "/fonster-stodona.jpg", alt: "Nyputsade fönster med insläppande solljus", cap: "Kristallklara fönster" },
  { src: "/stodona_right_image.jpg", alt: "Ren och ombonad vrå i hemmet", cap: "En lugn stund" },
  { src: "/familj-stodona.jpg", alt: "Familj som njuter av sitt rena hem", cap: "Mer tid till det som räknas" },
  { src: "/stodona-damm.jpg", alt: "Detaljstädning av ytor i hemmet", cap: "Detaljerna som syns" },
  { src: "/stodona_left_image.jpg", alt: "Ombonat vardagsrum efter städning", cap: "Hemkänsla direkt" },
];

const STORY_MSGS = [
  "Den bästa känslan – ett helt nystädat hem.",
  "Stodona har varit här och gjort magi ✨",
  "Mer tid till annat och ett hem som känns fantastiskt.",
];

const CHECKLISTA = [
  "Publicera minst en story per städtillfälle.",
  "Publicera under samma kalendervecka som städningen.",
  `Tagga Stodona (${CONFIG.taggHandle}).`,
  "Reklammärk samarbetet tydligt.",
  "Skicka en skärmbild eller länk till Stodona.",
];

/* ————————————————————————————————————————————————
   Story-simulator (dekorativ telefon)
———————————————————————————————————————————————— */
function StorySimulator() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % STORY_MSGS.length), 3200);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px]">
      {/* mjuk glöd bakom */}
      <div aria-hidden className="absolute -inset-6 rounded-[48px] bg-cta-hover/25 blur-3xl" />
      <div className="relative aspect-[9/19] rounded-[42px] bg-bg-dark p-2.5 shadow-2xl ring-1 ring-white/10">
        <div className="relative w-full h-full rounded-[34px] overflow-hidden">
          <img
            src="/stodona-stad.jpg"
            alt="Exempel på en story från ett nystädat hem"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          {/* story-progress */}
          <div className="absolute top-3 inset-x-3 flex gap-1.5" aria-hidden>
            {STORY_MSGS.map((_, k) => (
              <div key={k} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div className={`h-full bg-white transition-all duration-500 ${k <= i ? "w-full" : "w-0"}`} />
              </div>
            ))}
          </div>
          {/* tagg + reklammärkning (platshållare) */}
          <div className="absolute top-8 left-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-cta-hover flex items-center justify-center text-[11px] font-bold text-text-primary">S</span>
            <span className="text-white text-xs font-semibold drop-shadow">{CONFIG.taggHandle}</span>
          </div>
          <span className="absolute top-9 right-3 text-[9px] font-bold uppercase tracking-wider bg-white/85 text-text-primary px-2 py-0.5 rounded-full">
            Betalt samarbete
          </span>
          {/* roterande budskap */}
          <div className="absolute inset-x-4 bottom-16 min-h-[72px] flex items-end">
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="text-white text-lg font-semibold leading-snug drop-shadow-lg font-display"
              >
                {STORY_MSGS[i]}
              </motion.p>
            </AnimatePresence>
          </div>
          {/* svarsfält-attrapp */}
          <div className="absolute inset-x-3 bottom-3 h-9 rounded-full border border-white/40 flex items-center px-4 text-white/70 text-xs">
            Skicka meddelande…
          </div>
        </div>
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Före / efter (interaktivt reglage)
   OBS: demonstration med filtrerad exempelbild – byt till riktiga
   före/efter-foton före lansering.
———————————————————————————————————————————————— */
function BeforeAfter() {
  const [pos, setPos] = useState(52);
  const src = "/stodona-stad.jpg";
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden select-none shadow-lg">
      {/* Efter (skarp) */}
      <img src={src} alt="Kök efter städning" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider bg-white/85 text-text-primary px-3 py-1 rounded-full">
        Efter
      </span>
      {/* Före (dämpad) – klippt till reglagets position */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={src}
          alt="Kök före städning (exempelvisning)"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(0.4) brightness(0.8) contrast(0.92) sepia(0.12)" }}
        />
        <div className="absolute inset-0 bg-black/10" />
        <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-black/55 text-white px-3 py-1 rounded-full">
          Före
        </span>
      </div>
      {/* handtag */}
      <div className="absolute inset-y-0 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white/90" />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center">
          <MoveHorizontal className="w-5 h-5 text-text-primary" />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Dra för att jämföra före och efter"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/90 bg-black/45 px-3 py-1 rounded-full pointer-events-none">
        Exempelvisning – ersätts med riktiga före/efter-foton
      </span>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Sidan
———————————————————————————————————————————————— */
export default function InfluencerSamarbete() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [lightbox, setLightbox] = useState<null | { src: string; alt: string }>(null);
  const today = (() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return "";
    }
  })();
  const [form, setForm] = useState({ name: "", channel: "", email: "", date: today, accept: false });

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function scrollToSteps() {
    document.getElementById("sa-fungerar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accept) return;
    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: "Influencer – godkända samarbetsvillkor",
          Namn: form.name,
          "Användarnamn / kanal": form.channel,
          "E-post": form.email,
          Datum: form.date,
          "Godkänner villkoren": form.accept ? "Ja" : "Nej",
        }),
      });
      if (res.ok) setDone(true);
      else throw new Error("fel");
    } catch {
      alert(`Något gick fel. Försök igen eller mejla oss på ${CONFIG.kontaktEpost}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col bg-bg-primary">
      <Helmet>
        <title>Influencersamarbete med Stodona</title>
        <meta name="description" content="Information och villkor för influencersamarbeten med Stodona." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ProgressBar />

      {/* ——— 1. Filmisk hero ——— */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden text-text-light">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={CONFIG.heroPoster}
        >
          <source src={CONFIG.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/70 via-bg-dark/45 to-bg-dark/80" />
        <motion.div
          aria-hidden
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl"
        />
        <div className="container-custom relative z-10 text-center max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-7"
          >
            <Sparkles className="w-4 h-4 text-cta-hover" /> Endast för inbjudna
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl"
          >
            Ett rent hem.
            <br />
            <span className="italic font-normal text-cta-hover">Ett naturligt samarbete.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg sm:text-xl text-text-light/90 max-w-2xl mx-auto leading-relaxed mb-9 drop-shadow"
          >
            Som utvald samarbetspartner får du <strong>{CONFIG.rabatt} % rabatt</strong> på dina
            överenskomna städtillfällen när du delar upplevelsen med dina följare.
          </motion.p>
          <motion.button
            onClick={scrollToSteps}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 inline-flex shadow-xl"
          >
            Så fungerar det <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
        {/* scroll-indikator */}
        <motion.button
          onClick={scrollToSteps}
          aria-label="Scrolla ner"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </section>

      {/* ——— 2. Visuell introduktion (omlott + parallax) ——— */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-5xl space-y-16 sm:space-y-24">
          {[
            { t: "Vi tar hand om hemmet.", img: "/stodona-damm.jpg", alt: "Professionell städning av ljust hem", flip: false },
            { t: "Du delar upplevelsen.", img: "/stodona-stad.jpg", alt: "Skinande rent kök redo att visas upp", flip: true },
            { t: "Dina följare får följa med.", img: "/familj-stodona.jpg", alt: "Avkoppling i ett nystädat, ombonat hem", flip: false },
          ].map((row, idx) => (
            <div
              key={row.t}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${row.flip ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <ParallaxImage src={row.img} alt={row.alt} className="aspect-[4/3] shadow-lg" />
              <Reveal delay={0.05}>
                <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">0{idx + 1}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 leading-tight">{row.t}</h2>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ——— 3. Så fungerar samarbetet ——— */}
      <section id="sa-fungerar" className="section-spacing bg-white scroll-mt-24">
        <div className="container-custom">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Så går det till</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Tre enkla steg</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEG.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-[28px] overflow-hidden bg-bg-primary shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className="absolute top-4 left-4 text-white/90 font-display text-4xl font-bold drop-shadow">{s.tag}</span>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-white font-bold text-xl drop-shadow">
                    <s.icon className="w-5 h-5 text-cta-hover" /> {s.title}
                  </span>
                </div>
                <p className="p-6 text-text-secondary leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 4. 50 % rabatt ——— */}
      <section className="relative py-24 sm:py-32 overflow-hidden text-text-light">
        <img src="/stodona-stad.jpg" alt="" aria-hidden loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-bg-dark/85" />
        <motion.div aria-hidden animate={{ x: [0, 40, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-cta-hover/30 blur-3xl" />
        <motion.div aria-hidden animate={{ x: [0, -30, 0], y: [0, 25, 0], opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-cta-hover/20 blur-3xl" />
        <div className="container-custom relative z-10 text-center max-w-2xl">
          <Reveal>
            <div className="font-display font-bold leading-none text-[7rem] sm:text-[11rem] text-cta-hover drop-shadow-xl">
              <CountPercent />%
            </div>
            <p className="text-2xl sm:text-3xl font-bold -mt-2 mb-6">rabatt på varje godkänt städtillfälle</p>
            <p className="text-text-light/85 text-lg leading-relaxed">
              Rabatten gäller <strong>ett städtillfälle i taget</strong> och aktiveras när
              publiceringsvillkoren för den aktuella städningen är uppfyllda.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— 5. Sidans viktigaste villkor ——— */}
      <section className="section-spacing bg-cta-hover/15">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cta-hover text-text-primary text-xs font-bold tracking-widest uppercase mb-5">
              <AlertTriangle className="w-4 h-4" /> Viktigast av allt
            </span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Storyn måste publiceras samma vecka</h2>
            <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">
              För att få {CONFIG.rabatt} % rabatt på ett städtillfälle behöver din story publiceras under
              samma kalendervecka som städningen utförs.
            </p>
          </Reveal>

          {/* animerad tidslinje */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <motion.div
              aria-hidden
              className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-0.5 bg-cta-hover origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            {TIMELINE.map((tl, i) => (
              <motion.div
                key={tl.day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.2 }}
                className="relative text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-white border-2 border-cta-hover flex items-center justify-center shadow-sm relative z-10">
                  <tl.icon className="w-6 h-6 text-cta-hover" />
                </div>
                <p className="font-bold mt-3">{tl.day}</p>
                <p className="text-text-secondary text-sm">{tl.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/70 border border-cta-hover/30 p-5 text-center mb-6">
            <p className="text-text-primary">
              <strong>Exempel:</strong> Städning på tisdag? Då behöver storyn publiceras senast{" "}
              <strong>söndag samma vecka</strong>.
            </p>
          </div>

          {/* KRITISK, alltid synlig text – ingen dölj-animation */}
          <div className="rounded-3xl border-2 border-text-primary bg-text-primary text-text-light p-6 sm:p-8 text-center">
            <AlertTriangle className="w-7 h-7 text-cta-hover mx-auto mb-3" />
            <p className="text-xl sm:text-2xl font-bold leading-snug">
              Om storyn inte publiceras samma kalendervecka gäller ordinarie pris för städtillfället.
            </p>
          </div>
        </div>
      </section>

      {/* ——— 6. Inspirationsgalleri (masonry + lightbox) ——— */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Inspiration</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Gör det på ditt sätt</h2>
            <p className="text-text-secondary text-lg">
              Du känner dina följare bäst. Skapa en story som känns naturlig i din kanal – och som
              speglar både dig och Stodona.
            </p>
          </Reveal>
          <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
            {GALLERY.map((g, i) => (
              <motion.button
                key={g.src + i}
                type="button"
                onClick={() => setLightbox({ src: g.src, alt: g.alt })}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-3 left-3 right-3 text-left text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                  {g.cap} · {CONFIG.taggHandle}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 7. Story-simulator ——— */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 md:order-1">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Så kan en story se ut</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-5">Ditt uttryck, din känsla</h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Din story ska visa eller berätta om städningen, tagga Stodona och vara tydligt
              reklammärkt enligt gällande regler. Resten är upp till dig.
            </p>
            <ul className="space-y-3">
              {["Visa eller berätta om städningen", `Tagga ${CONFIG.taggHandle}`, "Reklammärk tydligt"].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0" />
                  <span className="text-text-primary">{x}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="order-1 md:order-2">
            <StorySimulator />
          </div>
        </div>
      </section>

      {/* ——— 8. Krav som ikonkort ——— */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Villkoren</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Det här behöver storyn</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REQ.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="rounded-3xl bg-bg-primary p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4">
                  <r.icon className="w-6 h-6 text-cta-hover" />
                </div>
                <h3 className="font-bold text-lg mb-1.5">{r.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{r.text}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-text-secondary mt-8 max-w-2xl mx-auto">
            Du har full kreativ frihet med bild, video och berättarstil. Innehållet får dock inte vara
            felaktigt, vilseledande eller skadligt för Stodonas varumärke.
          </p>
        </div>
      </section>

      {/* ——— 9. Före / efter ——— */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Resultatet talar</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Dra och jämför</h2>
            <p className="text-text-secondary text-lg">Skillnaden en Stodona-städning gör – dra i reglaget.</p>
          </Reveal>
          <Reveal>
            <BeforeAfter />
          </Reveal>
        </div>
      </section>

      {/* ——— 10. Citat ——— */}
      <section className="relative py-24 sm:py-28 overflow-hidden text-text-light">
        <ParallaxImage src="/stodona_left_image.jpg" alt="Nöjd samarbetspartner i sitt ljusa, rena hem" rounded="rounded-none" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-bg-dark/65" />
        <div className="container-custom relative z-10 max-w-3xl text-center">
          <Reveal>
            <QuoteIcon className="w-10 h-10 text-cta-hover mx-auto mb-6" />
            <p className="text-2xl sm:text-4xl font-display font-medium leading-snug">
              “Att komma hem till ett nystädat hem ger mig både lugn och mer tid till det jag älskar.”
            </p>
            <p className="text-text-light/70 text-sm mt-6">Platshållarcitat – ersätts med ett riktigt, godkänt citat före lansering.</p>
          </Reveal>
        </div>
      </section>

      {/* ——— 11. Checklista ——— */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-2xl">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Sammanfattning</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Så får du {CONFIG.rabatt} % rabatt</h2>
          </Reveal>
          <ul className="space-y-3">
            {CHECKLISTA.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4"
              >
                <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0" />
                <span className="text-text-primary font-medium">{c}</span>
              </motion.li>
            ))}
          </ul>
          <div className="mt-5 rounded-2xl border-2 border-cta-hover bg-cta-hover/15 p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
            <p className="font-semibold text-text-primary">
              Ingen godkänd publicering samma vecka innebär att ordinarie pris gäller.
            </p>
          </div>
        </div>
      </section>

      {/* ——— 12. Godkännande & kontakt ——— */}
      <section className="section-spacing bg-bg-dark text-text-light">
        <div className="container-custom max-w-2xl">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Sista steget</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Godkänn samarbetet</h2>
            <p className="text-text-light/80 text-lg">
              Har du en kreativ idé eller vill stämma av ditt innehåll? Kontakta gärna {CONFIG.kontaktNamn}{" "}
              på{" "}
              <a href={`mailto:${CONFIG.kontaktEpost}`} className="text-cta-hover hover:underline">{CONFIG.kontaktEpost}</a>.
            </p>
          </Reveal>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center"
            >
              <div className="w-16 h-16 bg-cta-hover/25 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Tack – vi har tagit emot ditt godkännande! 💛</h3>
              <p className="text-text-light/80 max-w-md mx-auto">
                Vi ser fram emot vårt samarbete. Din kontaktperson hör av sig – och du är alltid välkommen
                att stämma av en idé.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Namn *</label>
                  <input name="name" required value={form.name} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>E-post *</label>
                  <input type="email" name="email" required value={form.email} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Användarnamn & social kanal *</label>
                  <input name="channel" required value={form.channel} onChange={update} placeholder="Ex: @dittnamn på Instagram" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Datum *</label>
                  <input type="date" name="date" required value={form.date} onChange={update} className={`${inputClass} cursor-pointer`} />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4 cursor-pointer">
                <input type="checkbox" name="accept" checked={form.accept} onChange={update} required className="mt-1 w-5 h-5 accent-[color:var(--color-cta-hover,#c8b6a6)] shrink-0" />
                <span className="text-text-primary font-medium">Jag har läst och godkänner villkoren.</span>
              </label>

              <button
                type="submit"
                disabled={submitting || !form.accept}
                className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Godkänn samarbetet <Send className="w-5 h-5" /></>}
              </button>
              <p className="text-xs text-center text-text-secondary flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cta-hover" />
                Dina uppgifter hanteras tryggt enligt vår{" "}
                <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button aria-label="Stäng" className="absolute top-5 right-5 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[86vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
