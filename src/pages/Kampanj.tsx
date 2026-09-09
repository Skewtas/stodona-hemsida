import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Helmet } from "../seo";
import { CheckCircle2, ArrowRight, Sparkles, Clock } from "lucide-react";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";

/**
 * Kampanjsida för veckans erbjudande (ABO25).
 *
 * Sidan stänger sig själv – inget deploy behövs för att ta ned den. Efter
 * KAMPANJ_SLUT skickas besökaren vidare till /stadabonnemang, så att varken
 * en indexerad URL eller en gammal nyhetsbrevslänk landar på ett erbjudande
 * som inte längre gäller.
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

// Tidsbegränsat erbjudande. validThrough gör slutdatumet maskinläsbart, så att
// sökmotorer och AI-motorer kan se att rabatten upphör.
const KAMPANJ_SLUT_ISO = "2026-09-13T23:59:59+02:00";

const erbjudandeSchema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  name: "25 % rabatt på städabonnemang",
  description:
    "25 % rabatt på första städningen vid tecknat städabonnemang, därefter 20 %. Fönsterputsning eller storstädning ingår. Gäller med rabattkoden ABO25.",
  url: "https://stodona.se/kampanj",
  priceCurrency: "SEK",
  availability: "https://schema.org/InStock",
  validThrough: KAMPANJ_SLUT_ISO,
  eligibleCustomerType: "https://schema.org/Consumer",
  areaServed: { "@type": "City", name: "Stockholm" },
  offeredBy: { "@id": "https://stodona.se/#business" },
  itemOffered: {
    "@type": "Service",
    name: "Städabonnemang",
    serviceType: "Hemstädning",
    url: "https://stodona.se/stadabonnemang",
    provider: { "@id": "https://stodona.se/#business" },
  },
};

const brodsmulaSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
    { "@type": "ListItem", position: 2, name: "Städabonnemang", item: "https://stodona.se/stadabonnemang" },
    { "@type": "ListItem", position: 3, name: "Kampanj ABO25", item: "https://stodona.se/kampanj" },
  ],
};

export default function Kampanj() {
  const [sqm, setSqm] = useState("");
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

  function startaBokning(e: React.FormEvent) {
    e.preventDefault();
    const yta = parseInt(sqm, 10);
    const giltig = Number.isFinite(yta) && yta >= 10 && yta <= 500;
    track("booking_start", { source: "kampanj_abo25", sqm: giltig ? yta : undefined });
    // Rabattkoden följer alltid med; ytan bara när den är rimlig.
    window.location.href = bookingUrl({
      service: "Hemstädning",
      discountCode: KOD,
      ...(giltig ? { sqm: yta } : {}),
    });
  }

  // Efter kampanjen skickas besökaren till den bestående abonnemangssidan i
  // stället för att mötas av en död sida. Gör att en indelänkad eller indexerad
  // kampanj-URL alltid landar på något som fortfarande gäller.
  if (!aktiv) {
    return <Navigate to="/stadabonnemang" replace />;
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Städabonnemang 25 % rabatt – kod ABO25 | Stodona Stockholm</title>
        <meta
          name="description"
          content="25 % rabatt på städabonnemang i Stockholm med koden ABO25, därefter 20 %. Fönsterputs eller storstädning på köpet. Samma team varje gång, 100 % nöjdgaranti. Gäller t.o.m. söndag 13 september."
        />
        <link rel="canonical" href="https://stodona.se/kampanj" />
        <meta property="og:title" content="25 % rabatt på städabonnemang – kod ABO25" />
        <meta
          property="og:description"
          content="Mindre tjat om städning, mer tid för livet. 25 % på första städningen, därefter 20 %, plus fönsterputs på köpet. Endast t.o.m. söndag."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/kampanj" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta property="og:locale" content="sv_SE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="25 % rabatt på städabonnemang – kod ABO25" />
        <meta name="twitter:image" content="https://stodona.se/stodona-stad.jpg" />
        <script type="application/ld+json">{JSON.stringify(erbjudandeSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(brodsmulaSchema)}</script>
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

            {/* Bokningen påbörjas här, precis som på startsidan. Ytan följer med
                som ?sqm= tillsammans med rabattkoden, så kunden landar i
                bokningen med både pris och rabatt på plats. */}
            <form onSubmit={startaBokning} className="mb-8">
              <label htmlFor="kampanj-sqm" className="block text-text-secondary text-base sm:text-lg mb-3">
                Hur många kvm bor du på?
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative sm:w-44">
                  <input
                    id="kampanj-sqm"
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={500}
                    value={sqm}
                    onChange={(e) => setSqm(e.target.value)}
                    placeholder="70"
                    className="w-full bg-white border border-text-primary/15 pl-4 pr-12 py-4 text-lg font-medium text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium pointer-events-none">
                    kvm
                  </span>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
                >
                  Se pris och boka <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-3">
                Rabattkoden {KOD} följer med automatiskt.{" "}
                <Link to="/priser" className="underline underline-offset-4 hover:text-text-primary">
                  Se priser och lediga tider
                </Link>
              </p>
            </form>

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
