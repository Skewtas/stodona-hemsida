import { useEffect, useRef, useState } from "react";
import { Helmet } from "../seo";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import {
  Sparkles,
  CalendarClock,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Loader2,
  Send,
  BadgeCheck,
  Info,
  Handshake,
} from "lucide-react";

/**
 * DOLD influencer-landningssida.
 * Lösenordsskydd sker på SERVERNIVÅ (Edge Middleware + /api/influencer-auth) –
 * inte i klientkoden. Lösenordet ligger i miljövariabeln INFLUENCER_PW i Vercel.
 * Sidan är dessutom noindex/nofollow, olänkad och nås via svårgissad URL.
 *
 * ▸ Uppdatera enkelt: ändra CONFIG nedan (rabatt, taggning, länk, kontakt, boknings-URL).
 */
const CONFIG = {
  rabatt: 50,
  handle: "@stodona.se",
  webb: "www.stodona.se",
  webbUrl: "https://www.stodona.se",
  bokaUrl: "https://boka.stodona.se",
  kontaktNamn: "din kontaktperson hos Stodona",
  kontaktEpost: "info@stodona.se",
  heroVideo: "/stodona-hero.mp4",
  heroPoster: "/hero-poster.jpg",
};

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-text-primary/10 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* —————————— hjälpkomponenter —————————— */

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-cta-hover origin-left z-[60]" aria-hidden />;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Knapp som antingen scrollar (to = "#id"), länkar internt (to = "/x") eller externt (href).
function Cta({
  children,
  to,
  href,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "secondary" | "light";
  className?: string;
}) {
  const base =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "light"
      ? "btn-primary bg-white text-text-primary hover:bg-cta-hover"
      : "btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary";
  const cls = `${base} px-7 py-3.5 inline-flex items-center gap-2 ${className}`;
  if (href) return <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">{children}</a>;
  if (to && to.startsWith("#")) return <button type="button" onClick={() => scrollTo(to.slice(1))} className={cls}>{children}</button>;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" className={cls}>{children}</button>;
}

// Kopierbar chip för @stodona.se / www.stodona.se.
function CopyChip({ value, big = false }: { value: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className={`inline-flex items-center gap-2 rounded-full bg-cta-hover/20 border border-cta-hover/40 font-semibold text-text-primary hover:bg-cta-hover/30 transition-colors ${
        big ? "px-4 py-2 text-base" : "px-3 py-1.5 text-sm"
      }`}
      title="Klicka för att kopiera"
    >
      {value}
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
    </button>
  );
}

/* —————————— data —————————— */

const STEG = [
  { n: "1", icon: CalendarClock, title: "Boka", text: "Välj någon av Stodonas tjänster enligt vår överenskommelse." },
  { n: "2", icon: Sparkles, title: "Vi utför tjänsten", text: "Stodona tar hand om jobbet. Du fångar upplevelsen och resultatet." },
  { n: "3", icon: Share2, title: "Dela", text: "Publicera minst en story under samma kalendervecka." },
];

const PHONES = [
  { media: { type: "img" as const, src: "/stodona-stad.jpg" }, caption: "Den bästa känslan – ett helt nystädat hem ✨" },
  { media: { type: "video" as const, src: "/stodona-hero.mp4" }, caption: "Stodona tar hand om hemmet medan jag får tid till annat." },
  { media: { type: "img" as const, src: "/stodona_right_image.jpg" }, caption: "Så nöjd med resultatet! Nu känns hela hemmet nytt igen." },
];

const MUST = [
  <>Tagga alltid <strong>{CONFIG.handle}</strong></>,
  <>Lägg alltid till länken <strong>{CONFIG.webb}</strong></>,
  <>Reklammärk samarbetet tydligt</>,
  <>Publicera under samma kalendervecka som tjänsten utförs</>,
  <>Skicka en skärmbild eller länk till Stodona efter publiceringen</>,
];

const SERVICES = [
  { name: "Hemstädning", to: "/hemstadning", img: "/stodona-stad.jpg" },
  { name: "Storstädning", to: "/storstadning", img: "/stodona-damm.jpg" },
  { name: "Flyttstädning", to: "/flyttstadning", img: "/stodona_left_image.jpg" },
  { name: "Fönsterputsning", to: "/fonsterputsning", img: "/fonster-stodona.jpg" },
  { name: "Företagsstädning", to: "/foretagsstadning", img: "/kontorsstadning.jpg" },
  { name: "Byggstädning", to: "/byggstadning", img: "/byggstadning.jpg" },
];

const RULE_POINTS = [
  "Varje tjänstetillfälle kräver en ny story.",
  "En tidigare story kan inte återanvändas för ett nytt tillfälle.",
  "En story som publiceras en senare vecka ger inte rabatt retroaktivt.",
  <>Storyn måste innehålla både <strong>{CONFIG.handle}</strong> och <strong>{CONFIG.webb}</strong>.</>,
  "Stodona ska få en skärmbild eller länk efter publiceringen.",
];

const SERVICE_OPTIONS = [
  "Vet ej ännu / vill diskutera",
  "Hemstädning",
  "Storstädning",
  "Flyttstädning",
  "Fönsterputsning",
  "Företagsstädning",
  "Byggstädning",
];

/* —————————— story-telefon —————————— */
function PhoneCard({ media, caption }: { media: { type: "img" | "video"; src: string }; caption: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative snap-center shrink-0 w-[76%] sm:w-[54%] md:w-auto">
      <div aria-hidden className="absolute -inset-4 rounded-[46px] bg-cta-hover/20 blur-3xl" />
      <div className="relative aspect-[9/19] rounded-[40px] bg-bg-dark p-2.5 shadow-2xl ring-1 ring-white/10 mx-auto max-w-[270px]">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden">
          {media.type === "video" ? (
            <video autoPlay loop muted playsInline preload="metadata" poster={CONFIG.heroPoster} className="absolute inset-0 w-full h-full object-cover">
              <source src={media.src} type="video/mp4" />
            </video>
          ) : (
            <motion.img
              src={media.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35" />
          {/* story-progress */}
          <div className="absolute top-3 inset-x-3 flex gap-1" aria-hidden>
            {[0, 1, 2].map((k) => (
              <div key={k} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div className={`h-full bg-white ${k === 0 ? "w-2/3" : "w-0"}`} />
              </div>
            ))}
          </div>
          {/* tagg + reklammärkning */}
          <div className="absolute top-8 left-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-cta-hover flex items-center justify-center text-[11px] font-bold text-text-primary">S</span>
            <span className="text-white text-xs font-semibold drop-shadow">{CONFIG.handle}</span>
          </div>
          <span className="absolute top-9 right-3 text-[9px] font-bold uppercase tracking-wide bg-white/85 text-text-primary px-2 py-0.5 rounded-full">
            Reklam
          </span>
          {/* budskap */}
          <p className="absolute inset-x-4 bottom-20 text-white text-lg font-semibold leading-snug drop-shadow-lg font-display">{caption}</p>
          {/* obligatoriska tags */}
          <div className="absolute inset-x-3 bottom-4 text-white/90 text-[11px] leading-tight drop-shadow">
            <p>Reklam i samarbete med {CONFIG.handle}</p>
            <p className="font-semibold">{CONFIG.webb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  return (
    <div>
      <div
        ref={ref}
        onScroll={() => {
          const el = ref.current;
          if (el) setActive(Math.round(el.scrollLeft / (el.clientWidth * 0.62)));
        }}
        className="flex md:grid md:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none]"
      >
        {PHONES.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
          >
            <PhoneCard media={p.media} caption={p.caption} />
          </motion.div>
        ))}
      </div>
      {/* lägesindikator (mobil) */}
      <div className="flex md:hidden justify-center gap-2 mt-2">
        {PHONES.map((_, i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${i === Math.min(active, 2) ? "w-6 bg-cta-hover" : "w-2 bg-text-primary/20"}`} />
        ))}
      </div>
    </div>
  );
}

/* —————————— sidan —————————— */
export default function InfluencerSamarbete() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const today = (() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return "";
    }
  })();
  const [form, setForm] = useState({
    name: "",
    social: "",
    channel: "Instagram",
    email: "",
    phone: "",
    service: SERVICE_OPTIONS[0],
    date: today,
    idea: "",
    accept: false,
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? target.checked : value }));
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
          _subject: "Influencer – vill påbörja samarbete",
          Namn: form.name,
          "Användarnamn (sociala medier)": form.social,
          "Social kanal": form.channel,
          "E-post": form.email,
          Telefon: form.phone,
          "Intresserad av tjänst": form.service,
          "Önskat datum": form.date,
          "Idé / önskemål": form.idea,
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
    <div className="flex flex-col bg-bg-primary pb-16 md:pb-0">
      <Helmet>
        <title>Influencersamarbete med Stodona</title>
        <meta name="description" content="Information och villkor för influencersamarbeten med Stodona." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ProgressBar />

      {/* ——— 1. Hero ——— */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden text-text-light">
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline preload="metadata" poster={CONFIG.heroPoster}>
          <source src={CONFIG.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/70 via-bg-dark/45 to-bg-dark/85" />
        <motion.div aria-hidden animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl" />
        <div className="container-custom relative z-10 text-center max-w-3xl">
          <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-7">
            <Sparkles className="w-4 h-4 text-cta-hover" /> Endast för inbjudna
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
            Ett rent hem.
            <br />
            <span className="italic font-normal text-cta-hover">Ett naturligt samarbete.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg sm:text-xl text-text-light/90 max-w-2xl mx-auto leading-relaxed mb-3 drop-shadow">
            Få <strong>{CONFIG.rabatt} % rabatt på alla Stodonas tjänster</strong> när du delar upplevelsen med dina följare.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-sm text-text-light/70 max-w-xl mx-auto mb-9">
            Gäller inte bara hemstädning – utan alla tjänster enligt överenskommelse: storstädning, flyttstädning, fönsterputsning med flera.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-3">
            <Cta to="#ansok" className="text-lg">Påbörja samarbetet <ArrowRight className="w-5 h-5" /></Cta>
            <Cta to="#steg" variant="secondary" className="!text-text-light !border-white/40 hover:!bg-white hover:!text-text-primary text-lg">Se hur det fungerar</Cta>
          </motion.div>
        </div>
        <motion.button onClick={() => scrollTo("steg")} aria-label="Scrolla ner" animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white">
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </section>

      {/* ——— 2. Tre enkla steg (kompakt, direkt under hero) ——— */}
      <section id="steg" className="py-14 sm:py-16 bg-white scroll-mt-24">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Tre enkla steg</h2>
          </Reveal>
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {STEG.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-2xl bg-bg-primary p-4 sm:p-6 text-center"
              >
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-white flex items-center justify-center">
                  <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cta-hover" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cta-hover text-text-primary text-[11px] sm:text-xs font-bold flex items-center justify-center">{s.n}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-1">{s.title}</h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-snug">{s.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Cta href={CONFIG.bokaUrl}>Boka nu <ArrowRight className="w-5 h-5" /></Cta>
          </div>
        </div>
      </section>

      {/* ——— 3. Story-sektion (uppflyttad, centrumbit) ——— */}
      <section className="section-spacing bg-bg-dark text-text-light relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-16 -left-10 w-96 h-96 rounded-full bg-cta-hover/15 blur-3xl" />
        <div className="container-custom max-w-6xl relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Så kan en story se ut</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Ditt uttryck, din känsla</h2>
          </Reveal>

          <StoryCarousel />

          <p className="text-center text-text-light/80 max-w-2xl mx-auto mt-10 leading-relaxed">
            Du känner din kanal och dina följare bäst. Skapa innehållet med ditt eget uttryck, din ton och din
            känsla. Det viktigaste är att upplevelsen presenteras sanningsenligt och på ett sätt som känns rätt
            för både dig och Stodona.
          </p>

          {/* Måste alltid finnas med */}
          <div className="mt-12 max-w-2xl mx-auto rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <BadgeCheck className="w-6 h-6 text-cta-hover" /> Det här måste alltid finnas med
            </h3>
            <ul className="space-y-3">
              {MUST.map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm text-text-light/70">Kopiera:</span>
              <CopyChip value={CONFIG.handle} big />
              <CopyChip value={CONFIG.webb} big />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Cta to="#ansok">Påbörja samarbetet <ArrowRight className="w-5 h-5" /></Cta>
            <Cta href={CONFIG.bokaUrl} variant="light">Boka en tjänst</Cta>
          </div>
        </div>
      </section>

      {/* ——— 4. Alla tjänster ——— */}
      <section id="tjanster" className="section-spacing bg-white scroll-mt-24">
        <div className="container-custom max-w-6xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Fritt val</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">{CONFIG.rabatt} % rabatt på alla våra tjänster</h2>
            <p className="text-text-secondary text-lg">
              Samarbetet kan omfatta alla tjänster som Stodona erbjuder. Du och din kontaktperson kommer överens
              om vilken tjänst som passar bäst inför varje tillfälle.
            </p>
          </Reveal>
          {/* horisontell karusell */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 [scrollbar-width:none]">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="snap-center shrink-0 w-[70%] sm:w-[45%] md:w-[31%]"
              >
                <Link to={s.to} className="group block rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500">
                  <div className="relative h-52 overflow-hidden">
                    <img src={s.img} alt={`${s.name} – Stodona`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow">{s.name}</span>
                    <span className="absolute top-3 right-3 text-[11px] font-bold bg-cta-hover text-text-primary px-2.5 py-1 rounded-full">−{CONFIG.rabatt} %</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Cta to="/" variant="secondary">Se våra tjänster <ArrowRight className="w-5 h-5" /></Cta>
          </div>
        </div>
      </section>

      {/* ——— 5. Viktigaste villkoret ——— */}
      <section className="section-spacing bg-cta-hover/15">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cta-hover text-text-primary text-xs font-bold tracking-widest uppercase mb-5">
              <AlertTriangle className="w-4 h-4" /> Viktigast av allt
            </span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Storyn måste publiceras samma vecka</h2>
            <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">
              För att få {CONFIG.rabatt} % rabatt på det aktuella tillfället behöver din story publiceras under
              samma kalendervecka som Stodonas tjänst utförs.
            </p>
          </Reveal>

          <div className="rounded-2xl bg-white/70 border border-cta-hover/30 p-5 text-center mb-6">
            <p className="text-text-primary">
              <strong>Exempel:</strong> Om tjänsten utförs på en tisdag måste storyn publiceras senast{" "}
              <strong>söndag samma vecka</strong>.
            </p>
          </div>

          {/* KRITISK text – alltid synlig, aldrig bakom knapp/expandering */}
          <div className="rounded-3xl border-2 border-text-primary bg-text-primary text-text-light p-6 sm:p-8 text-center mb-8">
            <AlertTriangle className="w-7 h-7 text-cta-hover mx-auto mb-3" />
            <p className="text-xl sm:text-2xl font-bold leading-snug">
              Om en godkänd story inte publiceras samma kalendervecka gäller ordinarie pris för det aktuella tillfället.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RULE_POINTS.map((p, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                <Info className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-primary text-sm">{p}</span>
              </li>
            ))}
          </ul>

          <div className="text-center mt-8">
            <Cta to="#ansok">Jag vill samarbeta <Handshake className="w-5 h-5" /></Cta>
          </div>
        </div>
      </section>

      {/* ——— 7. Formulär ——— */}
      <section id="ansok" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom max-w-2xl">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Sista steget</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Redo att påbörja samarbetet?</h2>
            <p className="text-text-light/80 text-lg">
              Har du en idé eller vill stämma av ditt innehåll? Fyll i nedan så hör {CONFIG.kontaktNamn} av sig – eller
              mejla <a href={`mailto:${CONFIG.kontaktEpost}`} className="text-cta-hover hover:underline">{CONFIG.kontaktEpost}</a>.
            </p>
          </Reveal>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center">
              <div className="w-16 h-16 bg-cta-hover/25 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Tack – vi har tagit emot din intresseanmälan! 💛</h3>
              <p className="text-text-light/80 max-w-md mx-auto">
                Din kontaktperson hör av sig så snart som möjligt för att stämma av upplägg och tjänst.
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
                  <label className={labelClass}>Användarnamn (sociala medier) *</label>
                  <input name="social" required value={form.social} onChange={update} placeholder="Ex: @dittnamn" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Social kanal *</label>
                  <select name="channel" value={form.channel} onChange={update} className={`${inputClass} cursor-pointer`}>
                    {["Instagram", "TikTok", "YouTube", "Facebook", "Blogg", "Annan"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Telefon *</label>
                  <input type="tel" name="phone" required value={form.phone} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Önskat datum</label>
                  <input type="date" name="date" value={form.date} onChange={update} className={`${inputClass} cursor-pointer`} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Vilken tjänst är du intresserad av?</label>
                  <select name="service" value={form.service} onChange={update} className={`${inputClass} cursor-pointer`}>
                    {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Idé eller önskemål</label>
                  <textarea name="idea" rows={3} value={form.idea} onChange={update} className={`${inputClass} resize-none`} placeholder="Berätta gärna hur du tänkt dig innehållet." />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4 cursor-pointer">
                <input type="checkbox" name="accept" checked={form.accept} onChange={update} required className="mt-1 w-5 h-5 accent-[color:var(--color-cta-hover,#c8b6a6)] shrink-0" />
                <span className="text-text-primary text-sm font-medium">
                  Jag har läst och godkänner villkoren. Jag förstår att storyn måste publiceras samma kalendervecka som
                  tjänsten utförs och att den alltid ska innehålla {CONFIG.handle} samt länken {CONFIG.webb}.
                </span>
              </label>

              <button type="submit" disabled={submitting || !form.accept} className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Påbörja samarbetet <Send className="w-5 h-5" /></>}
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

      {/* Fast CTA på mobil (täcker ej viktig info – slank rad, döljs när formuläret är success) */}
      {!done && (
        <button
          onClick={() => scrollTo("ansok")}
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cta-hover text-text-primary font-bold py-3.5 flex items-center justify-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        >
          <Handshake className="w-5 h-5" /> Påbörja samarbetet
        </button>
      )}
    </div>
  );
}
