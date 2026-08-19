import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Check,
  Star,
  Sparkles,
  Clock,
  Home,
  Utensils,
  School,
  Heart,
  ArrowRight,
  ShieldCheck,
  Wallet,
  CalendarClock,
  Bell,
  Repeat,
  Info,
} from "lucide-react";
import { NANNY_PLANS, NANNY_TRIAL, type NannyPlan } from "../nannyData";

const kr = (n: number) => n.toLocaleString("sv-SE").replace(/ /g, " ") + " kr";

function recommend(hours: number): NannyPlan {
  const key = hours <= 7 ? "flex" : hours <= 15 ? "mini" : hours <= 31 ? "familj" : "familjplus";
  return NANNY_PLANS.find((p) => p.key === key)!;
}

const flowSteps = [
  { icon: School, label: "Hämtning från förskola/skola" },
  { icon: Home, label: "Hem" },
  { icon: Utensils, label: "Mellanmål/enkel middag" },
  { icon: Heart, label: "Lek & barnpassning" },
  { icon: Check, label: "Föräldern kommer hem" },
];

const terms: { icon: React.ComponentType<{ className?: string }>; text: string }[] = [
  { icon: Wallet, text: "Alla angivna priser är kundens pris efter RUT-avdrag." },
  { icon: Clock, text: "Minsta bokning är 3 sammanhängande timmar, om inget annat överenskommits." },
  { icon: CalendarClock, text: "Mini omfattar 8 tim/mån, Familj 16 tim/mån och Familj Plus minst 32 tim/mån." },
  { icon: Wallet, text: "Extra timmar debiteras enligt kundens aktuella paketpris. Flex debiteras 269 kr/tim efter RUT." },
  { icon: Repeat, text: "Återkommande kunder matchas i första hand med samma barnvakt." },
  { icon: Info, text: "Vi kan inte garantera samma barnvakt vid sjukdom, semester eller schemaändringar." },
  { icon: CalendarClock, text: "Tider och schema bestäms mellan Stodona och kunden." },
  { icon: Bell, text: "Avbokning senast 48 timmar före starttid – vid senare avbokning debiteras den bokade tiden." },
  { icon: ShieldCheck, text: "RUT-avdrag förutsätter att kunden uppfyller Skatteverkets krav och har tillräckligt RUT-utrymme." },
  { icon: Info, text: "Om Skatteverket inte godkänner RUT-avdraget ansvarar kunden för resterande belopp." },
];

export default function NannyPricing() {
  const [hours, setHours] = useState(16);
  const rec = recommend(hours);
  const estMonthly = rec.hoursPerMonth === 0 ? null : hours * rec.hourly;

  return (
    <section id="priser" className="section-spacing bg-white scroll-mt-24">
      <div className="container-custom">
        {/* Rubrik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-bg-primary text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
            Priser & abonnemang
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Barnpassning som passar er vardag</h2>
          <p className="text-text-secondary text-lg">
            Välj hur mycket hjälp ni behöver. Ju fler timmar ni bokar varje månad, desto bättre
            timpris. Alla priser nedan är det ni som kund betalar efter RUT-avdrag.
          </p>
          <span className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-cta-hover/15 text-text-primary text-sm font-medium">
            <ShieldCheck className="w-4 h-4 text-cta-hover" /> 50 % RUT-avdrag är redan avdraget i priserna.
          </span>
        </motion.div>

        {/* Rekommendations-slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto mb-16 bg-bg-primary rounded-3xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <h3 className="text-xl font-bold">Hur mycket hjälp behöver ni?</h3>
            <span className="text-sm text-text-secondary">
              <strong className="text-text-primary text-base">{hours}</strong> timmar/månad
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{ accentColor: "var(--color-cta-hover)" }}
            className="w-full h-2 cursor-pointer"
            aria-label="Timmar barnpassning per månad"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-2 mb-6">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40+</span>
          </div>

          <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-0.5">Vi rekommenderar</p>
              <p className="text-2xl font-bold">
                {rec.name}
                <span className="text-base font-medium text-text-secondary"> · {rec.hourly} kr/tim efter RUT</span>
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {estMonthly
                  ? `≈ ${kr(estMonthly)}/månad för ${hours} timmar`
                  : "Betala per timme – boka helt efter behov"}
              </p>
            </div>
            <Link
              to="/ny-kund"
              className="btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary shrink-0"
            >
              Se vilket paket som passar oss
            </Link>
          </div>
        </motion.div>

        {/* Priskort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {NANNY_PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-3xl p-7 flex flex-col ${
                plan.featured
                  ? "bg-bg-dark text-text-light shadow-2xl lg:-translate-y-3 border border-cta-hover/40"
                  : "bg-bg-primary text-text-primary border border-text-primary/5"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-cta-hover text-text-primary text-xs font-bold px-3 py-1 rounded-full shadow">
                  <Star className="w-3.5 h-3.5 fill-current" /> {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>

              {/* Pris – visuellt mest framträdande */}
              <div className="mt-4 flex items-end gap-1.5">
                <span className="text-4xl font-bold leading-none">{plan.hourly} kr</span>
                <span className={`mb-0.5 text-sm ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>
                  /timme efter RUT
                </span>
              </div>

              {/* Timmar + månadskostnad */}
              <div className="mt-3 mb-5">
                <p className={`text-sm font-semibold ${plan.featured ? "text-cta-hover" : "text-text-primary"}`}>
                  {plan.hoursLabel}
                </p>
                {plan.monthly ? (
                  <p className={`text-sm mt-0.5 ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>
                    ≈ {kr(plan.monthly)}/månad
                  </p>
                ) : (
                  <p className={`text-sm mt-0.5 ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>
                    Betala per bokning
                  </p>
                )}
              </div>

              <p className={`text-sm mb-6 ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>
                {plan.tagline}
              </p>

              <ul className="space-y-2.5 mb-7 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-cta-hover" />
                    <span className={`text-sm ${plan.featured ? "text-text-light/90" : "text-text-secondary"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/ny-kund"
                className={`btn-primary w-full ${
                  plan.featured
                    ? "bg-cta-hover text-text-primary hover:bg-white"
                    : "bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Prova-på-erbjudande */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 rounded-3xl bg-cta-hover/15 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-4 h-4 text-cta-hover" /> Prova först
            </span>
            <h3 className="text-2xl md:text-4xl font-bold mb-3">Vill ni prova först?</h3>
            <p className="text-text-secondary leading-relaxed mb-2">
              Träffa en av våra barnvakter och prova Stodona Barnpassning innan ni väljer ett
              återkommande upplägg. Trivs familjen och barnvakten tillsammans kan ni fortsätta med
              samma barnvakt och välja ett månadspaket.
            </p>
            <p className="text-xs text-text-secondary/80">
              Erbjudandet gäller nya barnpassningskunder och kan användas en gång per familj.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm text-text-secondary mb-1">Prova-på</p>
            <p className="text-4xl md:text-5xl font-bold mb-1">
              {NANNY_TRIAL.hours} timmar för {NANNY_TRIAL.price} kr
            </p>
            <p className="text-sm text-text-secondary mb-6">efter RUT-avdrag</p>
            <Link
              to="/ny-kund"
              className="btn-primary w-full bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary"
            >
              {NANNY_TRIAL.cta}
            </Link>
          </div>
        </motion.div>

        {/* Hämta & Hjälp */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 rounded-3xl bg-bg-dark text-text-light p-8 sm:p-12"
        >
          <div className="max-w-2xl mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-4">
              Hämta & Hjälp
            </span>
            <h3 className="text-2xl md:text-4xl font-bold mb-3">Vi löser familjens stressigaste timmar</h3>
            <p className="text-text-light/75">
              Perfekt för familjer som behöver hjälp mellan arbetsdagens slut och kvällens
              familjeliv. Pris enligt valt abonnemang.
            </p>
          </div>

          <div className="flex flex-wrap items-stretch gap-3 mb-8">
            {flowSteps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center text-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 w-32">
                  <s.icon className="w-6 h-6 text-cta-hover" />
                  <span className="text-xs text-text-light/85 leading-tight">{s.label}</span>
                </div>
                {i < flowSteps.length - 1 && <ArrowRight className="w-5 h-5 text-cta-hover/70 shrink-0" />}
              </div>
            ))}
          </div>

          <Link
            to="/ny-kund"
            className="btn-primary bg-cta-hover text-text-primary hover:bg-white"
          >
            Hitta rätt upplägg för vår familj
          </Link>
        </motion.div>

        {/* Bra att veta */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-5 h-5 text-cta-hover" />
            <h3 className="text-xl font-bold">Bra att veta</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {terms.map((t) => (
              <div key={t.text} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0">
                  <t.icon className="w-4 h-4 text-cta-hover" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{t.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
