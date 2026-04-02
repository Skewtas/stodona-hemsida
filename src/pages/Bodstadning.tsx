import { Link } from "react-router-dom";
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

import { Helmet } from 'react-helmet-async';
import ServiceSchema from '../components/ServiceSchema';

export default function Bodstadning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Bodstädning i Stockholm | Stodona</title>
        <meta name="description" content="Professionell bodstädning i Stockholm. Vi sköter löpande städning av byggbodar och etableringsytor för en ren och säker arbetsmiljö." />
        <meta property="og:title" content="Bodstädning i Stockholm | Stodona" />
        <meta property="og:description" content="Professionell bodstädning i Stockholm för manskapsbodar och etableringsytor." />
        <link rel="canonical" href="https://stodona.se/bodstadning" />
      </Helmet>
      <ServiceSchema
        serviceName="Bodstädning"
        serviceType="CommercialCleaningService"
        description="Professionell bodstädning och städning av etableringsytor i Stockholm."
        url="/bodstadning"
        image="https://stodona.se/Bodstadning%20stodona.jpg"
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/Bodstadning stodona.jpg" 
            alt="Bodstädning Stockholm" 
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
              {t('bod.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('bod.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('bod.hero.desc', lang)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                to="/kontakt"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4"
              >
                {t('bod.hero.cta1', lang)}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                {lang === 'SV' ? 'Löpande Bodstädning i Stockholm' : 'Ongoing Site Cabin Cleaning'}
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/Bodstadning stodona.jpg" 
                  alt="Bodstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                {lang === 'SV' ? 'Vi på Stodona är en pålitlig städfirma som erbjuder professionell bodstädning för byggarbetsplatser i hela Stockholm. Regelbunden bodstädning är extremt viktigt för att upprätthålla en god arbetsmiljö under pågående byggprojekt. Vi erbjuder skräddarsydda, flexibla lösningar för daglig eller veckovis städning av era bodar.' : 'We offer professional construction cabin cleaning in Stockholm. Regular cabin cleaning is essential for a good work environment during construction projects.'}
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">{lang === 'SV' ? 'Vad ingår i vår bodstädning?' : 'What is included in site cabin cleaning?'}</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Rengöring av golv i bodar, kontor, omklädningsrum och fikarum' : 'Cleaning of floors in cabins, offices, changing rooms and break rooms'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Grundlig rengöring av toaletter och duschar' : 'Thorough cleaning of toilets and showers'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Avtorkning av bord, bänkar och köksytor' : 'Wiping of tables, counters and kitchen surfaces'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Tömning av sopor och källsortering' : 'Emptying of waste and recycling'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Påfyllning av tvål, papper och diskmedel' : 'Restocking of soap, paper and dish soap'}</span>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {lang === 'SV' ? 'Behöver ni löpande bodstädning?' : 'Do you need ongoing cabin cleaning?'}
                </h3>
                <p className="mb-6 text-text-secondary">
                  {lang === 'SV' ? 'Vi ser till att bodarna är rena och fräscha så ni kan fokusera på bygget. Boka direkt online!' : 'We keep the cabins clean so you can focus on the construction. Book directly online!'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="https://boka.stodona.se" className="btn-primary">
                    {lang === 'SV' ? 'Boka städning nu' : 'Book cleaning now'}
                  </a>
                  <Link to="/kontakt" className="btn-secondary border-bg-dark text-bg-dark hover:bg-bg-dark hover:text-text-light px-6 py-3 rounded-full font-bold">
                    {lang === 'SV' ? 'Begär offert' : 'Request quote'}
                  </Link>
                </div>
              </div>
            </div>

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

                <WhyStodona />
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
            {lang === 'SV' ? 'Boka din städning idag och låt oss ta hand om smutsen.' : 'Book your cleaning today and let us handle the dirt.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://boka.stodona.se"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              {lang === 'SV' ? 'Boka städning direkt' : 'Book cleaning directly'}
            </a>
          </div>
          <p className="mt-6 text-sm font-medium opacity-80">
            {lang === 'SV' ? 'Tider fylls snabbt – säkra din tid idag.' : 'Slots fill up fast – secure your time today.'}
          </p>
        </div>
      </section>
    </div>
  );
}
