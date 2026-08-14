import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import NannyTeam from "../components/NannyTeam";
import {
  Baby,
  Heart,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Star,
  BookOpen,
  Utensils,
  Moon,
  Users,
  Loader2,
  BadgeCheck,
} from "lucide-react";

const trustChips = [
  { icon: ShieldCheck, label: "Utdrag ur belastningsregister" },
  { icon: Heart, label: "HLR- & första hjälpen-utbildade" },
  { icon: BadgeCheck, label: "Personligt intervjuade & referenstagna" },
  { icon: ShieldCheck, label: "Fullt ansvarsförsäkrade" },
];

const vetting = [
  {
    step: "01",
    title: "Personlig intervju",
    text: "Varje barnvakt möter oss ansikte mot ansikte. Vi väljer människor med värme, erfarenhet och genuint engagemang för barn – bara ett fåtal går vidare.",
  },
  {
    step: "02",
    title: "Bakgrundskontroll",
    text: "Vi begär alltid utdrag ur belastningsregistret och tar minst två referenser från tidigare familjer eller arbetsgivare innan någon får arbeta hos dig.",
  },
  {
    step: "03",
    title: "Utbildning & trygghet",
    text: "Våra barnvakter är utbildade i HLR och första hjälpen för barn, och följer tydliga rutiner för säkerhet, rutiner och kommunikation med er föräldrar.",
  },
  {
    step: "04",
    title: "Rätt matchning",
    text: "Vi matchar er familj med en barnvakt som passar just era behov, barnets ålder och personlighet – och strävar efter samma trygga ansikte varje gång.",
  },
];

const services = [
  { icon: Baby, title: "Barnpassning i hemmet", text: "Trygg passning hemma hos er, dag som kväll, med lek och närvaro anpassad efter barnets ålder." },
  { icon: Clock, title: "Hämtning & lämning", text: "Hämtning från förskola, skola eller aktiviteter – vi finns där när ni inte kan." },
  { icon: BookOpen, title: "Läxhjälp", text: "Stöttande läxhjälp och pedagogisk lek som gör lärandet roligt." },
  { icon: Utensils, title: "Mellanmål & måltider", text: "Näringsriktiga mellanmål och enkla måltider tillagade med omtanke." },
  { icon: Moon, title: "Kvälls- & helgpassning", text: "Perfekt för föräldrar som behöver en kväll för sig själva – vi passar tills ni är hemma." },
  { icon: Users, title: "Regelbundet eller tillfälligt", text: "Fast barnvakt varje vecka eller enstaka tillfällen – helt efter era behov." },
];

const promises = [
  "Samma trygga ansikte så ofta som möjligt – kontinuitet skapar trygghet.",
  "Full transparens: du får veta exakt vem som kommer, och kan alltid nå oss.",
  "Inga bindningstider – du bestämmer takten.",
  "Nöjd-förälder-garanti: känns det inte rätt gör vi om matchningen kostnadsfritt.",
];

const faqs = [
  {
    q: "Hur vet jag att barnvakten är trygg?",
    a: "Alla våra barnvakter är personligt intervjuade, referenstagna och kontrollerade mot belastningsregistret. De är dessutom utbildade i HLR och första hjälpen för barn.",
  },
  {
    q: "Får vi samma barnvakt varje gång?",
    a: "Vi strävar alltid efter kontinuitet och matchar er med en fast barnvakt. Vid behov har vi en trygg ersättare som också känner er familj.",
  },
  {
    q: "Hur snabbt kan ni börja?",
    a: "Efter ett kort kartläggningssamtal matchar vi er oftast med rätt barnvakt inom några dagar. Behöver ni hjälp akut – hör av er så gör vi vårt bästa.",
  },
  {
    q: "Vilka åldrar passar ni?",
    a: "Vi hjälper familjer med barn i alla åldrar, från de allra minsta till skolbarn. Berätta om era behov så matchar vi rätt kompetens.",
  },
];

export default function Barnpassning() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    childAge: "",
    kids: "",
    type: "Regelbundet",
    area: "",
    message: "",
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
      payload.append("subject", "Ny förfrågan: Barnpassning / Nanny");
      payload.append("Namn", form.name);
      payload.append("E-post", form.email);
      payload.append("Telefon", form.phone);
      payload.append("Barnets ålder", form.childAge);
      payload.append("Antal barn", form.kids);
      payload.append("Typ av hjälp", form.type);
      payload.append("Område", form.area);
      payload.append("Meddelande", form.message);
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      if (res.ok) setDone(true);
      else throw new Error("fel");
    } catch {
      alert("Något gick fel. Försök igen eller ring oss på 010-178 01 50.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Barnpassning & Nanny i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Trygg barnpassning och nannytjänster i Stockholm. Personligt utvalda, referenstagna och HLR-utbildade barnvakter. Lämna ditt barn i trygga händer."
        />
        {/* Dold sida – ska inte indexeras eller länkas */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <div className="absolute inset-0 z-0">
          <img
            src="/familj-stodona.jpg"
            alt="Trygg familj hemma"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/85 via-bg-dark/55 to-bg-dark/25"></div>
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
              Nyhet · Barnpassning & Nanny
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Här vill du lämna
              <br />
              <span className="italic font-normal text-cta-hover">ditt barn.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-10 drop-shadow-md">
              Barnpassning med samma omtanke, noggrannhet och kvalitet som gjort Stodona
              till ett av Stockholms mest rekommenderade servicebolag. Personligt utvalda,
              referenstagna och HLR-utbildade barnvakter – för din största trygghet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#forfragan" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Boka ett kostnadsfritt möte
              </a>
              <a href="tel:0101780150" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm">
                <Phone className="w-5 h-5 mr-2" /> 010-178 01 50
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust chips */}
      <section className="bg-bg-dark text-text-light py-6 border-t border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustChips.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-cta-hover" />
                </div>
                <span className="text-sm font-medium text-text-light/85">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro / emotional */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-10 h-10 text-cta-hover mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Att lämna sitt barn är det största förtroende som finns.
            </h2>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Vi tar det på största allvar. Varje barnvakt vi skickar hem till dig är
              utvald med samma omsorg som vi själva skulle kräva för våra egna barn –
              varm, ansvarsfull och noggrant kontrollerad. Du ska kunna gå ut genom
              dörren med ett lugnt hjärta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vetting – trust builder */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              Så väljer vi våra barnvakter
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Bara de tryggaste kommer hem till dig
            </h2>
            <p className="text-text-secondary text-lg">
              Mindre än var tionde sökande blir en Stodona-barnvakt. Så här ser vår
              urvalsprocess ut.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vetting.map((v, i) => (
              <motion.div
                key={v.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-text-primary/5"
              >
                <div className="flex items-start gap-5">
                  <span className="text-3xl font-bold text-cta-hover font-display shrink-0">{v.step}</span>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{v.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Så kan vi hjälpa er</h2>
            <p className="text-text-secondary text-lg">
              Flexibel hjälp anpassad efter er vardag – från enstaka kvällar till fast barnvakt.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group bg-bg-primary rounded-3xl p-8 hover:bg-bg-dark hover:text-text-light transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-white/10 flex items-center justify-center mb-6 transition-colors duration-300">
                  <s.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-text-secondary group-hover:text-text-light/80 leading-relaxed transition-colors duration-300">
                  {s.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Barnvakter */}
      <NannyTeam />

      {/* Promise */}
      <section className="section-spacing bg-cta-hover/15">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
                Vårt löfte till dig
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Trygghet, öppenhet och äkta omtanke
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed">
                Vi bygger den här tjänsten på samma värderingar som gjort tusentals
                Stockholmare trygga med att släppa in oss i sina hem. Nu tar vi samma
                omsorg ett steg längre – till det finaste ni har.
              </p>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">{p}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Vanliga frågor</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-bg-primary rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cta-hover shrink-0" />
                  {f.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-7">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* För företag CTA */}
      <section className="py-16 bg-bg-dark text-text-light">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-4">
              För företag
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Barnpassning som personalförmån</h2>
            <p className="text-text-light/75">
              Stötta era medarbetare i småbarnslivet – behåll talanger, minska frånvaro
              och stärk er employer branding.
            </p>
          </div>
          <Link to="/barnpassning-foretag" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shrink-0">
            Läs mer för företag
          </Link>
        </div>
      </section>

      {/* Rekrytering CTA */}
      <section className="py-14 bg-cta-hover text-text-primary">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">Vill du jobba som barnvakt?</h2>
            <p className="text-text-primary/80">
              Vi söker varma, ansvarsfulla personer som älskar barn. Bli en del av Stodona.
            </p>
          </div>
          <Link to="/jobba-som-barnvakt" className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4 shrink-0">
            Sök jobb som barnvakt
          </Link>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="forfragan" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
                Kostnadsfritt & förutsättningslöst
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Låt oss lära känna er familj
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed mb-8">
                Berätta lite om era behov så hör vi av oss med ett förslag på rätt
                barnvakt – helt utan förpliktelser. Vill du hellre prata direkt?
              </p>
              <div className="space-y-3">
                <a href="tel:0101780150" className="flex items-center gap-3 text-text-light hover:text-cta-hover transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Phone className="w-5 h-5 text-cta-hover" /></div>
                  010-178 01 50
                </a>
                <a href="mailto:info@stodona.se" className="flex items-center gap-3 text-text-light hover:text-cta-hover transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Mail className="w-5 h-5 text-cta-hover" /></div>
                  info@stodona.se
                </a>
              </div>
              <div className="flex items-center gap-2 mt-8 text-sm text-text-light/70">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span>4.9/5 – samma team som Stockholm redan litar på</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              {done ? (
                <div className="bg-white text-text-primary rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Tack för din förfrågan!</h3>
                  <p className="text-text-secondary text-lg max-w-md mx-auto">
                    Vi har tagit emot dina uppgifter och hör av oss inom kort för ett
                    trevligt kartläggningssamtal.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Ditt namn</label>
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
                      <label className="block text-sm font-medium mb-2">Barnets ålder</label>
                      <input name="childAge" placeholder="Ex: 3 år" value={form.childAge} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Antal barn</label>
                      <input name="kids" placeholder="Ex: 2" value={form.kids} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Typ av hjälp</label>
                      <select name="type" value={form.type} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 cursor-pointer">
                        <option>Regelbundet</option>
                        <option>Tillfälligt</option>
                        <option>Kväll & helg</option>
                        <option>Hämtning & lämning</option>
                        <option>Vet ej ännu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Område</label>
                      <input name="area" placeholder="Ex: Bromma" value={form.area} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Berätta gärna mer (frivilligt)</label>
                      <textarea name="message" rows={3} value={form.message} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 resize-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka förfrågan <Baby className="w-5 h-5" /></>}
                  </button>
                  <p className="text-xs text-center text-text-secondary">
                    Genom att skicka in godkänner du vår{" "}
                    <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
