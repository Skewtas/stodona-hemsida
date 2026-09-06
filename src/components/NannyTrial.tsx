import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { NANNY_TRIAL } from "../nannyData";

export default function NannyTrial() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-cta-hover/15 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-4 h-4 text-cta-hover" /> Prova först
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">Vill ni prova först?</h2>
            <p className="text-text-secondary leading-relaxed mb-2">
              Träffa en av våra barnvakter och prova Stodona Barnpassning innan ni väljer ett
              återkommande upplägg. Trivs familjen och barnvakten tillsammans kan ni fortsätta med
              samma barnvakt och välja ett månadspaket.
            </p>
            <p className="text-xs text-text-secondary/80">
              Erbjudandet gäller nya barnpassningskunder och kan användas en gång per familj.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm text-text-secondary mb-1">Prova-på</p>
            <p className="text-4xl md:text-5xl font-bold mb-1">
              {NANNY_TRIAL.hours} timmar för {NANNY_TRIAL.price} kr
            </p>
            <p className="text-sm text-text-secondary mb-6">efter RUT-avdrag</p>
            <Link
              to="/ny-kund"
              className="btn-primary w-full bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary"
            >
              {NANNY_TRIAL.cta}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
