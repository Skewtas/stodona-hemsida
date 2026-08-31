import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Upload, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { JOBS } from "../jobsData";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";
const labelClass = "block text-sm font-medium mb-2";

export default function JobApplicationForm({
  defaultRole = "Hemstädare",
  lockRole = false,
}: {
  defaultRole?: string;
  lockRole?: boolean;
}) {
  const [state, setState] = useState<"idle" | "submitting" | "success">("idle");
  const [role, setRole] = useState(defaultRole);
  const [cvName, setCvName] = useState("");
  const [fileError, setFileError] = useState("");

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
    const chosen = lockRole ? defaultRole : role;
    const fd = new FormData(form);
    fd.append("Tjänst", chosen);

    // 1) Primärt: vår egen endpoint som mejlar ansökan + CV-bilaga till info@stodona.se.
    try {
      const res = await fetch("/api/job-application", { method: "POST", body: fd });
      if (res.ok) {
        setState("success");
        form.reset();
        setCvName("");
        return;
      }
      // 501 = Resend ej konfigurerad → falla tillbaka nedan. Andra fel loggas.
      if (res.status !== 501) throw new Error(`status ${res.status}`);
    } catch (err) {
      // Nätverksfel eller endpoint saknas – fortsätt till fallback.
      console.error("job-application endpoint:", err);
    }

    // 2) Fallback: skicka åtminstone kontaktuppgifterna (utan fil) till Formspree,
    //    så en ansökan aldrig går förlorad. Sökanden ombeds mejla CV separat.
    try {
      const res = await fetch("https://formspree.io/f/xojkdewo", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          Namn: fd.get("Namn"),
          "E-post": fd.get("E-post"),
          Ort: fd.get("Ort"),
          Tjänst: chosen,
          _subject: `Jobbansökan: ${chosen}`,
          OBS: "CV kunde ej bifogas automatiskt – be sökande mejla sitt CV till info@stodona.se.",
        }),
      });
      if (res.ok) {
        setState("success");
        form.reset();
        setCvName("");
        return;
      }
      throw new Error("formspree fallback");
    } catch {
      setState("idle");
      alert("Något gick fel. Försök igen eller mejla din ansökan direkt till info@stodona.se.");
    }
  }

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white text-text-primary rounded-3xl p-10 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h3 className="text-3xl font-bold mb-3">Tack för din ansökan!</h3>
        <p className="text-text-secondary text-lg max-w-md mx-auto">
          Vi har tagit emot den och hör av oss så snart vi kan. Lycka till!
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-text-primary rounded-3xl p-6 sm:p-8 shadow-2xl border-t-4 border-cta-hover space-y-5"
    >
      {lockRole ? (
        <div className="flex items-center justify-between gap-3 bg-bg-primary rounded-xl px-4 py-3">
          <span className="text-sm text-text-secondary">Du söker</span>
          <span className="font-bold">{defaultRole}</span>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Tjänst du söker</label>
          <select name="role_select" value={role} onChange={(e) => setRole(e.target.value)}
            className={`${inputClass} cursor-pointer`}>
            {JOBS.map((j) => <option key={j.slug}>{j.title}</option>)}
            <option>Spontanansökan</option>
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Namn *</label>
        <input name="Namn" required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>E-post *</label>
          <input type="email" name="E-post" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ort</label>
          <input name="Ort" placeholder="Ex: Solna" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Ladda upp CV</label>
        <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-text-primary/20 bg-bg-primary/60 cursor-pointer hover:border-cta-hover transition-colors">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary shrink-0">
            <Upload className="w-4 h-4 text-cta-hover" /> Välj fil
          </span>
          <span className="text-sm text-text-secondary truncate">{cvName || "PDF eller Word (max 10 MB)"}</span>
          <input type="file" name="CV" accept=".pdf,.doc,.docx,.rtf,.txt,application/pdf" className="hidden" onChange={checkFile(setCvName)} />
        </label>
        {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
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
    </form>
  );
}
