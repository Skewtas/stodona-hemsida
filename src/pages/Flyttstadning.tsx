import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Clock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";

import WhyStodona from "../components/WhyStodona";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import ServiceSchema from "../components/ServiceSchema";

import { Helmet } from 'react-helmet-async';

export default function Flyttstadning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Flyttstädning i Stockholm med Garanti | Stodona</title>
        <meta name="description" content="Professionell flyttstädning i Stockholm med nöjdhetsgaranti. RUT-avdrag direkt på fakturan. Vi tar med allt städmaterial. Boka snabbt och enkelt online!" />
        <meta property="og:title" content="Flyttstädning i Stockholm med Garanti | Stodona" />
        <meta property="og:description" content="Professionell flyttstädning i Stockholm med nöjdhetsgaranti. Vi tar med allt material." />
        <link rel="canonical" href="https://stodona.se/flyttstadning" />
      </Helmet>
      <ServiceSchema
        serviceName="Flyttstädning"
        serviceType="Flyttstädning"
        description="Professionell flyttstädning i Stockholm med garanti. RUT-avdrag, komplett checklista och vi tar med allt material. Boka online!"
        url="/flyttstadning"
        image="https://stodona.se/stodona_left_image.jpg"
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/stodona_left_image.jpg" 
            alt="Flyttstädning Stockholm" 
            className="w-full h-full object-cover opacity-40"
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
              {t('flytt.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('flytt.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('flytt.hero.desc', lang)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <a
                href="https://boka.stodona.se"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4"
              >
                {t('flytt.hero.cta1', lang)}
              </a>
              <a
                href="https://boka.stodona.se"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                {t('flytt.hero.cta2', lang)}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-text-light/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('flytt.hero.b1', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('flytt.hero.b2', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('flytt.hero.b3', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('flytt.hero.b4', lang)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Content Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                Vad ingår i vår flyttstädning?
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/stodona_left_image.jpg" 
                  alt="Flyttstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                En riktig flyttstädning är mycket mer omfattande än en vanlig
                hemstädning. Låt vår städfirma för flyttstädning rengöra din bostad från golv till tak för att
                säkerställa att nästa ägare eller hyresgäst möts av ett perfekt
                resultat. Vi är experter på flyttstädning i Stockholm och garanterar alltid högsta kvalitet på vårt flyttstäd.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Alla rum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugning och fuktmoppning av alla golv</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Rengöring av golvlister, dörrkarmar, trösklar och dörrar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Avtorkning av garderober in- och utvändigt (om de är tömda)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av element (även bakom)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Fönsterputsning (insida, utsida och mellan glasen)
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Kök</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Rengöring av kyl och frys in- och utvändigt (måste vara
                    avfrostade)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av spis, ugn, plåtar och galler</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Avtorkning av köksskåp och lådor in- och utvändigt
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av köksfläkt och filter</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Badrum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av toalett, handfat och dusch/badkar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avkalkning av väggar och golv</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rensning av golvbrunn</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av badrumsskåp in- och utvändigt</span>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Slipp stressen med marknadens bästa flyttstädning i Stockholm
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi är en rekommenderad städfirma med snabba och lediga tider för flyttstädning i Stockholm den här veckan. Boka din professionella flyttstädning nu och
                  låt oss ta hand om hela städningen med garanti.
                </p>
                <a href="https://boka.stodona.se" className="btn-primary">
                  Boka flyttstädning direkt
                </a>
              </div>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Vår kvalitetsgaranti
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                Vi är så säkra på vår kvalitet att vi lämnar en 14 dagars
                kvalitetsgaranti på vår flyttstädning. Det innebär att om du
                eller den nya ägaren/hyresgästen mot förmodan skulle ha några
                anmärkningar på städningen, kommer vi tillbaka och åtgärdar det
                kostnadsfritt.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                RUT-avdrag för flyttstädning
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                Precis som för hemstädning har du rätt till RUT-avdrag när du
                anlitar oss för flyttstädning. Du betalar endast 50% av
                arbetskostnaden, och vi sköter all kontakt med Skatteverket.
              </p>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="card-rounded bg-cta-hover p-6 text-center shadow-lg border border-cta-hover/30">
                  <h3 className="text-xl font-bold mb-3 text-text-primary">
                    {lang === 'SV' ? 'Boka din städning idag' : 'Book your cleaning today'}
                  </h3>
                  <p className="text-sm mb-4 text-text-primary/80">
                    {lang === 'SV' ? 'Se ditt pris och boka direkt online. Snabbt och smidigt!' : 'See your price and book directly online. Fast and easy!'}
                  </p>
                  <a href="https://boka.stodona.se" className="btn-primary w-full bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary transition-all shadow-md">
                    {lang === 'SV' ? 'Boka städning nu' : 'Book cleaning now'}
                  </a>
                </div>

                <div className="card-rounded bg-bg-dark text-text-light p-8 shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="italic text-sm mb-4">
                    "Otroligt smidigt att boka och resultatet var perfekt.
                    Köparen var supernöjd och jag slapp stressen. Rekommenderas
                    varmt!"
                  </p>
                  <p className="font-bold text-sm">— Johan, Stockholm</p>
                </div>

                <WhyStodona />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Vanliga frågor om flyttstädning
            </h2>
            <p className="text-text-secondary text-lg">
              Här har vi samlat de vanligaste frågorna vi får om vår
              flyttstädning.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Ingår fönsterputs i flyttstädningen?",
                a: "Ja, fönsterputsning (insida, utsida och mellan glasen) ingår alltid i vår flyttstädning.",
              },
              {
                q: "Måste bostaden vara helt tömd?",
                a: "För bästa resultat rekommenderar vi att bostaden är helt tömd på möbler och lösa föremål. Om det finns möbler kvar städar vi runt dem.",
              },
              {
                q: "Vad händer om städningen inte blir godkänd?",
                a: "Vi lämnar en 14 dagars kvalitetsgaranti. Om du eller den nya ägaren/hyresgästen har anmärkningar kommer vi tillbaka och åtgärdar det kostnadsfritt.",
              },
              {
                q: "Måste jag frosta av frysen innan ni kommer?",
                a: "Ja, för att vi ska kunna rengöra frysen ordentligt måste den vara avfrostad och avstängd när vi kommer.",
              },
              {
                q: "Hur lång tid tar en flyttstädning?",
                a: "Tiden varierar beroende på bostadens storlek och skick. Räkna med att det tar en hel arbetsdag för en normalstor bostad.",
              },
              {
                q: "Tar ni med er allt städmaterial?",
                a: "Ja, vi tar med allt vi behöver. Du behöver dock meddela oss i förväg om du har ovanligt hög takhöjd eller svåråtkomliga fönster.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="card-rounded bg-bg-primary p-6 border border-text-primary/10"
              >
                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
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
            Redo för en smidig flytt?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Boka din flyttstädning idag och låt oss ta hand om det sista.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://boka.stodona.se"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              Boka flyttstädning direkt
            </a>
          </div>
          <p className="mt-6 text-sm font-medium opacity-80">
            Tider fylls snabbt – säkra din tid idag.
          </p>
        </div>
      </section>
    </div>
  );
}
