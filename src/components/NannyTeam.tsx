import { motion } from "motion/react";
import { Languages, Star, Quote } from "lucide-react";
import { NANNIES } from "../nannyData";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function NannyTeam() {
  return (
    <section className="section-spacing bg-bg-primary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
            Möt några av våra barnvakter
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Riktiga människor. Genuin omtanke.
          </h2>
          <p className="text-text-secondary text-lg">
            Varje barnvakt är personligt utvald för sin värme, erfarenhet och
            kärlek till barn. Här är ett smakprov på teamet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NANNIES.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-text-primary/5 flex flex-col"
            >
              {/* Porträtt / avatar */}
              <div className="relative h-64 bg-gradient-to-br from-cta-hover/30 to-bg-dark/80 flex items-center justify-center overflow-hidden">
                {n.image ? (
                  <img
                    src={n.image}
                    alt={n.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <span className="text-6xl font-bold text-white/90 font-display drop-shadow">
                    {initials(n.name)}
                  </span>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-text-primary">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  {n.experience}
                </div>
              </div>

              {/* Info */}
              <div className="p-7 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold">{n.name}</h3>
                <p className="text-cta-hover font-medium mb-1">{n.role}</p>
                <p className="text-sm text-text-secondary mb-4">{n.age} år</p>

                <div className="relative mb-5">
                  <Quote className="w-6 h-6 text-cta-hover/40 mb-1" />
                  <p className="text-text-primary italic leading-relaxed">{n.quote}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {n.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-bg-primary text-text-secondary px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-text-primary/5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Languages className="w-4 h-4 text-cta-hover shrink-0" />
                    {n.languages.join(" · ")}
                  </div>
                  <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">Kul om {n.name.split(" ")[0]}:</span>{" "}
                    {n.funFact}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-text-secondary mt-10 max-w-xl mx-auto">
          Vi matchar alltid er familj med rätt barnvakt utifrån barnets ålder,
          behov och personlighet – och strävar efter samma trygga ansikte varje gång.
        </p>
      </div>
    </section>
  );
}
