import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { submitLead } from '../utils/leadCapture';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await submitLead({ email, source: 'footer_newsletter' });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm">Tack! Du är nu prenumerant.</span>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Mail className="w-4 h-4 text-cta-hover" />
        Städtips & erbjudanden
      </h4>
      <p className="text-xs text-text-light/60 mb-3">
        Få städtips, guider och exklusiva erbjudanden direkt i din inbox.
      </p>
      {/* min-w-0 krävs: ett flex-barn har min-width:auto, och input:ens
          inbyggda bredd (size=20) hindrar annars flex-1 från att krympa, så
          knappen trycks ut ur footerns smala mobilkolumn. flex-wrap låter
          knappen hoppa ner på egen rad när kolumnen blir för trång. */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Din e-postadress"
          required
          className="flex-1 basis-36 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-text-light placeholder:text-text-light/40 focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-xs"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-cta-hover text-text-primary font-bold rounded-lg hover:brightness-110 transition-all text-xs whitespace-nowrap disabled:opacity-50"
        >
          {loading ? '...' : 'Prenumerera'}
        </button>
      </form>
    </div>
  );
}
