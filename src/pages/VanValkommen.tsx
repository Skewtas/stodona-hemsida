import { Helmet } from "../seo";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Gift, ArrowRight, Copy, Check, ShieldCheck, Users, Sparkles, BadgePercent, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { bookingUrl } from "../utils/bookingUrl";
import HeroVideo from "../components/HeroVideo";
import UspMarquee from "../components/UspMarquee";
import TrustBar from "../components/TrustBar";

/**
 * stodona.se/valkommen?kod=KODEN – sidan som en värvad vän landar på.
 *
 * Kunden delar länken; vännen ser koden, tre rader om hur det går till och
 * knappen "Se ditt pris", som går till bokningen med koden ifylld (?rabattkod=).
 * Löftena nedan är samma som står på startsidan – lägg inte till nya här. Koden visas
 * som den står i länken – om den gäller avgörs i bokningen, inte här.
 * Olänkad, inte i sitemapen och noindex: varje länk är personlig.
 */

const RADER: [string, string][] = [
  ['Tryck på "Se ditt pris" – din kod följer med.', 'Tap "See your price" – your code comes along.'],
  ['Välj städabonnemang och en tid som passar dig.', 'Choose a cleaning subscription and a time that suits you.'],
  ['15% dras automatiskt på dina städningar, och 50% på din andra faktura.', '15% is applied to your cleanings automatically, and 50% to your second invoice.'],
];

// Samma löften som på startsidan och i USP-raden.
const PITCHAR = [
  {
    ikon: ShieldCheck,
    rubrik: ['100% nöjdgaranti', '100% satisfaction guarantee'],
    text: ['Vi är inte nöjda förrän du är det. Är något inte perfekt åtgärdar vi det kostnadsfritt inom 24 timmar.', 'We are not happy until you are. If something is not perfect, we fix it free of charge within 24 hours.'],
  },
  {
    ikon: Users,
    rubrik: ['Samma team – varje gång', 'The same team – every time'],
    text: ['Ni får samma personal, som lär känna ert hem och vet precis hur ni vill ha det.', 'You get the same staff, who get to know your home and know exactly how you like it.'],
  },
  {
    ikon: Sparkles,
    rubrik: ['Hotellkänsla hemma', 'Hotel feeling at home'],
    text: ['Utbildad personal och en noggrann checklista – varje rum gås igenom, varje gång.', 'Trained staff and a careful checklist – every room is covered, every time.'],
  },
  {
    ikon: BadgePercent,
    rubrik: ['Halva priset med RUT', 'Half price with RUT'],
    text: ['RUT-avdraget dras direkt på fakturan – du behöver inte göra något själv.', 'The RUT deduction is taken straight off the invoice – you do not need to do anything.'],
  },
];

export default function VanValkommen() {
  const { lang } = useLanguage();
  const sv = lang === 'SV';
  const i = sv ? 0 : 1;
  const [params] = useSearchParams();
  // Bara tecken som en kod kan bestå av – inget annat ur länken hamnar på sidan.
  const kod = (params.get('kod') || '').toUpperCase().replace(/[^A-Z0-9ÅÄÖ-]/g, '').slice(0, 24);
  const [kopierad, setKopierad] = useState(false);
  const prisUrl = bookingUrl(kod ? { rabattkod: kod } : {});

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(kod);
      setKopierad(true);
      window.setTimeout(() => setKopierad(false), 2000);
    } catch { /* urklipp saknas – koden står ändå på sidan */ }
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Du har fått 15% rabatt av en vän | Stodona</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://stodona.se/varva-en-van" />
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 pt-8 sm:pt-12 pb-10 lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-0 items-stretch lg:min-h-[calc(100vh-186px)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-6 sm:p-10 md:p-12 lg:px-12 xl:px-20 shadow-2xl lg:shadow-none flex flex-col justify-center [container-type:inline-size]"
            >
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent-deep mb-5">
                <Gift className="w-4 h-4" />
                {sv ? 'En present från en vän' : 'A gift from a friend'}
              </span>
              <h1 className="text-[clamp(1.85rem,8cqw,3.5rem)] font-bold leading-[1.08] text-text-primary mb-5">
                {sv ? 'Behöver du också komma igång med ' : 'Ready to get started with '}
                <span className="italic font-normal text-accent-deep">{sv ? 'städningen?' : 'cleaning too?'}</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-7 max-w-md">
                {sv ? (
                  <>Du har fått <strong className="text-text-primary">15% rabatt</strong> av en vän. Ni båda får dessutom <strong className="text-text-primary">50% rabatt</strong> på en faktura.</>
                ) : (
                  <>A friend has given you <strong className="text-text-primary">15% off</strong>. You both also get <strong className="text-text-primary">50% off</strong> one invoice.</>
                )}
              </p>

              {/* Rabattkupongen: 15 % stort, koden bredvid. */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 14 }}
                className="flex items-stretch rounded-3xl bg-bg-dark text-text-light shadow-xl shadow-text-primary/20 mb-7 max-w-md overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center px-5 sm:px-6 py-5 bg-accent text-white">
                  <span className="font-display font-bold text-4xl sm:text-5xl leading-none">15%</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] mt-1">{sv ? 'rabatt' : 'off'}</span>
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3 px-5 py-4 border-l-2 border-dashed border-text-light/25">
                  {kod ? (
                    <>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-light/60 mb-1">{sv ? 'Din kod' : 'Your code'}</span>
                        <span className="block font-mono text-lg sm:text-2xl font-bold tracking-[0.06em] sm:tracking-[0.1em] break-words">{kod}</span>
                      </div>
                      <button type="button" onClick={kopiera} aria-label={sv ? 'Kopiera koden' : 'Copy the code'} className="shrink-0 w-10 h-10 rounded-full bg-text-light/10 flex items-center justify-center hover:bg-text-light hover:text-text-primary transition-colors">
                        {kopierad ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-text-light/80">{sv ? 'Ange din väns kod när du bokar.' : 'Enter your friend\'s code when you book.'}</span>
                  )}
                </div>
              </motion.div>

              <div>
                <a href={prisUrl} className="btn-primary btn-attention group w-full sm:w-auto !px-9 !py-4 text-lg gap-3">
                  {sv ? 'Se ditt pris' : 'See your price'}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
              <p className="text-sm text-text-secondary mt-3">
                {kod
                  ? (sv ? 'Koden följer med automatiskt. Tar ungefär 60 sekunder.' : 'The code comes along automatically. Takes about 60 seconds.')
                  : (sv ? 'Tar ungefär 60 sekunder.' : 'Takes about 60 seconds.')}
              </p>
              <TrustBar className="mt-6" />
            </motion.div>

            <div className="relative overflow-hidden shadow-2xl lg:shadow-none aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-full">
              <HeroVideo
                srcAv1="/stodona-hero-av1.mp4"
                src="/stodona-hero.mp4"
                poster="/hero-poster.webp"
                alt="Nystädat sovrum med uppbäddad säng"
              />
            </div>
          </div>
        </div>
      </section>

      <UspMarquee />

      {/* Därför Stodona – fyra löften. */}
      <section className="py-14 md:py-20 bg-bg-primary">
        <div className="w-full px-5 sm:px-6 lg:px-10 xl:px-14">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex justify-center gap-1 text-yellow-500 mb-3" aria-hidden>
              {[...Array(5)].map((_, n) => <Star key={n} className="w-5 h-5 fill-current" />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {sv ? 'Din vän har redan ' : 'Your friend already has '}
              <span className="italic font-normal text-accent-deep">{sv ? 'hotellkänsla hemma.' : 'that hotel feeling at home.'}</span>
              <br className="hidden md:block" />
              {sv ? ' Nu är det din tur.' : ' Now it is your turn.'}
            </h2>
            <p className="text-text-secondary mt-3">{sv ? '4,9 av 5 i snittbetyg från våra kunder.' : '4.9 out of 5 average rating from our customers.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {PITCHAR.map((p, n) => {
              const Ikon = p.ikon;
              return (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: n * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-3xl bg-white p-7 md:p-8 shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-bg-primary flex items-center justify-center mb-5 transition-colors group-hover:bg-accent">
                    <Ikon className="w-7 h-7 text-accent-deep transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{p.rubrik[i]}</h3>
                  <p className="text-text-secondary leading-relaxed">{p.text[i]}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Avslut: erbjudandet en gång till, stort, och tre rader om hur det går till. */}
      <section className="bg-bg-dark text-text-light py-16 md:py-24">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="font-display font-bold text-accent leading-none text-[5.5rem] md:text-[8rem]"
            >
              15%
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{sv ? 'på hela ditt städabonnemang – och 50% på en faktura' : 'off your entire cleaning subscription – and 50% off one invoice'}</h2>
            <p className="text-text-light/70 text-lg mb-8 max-w-md mx-auto lg:mx-0">
              {sv ? 'Se vad det kostar för just ditt hem – priset visas direkt.' : 'See what it costs for your home – the price is shown right away.'}
            </p>
            <a href={prisUrl} className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto rounded-full bg-accent text-white font-medium text-lg px-9 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-text-primary">
              {sv ? 'Se ditt pris' : 'See your price'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <ol className="space-y-3">
            {RADER.map((rad, n) => (
              <motion.li
                key={n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: n * 0.1 }}
                className="flex items-center gap-4 rounded-2xl bg-text-light/[0.07] px-5 py-4"
              >
                <span className="shrink-0 w-9 h-9 rounded-full bg-text-light text-text-primary font-display font-bold flex items-center justify-center">{n + 1}</span>
                <span>{rad[i]}</span>
              </motion.li>
            ))}
            <li className="pt-2 text-sm text-text-light/60 text-center lg:text-left leading-relaxed">
              {sv
                ? 'Bokar ni som företag? Då får ni 50% rabatt på en faktura i stället för 15% på abonnemanget.'
                : 'Booking as a company? You get 50% off one invoice instead of 15% off the subscription.'}{' '}
              <a href="/varva-en-van" className="underline underline-offset-2 hover:text-text-light">{sv ? 'Villkor' : 'Terms'}</a>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
