import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { KAMPANJ, useKampanj } from "../data/kampanj";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";

/**
 * Kampanjkortet högst upp på startsidan: "30 % på varje städning året ut".
 * Knappen tar besökaren till bokningen med hemstädning och koden ifylld.
 */
export default function KampanjKort({ className = "" }: { className?: string }) {
  const { aktiv, dagar } = useKampanj();
  if (!aktiv) return null;
  return (
    <div className={`bg-bg-dark text-text-light rounded-2xl p-5 sm:p-6 ${className}`}>
      <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-cta-hover mb-2">
        Kampanj{dagar !== null && ` · ${dagar} ${dagar === 1 ? "dag" : "dagar"} kvar`}
      </p>
      <p className="font-display tracking-tight text-[1.75rem] sm:text-3xl font-bold leading-[1.1]">
        {KAMPANJ.procent} % på varje städning <em className="font-normal text-accent">året ut.</em>
      </p>
      <p className="mt-2.5 mb-4 text-sm text-text-light/80 leading-relaxed">
        Städabonnemang med 6 eller 12 månaders bindning. Samma städare varje gång, 100 % nöjd-kund-garanti.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <a
          href={bookingUrl({ service: "Hemstädning", discountCode: KAMPANJ.kod })}
          onClick={() => track("booking_start", { source: "kampanjkort", service: "Hemstädning" })}
          className="inline-flex items-center gap-2 bg-white text-text-primary rounded-full px-5 py-3 text-sm font-bold hover:bg-cta-hover transition-colors"
        >
          Boka med koden {KAMPANJ.kod} <ArrowRight className="w-4 h-4" />
        </a>
        <Link to={KAMPANJ.sida} className="text-sm text-text-light/80 underline underline-offset-4 hover:text-text-light">
          Villkor
        </Link>
      </div>
    </div>
  );
}
