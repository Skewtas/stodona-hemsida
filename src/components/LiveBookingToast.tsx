import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

const bookings = [
  { name: 'Mikael', area: 'Bromma', service: 'hemstädning', time: 'precis' },
  { name: 'Sofia', area: 'Ekerö', service: 'flyttstädning', time: 'för 2 min sedan' },
  { name: 'Anna', area: 'Nacka', service: 'fönsterputsning', time: 'för 5 min sedan' },
  { name: 'Johan', area: 'Lidingö', service: 'storstädning', time: 'precis' },
  { name: 'Elin', area: 'Stockholm', service: 'hemstädning', time: 'för 10 min sedan' },
];

export default function LiveBookingToast() {
  const [currentBooking, setCurrentBooking] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initial delay before showing the first toast
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 8000);

    // Interval to cycle through bookings every 30 seconds
    const intervalTimer = setInterval(() => {
      setVisible(false);
      
      setTimeout(() => {
        setCurrentBooking((prev) => (prev + 1) % bookings.length);
        setVisible(true);
      }, 1000); // 1 second gap between hide and show new
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Auto-hide the toast after 6 seconds
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (visible) {
      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 6000);
    }
    return () => clearTimeout(hideTimer);
  }, [visible]);

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
                <strong className="text-white">{bookings[currentBooking].name}</strong> i {bookings[currentBooking].area} bokade precis {bookings[currentBooking].service}.
              </p>
              <p className="text-xs text-text-light/50 mt-1">
                {bookings[currentBooking].time}
              </p>
            </div>
            <button 
              onClick={() => setVisible(false)}
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
