import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Gift,
  Heart,
  Sparkles,
  Mail,
  CalendarHeart,
  Baby,
  Home as HomeIcon,
  PartyPopper,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { track } from "../utils/analytics";
import TrustBar from "../components/TrustBar";

// OBS: exempelbelopp – sätt era egna nivåer.
const AMOUNTS = ["500 kr", "1 000 kr", "2 000 kr", "3 000 kr"];

const OCCASIONS = [
  { icon: Baby, title: "Nybliven förälder", text: "Ge bort tid och avlastning när vardagen är som mest hektisk." },
  { icon: HomeIcon, title: "Inflyttning", text: "Ett skinande rent hem är den perfekta inflyttningspresenten." },
  { icon: PartyPopper, title: "Födelsedag & jul", text: "En present som ger mer fritid – något alla önskar sig." },
  { icon: CalendarHeart, title: "Mors & fars dag", text: "Visa uppskattning med hotellkänsla hemma." },
];

const STEPS = [
  { n: "01", title: "Välj belopp", text: "Bestäm värdet på ditt presentkort – eller ange ett eget belopp." },
  { n: "02", title: "Skriv en hälsning", text: "Lägg till en personlig rad till mottagaren." },
  { n: "03", title: "Vi levererar", text: "Du får presentkortet snyggt formgivet – digitalt att skriva ut eller skicka." },
  { n: "04", title: "Mottagaren bokar", text: "Mottagaren anger koden vid bokning och njuter av ett rent hem." },
];

const FAQS = [
  { q: "Vilka tjänster gäller presentkortet för?", a: "Presentkortet kan användas för alla våra städtjänster – hemstädning, flyttstädning, storstädning och fönsterputsning." },
  { q: "Hur länge är presentkortet giltigt?", a: "Presentkortet gäller i 12 månader från köpdatum. (Bekräfta er giltighetstid.)" },
  { q: "Hur levereras presentkortet?", a: "Du får ett snyggt formgivet presentkort digitalt via e-post – att skriva ut eller vidarebefordra direkt till mottagaren." },
  { q: "Hur betalar jag?", a: "Fyll i din beställning så återkommer vi med betalning och skickar presentkortet så snart det är klart." },
  { q: "Gäller RUT-avdrag?", a: "Mottagaren får RUT-avdrag på själva städningen precis som vanligt. Presentkortets värde räknas av på fakturan. Kontakta oss gärna om du vill veta mer." },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

export default function Presentkort() {
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");
  const [paid, setPaid] = useState(false);
  const [amount, setAmount] = useState("1 000 kr");
  const [custom, setCustom] = useState("");
  const [delivery, setDelivery] = useState("Skicka till mig");

  // Kund som kommer tillbaka från en genomförd Stripe-betalning.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("betalt") === "1") {
      setPaid(true);
      setState("success");
      track("presentkort_paid");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const snap = new FormData(formEl); // fånga värdena innan ev. reset
    const chosen = amount === "Annat belopp" ? `${custom} kr` : amount;
    const amountKr = Number((amount === "Annat belopp" ? custom : amount).replace(/[^\d]/g, ""));
    setState("submitting");

    // 1) Registrera beställningen (så leadet alltid fångas, även om betalning avbryts).
    try {
      const fd = new FormData();
      for (const [k, v] of snap.entries()) fd.append(k, v);
      fd.append("Belopp", chosen);
      fd.append("Leverans", delivery);
      fd.append("subject", `Presentkort-beställning: ${chosen}`);
      fd.append("_subject", `Presentkort-beställning: ${chosen}`);
      await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
    } catch {
      /* fortsätt ändå */
    }

    // 2) Försök starta Stripe-betalning. Faller tillbaka på manuellt flöde om ej konfigurerat.
    try {
      const res = await fetch("/api/gift-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountKr,
          buyer: snap.get("Köparens namn"),
          email: snap.get("E-post"),
          recipient: snap.get("Mottagarens namn"),
          recipientEmail: snap.get("Mottagarens e-post"),
          delivery,
          message: snap.get("Hälsning"),
        }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          track("presentkort_order", { amount: chosen, method: "stripe" });
          window.location.href = url;
          return;
        }
      }
    } catch {
      /* faller tillbaka nedan */
    }

    // 3) Fallback: manuellt beställningsflöde.
    track("presentkort_order", { amount: chosen, method: "manual" });
    setState("success");
    formEl.reset();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Presentkort på städning – Stodona",
    description: "Presentkort på professionell städning i Stockholm. Ge bort ett rent hem och mer fritid.",
    image: "https://stodona.se/stodona-stad.jpg",
    brand: { "@type": "Brand", name: "Stodona" },
    category: "Presentkort",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "SEK",
      lowPrice: "500",
      highPrice: "3000",
      availability: "https://schema.org/InStock",
      url: "https://stodona.se/presentkort",
    },
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Presentkort på städning i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Ge bort ett rent hem och mer fritid. Köp presentkort på städning hos Stodona – perfekt present till nyblivna föräldrar, inflytt, jul och mors dag."
        />
        <link rel="canonical" href="https://stodona.se/presentkort" />
        <meta property="og:title" content="Presentkort på städning | Stodona" />
        <meta property="og:description" content="Ge bort hotellkänsla hemma. Presentkort på städning i Stockholm." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/presentkort" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
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
              <Gift className="w-4 h-4 text-cta-hover" /> Presentkort
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Ge bort
              <br />
              <span className="italic font-normal text-cta-hover">hotellkänsla hemma.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Den present som ger mer tid, mindre stress och ett skinande rent hem. Ett
              presentkort på städning från Stodona passar alla – och glöms aldrig bort.
            </p>
            <a href="#bestall" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Beställ presentkort <Gift className="w-5 h-5 ml-2" />
            </a>
            <p className="mt-4 text-sm text-text-light/75">
              Letar du efter en julklapp?{" "}
              <Link to="/julklapp-stadning" className="text-cta-hover underline hover:text-white">Ge bort städning i jul →</Link>
            </p>
            <TrustBar light className="mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">En present för alla tillfällen</h2>
            <p className="text-text-secondary text-lg">Ibland är det finaste man kan ge bort lite mer tid.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OCCASIONS.map((o, i) => (
              <motion.div key={o.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                className="bg-bg-primary rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <o.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{o.title}</h3>
                <p className="text-text-secondary leading-relaxed">{o.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-14 text-center">Så funkar det</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-7 shadow-sm">
                <span className="text-3xl font-bold text-cta-hover font-display">{s.n}</span>
                <h3 className="text-lg font-bold mt-3 mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beställ */}
      <section id="bestall" className="section-spacing bg-bg-dark text-text-light scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cta-hover/20 blur-3xl rounded-full z-0" />
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 bg-cta-hover/10 blur-3xl rounded-full z-0" />
        <div className="container-custom max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Beställ
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">Beställ ditt presentkort</h2>
            <p className="text-text-light/70 text-lg">Fyll i nedan så återkommer vi med betalning och levererar presentkortet.</p>
          </div>

          {state === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-text-primary rounded-3xl p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-3">{paid ? "Tack för ditt köp!" : "Tack för din beställning!"}</h3>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                {paid
                  ? "Betalningen är mottagen. Vi skickar ditt färdiga presentkort inom kort."
                  : "Vi har tagit emot den och hör av oss inom kort med betalning och ditt färdiga presentkort."}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl border-t-4 border-cta-hover space-y-5">
              {/* Belopp */}
              <div>
                <span className={labelClass}>Belopp</span>
                <div className="flex flex-wrap gap-2">
                  {[...AMOUNTS, "Annat belopp"].map((a) => (
                    <button type="button" key={a} onClick={() => setAmount(a)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        amount === a ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
                {amount === "Annat belopp" && (
                  <input type="number" min="100" value={custom} onChange={(e) => setCustom(e.target.value)}
                    placeholder="Ange belopp i kr" className={`${inputClass} mt-3`} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Ditt namn *</label>
                  <input name="Köparens namn" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mottagarens namn</label>
                  <input name="Mottagarens namn" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Din e-post *</label>
                  <input type="email" name="E-post" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Din telefon</label>
                  <input type="tel" name="Telefon" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <span className={labelClass}>Leverans</span>
                  <div className="flex flex-wrap gap-2">
                    {["Skicka till mig", "Skicka direkt till mottagaren"].map((d) => (
                      <button type="button" key={d} onClick={() => setDelivery(d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          delivery === d ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {delivery === "Skicka direkt till mottagaren" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Mottagarens e-post</label>
                    <input type="email" name="Mottagarens e-post" className={inputClass} />
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Personlig hälsning (frivilligt)</label>
                  <textarea name="Hälsning" rows={3} placeholder="Skriv en rad till mottagaren…" className={`${inputClass} resize-none`} />
                </div>
              </div>

              <button type="submit" disabled={state === "submitting"}
                className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {state === "submitting" ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka beställning <ArrowRight className="w-5 h-5" /></>}
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

      {/* FAQ */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Vanliga frågor om presentkort</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-bg-primary rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {f.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
