import { useState } from "react";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import {
  Home,
  HardHat,
  Sparkles,
  Wind,
  Baby,
  Briefcase,
  Handshake,
  Wallet,
  Clock,
  GraduationCap,
  Users,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Loader2,
  ArrowRight,
  ArrowDown,
  Star,
} from "lucide-react";

const ROLES = [
  { id: "Hemstädare", icon: Home, image: "/stodona_right_image.jpg", desc: "Skapa hotellkänsla i våra kunders hem. Regelbundna uppdrag, mest dagtid." },
  { id: "Byggstädare", icon: HardHat, image: "/byggstadning.jpg", desc: "Grov- och finstädning efter bygg och renovering. Varierat och fysiskt." },
  { id: "Flytt- & storstädare", icon: Sparkles, image: "/stodona-stad.jpg", desc: "Djuprengöring och flyttstäd med garanti – för dig som gillar noggrannhet." },
  { id: "Fönsterputsare", icon: Wind, image: "/fonster-stodona.jpg", desc: "Ge skinande rena fönster året runt, hemma och på företag." },
  { id: "Barnvakt", icon: Baby, image: "/familj-stodona.jpg", desc: "Trygg och varm barnpassning i familjers hem." },
  { id: "Konsult", icon: Briefcase, image: "/kontorsstadning.jpg", desc: "Uppdrag som konsult inom service och städ – flexibelt upplägg." },
  { id: "Underleverantör", icon: Handshake, image: "/stodona_left_image.jpg", desc: "Är ni ett städbolag som vill samarbeta? Bli underleverantör till Stodona." },
];

const PERKS = [
  { icon: Wallet, title: "Schyssta villkor", text: "Marknadsmässig lön, försäkring och trygga anställningsvillkor." },
  { icon: Clock, title: "Flexibelt", text: "Vi gör vårt bästa för att anpassa schemat efter din vardag." },
  { icon: GraduationCap, title: "Utveckling", text: "Ordentlig introduktion, upplärning och chans att växa hos oss." },
  { icon: Users, title: "Härligt team", text: "Du blir en del av ett omtänksamt gäng som stöttar varandra." },
  { icon: Heart, title: "Meningsfullt", text: "Ditt arbete gör verklig skillnad i människors vardag." },
  { icon: ShieldCheck, title: "Tryggt varumärke", text: "Ett av Stockholms mest rekommenderade servicebolag." },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

export default function JobbaHosOss() {
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");
  const [role, setRole] = useState("Hemstädare");
  const [cvName, setCvName] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [fileError, setFileError] = useState("");

  function applyFor(roleId: string) {
    setRole(roleId);
    document.getElementById("ansok")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function checkFile(setName: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f && f.size > 10 * 1024 * 1024) {
        setFileError(`Filen "${f.name}" är för stor (max 10 MB).`);
        e.target.value = "";
        setName("");
        return;
      }
      setFileError("");
      setName(f ? f.name : "");
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("submitting");
    try {
      const fd = new FormData(form);
      fd.append("subject", `Jobbansökan: ${role}`);
      fd.append("_subject", `Jobbansökan: ${role}`);
      // Skicka kopia till båda mottagarna (kräver att Formspree-planen stödjer CC).
      fd.append("_cc", "info@stodona.se,mikaela.wigert@stodona.se");
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (res.ok) {
        setState("success");
        form.reset();
        setCvName("");
        setPhotoName("");
      } else throw new Error("fel");
    } catch {
      setState("idle");
      alert("Något gick fel. Försök igen eller mejla oss på info@stodona.se.");
    }
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Jobba hos Stodona – Lediga tjänster i Stockholm | Stodona</title>
        <meta
          name="description"
          content="Sök jobb hos Stodona i Stockholm. Vi söker hemstädare, byggstädare, fönsterputsare, barnvakter, konsulter och underleverantörer. Enkel ansökan – bifoga CV direkt."
        />
        <link rel="canonical" href="https://stodona.se/jobba-hos-oss" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <motion.img
          src="/stodona-stad.jpg"
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/40" />
        {/* Animerade glöd-blobbar */}
        <motion.div
          aria-hidden
          animate={{ y: [0, -24, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-20 -right-10 w-96 h-96 rounded-full bg-cta-hover/25 blur-3xl z-0"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cta-hover/15 blur-3xl z-0"
        />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold tracking-widest uppercase mb-6"
            >
              <Sparkles className="w-4 h-4 text-cta-hover" /> Jobba med oss
            </motion.span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Bli en del av
              <br />
              <span className="italic font-normal text-cta-hover">Stodona-teamet!</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
              Vi växer och söker härliga, ansvarsfulla människor som vill göra skillnad i
              vardagen – i Stockholm och Stockholmsområdet. Hitta din roll och sök på
              någon minut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#tjanster" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Se lediga tjänster <ArrowDown className="w-5 h-5 ml-2" />
              </a>
              <button
                type="button"
                onClick={() => applyFor("Spontanansökan")}
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm"
              >
                Gör en spontanansökan
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-text-light/85">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </span>
                4.9/5 i snittbetyg
              </span>
              <span className="text-text-light/40">·</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cta-hover" /> Ansvarsförsäkrade</span>
              <span className="text-text-light/40">·</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4 text-cta-hover" /> Härligt team</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="section-spacing bg-white relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-1/2 h-full bg-cta-hover/5 blur-3xl rounded-l-full -z-0" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Varför jobba hos oss?</h2>
            <p className="text-text-secondary text-lg">
              Vi tar hand om vårt team lika bra som vi tar hand om våra kunder.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="group bg-bg-primary rounded-3xl p-8 border border-transparent hover:border-cta-hover/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-cta-hover flex items-center justify-center mb-6 transition-colors duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <p.icon className="w-7 h-7 text-cta-hover group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lediga tjänster – bild-kort */}
      <section id="tjanster" className="section-spacing bg-bg-primary scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-cta-hover/10 blur-3xl rounded-full -z-0" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              Lediga tjänster
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Hitta din roll</h2>
            <p className="text-text-secondary text-lg">
              Klicka på en tjänst för att söka – eller gör en spontanansökan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r, i) => (
              <motion.button
                type="button"
                key={r.id}
                onClick={() => applyFor(r.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -8 }}
                className="group relative text-left rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 h-80"
              >
                <img
                  src={r.image}
                  alt={r.id}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[900ms] ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-500" />

                <span className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <r.icon className="w-6 h-6 text-white" />
                </span>
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-green-500/90 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Öppen
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-text-light">
                  <h3 className="text-2xl font-bold mb-1 drop-shadow">{r.id}</h3>
                  <p className="text-text-light/85 text-sm leading-relaxed mb-4 drop-shadow">{r.desc}</p>
                  <span className="inline-flex items-center gap-2 font-bold text-cta-hover group-hover:gap-3 transition-all">
                    Sök tjänsten <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            ))}

            {/* Spontanansökan-kort */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl overflow-hidden bg-bg-dark text-text-light p-8 flex flex-col justify-center h-80 shadow-md"
            >
              <div aria-hidden className="pointer-events-none absolute -top-10 -right-8 w-48 h-48 rounded-full bg-cta-hover/25 blur-2xl" />
              <Sparkles className="w-10 h-10 text-cta-hover mb-4 relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">Hittar du ingen passande roll?</h3>
              <p className="text-text-light/75 mb-6 relative z-10">
                Vi vill ändå gärna höra från dig. Skicka en spontanansökan så hör vi av oss
                när något dyker upp.
              </p>
              <button
                type="button"
                onClick={() => applyFor("Spontanansökan")}
                className="inline-flex items-center gap-2 font-bold text-cta-hover hover:text-white transition-colors relative z-10 self-start"
              >
                Gör en spontanansökan <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ansökningsformulär */}
      <section id="ansok" className="section-spacing bg-bg-dark text-text-light scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cta-hover/20 blur-3xl rounded-full z-0" />
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 bg-cta-hover/10 blur-3xl rounded-full z-0" />
        <div className="container-custom max-w-2xl mx-auto relative z-10">
          {state === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-text-primary rounded-3xl p-10 text-center shadow-2xl">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">Tack för din ansökan!</h2>
              <p className="text-text-secondary text-lg max-w-md mx-auto">
                Vi har tagit emot den och hör av oss så snart vi kan. Lycka till!
              </p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
                  Ansök
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">Skicka din ansökan</h2>
                <p className="text-text-light/70 text-lg">
                  Fyll i formuläret och bifoga gärna ditt CV. Det tar bara någon minut.
                </p>
              </div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit}
                className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl border-t-4 border-cta-hover space-y-5"
              >
                <div>
                  <label className={labelClass}>Tjänst du söker</label>
                  <select name="role" value={role} onChange={(e) => setRole(e.target.value)}
                    className={`${inputClass} cursor-pointer`}>
                    {ROLES.map((r) => <option key={r.id}>{r.id}</option>)}
                    <option>Spontanansökan</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Namn *</label>
                    <input name="Namn" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>E-post *</label>
                    <input type="email" name="E-post" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefon *</label>
                    <input type="tel" name="Telefon" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ort / område</label>
                    <input name="Ort" placeholder="Ex: Solna" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Kan börja</label>
                    <input name="Kan börja" placeholder="Ex: omgående" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Din erfarenhet</label>
                    <textarea name="Erfarenhet" rows={3}
                      placeholder="Berätta kort om din erfarenhet som är relevant för tjänsten."
                      className={`${inputClass} resize-none`} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Berätta lite om dig själv</label>
                    <textarea name="Om mig" rows={4}
                      placeholder="Vem är du, och varför vill du jobba hos Stodona?"
                      className={`${inputClass} resize-none`} />
                  </div>
                </div>

                {/* Bilagor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Ladda upp CV (frivilligt)</label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 bg-bg-primary/60 cursor-pointer hover:border-cta-hover transition-colors">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary shrink-0">
                        <Upload className="w-4 h-4 text-cta-hover" /> Välj fil
                      </span>
                      <span className="text-sm text-text-secondary truncate">{cvName || "PDF eller Word"}</span>
                      <input type="file" name="CV" accept=".pdf,.doc,.docx,.rtf,.txt,application/pdf" className="hidden" onChange={checkFile(setCvName)} />
                    </label>
                  </div>
                  <div>
                    <label className={labelClass}>Ladda upp foto (frivilligt)</label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-text-primary/20 bg-bg-primary/60 cursor-pointer hover:border-cta-hover transition-colors">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary shrink-0">
                        <Upload className="w-4 h-4 text-cta-hover" /> Välj fil
                      </span>
                      <span className="text-sm text-text-secondary truncate">{photoName || "JPG eller PNG"}</span>
                      <input type="file" name="Foto" accept="image/*" className="hidden" onChange={checkFile(setPhotoName)} />
                    </label>
                  </div>
                  {fileError && <p className="sm:col-span-2 text-red-500 text-sm">{fileError}</p>}
                  <p className="sm:col-span-2 text-xs text-text-secondary">Max 10 MB per fil.</p>
                </div>

                <button type="submit" disabled={state === "submitting"}
                  className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {state === "submitting" ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Skicka ansökan <ArrowRight className="w-5 h-5" /></>}
                </button>
                <p className="text-xs text-center text-text-secondary flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cta-hover" />
                  Dina uppgifter hanteras tryggt enligt vår{" "}
                  <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                </p>
              </motion.form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
