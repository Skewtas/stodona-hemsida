import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { claimOverlay, releaseOverlay, whenCookieBannerAnswered } from '../utils/overlays';

// Visar de senaste RIKTIGA bokningarna från /api/recent-bookings – förnamn och
// tjänst, inget annat. Finns inga bokningar visas ingenting alls; komponenten
// hittar aldrig på data.

type Booking = { firstName: string; service: string; ts: string };

function relativeTime(ts: string): string {
  const minutes = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (minutes < 2) return 'precis nu';
  if (minutes < 60) return `för ${minutes} min sedan`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? 'för en timme sedan' : `för ${hours} timmar sedan`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'igår' : `för ${days} dagar sedan`;
}

export default function LiveBookingToast() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  // Hämta riktiga bokningar först när cookiebannern är besvarad.
  useEffect(() => {
    let cancelled = false;
    const stop = whenCookieBannerAnswered(() => {
      fetch('/api/recent-bookings')
        .then((res) => (res.ok ? res.json() : { bookings: [] }))
        .then((data) => {
          if (!cancelled && Array.isArray(data.bookings)) setBookings(data.bookings);
        })
        .catch(() => {
          /* tyst – utan data visas ingen toast */
        });
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  // Visa en i taget, och bara när inget annat lager har platsen.
  useEffect(() => {
    if (bookings.length === 0) return;

    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      if (!claimOverlay('booking-toast')) return; // rabattpopupen går före
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        releaseOverlay('booking-toast');
      }, 6000);
    };

    const initialTimer = setTimeout(show, 12000);
    const cycle = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bookings.length);
      show();
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearInterval(cycle);
      releaseOverlay('booking-toast');
    };
  }, [bookings.length]);

  function dismiss() {
    setVisible(false);
    releaseOverlay('booking-toast');
  }

  const booking = bookings[current];
  if (!booking) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[9000] max-w-sm"
        >
          <div className="bg-bg-dark/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-cta-hover/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-cta-hover" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-text-light text-sm font-medium leading-tight">
                <strong className="text-white">{booking.firstName}</strong> bokade {booking.service}.
              </p>
              <p className="text-xs text-text-light/50 mt-1">{relativeTime(booking.ts)}</p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Stäng"
              className="absolute top-2 right-2 p-1 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
