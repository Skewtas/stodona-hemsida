import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
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

export default function Storstadning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Storstädning i Stockholm (Djuprengöring) | Stodona</title>
        <meta name="description" content="Gör rent på djupet! Boka storstädning i Stockholm. Vi rengör ugn, kylskåp, badrum och alla svåråtkomliga ytor. Alltid med RUT-avdrag." />
        <meta property="og:title" content="Storstädning i Stockholm (Djuprengöring) | Stodona" />
        <meta property="og:description" content="Gör rent på djupet! Boka storstädning i Stockholm. Vi rengör ugn, kylskåp, badrum och alla ytor." />
        <link rel="canonical" href="https://stodona.se/storstadning" />
      </Helmet>
      <ServiceSchema
        serviceName="Storstädning"
        serviceType="Storstädning"
        description="Professionell storstädning i Stockholm. Djupgående rengöring av ugn, kylskåp, badrum och mer. RUT-avdrag – betala bara 50%."
        url="/storstadning"
        image="https://stodona.se/stodona-stad.jpg"
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/stodona-stad.jpg" 
            alt="Storstädning Stockholm" 
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
              {t('stor.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('stor.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('stor.hero.desc', lang)}
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
                {t('stor.hero.cta1', lang)}
              </a>
              <a
                href="https://boka.stodona.se"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                {t('stor.hero.cta2', lang)}
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
                <span>{t('stor.hero.b1', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('stor.hero.b2', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('stor.hero.b3', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('stor.hero.b4', lang)}</span>
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
                Vad ingår vid Storstädning i Stockholm?
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/stodona-stad.jpg" 
                  alt="Storstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                När vardagsstädningen inte räcker till är det dags för en riktig djuprengöring. Låt vårt duktiga team från Stodona, din pålitliga städfirma, fräscha upp din bostad från golv till tak. Vår grundliga storstädning i Stockholm tar bort ingrodd smuts och ger dig ett skinande rent och fläckfritt hem att njuta av. Boka marknadens bästa storstädning idag!
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Övriga ytor och rum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av fria ytor som till exempel fönsterbleck, bord, bänkar, hyllor och tavlor</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning av speglar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugning av golv (lyfter ej på stora mattor)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Moppning av golv</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugning av soffa/fåtölj</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammtorkning av elkontakter och eluttag</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammtorkning av alla lister</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Byte av sängkläder (lägg fram önskade sängkläder på sängen)</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Kök</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Utvändig avtorkning av köksluckor och skåp</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring kakel och diskbänk samt putsar diskhon</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av kyl och frys (utvändigt)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Invändig och utvändig avtorkning av mikrovågsugn</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av ugn (ej mellan glas, vill du att vi putsar mellan behöver du själv öppna upp så vi kommer åt glaset på insidan)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av fläkt och filter</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Invändig och utvändig avtorkning av diskmaskin</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av eventuella köksmaskiner på diskbänken</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Torkar ur besticklådan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av sopskopet och tömning av soptunnan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av fria ytor så som bänkar, hyllor, bord och fönsterbrädor</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av lister och elkontakter</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning av speglar och glaspartier (inte fönsterputsning)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugning av golv och matta dammsugs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Moppning av golv</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Badrum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av badrumsskåp och luckor (utvändigt, även på ovansidan)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av tvättmaskin och torktumlare</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Eventuella fläckar på kakel tas bort</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning av speglar och glaspartier (inte fönsterputsning)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av av kakel ovanför handfat</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av dusch och handfat</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av toalett</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rensning av avlopp i dusch</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Bra att veta om storstädning</h3>
              <p className="font-bold mb-2">Städmedel/material som du behöver ha hemma:</p>
              <p className="text-text-secondary mb-4 italic text-sm">
                (Vi kan även tillhandahålla allt städmaterial mot en tilläggskostnad, då vi kör ut materialet med bil.)
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Fönsterputsnings bokas separat, kontakta oss om du vill boka in en fönsterputsning till din storstädning.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugare, mopp och hink</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>3 mikrofiberdukar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöringssvamp med vit yta</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöringsmedel (t.ex. såpa och kök-/badrumsspray)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Stålull och ugnsrengöring</span>
                </li>
              </ul>

              <p className="font-bold mb-2">Annan bra information om storstädning:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avbokning sker senast 48 timmar innan bokad tid.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Vill du ta bort eller lägga till något till din städning? Hör av dig till oss så hittar vi en lösning som passar dig.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Fakturan betalas efter genomförd städning skickas till dig via mejl.</span>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Vill du ha ett skinande rent hem genom djuprengöring?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi är experter på storstädning och har lediga tider i Stockholm den här veckan. Boka professionell storstädning i Stockholm nu och få hotellkänsla hemma.
                </p>
                <a href="https://boka.stodona.se" className="btn-primary">
                  Boka storstädning direkt
                </a>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
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
                    "Fantastiskt resultat, huset känns som nytt efter storstädningen. Rekommenderas varmt!"
                  </p>
                  <p className="font-bold text-sm">— Maria, Bromma</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Vanliga frågor</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        Behöver jag vara hemma?
                      </p>
                      <p className="text-xs text-text-secondary pl-6">
                        Nej, du kan lämna nyckel till oss eller använda
                        nyckelgömma.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        Vem står för städmaterial?
                      </p>
                      <p className="text-xs text-text-secondary pl-6">
                        Du behöver ha vissa städmedel och material hemma (se listan ovan). Vi kan även tillhandahålla städmaterial mot en extra kostnad (vi kör ut materialet med bil).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
