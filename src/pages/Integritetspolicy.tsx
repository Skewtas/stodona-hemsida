import { Helmet } from "../seo";
import { motion } from "motion/react";
import { ShieldCheck, Lock, Eye } from "lucide-react";

export default function Integritetspolicy() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Integritetspolicy – GDPR och dataskydd | Stodona</title>
        <meta name="description" content="Läs Stodonas integritetspolicy. Vi beskriver hur vi samlar in, använder och skyddar dina personuppgifter i enlighet med GDPR." />
        <meta property="og:title" content="Integritetspolicy – GDPR och dataskydd | Stodona" />
        <meta property="og:description" content="Så skyddar vi dina personuppgifter. Läs vår integritetspolicy." />
        <link rel="canonical" href="https://stodona.se/integritetspolicy" />
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
              <li>Chattar med Camilla, vår digitala assistent på webbplatsen</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">Chatten på webbplatsen</h2>
            <p className="text-text-secondary mb-4">
              Camilla i chatten är en digital assistent som drivs av AI, inte en människa. Hon svarar på frågor, räknar fram priser, visar lediga tider och kan förbereda en bokning som du själv slutför. Svaren kan innehålla fel, och ersättning eller undantag bedöms alltid av vår kundservice.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-text-secondary">
              <li>
                <strong>Vad som behandlas:</strong> det du skriver i chatten, och de uppgifter du själv väljer att lämna, till exempel namn, e-post, telefon eller adress när du vill boka eller bli kontaktad. Skriv aldrig personnummer, portkoder eller kortuppgifter i chatten – de fyller du i på bokningssidan.
              </li>
              <li>
                <strong>Vem som behandlar det:</strong> meddelandena skickas till vår AI-leverantör Anthropic för att ta fram svaren. Anthropic använder dem inte för att träna sina AI-modeller.
              </li>
              <li>
                <strong>Om du vill boka eller bli kontaktad:</strong> uppgifterna du lämnar går vidare till vårt bokningssystem eller till vår kundservice, och behandlas då som vid en vanlig bokning eller kontakt.
              </li>
              <li>
                <strong>Statistik:</strong> för att förbättra chatten och vår service sparar vi vilka ämnen samtalen gäller, hur de slutade och frågorna i anonymiserad form. Telefonnummer, e-post, personnummer, adresser och namn rensas bort innan något sparas. Statistiken kan inte kopplas till din webbläsare och visas bara för behörig personal. Den rättsliga grunden är vårt berättigade intresse av att förbättra vår service.
              </li>
            </ul>
            <p className="text-text-secondary mb-8">
              Själva samtalet sparas i högst två timmar så att chatten minns vad ni pratat om. I din webbläsare sparas samtalet bara tills du stänger fliken.
            </p>

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
            <p className="text-text-secondary mb-8">
              Chattsamtal sparas i högst två timmar. Anonymiserade frågor från chatten raderas efter 90 dagar. Kvar blir bara siffror, till exempel hur många samtal som gällde flyttstädning en viss dag.
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
