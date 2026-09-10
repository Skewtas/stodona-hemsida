import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { CheckCircle2, HelpCircle, ArrowRight, Sparkles, Info } from "lucide-react";
import { motion } from "motion/react";
import WhyStodona from "../components/WhyStodona";
import AnswerFirst from "../components/AnswerFirst";
import TrustBar from "../components/TrustBar";
import { bookingUrl } from "../utils/bookingUrl";
import { prisFor } from "../data/prices.generated";

/**
 * PRISSIDAN.
 *
 * Beloppen kommer från src/data/prices.generated.ts, som scripts/fetch-prices.mjs
 * hämtar ur bokningssystemets prismotor före varje bygge. Ingen siffra skrivs
 * för hand här – sidan och bokningen kan därför inte glida isär.
 */
const kr = (n: number) => `${Math.round(n).toLocaleString("sv-SE")} kr`;

// Bostadstyperna mappas mot den yta prismotorn får representera dem.
const PRICE_EXAMPLES = [
  { home: "1 rum och kök", size: "Upp till 45 kvm", sqm: 45 },
  { home: "2 rum och kök", size: "45–65 kvm", sqm: 65 },
  { home: "3 rum och kök", size: "65–85 kvm", sqm: 85 },
  { home: "4 rum och kök", size: "85–110 kvm", sqm: 110 },
  { home: "Villa eller radhus", size: "110–150 kvm", sqm: 150 },
].map((e) => {
  const p = prisFor(e.sqm);
  return { ...e, fritt: p.utanBindning, bundet: p.m12 };
});

// Referensbostaden i löptexten: en trea, 85 kvm, städad varannan vecka.
const TREA = prisFor(85);
const MINSTA = prisFor(45);

const SERVICE_PRICING = [
  {
    name: "Hemstädning",
    to: "/hemstadning",
    price: `Från ${kr(MINSTA.utanBindning)} per tillfälle`,
    note: "Halva arbetskostnaden efter RUT",
    drivers: "Yta, hur ofta du städar och hemmets skick. Regelbunden städning tar mindre tid per tillfälle än enstaka besök.",
  },
  {
    name: "Storstädning",
    to: "/storstadning",
    price: "Pris efter yta och omfattning",
    note: "Fast pris på begäran",
    drivers: "Yta och hur djupgående rengöringen ska vara – ugn, kyl/frys, skåp invändigt och avkalkning tar tid.",
  },
  {
    name: "Flyttstädning",
    to: "/flyttstadning",
    price: "Fast pris per uppdrag",
    note: "Besiktningsgaranti ingår",
    drivers: "Bostadens storlek och skick. Vi tar med allt material och all utrustning.",
  },
  {
    name: "Fönsterputsning",
    to: "/fonsterputsning",
    price: "Pris per uppdrag",
    note: "Ofta i kombination med städning",
    drivers: "Antal fönster, fönstertyp (delbara eller ej) och åtkomst – höga våningar kräver särskild utrustning.",
  },
  {
    name: "Företagsstädning",
    to: "/foretagsstadning",
    price: "Offert",
    note: "RUT gäller inte företag",
    drivers: "Lokalens yta, städfrekvens och schema. Företag drar av städningen som vanlig driftkostnad.",
  },
  {
    name: "Byggstädning",
    to: "/byggstadning",
    price: "Offert",
    note: "Grov- och finstädning",
    drivers: "Projektets storlek, mängden byggdamm och om det gäller grovstädning, finstädning eller båda.",
  },
];

const PRICE_FACTORS = [
  {
    title: "Ytan",
    body: "Den största enskilda faktorn. Fler kvadratmeter och fler rum tar längre tid – därför utgår priset från hemmets storlek.",
  },
  {
    title: "Hur ofta du städar",
    body: "Varje vecka eller varannan vecka håller hemmet i jämn nivå och tar kortare tid per tillfälle än en enstaka städning.",
  },
  {
    title: "Hemmets skick",
    body: "Husdjur, mycket lösa saker på ytorna eller lång tid sedan senaste städningen gör att uppdraget tar längre tid.",
  },
  {
    title: "Tillval",
    body: "Fönsterputsning, ugn eller kyl/frys invändigt och andra tillägg bokas separat och läggs på priset.",
  },
];

const INCLUDED = [
  "Samma team varje gång – de lär känna ditt hem",
  "Ansvarsförsäkring och kollektivavtalsenliga villkor för alla anställda",
  "100 % nöjd-kund-garanti – vi kommer tillbaka och åtgärdar utan extra kostnad",
  "All administration kring RUT-avdraget",
  "Ingen bindningstid och inga dolda avgifter",
  "Miljövänliga och professionella rengöringsprodukter",
];

const FAQS = [
  {
    q: "Vad kostar hemstädning hos Stodona?",
    a: `Priset baseras på bostadens storlek och hur ofta du städar. En trea på 65–85 kvm som städas varannan vecka kostar ${kr(TREA.utanBindning)} per tillfälle efter RUT-avdrag, eller ${kr(TREA.m12)} med tolv månaders abonnemang. Du ser ditt exakta pris direkt i bokningen.`,
  },
  {
    q: "Hur mycket sparar jag på RUT-avdraget?",
    a: "RUT-avdraget ger 50 % rabatt på arbetskostnaden, upp till 75 000 kr per person och år. Vi drar av det direkt på fakturan och ansöker om resten hos Skatteverket – du behöver inte göra något själv.",
  },
  {
    q: "Kan jag få ett fast pris?",
    a: "Ja. Priset du ser i bokningen är redan per städtillfälle, men vill du ha ett skriftligt fast pris för ett längre upplägg tar vi fram det – hör av dig.",
  },
  {
    q: "Hur betalar jag?",
    a: "Vi skickar faktura efter utförd tjänst med 10 dagars betalningsvillkor. RUT-avdraget är redan avdraget på fakturan.",
  },
  {
    q: "Tillkommer det kostnader för städmaterial?",
    a: "Vid hemstädning och storstädning använder vi ditt eget städmaterial – du behöver ha grundläggande rengöringsprodukter och en fungerande dammsugare hemma. Vid flyttstädning, fönsterputsning, byggstädning och trappstädning tar vi med allt material och all utrustning.",
  },
  {
    q: "Har ni bindningstid?",
    a: "Nej. Du kan pausa eller avsluta ditt abonnemang när du vill, med en kalendermånads uppsägning. Vi behåller kunder genom kvalitet, inte kontrakt.",
  },
  {
    q: "Vad kostar barnpassning?",
    a: "Barnpassning har egna paketpriser från 199 kr per timme efter RUT, och du kan prova 3 timmar för 799 kr efter RUT. Se alla paket på vår sida om barnpassning.",
  },
];

export default function Priser() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Hemstädning",
    provider: { "@type": "LocalBusiness", name: "Stodona", "@id": "https://stodona.se/#business" },
    areaServed: { "@type": "City", name: "Stockholm" },
    url: "https://stodona.se/priser",
    offers: {
      "@type": "Offer",
      priceCurrency: "SEK",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: TREA.utanBindning,
        priceCurrency: "SEK",
        valueAddedTaxIncluded: true,
        description:
          "Pris per städtillfälle efter RUT-avdrag för en bostad på 65–85 kvm som städas varannan vecka. Priset varierar med bostadens storlek och städfrekvens.",
      },
      availability: "https://schema.org/InStock",
      url: "https://stodona.se/boka-stadning",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
      { "@type": "ListItem", position: 2, name: "Priser", item: "https://stodona.se/priser" },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Priser på städning i Stockholm 2026 | Stodona</title>
        <meta name="description" content={`Vad kostar städning i Stockholm? Priset baseras på bostadens storlek – en trea kostar ${kr(TREA.utanBindning)} per tillfälle efter RUT. Se prisexempel per bostadsstorlek och boka online.`} />
        <meta property="og:title" content="Priser på städning i Stockholm | Stodona" />
        <meta property="og:description" content="Priser på städning i Stockholm – prisexempel per bostadsstorlek, efter RUT-avdrag." />
        <meta property="og:url" content="https://stodona.se/priser" />
        <link rel="canonical" href="https://stodona.se/priser" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(offerSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden bg-bg-dark text-text-light">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <nav className="text-sm text-text-light/60 mb-5" aria-label="Brödsmulor">
            <Link to="/" className="hover:text-cta-hover">Hem</Link> <span className="mx-1.5">/</span>
            <span className="text-text-light/80">Priser</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1]"
          >
            Priser på städning <span className="italic font-normal text-cta-hover">i Stockholm</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-text-light/80 mb-10"
          >
            Priset baseras på bostadens storlek – med RUT-avdrag betalar du bara halva arbetskostnaden.
            Här ser du prisexempel per bostadsstorlek, vad som påverkar priset och hur du får ett exakt pris.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href={bookingUrl()} className="btn-primary bg-cta-hover text-text-primary px-8 py-4 text-lg">
              Se pris & boka online
            </a>
            <Link to="/kontakt" className="btn-secondary px-8 py-4 text-lg border-text-light text-text-light hover:bg-white hover:text-bg-dark">
              Be om fast pris
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Svar först */}
      <AnswerFirst
        heading="Vad kostar städning hos Stodona?"
        answer={
          <>
            Priset baseras på <strong className="text-text-primary">bostadens storlek och hur ofta du städar</strong>.
            Som privatperson betalar du bara halva arbetskostnaden tack vare RUT-avdraget. En vanlig trea på 65–85 kvm
            som städas varannan vecka landar på{" "}
            <strong className="text-text-primary">{kr(TREA.utanBindning)} per städtillfälle</strong> efter RUT – eller{" "}
            <strong className="text-text-primary">{kr(TREA.m12)}</strong> med tolv månaders abonnemang. Du ser ditt exakta
            pris direkt i bokningen. Inga dolda avgifter.
          </>
        }
        facts={[
          { label: "Trea, varannan vecka", value: `${kr(TREA.utanBindning)} efter RUT` },
          { label: "Med abonnemang", value: `Från ${kr(TREA.m12)}` },
          { label: "RUT-tak", value: "75 000 kr/person/år" },
          { label: "Betalning", value: "Faktura, 10 dagar" },
        ]}
      />

      {/* Prisexempel */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prisexempel för hemstädning</h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Så här brukar det landa för återkommande hemstädning varannan vecka. Tiderna är riktvärden – exakt tid och
              pris för just ditt hem får du direkt i bokningen.
            </p>

            <div className="overflow-x-auto rounded-3xl border border-text-primary/10">
              <table className="w-full text-left border-collapse bg-white min-w-[560px]">
                <caption className="sr-only">Prisexempel för hemstädning per bostadsstorlek</caption>
                <thead>
                  <tr className="bg-bg-primary text-sm uppercase tracking-widest">
                    <th scope="col" className="p-4 font-bold">Bostad</th>
                    <th scope="col" className="p-4 font-bold">Storlek</th>
                    <th scope="col" className="p-4 font-bold">Per tillfälle</th>
                    <th scope="col" className="p-4 font-bold text-cta-hover">Med abonnemang</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_EXAMPLES.map((e) => (
                    <tr key={e.home} className="border-t border-text-primary/10">
                      <th scope="row" className="p-4 font-bold text-text-primary">{e.home}</th>
                      <td className="p-4 text-text-secondary">{e.size}</td>
                      <td className="p-4 text-text-secondary">{kr(e.fritt)}</td>
                      <td className="p-4 font-bold text-text-primary">{kr(e.bundet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="flex gap-3 items-start text-sm text-text-secondary mt-5">
              <Info className="w-5 h-5 text-cta-hover shrink-0" />
              <span>
                Priserna avser hemstädning varannan vecka, per städtillfälle, inklusive moms och efter RUT-avdrag.
                Kolumnen längst till höger visar priset med tolv månaders abonnemang. Enstaka städningar och
                storstädning prissätts separat.
              </span>
            </p>

            <TrustBar className="mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Pris per tjänst */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pris per tjänst</h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-2xl">
            Städtjänster till privatpersoner berättigar till RUT-avdrag, vilket halverar arbetskostnaden. För större
            uppdrag och företag lämnar vi en offert.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_PRICING.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-3xl p-7 border border-text-primary/5 shadow-sm flex flex-col"
              >
                <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                <p className="text-2xl font-bold text-cta-hover mb-1">{s.price}</p>
                <p className="text-xs uppercase tracking-widest text-text-secondary/70 mb-4">{s.note}</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-5 grow">{s.drivers}</p>
                <Link to={s.to} className="text-sm font-bold inline-flex items-center gap-1.5 hover:text-cta-hover transition-colors">
                  Läs mer om {s.name.toLowerCase()} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-text-secondary mt-8">
            Letar du efter barnpassning? Den har egna paketpriser från 199 kr/tim efter RUT –{" "}
            <Link to="/barnpassning" className="text-cta-hover font-medium hover:underline">se paketen för barnpassning</Link>.
          </p>
        </div>
      </section>

      {/* Vad påverkar priset + varför inga färdiga prislistor */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-14">
            <div>
              <h2 className="text-3xl font-bold mb-6">Vad påverkar priset?</h2>
              <p className="text-text-secondary mb-8 leading-relaxed">
                Priset är aldrig en gissning. Fyra saker avgör vad just din städning kostar:
              </p>
              <dl className="space-y-6">
                {PRICE_FACTORS.map((f) => (
                  <div key={f.title}>
                    <dt className="font-bold text-lg mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cta-hover" /> {f.title}
                    </dt>
                    <dd className="text-text-secondary leading-relaxed">{f.body}</dd>
                  </div>
                ))}
              </dl>

              <h2 className="text-3xl font-bold mt-12 mb-6">Så fungerar RUT-avdraget</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                RUT-avdraget är en skattereduktion som gör att du bara betalar 50 % av arbetskostnaden för hushållsnära
                tjänster. Taket är 75 000 kr per person och år – bor ni två vuxna i hushållet kan ni utnyttja två tak.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Du behöver inte göra något själv: vi drar av RUT direkt på fakturan och ansöker om resten hos
                Skatteverket.{" "}
                <Link to="/rut-avdrag" className="text-cta-hover font-medium hover:underline">Läs mer om RUT-avdrag</Link>.
              </p>
            </div>

            <div className="space-y-8">
              <div className="card-rounded bg-bg-primary p-8 border border-text-primary/10">
                <h2 className="text-2xl font-bold mb-6">Det ingår alltid i priset</h2>
                <ul className="space-y-4">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <WhyStodona />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Vanliga frågor om pris</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {f.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-text-secondary mt-8">
            Fler frågor och svar hittar du i vår{" "}
            <Link to="/faq" className="text-cta-hover font-medium hover:underline">frågebank</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bg-dark text-text-light">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Få ditt pris på 60 sekunder</h2>
          <p className="text-text-light/80 mb-8">
            Fyll i bostadens storlek och önskat intervall så ser du priset direkt – RUT-avdraget är redan avdraget.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={bookingUrl()} className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 inline-flex items-center gap-2">
              Se pris & boka <ArrowRight className="w-5 h-5" />
            </a>
            <Link to="/kontakt" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark px-8 py-4">
              Kontakta oss för offert
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {[
              { label: "Hemstädning", to: "/hemstadning" },
              { label: "Flyttstädning", to: "/flyttstadning" },
              { label: "RUT-avdrag", to: "/rut-avdrag" },
              { label: "Så arbetar vi", to: "/sa-arbetar-vi" },
              { label: "Avbokning", to: "/avbokning" },
            ].map((r) => (
              <li key={r.to}>
                <Link to={r.to} className="inline-flex items-center gap-1.5 text-text-light/70 hover:text-cta-hover">
                  <CheckCircle2 className="w-4 h-4 text-cta-hover" /> {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
