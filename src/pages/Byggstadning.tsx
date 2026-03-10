import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { BokahemWidget } from "../components/BokahemWidget";
import WhyStodona from "../components/WhyStodona";

export default function Byggstadning() {
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
              Byggstädning i Stockholm.{" "}
              <span className="italic font-normal text-cta-hover">
                För företag och privatpersoner.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Har du nyligen renoverat eller byggt till? Eller är det dags för slutbesiktning av ett större byggprojekt? En byggstädning är viktig för att skapa en frisk miljö, och du blir av med allt damm och hälsofarliga partiklar som kan ha bildats vid renoveringen eller byggnationen.
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
                to="/boka-stadning"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                Se våra priser
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-text-light/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>100 % nöjd kund-garanti</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>Fullt försäkrade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>RUT-avdrag för privatpersoner</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>Erfarenhet av stora projekt</span>
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
                Vilka tjänster erbjuds inom byggstädning?
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/byggstadning.png" 
                  alt="Byggstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Stodona har flerårig erfarenhet av professionella byggstädningar i Stockholm, vilket gett oss den kunskap som behövs för att genomföra en noggrann och effektiv byggstädning. Vi har utfört städningar på ytor upp till 20 000 kvm.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Grovstädning</h3>
              <p className="mb-8">
                Under en grovstädning tas skräp, damm och andra material relaterade till bygget bort för att säkerställa en säker arbetsmiljö under pågående byggnation.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Bodstädning</h3>
              <p className="mb-8">
                Bodstädning ger er löpande städning av manskapsbodar eller kontorsbodar som används under byggprojektet.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Fönsterputsning</h3>
              <p className="mb-8">
                Vi kan hjälpa till med putsning av fönster och glaspartier efter en renovering eller ett byggprojekt. Vi har möjlighet att använda sax- eller bomlift för putsning på högre höjer.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Slut-/finstädning</h3>
              <p className="mb-8">
                En slut-/finstädning är det allra sista som görs i ett byggprojekt. En grundlig städning av hela projektet med tillhörande inredning görs. En slutstädning är dessutom ett krav inför slutbesiktningen av större byggprojekt.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Etableringsstädning</h3>
              <p className="mb-8">
                Smutsiga arbetare ger smutsiga lokaler. Vi hjälper er med städning av utrymme/lokal i anslutning till byggarbetsplatsen där byggarna har sitt kontor.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Inköp</h3>
              <p className="mb-8">
                Vi erbjuder kontinuerlig påfyllning av förbrukningsvaror såsom till exempel toalettpapper, tvål och diskmedel. Har du löpande bod- eller etableringsstädning erbjuds förmånliga priser på förbrukningsvaror.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Din byggstädning steg för steg
              </h2>
              <ul className="space-y-6 mb-10">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Offertförfrågan
                    </h4>
                    <p className="text-text-secondary text-sm">
                      Kontakta oss för en gratis offertförfrågan anpassad utifrån dina behov.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Offert & Bokning
                    </h4>
                    <p className="text-text-secondary text-sm">
                      Vi kontaktar er med en offert utifrån era önskemål. Om det känns bra bokar vi tillsammans in en tid som passar er.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Genomförande
                    </h4>
                    <p className="text-text-secondary text-sm">
                      Vi genomför byggstädningen hos er utifrån det som vi kommit fram till. Allt städmaterial tar vi med oss.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Kvalitetskontroll
                    </h4>
                    <p className="text-text-secondary text-sm">
                      Efter städningen genomför vi interna kvalitetskontroller för att säkerställa kvaliteten på städningen.
                    </p>
                  </div>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Behöver du hjälp med byggstädning?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi hjälper både privatpersoner och företag med byggstädning. Kontakta oss för en gratis offert.
                </p>
                <Link to="/kontakt" className="btn-primary">
                  Begär offert
                </Link>
              </div>

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="card-rounded bg-bg-dark text-text-light p-8 shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="italic text-sm mb-4">
                    "Stodona räddade oss efter renoveringen. Allt byggdamm är borta och vi kunde flytta in direkt!"
                  </p>
                  <p className="font-bold text-sm">— Peter, Lidingö</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Större byggprojekt</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Är du ansvarig för ett större byggprojekt? Vill du ha en heltäckande service med städning? Stodona kan hjälpa dig under hela projektet.
                  </p>
                  <p className="text-sm text-text-secondary">
                    Vi erbjuder många olika städtjänster inom bygg där du får anpassad städhjälp utefter dina behov.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
