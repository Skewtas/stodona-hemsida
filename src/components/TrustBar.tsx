import { Star, ShieldCheck, BadgePercent, Clock } from "lucide-react";

// Kompakt trygghetsrad att placera nära boknings-CTA:er. Betyget 4.9/5 är
// verifierat och får visas.
export default function TrustBar({ className = "", light = false }: { className?: string; light?: boolean }) {
  const base = light ? "text-text-light/85" : "text-text-secondary";
  const items = [
    {
      el: (
        <span className="inline-flex items-center gap-1.5">
          <span className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
          </span>
          4.9/5
        </span>
      ),
    },
    { el: <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cta-hover" /> Ansvarsförsäkrade</span> },
    { el: <span className="inline-flex items-center gap-1.5"><BadgePercent className="w-4 h-4 text-cta-hover" /> RUT dras direkt</span> },
    { el: <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-cta-hover" /> Ingen bindningstid</span> },
  ];
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium ${base} ${className}`}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-5">
          {i > 0 && <span className="text-current opacity-30">·</span>}
          {it.el}
        </span>
      ))}
    </div>
  );
}
