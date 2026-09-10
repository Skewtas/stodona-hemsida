import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { track } from '../utils/analytics';
import { submitLead } from '../utils/leadCapture';
import { bookingUrl } from "../utils/bookingUrl";

// `name` måste stavas exakt som tjänsten heter i bokningssystemets SERVICES –
// det är värdet som skickas som ?service=. Tidigare skickades id:t
// ("hemstadning"), som aldrig matchade och därför tappades bort.
const servicesList = [
  { id: 'hemstadning', name: 'Hemstädning', sv: 'Hemstädning', en: 'Home Cleaning' },
  { id: 'storstadning', name: 'Storstädning', sv: 'Storstädning', en: 'Deep Cleaning' },
  { id: 'flyttstadning', name: 'Flyttstädning', sv: 'Flyttstädning', en: 'Move-Out' },
  { id: 'fonsterputsning', name: 'Fönsterputsning', sv: 'Fönsterputs', en: 'Windows' },
];

export const QuickBookingWidget: React.FC<{
  /** Ersätter rutans standardrubrik med en egen. Sidor som lägger widgeten
      överst skickar in sin h1 här, så att sidans rubrik kommer först i
      dokumentet trots att rutan är ett bokningsformulär. */
  heading?: React.ReactNode;
  /** Klasserna på ytterrutan. Standard är den fristående vita panelen; sidor
      där rutan i stället ska fylla en hel hero-halva skickar in egna mått. */
  className?: string;
}> = ({ heading, className }) => {
  const { lang } = useLanguage();

  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [sqm, setSqm] = useState('');
  const [service, setService] = useState('hemstadning');

  // Fastpris – fånga leadet innan kunden lämnar för det externa bokningssystemet.
  const [showFastpris, setShowFastpris] = useState(false);
  const [fpName, setFpName] = useState('');
  const [fpPhone, setFpPhone] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpDone, setFpDone] = useState(false);

  async function handleFastpris() {
    if (!fpPhone) return;
    setFpLoading(true);
    await submitLead({
      email: '',
      phone: fpPhone,
      name: fpName,
      source: 'fastpris',
      page: `fastpris · ${service}${sqm ? ` · ${sqm} kvm` : ''}`,
    });
    setFpLoading(false);
    setFpDone(true);
  }

  // Priset hämtas från bokningssystemets prismotor via /api/calculate-price.
  // Widgeten räknade tidigare med egna kvadratmeterpriser, som drev iväg från
  // vad kunden faktiskt debiterades i nästa steg. Hellre inget pris alls än
  // ett som inte stämmer – därför visas rutan bara när svaret kommit.
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [prisLaddar, setPrisLaddar] = useState(false);
  const avbrytRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const sqmNum = parseInt(sqm, 10);
    const valdTjanst = servicesList.find((s) => s.id === service);
    if (!Number.isFinite(sqmNum) || sqmNum < 10 || sqmNum > 1000 || !valdTjanst) {
      setEstimatedPrice(null);
      setPrisLaddar(false);
      return;
    }

    setPrisLaddar(true);
    const timer = setTimeout(() => {
      avbrytRef.current?.abort();
      const ctrl = new AbortController();
      avbrytRef.current = ctrl;
      fetch('/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          service: valdTjanst.name,
          sqm: sqmNum,
          // Bokningen startar på ett enstaka tillfälle, så widgeten visar
          // samma sak – annars möts kunden av ett högre pris vid ankomst.
          frequency: 'Engång',
          postalCode: zipCode,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setEstimatedPrice(typeof d?.price === 'number' ? d.price : null))
        .catch(() => { /* tyst – rutan förblir dold */ })
        .finally(() => setPrisLaddar(false));
    }, 400); // debounce så att inte varje tangenttryck ger ett anrop

    return () => clearTimeout(timer);
  }, [sqm, service, zipCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length > 0 && !zipCode.startsWith('1')) {
      setZipError(lang === 'EN' ? 'Sorry, we only cover Stockholm manually yet' : 'Tyvärr täcker vi bara Stockholm just nu');
      return;
    }
    const valdTjanst = servicesList.find(s => s.id === service);
    track("booking_widget_submit", { service, sqm, estimated_price: estimatedPrice ?? undefined });
    // bookingUrl lägger till influencerreferensen utan att röra service/zip/sqm.
    window.location.href = bookingUrl({ service: valdTjanst?.name, zip: zipCode, sqm });
  };

  return (
    // Samma formspråk som hero-rutan på startsidan: ljus panel med skarpa
    // hörn, fyrkantiga tjänstknappar, fält med enhetssuffix och en mörk
    // versalknapp.
    <div className={className ?? 'bg-white p-8 sm:p-10 md:p-12 shadow-2xl w-full'}>
      <span className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-cta-hover/35 text-text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
        <Star className="w-3.5 h-3.5 fill-current text-accent" />
        {lang === 'EN' ? '4.9 out of 5 average rating' : '4,9 av 5 i snittbetyg'}
      </span>

      {heading ?? (
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-text-primary mb-6">
          {lang === 'EN' ? 'Book your cleaning' : 'Boka din städning'}
          <br />
          <span className="italic font-normal text-accent-deep">
            {lang === 'EN' ? 'in 60 seconds' : 'på 60 sekunder'}
          </span>
        </h2>
      )}

      <form onSubmit={handleSubmit}>
        <span className="block text-text-secondary text-base sm:text-lg mb-3">
          {lang === 'EN' ? 'What do you need help with?' : 'Vad behöver du hjälp med?'}
        </span>
        <div className="flex flex-wrap gap-2 mb-6" role="group">
          {servicesList.map((s) => {
            const vald = service === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setService(s.id)}
                aria-pressed={vald}
                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                  vald
                    ? 'bg-text-primary text-bg-primary border-text-primary'
                    : 'bg-bg-primary/60 text-text-secondary border-text-primary/15 hover:border-accent hover:text-text-primary'
                }`}
              >
                {lang === 'EN' ? s.en : s.sv}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="widget-sqm" className="block text-text-secondary text-base sm:text-lg mb-3">
              {lang === 'EN' ? 'How many sqm?' : 'Hur många kvm?'}
            </label>
            <div className="relative">
              <input
                id="widget-sqm"
                type="number"
                inputMode="numeric"
                required
                min="10"
                max="1000"
                placeholder="70"
                value={sqm}
                onChange={(e) => setSqm(e.target.value)}
                className="w-full bg-white border border-text-primary/15 pl-4 pr-12 py-4 text-lg font-medium text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium pointer-events-none">
                kvm
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="widget-zip" className="block text-text-secondary text-base sm:text-lg mb-3">
              {lang === 'EN' ? 'Postal code' : 'Postnummer'}
            </label>
            <input
              id="widget-zip"
              type="text"
              inputMode="numeric"
              required
              placeholder="112 34"
              value={zipCode}
              onChange={(e) => {
                setZipCode(e.target.value.replace(/\D/g, '').substring(0, 5));
                setZipError('');
              }}
              className={`w-full bg-white border px-4 py-4 text-lg font-medium text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-shadow ${
                zipError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-text-primary/15 focus:border-accent focus:ring-accent/25'
              }`}
            />
            {zipError && <p className="text-red-600 text-sm mt-2 font-medium">{zipError}</p>}
          </div>
        </div>

        {/* Prisuppskattning */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${estimatedPrice ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="border border-dashed border-accent/50 bg-accent/5 px-5 py-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-1">
                {prisLaddar
                  ? (lang === 'EN' ? 'Calculating…' : 'Räknar ut…')
                  : (lang === 'EN' ? 'Your price' : 'Ditt pris')}
              </p>
              <span className="font-display text-3xl font-bold tracking-tight text-text-primary">
                {estimatedPrice?.toLocaleString('sv-SE')} kr
              </span>
            </div>
            <span className="text-sm text-text-secondary">
              {lang === 'EN' ? 'after RUT' : 'efter RUT'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
        >
          {lang === 'EN' ? 'See exact price and book' : 'Se exakt pris och boka'}
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Fastpris – fånga leadet innan avhopp till det externa systemet */}
        <div className="mt-8 border-t border-text-primary/10 pt-6">
          {fpDone ? (
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <ShieldCheck className="w-4 h-4" />
              {lang === 'EN' ? 'Thanks! We will call you with a fixed price.' : 'Tack! Vi ringer dig med ett fast pris.'}
            </p>
          ) : !showFastpris ? (
            <button
              type="button"
              onClick={() => setShowFastpris(true)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary underline underline-offset-4"
            >
              {lang === 'EN' ? 'Prefer a fixed price? We’ll call you' : 'Vill du ha fast pris? Vi ringer dig'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={fpName}
                onChange={(e) => setFpName(e.target.value)}
                placeholder={lang === 'EN' ? 'Name' : 'Namn'}
                className="flex-1 bg-white border border-text-primary/15 px-4 py-3 text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-shadow"
              />
              <input
                type="tel"
                value={fpPhone}
                onChange={(e) => setFpPhone(e.target.value)}
                placeholder={lang === 'EN' ? 'Phone *' : 'Telefon *'}
                className="flex-1 bg-white border border-text-primary/15 px-4 py-3 text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-shadow"
              />
              <button
                type="button"
                onClick={handleFastpris}
                disabled={fpLoading}
                className="bg-text-primary text-bg-primary px-6 py-3 font-bold tracking-wide uppercase text-xs hover:bg-accent-deep transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {fpLoading ? (lang === 'EN' ? 'Sending…' : 'Skickar…') : (lang === 'EN' ? 'Call me' : 'Ring mig')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-6 text-sm text-text-secondary">
            <span>{lang === 'EN' ? 'Price based on size – or a fixed price.' : 'Priset baseras på bostadens storlek – eller fast pris.'}</span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              {lang === 'EN' ? '100 % satisfaction guarantee' : '100 % nöjdgaranti'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
