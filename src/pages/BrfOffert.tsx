import { Helmet } from "../seo";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import BrfOffertForm from "../components/BrfOffertForm";

// Kort offertformulär för bostadsrättsföreningar. Hit länkar knappen
// "Begär offert" i nyhetsbrevet till BRF:er. Fyra fält, inget mer –
// formuläret ligger i components/BrfOffertForm.

const LOFTEN = ["Testa oss helt obundet i 3 månader", "100 % nöjd-kund-garanti", "Kostnadsfritt besök i fastigheten"];

export default function BrfOffert() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Begär offert för er förening | Stodona</title>
        <meta name="description" content="Begär offert på städning för er bostadsrättsförening. Fyll i fyra uppgifter så hör vi av oss. Testa oss helt obundet i 3 månader." />
        <link rel="canonical" href="https://stodona.se/brf-offert" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="pt-32 pb-20 bg-bg-primary min-h-[80vh]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-xs font-bold tracking-widest uppercase mb-5">
                För bostadsrättsföreningar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Begär offert för er förening</h1>
              <p className="text-text-secondary text-lg">
                Fyll i fyra uppgifter, så hör vi av oss och bokar in ett kostnadsfritt besök.
              </p>
            </div>

            <BrfOffertForm sida="/brf-offert" />

            <ul className="mt-8 space-y-2.5 max-w-md mx-auto">
              {LOFTEN.map((t) => (
                <li key={t} className="flex items-center gap-3 text-text-primary font-medium">
                  <ShieldCheck className="w-5 h-5 text-cta-hover shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
