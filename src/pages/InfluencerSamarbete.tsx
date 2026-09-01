import { useState } from "react";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Sparkles,
  Heart,
  CalendarClock,
  CheckCircle2,
  Camera,
  AtSign,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Send,
  ClipboardCheck,
  Link2,
  Loader2,
  BadgePercent,
} from "lucide-react";

/**
 * DOLD influencer-sida (noindex, ej i menyer/sitemap/sök, ej publikt länkad).
 * Nås endast via direktlänk. Route med svårgissad URL sätts i App.tsx.
 *
 * ▸ Enkelt att uppdatera: ändra värdena i CONFIG nedan för rabatt, taggning,
 *   kontaktperson och ev. rabattkod – resten av sidan följer med.
 */
const CONFIG = {
  rabatt: "50 %",
  taggHandle: "@stodona",
  kontaktNamn: "din kontaktperson hos Stodona",
  kontaktEpost: "info@stodona.se",
  kontaktTelefon: "010-178 01 50",
  // Valfri rabattkod att kommunicera i storyn. Lämna tom om ingen används.
  rabattkod: "",
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

const STEG = [
  { icon: CalendarClock, title: "1. Boka städning", text: "Du bokar ett städtillfälle enligt vår gemensamma överenskommelse." },
  { icon: Sparkles, title: "2. Vi städar", text: "Stodona utför städningen och lämnar ett hem med hotellkänsla." },
  { icon: Camera, title: "3. Du publicerar", text: "Du publicerar minst en story om städningen samma kalendervecka som den utförs." },
];

const KRAV = [
  "Handla om eller tydligt visa den aktuella städningen eller resultatet.",
  `Nämna och tagga Stodonas överenskomna konto (${CONFIG.taggHandle}).`,
  "Innehålla eventuell länk, rabattkod eller annan information som ni kommit överens om.",
  "Vara synlig under storyns normala publiceringstid.",
  "Vara sanningsenlig och följa gällande regler för reklam och betalda samarbeten.",
  "Vara utformad så att både Stodonas varumärke och ditt personliga uttryck respekteras.",
];

const CHECKLISTA = [
  "Publicera minst en story per städtillfälle.",
  "Publicera storyn samma kalendervecka som städningen utförs.",
  `Tagga Stodona (${CONFIG.taggHandle}) och inkludera överenskommen information.`,
  "Reklammärk innehållet tydligt enligt gällande regler.",
  "Skicka en skärmbild eller länk till Stodona.",
];

// Framträdande ruta om vecko-regeln (återanvänds två gånger på sidan).
function WeekRuleBox({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl border-2 border-cta-hover bg-cta-hover/12 p-6 sm:p-8 overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-cta-hover/20 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="shrink-0 w-12 h-12 rounded-2xl bg-cta-hover text-text-primary flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </span>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Viktigt: Storyn måste publiceras samma vecka</h3>
          <p className="text-text-primary/90 leading-relaxed">
            För att få <strong>{CONFIG.rabatt} rabatt</strong> på ett städtillfälle behöver din story publiceras
            under <strong>samma kalendervecka</strong> som städningen utförs. Varje städtillfälle kräver en ny
            publicering. Om ingen story publiceras inom den aktuella veckan gäller <strong>ordinarie pris</strong> för
            det städtillfället.
          </p>
          {!compact && (
            <div className="mt-4 inline-flex items-start gap-2 rounded-xl bg-white/70 border border-cta-hover/30 px-4 py-3 text-sm">
              <CalendarClock className="w-4 h-4 text-cta-hover shrink-0 mt-0.5" />
              <span>
                <strong>Exempel:</strong> Om städningen utförs på en tisdag behöver storyn publiceras senast{" "}
                <strong>söndag samma vecka</strong>.
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">{eyebrow}</span>
      <h2 className="text-3xl md:text-4xl font-bold mt-2">{title}</h2>
    </motion.div>
  );
}

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
  const [form, setForm] = useState({ name: "", channel: "", email: "", date: today, accept: false });

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
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
    <div className="flex flex-col">
      <Helmet>
        <title>Influencersamarbete med Stodona</title>
        <meta
          name="description"
          content="Information och villkor för influencersamarbeten med Stodona."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-bg-dark text-text-light pt-32 pb-20 overflow-hidden">
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-cta-hover/20 blur-3xl z-0"
        />
        <div className="container-custom max-w-3xl relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-4 h-4 text-cta-hover" /> Endast för inbjudna
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold leading-tight mb-5"
          >
            Influencersamarbete med Stodona
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-light/80 leading-relaxed"
          >
            Ett exklusivt samarbete för dig som älskar ett välstädat hem – och vill dela känslan
            med dina följare. Här hittar du allt du behöver veta om hur samarbetet fungerar.
          </motion.p>
        </div>
      </section>

      <div className="bg-white">
        <div className="container-custom max-w-3xl py-16 sm:py-20 space-y-20">
          {/* 1. Inledning */}
          <section>
            <SectionHeading eyebrow="Välkommen" title="Ett rent hem – ett naturligt samarbete" />
            <div className="space-y-5 text-lg text-text-secondary leading-relaxed">
              <p>
                Stodona samarbetar med ett fåtal utvalda influencers som uppskattar ett välstädat
                hem och vill dela upplevelsen med sina följare. Som samarbetspartner får du{" "}
                <strong className="text-text-primary">{CONFIG.rabatt} rabatt</strong> på varje
                överenskommet städtillfälle – under förutsättning att en story publiceras enligt
                villkoren på den här sidan.
              </p>
              <div className="rounded-3xl bg-bg-primary p-6 sm:p-7 border-l-4 border-cta-hover">
                <Heart className="w-6 h-6 text-cta-hover fill-cta-hover mb-3" />
                <p className="text-text-primary italic">
                  “Vi vill skapa samarbeten som känns genuina för både dig, dina följare och Stodona.
                  Därför får du frihet att utforma innehållet med din egen röst – så länge Stodona och
                  tjänsten presenteras på ett positivt, tydligt och sanningsenligt sätt.”
                </p>
              </div>
            </div>
          </section>

          {/* 2. Så fungerar samarbetet */}
          <section>
            <SectionHeading eyebrow="Så går det till" title="Så fungerar samarbetet" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {STEG.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="rounded-3xl bg-bg-primary p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-cta-hover" />
                  </div>
                  <h3 className="font-bold text-lg mb-1.5">{s.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-text-secondary">
              När villkoren är uppfyllda får du <strong className="text-text-primary">{CONFIG.rabatt} rabatt</strong>{" "}
              på det aktuella städtillfället.
            </p>
          </section>

          {/* 3. Mycket viktig info – vecko-regeln (1:a gången) */}
          <section>
            <SectionHeading eyebrow="Läs noga" title="Publiceringstiden är avgörande" />
            <WeekRuleBox />
          </section>

          {/* 4. Krav på innehållet */}
          <section>
            <SectionHeading eyebrow="Innehållet" title="Krav på storyn" />
            <p className="text-text-secondary text-lg mb-6">
              Varje överenskommet städtillfälle ska följas av <strong className="text-text-primary">minst en story</strong>.
              Storyn ska:
            </p>
            <ul className="space-y-3">
              {KRAV.map((k) => (
                <li key={k} className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4">
                  <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-primary">{k}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-3xl bg-bg-dark text-text-light p-6 sm:p-7">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cta-hover" /> Din kreativa frihet
              </h3>
              <p className="text-text-light/85 leading-relaxed">
                Du väljer själv bild, video, formulering och berättarstil – innehållet ska kännas naturligt
                i din kanal. Det får däremot inte innehålla felaktiga påståenden eller material som kan
                uppfattas som kränkande, vilseledande eller skadligt för Stodonas varumärke.
              </p>
            </div>
          </section>

          {/* 5. Bekräftelse på publicering */}
          <section>
            <SectionHeading eyebrow="Efter publicering" title="Bekräfta din story" />
            <div className="flex items-start gap-4 rounded-3xl bg-bg-primary p-6 sm:p-7">
              <span className="shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                <Link2 className="w-6 h-6 text-cta-hover" />
              </span>
              <p className="text-text-secondary text-lg leading-relaxed">
                Skicka en <strong className="text-text-primary">skärmbild eller länk</strong> till storyn till{" "}
                {CONFIG.kontaktNamn} efter publiceringen. Då kan vi enkelt bekräfta att villkoren för rabatten
                är uppfyllda.
              </p>
            </div>
          </section>

          {/* 6. Om storyn inte publiceras */}
          <section>
            <SectionHeading eyebrow="Bra att veta" title="Om storyn inte publiceras" />
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                Rabatten är kopplad till <strong className="text-text-primary">varje enskilt städtillfälle</strong>.
                Om publiceringen uteblir, publiceras för sent eller inte uppfyller det som överenskommits har
                Stodona rätt att debitera ordinarie pris för det aktuella städtillfället.
              </p>
              <p>
                En story från ett tidigare eller senare städtillfälle kan inte användas för att få rabatt
                retroaktivt på en annan städning, om detta inte skriftligen har godkänts av Stodona.
              </p>
            </div>
          </section>

          {/* 7. Sammanfattning / checklista (vecko-regeln 2:a gången) */}
          <section>
            <SectionHeading eyebrow="Snabb översikt" title={`För att få ${CONFIG.rabatt} rabatt på din städning`} />
            <ul className="space-y-3">
              {CHECKLISTA.map((c) => (
                <li key={c} className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4">
                  <ClipboardCheck className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl border-2 border-cta-hover bg-cta-hover/12 p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
              <p className="font-semibold text-text-primary">
                Ingen publicering samma vecka innebär att ordinarie pris gäller för städtillfället.
              </p>
            </div>
          </section>

          {/* 8. Kontakt & godkännande */}
          <section>
            <SectionHeading eyebrow="Sista steget" title="Kontakt och godkännande" />
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Har du frågor om innehållet eller vill stämma av en idé? Kontakta gärna {CONFIG.kontaktNamn}{" "}
              innan du publicerar – vi hjälper gärna till så att samarbetet känns rätt för alla. Du når oss på{" "}
              <a href={`mailto:${CONFIG.kontaktEpost}`} className="text-cta-hover font-medium hover:underline">
                {CONFIG.kontaktEpost}
              </a>{" "}
              eller{" "}
              <a href={`tel:${CONFIG.kontaktTelefon.replace(/\s/g, "")}`} className="text-cta-hover font-medium hover:underline">
                {CONFIG.kontaktTelefon}
              </a>
              .
            </p>

            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl bg-bg-primary p-10 text-center"
              >
                <div className="w-16 h-16 bg-cta-hover/20 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Tack – vi har tagit emot ditt godkännande! 💛</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Vi ser fram emot vårt samarbete. Din kontaktperson hör av sig, och du är alltid välkommen
                  att höra av dig om du har en idé du vill stämma av.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-t-4 border-cta-hover space-y-5"
              >
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
                    <input
                      name="channel"
                      required
                      value={form.channel}
                      onChange={update}
                      placeholder="Ex: @dittnamn på Instagram"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Datum *</label>
                    <input type="date" name="date" required value={form.date} onChange={update} className={`${inputClass} cursor-pointer`} />
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-bg-primary p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accept"
                    checked={form.accept}
                    onChange={update}
                    required
                    className="mt-1 w-5 h-5 accent-[color:var(--color-cta-hover,#c8b6a6)] shrink-0"
                  />
                  <span className="text-text-primary font-medium">
                    Jag har läst och godkänner villkoren för influencersamarbetet med Stodona.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !form.accept}
                  className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Jag har läst och godkänner villkoren <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-text-secondary flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cta-hover" />
                  Dina uppgifter hanteras tryggt enligt vår{" "}
                  <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                </p>
              </form>
            )}
          </section>

          {/* Diskret badge längst ner */}
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <BadgePercent className="w-4 h-4 text-cta-hover" />
            {CONFIG.rabatt} rabatt per städtillfälle med publicerad story samma vecka.
            {CONFIG.rabattkod ? ` Rabattkod: ${CONFIG.rabattkod}.` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
