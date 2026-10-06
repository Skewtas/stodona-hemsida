import { Helmet } from "../seo";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, CheckCircle2, Loader2, Send, Heart, ChevronDown, ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { bookingUrl } from "../utils/bookingUrl";

const BOKIS_ORIGIN = 'https://boka.stodona.se';

/**
 * "Hämta min kod". Kunden skriver mobilnumret eller e-postadressen som står
 * på kundkortet, och Bokis skickar koden DIT — som SMS eller mejl. Koden
 * visas aldrig här: då hade vem som helst kunnat slå upp någon annans nummer.
 * Svaret är därför detsamma vare sig uppgiften finns hos oss eller inte.
 */
// Camilla hjälper vidare och lägger ett ärende till kundservice om det behövs.
function fragaCamilla() {
  window.dispatchEvent(new CustomEvent("stodona:chatt", { detail: { fraga: "Jag får ingen värvningskod. Kan ni hjälpa mig?" } }));
}

function CamillaKnapp({ sv }: { sv: boolean }) {
  return (
    <button type="button" onClick={fragaCamilla} className="inline-flex items-center gap-1.5 font-medium text-accent-deep underline underline-offset-2 hover:text-text-primary transition-colors">
      <MessageCircle className="w-4 h-4" />
      {sv ? 'Få hjälp av Camilla' : 'Get help from Camilla'}
    </button>
  );
}

function HamtaMinKod({ sv }: { sv: boolean }) {
  // Heron visar bara knappen. Fältet kommer fram först när kunden trycker.
  const [oppen, setOppen] = useState(false);
  const [kontakt, setKontakt] = useState('');
  const [lage, setLage] = useState<'vila' | 'skickar' | 'klar'>('vila');
  const [kanal, setKanal] = useState<'sms' | 'mejl'>('sms');
  const [fel, setFel] = useState('');

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    if (!kontakt.trim() || lage === 'skickar') return;
    setLage('skickar'); setFel('');
    try {
      const r = await fetch(`${BOKIS_ORIGIN}/api/kundvarvning/min-kod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kontakt: kontakt.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 400 || r.status === 429) {
        setFel(sv ? (data?.error || 'Kontrollera uppgiften och försök igen.') : 'Please check what you entered and try again.');
        setLage('vila');
        return;
      }
      if (!r.ok) throw new Error();
      setKanal(data?.kanal === 'mejl' ? 'mejl' : 'sms');
      setLage('klar');
    } catch {
      setFel(sv ? 'Det gick inte just nu. Försök igen om en stund.' : 'That did not work right now. Please try again shortly.');
      setLage('vila');
    }
  }

  if (lage === 'klar') {
    return (
      <motion.div id="min-kod" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-24 flex items-start gap-3">
        <CheckCircle2 className="w-7 h-7 text-accent-deep shrink-0 mt-0.5" />
        <div>
          <p className="text-lg font-bold">
            {sv
              ? (kanal === 'sms' ? 'Kolla dina SMS!' : 'Kolla din inkorg!')
              : (kanal === 'sms' ? 'Check your texts!' : 'Check your inbox!')}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {sv
              ? `Vi har skickat din kod till ${kanal === 'sms' ? 'numret' : 'adressen'}.`
              : `We have sent your code to that ${kanal === 'sms' ? 'number' : 'address'}.`}
          </p>
          {/* Bokis svarar likadant vare sig koden skickades eller inte, så
              sidan vet inte – därför står kravet alltid utskrivet här. */}
          <p className="text-sm text-text-secondary mt-3 rounded-2xl bg-bg-primary px-4 py-3">
            <strong className="text-text-primary">{sv ? 'Fick du ingen kod?' : 'No code?'}</strong>{' '}
            {sv
              ? 'Mejladressen eller telefonnumret måste vara kopplat till ditt kundkort hos oss. Går det ändå inte hjälper Camilla dig och lägger ett ärende till kundservice.'
              : 'The email address or phone number must be linked to your customer record with us. If it still does not work, Camilla will help and open a case with customer service.'}
            <span className="block mt-2"><CamillaKnapp sv={sv} /></span>
          </p>
          <button type="button" onClick={() => { setLage('vila'); setKontakt(''); }} className="mt-3 text-sm underline text-text-secondary">
            {sv ? 'Försök med en annan uppgift' : 'Try something else'}
          </button>
        </div>
      </motion.div>
    );
  }

  if (!oppen) {
    return (
      <div id="min-kod" className="scroll-mt-24">
        <button type="button" onClick={() => setOppen(true)} className="btn-primary btn-attention group w-full sm:w-auto !px-8 !py-4 text-lg gap-3">
          <Gift className="w-5 h-5" />
          {sv ? 'Hämta din värvningskod' : 'Get your referral code'}
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    );
  }

  return (
    <motion.div id="min-kod" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="scroll-mt-24">
      <form onSubmit={skicka} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <input
          type="text"
          required
          autoFocus
          autoComplete="tel"
          value={kontakt}
          onChange={(e) => setKontakt(e.target.value)}
          placeholder={sv ? 'Mobilnummer eller e-post' : 'Mobile number or email'}
          aria-label={sv ? 'Mobilnummer eller e-post' : 'Mobile number or email'}
          className="flex-1 min-w-0 px-5 py-4 rounded-full border border-text-primary/15 bg-bg-primary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
        <button type="submit" disabled={lage === 'skickar'} className="btn-primary !px-7 !py-4 gap-2 disabled:opacity-60">
          {lage === 'skickar' && <Loader2 className="w-4 h-4 animate-spin" />}
          {sv ? 'Skicka min kod' : 'Send my code'}
        </button>
      </form>
      {fel && (
        <div className="mt-3 text-sm" role="alert">
          <p className="text-red-700 mb-1">{fel}</p>
          <CamillaKnapp sv={sv} />
        </div>
      )}
    </motion.div>
  );
}

const STEG = [
  {
    ikon: Send,
    rubrik: ['Dela din kod', 'Share your code'],
    text: ['Skicka din personliga kod till en vän.', 'Send your personal code to a friend.'],
  },
  {
    ikon: Heart,
    siffra: '15%',
    rubrik: ['Din vän får 15%', 'Your friend gets 15%'],
    text: ['Din vän får 15% rabatt på sin första bokning.', 'Your friend gets 15% off their first booking.'],
  },
  {
    ikon: Gift,
    siffra: '50%',
    rubrik: ['Du får 50% 🎉', 'You get 50% 🎉'],
    text: ['När din vän har genomfört sin bokning får du 50% rabatt på en hel faktura.', 'Once your friend has completed their booking, you get 50% off a full invoice.'],
    beloning: true,
  },
];

const VILLKOR: [string, string][] = [
  ['Vännen måste vara ny kund hos Stodona.', 'Your friend must be a new Stodona customer.'],
  ['Vännen får 15% rabatt på sin första bokning.', 'Your friend gets 15% off their first booking.'],
  ['Din 50% rabatt aktiveras när vännen genomfört och betalat sin första bokning.', 'Your 50% discount is activated once your friend has completed and paid for their first booking.'],
  ['Rabatten gäller på en hel faktura.', 'The discount applies to one full invoice.'],
  ['En värvning = en 50%-rabatt.', 'One referral = one 50% discount.'],
  ['Värvningskoden måste användas vid bokning.', 'The referral code must be used when booking.'],
  ['Erbjudandet kan inte kombineras med andra rabatter.', 'The offer cannot be combined with other discounts.'],
];

export default function VarvaEnVan() {
  const { lang } = useLanguage();
  const sv = lang === 'SV';
  const i = sv ? 0 : 1;
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Värva en vän – få 50% rabatt | Stodona</title>
        <meta name="description" content="Värva en vän till Stodona: din vän får 15% rabatt på sin första bokning och du får 50% rabatt på en hel faktura." />
        <meta property="og:title" content="Värva en vän – få 50% rabatt | Stodona" />
        <meta property="og:description" content="Dela din värvningskod: din vän får 15% rabatt och du får 50% rabatt på en hel faktura." />
        <link rel="canonical" href="https://stodona.se/varva-en-van" />
      </Helmet>

      {/* Hero – två rutor: rubrik, en mening och knappen till vänster, bilden
          till höger. Inget mer – erbjudandet ska gå att förstå på ett ögonblick. */}
      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 pt-8 sm:pt-12 pb-10 lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-0 items-stretch lg:min-h-[520px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-6 sm:p-10 md:p-12 lg:px-12 xl:px-20 shadow-2xl lg:shadow-none flex flex-col justify-center [container-type:inline-size]"
            >
              <h1 className="text-[clamp(2rem,9cqw,3.75rem)] font-bold leading-[1.08] text-text-primary mb-5">
                {sv ? 'Värva en vän –' : 'Refer a friend –'}
                <br />
                <span className="italic font-normal text-accent-deep">{sv ? 'få 50% rabatt' : 'get 50% off'}</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 max-w-md">
                {sv ? 'Är du befintlig kund? Hämta din värvningskod och få 50% rabatt på en hel faktura.' : 'Already a customer? Get your referral code and receive 50% off a full invoice.'}
              </p>
              <HamtaMinKod sv={sv} />
            </motion.div>

            {/* Bildrutan. Fast bildförhållande på mobil; från lg samma höjd
                som textrutan bredvid. */}
            <div className="relative overflow-hidden shadow-2xl lg:shadow-none aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-full">
              <img
                src="/familj-stodona.jpg"
                alt="Värva en vän Stodona Stockholm"
                className="absolute inset-0 w-full h-full object-cover"
                width="1024"
                height="1536"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Så funkar det – tre kort. Siffrorna bär budskapet; 50 % är belöningen
          och får därför den mörka rutan och den största siffran. */}
      <section className="py-14 md:py-20 bg-bg-primary">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14">{sv ? 'Så funkar det' : 'How it works'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto md:items-stretch">
            {STEG.map((steg, n) => {
              const Ikon = steg.ikon;
              return (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: n * 0.12 }}
                  whileHover={{ y: -6 }}
                  className={`relative rounded-3xl p-7 md:p-8 text-center flex flex-col items-center overflow-hidden ${
                    steg.beloning
                      ? 'bg-bg-dark text-text-light shadow-2xl shadow-text-primary/25 md:scale-[1.04]'
                      : 'bg-white shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-semibold uppercase tracking-[0.18em] mb-5 ${steg.beloning ? 'text-text-light/60' : 'text-text-secondary'}`}>
                    {sv ? 'Steg' : 'Step'} {n + 1}
                  </span>

                  <div className="h-24 md:h-28 flex items-center justify-center mb-4">
                    {steg.siffra ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.25 + n * 0.12 }}
                        className={`font-display font-bold leading-none ${
                          steg.beloning ? 'text-7xl md:text-8xl text-accent' : 'text-6xl md:text-7xl text-accent-deep'
                        }`}
                      >
                        {steg.siffra}
                      </motion.span>
                    ) : (
                      <motion.div
                        animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-full bg-bg-primary flex items-center justify-center"
                      >
                        <Ikon className="w-9 h-9 text-accent-deep" />
                      </motion.div>
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    {steg.siffra && !steg.beloning && <Ikon className="w-5 h-5 text-accent-deep" />}
                    {steg.rubrik[i]}
                  </h3>
                  <p className={steg.beloning ? 'text-text-light/75' : 'text-text-secondary'}>{steg.text[i]}</p>

                  {steg.beloning && (
                    <motion.div
                      aria-hidden
                      animate={{ rotate: [0, -10, 10, -6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4 }}
                      className="absolute top-5 right-5 w-10 h-10 rounded-full bg-accent flex items-center justify-center"
                    >
                      <Ikon className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 md:mt-14">
            <a href="#min-kod" className="btn-primary w-full sm:w-auto !px-8 !py-4 text-lg gap-3">
              <Gift className="w-5 h-5" />
              {sv ? 'Hämta din värvningskod' : 'Get your referral code'}
            </a>
            <a href={bookingUrl()} className="btn-secondary w-full sm:w-auto !px-8 !py-4 text-lg">
              {sv ? 'Boka städning' : 'Book cleaning'}
            </a>
          </div>
          <p className="text-center text-sm text-text-secondary mt-4">
            {sv ? 'Har du fått en kod av en vän? Ange den när du bokar.' : 'Got a code from a friend? Enter it when you book.'}
          </p>
        </div>
      </section>

      {/* Villkor – hopfällda, så att sidan förblir kort. */}
      <section className="pb-16 md:pb-24 bg-bg-primary">
        <div className="container-custom">
          <details className="group max-w-2xl mx-auto rounded-3xl bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-6 md:px-8 py-5">
              <span>
                <span className="block font-display text-xl font-bold">{sv ? 'Enkelt och rättvist' : 'Simple and fair'}</span>
                <span className="block text-sm text-text-secondary">{sv ? 'Villkor' : 'Terms'}</span>
              </span>
              <ChevronDown className="w-5 h-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <ul className="px-6 md:px-8 pb-7 space-y-3">
              {VILLKOR.map((v) => (
                <li key={v[0]} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-deep shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{v[i]}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </div>
  );
}
