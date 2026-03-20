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

export default function Trappstadning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
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
              {t('trapp.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('trapp.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('trapp.hero.desc', lang)}
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
                {t('trapp.hero.cta1', lang)}
              </Link>
              <Link
                to="/priser"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                {t('trapp.hero.cta2', lang)}
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
                {lang === 'SV' ? 'Professionell trappstädning för BRF & Fastighetsägare' : 'Professional staircase cleaning for housing associations & property owners'}
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="https://picsum.photos/seed/stodona-stairs/1200/800" 
                  alt="Trappstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                {lang === 'SV' ? 'Trapphuset är det första man möts av när man kliver in i en byggnad. Genom att hålla det rent och fräscht skapar ni inte bara en mer välkomnande miljö, utan minskar även slitaget på fastigheten och ökar säkerheten genom att hålla utrymningsvägar fria från smuts och skräp.' : 'The staircase is the first thing you encounter when entering a building. By keeping it clean and fresh, you not only create a more welcoming environment, but also reduce wear on the property and increase safety by keeping evacuation routes free from dirt and debris.'}
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">{lang === 'SV' ? 'Vad ingår i trappstädningen?' : 'What is included in the staircase cleaning?'}</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Sopning och våtmoppning av trappsteg och vilplan' : 'Sweeping and wet mopping of steps and landings'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Rengöring av lister, socklar och ledstänger' : 'Cleaning of trims, baseboards and handrails'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Avtorkning av strömbrytare och armaturer' : 'Wiping of light switches and fixtures'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Rengöring av hisskorgar och speglar' : 'Cleaning of elevator cars and mirrors'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>{lang === 'SV' ? 'Putsning av glaspartier i entrédörrar' : 'Cleaning of glass sections in entrance doors'}</span>
                </li>
              </ul>

              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {lang === 'SV' ? 'Vill ni ha ett renare trapphus?' : 'Want a cleaner staircase?'}
                </h3>
                <p className="mb-6 text-text-secondary">
                  {lang === 'SV' ? 'Vi skräddarsyr ett städschema som passar just er fastighet. Kontakta oss för ett kostnadsfritt besök och offert.' : 'We tailor a cleaning schedule that suits your property. Contact us for a free visit and quote.'}
                </p>
                <Link to="/kontakt" className="btn-primary">
                  {t('trapp.hero.cta1', lang)}
                </Link>
              </div>
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
