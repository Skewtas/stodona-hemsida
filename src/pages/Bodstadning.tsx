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

export default function Bodstadning() {
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
              Bodstädning i Stockholm.{" "}
              <span className="italic font-normal text-cta-hover">
                Effektivitet på byggarbetsplatsen.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Vi ser till att era manskapsbodar, kontorsbodar och etableringsytor hålls rena och hygieniska. En ren arbetsmiljö ökar trivseln och produktiviteten för alla på bygget.
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
                Löpande städning av etableringsytor
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="https://picsum.photos/seed/stodona-construction/1200/800" 
                  alt="Bodstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Bodstädning är en viktig del i att upprätthålla en god arbetsmiljö under pågående byggprojekt. Vi erbjuder flexibla lösningar för daglig eller veckovis städning av era bodar, inklusive påfyllning av förbrukningsmaterial.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Vad ingår i bodstädningen?</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av golv i kontor, omklädningsrum och fikarum</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Grundlig rengöring av toaletter och duschar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av bord, bänkar och köksytor</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Tömning av sopor och källsortering</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />{" "}
                  <span>Påfyllning av tvål, papper och diskmedel</span>
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
