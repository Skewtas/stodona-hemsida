import { useRef, useState } from "react";
import { Helmet } from "../seo";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from "motion/react";
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
  Download,
  X,
  ImageDown,
} from "lucide-react";

/**
 * DOLD influencer-landningssida. Lösenordsskydd på servernivå (middleware.ts +
 * api/influencer-auth.ts). noindex/nofollow, olänkad. Nås via /influencersamarbete.
 * ▸ Uppdatera enkelt: ändra CONFIG nedan.
 */
const CONFIG = {
  rabatt: 50,
  handle: "@stodona.se",
  webb: "www.stodona.se",
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

/* —————— hjälpkomponenter —————— */
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-cta-hover origin-left z-[60]" aria-hidden />;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Cta({ children, to, href, variant = "primary", className = "" }: { children: React.ReactNode; to?: string; href?: string; variant?: "primary" | "secondary" | "light"; className?: string }) {
  const base =
    variant === "secondary" ? "btn-secondary"
    : variant === "light" ? "btn-primary bg-white text-text-primary hover:bg-cta-hover"
    : "btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary";
  const cls = `${base} px-7 py-3.5 inline-flex items-center gap-2 ${className}`;
  if (href) return <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">{children}</a>;
  if (to && to.startsWith("#")) return <button type="button" onClick={() => scrollTo(to.slice(1))} className={cls}>{children}</button>;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" className={cls}>{children}</button>;
}

function CopyChip({ value, big = false }: { value: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } }}
      className={`inline-flex items-center gap-2 rounded-full bg-cta-hover/20 border border-cta-hover/40 font-semibold text-text-primary hover:bg-cta-hover/30 transition-colors ${big ? "px-4 py-2 text-base" : "px-3 py-1.5 text-sm"}`} title="Klicka för att kopiera">
      {value}{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
    </button>
  );
}

/* —————— data —————— */
const SERVICES = [
  { name: "Hemstädning", desc: "Återkommande eller enstaka.", img: "/stodona-stad.jpg" },
  { name: "Storstädning", desc: "Hela hemmet på djupet.", img: "/stodona-damm.jpg" },
  { name: "Flyttstädning", desc: "Flyttbestyr utan stress.", img: "/stodona_left_image.jpg" },
  { name: "Fönsterputsning", desc: "Kristallklara fönster.", img: "/fonster-stodona.jpg" },
  { name: "Företagsstädning", desc: "Rent för hela teamet.", img: "/kontorsstadning.jpg" },
];

const STEG = [
  { n: "1", icon: CalendarClock, title: "Välj och boka", text: "Välj någon av Stodonas tjänster och boka enligt överenskommelsen." },
  { n: "2", icon: Sparkles, title: "Vi tar hand om jobbet", text: "Stodona utför tjänsten medan du fokuserar på annat." },
  { n: "3", icon: Share2, title: "Dela och få 50 %", text: "Publicera minst en story samma kalendervecka och få 50 % rabatt på tillfället." },
];

const PHONES = [
  { media: { type: "img" as const, src: "/stodona-stad.jpg" }, caption: "Den bästa känslan – ett helt nystädat hem ✨" },
  { media: { type: "video" as const, src: "/stodona-hero.mp4" }, caption: "Stodona tar hand om hemmet medan jag får tid till annat." },
  { media: { type: "img" as const, src: "/stodona_right_image.jpg" }, caption: "Så nöjd med resultatet! Nu känns hela hemmet nytt igen." },
];

const STORY_MUST = [
  <><strong>{CONFIG.handle}</strong></>,
  <><strong>{CONFIG.webb}</strong></>,
  <>Tydlig reklammärkning</>,
  <>En sanningsenlig koppling till tjänsten</>,
  <>Publicering samma kalendervecka</>,
];

const RULE_POINTS = [
  "Varje tjänstetillfälle kräver en ny publicering.",
  "En tidigare story kan inte återanvändas för ett nytt tillfälle.",
  "En story som publiceras en senare vecka ger inte rabatt retroaktivt.",
  <>Storyn måste innehålla både <strong>{CONFIG.handle}</strong> och <strong>{CONFIG.webb}</strong>.</>,
  "Stodona ska få en skärmbild eller länk efter publiceringen.",
];

const SERVICE_OPTIONS = ["Vet ej ännu / vill diskutera", "Hemstädning", "Storstädning", "Flyttstädning", "Fönsterputsning", "Företagsstädning", "Byggstädning"];

const DEFAULT_COPY = "Reklam i samarbete med @stodona.se ✨ Så härligt att komma hem till ett nystädat hem! Läs mer på www.stodona.se";
const STORY_TEMPLATES = [
  { id: "fore", cat: "Före", file: "/story/stodona-story-fore.png", name: "Före tjänsten", text: "Reklam i samarbete med @stodona.se ✨ Idag kommer Stodona och fixar hemmet – jag återkommer med resultatet! www.stodona.se" },
  { id: "under", cat: "Under", file: "/story/stodona-story-under.png", name: "Under arbetet", text: "Reklam i samarbete med @stodona.se ✨ Stodona tar hand om hemmet medan jag hinner med annat. www.stodona.se" },
  { id: "video", cat: "Under", file: "/story/stodona-story-video-omslag.png", name: "Videoomslag", text: "Reklam i samarbete med @stodona.se ✨ Se hur Stodona förvandlar mitt hem. www.stodona.se" },
  { id: "efter", cat: "Efter", file: "/story/stodona-story-efter.png", name: "Efter tjänsten", text: DEFAULT_COPY },
  { id: "rek", cat: "Efter", file: "/story/stodona-story-rekommendation.png", name: "Rekommendation", text: "Reklam i samarbete med @stodona.se ✨ Så nöjd med resultatet – hela hemmet känns nytt igen! www.stodona.se" },
  { id: "foreefter", cat: "Före och efter", file: "/story/stodona-story-fore-efter.png", name: "Före & efter", text: "Reklam i samarbete med @stodona.se ✨ Före och efter Stodonas städning – vilken skillnad! www.stodona.se" },
  { id: "minimal", cat: "Lägg till egen text", file: "/story/stodona-story-minimalistisk.png", name: "Minimalistisk", text: DEFAULT_COPY },
  { id: "citat", cat: "Lägg till egen text", file: "/story/stodona-story-citat.png", name: "Citat", text: DEFAULT_COPY },
  { id: "neutral1", cat: "Lägg till egen text", file: "/story/stodona-story-neutral-1.png", name: "Neutral (kök)", text: DEFAULT_COPY },
  { id: "neutral2", cat: "Lägg till egen text", file: "/story/stodona-story-neutral-2.png", name: "Neutral (fönster)", text: DEFAULT_COPY },
];
const FILTERS = ["Alla", "Före", "Under", "Efter", "Före och efter", "Lägg till egen text"];

/* —————— story-telefon —————— */
function PhoneCard({ media, caption }: { media: { type: "img" | "video"; src: string }; caption: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative snap-center shrink-0 w-[76%] sm:w-[54%] md:w-auto">
      <div aria-hidden className="absolute -inset-4 rounded-[46px] bg-cta-hover/20 blur-3xl" />
      <div className="relative aspect-[9/19] rounded-[40px] bg-bg-dark p-2.5 shadow-2xl ring-1 ring-white/10 mx-auto max-w-[270px]">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden">
          {media.type === "video" ? (
            <video autoPlay loop muted playsInline preload="metadata" poster={CONFIG.heroPoster} className="absolute inset-0 w-full h-full object-cover"><source src={media.src} type="video/mp4" /></video>
          ) : (
            <motion.img src={media.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" animate={reduce ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35" />
          <div className="absolute top-3 inset-x-3 flex gap-1" aria-hidden>{[0, 1, 2].map((k) => (<div key={k} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"><div className={`h-full bg-white ${k === 0 ? "w-2/3" : "w-0"}`} /></div>))}</div>
          <div className="absolute top-8 left-3 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-cta-hover flex items-center justify-center text-[11px] font-bold text-text-primary">S</span><span className="text-white text-xs font-semibold drop-shadow">{CONFIG.handle}</span></div>
          <span className="absolute top-9 right-3 text-[9px] font-bold uppercase tracking-wide bg-white/85 text-text-primary px-2 py-0.5 rounded-full">Reklam</span>
          <p className="absolute inset-x-4 bottom-20 text-white text-lg font-semibold leading-snug drop-shadow-lg font-display">{caption}</p>
          <div className="absolute inset-x-3 bottom-4 text-white/90 text-[11px] leading-tight drop-shadow"><p>Reklam i samarbete med {CONFIG.handle}</p><p className="font-semibold">{CONFIG.webb}</p></div>
        </div>
      </div>
    </div>
  );
}

/* —————— radikalt förbättrad process —————— */
function StepsProcess() {
  return (
    <div className="relative">
      {/* desktop: horisontell linje bakom cirklarna */}
      <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-cta-hover/30" aria-hidden>
        <motion.div className="h-full bg-cta-hover origin-left" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} />
      </div>
      {/* mobil: vertikal tidslinje */}
      <div className="md:hidden absolute top-8 bottom-8 left-[31px] w-0.5 bg-cta-hover/25" aria-hidden />
      <div className="grid md:grid-cols-3 gap-8 md:gap-6">
        {STEG.map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
            <div className="relative z-10 shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-cta-hover text-text-primary flex items-center justify-center shadow-lg">
              <span className="font-display text-2xl md:text-3xl font-bold">{s.n}</span>
            </div>
            <div className="md:mt-5">
              <div className="hidden md:flex justify-center mb-2"><s.icon className="w-6 h-6 text-cta-hover" /></div>
              <h3 className="text-xl font-bold mb-1.5">{s.title}</h3>
              <p className="text-text-secondary leading-relaxed md:max-w-[16rem] md:mx-auto">{s.text}</p>
              {s.n === "3" && (
                <div className="mt-3 flex flex-wrap md:justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-cta-hover/40 rounded-full px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cta-hover" /> Tagga {CONFIG.handle}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-cta-hover/40 rounded-full px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cta-hover" /> Länka {CONFIG.webb}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* —————— mediabibliotek —————— */
function StoryLibrary() {
  const [filter, setFilter] = useState("Alla");
  const [open, setOpen] = useState<null | (typeof STORY_TEMPLATES)[number]>(null);
  const [copied, setCopied] = useState(false);
  const shown = filter === "Alla" ? STORY_TEMPLATES : STORY_TEMPLATES.filter((t) => t.cat === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-white border-text-primary/10 text-text-secondary hover:border-cta-hover/50"}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.4 }}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-bg-primary">
            <button onClick={() => { setOpen(t); setCopied(false); }} className="block w-full">
              <img src={t.file} alt={`Story-mall: ${t.name}`} loading="lazy" decoding="async" className="w-full aspect-[9/16] object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-2 left-2 right-2 text-left text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">{t.name}</span>
            </button>
            <a href={t.file} download={t.file.split("/").pop()} onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow" title="Ladda ner">
              <Download className="w-4 h-4 text-text-primary" />
            </a>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <a href="/story/stodona-story-material.zip" download className="btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary px-7 py-3.5 inline-flex items-center gap-2">
          <ImageDown className="w-5 h-5" /> Ladda ner alla
        </a>
      </div>

      {/* modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2">
              <div className="bg-bg-primary p-5 flex items-center justify-center">
                <img src={open.file} alt={`Story-mall: ${open.name}`} className="max-h-[60vh] w-auto rounded-2xl shadow-lg" />
              </div>
              <div className="p-6 relative">
                <button onClick={() => setOpen(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X className="w-6 h-6" /></button>
                <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">{open.cat}</span>
                <h3 className="text-2xl font-bold mt-1 mb-4">{open.name}</h3>

                <a href={open.file} download={open.file.split("/").pop()} className="btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary w-full py-3.5 flex items-center justify-center gap-2 mb-5">
                  <Download className="w-5 h-5" /> Ladda ner till story
                </a>

                <p className="text-sm font-semibold mb-2">Förslag på text</p>
                <div className="rounded-2xl bg-bg-primary p-4 text-sm text-text-secondary mb-3">{open.text}</div>
                <button onClick={async () => { try { await navigator.clipboard.writeText(open.text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } }}
                  className="btn-secondary w-full py-3 flex items-center justify-center gap-2 mb-5">
                  {copied ? <><Check className="w-4 h-4 text-green-600" /> Kopierad!</> : <><Copy className="w-4 h-4" /> Kopiera text</>}
                </button>

                <div className="rounded-2xl border border-cta-hover/30 bg-cta-hover/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-primary mb-2">Måste finnas med</p>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover shrink-0" /> Tagga {CONFIG.handle}</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover shrink-0" /> Länk till {CONFIG.webb}</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover shrink-0" /> Tydlig reklammärkning</li>
                  </ul>
                  <p className="text-xs text-text-secondary mt-3">Anpassa gärna mallen med din egen upplevelse. Storyn ska avse det aktuella tillfället och publiceras under samma kalendervecka som tjänsten utförs.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* —————— sidan —————— */
export default function InfluencerSamarbete() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const today = (() => { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } })();
  const [form, setForm] = useState({ name: "", social: "", channel: "Instagram", email: "", phone: "", service: SERVICE_OPTIONS[0], date: today, idea: "", accept: false });

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
        method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ _subject: "Influencer – vill påbörja samarbete", Namn: form.name, "Användarnamn (sociala medier)": form.social, "Social kanal": form.channel, "E-post": form.email, Telefon: form.phone, "Intresserad av tjänst": form.service, "Önskat datum": form.date, "Idé / önskemål": form.idea, "Godkänner villkoren": form.accept ? "Ja" : "Nej" }),
      });
      if (res.ok) setDone(true); else throw new Error("fel");
    } catch { alert(`Något gick fel. Försök igen eller mejla oss på ${CONFIG.kontaktEpost}.`); } finally { setSubmitting(false); }
  }

  return (
    <div className="flex flex-col bg-bg-primary pb-16 md:pb-0 overflow-x-hidden">
      <Helmet>
        <title>Influencersamarbete med Stodona</title>
        <meta name="description" content="Information och villkor för influencersamarbeten med Stodona." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ProgressBar />

      {/* 1. Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden text-text-light">
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline preload="metadata" poster={CONFIG.heroPoster}><source src={CONFIG.heroVideo} type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/70 via-bg-dark/45 to-bg-dark/85" />
        <motion.div aria-hidden animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl" />
        <div className="container-custom relative z-10 text-center max-w-3xl">
          <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-7"><Sparkles className="w-4 h-4 text-cta-hover" /> Endast för inbjudna</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">Få <span className="italic font-normal text-cta-hover">50 % rabatt</span> på din städning</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg sm:text-xl text-text-light/90 max-w-2xl mx-auto leading-relaxed mb-8 drop-shadow">Boka någon av Stodonas tjänster, dela upplevelsen med dina följare och få 50 % rabatt på det aktuella tillfället.</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-3">
            <Cta to="#ansok" className="text-lg">Få 50 % rabatt <ArrowRight className="w-5 h-5" /></Cta>
            <Cta href={CONFIG.bokaUrl} variant="secondary" className="!text-text-light !border-white/40 hover:!bg-white hover:!text-text-primary text-lg">Boka din städning</Cta>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="text-sm text-text-light/70 mt-5">Gäller alla våra tjänster enligt överenskommelse.</motion.p>
        </div>
        <motion.button onClick={() => scrollTo("tjanster")} aria-label="Scrolla ner" animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white"><ChevronDown className="w-8 h-8" /></motion.button>
      </section>

      {/* 2. Tjänstevägg – direkt under hero */}
      <section id="tjanster" className="py-16 sm:py-20 bg-white scroll-mt-24">
        <div className="container-custom max-w-3xl text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Fritt val</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Få 50 % rabatt på alla våra tjänster</h2>
          <p className="text-text-secondary text-lg">Välj tjänsten som passar dig och ditt hem. Du får 50 % rabatt på det överenskomna tillfället när publiceringsvillkoren är uppfyllda.</p>
        </div>
        <div className="w-screen relative left-1/2 -translate-x-1/2 px-4 md:px-6">
          <div className="flex lg:grid lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0 [scrollbar-width:none]">
            {SERVICES.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: (i % 5) * 0.06 }}
                className="snap-center shrink-0 w-[80%] sm:w-[42%] lg:w-auto">
                <div className="group relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <img src={s.img} alt={`${s.name} – Stodona`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span className="absolute top-3 left-3 text-[11px] font-bold bg-cta-hover text-text-primary px-2.5 py-1 rounded-full">50 % rabatt</span>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
                    <p className="text-sm text-white/80 mb-3">{s.desc}</p>
                    <a href={CONFIG.bokaUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/95 text-text-primary rounded-full px-4 py-2 hover:bg-cta-hover transition-colors">Välj tjänst <ArrowRight className="w-4 h-4" /></a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="text-center mt-8"><Cta href={CONFIG.bokaUrl}>Välj tjänst och få 50 % rabatt <ArrowRight className="w-5 h-5" /></Cta></div>
      </section>

      {/* 3. Tre enkla steg */}
      <section id="steg" className="section-spacing bg-bg-primary scroll-mt-24">
        <div className="container-custom max-w-5xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold">Tre enkla steg till 50 % rabatt</h2>
            <p className="text-text-secondary text-lg mt-3">Boka, låt Stodona ta hand om jobbet och dela resultatet med dina följare.</p>
          </Reveal>
          <StepsProcess />
          <div className="text-center mt-12">
            <Cta to="#ansok">Påbörja samarbetet <ArrowRight className="w-5 h-5" /></Cta>
            <div className="mt-4"><button onClick={() => scrollTo("villkor")} className="text-sm text-cta-hover font-medium hover:underline">Läs publiceringsvillkoren</button></div>
          </div>
        </div>
      </section>

      {/* 4. Story-sektion */}
      <section className="section-spacing bg-bg-dark text-text-light relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-16 -left-10 w-96 h-96 rounded-full bg-cta-hover/15 blur-3xl" />
        <div className="container-custom max-w-6xl relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Så kan en story se ut</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">Ditt uttryck, din känsla</h2>
            <p className="text-text-light/75 mt-3">Exemplen är inspiration – du behöver inte kopiera dem ordagrant.</p>
          </Reveal>
          <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none]">
            {PHONES.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.55, delay: i * 0.12 }}><PhoneCard media={p.media} caption={p.caption} /></motion.div>
            ))}
          </div>
          <div className="mt-12 max-w-xl mx-auto rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2"><BadgeCheck className="w-6 h-6 text-cta-hover" /> Din story måste innehålla</h3>
            <ul className="space-y-3">{STORY_MUST.map((m, i) => (<li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" /><span>{m}</span></li>))}</ul>
            <div className="mt-6 flex flex-wrap items-center gap-3"><span className="text-sm text-text-light/70">Kopiera:</span><CopyChip value={CONFIG.handle} big /><CopyChip value={CONFIG.webb} big /></div>
          </div>
          <div className="text-center mt-10"><Cta href={CONFIG.bokaUrl}>Välj en tjänst och börja skapa <ArrowRight className="w-5 h-5" /></Cta></div>
        </div>
      </section>

      {/* 5. Nedladdningsbart material */}
      <section id="material" className="section-spacing bg-white scroll-mt-24">
        <div className="container-custom max-w-6xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Vet du inte vad du ska posta?</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Vi har gjort det enkelt för dig</h2>
            <p className="text-text-secondary text-lg">Ladda ner färdigt Stodona-material och anpassa det med din egen text, känsla och upplevelse.</p>
          </Reveal>
          <StoryLibrary />
        </div>
      </section>

      {/* 6. Mid-page skärmbred CTA */}
      <section className="relative py-24 sm:py-28 overflow-hidden text-text-light">
        <img src="/stodona-damm.jpg" alt="" aria-hidden loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-bg-dark/80" />
        <motion.div aria-hidden animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-cta-hover/25 blur-3xl" />
        <div className="container-custom relative z-10 text-center max-w-2xl">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Redo för ett renare hem till halva priset?</h2>
            <p className="text-text-light/85 text-lg mb-8">Välj en tjänst, dela din upplevelse och få 50 % rabatt på det överenskomna tillfället.</p>
            <div className="flex flex-wrap justify-center gap-3"><Cta href={CONFIG.bokaUrl} className="text-lg">Boka och få 50 % <ArrowRight className="w-5 h-5" /></Cta><Cta to="#ansok" variant="light">Påbörja samarbetet</Cta></div>
            <p className="text-xs text-text-light/60 mt-5">Rabatten förutsätter att publiceringsvillkoren uppfylls.</p>
          </Reveal>
        </div>
      </section>

      {/* 7. Publiceringsvillkor */}
      <section id="villkor" className="section-spacing bg-cta-hover/15 scroll-mt-24">
        <div className="container-custom max-w-4xl">
          <Reveal className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cta-hover text-text-primary text-xs font-bold tracking-widest uppercase mb-5"><AlertTriangle className="w-4 h-4" /> Viktigast av allt</span>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Storyn måste publiceras samma vecka</h2>
            <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto">För att få {CONFIG.rabatt} % rabatt på det aktuella tillfället behöver din story publiceras under samma kalendervecka som Stodonas tjänst utförs.</p>
          </Reveal>
          <div className="rounded-2xl bg-white/70 border border-cta-hover/30 p-5 text-center mb-6"><p className="text-text-primary"><strong>Exempel:</strong> Om tjänsten utförs på en tisdag måste storyn publiceras senast <strong>söndag samma vecka</strong>.</p></div>
          <div className="rounded-3xl border-2 border-text-primary bg-text-primary text-text-light p-6 sm:p-8 text-center mb-8"><AlertTriangle className="w-7 h-7 text-cta-hover mx-auto mb-3" /><p className="text-xl sm:text-2xl font-bold leading-snug">Om en godkänd story inte publiceras samma kalendervecka gäller ordinarie pris för det aktuella tillfället.</p></div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">{RULE_POINTS.map((p, i) => (<li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-4"><Info className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" /><span className="text-text-primary text-sm">{p}</span></li>))}</ul>
          <div className="text-center mt-8"><Cta to="#ansok">Jag vill samarbeta <Handshake className="w-5 h-5" /></Cta></div>
        </div>
      </section>

      {/* 8. Avslutande bokningssektion */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl text-center">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ditt nästa Stodona-tillfälle till 50 % rabatt</h2>
            <p className="text-text-secondary text-lg mb-8">Påbörja samarbetet, välj en tjänst och dela upplevelsen med dina följare.</p>
            <div className="flex flex-wrap justify-center gap-3"><Cta to="#ansok" className="text-lg">Få 50 % rabatt <ArrowRight className="w-5 h-5" /></Cta><Cta href={CONFIG.bokaUrl} variant="secondary">Boka din tjänst</Cta></div>
            <p className="text-xs text-text-secondary mt-5">Rabatten gäller det aktuella, överenskomna tjänstetillfället när publiceringsvillkoren är uppfyllda.</p>
          </Reveal>
        </div>
      </section>

      {/* 9. Formulär */}
      <section id="ansok" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom max-w-2xl">
          <Reveal className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">Sista steget</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Redo att påbörja samarbetet?</h2>
            <p className="text-text-light/80 text-lg">Har du en idé eller vill stämma av ditt innehåll? Fyll i nedan så hör {CONFIG.kontaktNamn} av sig – eller mejla <a href={`mailto:${CONFIG.kontaktEpost}`} className="text-cta-hover hover:underline">{CONFIG.kontaktEpost}</a>.</p>
          </Reveal>
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center">
              <div className="w-16 h-16 bg-cta-hover/25 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold mb-2">Tack – vi har tagit emot din intresseanmälan! 💛</h3>
              <p className="text-text-light/80 max-w-md mx-auto">Din kontaktperson hör av sig så snart som möjligt för att stämma av upplägg och tjänst.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className={labelClass}>Namn *</label><input name="name" required value={form.name} onChange={update} className={inputClass} /></div>
                <div><label className={labelClass}>E-post *</label><input type="email" name="email" required value={form.email} onChange={update} className={inputClass} /></div>
                <div><label className={labelClass}>Användarnamn (sociala medier) *</label><input name="social" required value={form.social} onChange={update} placeholder="Ex: @dittnamn" className={inputClass} /></div>
                <div><label className={labelClass}>Social kanal *</label><select name="channel" value={form.channel} onChange={update} className={`${inputClass} cursor-pointer`}>{["Instagram", "TikTok", "YouTube", "Facebook", "Blogg", "Annan"].map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={labelClass}>Telefon *</label><input type="tel" name="phone" required value={form.phone} onChange={update} className={inputClass} /></div>
                <div><label className={labelClass}>Önskat datum</label><input type="date" name="date" value={form.date} onChange={update} className={`${inputClass} cursor-pointer`} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Vilken tjänst är du intresserad av?</label><select name="service" value={form.service} onChange={update} className={`${inputClass} cursor-pointer`}>{SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
                <div className="sm:col-span-2"><label className={labelClass}>Idé eller önskemål</label><textarea name="idea" rows={3} value={form.idea} onChange={update} className={`${inputClass} resize-none`} placeholder="Berätta gärna hur du tänkt dig innehållet." /></div>
              </div>
              <label className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4 cursor-pointer">
                <input type="checkbox" name="accept" checked={form.accept} onChange={update} required className="mt-1 w-5 h-5 accent-[color:var(--color-cta-hover,#c8b6a6)] shrink-0" />
                <span className="text-text-primary text-sm font-medium">Jag har läst och godkänner villkoren. Jag förstår att storyn måste publiceras samma kalendervecka som tjänsten utförs och att den alltid ska innehålla {CONFIG.handle} samt länken {CONFIG.webb}.</span>
              </label>
              <button type="submit" disabled={submitting || !form.accept} className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Påbörja samarbetet <Send className="w-5 h-5" /></>}</button>
              <p className="text-xs text-center text-text-secondary flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cta-hover" /> Dina uppgifter hanteras tryggt enligt vår <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.</p>
            </form>
          )}
        </div>
      </section>

      {/* Fast mobil-CTA */}
      {!done && (
        <button onClick={() => scrollTo("ansok")} className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cta-hover text-text-primary font-bold py-3.5 flex items-center justify-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <Sparkles className="w-5 h-5" /> Få 50 % rabatt
        </button>
      )}
    </div>
  );
}
