import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion, AnimatePresence } from "motion/react";
import {
  Handshake,
  Sparkles,
  Instagram,
  Wallet,
  Tag,
  CalendarClock,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Loader2,
  Megaphone,
  Heart,
  MapPin,
  Camera,
} from "lucide-react";

/**
 * PUBLIK samarbetssida – steg 1 i tratten. Här ansöker kreatörer om att bli
 * partner. Steg 2 är /min-partnersida, den lösenordsskyddade sidan där en
 * godkänd partner hämtar sin följarkod och sitt material.
 *
 * Sidan är indexerad och ligger i sitemap.xml.
 */

/* ————————————————————————————————————————————————————————————
   ⚠️ Kvar att bekräfta: utbetalningsintervall och svarstid nedan är
   antaganden, inte beslutade villkor. Provisionens storlek nämns med-
   vetet inte alls – den sätts individuellt.
   ———————————————————————————————————————————————————————————— */
const CONFIG = {
  // Medvetet INGEN procentsats på sidan – provisionen sätts individuellt och
  // ska förhandlas, inte läsas av. Det vi lovar publikt är långsiktigheten:
  // provision för samma kund varje månad i tre månader.
  provisionPeriod: "tre månader",
  foljarrabatt: "15 %",       // ⚠️ rabatten följarna får med koden
  utbetalning: "månadsvis",   // ⚠️ utbetalningsintervall
  handle: "@stodona.se",
  hashtag: "#stodona",
  instagram: "https://www.instagram.com/stodona.se/",
  epost: "info@stodona.se",   // ⚠️ egen samarbete@stodona.se vore snyggare
  svarstid: "3 arbetsdagar",  // ⚠️ hur snabbt ni lovar svara
};

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-text-primary/10 bg-bg-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/60";
const labelClass = "block text-sm font-medium mb-2";

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* —————————————————————— data —————————————————————— */

const steps = [
  {
    icon: Sparkles,
    title: "Ansök",
    text: "Fyll i formuläret här nedanför. Vi läser varje ansökan själva – ingen bot, ingen mall.",
  },
  {
    icon: Tag,
    title: "Få din kod och länk",
    text: `Du får en personlig rabattkod som ger dina följare ${CONFIG.foljarrabatt} på första städningen, och en spårbar länk.`,
  },
  {
    icon: Camera,
    title: "Berätta om det",
    text: "Du bestämmer formatet. En story efter din städdag, en reel om hur du fick tillbaka en söndag, ett omdöme i en nyhetsbrevstext.",
  },
  {
    icon: Wallet,
    title: "Få betalt",
    text: `Provision på varje bokning din kod ger – och för samma kund varje månad i ${CONFIG.provisionPeriod}. Utbetalning ${CONFIG.utbetalning}, mot faktura eller som tjänstekredit hos oss.`,
  },
];

const perks = [
  {
    icon: Wallet,
    title: "Provision som fortsätter ticka",
    text: `Du får provision för samma kund varje månad i ${CONFIG.provisionPeriod} – inte bara på första bokningen. Städning är något man gör om och om igen, och det bygger upp sig.`,
  },
  {
    icon: Tag,
    title: "En kod som faktiskt är värd att dela",
    text: `Dina följare får ${CONFIG.foljarrabatt} rabatt. Ovanpå det drar RUT-avdraget halva arbetskostnaden direkt på fakturan.`,
  },
  {
    icon: Heart,
    title: "Prova själv först",
    text: "Vi vill inte att du rekommenderar något du inte har känt. Utvalda samarbeten inleds med en städning hemma hos dig.",
  },
  {
    icon: Megaphone,
    title: "Full kreativ frihet",
    text: "Inga färdiga manus. Du känner din publik bättre än vi gör – vi ger dig fakta och låter dig hitta orden.",
  },
  {
    icon: CalendarClock,
    title: "Ingen bindningstid",
    text: "Inga krav på antal inlägg per månad. Vill du pausa gör du det, och koden ligger kvar.",
  },
  {
    icon: ShieldCheck,
    title: "En tjänst du kan stå för",
    text: "Försäkrad, kollektivavtalsenlig och med samma städare varje gång. Det du rekommenderar håller.",
  },
];

const criteria = [
  "Din publik finns till stor del i Stockholmsområdet – det är där vi städar.",
  "Du gör innehåll om hem, familj, vardagspussel, inredning, träning, mat eller livsstil.",
  "Du har ett engagemang som känns äkta. Vi tittar hellre på kommentarsfältet än på följarsiffran.",
  "Du är okej med att märka samarbeten enligt marknadsföringslagen – reklam ska synas att det är reklam.",
];

const directBrief = [
  "Vem du är och vad du gör för innehåll",
  "Dina kanaler, med följarantal och typisk räckvidd",
  "Din publik – ålder, var de bor, könsfördelning",
  "Exempel på tidigare samarbeten du är stolt över",
  "Varför just Stodona passar din publik",
  "Din idé, och vad den skulle kosta",
];

const faq = [
  {
    q: "Kan vem som helst ansöka?",
    a: "Ja. Vi har ingen nedre gräns för antal följare. En mikrokreatör med tvåtusen följare i Bromma som verkligen litas på är mer värd för oss än ett stort konto vars publik bor i fel stad.",
  },
  {
    q: "Måste jag ha provat städningen först?",
    a: "Nej, du kan komma igång direkt med din kod. Men vi rekommenderar det, och för många samarbeten bjuder vi på en städning så att du vet vad du pratar om.",
  },
  {
    q: "Hur fungerar spårningen?",
    a: "Du får en unik kod och en länk. Bokningar som kommer in via någon av dem knyts till dig automatiskt, även om kunden bokar några dagar senare.",
  },
  {
    q: "När kan jag börja?",
    a: `Vi svarar på alla ansökningar inom ${CONFIG.svarstid}. Blir det ja får du kod, länk och ett kort underlag med fakta om tjänsterna samma dag.`,
  },
  {
    q: "Var ser jag hur mycket jag tjänat?",
    a: "Du får en sammanställning från oss varje månad med antal bokningar och summa. Hör av dig när du vill däremellan så tar vi fram en avstämning.",
  },
  {
    q: "Hur får jag betalt?",
    a: `Utbetalning sker ${CONFIG.utbetalning} mot faktura – du behöver alltså kunna fakturera, via eget bolag eller en egenanställningstjänst. Vill du hellre ha tjänstekredit hos oss går det också bra.`,
  },
  {
    q: "Måste jag märka inlägget som reklam?",
    a: "Ja, alltid. Så snart du får ersättning eller något gratis är det reklam enligt marknadsföringslagen och ska märkas tydligt högst upp. Vi hjälper gärna till om du är osäker.",
  },
  {
    q: "Kan jag samarbeta med andra städbolag samtidigt?",
    a: "Vi ber dig att inte göra det parallellt – det blir förvirrande för din publik och urholkar rekommendationen. Har du haft ett tidigare samarbete som avslutats är det inget hinder.",
  },
];

/* —————————————————————— hjälpkomponenter —————————————————————— */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-text-primary/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 text-left p-6"
      >
        <span className="font-bold text-lg leading-snug">{q}</span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 mt-1 text-cta-hover transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-text-secondary leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* —————————————————————— sidan —————————————————————— */

export default function Samarbeta() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    handle: "",
    followers: "",
    audience: "",
    type: "Affiliate – kod och provision",
    previous: "",
    idea: "",
    link: "",
  });

  function update(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggleChannel(value: string) {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const ansokan = {
      namn: form.name,
      epost: form.email,
      telefon: form.phone,
      ort: form.city,
      kanaler: channels.join(", "),
      handle: form.handle,
      foljare: form.followers,
      publik: form.audience,
      typ: form.type,
      tidigare: form.previous,
      ide: form.idea,
      lank: form.link,
    };

    try {
      // Förstahandsval: egen endpoint som mejlar ansökan till Mikaela.
      const res = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ansokan),
      });
      if (res.ok) {
        setDone(true);
        return;
      }
      // 501 = Resend inte konfigurerat. Allt annat är också värt en andra chans
      // via Formspree – en ansökan ska aldrig försvinna för att en tjänst strular.
      throw new Error("faller tillbaka");
    } catch {
      try {
        const p = new FormData();
        p.append("subject", "Samarbetsansökan – kreatör");
        p.append("Namn", ansokan.namn);
        p.append("E-post", ansokan.epost);
        p.append("Telefon", ansokan.telefon);
        p.append("Ort", ansokan.ort);
        p.append("Kanaler", ansokan.kanaler);
        p.append("Användarnamn/handle", ansokan.handle);
        p.append("Följare totalt", ansokan.foljare);
        p.append("Om publiken", ansokan.publik);
        p.append("Typ av samarbete", ansokan.typ);
        p.append("Tidigare samarbeten", ansokan.tidigare);
        p.append("Idé", ansokan.ide);
        p.append("Länk till kanal eller mediakit", ansokan.lank);
        const res = await fetch("https://formspree.io/f/xojkdewo", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: p,
        });
        if (res.ok) setDone(true);
        else throw new Error("fel");
      } catch {
        alert(`Något gick fel. Försök igen eller mejla oss på ${CONFIG.epost}.`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Samarbeten och affiliate – bli influencerpartner | Stodona</title>
        <meta
          name="description"
          content="Bli affiliate eller influencerpartner till Stodona i Stockholm. Egen rabattkod till dina följare, provision för samma kund i tre månader och full kreativ frihet. Ansök här."
        />
        <link rel="canonical" href="https://stodona.se/samarbeten-och-affiliate" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/samarbeten-och-affiliate" />
        <meta property="og:title" content="Samarbeten och affiliate – bli influencerpartner | Stodona" />
        <meta
          property="og:description"
          content="Egen rabattkod till dina följare, provision för samma kund i tre månader och full kreativ frihet."
        />
        <meta property="og:image" content="https://stodona.se/samarbete-hero.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Samarbeten och affiliate | Stodona" />
        <meta name="twitter:image" content="https://stodona.se/samarbete-hero.jpg" />
        {/* FAQ-schema: frågorna på sidan är exakt de som söks på ("hur fungerar
            affiliate", "måste jag märka inlägg som reklam"), så de har god chans
            att plockas upp som rich results och av AI-svar. */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Samarbeten och affiliate",
            url: "https://stodona.se/samarbeten-och-affiliate",
            description:
              "Affiliateprogram och influencersamarbeten med städfirman Stodona i Stockholm.",
            inLanguage: "sv-SE",
            isPartOf: { "@type": "WebSite", name: "Stodona", url: "https://stodona.se" },
            about: [
              { "@type": "Thing", name: "Affiliatemarknadsföring" },
              { "@type": "Thing", name: "Influencersamarbete" },
              { "@type": "Thing", name: "Hemstädning Stockholm" },
            ],
            provider: {
              "@type": "LocalBusiness",
              name: "Stodona",
              url: "https://stodona.se",
              areaServed: { "@type": "City", name: "Stockholm" },
            },
          })}
        </script>
      </Helmet>

      {/* ——— Banner ——— */}
      {/* Cocopanda-greppet: ljus, avmättad helbredsbild med en stor centrerad
          versalrubrik ovanpå. Headern är sticky och ligger i flödet, så
          bannern behöver ingen toppmarginal. */}
      <section className="relative overflow-hidden h-[58vh] min-h-[380px] max-h-[720px]">
        <img
          src="/samarbete-hero.jpg"
          alt="Tre kvinnor i ett möte vid ett bord med utsikt över Stockholm"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 42%" }}
          width="1536"
          height="1024"
          loading="eager"
          fetchPriority="high"
        />
        {/* Slöjan är koncentrerad till mittbandet där rubriken ligger – bilden
            får vara ljus i kanterna, men fönstret och den ljusa väggen bakom
            texten hamnar annars under 3:1 mot vitt. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/15" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-sans font-extrabold uppercase text-white text-center leading-[0.92] tracking-[-0.02em] text-[clamp(2.1rem,7vw,6rem)] [text-shadow:0_2px_10px_rgba(0,0,0,0.55),0_1px_3px_rgba(0,0,0,0.5)]"
          >
            Samarbeten och affiliate
          </motion.h1>
        </div>
      </section>

      {/* ——— Intro ——— */}
      <section className="pt-16 md:pt-24 pb-4 bg-bg-primary">
        <div className="container-custom max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-text-primary/10 text-xs font-bold tracking-[0.18em] uppercase text-text-secondary mb-7">
              <Handshake className="w-4 h-4 text-accent-deep" /> För kreatörer och influencers
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6">
              Redo att göra{" "}
              <span className="italic font-normal text-accent-deep">ren vardag</span> till
              business?
            </h2>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-9">
              Du pratar redan om hemmet, barnen, kvällarna som aldrig räcker till. Vi är
              städfirman som ger dina följare tillbaka en söndag – och ger dig betalt varje
              gång någon bokar. Två sätt att jobba ihop, ett formulär att börja i.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => scrollTo("ansok")} className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Ansök nu <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => scrollTo("sa-funkar-det")} className="btn-secondary px-8 py-4">
                Så funkar det
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-deep" /> Hela Storstockholm
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-deep" /> Försäkrat och kollektivavtalsenligt
              </span>
              <span className="inline-flex items-center gap-2">
                <Wallet className="w-4 h-4 text-accent-deep" /> RUT-avdrag direkt på fakturan
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ——— Två vägar ——— */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Två sätt att jobba ihop</h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Vill du bara ha en kod att dela när det passar? Eller planera något större
              tillsammans? Välj det som känns rätt – du kan börja i det ena och gå vidare
              till det andra.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5 flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center mb-6">
                <Tag className="w-6 h-6 text-accent-deep" />
              </div>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-text-secondary mb-3">
                Alternativ 1
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Affiliate</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Löpande och helt på dina villkor. Du får en egen rabattkod och en spårbar
                länk, delar när du vill, och får provision på varje bokning som går
                igenom. Inget krav på antal inlägg, ingen bindningstid.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Egen kod som ger följarna " + CONFIG.foljarrabatt,
                  "Provision för samma kund i " + CONFIG.provisionPeriod,
                  "Öppet för alla kontostorlekar",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-text-secondary">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo("ansok")} className="btn-primary mt-auto self-start">
                Ansök till affiliate
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-bg-dark text-text-light rounded-3xl p-8 md:p-10 flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-cta-hover" />
              </div>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-text-light/60 mb-3">
                Alternativ 2
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Direktsamarbete</h3>
              <p className="text-text-light/80 leading-relaxed mb-6">
                För dig som vill göra något mer genomarbetat: en kampanj, en serie inlägg,
                en giveaway eller något vi inte har tänkt på än. Vi sätter upplägg och
                ersättning tillsammans, från fall till fall.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Fast ersättning eller paket med provision",
                  "Vi bjuder på städning så du vet vad du pratar om",
                  "Längre samarbeten över säsong går utmärkt",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-text-light/80">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => scrollTo("direkt")}
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark mt-auto self-start"
              >
                Så pitchar du
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ——— Så funkar det ——— */}
      <section id="sa-funkar-det" className="section-spacing bg-white scroll-mt-24">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-text-secondary">
              Steg för steg
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
              Från ansökan till första utbetalningen
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Det tar ungefär fyra minuter att ansöka och {CONFIG.svarstid} innan du hör
              från oss.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-bg-primary rounded-3xl p-8 relative"
              >
                <span className="absolute top-8 right-8 text-5xl font-display text-text-primary/10 leading-none">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <s.icon className="w-6 h-6 text-accent-deep" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-text-secondary leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Vad du får ——— */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Vad du får ut av det</h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Utöver pengarna: en tjänst som faktiskt löser ett problem din publik
              känner igen sig i.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="bg-white rounded-3xl p-8 border border-text-primary/5"
              >
                <p.icon className="w-7 h-7 text-accent-deep mb-5" />
                <h3 className="text-lg font-bold mb-3">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Passar det dig? ——— */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Passar vi ihop?</h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                Vi säger hellre ja till någon som verkligen skulle boka städning själv än
                till ett stort konto som aldrig har tänkt tanken. Så här ser vi på det:
              </p>
              <ul className="space-y-5">
                {criteria.map((c) => (
                  <li key={c} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <span className="text-text-secondary leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-text-secondary/80 mt-8 leading-relaxed">
                Känner du inte igen dig i allt? Ansök ändå. Listan är hur vi tänker, inte
                en dörrvakt.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="/familj-stodona.jpg"
                alt="Familj hemma i ett nystädat vardagsrum"
                className="w-full h-[460px] object-cover rounded-3xl"
                width="1024"
                height="1536"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-bg-dark text-text-light rounded-2xl p-6 max-w-[260px] shadow-xl hidden sm:block">
                <p className="text-sm leading-relaxed text-text-light/85">
                  Det du säljer är inte städning. Det är en söndag som inte går åt till
                  badrummet.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ——— Direktsamarbete ——— */}
      <section id="direkt" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-text-light/60">
                Direktsamarbete
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-6">
                Har du en större idé?
              </h2>
              <p className="text-lg text-text-light/80 leading-relaxed mb-6">
                Då vill vi höra den. Det kan vara en flyttserie när du byter lägenhet, ett
                avsnitt om vardagspusslet med barnpassning, en storstädning inför julen –
                eller något helt annat.
              </p>
              <p className="text-lg text-text-light/80 leading-relaxed">
                Använd formuläret här nedanför och välj “Direktsamarbete”, eller mejla oss
                direkt på{" "}
                <a href={`mailto:${CONFIG.epost}`} className="text-cta-hover underline underline-offset-4">
                  {CONFIG.epost}
                </a>
                . Ju mer du får med, desto snabbare kan vi ge ett riktigt svar.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6">Ta med det här i din pitch</h3>
              <ul className="space-y-4">
                {directBrief.map((b) => (
                  <li key={b} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                    <span className="text-text-light/85 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Ansökan ——— */}
      <section id="ansok" className="section-spacing bg-bg-primary scroll-mt-24">
        <div className="container-custom max-w-3xl">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-10 md:p-14 text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Tack – vi har din ansökan!</h2>
              <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto mb-8">
                Vi läser den själva och hör av oss inom {CONFIG.svarstid}. Under tiden får
                du gärna följa oss så vet vi vem vi ska hålla utkik efter.
              </p>
              <a
                href={CONFIG.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Instagram className="w-5 h-5" /> Följ {CONFIG.handle}
              </a>
            </motion.div>
          ) : (
            <>
              <div className="mb-12">
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-text-secondary">
                  Ansökan
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
                  Berätta lite om dig
                </h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Fyll i så mycket du orkar – det som är märkt med * behöver vi, resten
                  hjälper oss att svara ordentligt.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <fieldset className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5">
                  <legend className="sr-only">Kontaktuppgifter</legend>
                  <h3 className="text-xl font-bold mb-6">Kontaktuppgifter</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass} htmlFor="name">Namn *</label>
                      <input id="name" name="name" required value={form.name} onChange={update} className={inputClass} placeholder="För- och efternamn" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="email">E-post *</label>
                      <input id="email" name="email" type="email" required value={form.email} onChange={update} className={inputClass} placeholder="du@exempel.se" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="phone">Telefon</label>
                      <input id="phone" name="phone" type="tel" value={form.phone} onChange={update} className={inputClass} placeholder="07X-XXX XX XX" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="city">Ort *</label>
                      <input id="city" name="city" required value={form.city} onChange={update} className={inputClass} placeholder="T.ex. Bromma" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5">
                  <legend className="sr-only">Dina kanaler</legend>
                  <h3 className="text-xl font-bold mb-6">Dina kanaler</h3>

                  <p className={labelClass}>Var finns du?</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["Instagram", "TikTok", "YouTube", "Blogg", "Podd", "Nyhetsbrev", "Facebook", "Annat"].map((c) => {
                      const active = channels.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleChannel(c)}
                          aria-pressed={active}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            active
                              ? "bg-text-primary text-bg-primary border-text-primary"
                              : "bg-bg-primary border-text-primary/10 hover:border-text-primary/30"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass} htmlFor="handle">Användarnamn *</label>
                      <input id="handle" name="handle" required value={form.handle} onChange={update} className={inputClass} placeholder="@dittnamn" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="followers">Följare totalt</label>
                      <input id="followers" name="followers" value={form.followers} onChange={update} className={inputClass} placeholder="T.ex. 4 200" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="link">Länk till kanal eller mediakit</label>
                      {/* Medvetet type="text" och inte "url": webbläsaren underkände
                          annars "www.stodona.se" och "instagram.com/namn", som är
                          precis så folk skriver adresser. Hellre en länk vi får
                          tolka själva än en ansökan som fastnar. */}
                      <input id="link" name="link" type="text" inputMode="url" value={form.link} onChange={update} className={inputClass} placeholder="www.dinkanal.se eller instagram.com/dittnamn" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="audience">Vilka är dina följare?</label>
                      <textarea id="audience" name="audience" rows={3} value={form.audience} onChange={update} className={inputClass} placeholder="Ålder, var de bor, vad de kommer till dig för." />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="bg-white rounded-3xl p-8 md:p-10 border border-text-primary/5">
                  <legend className="sr-only">Samarbetet</legend>
                  <h3 className="text-xl font-bold mb-6">Samarbetet</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass} htmlFor="type">Vad är du ute efter? *</label>
                      <select id="type" name="type" value={form.type} onChange={update} className={inputClass}>
                        <option>Affiliate – kod och provision</option>
                        <option>Direktsamarbete – en större kampanj</option>
                        <option>Båda / vet inte än</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="previous">Tidigare samarbeten</label>
                      <textarea id="previous" name="previous" rows={3} value={form.previous} onChange={update} className={inputClass} placeholder="Vilka varumärken har du jobbat med, och hur gick det?" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="idea">Din idé</label>
                      <textarea id="idea" name="idea" rows={4} value={form.idea} onChange={update} className={inputClass} placeholder="Hur skulle du berätta om Stodona för just din publik?" />
                    </div>
                  </div>
                </fieldset>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <button type="submit" disabled={submitting} className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 disabled:opacity-60">
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Skickar…
                      </>
                    ) : (
                      <>
                        Skicka ansökan <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Vi svarar inom {CONFIG.svarstid}. Dina uppgifter används bara för det
                    här – läs mer i vår{" "}
                    <Link to="/integritetspolicy" className="underline underline-offset-2">
                      integritetspolicy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-10 text-center">Vanliga frågor</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
          <p className="text-center text-text-secondary mt-10">
            Hittade du inte svaret?{" "}
            <a href={`mailto:${CONFIG.epost}`} className="underline underline-offset-4">
              Mejla oss
            </a>{" "}
            så reder vi ut det.
          </p>
        </div>
      </section>

      {/* ——— Tagga oss ——— */}
      <section className="py-20 md:py-28 bg-bg-primary">
        <div className="container-custom text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            Filma det. Tagga oss. Njut av söndagen. ✨
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">
            Redan kund och vill visa upp resultatet? Tagga {CONFIG.handle} och använd{" "}
            {CONFIG.hashtag} – vi delar gärna vidare.
          </p>
          <a
            href={CONFIG.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Instagram className="w-5 h-5" /> {CONFIG.handle}
          </a>
        </div>
      </section>
    </div>
  );
}
