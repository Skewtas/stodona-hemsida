import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Baby,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  Users,
  Clock,
  MessageCircleHeart,
} from "lucide-react";

// Konfetti som flyter uppåt i tack-rutan – lekfullt och personligt.
const CONFETTI = [
  { emoji: "🎈", left: "6%", delay: 0, dur: 5.5 },
  { emoji: "⭐", left: "20%", delay: 0.6, dur: 6.5 },
  { emoji: "💛", left: "34%", delay: 0.2, dur: 5 },
  { emoji: "🧸", left: "48%", delay: 0.9, dur: 6 },
  { emoji: "✨", left: "62%", delay: 0.4, dur: 5.8 },
  { emoji: "🎉", left: "76%", delay: 1.1, dur: 6.2 },
  { emoji: "💛", left: "90%", delay: 0.75, dur: 5.3 },
  { emoji: "⭐", left: "12%", delay: 1.3, dur: 6.8 },
];

const planOptions = ["Flexibelt / vid behov", "Regelbundet varje vecka", "Kväll & helg", "Vet ej ännu"];
const dayOptions = ["Vardagar dagtid", "Vardagar kväll", "Helger", "Oregelbundet"];
const taskOptions = [
  "Barnpassning i hemmet",
  "Hämtning & lämning",
  "Läxhjälp",
  "Matlagning & mellanmål",
  "Lek & aktiviteter",
  "Lättare hushållssysslor",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-shadow";
const labelClass = "block text-sm font-medium mb-2";

// Animerad "chip" – toggle-knapp med liten studs vid klick.
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-cta-hover border-cta-hover text-text-primary shadow-sm"
          : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
      }`}
    >
      {active && <CheckCircle2 className="w-3.5 h-3.5" />}
      {label}
    </motion.button>
  );
}

// Sektion som mjukt glider in när den scrollas fram.
function Section({
  step,
  icon,
  title,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.fieldset
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <legend className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-full bg-cta-hover/15 text-cta-hover flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-bold uppercase tracking-widest text-cta-hover">
            Steg {step}
          </span>
          <span className="text-2xl font-bold">{title}</span>
        </span>
      </legend>
      {children}
    </motion.fieldset>
  );
}

export default function NyKund() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [plan, setPlan] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    kids: "",
    ages: "",
    important: "",
    hoursPerSession: "",
    startDate: "",
    other: "",
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const firstName = form.name.trim().split(/\s+/)[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const p = new FormData();
      p.append("subject", "Ny barnpassningskund – intag");
      p.append("Namn", form.name);
      p.append("E-post", form.email);
      p.append("Telefon", form.phone);
      p.append("Område / ort", form.area);
      p.append("Antal barn", form.kids);
      p.append("Barnens åldrar", form.ages);
      p.append("Viktigt att veta (allergier m.m.)", form.important);
      p.append("Önskat upplägg", plan);
      p.append("Timmar per tillfälle", form.hoursPerSession);
      p.append("När behövs hjälp", days.join(", "));
      p.append("Önskad hjälp med", tasks.join(", "));
      p.append("Önskad start", form.startDate);
      p.append("Övrigt", form.other);
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: p,
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
        <title>Bli barnpassningskund | Stodona</title>
        <meta name="description" content="Kom igång som barnpassningskund hos Stodona. Berätta kort om er familj så matchar vi er med rätt barnvakt." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <section className="relative bg-bg-dark text-text-light pt-32 pb-20 overflow-hidden">
        {/* Videobakgrund med gradient-overlay så texten alltid är läsbar */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-110"
          >
            <source src="/barnpassning-familj.mp4" type="video/mp4" />
          </video>
          {/* Lätt skugga bara där texten ligger (nedre vänster) så videon förblir ljus */}
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/55 via-bg-dark/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/45 via-transparent to-transparent" />
        </div>
        {/* Mjuk glöd för extra liv ovanpå videon */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-cta-hover/20 blur-3xl z-0"
        />
        <div className="container-custom max-w-3xl relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-4 h-4 text-cta-hover" /> Få hjälp med barnpassning
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold mb-5 leading-tight"
          >
            Berätta om er familj{" "}
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.5 }}
              className="inline-block"
            >
              <Heart className="inline w-9 h-9 md:w-12 md:h-12 text-cta-hover fill-cta-hover" />
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-light/80 leading-relaxed"
          >
            Bara det viktigaste – sen hör vi av oss för ett personligt samtal och
            matchar er med rätt barnvakt. Kostnadsfritt och helt utan förpliktelser.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-bg-primary rounded-3xl p-10 sm:p-12 text-center overflow-hidden"
            >
              {/* Konfetti som flyter uppåt */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {CONFETTI.map((c, i) => (
                  <motion.span
                    key={i}
                    className="absolute bottom-0 text-2xl"
                    style={{ left: c.left }}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: "-420%", opacity: [0, 1, 1, 0], rotate: [0, 15, -10, 0] }}
                    transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeOut" }}
                  >
                    {c.emoji}
                  </motion.span>
                ))}
              </div>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                  className="w-20 h-20 bg-cta-hover/20 text-cta-hover rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Heart className="w-10 h-10 fill-cta-hover" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Tack{firstName ? `, ${firstName}` : ""}! 🎉
                </h2>
                <p className="text-text-secondary text-lg max-w-md mx-auto leading-relaxed">
                  Så roligt att ni vill lära känna oss! Vi läser nu in oss på er familj
                  {form.area ? ` i ${form.area}` : ""} och hör av oss inom kort för ett
                  varmt, förutsättningslöst samtal – så vi kan matcha er med en barnvakt
                  som känns helt rätt. 💛
                </p>
                <p className="text-sm text-text-secondary/80 mt-6">
                  Vill ni höra av er direkt? Ring oss gärna på{" "}
                  <a href="tel:0101780150" className="text-cta-hover font-medium hover:underline">
                    010-178 01 50
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Steg 1 – Om er */}
              <Section step={1} icon={<Users className="w-5 h-5" />} title="Om er">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Ditt namn *</label>
                    <input name="name" required value={form.name} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>E-post *</label>
                    <input type="email" name="email" required value={form.email} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefon *</label>
                    <input type="tel" name="phone" required value={form.phone} onChange={update} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Var bor ni? *</label>
                    <input name="area" required placeholder="Ex: Bromma, Stockholm" value={form.area} onChange={update} className={inputClass} />
                  </div>
                </div>
              </Section>

              {/* Steg 2 – Barnen */}
              <Section step={2} icon={<Baby className="w-5 h-5" />} title="Om barnen">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Antal barn *</label>
                    <input name="kids" required placeholder="Ex: 2" value={form.kids} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Barnens åldrar *</label>
                    <input name="ages" required placeholder="Ex: 2 år och 5 år" value={form.ages} onChange={update} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Något viktigt vi bör veta?</label>
                    <textarea name="important" rows={2} value={form.important} onChange={update} className={`${inputClass} resize-none`} placeholder="T.ex. allergier, mediciner, rutiner eller diagnoser – så barnvakten är väl förberedd." />
                  </div>
                </div>
              </Section>

              {/* Steg 3 – Behovet */}
              <Section step={3} icon={<Clock className="w-5 h-5" />} title="Ert behov">
                <div className="space-y-6">
                  <div>
                    <span className={labelClass}>Hur ofta behöver ni hjälp?</span>
                    <div className="flex flex-wrap gap-2">
                      {planOptions.map((o) => (
                        <Chip key={o} label={o} active={plan === o} onClick={() => setPlan(plan === o ? "" : o)} />
                      ))}
                    </div>
                  </div>
                  <div className="sm:max-w-xs">
                    <label className={labelClass}>Ungefär hur många timmar per tillfälle?</label>
                    <input name="hoursPerSession" value={form.hoursPerSession} onChange={update} placeholder="Ex: 3–4 timmar" className={inputClass} />
                  </div>
                  <div>
                    <span className={labelClass}>När på dygnet?</span>
                    <div className="flex flex-wrap gap-2">
                      {dayOptions.map((d) => (
                        <Chip key={d} label={d} active={days.includes(d)} onClick={() => toggle(days, setDays, d)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className={labelClass}>Vad ska barnvakten hjälpa till med?</span>
                    <div className="flex flex-wrap gap-2">
                      {taskOptions.map((tk) => (
                        <Chip key={tk} label={tk} active={tasks.includes(tk)} onClick={() => toggle(tasks, setTasks, tk)} />
                      ))}
                    </div>
                  </div>
                  <div className="sm:max-w-xs">
                    <label className={labelClass}>Önskad start (frivilligt)</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={update} className={`${inputClass} cursor-pointer`} />
                  </div>
                </div>
              </Section>

              {/* Steg 4 – Övrigt */}
              <Section step={4} icon={<MessageCircleHeart className="w-5 h-5" />} title="Något mer?">
                <textarea name="other" rows={3} value={form.other} onChange={update} className={`${inputClass} resize-none`} placeholder="Önskemål om barnvakten (körkort, språk, kön), husdjur hemma, eller vad som helst ni vill dela." />
              </Section>

              <div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.015 }}
                  whileTap={{ scale: submitting ? 1 : 0.985 }}
                  className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka in <ArrowRight className="w-5 h-5" /></>}
                </motion.button>
                <p className="text-xs text-center text-text-secondary mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cta-hover" />
                  Dina uppgifter hanteras tryggt enligt vår{" "}
                  <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                </p>
              </div>
            </form>
          )}

          <p className="text-center mt-10 text-text-secondary">
            Vill du bara ställa en fråga först?{" "}
            <Link to="/barnpassning" className="text-cta-hover font-medium hover:underline">Läs mer om barnpassning</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
