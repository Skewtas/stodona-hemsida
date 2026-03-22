import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag: (...args: unknown[]) => void;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted') {
      enableAnalytics();
    }
    // If 'declined', GA4 stays disabled
  }, []);

  function enableAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  }

  function disableAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  }

  function handleAccept() {
    localStorage.setItem('cookie-consent', 'accepted');
    enableAnalytics();
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem('cookie-consent', 'declined');
    disableAnalytics();
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-bg-dark text-text-light rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 border border-white/10">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
              <div>
                <p className="text-sm leading-relaxed">
                  Vi använder cookies för att förbättra din upplevelse och analysera trafik via Google Analytics.
                  Läs mer i vår{' '}
                  <a href="/integritetspolicy" className="text-cta-hover underline hover:no-underline">
                    integritetspolicy
                  </a>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
              >
                Avböj
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold rounded-xl bg-cta-hover text-text-primary hover:brightness-110 transition-all"
              >
                Acceptera
              </button>
            </div>
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 md:hidden text-white/50 hover:text-white"
              aria-label="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
