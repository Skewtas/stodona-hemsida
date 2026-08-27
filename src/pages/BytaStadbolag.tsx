import { useState } from "react";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  ArrowRightLeft,
  UserX,
  CalendarX,
  TrendingDown,
  MessageSquareWarning,
  Wallet,
  ShieldQuestion,
  Search,
  ClipboardCheck,
  HeartHandshake,
  UsersRound,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { submitLead } from "../utils/leadCapture";
import { track } from "../utils/analytics";
import TrustBar from "../components/TrustBar";

const SIGNS = [
  { icon: UserX, title: "Ny städare varje gång", text: "Du hinner aldrig lära känna den som städar – och kvaliteten blir ojämn." },
  { icon: CalendarX, title: "Missade eller flyttade tider", text: "Städningen blir inställd eller ändrad utan förvarning." },
  { icon: TrendingDown, title: "Kvaliteten har sjunkit", text: "Det som förr var skinande rent känns numera slarvigt gjort." },
  { icon: MessageSquareWarning, title: "Svårt att få tag på dem", text: "Ingen svarar när du hör av dig, och inget följs upp." },
  { icon: Wallet, title: "Dolda avgifter", text: "Priset stämmer inte med vad ni kom överens om från början." },
  { icon: ShieldQuestion, title: "Otrygg känsla", text: "Du känner dig inte helt bekväm med att släppa in dem i ditt hem." },
];

const STEPS = [
  { n: "01", icon: MessageSquareWarning, title: "Berätta vad som inte fungerat", text: "Ett kort samtal eller några rader räcker. Vi lyssnar på vad som brustit hos ditt tidigare städbolag." },
  { n: "02", icon: Search, title: "Vi gör en noggrann bedömning", text: "Vi kartlägger dina behov och exakt vad som ska bli bättre – så att ingenting upprepas." },
  { n: "03", icon: UsersRound, title: "Vi matchar rätt städare", text: "Du får en fast, noggrant utvald städare som passar ditt hem och dina önskemål." },
  { n: "04", icon: HeartHandshake, title: "Extra noggrann uppföljning", text: "Vi håller tät kontakt och följer upp tillsammans med dig och städaren tills allt känns helt rätt." },
];

const BENEFITS = [
  "Samma trygga städare varje gång",
  "100 % nöjd-kund-garanti",
  "Fullt ansvarsförsäkrade",
  "RUT-avdrag dras direkt – du betalar 50 %",
  "Ingen bindningstid",
  "Personlig kontaktperson hos oss",
];

const FAQS = [
  { q: "Är det krångligt att byta städbolag?", a: "Nej. Du berättar vad som inte fungerat, vi gör en bedömning och matchar dig med rätt städare. Du behöver inte oroa dig för det praktiska – vi guidar dig hela vägen." },
  { q: "Behöver jag säga upp mitt gamla städbolag först?", a: "Nej, börja i din egen takt. Många väljer att säga upp det gamla först när de känner sig trygga med oss. Vi hjälper dig gärna att planera en smidig övergång utan glapp." },
  { q: "Vad gör Stodona annorlunda?", a: "Vi gör en noggrann bedömning av vad som inte fungerat tidigare och säkerställer extra noga kontakt och uppföljning tillsammans med dig och städaren. Du får samma städare varje gång, med kvalitetsgaranti och ingen bindningstid." },
  { q: "Får jag samma städare varje gång?", a: "Ja, vi strävar alltid efter kontinuitet. Vid sjukdom eller ledighet ordnar vi en trygg ersättare så att din städning aldrig ställs in." },
  { q: "Hur snabbt kan jag komma igång?", a: "Ofta redan samma vecka. Efter en kort kartläggning matchar vi dig med rätt städare och sätter igång." },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";

export default function BytaStadbolag() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", reason: "" });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone && !form.email) return;
    setLoading(true);
    await submitLead({
      email: form.email,
      phone: form.phone,
      name: form.name,
      source: "byta_stadbolag",
      page: `byta städbolag – ${form.reason || "ingen orsak angiven"}`.slice(0, 200),
    });
    track("lead_capture", { source: "byta_stadbolag" });
    setLoading(false);
    setDone(true);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Så byter du städbolag till Stodona",
    description: "Byt städbolag i fyra enkla steg – vi gör en noggrann bedömning och sköter övergången.",
    step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
      { "@type": "ListItem", position: 2, name: "Byta städbolag", item: "https://stodona.se/byta-stadbolag" },
    ],
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Byta till Stodona – Byt städbolag enkelt och tryggt i Stockholm</title>
        <meta
          name="description"
          content="Byta städbolag är enklare än du tror. Vi tar reda på vad som inte fungerat och ser till att det blir rätt – med extra noggrann uppföljning tillsammans med dig och städaren."
        />
        <link rel="canonical" href="https://stodona.se/byta-stadbolag" />
        <meta property="og:title" content="Byta till Stodona – Byt städbolag enkelt och tryggt" />
        <meta property="og:description" content="Byta städbolag är enklare än du tror. Vi tar reda på vad som inte fungerat och ser till att det blir rätt." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/byta-stadbolag" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <motion.img
          src="/stodona-stad.jpg"
          alt=""
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/40" />
        <motion.div aria-hidden animate={{ y: [0, -22, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl z-0" />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <ArrowRightLeft className="w-4 h-4 text-cta-hover" /> Byta städbolag
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Byta till Stodona.
              <br />
              <span className="italic font-normal text-cta-hover">Enkelt och tryggt.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Är du inte nöjd med ditt nuvarande städbolag? Vi tar reda på exakt vad som
              inte fungerat – och ser till att det blir rätt den här gången. Med extra
              noggrann kontakt och uppföljning tillsammans med dig och din städare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#kom-igang" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Byt till Stodona
              </a>
              <a href="tel:0101780150" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm">
                Ring 010-178 01 50
              </a>
            </div>
            <TrustBar light className="mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Warning signs */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Känner du igen dig?</h2>
            <p className="text-text-secondary text-lg">Det här är de vanligaste tecknen på att det är dags att byta städbolag.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIGNS.map((s, i) => (
              <motion.div key={s.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="bg-bg-primary rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <s.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-text-secondary leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core promise */}
      <section className="section-spacing bg-bg-dark text-text-light relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 w-96 h-96 rounded-full bg-cta-hover/15 blur-3xl" />
        <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <ClipboardCheck className="w-4 h-4 text-cta-hover" /> Vårt löfte
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Vi tar reda på vad som inte fungerat</h2>
            <p className="text-text-light/85 text-lg leading-relaxed">
              Innan vi börjar gör vi en noggrann bedömning av vad som brustit hos ditt
              tidigare städbolag. Sedan säkerställer vi extra noga kontakt och uppföljning –
              tillsammans med dig och städaren – så att samma sak inte händer igen. Det är
              så vi bygger en städning du faktiskt kan lita på.
            </p>
          </motion.div>
          <motion.ul initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
            className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Steps */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Så byter du till Stodona</h2>
            <p className="text-text-secondary text-lg">Fyra enkla steg – vi gör det tunga jobbet.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-7 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-bold text-cta-hover font-display">{s.n}</span>
                  <s.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <Sparkles className="w-10 h-10 text-cta-hover mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Du behöver inte oroa dig för övergången</h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Börja i din egen takt – många säger upp sitt gamla städbolag först när de känner
            sig trygga med oss. Vi hjälper dig planera en smidig övergång utan glapp, så att
            ditt hem alltid är rent.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Vanliga frågor om att byta städbolag</h2>
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

      {/* Lead form */}
      <section id="kom-igang" className="section-spacing bg-bg-dark text-text-light scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cta-hover/20 blur-3xl rounded-full z-0" />
        <div className="container-custom max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Kom igång
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">Berätta vad som inte fungerat</h2>
            <p className="text-text-light/70 text-lg">Så hör vi av oss, gör en bedömning och ser till att det blir rätt.</p>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-text-primary rounded-3xl p-10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-3">Tack!</h3>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Vi har tagit emot dina uppgifter och hör av oss inom kort för att göra en
                bedömning och hitta rätt lösning för dig.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl border-t-4 border-cta-hover space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Namn</label>
                  <input name="name" value={form.name} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon *</label>
                  <input type="tel" name="phone" required value={form.phone} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-post</label>
                  <input type="email" name="email" value={form.email} onChange={update} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Vad har inte fungerat med ditt nuvarande städbolag?</label>
                  <textarea name="reason" rows={4} value={form.reason} onChange={update}
                    placeholder="Berätta kort – t.ex. ojämn kvalitet, missade tider, dålig kommunikation…"
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka – vi hör av oss <ArrowRight className="w-5 h-5" /></>}
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
    </div>
  );
}
