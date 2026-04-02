import { useState } from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { submitLead } from '../utils/leadCapture';

export default function StickyCTA() {
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

  if (submitted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[9990] md:hidden bg-green-500 text-white py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Tack! Vi ringer dig snart.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] md:hidden bg-bg-dark border-t border-white/10 safe-area-bottom">
      <div className="flex items-center gap-2 p-3">
        {!showInput ? (
          <>
            <a
              href="https://boka.stodona.se"
              className="flex-1 py-3 bg-cta-hover text-text-primary font-bold rounded-xl text-center text-sm hover:brightness-110 transition-all"
            >
              Boka nu – 15% rabatt
            </a>
            <button
              onClick={() => setShowInput(true)}
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-text-light hover:bg-white/20 transition-colors"
              aria-label="Ring mig"
            >
              <Phone className="w-5 h-5" />
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ditt telefonnummer"
              required
              autoFocus
              className="flex-1 px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-text-light placeholder:text-text-light/40 focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-cta-hover text-text-primary font-bold rounded-xl text-sm whitespace-nowrap disabled:opacity-50"
            >
              {loading ? '...' : 'Ring mig'}
            </button>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="text-text-light/50 text-xs"
            >
              ✕
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
