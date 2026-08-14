import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import { Baby, CheckCircle2, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

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
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50";
const labelClass = "block text-sm font-medium mb-2";

export default function NyKund() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [days, setDays] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [form, setForm] = useState({
    guardian1: "",
    guardian2: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
    kids: "",
    ages: "",
    allergies: "",
    routines: "",
    interests: "",
    pets: "",
    plan: "Vet ej ännu",
    startDate: "",
    hoursPerWeek: "",
    languages: "",
    preferences: "",
    source: "",
    other: "",
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const p = new FormData();
      p.append("subject", "Ny barnpassningskund – intag");
      p.append("Vårdnadshavare 1", form.guardian1);
      p.append("Vårdnadshavare 2", form.guardian2);
      p.append("E-post", form.email);
      p.append("Telefon", form.phone);
      p.append("Adress", `${form.address}, ${form.postal} ${form.city}`);
      p.append("Antal barn", form.kids);
      p.append("Barnens åldrar", form.ages);
      p.append("Allergier / mediciner / särskilda behov", form.allergies);
      p.append("Rutiner", form.routines);
      p.append("Barnens intressen", form.interests);
      p.append("Husdjur i hemmet", form.pets);
      p.append("Önskat upplägg", form.plan);
      p.append("Önskad start", form.startDate);
      p.append("Behov (dagar/tider)", days.join(", "));
      p.append("Ungefärligt antal timmar/vecka", form.hoursPerWeek);
      p.append("Önskad hjälp med", tasks.join(", "));
      p.append("Önskade språk hos barnvakt", form.languages);
      p.append("Önskemål om barnvakt", form.preferences);
      p.append("Hur hörde du talas om oss", form.source);
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
        <meta name="description" content="Kom igång som barnpassningskund hos Stodona. Fyll i era uppgifter och behov så matchar vi er med rätt barnvakt." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <section className="bg-bg-dark text-text-light pt-32 pb-16">
        <div className="container-custom max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
            <Baby className="w-4 h-4 text-cta-hover" /> Kom igång som kund
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">Berätta om er familj</h1>
          <p className="text-lg text-text-light/80 leading-relaxed">
            Ju mer vi vet, desto bättre kan vi matcha er med rätt barnvakt. Det tar
            några minuter – sen hör vi av oss för ett personligt kartläggningssamtal.
            Ingen förpliktelse.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-primary rounded-3xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Tack! Vi har tagit emot era uppgifter.</h2>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Vi går igenom era behov och hör av oss inom kort för ett trevligt
                kartläggningssamtal och förslag på rätt barnvakt.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Vårdnadshavare */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Om er</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Vårdnadshavare 1 *</label>
                    <input name="guardian1" required value={form.guardian1} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Vårdnadshavare 2 (frivilligt)</label>
                    <input name="guardian2" value={form.guardian2} onChange={update} className={inputClass} />
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
                    <label className={labelClass}>Adress *</label>
                    <input name="address" required placeholder="Gatuadress" value={form.address} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Postnummer</label>
                    <input name="postal" value={form.postal} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ort</label>
                    <input name="city" value={form.city} onChange={update} className={inputClass} />
                  </div>
                </div>
              </fieldset>

              {/* Barnen */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Om barnen</legend>
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
                    <label className={labelClass}>Allergier, mediciner eller särskilda behov</label>
                    <textarea name="allergies" rows={2} value={form.allergies} onChange={update} className={`${inputClass} resize-none`} placeholder="Viktigt för barnvaktens trygghet – t.ex. allergier, mediciner, diagnoser." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Rutiner (sömn, mat, skärmtid m.m.)</label>
                    <textarea name="routines" rows={2} value={form.routines} onChange={update} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Vad tycker barnen om?</label>
                    <input name="interests" placeholder="Intressen, lekar, aktiviteter" value={form.interests} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Husdjur i hemmet?</label>
                    <input name="pets" placeholder="Ex: hund, katt, inga" value={form.pets} onChange={update} className={inputClass} />
                  </div>
                </div>
              </fieldset>

              {/* Behovet */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Ert behov</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Önskat upplägg</label>
                    <select name="plan" value={form.plan} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Vet ej ännu</option>
                      <option>Flexibel (tillfälligt, per timme)</option>
                      <option>Vardag (20 tim/månad)</option>
                      <option>Familj (40 tim/månad)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Önskad start</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={update} className={`${inputClass} cursor-pointer`} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={labelClass}>När behöver ni hjälp?</span>
                    <div className="flex flex-wrap gap-2">
                      {dayOptions.map((d) => (
                        <button type="button" key={d} onClick={() => toggle(days, setDays, d)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            days.includes(d) ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
                          }`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Ungefärligt antal timmar/vecka</label>
                    <input name="hoursPerWeek" placeholder="Ex: 8" value={form.hoursPerWeek} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Önskade språk hos barnvakten</label>
                    <input name="languages" placeholder="Ex: Svenska, Engelska" value={form.languages} onChange={update} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={labelClass}>Vad ska barnvakten hjälpa till med?</span>
                    <div className="flex flex-wrap gap-2">
                      {taskOptions.map((tk) => (
                        <button type="button" key={tk} onClick={() => toggle(tasks, setTasks, tk)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            tasks.includes(tk) ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
                          }`}>
                          {tk}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Särskilda önskemål om barnvakten</label>
                    <textarea name="preferences" rows={2} value={form.preferences} onChange={update} className={`${inputClass} resize-none`} placeholder="T.ex. erfarenhet, körkort/bil, rökfri, kön m.m." />
                  </div>
                </div>
              </fieldset>

              {/* Övrigt */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Övrigt</legend>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelClass}>Hur hörde du talas om oss? (frivilligt)</label>
                    <input name="source" value={form.source} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Något mer vi bör veta?</label>
                    <textarea name="other" rows={3} value={form.other} onChange={update} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              </fieldset>

              <div>
                <button type="submit" disabled={submitting}
                  className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka in <ArrowRight className="w-5 h-5" /></>}
                </button>
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
