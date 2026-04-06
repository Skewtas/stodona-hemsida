import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";
import WhyStodona from "../components/WhyStodona";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import ServiceSchema from "../components/ServiceSchema";

import { Helmet } from 'react-helmet-async';

export default function Fonsterputsning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Fönsterputsning i Stockholm (Rändfria resultat) | Stodona</title>
        <meta name="description" content="Professionell fönsterputsning i Stockholm. Vi ger dig rändfria fönster med RUT-avdrag. Putsning av insida, utsida och mellan glasen utförs av experter." />
        <meta property="og:title" content="Fönsterputsning i Stockholm (Rändfria resultat) | Stodona" />
        <meta property="og:description" content="Vi ger dig rändfria fönster i hela Stockholm. Putsning av insida, utsida och mellan glas." />
        <link rel="canonical" href="https://stodona.se/fonsterputsning" />
      </Helmet>
      <ServiceSchema
        serviceName="Fönsterputsning"
        serviceType="Fönsterputsning"
        description="Professionell fönsterputsning i Stockholm. Rändfria fönster med RUT-avdrag. Vi putsar insida, utsida och mellan glasen."
        url="/fonsterputsning"
        image="https://stodona.se/fonster-stodona.jpg"
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/fonster-stodona.jpg" 
            alt="Fönsterputsning Stockholm" 
            className="w-full h-full object-cover opacity-30"
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
              {t('fonster.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('fonster.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('fonster.hero.desc', lang)}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                Professionell fönsterputsning
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/fonster-stodona.jpg" 
                  alt="Fönsterputsning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Att putsa fönster kan vara både tidskrävande och riktigt svårt att få till perfekt utan rätt teknik. Låt oss på Stodona, din lokala städfirma, ta hand om din fönsterputs i Stockholm åt dig. Våra experter på fönsterputsning har rätt utrustning och professionell metodik för att erbjuda marknadens bästa fönsterputs. Vi garanterar dig skinande rena, välputsade och helt rändfria fönster året om med vår populära fönsterputsning i Stockholm.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Vad ingår?</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning av fönsterglas (insida och utsida)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning mellan glasen (om delbara)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av fönsterkarmar och fönsterbänkar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Vi tar med all utrustning och miljövänliga rengöringsmedel</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Bra att veta</h3>
              <p className="mb-4">
                För att vi ska kunna utföra fönsterputsningen på bästa sätt ber vi dig att:
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Plocka undan blommor och föremål från fönsterbrädorna.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dra undan gardiner och persienner.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Meddela oss i förväg om fönstren är svåråtkomliga eller om det krävs specialstege.</span>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Dags för rändfri fönsterputs i Stockholm?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Boka professionell fönsterputsning idag och njut av en kristallklar utsikt. Vi är din städfirma för perfekt fönsterputs.
                </p>
                <a href="https://boka.stodona.se" className="btn-primary">
                  Boka fönsterputsning
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
                    "Mina fönster har aldrig varit så här rena. Snabbt, proffsigt och ett fantastiskt resultat!"
                  </p>
                  <p className="font-bold text-sm">— Erik, Nacka</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Vanliga frågor</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        Putsar ni på vintern?
                      </p>
                      <p className="text-xs text-text-secondary pl-6">
                        Ja, vi putsar fönster året runt, så länge det inte är extrem kyla eller storm.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        Vem står för utrustningen?
                      </p>
                      <p className="text-xs text-text-secondary pl-6">
                        Vi tar med allt vi behöver. Du behöver dock meddela oss i förväg om du har ovanligt hög takhöjd eller svåråtkomliga fönster.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-text-secondary" />
                        Ingår fönsterputs i hemstädning?
                      </p>
                      <p className="text-xs text-text-secondary pl-6">
                        Nej, fönsterputsning bokas som en separat tjänst.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End CTA */}
      <section className="py-24 bg-cta-hover text-text-primary relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {lang === 'SV' ? 'Redo att boka?' : 'Ready to book?'}
          </h2>
          <p className="text-xl mb-10 opacity-90">
            {lang === 'SV' ? 'Boka din städning idag och njut av skinande rena fönster.' : 'Book your cleaning today and enjoy sparkling clean windows.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://boka.stodona.se"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              {lang === 'SV' ? 'Boka städning direkt' : 'Book cleaning directly'}
            </a>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium opacity-90">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {lang === 'SV' ? 'Ingen bindningstid' : 'No binding time'}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {lang === 'SV' ? 'Full ansvarsförsäkring' : 'Fully insured'}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {lang === 'SV' ? 'Kvalitetsgaranti' : 'Quality guarantee'}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
