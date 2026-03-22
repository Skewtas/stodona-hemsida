import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import WhyStodona from "../components/WhyStodona";

export default function Priser() {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Priser på städning | Stodona</title>
        <meta name="description" content="Se pris för hemstädning, flyttstädning med mera. Boka online för direktpris eller kontakta oss för en skräddarsydd offert." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Våra Priser
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-light/80 mb-10"
          >
            Vi erbjuder skräddarsydda städlösningar anpassade efter dina specifika behov. 
            För att få ett exakt pris rekommenderar vi att du använder vår onlinebokning där du ser priset direkt, eller kontaktar oss för en kostnadsfri offert.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/boka-stadning" className="btn-primary bg-cta-hover text-text-primary px-8 py-4 text-lg">
              Se Pris & Boka Online
            </Link>
            <Link to="/kontakt" className="btn-secondary px-8 py-4 text-lg border-text-light text-text-light hover:bg-white hover:text-bg-dark">
              Kontakta oss för offert
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Varför har vi inga fasta prislistor?</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Varje hem och kontor är unikt och allas städbehov ser olika ut. Istället för att ge en generell siffra som kanske inte stämmer överens med just din situation, ger vi dig ett rättvist, personligt prisförslag eller ett direktpris via vår onlinebokning.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0" />
                  <span className="text-text-secondary">Priset baseras på yta, omfattning och dina önskemål.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0" />
                  <span className="text-text-secondary">Rut-avdrag (50%) dras alltid direkt på fakturan för privatpersoner.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0" />
                  <span className="text-text-secondary">Helt transparent - inga dolda avgifter.</span>
                </li>
              </ul>
            </div>
            <div>
              <WhyStodona />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
