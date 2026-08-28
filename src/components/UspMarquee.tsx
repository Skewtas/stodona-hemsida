import { Star, ShieldCheck, BadgePercent, CheckCircle2, Clock, Leaf, Repeat, Zap } from "lucide-react";

// USP:ar som scrollar oändligt under heron – bygger köplust och förtroende.
const USPS = [
  { icon: Star, text: "4,9 / 5 i snittbetyg" },
  { icon: ShieldCheck, text: "Ansvarsförsäkrade" },
  { icon: BadgePercent, text: "RUT-avdrag – du betalar halva priset" },
  { icon: Repeat, text: "Samma städare varje gång" },
  { icon: Clock, text: "Ingen bindningstid" },
  { icon: CheckCircle2, text: "Nöjd-kund-garanti" },
  { icon: Leaf, text: "Miljövänliga produkter" },
  { icon: Zap, text: "Boka på 60 sekunder" },
];

export default function UspMarquee({ className = "" }: { className?: string }) {
  // Dubbla listan så loopen (translateX -50%) blir sömlös.
  const items = [...USPS, ...USPS];

  return (
    <div
      className={`usp-marquee bg-cta-hover text-text-primary overflow-hidden border-y border-text-primary/10 ${className}`}
      role="marquee"
      aria-label="Fördelar med att boka städning hos Stodona"
    >
      <div className="usp-track py-3">
        {items.map((u, i) => (
          <span
            key={i}
            aria-hidden={i >= USPS.length}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 text-sm sm:text-[15px] font-semibold whitespace-nowrap shrink-0"
          >
            <u.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" strokeWidth={2.2} />
            {u.text}
            <span aria-hidden className="ml-4 sm:ml-6 text-text-primary/30 select-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
