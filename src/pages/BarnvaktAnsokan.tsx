import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import { Baby, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Upload } from "lucide-react";

const ageGroups = ["0–1 år", "1–3 år", "3–6 år", "6–12 år", "12+ år"];
const dayOptions = ["Vardagar dagtid", "Vardagar kväll", "Helger", "Flexibelt"];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50";
const labelClass = "block text-sm font-medium mb-2";

export default function BarnvaktAnsokan() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [cv, setCv] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    area: "",
    license: "Nej",
    car: "Nej",
    experience: "",
    years: "",
    education: "",
    languages: "",
    hlr: "Nej, men vill gärna utbildas",
    swim: "Ja",
    extent: "Deltid",
    startDate: "",
    register: "Ja",
    references: "",
    link: "",
    about: "",
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const MAX_MB = 10;
  function pickFile(setFile: (f: File | null) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f && f.size > MAX_MB * 1024 * 1024) {
        setFileError(`Filen "${f.name}" är för stor (max ${MAX_MB} MB).`);
        e.target.value = "";
        return;
      }
      setFileError("");
      setFile(f);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const p = new FormData();
      p.append("subject", "Barnvaktsansökan");
      p.append("Namn", form.name);
      p.append("E-post", form.email);
      p.append("Telefon", form.phone);
      p.append("Ålder", form.age);
      p.append("Ort/område", form.area);
      p.append("Körkort", form.license);
      p.append("Tillgång till bil", form.car);
      p.append("Erfarenhet av barn", form.experience);
      p.append("Antal års erfarenhet", form.years);
      p.append("Utbildning", form.education);
      p.append("Åldersgrupper jag är bekväm med", groups.join(", "));
      p.append("Språk", form.languages);
      p.append("HLR / första hjälpen", form.hlr);
      p.append("Simkunnig", form.swim);
      p.append("Omfattning", form.extent);
      p.append("Tillgänglighet", days.join(", "));
      p.append("Kan börja", form.startDate);
      p.append("Kan visa utdrag ur belastningsregistret", form.register);
      p.append("Referenser", form.references);
      p.append("CV / LinkedIn (länk)", form.link);
      p.append("Om mig", form.about);
      if (cv) p.append("CV-fil", cv);
      if (photo) p.append("Foto", photo);
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: p,
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
        <title>Ansök om att bli barnvakt | Stodona</title>
        <meta name="description" content="Ansök om att bli barnvakt hos Stodona. Fyll i din ansökan så hör vi av oss." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <section className="bg-bg-dark text-text-light pt-32 pb-16">
        <div className="container-custom max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
            <Baby className="w-4 h-4 text-cta-hover" /> Ansök som barnvakt
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">Din ansökan</h1>
          <p className="text-lg text-text-light/80 leading-relaxed">
            Fyll i formuläret nedan så noggrant du kan – det hjälper oss att lära känna
            dig och hitta rätt familjer. Vi hör av oss om det känns som en match!
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-bg-primary rounded-3xl p-10 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Tack för din ansökan!</h2>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Vi har tagit emot den och går igenom den noggrant. Hör vi inte av oss
                direkt betyder det bara att vi har mycket att läsa – vi återkommer!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personuppgifter */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Om dig</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Fullständigt namn *</label>
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
                  <div>
                    <label className={labelClass}>Ålder *</label>
                    <input name="age" required placeholder="Ex: 24" value={form.age} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ort / område *</label>
                    <input name="area" required placeholder="Ex: Södermalm" value={form.area} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Körkort</label>
                    <select name="license" value={form.license} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Nej</option>
                      <option>Ja</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tillgång till bil</label>
                    <select name="car" value={form.car} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Nej</option>
                      <option>Ja</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Erfarenhet */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Erfarenhet & kompetens</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Din erfarenhet av barn *</label>
                    <textarea name="experience" required rows={3} value={form.experience} onChange={update}
                      className={`${inputClass} resize-none`}
                      placeholder="Berätta om jobb, praktik, utbildning, egna barn, syskon m.m." />
                  </div>
                  <div>
                    <label className={labelClass}>Antal års erfarenhet</label>
                    <input name="years" placeholder="Ex: 3" value={form.years} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Relevant utbildning</label>
                    <input name="education" placeholder="Ex: Barnskötare, förskollärare" value={form.education} onChange={update} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={labelClass}>Åldersgrupper du är bekväm med</span>
                    <div className="flex flex-wrap gap-2">
                      {ageGroups.map((g) => (
                        <button type="button" key={g} onClick={() => toggle(groups, setGroups, g)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            groups.includes(g) ? "bg-cta-hover border-cta-hover text-text-primary" : "bg-bg-primary border-text-primary/10 text-text-secondary hover:border-cta-hover/50"
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Språk du talar</label>
                    <input name="languages" placeholder="Ex: Svenska, Engelska" value={form.languages} onChange={update} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Simkunnig</label>
                    <select name="swim" value={form.swim} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Ja</option>
                      <option>Nej</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>HLR / första hjälpen för barn</label>
                    <select name="hlr" value={form.hlr} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Nej, men vill gärna utbildas</option>
                      <option>Ja, utbildad</option>
                      <option>Delvis / äldre utbildning</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Tillgänglighet */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Tillgänglighet</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Omfattning</label>
                    <select name="extent" value={form.extent} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Deltid</option>
                      <option>Heltid</option>
                      <option>Extra vid sidan av studier/jobb</option>
                      <option>Enstaka uppdrag</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>När kan du börja?</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={update} className={`${inputClass} cursor-pointer`} />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={labelClass}>När kan du jobba?</span>
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
                </div>
              </fieldset>

              {/* Bakgrund & referenser */}
              <fieldset>
                <legend className="text-2xl font-bold mb-6">Bakgrund & referenser</legend>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className={labelClass}>Kan du visa upp utdrag ur belastningsregistret?</label>
                    <select name="register" value={form.register} onChange={update} className={`${inputClass} cursor-pointer`}>
                      <option>Ja</option>
                      <option>Ja, kan ordna</option>
                      <option>Nej</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Referenser (minst en)</label>
                    <textarea name="references" rows={3} value={form.references} onChange={update}
                      className={`${inputClass} resize-none`}
                      placeholder="Namn, relation och kontaktuppgift (telefon/e-post) till en eller flera referenser." />
                  </div>
                  <div>
                    <label className={labelClass}>Länk till CV eller LinkedIn (frivilligt)</label>
                    <input name="link" placeholder="https://..." value={form.link} onChange={update} className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Ladda upp CV (frivilligt)</label>
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 bg-bg-primary cursor-pointer hover:border-cta-hover transition-colors">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary shrink-0">
                          <Upload className="w-4 h-4 text-cta-hover" /> Välj fil
                        </span>
                        <span className="text-sm text-text-secondary truncate">
                          {cv ? cv.name : "PDF eller Word"}
                        </span>
                        <input type="file" accept=".pdf,.doc,.docx,.rtf,.txt,application/pdf" className="hidden" onChange={pickFile(setCv)} />
                      </label>
                    </div>
                    <div>
                      <label className={labelClass}>Ladda upp foto (frivilligt)</label>
                      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 bg-bg-primary cursor-pointer hover:border-cta-hover transition-colors">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary shrink-0">
                          <Upload className="w-4 h-4 text-cta-hover" /> Välj fil
                        </span>
                        <span className="text-sm text-text-secondary truncate">
                          {photo ? photo.name : "JPG eller PNG"}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={pickFile(setPhoto)} />
                      </label>
                    </div>
                    {fileError && <p className="sm:col-span-2 text-red-500 text-sm">{fileError}</p>}
                    <p className="sm:col-span-2 text-xs text-text-secondary">Max 10 MB per fil.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Varför vill du bli barnvakt hos oss? *</label>
                    <textarea name="about" required rows={4} value={form.about} onChange={update}
                      className={`${inputClass} resize-none`}
                      placeholder="Berätta lite om dig själv och varför just du passar hos Stodona." />
                  </div>
                </div>
              </fieldset>

              <div>
                <button type="submit" disabled={submitting}
                  className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka ansökan <ArrowRight className="w-5 h-5" /></>}
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
            Vill du veta mer först?{" "}
            <Link to="/jobba-som-barnvakt" className="text-cta-hover font-medium hover:underline">Läs om att jobba som barnvakt</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
