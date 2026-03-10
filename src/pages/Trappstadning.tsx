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

export default function Trappstadning() {
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
              Trappstädning i Stockholm.{" "}
              <span className="italic font-normal text-cta-hover">
                För en tryggare boendemiljö.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Ett rent och välskött trapphus ökar trivseln för de boende och ger ett gott första intryck för besökare. Vi hjälper bostadsrättsföreningar och fastighetsägare med professionell trappstädning.
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
                Begär offert
              </Link>
              <Link
                to="/priser"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                Se våra priser
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
                Professionell trappstädning för BRF & Fastighetsägare
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="https://picsum.photos/seed/stodona-stairs/1200/800" 
                  alt="Trappstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Trapphuset är det första man möts av när man kliver in i en byggnad. Genom att hålla det rent och fräscht skapar ni inte bara en mer välkomnande miljö, utan minskar även slitaget på fastigheten och ökar säkerheten genom att hålla utrymningsvägar fria från smuts och skräp.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Vad ingår i trappstädningen?</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Sopning och våtmoppning av trappsteg och vilplan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av lister, socklar och ledstänger</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av strömbrytare och armaturer</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av hisskorgar och speglar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Putsning av glaspartier i entrédörrar</span>
                </li>
              </ul>

              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Vill ni ha ett renare trapphus?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi skräddarsyr ett städschema som passar just er fastighet. Kontakta oss för ett kostnadsfritt besök och offert.
                </p>
                <Link to="/kontakt" className="btn-primary">
                  Begär offert
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
