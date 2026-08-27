import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles } from 'lucide-react';
import { submitLead, hasSeenPopup, markPopupSeen } from '../utils/leadCapture';

// Single discount popup (15% rabatt / VLKMN15). Fires on whichever trigger comes
// first — a timed welcome or exit intent — and shows once per 7 days, so the two
// offers never stack. The trigger is recorded only to attribute the lead source.
type Trigger = 'welcome' | 'exit';

const COPY: Record<Trigger, { heading: string; sub: React.ReactNode; cta: string }> = {
  welcome: {
    heading: 'Dags att boka städning? 🧼🤍',
    sub: <>Ta <strong className="text-cta-hover">15% rabatt</strong> på din första städning hos oss – bara att fylla i.</>,
    cta: 'Få min rabattkod →',
  },
  exit: {
    heading: 'Vänta lite!',
    sub: <>Få <strong className="text-cta-hover">15% rabatt</strong> på din första städning innan du går</>,
    cta: 'Ja, ge mig 15% rabatt!',
  },
};

export default function DiscountPopup() {
  const [visible, setVisible] = useState(false);
  const [trigger, setTrigger] = useState<Trigger>('welcome');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const fired = useRef(false);

  useEffect(() => {
    if (hasSeenPopup('discount')) return;

    const cleanups: Array<() => void> = [];

    const fire = (reason: Trigger) => {
      if (fired.current || hasSeenPopup('discount')) return;
      fired.current = true;
      setTrigger(reason);
      setVisible(true);
    };

    // Only arm triggers once the cookie banner has been answered, so overlays
    // never stack on the consent banner.
    const start = () => {
      const welcomeTimer = setTimeout(() => fire('welcome'), 6000);

      let lastScrollY = window.scrollY;
      let isScrollingDown = false;
      const handleScroll = () => {
        isScrollingDown = window.scrollY > lastScrollY;
        lastScrollY = window.scrollY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      const handleMouseLeave = (e: MouseEvent) => {
        if (isScrollingDown) return;
        if (e.clientY <= 20 && e.relatedTarget === null) fire('exit');
      };
      const exitTimer = setTimeout(() => {
        document.addEventListener('mouseleave', handleMouseLeave);
      }, 5000);

      cleanups.push(() => {
        clearTimeout(welcomeTimer);
        clearTimeout(exitTimer);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mouseleave', handleMouseLeave);
      });
    };

    let poll: ReturnType<typeof setInterval> | undefined;
    if (localStorage.getItem('cookie-consent')) {
      start();
    } else {
      poll = setInterval(() => {
        if (localStorage.getItem('cookie-consent')) {
          clearInterval(poll);
          start();
        }
      }, 500);
    }

    return () => {
      if (poll) clearInterval(poll);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  function handleClose() {
    markPopupSeen('discount');
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await submitLead({ email, phone, source: trigger === 'exit' ? 'exit_intent' : 'welcome_popup' });
    setLoading(false);
    setSubmitted(true);
    markPopupSeen('discount');
    setTimeout(() => setVisible(false), 3000);
  }

  const copy = COPY[trigger];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-gradient-to-b from-white via-white to-bg-primary/40 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Stäng */}
            <button
              onClick={handleClose}
              aria-label="Stäng"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-text-primary/5 hover:bg-text-primary/10 text-text-secondary hover:text-text-primary transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Varm accent-topp */}
            <div className="h-1.5 bg-gradient-to-r from-cta-hover via-cta-hover/60 to-cta-hover" />
            {/* Mjuk glöd för liv */}
            <div aria-hidden className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-cta-hover/25 blur-3xl" />

            {!submitted ? (
              <div className="relative px-8 pt-9 pb-8">
                {/* Rabatt-pill */}
                <div className="flex justify-center mb-5">
                  <span className="inline-flex items-center gap-1.5 bg-cta-hover/20 text-text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-cta-hover/30">
                    <Sparkles className="w-3.5 h-3.5 text-cta-hover" /> Spara 15%
                  </span>
                </div>

                {/* Badge med glöd */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div aria-hidden className="absolute inset-0 rounded-2xl bg-cta-hover/40 blur-xl" />
                  <div className="relative w-16 h-16 rounded-2xl bg-cta-hover flex items-center justify-center shadow-lg shadow-cta-hover/40 ring-4 ring-cta-hover/15">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-[28px] leading-tight font-bold text-center mb-2">
                  {copy.heading}
                </h2>
                <p className="text-text-secondary text-center mb-7 leading-relaxed">
                  {copy.sub}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Din e-postadress *"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ditt telefonnummer"
                    className="w-full px-4 py-3.5 rounded-xl border border-text-primary/10 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/60 focus:border-cta-hover/40 transition-all placeholder:text-text-secondary/70"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-text-primary text-bg-primary font-bold rounded-xl hover:bg-cta-hover hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Skickar…' : copy.cta}
                  </button>
                </form>

                <p className="text-xs text-text-secondary/80 text-center mt-4">
                  Vi delar aldrig din information. Läs vår{' '}
                  <a href="/integritetspolicy" className="text-cta-hover underline hover:text-text-primary">integritetspolicy</a>.
                </p>
              </div>
            ) : (
              <div className="px-8 pt-12 pb-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-1">Tack!</h3>
                <p className="text-text-secondary text-sm mb-6">
                  Här är din personliga rabattkod:
                </p>
                <div className="bg-bg-primary border-2 border-dashed border-cta-hover rounded-2xl py-5 px-8 inline-block">
                  <span className="text-3xl font-bold tracking-[0.25em] text-text-primary">VLKMN15</span>
                </div>
                <p className="text-sm text-text-secondary mt-5">
                  Ange koden vid <a href="https://boka.stodona.se" className="text-cta-hover font-medium hover:underline">bokning</a> för 15% rabatt.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
