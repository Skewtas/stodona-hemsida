import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift } from 'lucide-react';
import { submitLead, hasSeenPopup, markPopupSeen } from '../utils/leadCapture';

// Single discount popup (15% rabatt / VLKMN15). Fires on whichever trigger comes
// first — a timed welcome or exit intent — and shows once per 7 days, so the two
// offers never stack. The trigger is recorded only to attribute the lead source.
type Trigger = 'welcome' | 'exit';

const COPY: Record<Trigger, { heading: string; sub: React.ReactNode; cta: string }> = {
  welcome: {
    heading: 'Välkommen till Stodona!',
    sub: <>Boka din första städning idag och få <strong className="text-cta-hover">15% rabatt</strong></>,
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
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-8 text-center text-text-light overflow-hidden">
              <img
                src="/stodona_right_image.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-bg-dark/80" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-cta-hover/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Gift className="w-8 h-8 text-cta-hover" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{copy.heading}</h2>
                <p className="text-sm text-text-light/70">{copy.sub}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Din e-postadress *"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ditt telefonnummer"
                      className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-bg-dark text-text-light font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Skickar...' : copy.cta}
                  </button>
                  <p className="text-xs text-text-secondary text-center">
                    Vi delar aldrig din information. Läs vår{' '}
                    <a href="/integritetspolicy" className="text-cta-hover underline">integritetspolicy</a>.
                  </p>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold mb-1">Tack!</h3>
                  <p className="text-text-secondary text-sm mb-6">
                    Här är din personliga rabattkod:
                  </p>
                  <div className="bg-bg-dark rounded-2xl py-5 px-8 inline-block shadow-lg">
                    <span className="text-3xl font-bold tracking-[0.2em] text-cta-hover">VLKMN15</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-5">
                    Ange koden vid <a href="https://boka.stodona.se" className="text-cta-hover font-medium hover:underline">bokning</a> för 15% rabatt
                  </p>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-text-light transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
