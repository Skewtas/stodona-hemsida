import { Helmet } from 'react-helmet-async';
import { motion } from "motion/react";
import { ShieldCheck, Lock, Eye } from "lucide-react";

export default function Integritetspolicy() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Integritetspolicy | Stodona</title>
      </Helmet>
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
              Integritets<span className="italic font-normal text-cta-hover">policy</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Din integritet är viktig för oss. Här beskriver vi hur vi samlar in, använder och skyddar dina personuppgifter.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
            <h2 className="text-3xl font-bold mb-6">Inledning</h2>
            <p className="text-text-secondary mb-8">
              Stodona ("vi", "oss") värnar om din personliga integritet och strävar efter att alltid skydda dina personuppgifter på bästa sätt. Denna policy förklarar hur vi behandlar dina personuppgifter i enlighet med dataskyddsförordningen (GDPR).
            </p>

            <h2 className="text-3xl font-bold mb-6">Vilka uppgifter samlar vi in?</h2>
            <p className="text-text-secondary mb-4">Vi samlar in uppgifter som du lämnar till oss när du:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Bokar en städning eller begär offert</li>
              <li>Kontaktar oss via formulär, e-post eller telefon</li>
              <li>Använder vår kundportal</li>
              <li>Anmäler dig till vårt nyhetsbrev</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">Varför behandlar vi dina uppgifter?</h2>
            <p className="text-text-secondary mb-6">Vi behandlar dina personuppgifter för att kunna:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Fullfölja våra avtal med dig (t.ex. utföra städning)</li>
              <li>Hantera RUT-avdrag hos Skatteverket</li>
              <li>Kommunicera med dig gällande dina bokningar</li>
              <li>Förbättra våra tjänster och vår webbplats</li>
              <li>Uppfylla rättsliga förpliktelser (t.ex. bokföringslagen)</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">Hur länge sparar vi uppgifterna?</h2>
            <p className="text-text-secondary mb-8">
              Vi sparar dina uppgifter så länge det är nödvändigt för de ändamål de samlades in för, eller så länge det krävs enligt lag.
            </p>

            <h2 className="text-3xl font-bold mb-6">Dina rättigheter</h2>
            <p className="text-text-secondary mb-6">Du har rätt att:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Få information om vilka uppgifter vi har om dig</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>Begära radering av dina uppgifter ("rätten att bli bortglömd")</li>
              <li>Invända mot direktmarknadsföring</li>
            </ul>

            <div className="bg-bg-primary p-8 rounded-3xl border border-text-primary/5 mt-12">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-cta-hover" />
                Säkerhet
              </h3>
              <p className="text-text-secondary">
                Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot obehörig åtkomst, ändring eller förstörelse.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
