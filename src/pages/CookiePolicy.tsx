import { motion } from "motion/react";
import { Cookie, ShieldCheck, Info } from "lucide-react";

export default function CookiePolicy() {
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
              Cookie <span className="italic font-normal text-cta-hover">Policy</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Här förklarar vi hur vi använder cookies på Stodona.se för att förbättra din upplevelse och säkerställa att vår webbplats fungerar optimalt.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
            <div className="flex items-center gap-3 mb-8 p-4 bg-bg-primary rounded-2xl border border-text-primary/5">
              <Cookie className="w-8 h-8 text-cta-hover" />
              <p className="m-0 font-medium text-text-primary">Senast uppdaterad: 27 februari 2026</p>
            </div>

            <h2 className="text-3xl font-bold mb-6">Vad är cookies?</h2>
            <p className="text-text-secondary mb-8">
              Cookies är små textfiler som lagras på din dator, mobil eller surfplatta när du besöker en webbplats. De används för att webbplatsen ska fungera mer effektivt, för att ge oss information om hur webbplatsen används och för att vi ska kunna anpassa innehållet efter dina behov.
            </p>

            <h2 className="text-3xl font-bold mb-6">Hur vi använder cookies</h2>
            <p className="text-text-secondary mb-6">
              Vi använder cookies för flera olika syften:
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-cta-hover shrink-0 mt-1" />
                <div>
                  <strong className="text-text-primary block mb-1">Nödvändiga cookies</strong>
                  <p className="text-text-secondary m-0">Dessa är nödvändiga för att webbplatsen ska fungera och kan inte stängas av. De används till exempel för att komma ihåg dina integritetsinställningar eller för att du ska kunna logga in.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Info className="w-6 h-6 text-cta-hover shrink-0 mt-1" />
                <div>
                  <strong className="text-text-primary block mb-1">Analyscookies</strong>
                  <p className="text-text-secondary m-0">Dessa hjälper oss att förstå hur besökare interagerar med webbplatsen genom att samla in och rapportera information anonymt. Vi använder detta för att förbättra webbplatsens struktur och innehåll.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Cookie className="w-6 h-6 text-cta-hover shrink-0 mt-1" />
                <div>
                  <strong className="text-text-primary block mb-1">Funktionella cookies</strong>
                  <p className="text-text-secondary m-0">Dessa gör det möjligt för webbplatsen att tillhandahålla förbättrad funktionalitet och personlig anpassning, till exempel genom att komma ihåg val du gjort tidigare.</p>
                </div>
              </li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">Hantera dina cookies</h2>
            <p className="text-text-secondary mb-6">
              Du kan själv välja om du vill acceptera cookies eller inte. De flesta webbläsare accepterar cookies automatiskt, men du kan ändra inställningarna i din webbläsare för att neka cookies eller för att bli meddelad när en cookie skickas.
            </p>
            <p className="text-text-secondary mb-10">
              Observera att om du väljer att stänga av cookies kan vissa delar av vår webbplats sluta fungera korrekt eller inte vara tillgängliga för dig.
            </p>

            <div className="bg-bg-dark text-text-light p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">Frågor?</h3>
              <p className="text-text-light/80 mb-6">
                Om du har frågor om vår användning av cookies är du välkommen att kontakta oss på info@stodona.se.
              </p>
              <a href="/kontakt" className="btn-primary bg-cta-hover text-text-primary hover:bg-white inline-block">
                Kontakta oss
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
