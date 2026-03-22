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
        <title>Bodstädning & Dödsbostädning i Stockholm | Stodona</title>
        <meta name="description" content="Känslosam och diskret bodstädning och dödsbostädning i Stockholm. Vi tar hand om allt från röjning till slutstädning med omsorg och respekt." />
        <meta property="og:title" content="Bodstädning & Dödsbostädning i Stockholm | Stodona" />
        <meta property="og:description" content="Känslosam och diskret bodstädning och dödsbostädning i Stockholm. Vi tar hand om röjning till slutstädning." />
      </Helmet>
      <ServiceSchema
        serviceName="Bodstädning"
        serviceType="Dödsbostädning"
        description="Diskret och professionell bodstädning/dödsbostädning i Stockholm."
        url="/bodstadning"
        image="https://stodona.se/stodona_right_image.jpg"
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
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
                {lang === 'SV' ? 'Löpande städning av etableringsytor' : 'Ongoing cleaning of establishment areas'}
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="https://picsum.photos/seed/stodona-construction/1200/800" 
                  alt="Bodstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                {lang === 'SV' ? 'Bodstädning är en viktig del i att upprätthålla en god arbetsmiljö under pågående byggprojekt. Vi erbjuder flexibla lösningar för daglig eller veckovis städning av era bodar, inklusive påfyllning av förbrukningsmaterial.' : 'Site cabin cleaning is an important part of maintaining a good work environment during ongoing construction projects. We offer flexible solutions for daily or weekly cleaning of your cabins, including restocking of consumables.'}
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">{lang === 'SV' ? 'Vad ingår i bodstädningen?' : 'What is included in site cabin cleaning?'}</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Rengöring av golv i kontor, omklädningsrum och fikarum' : 'Cleaning of floors in offices, changing rooms and break rooms'}</span>
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
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <WhyStodona />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
