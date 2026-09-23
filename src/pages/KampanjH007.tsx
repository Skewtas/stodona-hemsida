import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Helmet } from "../seo";
import { CheckCircle2, ArrowRight, Clock, XCircle, ChevronDown } from "lucide-react";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";
import HeroVideo from "../components/HeroVideo";

/**
 * Kampanjsida för H007 – 30 % på hemstädningen året ut.
 *
 * Villkoren speglar exakt hur koden är uppsatt i bokningsmodulen
 * (discount_codes.H007): 30 %, bara återkommande hemstädning, bara 6 eller
 * 12 månaders bindning, giltig t.o.m. 2026-12-31 23:59. Ändras koden där
 * ska texten här ändras också — sidan får aldrig lova mer än koden ger.
 *
 * Sidan stänger sig själv efter KAMPANJ_SLUT och skickar besökaren vidare
 * till /stadabonnemang, så att en gammal länk aldrig landar på ett
 * erbjudande som inte längre gäller.
 */

// 31 december 2026 23:59:59 svensk tid (CET = UTC+1).
const KAMPANJ_SLUT_ISO = "2026-12-31T23:59:59+01:00";
const KAMPANJ_SLUT = new Date(KAMPANJ_SLUT_ISO);
const KOD = "H007";

// Räknat med bokningsmodulens prismotor 2026-09-23: 70 kvm, varannan vecka,
// efter RUT-avdrag, vardag. Visas uttryckligen som ett exempel.
const EXEMPEL = [
  { bindning: "12 månader", ordinarie: 1140, kampanj: 798 },
  { bindning: "6 månader", ordinarie: 1175, kampanj: 823 },
];

const GALLER = [
  "Hemstädning som abonnemang – varje vecka, varannan, var tredje eller var fjärde vecka",
  "Bindningstid på 6 eller 12 månader",
  "30 % rabatt på varje städning till och med 31 december 2026",
  "Rabattkoden H007 följer med automatiskt när du bokar härifrån",
];

const GALLER_INTE = [
  "Abonnemang utan bindningstid eller med 3 månaders bindning",
  "Engångsstädning",
  "Andra tjänster, t.ex. storstädning, flyttstädning och fönsterputs",
];

const STEG = [
  {
    rubrik: "Boka med koden H007",
    text: "Välj hur ofta du vill ha städning och 6 eller 12 månaders bindning. Koden följer med automatiskt från den här sidan.",
  },
  {
    rubrik: "30 % året ut",
    text: "Varje städning till och med 31 december 2026 får 30 % rabatt.",
  },
  {
    rubrik: "Ordinarie pris från 1 januari",
    text: "Från 1 januari 2027 betalar du ordinarie pris för din bindningstid resten av perioden – vi hör av oss innan.",
  },
];

const FRAGOR = [
  {
    fraga: "Hur länge gäller rabatten?",
    svar: "Rabatten gäller alla städningar till och med 31 december 2026. Från 1 januari 2027 gäller ordinarie pris för den bindningstid du valt. Koden går att använda för nya bokningar fram till och med 31 december.",
  },
  {
    fraga: "Varför bara 6 eller 12 månader?",
    svar: "Kampanjen är till för dig som vill ha ett långsiktigt städabonnemang. Väljer du 3 månader eller ingen bindning gäller koden inte, och bokningen visar ordinarie pris.",
  },
  {
    fraga: "Vad händer när bindningstiden är slut?",
    svar: "Bindningstiden räknas från ditt första städtillfälle. När den löper ut fortsätter abonnemanget löpande med en månads uppsägningstid – vi hör av oss innan dess.",
  },
  {
    fraga: "Kan jag avsluta i förtid?",
    svar: "Ja. Då efterdebiteras mellanskillnaden upp till obundet pris för de städningar som redan utförts, precis som för alla abonnemang med bindningstid.",
  },
  {
    fraga: "Gäller rabatten tillsammans med RUT-avdrag?",
    svar: "Ja. Rabatten dras på städningen och RUT-avdraget gäller som vanligt. Priserna på sidan är efter RUT-avdrag.",
  },
  {
    fraga: "Jag har redan ett abonnemang – kan jag använda koden?",
    svar: "Koden gäller nya bokningar av städabonnemang. Hör av dig till oss om du har frågor om ditt befintliga abonnemang.",
  },
];

function dagarKvar(slut: Date): string {
  const dagar = Math.ceil((slut.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (dagar <= 1) return "Sista dagen";
  return `${dagar} dagar kvar`;
}

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

// validThrough gör slutdatumet maskinläsbart, så att sökmotorer och
// AI-motorer kan se att rabatten upphör.
const erbjudandeSchema = {
  "@context": "https://schema.org",
  "@type": "Offer",
  name: "30 % rabatt på städabonnemang året ut",
  description:
    "30 % rabatt på varje hemstädning till och med 31 december 2026 vid städabonnemang med 6 eller 12 månaders bindning. Gäller med rabattkoden H007.",
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

const fragorSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FRAGOR.map((f) => ({
    "@type": "Question",
    name: f.fraga,
    acceptedAnswer: { "@type": "Answer", text: f.svar },
  })),
};

const brodsmulaSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
    { "@type": "ListItem", position: 2, name: "Städabonnemang", item: "https://stodona.se/stadabonnemang" },
    { "@type": "ListItem", position: 3, name: "Kampanj H007", item: "https://stodona.se/kampanj" },
  ],
};

export default function KampanjH007() {
  const [sqm, setSqm] = useState("");
  const [oppen, setOppen] = useState<number | null>(0);
  // Beräknas i state så att en sida som stått öppen över nyår stänger sig.
  const [aktiv, setAktiv] = useState(() => Date.now() < KAMPANJ_SLUT.getTime());

  useEffect(() => {
    if (!aktiv) return;
    const timer = setInterval(() => {
      if (Date.now() >= KAMPANJ_SLUT.getTime()) setAktiv(false);
    }, 60_000);
    return () => clearInterval(timer);
  }, [aktiv]);

  const boka = bookingUrl({ service: "Hemstädning", discountCode: KOD });

  function startaBokning(e: React.FormEvent) {
    e.preventDefault();
    const yta = parseInt(sqm, 10);
    const giltig = Number.isFinite(yta) && yta >= 10 && yta <= 500;
    track("booking_start", { source: "kampanj_h007", sqm: giltig ? yta : undefined });
    // Rabattkoden följer alltid med; ytan bara när den är rimlig.
    window.location.href = bookingUrl({
      service: "Hemstädning",
      discountCode: KOD,
      ...(giltig ? { sqm: yta } : {}),
    });
  }

  if (!aktiv) {
    return <Navigate to="/stadabonnemang" replace />;
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>30 % på städabonnemang året ut – kod H007 | Stodona Stockholm</title>
        <meta
          name="description"
          content="30 % rabatt på varje hemstädning till och med 31 december 2026 när du tecknar städabonnemang med 6 eller 12 månaders bindning. Kod H007. Samma team varje gång, 100 % nöjdgaranti."
        />
        <link rel="canonical" href="https://stodona.se/kampanj" />
        <meta property="og:title" content="30 % på städabonnemang året ut – kod H007" />
        <meta
          property="og:description"
          content="Teckna städabonnemang med 6 eller 12 månaders bindning och få 30 % rabatt på varje städning till och med 31 december."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/kampanj" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta property="og:locale" content="sv_SE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="30 % på städabonnemang året ut – kod H007" />
        <meta name="twitter:image" content="https://stodona.se/stodona-stad.jpg" />
        <script type="application/ld+json">{JSON.stringify(erbjudandeSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(fragorSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(brodsmulaSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden text-text-light pt-24">
        {/* Rörlig bakgrund. HeroVideo ritar postern först och hämtar filmen
            bara när den tillför något – aldrig på mobil, i sparläge eller på
            långsam uppkoppling. Då blir heron en vanlig, optimerad bild. */}
        <HeroVideo
          srcAv1="/stodona-hero-av1.mp4"
          src="/stodona-hero.mp4"
          poster="/hero-poster.webp"
          alt="Nystädat sovrum med uppbäddad säng"
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
              <Clock className="w-3.5 h-3.5" /> {dagarKvar(KAMPANJ_SLUT)} · t.o.m. 31 december
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-text-primary mb-4">
              30 % på städningen
              <br />
              <span className="italic font-normal text-accent-deep">året ut.</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
              Teckna ett städabonnemang med <strong className="text-text-primary">6 eller 12 månaders bindning</strong>{" "}
              och få <strong className="text-text-primary">30 % rabatt på varje städning</strong> till och med
              31 december 2026.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-7 text-sm">
              <span className="inline-flex items-center gap-2 border border-dashed border-accent/50 bg-accent/5 px-3 py-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Kod</span>
                <span className="font-bold tracking-wide text-text-primary">{KOD}</span>
              </span>
              <span className="text-text-secondary">Hemstädning med 6 eller 12 mån bindning</span>
            </div>

            {/* Bokningen påbörjas här. Ytan följer med som ?sqm= tillsammans
                med rabattkoden, så kunden landar i bokningen med både pris
                och rabatt på plats. */}
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
                Rabattkoden {KOD} följer med automatiskt. Välj 6 eller 12 månaders bindning i bokningen.
              </p>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2.5 text-sm font-medium text-text-secondary border-t border-text-primary/10 pt-6">
              {["Samma team varje gång", "100 % nöjdgaranti", "Betala i efterskott"].map((punkt) => (
                <div key={punkt} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{punkt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Så fungerar det */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Så fungerar kampanjen</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEG.map((s, i) => (
              <li key={s.rubrik} className="bg-bg-primary p-6 sm:p-8">
                <span className="block text-accent-deep text-sm font-bold tracking-widest uppercase mb-3">
                  Steg {i + 1}
                </span>
                <h3 className="text-xl font-bold mb-2">{s.rubrik}</h3>
                <p className="text-text-secondary leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prisexempel */}
      <section className="section-spacing bg-bg-primary border-t border-text-primary/5">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Vad det blir i kronor</h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            Exempel: 70 kvm, städning varannan vecka, pris per städning efter RUT-avdrag. Ditt pris
            beror på bostadens storlek och hur ofta du vill ha städning – du ser det exakta priset
            direkt i bokningen.
          </p>
          <div className="bg-white overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-text-primary/10 text-sm text-text-secondary">
                  <th className="p-4 sm:p-5 font-medium">Bindningstid</th>
                  <th className="p-4 sm:p-5 font-medium">T.o.m. 31 dec 2026</th>
                  <th className="p-4 sm:p-5 font-medium">Från 1 jan 2027</th>
                </tr>
              </thead>
              <tbody>
                {EXEMPEL.map((e) => (
                  <tr key={e.bindning} className="border-b border-text-primary/5 last:border-0">
                    <td className="p-4 sm:p-5 font-bold">{e.bindning}</td>
                    <td className="p-4 sm:p-5">
                      <span className="font-bold text-accent-deep text-lg">{kr(e.kampanj)}</span>{" "}
                      <span className="text-text-secondary line-through text-sm">{kr(e.ordinarie)}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-text-secondary">{kr(e.ordinarie)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Gäller / gäller inte */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-4xl grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Kampanjen gäller</h2>
            <ul className="space-y-4">
              {GALLER.map((p) => (
                <li key={p} className="flex items-start gap-3 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-text-primary">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Kampanjen gäller inte</h2>
            <ul className="space-y-4">
              {GALLER_INTE.map((p) => (
                <li key={p} className="flex items-start gap-3 text-lg">
                  <XCircle className="w-6 h-6 text-text-secondary/60 shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Vanliga frågor */}
      <section className="section-spacing bg-bg-primary border-t border-text-primary/5">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Vanliga frågor</h2>
          <div className="divide-y divide-text-primary/10 bg-white">
            {FRAGOR.map((f, i) => (
              <div key={f.fraga}>
                <button
                  type="button"
                  onClick={() => setOppen(oppen === i ? null : i)}
                  aria-expanded={oppen === i}
                  className="w-full flex items-center justify-between gap-4 text-left p-5 sm:p-6 font-bold text-lg"
                >
                  {f.fraga}
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${oppen === i ? "rotate-180" : ""}`} />
                </button>
                {oppen === i && (
                  <p className="px-5 sm:px-6 pb-6 -mt-1 text-text-secondary leading-relaxed">{f.svar}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avslutande uppmaning */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          <div className="bg-bg-primary p-8 sm:p-10">
            <p className="text-text-primary text-lg leading-relaxed mb-6">
              Boka ditt städabonnemang med koden <strong className="font-bold">{KOD}</strong> och få 30 % på
              varje städning resten av året. Erbjudandet gäller till och med 31 december 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={boka}
                onClick={() => track("booking_click", { source: "kampanj_h007_botten" })}
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
            <p className="text-xs text-text-secondary mt-6 leading-relaxed">
              Villkor: Rabatten 30 % gäller återkommande hemstädning med 6 eller 12 månaders bindningstid
              som bokas med koden {KOD} senast 31 december 2026, och dras på städningar som utförs till och
              med 31 december 2026. Därefter gäller ordinarie pris för vald bindningstid. Bindningstiden
              räknas från första städtillfället. Gäller inte engångsstädning, andra tjänster eller
              abonnemang utan bindning eller med 3 månaders bindning. Kan inte kombineras med andra
              rabattkoder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
