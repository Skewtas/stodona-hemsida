import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarHeart,
  CalendarRange,
  Clock,
  Zap,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Loader2,
  Heart,
  ShieldCheck,
  Baby,
  Plus,
} from "lucide-react";

const PHASES = ["Behov", "Familjen", "Åldrar", "Tider", "Plats", "Kontakt"];
const TOTAL = PHASES.length;

const TYPES = [
  { id: "Fast barnvakt", title: "En fast barnvakt", sub: "Samma trygga ansikte, vecka efter vecka", icon: CalendarHeart },
  { id: "Barnvakt vid behov", title: "Barnvakt vid behov", sub: "Flexibel hjälp när livet kräver det", icon: Clock },
  { id: "Hjälp under en period", title: "Hjälp en period", sub: "Extra stöd några veckor eller månader", icon: CalendarRange },
  { id: "Akut behov", title: "Vi behöver hjälp snart", sub: "Hör av er – vi gör vårt bästa direkt", icon: Zap },
];
const COUNTS = ["1", "2", "3", "4+"];
const AGES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12+"];
const WHEN = ["Vardagar dagtid", "Vardagar kväll", "Helger", "Oregelbundet"];
const ORDINALS = ["Ert första barn", "Och ert andra barn", "Och ert tredje barn", "Och ert fjärde barn"];

function ageLabel(i: number) {
  return ORDINALS[i] ?? `Och barn ${i + 1}`;
}

export default function NannyWizard() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [type, setType] = useState("");
  const [ages, setAges] = useState<string[]>([""]);
  const [when, setWhen] = useState<string[]>([]);
  const [place, setPlace] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const firstName = contact.name.trim().split(/\s+/)[0];

  function go(next: number) {
    setError("");
    setDir(next > step ? 1 : -1);
    setStep(next);
  }
  function pickType(id: string) {
    setType(id);
    setTimeout(() => go(1), 160);
  }
  function pickCount(c: string) {
    const n = c === "4+" ? 4 : Number(c);
    setAges((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ""));
    setTimeout(() => go(2), 160);
  }
  function setAgeAt(i: number, value: string) {
    setAges((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }
  function addChild() {
    setAges((prev) => [...prev, ""]);
  }
  function removeChild(i: number) {
    setAges((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }
  function toggleWhen(v: string) {
    setWhen((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function next() {
    if (step === 2 && ages.some((a) => !a)) return setError("Välj en ålder för varje barn.");
    if (step === 4 && place.trim().length < 2) return setError("Berätta var ni finns.");
    go(step + 1);
  }

  async function handleSubmit() {
    if (!contact.name.trim()) return setError("Fyll i ert namn.");
    if (!contact.email.trim() && !contact.phone.trim()) return setError("Fyll i e-post eller telefon så vi kan nå er.");
    setError("");
    setSubmitting(true);
    try {
      const p = new FormData();
      p.append("subject", "Ny förfrågan: Barnpassning (formulär)");
      p.append("Typ av barnpassning", type);
      p.append("Antal barn", String(ages.length));
      p.append("Barnens åldrar", ages.map((a, i) => `Barn ${i + 1}: ${a || "–"}`).join(", "));
      p.append("När behövs hjälp", when.join(", "));
      p.append("Plats", place);
      p.append("Namn", contact.name);
      p.append("E-post", contact.email);
      p.append("Telefon", contact.phone);
      p.append("Meddelande", message);
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: p,
      });
      if (res.ok) setDone(true);
      else throw new Error("fel");
    } catch {
      setError("Något gick fel. Försök igen eller ring oss på 010-178 01 50.");
    } finally {
      setSubmitting(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d * 44, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -44, opacity: 0 }),
  };

  if (done) {
    return (
      <div className="relative bg-white text-text-primary rounded-[2rem] p-8 sm:p-12 text-center overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {["🎈", "⭐", "💛", "🧸", "✨", "🎉", "💛", "⭐"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 text-2xl"
              style={{ left: `${8 + i * 11}%` }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: "-460%", opacity: [0, 1, 1, 0], rotate: [0, 14, -10, 0] }}
              transition={{ duration: 5 + (i % 4) * 0.6, delay: i * 0.15, repeat: Infinity, ease: "easeOut" }}
            >
              {e}
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
          <h3 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Vad roligt{firstName ? `, ${firstName}` : ""}! 💛
          </h3>
          <p className="text-text-secondary text-lg max-w-md mx-auto leading-relaxed">
            Vi har tagit emot er förfrågan och hör av oss inom kort för ett varmt,
            förutsättningslöst samtal – så vi kan matcha er med en barnvakt som känns
            helt rätt.
          </p>
          <p className="text-sm text-text-secondary/80 mt-6">
            Vill ni höra av er direkt? Ring oss gärna på{" "}
            <a href="tel:0101780150" className="text-cta-hover font-medium hover:underline">010-178 01 50</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white text-text-primary rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] overflow-hidden">
      {/* Header med namngiven stegindikator */}
      <div className="bg-gradient-to-br from-cta-hover/25 to-cta-hover/5 px-6 sm:px-10 pt-7 pb-6 border-b border-text-primary/5">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => step !== 0 && go(step - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tillbaka
          </button>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-cta-hover">
            {PHASES[step]} · {step + 1}/{TOTAL}
          </span>
        </div>
        <div className="flex gap-1.5">
          {PHASES.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-white/60 overflow-hidden">
              <motion.div
                className="h-full bg-cta-hover rounded-full"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 sm:px-10 py-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Steg 1 – Behov */}
            {step === 0 && (
              <div>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold text-center mb-2">
                  Vad kan vi hjälpa er med?
                </h3>
                <p className="text-center text-text-secondary mb-8">Välj det som passar er familj bäst.</p>
                <div className="space-y-3">
                  {TYPES.map((o) => {
                    const active = type === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => pickType(o.id)}
                        className={`group w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                          active
                            ? "border-cta-hover bg-cta-hover/10 ring-2 ring-cta-hover/40"
                            : "border-text-primary/10 hover:border-cta-hover/60"
                        }`}
                      >
                        <span className="w-12 h-12 rounded-xl bg-cta-hover/15 text-cta-hover flex items-center justify-center shrink-0">
                          <o.icon className="w-6 h-6" />
                        </span>
                        <span className="flex flex-col flex-1">
                          <span className="font-semibold text-lg leading-tight">{o.title}</span>
                          <span className="text-sm text-text-secondary">{o.sub}</span>
                        </span>
                        <ChevronRight className="w-5 h-5 text-text-primary/30 group-hover:text-cta-hover group-hover:translate-x-1 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Steg 2 – Familjen */}
            {step === 1 && (
              <div>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold text-center mb-2">
                  Hur stor är familjen?
                </h3>
                <p className="text-center text-text-secondary mb-8">Hur många barn ska vi ta hand om?</p>
                <div className="grid grid-cols-4 gap-3">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => pickCount(c)}
                      className="aspect-square rounded-2xl border border-text-primary/10 text-2xl font-display font-bold hover:border-cta-hover hover:bg-cta-hover/10 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Steg 3 – Åldrar */}
            {step === 2 && (
              <div>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold text-center mb-2">
                  Hur gamla är barnen?
                </h3>
                <p className="text-center text-text-secondary mb-8">Så matchar vi rätt erfarenhet.</p>
                <div className="space-y-4">
                  {ages.map((val, i) => (
                    <div key={i} className="bg-bg-primary/60 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">{ageLabel(i)}</span>
                        {ages.length > 1 && (
                          <button type="button" onClick={() => removeChild(i)} className="text-xs text-text-secondary/70 hover:text-cta-hover">
                            Ta bort
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AGES.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => setAgeAt(i, a)}
                            className={`w-10 h-10 rounded-full text-sm font-medium border transition-all ${
                              val === a
                                ? "bg-cta-hover border-cta-hover text-text-primary scale-105 shadow"
                                : "bg-white border-text-primary/10 text-text-secondary hover:border-cta-hover/60"
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addChild} className="flex items-center gap-2 text-sm font-medium text-cta-hover hover:underline">
                    <Plus className="w-4 h-4" /> Lägg till barn
                  </button>
                </div>
              </div>
            )}

            {/* Steg 4 – Tider */}
            {step === 3 && (
              <div>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold text-center mb-2">
                  När behöver ni oss?
                </h3>
                <p className="text-center text-text-secondary mb-8">Välj en eller flera – eller hoppa över.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {WHEN.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleWhen(w)}
                      className={`px-5 py-3 rounded-full text-sm font-medium border transition-all ${
                        when.includes(w)
                          ? "bg-cta-hover border-cta-hover text-text-primary shadow"
                          : "border-text-primary/10 text-text-secondary hover:border-cta-hover/60"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Steg 5 – Plats */}
            {step === 4 && (
              <div className="text-center">
                <span className="w-14 h-14 rounded-2xl bg-cta-hover/15 text-cta-hover flex items-center justify-center mx-auto mb-5">
                  <MapPin className="w-6 h-6" />
                </span>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold mb-2">Var i Stockholm finns ni?</h3>
                <p className="text-text-secondary mb-8">Så hittar vi en barnvakt nära er.</p>
                <input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  placeholder="Ex: Bromma eller 168 40"
                  className="w-full px-5 py-4 rounded-2xl border border-text-primary/10 bg-bg-primary/60 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cta-hover/60"
                />
              </div>
            )}

            {/* Steg 6 – Kontakt */}
            {step === 5 && (
              <div>
                <h3 className="font-display text-2xl sm:text-[2rem] leading-tight font-bold text-center mb-2">Vart hör vi av oss?</h3>
                <p className="text-center text-text-secondary mb-8">Vi återkommer med ett personligt förslag – utan förpliktelser.</p>
                <div className="space-y-4">
                  <input
                    value={contact.name}
                    onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ditt namn *"
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:outline-none focus:ring-2 focus:ring-cta-hover/60"
                  />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="E-post"
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:outline-none focus:ring-2 focus:ring-cta-hover/60"
                  />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Telefon"
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:outline-none focus:ring-2 focus:ring-cta-hover/60"
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Något mer vi bör veta? (frivilligt)"
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:outline-none focus:ring-2 focus:ring-cta-hover/60 resize-none"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="text-sm text-red-500 mt-5 text-center">{error}</p>}

        {step >= 2 && (
          <motion.button
            type="button"
            onClick={step === 5 ? handleSubmit : next}
            disabled={submitting}
            whileTap={{ scale: 0.985 }}
            className="w-full mt-8 py-4 rounded-2xl bg-text-primary text-bg-primary font-bold flex items-center justify-center gap-2 hover:bg-cta-hover hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 5 ? (
              <>Skicka förfrågan <Baby className="w-5 h-5" /></>
            ) : (
              <>Fortsätt <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
        )}

        {step === 3 && (
          <button type="button" onClick={next} className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary">
            Hoppa över
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-text-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-cta-hover" />
          Referenstagna & HLR-utbildade barnvakter
        </div>
      </div>
    </div>
  );
}
