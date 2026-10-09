import { useState } from 'react';
import { Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { submitLead } from '../utils/leadCapture';
import { bookingUrl } from "../utils/bookingUrl";
import { useActiveOverlay } from '../utils/overlays';
import { KAMPANJ, ERBJUDANDE } from '../data/kampanj';

export default function StickyCTA() {
  const activeOverlay = useActiveOverlay();
  // Knappen lovar det stående erbjudandet (15 %) och tar med koden in i
  // bokningen. Bara på 30 %-kampanjens egna sidor lovar den kampanjen.
  const { pathname } = useLocation();
  const kampanj = pathname === '/kampanj' || pathname === '/h007' || pathname === '/tretti';
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    await submitLead({ email: '', phone, source: 'sticky_cta' });
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  // Ligg lågt medan rabattpopupen täcker skärmen.
  if (activeOverlay === 'discount') return null;

  // En svävande kapsel i stället för en list kant i kant: mörkt glas med
  // skugga, erbjudandet till vänster och en tydlig bokningsknapp till höger.
  const kapsel = "fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[9990] md:hidden rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  if (submitted) {
    return (
      <div className={`${kapsel} bg-green-600 text-white py-4 px-5`}>
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Tack! Vi ringer dig snart.
        </div>
      </div>
    );
  }

  const procent = kampanj ? KAMPANJ.procent : ERBJUDANDE.procent;
  const kod = kampanj ? KAMPANJ.kod : ERBJUDANDE.kod;

  return (
    <div className={`${kapsel} bg-bg-dark/90 backdrop-blur-md ring-1 ring-white/10 p-1.5`}>
      <div className="flex items-center gap-1.5">
        {!showInput ? (
          <>
            <button
              onClick={() => setShowInput(true)}
              className="shrink-0 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-text-light hover:bg-white/20 transition-colors"
              aria-label="Ring mig"
            >
              <Phone className="w-[18px] h-[18px]" />
            </button>
            <a
              href={kampanj ? bookingUrl({ service: 'Hemstädning', discountCode: KAMPANJ.kod }) : bookingUrl({ discountCode: ERBJUDANDE.kod })}
              className="group flex-1 min-w-0 flex items-center justify-between gap-3 pl-2"
            >
              <span className="min-w-0 leading-tight">
                <span className="block text-text-light text-[15px] font-bold whitespace-nowrap">
                  {procent} % {kampanj ? 'året ut' : 'rabatt'}
                </span>
                <span className="block text-text-light/60 text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap">
                  Kod {kod}
                </span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-accent text-white text-[15px] font-bold group-active:scale-95 transition-transform">
                Boka nu <ArrowRight className="w-4 h-4" />
              </span>
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ditt telefonnummer"
              required
              autoFocus
              className="flex-1 min-w-0 h-11 px-4 rounded-full bg-white/10 border border-white/10 text-text-light placeholder:text-text-light/40 focus:outline-none focus:ring-2 focus:ring-accent/60 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 h-11 px-5 bg-accent text-white font-bold rounded-full text-sm whitespace-nowrap disabled:opacity-50"
            >
              {loading ? '...' : 'Ring mig'}
            </button>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              aria-label="Stäng"
              className="shrink-0 w-9 h-11 text-text-light/60 text-sm"
            >
              ✕
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
