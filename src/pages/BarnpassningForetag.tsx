import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Building2,
  TrendingUp,
  Users,
  Scale,
  Briefcase,
  Plane,
  CalendarDays,
  HeartPulse,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

const benefits = [
  { icon: TrendingUp, title: "Behåll era talanger", text: "Stöd medarbetare genom de mest krävande småbarnsåren – och minska risken att förlora värdefull kompetens." },
  { icon: Briefcase, title: "Färre oplanerade frånvarodagar", text: "När vardagspusslet spricker finns vi där, så att sjuka barn och inställd förskola inte lamslår arbetsdagen." },
  { icon: Users, title: "Starkare employer branding", text: "En familjevänlig förmån som gör er attraktiva – särskilt för medarbetare mitt i karriären och småbarnslivet." },
  { icon: Scale, title: "Mer jämställd vardag", text: "När barnomsorgen lösning finns för alla blir föräldraansvaret jämnare fördelat – och karriären mindre av ett val." },
];

const useCases = [
  { icon: HeartPulse, title: "Sjukt barn & VAB", text: "Backup-passning när barnet är lite krasslig men medarbetaren behövs på jobbet." },
  { icon: CalendarDays, title: "Sena möten & events", text: "Trygg passning när arbetsdagen krockar med hämtning – kickoff, konferens eller deadline." },
  { icon: Plane, title: "Tjänsteresor", text: "Kvälls- och heldygnspassning när jobbet kräver att medarbetaren är borta." },
  { icon: Building2, title: "Skollov & stängda förskolor", text: "Extra stöd under lov, studiedagar och klämdagar när ordinarie omsorg inte finns." },
];

const howItWorks = [
  { step: "01", title: "Ni väljer en timpott", text: "Företaget köper ett flexibelt antal timmar barnpassning som era medarbetare kan nyttja efter behov." },
  { step: "02", title: "Personlig kontakt", text: "Varje medarbetare får en egen kontaktperson hos oss som sköter matchning och bokning." },
  { step: "03", title: "Vi matchar rätt barnvakt", text: "Noggrant utvalda, referenstagna och HLR-utbildade barnvakter – matchade efter familjens behov." },
  { step: "04", title: "Enkel administration", text: "Vi sköter anställning, lön, försäkring och rapportering. Ni får en tydlig översikt av nyttjandet." },
];

const included = [
  "Personlig kontaktperson för varje medarbetare",
  "Noggrant utvalda barnvakter – intervjuade, referenstagna, kontrollerade mot belastningsregistret och HLR-utbildade",
  "Flexibel timpott utan krångel – nyttja vid behov",
  "All administration inkluderad: anställning, lön och försäkring",
  "Anonymiserad nyttjanderapport till HR",
  "Underlag för ert hållbarhets- och jämställdhetsarbete",
];

export default function BarnpassningForetag() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    company: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    employees: "",
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
      payload.append("subject", "Företagsförfrågan: Barnpassning");
      payload.append("Företag", form.company);
      payload.append("Kontaktperson", form.name);
      payload.append("Roll", form.role);
      payload.append("E-post", form.email);
      payload.append("Telefon", form.phone);
      payload.append("Antal anställda", form.employees);
      payload.append("Meddelande", form.message);
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
        <title>Barnpassning som personalförmån för företag | Stodona</title>
        <meta
          name="description"
          content="Erbjud barnpassning som personalförmån. Behåll talanger, minska frånvaro och stärk er employer branding. Flexibel timpott och trygga, utvalda barnvakter i Stockholm."
        />
        {/* Dold sida – ska inte indexeras eller länkas */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <div className="absolute inset-0 z-0">
          <img src="/familj-stodona.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/40"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
              <Building2 className="w-4 h-4 text-cta-hover" />
              För företag
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              En förmån som får
              <br />
              <span className="italic font-normal text-cta-hover">medarbetare att stanna.</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-10 drop-shadow-md">
              Erbjud barnpassning som personalförmån. Ni stöttar era medarbetare när
              livspusslet är som tuffast – och får tillbaka lojalitet, närvaro och ett
              starkare arbetsgivarvarumärke.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#offert" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Boka möte & få offert
              </a>
              <a href="tel:0101780150" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm">
                <Phone className="w-5 h-5 mr-2" /> 010-178 01 50
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">En smart investering i era medarbetare</h2>
            <p className="text-text-secondary text-lg">
              Barnomsorg är en av de största orsakerna till stress och frånvaro bland
              småbarnsföräldrar. Här gör ni verklig skillnad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                className="bg-bg-primary rounded-3xl p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <b.icon className="w-7 h-7 text-cta-hover" />
                </div>
                <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
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
              När det gör skillnad
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trygghet precis när det behövs</h2>
            <p className="text-text-secondary text-lg">
              Livet är oförutsägbart. Med Stodona finns en trygg lösning nära till hands.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                className="flex items-start gap-5 bg-white rounded-3xl p-7 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-cta-hover/15 flex items-center justify-center shrink-0">
                  <u.icon className="w-6 h-6 text-cta-hover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{u.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{u.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-14 text-center"
          >
            Så fungerar det för er
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((s, i) => (
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

      {/* Included */}
      <section className="section-spacing bg-cta-hover/15">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              Det här ingår
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Allt ni behöver – inget krångel
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Vi sköter allt det praktiska så att ni kan fokusera på er kärnverksamhet.
              Ni betalar bara för de timmar som nyttjas.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-cta-hover" /> Fullt försäkrat</span>
              <span className="inline-flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-cta-hover" /> All administration</span>
              <span className="inline-flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cta-hover" /> Rapport till HR</span>
            </div>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {included.map((item) => (
              <li key={item} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-primary font-medium">{item}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Offert form */}
      <section id="offert" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
                Förutsättningslöst
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Låt oss skräddarsy ett upplägg
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed mb-8">
                Berätta lite om er organisation så tar vi fram ett förslag som passar just
                era medarbetare och er budget – helt utan förpliktelser.
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
            </div>

            <div className="lg:col-span-7">
              {done ? (
                <div className="bg-white text-text-primary rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">Tack för din förfrågan!</h3>
                  <p className="text-text-secondary text-lg max-w-md mx-auto">
                    Vi har tagit emot era uppgifter och återkommer inom kort med ett förslag.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Företag</label>
                      <input name="company" required value={form.company} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Kontaktperson</label>
                      <input name="name" required value={form.name} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Roll</label>
                      <input name="role" placeholder="Ex: HR-chef" value={form.role} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">E-post</label>
                      <input type="email" name="email" required value={form.email} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefon</label>
                      <input type="tel" name="phone" value={form.phone} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Antal anställda</label>
                      <input name="employees" placeholder="Ex: 50" value={form.employees} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Berätta om era behov (frivilligt)</label>
                      <textarea name="message" rows={3} value={form.message} onChange={update}
                        className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 resize-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka förfrågan <ArrowRight className="w-5 h-5" /></>}
                  </button>
                  <p className="text-xs text-center text-text-secondary">
                    Genom att skicka in godkänner du vår{" "}
                    <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-center mt-10 text-text-light/70">
            Söker du barnpassning som privatperson?{" "}
            <Link to="/barnpassning" className="text-cta-hover font-medium hover:underline">
              Läs mer här
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
