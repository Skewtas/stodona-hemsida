import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import NannyTeam from "../components/NannyTeam";
import NannyPricing from "../components/NannyPricing";
import NannyTrial from "../components/NannyTrial";
import NannyWizard from "../components/NannyWizard";
import AnswerFirst from "../components/AnswerFirst";
import HeroVideo from "../components/HeroVideo";
import { NANNY_PLANS, NANNY_TRIAL as NANNY_TRIAL_OFFER } from "../nannyData";
import {
  Baby,
  Heart,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  BookOpen,
  Utensils,
  Moon,
  Users,
  Loader2,
  BadgeCheck,
} from "lucide-react";

const trustChips = [
  { icon: ShieldCheck, label: "Utdrag ur belastningsregister" },
  { icon: Heart, label: "HLR- & första hjälpen-utbildade" },
  { icon: BadgeCheck, label: "Personligt intervjuade & referenstagna" },
  { icon: ShieldCheck, label: "Fullt ansvarsförsäkrade" },
];

const services = [
  {
    icon: Baby,
    title: "Barnpassning i hemmet",
    text: "Trygg passning hemma hos er, dag som kväll, med lek och närvaro anpassad efter barnets ålder.",
    img: "/tjanst-barnpassning-hemmet.jpg",
    alt: "Barnvakt sitter i soffan med två barn hemma i vardagsrummet",
  },
  {
    icon: Clock,
    title: "Hämtning & lämning",
    text: "Hämtning från förskola, skola eller aktiviteter – vi finns där när ni inte kan.",
    img: "/tjanst-hamtning-lamning.jpg",
    alt: "Barnvakt och barn leker utomhus efter hämtning från förskolan",
  },
  {
    icon: BookOpen,
    title: "Stöd med läxorna",
    text: "Barnvakten sitter med när läxorna ska göras – en naturlig del av passningen, inte något ni bokar separat.",
    img: "/tjanst-laxhjalp.jpg",
    alt: "Barn som sitter med sina läxor tillsammans med sin barnvakt",
  },
  {
    icon: Utensils,
    title: "Mellanmål & måltider",
    text: "Näringsriktiga mellanmål och enkla måltider tillagade med omtanke.",
    img: "/tjanst-maltider.jpg",
    alt: "Ljust kök där mellanmål och måltider lagas",
  },
  {
    icon: Moon,
    title: "Kvälls- & helgpassning",
    text: "Perfekt för föräldrar som behöver en kväll för sig själva – vi passar tills ni är hemma.",
    img: "/tjanst-kvallspassning.jpg",
    alt: "Lugn kvällsstund med barnvakt och barn i sängen",
  },
  {
    icon: Users,
    title: "Regelbundet eller tillfälligt",
    text: "Fast barnvakt varje vecka eller enstaka tillfällen – helt efter era behov.",
    img: "/tjanst-regelbundet.jpg",
    alt: "Familj med två barn hemma i soffan",
  },
];

const promises = [
  "Samma trygga ansikte så ofta som möjligt – kontinuitet skapar trygghet.",
  "Full transparens: du får veta exakt vem som kommer, och kan alltid nå oss.",
  "Inga bindningstider – du bestämmer takten.",
  "Nöjd-förälder-garanti: känns det inte rätt gör vi om matchningen kostnadsfritt.",
];

const faqs = [
  {
    q: "Vad kostar en barnvakt i Stockholm?",
    a: "Hos Stodona kostar barnpassning från 199 kr i timmen efter RUT-avdrag. Flex utan fast månadsvolym ligger på 269 kr/tim, Mini (8 tim/mån) på 229 kr/tim, Familj (16 tim/mån) på 209 kr/tim och Familj Plus (från 32 tim/mån) på 199 kr/tim. Alla priser är vad du faktiskt betalar, med RUT-avdraget redan avdraget.",
  },
  {
    q: "Gäller RUT-avdrag för barnpassning?",
    a: "Ja. Barnpassning i hemmet och hämtning eller lämning på förskola och skola är RUT-berättigat, så du betalar 50 % av arbetskostnaden. Stodona drar av det direkt på fakturan och sköter administrationen mot Skatteverket. Vi säljer inte läxhjälp som egen tjänst – att barnvakten sitter med vid läxorna ingår i passningen. Ren undervisning är däremot något annat och omfattas inte av RUT.",
  },
  {
    q: "Vad är skillnaden mellan barnvakt och nanny?",
    a: "En barnvakt anlitas oftast vid enstaka tillfällen, till exempel en kväll. En nanny är en återkommande barnvakt med fast schema som blir en del av familjens vardag och ofta hjälper till med hämtning, mellanmål och rutiner. Hos Stodona får du båda delarna – du väljer själv om du vill boka vid behov eller ha ett fast upplägg.",
  },
  {
    q: "Hur vet jag att barnvakten är trygg?",
    a: "Alla våra barnvakter är personligt intervjuade, referenstagna och kontrollerade mot belastningsregistret. De är dessutom utbildade i HLR och första hjälpen för barn.",
  },
  {
    q: "Får vi samma barnvakt varje gång?",
    a: "Vi strävar alltid efter kontinuitet och matchar er med en fast barnvakt. Vid behov har vi en trygg ersättare som också känner er familj.",
  },
  {
    q: "Hur snabbt kan ni börja?",
    a: "Efter ett kort kartläggningssamtal matchar vi er oftast med rätt barnvakt inom några dagar. Behöver ni hjälp akut – hör av er så gör vi vårt bästa.",
  },
  {
    q: "Vilka åldrar passar ni?",
    a: "Vi hjälper familjer med barn i alla åldrar, från de allra minsta till skolbarn. Berätta om era behov så matchar vi rätt kompetens.",
  },
  {
    q: "Vilka områden i Stockholm arbetar ni i?",
    a: "Vi erbjuder barnpassning i hela Stockholm med omnejd, bland annat Östermalm, Vasastan, Södermalm, Bromma, Solna, Sundbyberg, Lidingö, Nacka, Danderyd, Djursholm, Täby, Sollentuna, Ekerö och Järfälla.",
  },
  {
    q: "Är det bindningstid på barnpassningen?",
    a: "Nej. Barnpassningen har ingen bindningstid – du bestämmer takten och kan ändra eller avsluta upplägget när det passar er familj.",
  },
  {
    q: "Kan vi prova innan vi bestämmer oss?",
    a: "Ja. Nya familjer kan boka tre timmars barnpassning för 799 kr efter RUT-avdrag, en gång per familj. Då får ni träffa en barnvakt och se hur det fungerar innan ni väljer upplägg.",
  },
];

// Områden vi tar uppdrag i. Används både i schemat och i den synliga listan,
// så strukturerad data och sidinnehåll alltid säger samma sak.
const AREAS = [
  "Stockholm", "Östermalm", "Vasastan", "Södermalm", "Kungsholmen", "Bromma",
  "Solna", "Sundbyberg", "Lidingö", "Nacka", "Danderyd", "Djursholm",
  "Täby", "Sollentuna", "Ekerö", "Järfälla", "Huddinge", "Upplands Väsby",
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://stodona.se/barnpassning#service",
  name: "Barnpassning och barnvakt i Stockholm",
  alternateName: ["Barnvakt", "Nanny", "Barnpassning"],
  serviceType: "Barnpassning",
  description:
    "Barnpassning och fast barnvakt (nanny) i Stockholm med referenstagna och HLR-utbildade barnvakter, kontrollerade mot belastningsregistret. RUT-avdrag gäller för barnpassning i hemmet samt hämtning och lämning.",
  url: "https://stodona.se/barnpassning",
  provider: { "@id": "https://stodona.se/#business" },
  areaServed: AREAS.map((name) => ({ "@type": "City", name })),
  audience: { "@type": "Audience", audienceType: "Barnfamiljer" },
  offers: [
    {
      "@type": "Offer",
      name: `Prova på barnpassning – ${NANNY_TRIAL_OFFER.hours} timmar`,
      description: "Prova-på-pass för nya familjer, en gång per familj. Pris efter RUT-avdrag.",
      price: NANNY_TRIAL_OFFER.price,
      priceCurrency: "SEK",
      availability: "https://schema.org/InStock",
      url: "https://stodona.se/ny-kund",
    },
    ...NANNY_PLANS.map((plan) => ({
      "@type": "Offer",
      name: `Barnpassning ${plan.name}`,
      description: plan.tagline,
      priceCurrency: "SEK",
      availability: "https://schema.org/InStock",
      url: "https://stodona.se/ny-kund",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.hourly,
        priceCurrency: "SEK",
        unitCode: "HUR",
        unitText: "timme",
        valueAddedTaxIncluded: true,
        description: "Pris per timme efter RUT-avdrag",
      },
    })),
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
    { "@type": "ListItem", position: 2, name: "Barnpassning", item: "https://stodona.se/barnpassning" },
  ],
};

const GUIDES = [
  {
    to: "/blogg/vad-kostar-barnvakt-stockholm",
    title: "Vad kostar en barnvakt i Stockholm?",
    text: "Timpriser, månadskostnad och vad RUT-avdraget faktiskt drar av.",
  },
  {
    to: "/blogg/barnvakt-rut-avdrag",
    title: "Barnvakt och RUT-avdrag",
    text: "Vad som omfattas av RUT vid barnpassning – och vad som inte gör det.",
  },
  {
    to: "/blogg/barnvakt-nanny-au-pair-skillnad",
    title: "Barnvakt, nanny eller au pair?",
    text: "Skillnaden i upplägg, kostnad och vem som bär arbetsgivaransvaret.",
  },
  {
    to: "/blogg/hitta-trygg-barnvakt-checklista",
    title: "Så hittar du en trygg barnvakt",
    text: "Sju frågor att ställa innan någon får komma hem till barnen.",
  },
];

export default function Barnpassning() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Barnvakt & barnpassning i Stockholm – nanny från 199 kr/tim | Stodona</title>
        <meta
          name="description"
          content="Trygg barnvakt och barnpassning i Stockholm. Referenstagna, HLR-utbildade nannys kontrollerade mot belastningsregistret. Från 199 kr/tim efter RUT-avdrag. Prova 3 timmar för 799 kr."
        />
        <link rel="canonical" href="https://stodona.se/barnpassning" />
        <meta property="og:title" content="Barnvakt & barnpassning i Stockholm | Stodona" />
        <meta property="og:description" content="Trygg barnvakt och nanny i Stockholm. Från 199 kr/tim efter RUT-avdrag. Prova 3 timmar för 799 kr." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/barnpassning" />
        <meta property="og:image" content="https://stodona.se/familj-stodona.jpg" />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-28 pb-20 overflow-hidden text-text-light">
        <div className="absolute inset-0 z-0">
          <HeroVideo
            src="/barnpassning-lek-ute.mp4"
            poster="/barnpassning-lek-ute-poster.jpg"
            alt="Barnvakt som leker ute med barn"
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ filter: "brightness(0.92) contrast(1.02) saturate(1.08)" }}
          />
          <div className="absolute inset-0 bg-bg-dark/25"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark/75 via-bg-dark/40 to-bg-dark/15"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6 drop-shadow-xl">
              Barnvakt och barnpassning i Stockholm
            </h1>
            <p className="text-lg sm:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-4 drop-shadow-md">
              Behöver du också hjälp att få ihop vardagen med barnen? Noggrant utvalda
              nannys med erfarenhet av barn i alla åldrar – från 199 kr i timmen efter
              RUT-avdrag.
            </p>
            <p className="text-base text-text-light/75 max-w-2xl leading-relaxed mb-10 drop-shadow-md">
              Referenstagna, HLR-utbildade och kontrollerade mot belastningsregistret.
              Ingen bindningstid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/ny-kund" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
                Boka barnpassning
              </Link>
              <Link to="/ny-kund" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 backdrop-blur-sm">
                Få pris och info
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Svar först (GEO) – kort, direkt och citerbart svar högst upp. */}
      <AnswerFirst
        heading="Kort om barnpassning hos Stodona"
        answer={
          <>
            Stodona erbjuder <strong className="text-text-primary">barnvakt och barnpassning i Stockholm</strong>{" "}
            – både enstaka kvällar och fast nanny med återkommande schema. Alla barnvakter är personligt
            intervjuade, referenstagna, kontrollerade mot belastningsregistret och utbildade i HLR och första
            hjälpen för barn. Priset börjar på{" "}
            <strong className="text-text-primary">199 kr i timmen efter RUT-avdrag</strong>, och nya familjer kan
            prova tre timmar för 799 kr. RUT-avdraget gäller barnpassning i hemmet samt hämtning och lämning på
            förskola och skola – vi drar av det direkt på fakturan. Ingen bindningstid.
          </>
        }
        facts={[
          { label: "Pris", value: "Från 199 kr/tim efter RUT" },
          { label: "Prova på", value: "3 timmar för 799 kr" },
          { label: "Trygghet", value: "Referenstagna & HLR-utbildade" },
          { label: "Område", value: "Stockholm med omnejd" },
        ]}
      />

      {/* Trust chips */}
      <section className="bg-bg-dark text-text-light py-6 border-t border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustChips.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-cta-hover" />
                </div>
                <span className="text-sm font-medium text-text-light/85">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova-på-erbjudande */}
      <NannyTrial />

      {/* Intro / emotional */}
      <section className="relative py-28 md:py-40 overflow-hidden text-text-light">
        <HeroVideo
          src="/barnpassning-familj.mp4"
          poster="/barnpassning-familj-poster.jpg"
          alt="Familj hemma tillsammans med sin barnvakt"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "contrast(1.12) saturate(1.12)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/90 via-bg-dark/70 to-bg-dark/35"></div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Därför Stodona
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Att lämna sitt barn är det största förtroende som finns.
            </h2>
            <p className="text-lg md:text-xl text-text-light/85 leading-relaxed mb-8">
              Vi tar det på största allvar. Varje barnvakt vi skickar hem till dig är
              utvald med samma omsorg som vi själva skulle kräva för våra egna barn –
              varm, ansvarsfull och noggrant kontrollerad. Du ska kunna gå ut genom
              dörren med ett lugnt hjärta.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {["Trygga rutiner", "Samma ansikte varje gång", "Alltid nåbara"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-sm font-medium px-4 py-2 rounded-full"
                >
                  <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                  {t}
                </span>
              ))}
            </div>
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-xl px-5 py-4 text-text-primary">
              <div className="w-11 h-11 rounded-full bg-cta-hover/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-cta-hover" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">1 av 10</p>
                <p className="text-xs text-text-secondary">sökande blir barnvakt hos oss</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Så kan vi hjälpa er</h2>
            <p className="text-text-secondary text-lg">
              Flexibel hjälp anpassad efter er vardag – från enstaka kvällar till fast barnvakt.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group bg-bg-primary rounded-3xl overflow-hidden hover:bg-bg-dark hover:text-text-light transition-colors duration-300"
              >
                <div className="relative">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={s.img}
                      alt={s.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/35 to-transparent"></div>
                  </div>
                  <div className="absolute -bottom-7 left-8 w-14 h-14 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 flex items-center justify-center">
                    <s.icon className="w-7 h-7 text-cta-hover" />
                  </div>
                </div>
                <div className="p-8 pt-12">
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-text-secondary group-hover:text-text-light/80 leading-relaxed transition-colors duration-300">
                    {s.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bildband – vardagen med en barnvakt */}
      <section className="relative py-28 md:py-40 overflow-hidden text-text-light">
        <img
          src="/barnpassning-band.jpg"
          alt="Barnvakt som läser tillsammans med två barn"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          width="1600"
          height="660"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/90 via-bg-dark/65 to-bg-dark/25"></div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <Sparkles className="w-9 h-9 text-cta-hover mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
              Lek, läxor, mellanmål och lugna kvällar
            </h2>
            <p className="text-lg text-text-light/85 leading-relaxed mb-8">
              En Stodona-barnvakt är närvarande på riktigt. Ingen mobil i handen –
              utan lek på golvet, sagor i soffan och en trygg rutin som gör kvällen
              lika lugn för barnen som för er.
            </p>
            <div className="flex flex-wrap gap-3">
              {["HLR-utbildade", "Referenstagna", "Belastningsregister", "Försäkrade"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-sm font-medium px-4 py-2 rounded-full"
                >
                  <ShieldCheck className="w-4 h-4 text-cta-hover" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hemservice i samband med barnpassning */}
      <section className="section-spacing bg-bg-dark text-text-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase mb-6">
                <Sparkles className="w-4 h-4 text-cta-hover" /> Barnpassning + hemservice
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Vi tar hand om hemmet – medan vi tar hand om barnen
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed mb-6">
                Stodona började som ett av Stockholms mest anlitade servicebolag. Det
                betyder att vi gärna hjälper till med hemmet i samband med
                barnpassningen – lättare hushållssysslor ingår naturligt under passet,
                och vill ni ha mer kan vi ordna en riktig städning samtidigt. Allt
                samlat hos en och samma trygga leverantör.
              </p>
              <Link
                to="/"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shrink-0"
              >
                Utforska hemservice
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src="/stodona_left_image.jpg"
                  alt="Nystädat kök i ett hem"
                  loading="lazy"
                  className="w-full h-56 md:h-72 object-cover"
                  width="800"
                  height="1600"
                />
              </div>
              <ul className="space-y-4">
              {[
                "Lättare hushållssysslor under passet – disk, plocka undan och ordning i barnens rum.",
                "Vill ni ha en riktig städning? Vi bokar in vårt städteam i samband med barnpassningen.",
                "En kontakt för både barn och hem – enkelt, tryggt och sömlöst.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-light/90 font-medium">{point}</span>
                </li>
              ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Priser & upplägg */}
      <NannyPricing />

      {/* Barnvakter */}
      <NannyTeam />

      {/* Promise */}
      <section className="section-spacing bg-cta-hover/15">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
                Vårt löfte till dig
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Trygghet, öppenhet och äkta omtanke
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                Vi bygger den här tjänsten på samma värderingar som gjort tusentals
                Stockholmare trygga med att släppa in oss i sina hem. Nu tar vi samma
                omsorg ett steg längre – till det finaste ni har.
              </p>
              <div className="rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src="/barnpassning-lasstund.jpg"
                  alt="Barnvakt och barn under en lässtund"
                  loading="lazy"
                  className="w-full h-64 md:h-80 object-cover"
                  width="1536"
                  height="887"
                />
              </div>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                  <span className="text-text-primary font-medium">{p}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* Områden – lokal relevans på hubben i stället för tunna undersidor. */}
      <section className="py-16 bg-bg-primary border-t border-text-primary/5">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Barnpassning i hela Stockholm
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Vi tar uppdrag i Stockholms innerstad och kranskommunerna. Bor ni utanför listan
            – hör av er ändå, vi löser det oftast.
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {AREAS.map((area) => (
              <li
                key={area}
                className="px-4 py-2 rounded-full bg-white border border-text-primary/5 text-sm font-medium text-text-secondary"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Vanliga frågor</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-bg-primary rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cta-hover shrink-0" />
                  {f.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-7">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guider – knyter ihop klustret och ger vägar in från söktrafik. */}
      <section className="py-16 bg-bg-primary border-t border-text-primary/5">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Läs mer innan ni bestämmer er
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GUIDES.map((g) => (
              <Link
                key={g.to}
                to={g.to}
                className="group bg-white rounded-2xl p-6 border border-text-primary/5 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold mb-1.5 group-hover:text-cta-hover transition-colors">
                  {g.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{g.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* För företag CTA */}
      <section className="py-16 bg-bg-dark text-text-light">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-4">
              För företag
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Barnpassning som personalförmån</h2>
            <p className="text-text-light/75">
              Stötta era medarbetare i småbarnslivet – behåll talanger, minska frånvaro
              och stärk er employer branding.
            </p>
          </div>
          <Link to="/barnpassning-foretag" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shrink-0">
            Läs mer för företag
          </Link>
        </div>
      </section>

      {/* Rekrytering CTA */}
      <section className="py-14 bg-cta-hover text-text-primary">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">Vill du jobba som barnvakt?</h2>
            <p className="text-text-primary/80">
              Vi söker varma, ansvarsfulla personer som älskar barn. Bli en del av Stodona.
            </p>
          </div>
          <Link to="/jobba-som-barnvakt" className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4 shrink-0">
            Sök jobb som barnvakt
          </Link>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="forfragan" className="section-spacing bg-bg-dark text-text-light scroll-mt-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
                Kostnadsfritt & förutsättningslöst
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Låt oss lära känna er familj
              </h2>
              <p className="text-text-light/80 text-lg leading-relaxed mb-8">
                Berätta lite om era behov så hör vi av oss med ett förslag på rätt
                barnvakt – helt utan förpliktelser. Vill du hellre prata direkt?
              </p>
              <div className="space-y-3">
                <a href="tel:0101780150" className="flex items-center gap-3 text-text-light hover:text-cta-hover transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Phone className="w-5 h-5 text-cta-hover" /></div>
                  010-178 01 50
                </a>
                <a href="mailto:info@stodona.se" className="flex items-center gap-3 text-text-light hover:text-cta-hover transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Mail className="w-5 h-5 text-cta-hover" /></div>
                  info@stodona.se
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <NannyWizard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
