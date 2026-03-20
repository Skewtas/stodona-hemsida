import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { QuickBookingWidget } from "../components/QuickBookingWidget";
import WhyStodona from "../components/WhyStodona";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";

export default function Hemstadning() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/stodona_right_image.jpg" 
            alt="Hemstädning Stockholm" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
            >
              {t('hemstadning.hero.title', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('hemstadning.hero.subtitle', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {t('hemstadning.hero.desc', lang)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                to="/boka-stadning"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4"
              >
                {t('hemstadning.hero.cta1', lang)}
              </Link>
              <Link
                to="/boka-stadning"
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark text-lg px-8 py-4"
              >
                {t('hemstadning.hero.cta2', lang)}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium text-text-light/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('hemstadning.hero.b1', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('hemstadning.hero.b2', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('hemstadning.hero.b3', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('hemstadning.hero.b4', lang)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bokahem-integration (Placeholder) */}
      <section className="py-16 bg-white border-b border-text-primary/10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Boka din hemstädning på 60 sekunder.
            </h2>
            <p className="text-text-secondary">
              Fyll i dina uppgifter nedan för att se pris och boka direkt.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <QuickBookingWidget />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                Vad ingår i vår hemstädning?
              </h2>
              <div className="mb-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                <img 
                  src="/stodona_right_image.jpg" 
                  alt="Hemstädning i Stockholm" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                När du anlitar Stodona för hemstädning i Stockholm kan du
                förvänta dig ett skinande rent hem, varje gång. Vi följer en
                noggrann checklista för att säkerställa att inget missas.
              </p>

              <h3 className="text-2xl font-bold mt-12 mb-4">Alla rum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Dammsugning av golv, mattor och klädda möbler</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Fuktmoppning av alla golv</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>
                    Avtorkning av fria ytor, dörrar, karmar och strömbrytare
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Tömning av papperskorgar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Putsning av speglar</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Kök</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av diskbänk, arbetsbänkar och spishäll</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av vitvaror utvändigt</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring inuti mikrovågsugn</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av köksluckor och lådfronter</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold mt-12 mb-4">Badrum</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av toalett, handfat och dusch/badkar</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Avtorkning av badrumsskåp utvändigt</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                  <span>Rengöring av kranar och munstycken</span>
                </li>
              </ul>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Vill du ha ett skinande rent hem?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi har lediga tider i Stockholm den här veckan. Boka nu och få
                  hotellkänsla hemma.
                </p>
                <Link to="/boka-stadning" className="btn-primary">
                  Boka hemstädning direkt
                </Link>
              </div>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                Stodona-metoden: Vårt kvalitetssystem
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                Vi tror på struktur och noggrannhet. Därför har vi utvecklat
                Stodona-metoden, ett kvalitetssystem som garanterar att varje
                städning utförs med samma höga standard.
              </p>
              <p className="text-lg text-text-secondary mb-8">
                Våra städare är utbildade i att arbeta systematiskt, rum för
                rum, uppifrån och ner. Vi använder endast miljövänliga och
                effektiva rengöringsprodukter som är skonsamma mot ditt hem och
                vår miljö.
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                RUT-avdrag för hemstädning
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                När du anlitar oss för hemstädning har du rätt till RUT-avdrag.
                Det innebär att du endast betalar 50% av arbetskostnaden. Vi
                sköter all administration och drar av beloppet direkt på din
                faktura. Smidigt och enkelt!
              </p>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="card-rounded bg-bg-dark text-text-light p-8 shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="italic text-sm mb-4">
                    "Bästa städfirman jag anlitat. Alltid i tid, noggranna och
                    det doftar fantastiskt när man kommer hem."
                  </p>
                  <p className="font-bold text-sm">— Sofia, Stockholm</p>
                </div>

                <WhyStodona />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Vanliga frågor om hemstädning
            </h2>
            <p className="text-text-secondary text-lg">
              Här har vi samlat de vanligaste frågorna vi får om vår
              hemstädning.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Har ni med er eget städmaterial?",
                a: "Nej, vid hemstädning använder vi som standard kundens städmaterial. Du behöver tillhandahålla dammsugare, mopp och hink, 3 mikrofiberdukar, svamp med vit yta samt rengöringsmedel. Vi kan dock tillhandahålla allt städmaterial mot en tilläggskostnad på 499 kr (då kör vi ut materialet med bil).",
              },
              {
                q: "Är det samma person som städar varje gång?",
                a: "Vi strävar alltid efter att det ska vara samma städare eller team som kommer till dig vid regelbunden städning. Vid sjukdom eller ledighet skickar vi en vikarie för att din städning inte ska bli inställd.",
              },
              {
                q: "Har ni någon bindningstid?",
                a: "Nej, vi har ingen bindningstid på våra abonnemang. Du kan när som helst säga upp eller pausa din städning med 14 dagars varsel.",
              },
              {
                q: "Vad händer om något går sönder?",
                a: "Vi är fullt ansvarsförsäkrade. Skulle olyckan vara framme och något går sönder under städningen ersätter vi det givetvis.",
              },
              {
                q: "Hur fungerar RUT-avdraget?",
                a: "Vi sköter all administration kring RUT-avdraget. Du betalar endast 50% av arbetskostnaden på din faktura, och vi ansöker om resten från Skatteverket.",
              },
              {
                q: "Måste jag vara hemma när ni städar?",
                a: "Nej, du behöver inte vara hemma. De flesta av våra kunder ger oss en nyckel eller kod så att vi kan städa medan de är på jobbet.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="card-rounded bg-bg-primary p-6 border border-text-primary/10"
              >
                <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-text-secondary pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End CTA */}
      <section className="py-24 bg-cta-hover text-text-primary relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Redo för ett renare hem?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Boka din hemstädning idag. Ingen bindningstid, bara hotellkänsla
            hemma.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/boka-stadning"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              Boka städning direkt
            </Link>
          </div>
          <p className="mt-6 text-sm font-medium opacity-80">
            Tider fylls snabbt – säkra din tid idag.
          </p>
        </div>
      </section>
    </div>
  );
}
