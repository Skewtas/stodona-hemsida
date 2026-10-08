import { ArrowRight } from "lucide-react";
import { ERBJUDANDE } from "../data/kampanj";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";

/**
 * Erbjudanderutan i startsidans hero: "Testa oss med 15 % rabatt".
 * En kompakt ruta i accentfärgen med procentsatsen stort och rabattkoden
 * utskriven. Knappen tar besökaren till bokningen med koden ifylld.
 */
export default function KampanjKort({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-accent-deep text-white rounded-xl p-5 w-full max-w-[19rem] self-start ${className}`}>
      <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/85">Testa oss med</p>
      <p className="mt-1.5 font-display tracking-tight text-[2.75rem] font-bold leading-none whitespace-nowrap">
        {ERBJUDANDE.procent} % <em className="font-normal">rabatt</em>
      </p>
      <div className="mt-4 flex items-stretch gap-2">
        <p className="flex-1 flex flex-col justify-center border-2 border-dashed border-white/70 rounded-lg px-3 py-1.5">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/85">Rabattkod</span>
          <span className="text-xl font-bold tracking-[0.12em] leading-tight">{ERBJUDANDE.kod}</span>
        </p>
        <a
          href={bookingUrl({ discountCode: ERBJUDANDE.kod })}
          onClick={() => track("booking_start", { source: "erbjudandekort" })}
          className="shrink-0 inline-flex items-center gap-1.5 bg-white text-text-primary rounded-lg px-4 text-sm font-bold hover:bg-bg-primary transition-colors"
        >
          Boka <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
