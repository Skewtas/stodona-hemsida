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

export default function Foretagsstadning() {
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
              Företagsstädning.{" "}
              <span className="italic font-normal text-cta-hover">
                För en bättre arbetsmiljö.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Ett rent och fräscht företag skapar förutsättningar för att dina medarbetare ska trivas och för att dina kunder ska känna sig välkomna. Vi tar hand om allt från kontor och fastigheter till specialprojekt och byggstädning.
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
                <span>Anpassad städning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>Personlig kontakt</span>
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
                Anpassad företagsstädning
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                På Stodona förstår vi att behovet av företagsstädning varierar väldigt mycket mellan olika företag och att varje behov är unikt. Vi har därför inget förutbestämt innehåll utan era önskemål och krav styr vad som ingår.
              </p>
              <p className="mb-8">
                Oavsett om du behöver återkommande hjälp med städning, en extra grovstädning eller hjälp med städningen på något annat sätt så finns vi här för dig och ditt företag.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Rena lokaler ger nöjda anställda och kunder</h3>
              <p className="mb-8">
                Under en arbetsdag är det mycket som ska hinnas med och städningen blir lätt bortprioriterad. Ett rent och städat kontor eller lokal är däremot viktigt både för dina anställda och kunder. Den rena och fräscha känslan förbättrar arbetsmiljön för dina anställda och kan öka deras motivation. Men det ger även kunder och besökare ett bättre intryck av ditt företag. Låt oss hjälpa ert företag att skapa de bästa förutsättningarna för kunder och anställda.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Låt oss hjälpa er med förbrukningsvaror</h3>
              <p className="mb-8">
                Är det ständigt slut på papper, tvål eller något annat ni som företag förbrukar regelbundet? Vi kan hjälpa er med inköp och påfyllning och vi erbjuder snabba och regelbundna leveranser för att möta ditt företags behov. Kontakta oss via telefon om du vill veta hur vi kan hjälpa just dig.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Företagsbesök och personlig kontakt</h3>
              <p className="mb-8">
                För oss är den personliga kontakten viktig för att vi ska kunna förstå era önskemål och krav. För att lära känna dig, ditt företags lokaler och de städbehov som finns så bokar vi alltid in ett företagsbesök med nya kunder. Vi går igenom vad ni önskar hjälp med och kommer fram till hur ofta ni önskar städning. Vi hittar helt enkelt den optimala lösningen för just ert företag.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Vi städar dessa lokaler hos företag
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Kontor</h4>
                    <p className="text-text-secondary text-sm">
                      Skapa en trivsam och produktiv arbetsmiljö för dina medarbetare.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Fastigheter & BRF</h4>
                    <p className="text-text-secondary text-sm">
                      Trappstädning och underhåll av allmänna utrymmen för fastighetsägare och bostadsrättsföreningar.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Restauranger</h4>
                    <p className="text-text-secondary text-sm">
                      Noggrann städning som lever upp till de högsta hygienkraven i restaurangmiljö.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Butiker</h4>
                    <p className="text-text-secondary text-sm">
                      En inbjudande och ren butiksmiljö som ger dina kunder ett fantastiskt första intryck.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Bygg- & Bodstädning</h4>
                    <p className="text-text-secondary text-sm">
                      Vi tar hand om byggdammet och håller byggbodarna fräscha under hela projektet.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-cta-hover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Specialprojekt & Storstädning</h4>
                    <p className="text-text-secondary text-sm">
                      Allt från djupgående storstädningar till fönsterputsning och unika specialuppdrag.
                    </p>
                  </div>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Offertförfrågan Företagsstädning
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi anpassar städningen efter ditt företags behov och önskemål. Kontakta oss för att boka in ett företagsbesök och hitta en lösning som passar er.
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
                    "Pålitliga, noggranna och alltid i tid. Vårt kontor har aldrig sett bättre ut sedan vi bytte till Stodona."
                  </p>
                  <p className="font-bold text-sm">— Linda, VD på IT-bolag</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Helhetslösningar</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Vi erbjuder kompletta helhetslösningar för företag. Från daglig städning till fönsterputs, golvvård och leverans av förbrukningsmaterial.
                  </p>
                  <Link to="/kontakt" className="text-sm font-medium text-cta-hover hover:underline">
                    Kontakta oss för mer information
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
