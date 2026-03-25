import { Helmet } from 'react-helmet-async';
import { motion } from "motion/react";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function Villkor() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Allmänna villkor | Stodona</title>
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
              Allmänna <span className="italic font-normal text-cta-hover">Villkor</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Här hittar du våra avtalsvillkor för både privatpersoner och företag. Vi strävar efter tydlighet och trygghet i alla våra samarbeten.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-8 bg-bg-primary rounded-3xl border border-text-primary/5">
                <h3 className="text-2xl font-bold mb-4">För privatpersoner</h3>
                <p className="text-text-secondary text-sm mb-6">Gäller för hemstädning, flyttstädning och andra hushållsnära tjänster.</p>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> Helt obundet abonnemang</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> En kalendermånads uppsägningstid</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> 10 dagars betalningsvillkor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> RUT-avdrag direkt på fakturan</li>
                </ul>
              </div>
              <div className="p-8 bg-bg-dark text-text-light rounded-3xl">
                <h3 className="text-2xl font-bold mb-4">För företag</h3>
                <p className="text-text-light/60 text-sm mb-6">Gäller för kontorsstädning, trappstädning och byggstädning.</p>
                <ul className="space-y-3 text-sm text-text-light/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> Skräddarsydda serviceavtal</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> 30 dagars betalningsvillkor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cta-hover" /> Dedikerad kontaktperson</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6">1. Tjänsternas utförande</h2>
            <p className="text-text-secondary mb-4">
              Stodona åtar sig att utföra tjänsterna på ett professionellt och fackmannamässigt sätt. Vår personal är utbildad och innehar erforderliga försäkringar.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Vi strävar efter att samma personal utför tjänsten vid återkommande tillfällen.</li>
              <li>Vid sjukdom eller annan frånvaro har vi rätt att sätta in ersättningspersonal.</li>
              <li>Vi har rätt att anlita underleverantörer, för vilka vi ansvarar som för oss själva.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">2. Kundens åtaganden</h2>
            <p className="text-text-secondary mb-4">
              För att vi ska kunna utföra vårt arbete optimalt behöver kunden:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Tillse att vi har tillträde till bostaden/lokalen (t.ex. via nyckel eller kod).</li>
              <li>Informera om särskilt ömtåliga föremål eller material som kräver speciell hantering.</li>
              <li>Tillhandahålla fungerande utrustning (t.ex. dammsugare) om inte annat avtalats.</li>
              <li>Säkerställa en god arbetsmiljö för vår personal.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">3. Av- och ombokning</h2>
            <p className="text-text-secondary mb-4">
              Vi förstår att planer kan ändras, men behöver framförhållning för att planera vår personal.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Av- och ombokning ska ske senast 48 timmar innan städtillfället börjar.</li>
              <li>Vid senare av- eller ombokning debiteras 50% av kostnaden för det planerade tillfället.</li>
              <li>Uppsägning av abonnemang för privatpersoner sker med en kalendermånads varsel och är helt obundet.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">4. RUT-avdrag</h2>
            <p className="text-text-secondary mb-4">
              Vi administrerar RUT-avdraget direkt mot Skatteverket.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Kunden ansvarar för att ha utrymme för RUT-avdrag.</li>
              <li>Om Skatteverket avslår utbetalning faktureras kunden resterande belopp.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">5. Reklamation och garanti</h2>
            <p className="text-text-secondary mb-4">
              Vi strävar efter 100% nöjda kunder och följer Allmänna reklamationsnämndens (ARN) riktlinjer. Om du inte är nöjd med tjänsten som beställts enligt vad som ingår i uppdraget:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Eventuella anmärkningar på utfört arbete ska meddelas oss inom 24 timmar efter avslutat arbete.</li>
              <li>Reklamation sker via kontaktformuläret (välj "Synpunkter eller reklamation") eller e-post till info@stodona.se. Bifoga gärna bilder för snabbare hantering.</li>
              <li>Stodona ska i första hand ges tillfälle att åtgärda (avhjälpa) det som kunden inte är nöjd med genom en kostnadsfri omstädning av de berörda ytorna.</li>
              <li>Om bristerna inte kan åtgärdas eller om felet kvarstår efter försök till avhjälpande, görs ett prisavdrag i proportion till vad som har reklamerats.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">6. Ansvar och försäkring</h2>
            <p className="text-text-secondary mb-4">
              Stodona innehar ansvarsförsäkring som täcker skador orsakade av vår personal genom oaktsamhet.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>Vi ansvarar endast för direkta skador, ej indirekta skador (t.ex. inkomstbortfall).</li>
              <li>Ersättning baseras på föremålets marknadsvärde (åldersavdrag kan förekomma).</li>
              <li>Kunden ska inneha en gällande hemförsäkring.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-6">7. Betalning</h2>
            <p className="text-text-secondary mb-4">
              Betalning sker mot faktura som skickas via e-post eller som e-faktura.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-text-secondary">
              <li>För privatpersoner gäller 10 dagars betalningstid.</li>
              <li>För företag gäller 30 dagars betalningstid, om inget annat avtalats.</li>
              <li>Vid sen betalning utgår dröjsmålsränta enligt lag.</li>
            </ul>

            <div className="bg-bg-primary p-8 rounded-3xl border border-text-primary/5 mt-12">
              <h3 className="text-2xl font-bold mb-4">Frågor och svar</h3>
              <p className="text-text-secondary mb-6">
                För mer detaljerad information om hur våra tjänster fungerar i praktiken, besök vår FAQ-sida.
              </p>
              <a 
                href="https://www.stodona.se/om-oss/fragor-och-svar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cta-hover font-bold hover:underline inline-flex items-center gap-2"
              >
                Gå till Frågor & Svar
                <FileText className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
