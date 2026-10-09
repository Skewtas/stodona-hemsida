import { useState } from "react";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { submitLead } from "../utils/leadCapture";

// Kort offertformulär för bostadsrättsföreningar. Hit länkar knappen
// "Begär offert" i nyhetsbrevet till BRF:er. Fyra fält, inget mer –
// förfrågan mejlas till info@stodona.se via /api/lead.

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";

const LOFTEN = ["Testa oss helt obundet i 3 månader", "100 % nöjd-kund-garanti", "Kostnadsfritt besök i fastigheten"];

export default function BrfOffert() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ forening: "", name: "", phone: "", email: "", webbplats: "" });

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dolt fält som bara robotar fyller i.
    if (form.webbplats) {
      setDone(true);
      return;
    }
    if (!form.forening.trim() || !form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Fyll i alla fyra fälten, så hör vi av oss.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await submitLead({
      email: form.email.trim(),
      phone: form.phone.trim(),
      name: form.name.trim(),
      source: "brf_offert",
      page: "/brf-offert",
      notes: `Förening: ${form.forening.trim()}\nKontaktperson: ${form.name.trim()}`.slice(0, 400),
    });
    setLoading(false);
    if (res.success) setDone(true);
    else setError("Det gick inte att skicka just nu. Försök igen, eller ring 010-178 01 50.");
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Begär offert för er förening | Stodona</title>
        <meta name="description" content="Begär offert på städning för er bostadsrättsförening. Fyll i fyra uppgifter så hör vi av oss. Testa oss helt obundet i 3 månader." />
        <link rel="canonical" href="https://stodona.se/brf-offert" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="pt-32 pb-20 bg-bg-primary min-h-[80vh]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-xs font-bold tracking-widest uppercase mb-5">
                För bostadsrättsföreningar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Begär offert för er förening</h1>
              <p className="text-text-secondary text-lg">
                Fyll i fyra uppgifter, så hör vi av oss och bokar in ett kostnadsfritt besök.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl">
              {done ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-14 h-14 text-cta-hover mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Tack! Vi hör av oss.</h2>
                  <p className="text-text-secondary">
                    Vi har tagit emot er förfrågan och kontaktar er inom kort. Brådskar det når ni oss på{" "}
                    <a href="tel:0101780150" className="underline font-semibold">010-178 01 50</a>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="forening" className="block text-sm font-semibold mb-1.5">Föreningens namn</label>
                    <input id="forening" name="forening" value={form.forening} onChange={update} className={inputClass} placeholder="BRF Exempelgården" autoComplete="organization" required />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-1.5">Kontaktperson</label>
                    <input id="name" name="name" value={form.name} onChange={update} className={inputClass} placeholder="För- och efternamn" autoComplete="name" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-1.5">Telefonnummer</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={update} className={inputClass} placeholder="070-123 45 67" autoComplete="tel" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-1.5">Mejl</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={update} className={inputClass} placeholder="styrelsen@forening.se" autoComplete="email" required />
                  </div>
                  {/* Dolt för människor – fälls av robotar. */}
                  <input name="webbplats" value={form.webbplats} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                  {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                  <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 disabled:opacity-60">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Begär offert <ArrowRight className="w-5 h-5" /></>}
                  </button>
                  <p className="text-xs text-text-secondary text-center">
                    Vi använder uppgifterna för att kontakta er om offerten. Läs mer i vår{" "}
                    <a href="/integritetspolicy" className="underline">integritetspolicy</a>.
                  </p>
                </form>
              )}
            </div>

            <ul className="mt-8 space-y-2.5 max-w-md mx-auto">
              {LOFTEN.map((t) => (
                <li key={t} className="flex items-center gap-3 text-text-primary font-medium">
                  <ShieldCheck className="w-5 h-5 text-cta-hover shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
