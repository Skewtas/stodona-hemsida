import { Link } from "react-router-dom";
import {
  CheckCircle2,
  HelpCircle,
  DoorOpen,
  Footprints,
  WashingMachine,
  Recycle,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { motion } from "motion/react";
import WhyStodona from "../components/WhyStodona";
import ServiceSchema from "../components/ServiceSchema";

import { Helmet } from "../seo";
import BrfOffertForm from "../components/BrfOffertForm";
import AnswerFirst from "../components/AnswerFirst";

const ytor = [
  {
    icon: Footprints,
    title: "Trapphus & hiss",
    text: "Trappsteg, vilplan, ledstänger och hisspeglar – allt det där som hundra par skor passerar varje dag.",
  },
  {
    icon: DoorOpen,
    title: "Entré & glaspartier",
    text: "Fastighetens ansikte utåt. Vi ser till att det första intrycket är ett rent golv och en dörr utan fingeravtryck.",
  },
  {
    icon: WashingMachine,
    title: "Tvättstuga",
    text: "Luddet, tvättmedelsresterna och golvet under maskinerna. Färre arga lappar, fler glada grannar.",
  },
  {
    icon: Recycle,
    title: "Soprum & miljörum",
    text: "Rummet ingen vill städa. Vi gör det ändå, och vi gör det ordentligt.",
  },
  {
    icon: KeyRound,
    title: "Källare, förråd & gemensamma lokaler",
    text: "Källargångar, cykelrum, föreningslokal och övernattningsrum – ytorna som lätt hamnar mellan stolarna.",
  },
  {
    icon: Sparkles,
    title: "Fönsterputs & storstädning",
    text: "Trapphusfönster, vårens stora rengöring eller städning efter en renovering i huset. Säg till när det behövs.",
  },
];

const steg = [
  {
    title: "Vi kommer förbi",
    text: "Ett kostnadsfritt besök där vi går igenom fastigheten tillsammans. Ni pekar, vi antecknar.",
  },
  {
    title: "Ni får en tydlig offert",
    text: "Vad som ingår, hur ofta och vad det kostar – skrivet så att hela styrelsen kan säga ja på samma möte.",
  },
  {
    title: "Vi sköter resten",
    text: "Städningen rullar enligt schema och ni har en fast kontaktperson som svarar när något behöver justeras.",
  },
];

const fastigheterFaq = [
  {
    q: "Vad kostar städning för en BRF eller fastighet?",
    a: "Det beror på fastighetens storlek, antal trapphus och hur ofta ni vill ha städat. Därför lämnar vi alltid en offert efter ett kostnadsfritt besök på plats – då vet ni exakt vad som ingår och vad det kostar.",
  },
  {
    q: "Kan vi få RUT-avdrag för städningen?",
    a: "Nej, RUT-avdraget gäller bara privatpersoner och arbete i den egna bostaden. Städning av trapphus och gemensamma utrymmen faktureras föreningen eller fastighetsägaren utan RUT.",
  },
  {
    q: "Vilka utrymmen kan ni städa?",
    a: "Trapphus, hiss, entré, tvättstuga, soprum och miljörum, källargångar, cykelrum och gemensamma lokaler. Vi hjälper också till med fönsterputs och storstädning. Ni väljer vad som ska ingå.",
  },
  {
    q: "Hur ofta städar ni?",
    a: "Så ofta ni behöver. Vi lägger upp ett schema tillsammans utifrån hur mycket fastigheten används, och det går att justera i efterhand.",
  },
  {
    q: "Vem kontaktar vi om något inte blev bra?",
    a: "Er fasta kontaktperson. Hör av er så rättar vi till det – det ingår i vår kvalitetsgaranti.",
  },
  {
    q: "Vilka områden arbetar ni i?",
    a: "Vi städar fastigheter i hela Stockholm med omnejd.",
  },
];

export default function FastigheterBrf() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fastigheterFaq.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <div className="flex flex-col">
      <ServiceSchema
        serviceName="Fastighetsstädning"
        serviceType="Fastighetsstädning"
        description="Städning av trapphus, entréer, tvättstugor, soprum och gemensamma utrymmen för bostadsrättsföreningar och fastighetsförvaltare i Stockholm. Kontakta oss för offert."
        url="/fastigheter-brf"
        image="https://stodona.se/Trappstadning%20stodona.jpg"
      />
      {/* Efter ServiceSchema, så att sidans egen titel vinner – standardtiteln
          där nämner RUT-avdrag, som inte gäller föreningar och förvaltare. */}
      <Helmet>
        <title>Städning för BRF & fastighetsförvaltare i Stockholm | Stodona</title>
        <meta name="description" content="Fastighetsstädning i Stockholm för bostadsrättsföreningar och fastighetsförvaltare. Trapphus, entré, tvättstuga och soprum – med fast kontaktperson. Begär offert." />
        <meta property="og:title" content="Städning för BRF & fastighetsförvaltare i Stockholm | Stodona" />
        <meta property="og:description" content="Trapphus, entré, tvättstuga och soprum – fastighetsstädning med fast kontaktperson för BRF och förvaltare i Stockholm." />
        <link rel="canonical" href="https://stodona.se/fastigheter-brf" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img
            src="/Trappstadning stodona.jpg"
            alt="Städning av trapphus för BRF och fastighetsägare i Stockholm"
            className="w-full h-full object-cover opacity-40"
            width="1536"
            height="1024"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
            >
              Städning för BRF & fastigheter.
              <br />
              <span className="italic font-normal text-cta-hover">
                En punkt mindre på styrelsemötet.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Rena trapphus, en fräsch tvättstuga och ett soprum man vågar gå in i. Vi tar hand om de gemensamma ytorna åt bostadsrättsföreningar och fastighetsförvaltare i Stockholm – så att ni kan ägna er åt allt annat.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <a
                href="#offert"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4"
              >
                Begär offert
              </a>
              <a
                href="tel:0101780150"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                Ring 010-178 01 50
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-text-light/80"
            >
              {["Fast kontaktperson", "Kostnadsfritt besök", "Full ansvarsförsäkring", "Kvalitetsgaranti"].map((punkt) => (
                <div key={punkt} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                  <span>{punkt}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <AnswerFirst
        heading="Kort om fastighetsstädning i Stockholm"
        answer={<>Fastighetsstädning håller husets gemensamma ytor rena och trivsamma – trapphus, entré, hiss, tvättstuga, soprum och källare – enligt ett schema som passar fastigheten. Stodona städar åt bostadsrättsföreningar och fastighetsförvaltare i hela Stockholm, med <strong className="text-text-primary">fast kontaktperson</strong> och tydlig kvalitetsuppföljning.</>}
        facts={[
          { label: "Pris", value: "Offert per fastighet" },
          { label: "Avtal", value: "Löpande schema" },
          { label: "Områden", value: "Hela Stockholm" },
          { label: "För", value: "BRF & förvaltare" },
        ]}
      />

      {/* Content Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                Ett hus som känns omhändertaget
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Ingen flyttar in i en förening för trapphusets skull – men alla märker när det inte är städat. Ett rent trapphus och en tvättstuga i ordning gör att de boende trivs, att besökare får ett gott första intryck och att fastigheten slits mindre.
              </p>
              <p className="mb-8">
                Vi vet också att städningen sällan är det roligaste på dagordningen. Därför gör vi det enkelt: ni berättar hur ni vill ha det, vi lägger upp ett schema och sedan blir det gjort. Skulle något behöva ändras hör ni av er till samma person varje gång.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Det här kan vi ta hand om
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {ytor.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                      <Icon className="w-5 h-5 text-cta-hover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{title}</h3>
                      <p className="text-text-secondary text-sm">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mb-8">
                Behöver ni bara trapphusen städade? Läs mer om vår{" "}
                <Link to="/trappstadning" className="text-cta-hover hover:underline">trappstädning</Link>.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                För styrelsen och för förvaltaren
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="card-rounded bg-bg-primary p-8 border border-text-primary/5">
                  <h3 className="text-xl font-bold mb-3">Bostadsrättsföreningar</h3>
                  <p className="text-text-secondary text-base">
                    Styrelsearbete sker på fritiden, och den vill ni inte lägga på att jaga en städfirma. Hos oss får ni en offert som är lätt att ta beslut på, en person att ringa och ett trapphus som medlemmarna slutar mejla om.
                  </p>
                </div>
                <div className="card-rounded bg-bg-primary p-8 border border-text-primary/5">
                  <h3 className="text-xl font-bold mb-3">Fastighetsförvaltare</h3>
                  <p className="text-text-secondary text-base">
                    Ni har många hus och ännu fler hyresgäster att hålla nöjda. Vi blir en pålitlig del av er leverans – samma rutiner i varje fastighet, en kontaktväg in och besked när ni behöver dem.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Så kommer vi igång
              </h2>
              <ol className="space-y-6 mb-10">
                {steg.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cta-hover text-text-primary font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                      <p className="text-text-secondary text-base">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Ska vi ta en titt på er fastighet?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi kommer gärna förbi, går igenom huset tillsammans med er och återkommer med en offert. Besöket kostar ingenting och ni förbinder er inte till något.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="#offert" className="btn-primary">
                    Begär offert
                  </a>
                  <a href="mailto:info@stodona.se" className="btn-secondary border-bg-dark text-bg-dark hover:bg-bg-dark hover:text-text-light px-6 py-3 rounded-full font-bold">
                    Mejla info@stodona.se
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="card-rounded bg-cta-hover p-6 text-center shadow-lg border border-cta-hover/30">
                  <h3 className="text-xl font-bold mb-3 text-text-primary">
                    Få en offert på er fastighet
                  </h3>
                  <p className="text-sm mb-4 text-text-primary/80">
                    Berätta kort om huset så hör vi av oss och bokar in ett kostnadsfritt besök.
                  </p>
                  <a href="#offert" className="btn-primary w-full bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary transition-all shadow-md">
                    Begär offert
                  </a>
                </div>

                <WhyStodona />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offertformulär – hit leder alla "Begär offert"-knappar och nyhetsbrevet till BRF:er */}
      <section className="section-spacing bg-bg-dark text-text-light">
        <div className="container-custom max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Begär offert för er förening</h2>
            <p className="text-lg text-text-light/85">
              Fyll i fyra uppgifter, så hör vi av oss och bokar in ett kostnadsfritt besök. Testa oss helt obundet i 3 månader.
            </p>
          </div>
          <BrfOffertForm sida="/fastigheter-brf" />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Vanliga frågor från styrelser och förvaltare
          </h2>
          <div className="space-y-6">
            {fastigheterFaq.map((faq) => (
              <div key={faq.q} className="card-rounded bg-white p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-text-secondary pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End CTA */}
      <section className="py-24 bg-cta-hover text-text-primary relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Låt oss ta trapphuset.
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Så tar ni resten av dagordningen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#offert"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              Begär offert
            </a>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium opacity-90">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Fast kontaktperson</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Full ansvarsförsäkring</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Kvalitetsgaranti</div>
          </div>
        </div>
      </section>
    </div>
  );
}
