import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, Star, Sparkles, Heart } from "lucide-react";
import WhyStodona from "../components/WhyStodona";

export default function OmOss() {
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
              Om Stodona.{" "}
              <span className="italic font-normal text-cta-hover">
                Det lilla extra.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Vilka är vi? Stodona är städbolaget som gör det lilla extra för sina kunder. Vi strävar efter att vara en partner som levererar en wow-upplevelse i varje steg.
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
                Vår vision
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Vi strävar efter att vara en partner som levererar en wow-upplevelse i varje steg – från första kontakten, genom utförandet av våra städtjänster, till uppföljningen och det slutliga resultatet. 
              </p>
              <p className="mb-8">
                Med Sveriges mest engagerade och kompetenta personal inom service, med fokus på hemservice, skapar vi inte bara rena hem utan också minnesvärda upplevelser.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Stodonas historia
              </h2>
              <p className="mb-6">
                Stodona AB grundades 2019 efter att vår ägare haft utmaningar med städbolag både på tidigare arbetsplatser och privat och såg ganska snabbt vikten av struktur, uppföljning, god service och det viktigaste av allt.. att ta hand om personalen som är ute hos kunder och jobbar.
              </p>
              <p className="mb-6">
                Namnet Stodona kommer från orden <strong>städa</strong> och <strong>dona</strong>, där dona står för det lilla extra som gör att man som kund stannar hos oss.
              </p>
              <p className="mb-12">
                Vi är idag ett av Sveriges snabbast växande städbolag och har en personalstyrka om ca 50 personer. Vår framgång sitter i rekommendationer från befintliga kunder, vilket är ett fint kvitto på vårt arbete.
              </p>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Vill du bli en del av Stodona?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi letar alltid efter engagerade medarbetare. Eller vill du boka städning?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/boka-stadning" className="btn-primary">
                    Boka städning
                  </Link>
                  <Link to="/kontakt" className="btn-secondary">
                    Kontakta oss
                  </Link>
                </div>
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
                    "Stodona är mer än bara ett städbolag, de är en partner som verkligen bryr sig om resultatet."
                  </p>
                  <p className="font-bold text-sm">— Karin, Bromma</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Företagsfakta</h3>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li><strong>Grundat:</strong> 2019</li>
                    <li><strong>Anställda:</strong> ca 50 personer</li>
                    <li><strong>Org.nr:</strong> 559201-1059</li>
                    <li><strong>Adress:</strong> Odlingsgatan 2A, Sundbyberg</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
