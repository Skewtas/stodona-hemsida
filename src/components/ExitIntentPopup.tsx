import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitLead, hasSeenPopup, markPopupSeen } from '../utils/leadCapture';

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !hasSeenPopup('exit')) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    // Only set up exit intent after 10 seconds on the page
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  function handleClose() {
    markPopupSeen('exit');
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await submitLead({ email, phone, source: 'exit_intent' });
    setLoading(false);
    setSubmitted(true);
    markPopupSeen('exit');
    setTimeout(() => setVisible(false), 3000);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-bg-dark p-8 text-center text-text-light">
              <AlertCircle className="w-12 h-12 text-cta-hover mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Vänta!</h2>
              <p className="text-sm opacity-90">
                Få <strong className="text-cta-hover">15% rabatt</strong> på din första städning innan du går
              </p>
            </div>

            <div className="p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Din e-postadress *"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ditt telefonnummer"
                    className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-cta-hover text-text-primary font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Skickar...' : 'Ja, ge mig 15% rabatt!'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Nej tack, jag vill betala fullpris
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Din rabattkod:</h3>
                  <div className="bg-bg-primary border-2 border-dashed border-cta-hover rounded-xl py-3 px-6 inline-block">
                    <span className="text-2xl font-bold tracking-wider text-cta-hover">VLKMN15</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-3">Ange koden vid bokning för 15% rabatt</p>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-text-light transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
