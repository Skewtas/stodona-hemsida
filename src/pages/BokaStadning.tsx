import { motion } from "motion/react";
import { BokahemWidget } from "../components/BokahemWidget";
import { CheckCircle2, ShieldCheck, Clock, Star } from "lucide-react";

export default function BokaStadning() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-bg-primary/30">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Info & Trust */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white text-text-secondary text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                Bokning
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
                Boka din städning <br />
                <span className="text-cta-hover italic font-normal">på 60 sekunder</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed">
                Fyll i dina uppgifter nedan för att se ditt pris direkt och boka en tid som passar dig. Vi tar hand om resten.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Trygghetsgaranti</h3>
                  <p className="text-sm text-text-secondary">Vi är fullt försäkrade och lämnar alltid 100% nöjd-kund-garanti.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Ingen bindningstid</h3>
                  <p className="text-sm text-text-secondary">Boka enstaka tillfällen eller abonnemang utan krångliga kontrakt.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-text-primary/5">
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">RUT-avdrag direkt</h3>
                  <p className="text-sm text-text-secondary">Vi sköter all administration med Skatteverket åt dig.</p>
                </div>
              </div>
            </motion.div>

            <div className="pt-4 px-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold">4.9/5</span>
              </div>
              <p className="text-sm text-text-secondary italic">
                "Bästa städfirman jag anlitat. Proffsigt bemötande och fantastiskt resultat!"
              </p>
            </div>
          </div>

          {/* Right Side: Widget */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <BokahemWidget />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
