import { useState } from 'react';
import { Download, CheckCircle2, FileText } from 'lucide-react';
import { submitLead } from '../utils/leadCapture';

export default function BlogLeadMagnet() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await submitLead({ email, source: 'blog_lead_magnet' });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="my-12 bg-gradient-to-br from-bg-dark to-gray-800 rounded-2xl p-8 text-text-light">
      {!submitted ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cta-hover/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-cta-hover" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Gratis städchecklista</h3>
              <p className="text-xs text-text-light/60">PDF – ladda ner direkt</p>
            </div>
          </div>
          <p className="text-sm text-text-light/80 mb-4">
            Vår kompletta städchecklista som våra professionella städare använder. 
            Perfekt för dig som vill hålla hemmet fräscht mellan städtillfällena.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-postadress"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-text-light placeholder:text-text-light/40 focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cta-hover text-text-primary font-bold rounded-xl hover:brightness-110 transition-all text-sm flex items-center gap-2 justify-center disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Skickar...' : 'Ladda ner gratis'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Tack!</h3>
          <p className="text-sm text-text-light/80">
            Checklistan skickas till din e-post inom några minuter. Kolla din inkorg!
          </p>
        </div>
      )}
    </div>
  );
}
