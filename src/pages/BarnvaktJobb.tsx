import { useState } from "react";
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
  Loader2,
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
  { step: "01", title: "Skicka ansökan", text: "Fyll i formuläret nedan – det tar bara ett par minuter." },
  { step: "02", title: "Vi hör av oss", text: "Känns det som en match bjuder vi in dig till en personlig intervju." },
  { step: "03", title: "Kontroll & introduktion", text: "Vi tar referenser, kontrollerar registerutdrag och ger dig en grundlig introduktion." },
  { step: "04", title: "Välkommen till teamet", text: "Vi matchar dig med familjer som passar dig – och du är igång!" },
];

export default function BarnvaktJobb() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    area: "",
    availability: "Flexibelt",
    experience: "",
    link: "",
    about: "",
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("subject", "Jobbansökan: Barnvakt");
      payload.append("Namn", form.name);
      payload.append("E-post", form.email);
      payload.append("Telefon", form.phone);
      payload.append("Ålder", form.age);
      payload.append("Ort/område", form.area);
      payload.append("Tillgänglighet", form.availability);
      payload.append("Erfarenhet", form.experience);
      payload.append("CV / LinkedIn", form.link);
      payload.append("Om mig", form.about);
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      if (res.ok) setDone(true);
      else throw new Error("fel");
    } catch {
      alert("Något gick fel. Försök igen eller mejla oss på info@stodona.se.");
    } finally {
      setSubmitting(false);
    }
  }

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

      {/* Ansökningsformulär */}
      <section id="ansokan" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Skicka din ansökan
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Redo att göra skillnad?</h2>
            <p className="text-text-light/80 text-lg">
              Fyll i formuläret så hör vi av oss. Vi ser fram emot att lära känna dig!
            </p>
          </div>

          {done ? (
            <div className="bg-white text-text-primary rounded-3xl p-10 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-3">Tack för din ansökan!</h3>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Vi har tagit emot den och hör av oss inom kort. Lycka till!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Namn</label>
                  <input name="name" required value={form.name} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-post</label>
                  <input type="email" name="email" required value={form.email} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon</label>
                  <input type="tel" name="phone" required value={form.phone} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ålder</label>
                  <input name="age" placeholder="Ex: 24" value={form.age} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ort / område</label>
                  <input name="area" placeholder="Ex: Södermalm" value={form.area} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tillgänglighet</label>
                  <select name="availability" value={form.availability} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 cursor-pointer">
                    <option>Flexibelt</option>
                    <option>Dagtid</option>
                    <option>Kvällar</option>
                    <option>Helger</option>
                    <option>Kvällar & helger</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Din erfarenhet av barn</label>
                  <textarea name="experience" rows={2} required value={form.experience} onChange={update}
                    placeholder="Berätta kort om din erfarenhet – jobb, utbildning, egna barn, syskon m.m."
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Länk till CV eller LinkedIn (frivilligt)</label>
                  <input name="link" placeholder="https://..." value={form.link} onChange={update}
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Berätta lite om dig själv</label>
                  <textarea name="about" rows={3} value={form.about} onChange={update}
                    placeholder="Vem är du, och varför vill du bli barnvakt hos oss?"
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 resize-none" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka ansökan <ArrowRight className="w-5 h-5" /></>}
              </button>
              <p className="text-xs text-center text-text-secondary">
                Genom att skicka in godkänner du vår{" "}
                <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
              </p>
            </form>
          )}

          <p className="text-center mt-8 text-text-light/70">
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
