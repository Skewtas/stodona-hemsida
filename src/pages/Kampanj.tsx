import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Helmet } from "../seo";
import { CheckCircle2, ArrowRight, Sparkles, Clock } from "lucide-react";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";

/**
 * Kampanjsida för veckans erbjudande (ABO25).
 *
 * Sidan stänger sig själv – inget deploy behövs för att ta ned den. Efter
 * KAMPANJ_SLUT visas ett kort avslutsläge i stället för erbjudandet, så att
 * ingen som hittar länken senare möts av en rabatt som inte gäller.
 *
 * Medvetet noindex och utanför sitemap: trafiken kommer från nyhetsbrevet, och
 * en sida som är död efter en vecka ska inte ligga i sökresultaten.
 */

// Måndag 2026-09-14 00:00 svensk tid (CEST = UTC+2).
const KAMPANJ_SLUT = new Date("2026-09-13T22:00:00Z");
const KOD = "ABO25";

const LOFTEN = [
  "Samma team städar hos dig varje gång",
  "100 % nöjdgaranti",
  "Enkel bokning online på 60 sekunder",
];

const TRYGGHET = ["Utbildad personal", "100 % nöjdgaranti", "Betala i efterskott"];

const TJANSTER = [
  { namn: "Hemstädning", to: "/hemstadning" },
  { namn: "Storstädning", to: "/storstadning" },
  { namn: "Fönsterputsning", to: "/fonsterputsning" },
  { namn: "Flyttstädning", to: "/flyttstadning" },
  { namn: "Företagsstädning", to: "/foretagsstadning" },
];

function dagarKvar(slut: Date): string {
  const ms = slut.getTime() - Date.now();
  const dagar = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (dagar <= 1) return "Sista dagen";
  return `${dagar} dagar kvar`;
}

export default function Kampanj() {
  // Beräknas i state så att en sida som stått öppen över natten stänger sig.
  const [aktiv, setAktiv] = useState(() => Date.now() < KAMPANJ_SLUT.getTime());

  useEffect(() => {
    if (!aktiv) return;
    const timer = setInterval(() => {
      if (Date.now() >= KAMPANJ_SLUT.getTime()) setAktiv(false);
    }, 60_000);
    return () => clearInterval(timer);
  }, [aktiv]);

  const boka = bookingUrl({ discountCode: KOD });

  if (!aktiv) {
    return (
      <div className="flex flex-col">
        <Helmet>
          <title>Kampanjen har avslutats | Stodona</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <section className="min-h-[70vh] flex items-center bg-bg-primary">
          <div className="container-custom max-w-xl text-center py-24">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Kampanjen har avslutats</h1>
            <p className="text-text-secondary text-lg mb-8">
              Erbjudandet med koden {KOD} gällde till och med söndag den 13 september.
              Våra städabonnemang finns kvar – med lägre pris ju längre du binder.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/stadabonnemang"
                className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
              >
                Se städabonnemang <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/priser"
                className="inline-flex items-center justify-center px-8 py-4 border border-text-primary/20 font-medium hover:bg-white transition-colors"
              >
                Alla priser
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>25 % rabatt på städabonnemang + fri fönsterputs | Stodona</title>
        <meta
          name="description"
          content="Veckans erbjudande: 25 % rabatt på första städningen med koden ABO25, därefter 20 %. Vi bjuder dessutom på fönsterputs. Gäller till och med söndag."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden text-text-light pt-24">
        <img
          src="/stodona_right_image.jpg"
          alt="Nystädat vardagsrum"
          width="800"
          height="1600"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/45 via-bg-dark/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/30 via-transparent to-bg-dark/15" />

        <div className="container-custom relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl bg-bg-primary/92 backdrop-blur-sm p-8 sm:p-10 md:p-12 shadow-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-deep text-[11px] font-bold tracking-widest uppercase mb-5">
              <Clock className="w-3.5 h-3.5" /> {dagarKvar(KAMPANJ_SLUT)} · t.o.m. söndag
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-text-primary mb-4">
              Städabonnemang.
              <br />
              <span className="italic font-normal text-accent-deep">
                Mindre tjat om städning, mer tid för livet.
              </span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
              <strong className="text-text-primary">25 % rabatt</strong> på första städningen,
              därefter 20 %. Vi bjuder dessutom på fönsterputs eller storstädning.
            </p>

            <div className="flex items-baseline gap-3 border border-dashed border-accent/50 bg-accent/5 px-5 py-4 mb-7">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Kod</span>
              <span className="font-display text-3xl font-bold tracking-tight text-text-primary">{KOD}</span>
              <span className="text-sm text-text-secondary ml-auto">Gäller alla städabonnemang</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
              <a
                href={boka}
                onClick={() => track("booking_click", { source: "kampanj_abo25" })}
                className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
              >
                Boka nu <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/priser"
                className="text-sm font-medium text-text-secondary hover:text-text-primary underline underline-offset-4 sm:ml-2"
              >
                Se priser och lediga tider
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2.5 text-sm font-medium text-text-secondary border-t border-text-primary/10 pt-6">
              {TRYGGHET.map((punkt) => (
                <div key={punkt} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{punkt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vad du får */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            25 % på städabonnemang – och fönsterputs på köpet
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
            Bokar du ett städabonnemang den här veckan får du 25 % rabatt på första städningen och
            20 % på de som följer. Ovanpå det bjuder vi på fönsterputs eller en storstädning.
          </p>

          <ul className="space-y-4 mb-10">
            {LOFTEN.map((punkt) => (
              <li key={punkt} className="flex items-start gap-3 text-lg">
                <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                <span className="text-text-primary">{punkt}</span>
              </li>
            ))}
          </ul>

          <div className="bg-bg-primary p-8 sm:p-10">
            <p className="text-text-primary text-lg leading-relaxed mb-6">
              Säkra din vardagslyx nu. Ange koden{" "}
              <strong className="font-bold">{KOD}</strong> i bokningen – erbjudandet gäller endast
              till och med söndag.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={boka}
                onClick={() => track("booking_click", { source: "kampanj_abo25_mitt" })}
                className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
              >
                Boka nu <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/stadabonnemang"
                className="inline-flex items-center justify-center px-8 py-4 border border-text-primary/20 font-medium hover:bg-white transition-colors"
              >
                Så fungerar abonnemanget
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tjänster */}
      <section className="py-16 bg-bg-primary border-t border-text-primary/5">
        <div className="container-custom max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-deep mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Läs mer om våra tjänster
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Vad behöver du hjälp med?</h2>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {TJANSTER.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="inline-block px-5 py-2.5 bg-white border border-text-primary/10 text-sm font-medium hover:border-accent hover:text-accent-deep transition-colors"
                >
                  {t.namn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
