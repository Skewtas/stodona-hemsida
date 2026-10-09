import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { submitLead } from "../utils/leadCapture";

// Kort offertformulär för bostadsrättsföreningar och fastighetsägare: fyra
// fält, inget mer. Förfrågan mejlas via /api/lead (källa "brf_offert").
// Ligger på /fastigheter-brf, /trappstadning och /brf-offert. Knappar som ska
// leda hit länkar till #offert – nyhetsbrevet länkar till
// /fastigheter-brf#offert.

export const OFFERT_ANKARE = "offert";

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70";

export default function BrfOffertForm({ sida }: { sida: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ forening: "", name: "", phone: "", email: "", webbplats: "" });

  // Sidorna laddas i efterhand, så webbläsarens egen hopp-till-ankare hinner
  // inte hitta formuläret. Rulla dit när det väl finns.
  useEffect(() => {
    if (window.location.hash !== `#${OFFERT_ANKARE}`) return;
    // Två försök: bilder och sektioner ovanför kan ändra höjd efter första.
    const rulla = () => document.getElementById(OFFERT_ANKARE)?.scrollIntoView({ behavior: "auto", block: "start" });
    const t = [250, 1200].map((ms) => window.setTimeout(rulla, ms));
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

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
      page: sida,
      notes: `Förening: ${form.forening.trim()}\nKontaktperson: ${form.name.trim()}`.slice(0, 400),
    });
    setLoading(false);
    if (res.success) setDone(true);
    else setError("Det gick inte att skicka just nu. Försök igen, eller ring 010-178 01 50.");
  }

  return (
    <div id={OFFERT_ANKARE} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl scroll-mt-32 text-left text-text-primary">
      {done ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-14 h-14 text-cta-hover mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Tack! Vi hör av oss.</h3>
          <p className="text-text-secondary">
            Vi har tagit emot er förfrågan och kontaktar er inom kort. Brådskar det når ni oss på{" "}
            <a href="tel:0101780150" className="underline font-semibold">010-178 01 50</a>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="offert-forening" className="block text-sm font-semibold mb-1.5">Föreningens namn</label>
            <input id="offert-forening" name="forening" value={form.forening} onChange={update} className={inputClass} placeholder="BRF Exempelgården" autoComplete="organization" required />
          </div>
          <div>
            <label htmlFor="offert-name" className="block text-sm font-semibold mb-1.5">Kontaktperson</label>
            <input id="offert-name" name="name" value={form.name} onChange={update} className={inputClass} placeholder="För- och efternamn" autoComplete="name" required />
          </div>
          <div>
            <label htmlFor="offert-phone" className="block text-sm font-semibold mb-1.5">Telefonnummer</label>
            <input id="offert-phone" name="phone" type="tel" value={form.phone} onChange={update} className={inputClass} placeholder="070-123 45 67" autoComplete="tel" required />
          </div>
          <div>
            <label htmlFor="offert-email" className="block text-sm font-semibold mb-1.5">Mejl</label>
            <input id="offert-email" name="email" type="email" value={form.email} onChange={update} className={inputClass} placeholder="styrelsen@forening.se" autoComplete="email" required />
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
  );
}
