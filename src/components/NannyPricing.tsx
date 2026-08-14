import { motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { NANNY_PLANS } from "../nannyData";

export default function NannyPricing() {
  return (
    <section id="priser" className="section-spacing bg-white scroll-mt-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-bg-primary text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
            Priser & upplägg
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Välj det som passar er vardag</h2>
          <p className="text-text-secondary text-lg">
            Behöver ni hjälp då och då eller varje vecka? Betala per timme utan bindningstid
            – eller spara med ett abonnemang. Ni väljer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
          {NANNY_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                plan.featured
                  ? "bg-bg-dark text-text-light shadow-2xl md:-translate-y-4 border border-cta-hover/40"
                  : "bg-bg-primary text-text-primary border border-text-primary/5"
              }`}
            >
              {plan.featured && (
                <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 bg-cta-hover text-text-primary text-xs font-bold px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" /> Populärast
                </span>
              )}

              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>
                {plan.tagline}
              </p>

              <div className="mb-1 flex items-end gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`mb-1 ${plan.featured ? "text-text-light/70" : "text-text-secondary"}`}>{plan.unit}</span>
              </div>
              <p className={`text-sm ${plan.featured ? "text-cta-hover" : "text-text-secondary"}`}>{plan.hint}</p>
              <p className={`text-sm font-medium mb-6 mt-1 ${plan.featured ? "text-text-light/80" : "text-text-primary"}`}>
                {plan.afterRut}
              </p>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${plan.featured ? "text-cta-hover" : "text-cta-hover"}`} />
                    <span className={`text-sm ${plan.featured ? "text-text-light/90" : "text-text-secondary"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/ny-kund"
                className={`btn-primary w-full ${
                  plan.featured
                    ? "bg-cta-hover text-text-primary hover:bg-white"
                    : "bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary"
                }`}
              >
                {plan.unit === "/timme" ? "Boka tillfälle" : "Kom igång"}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-2">
          <p className="text-text-secondary">
            Behöver ni fler timmar eller ett skräddarsytt upplägg?{" "}
            <a href="#forfragan" className="text-cta-hover font-medium hover:underline">Kontakta oss</a> så löser vi det.
          </p>
          <p className="text-xs text-text-secondary/80 max-w-2xl mx-auto">
            Priser inkl. moms, före RUT-avdrag. Barnpassning i hemmet ger rätt till
            RUT-avdrag (50 % på arbetskostnaden). Inga bindningstider – säg upp abonnemang
            när som helst.
          </p>
        </div>
      </div>
    </section>
  );
}
