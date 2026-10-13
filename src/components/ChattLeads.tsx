import { useEffect, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

/**
 * Chattens leads med status och sms-uppföljning (api/_leads.ts). Visas i
 * adminpanelen för leads. Personalen kan pausa, återuppta och stoppa
 * uppföljningen för ett lead.
 */

interface Lead {
  id: string;
  skapad: number;
  kanal: string;
  kalla?: string;
  fornamn: string;
  telefon: string;
  epost: string;
  tjanst: string;
  kvm: string;
  behov: string;
  prisKr: number | null;
  status: string;
  samtycke: boolean;
  pausad: boolean;
  steg: number;
  nasta: number | null;
  handelser: { tid: number; text: string }[];
}

const STATUS: Record<string, { text: string; farg: string }> = {
  ny: { text: "Ny förfrågan", farg: "bg-slate-100 text-slate-700" },
  pris: { text: "Fått prisförslag", farg: "bg-amber-100 text-amber-900" },
  bokning_paborjad: { text: "Bokning påbörjad", farg: "bg-blue-100 text-blue-900" },
  bokad: { text: "Bokad", farg: "bg-green-100 text-green-900" },
  nej: { text: "Nej / stoppad", farg: "bg-red-100 text-red-800" },
  avregistrerad: { text: "Avregistrerad", farg: "bg-red-100 text-red-800" },
  overlamnad: { text: "Hos kundservice", farg: "bg-purple-100 text-purple-900" },
  klar: { text: "Uppföljd klart", farg: "bg-slate-100 text-slate-600" },
};

const tid = (ms: number) => new Date(ms).toLocaleString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function ChattLeads({ losenord }: { losenord: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lage, setLage] = useState("");
  const [fel, setFel] = useState("");
  const [oppen, setOppen] = useState<string | null>(null);

  async function hamta() {
    try {
      const svar = await fetch("/api/lead-uppfoljning?lista=1", { headers: { Authorization: `Bearer ${losenord}` } });
      const data = await svar.json();
      if (!svar.ok) throw new Error(data.error || "Kunde inte hämta");
      setLeads(data.leads || []);
      setLage(data.lage || "");
      setFel("");
    } catch (f) {
      setFel(f instanceof Error ? f.message : "Kunde inte hämta chattens leads");
    }
  }

  useEffect(() => {
    hamta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [losenord]);

  async function atgard(id: string, namn: "pausa" | "ateruppta" | "stoppa") {
    await fetch("/api/lead-uppfoljning", {
      method: "POST",
      headers: { Authorization: `Bearer ${losenord}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, atgard: namn }),
    });
    hamta();
  }

  const aktiv = (l: Lead) => ["ny", "pris", "bokning_paborjad"].includes(l.status);
  const tratt = ["ny", "pris", "bokning_paborjad", "bokad"].map((s) => ({ s, antal: leads.filter((l) => l.status === s).length }));

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h2 className="text-xl font-bold text-text-primary">Chattens leads och sms-uppföljning</h2>
        <p className="text-sm text-text-secondary">
          Utskick: <strong>{lage === "pa" ? "på" : lage === "test" ? "testläge (inga sms skickas)" : "avstängt"}</strong> · {leads.length} leads
        </p>
      </div>
      {fel && <p className="text-sm text-red-700 mb-3">{fel}</p>}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {tratt.map(({ s, antal }) => (
          <span key={s} className={`px-3 py-1.5 rounded-full ${STATUS[s].farg}`}>
            {STATUS[s].text}: <strong>{antal}</strong>
          </span>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-text-secondary border-b border-text-primary/10">
            <tr>
              <th className="px-4 py-3 font-medium">Kund</th>
              <th className="px-4 py-3 font-medium">Förfrågan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uppföljning</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-text-primary/5 align-top">
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setOppen(oppen === l.id ? null : l.id)} className="font-medium text-text-primary underline-offset-2 hover:underline text-left">
                    {l.fornamn || "Okänt namn"}
                  </button>
                  <div className="text-text-secondary">{l.telefon}</div>
                  <div className="text-text-secondary">{l.epost}</div>
                  <div className="text-xs text-text-secondary/70 mt-1">{tid(l.skapad)} · {l.kanal}{l.kalla ? ` · ${l.kalla}` : ''}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{l.tjanst || "–"}{l.kvm ? `, ${l.kvm} kvm` : ""}</div>
                  {l.prisKr !== null && <div className="text-text-secondary">{l.prisKr} kr per gång</div>}
                  <div className="text-text-secondary">{l.behov}</div>
                  {oppen === l.id && (
                    <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                      {l.handelser.map((h, i) => (
                        <li key={i}>{tid(h.tid)} – {h.text}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS[l.status]?.farg ?? ""}`}>{STATUS[l.status]?.text ?? l.status}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  <div>{l.steg} av 3 sms skickade</div>
                  {!l.samtycke ? <div>Inget mobilnummer för sms</div> : l.pausad ? <div className="text-amber-800 font-medium">Pausad</div> : aktiv(l) && l.nasta ? <div>Nästa: {tid(l.nasta)}</div> : <div>Ingen fler</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {aktiv(l) && (
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => atgard(l.id, l.pausad ? "ateruppta" : "pausa")} title={l.pausad ? "Återuppta" : "Pausa"} className="p-2 rounded-lg border border-text-primary/15 hover:border-text-primary">
                        {l.pausad ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={() => atgard(l.id, "stoppa")} title="Stoppa uppföljningen" className="p-2 rounded-lg border border-text-primary/15 hover:border-red-600 hover:text-red-700">
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Inga leads från chatten än.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
