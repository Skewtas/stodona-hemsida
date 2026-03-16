import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, HelpCircle, CheckCircle2, Star } from 'lucide-react';
import WhyStodona from '../components/WhyStodona';

interface LocalSeoPageProps {
  baseService: string; // e.g., "hemstadning", "flyttstadning"
  areaName: string; // e.g., "Ekerö", "Nacka"
  description: string;
  heroImage: string;
  subAreas?: { name: string; link: string }[];
}

export default function LocalSeoPage({ baseService, areaName, description, heroImage, subAreas }: LocalSeoPageProps) {
  const { area } = useParams<{ area: string }>();
  const displayAreaName = areaName || (area ? area.charAt(0).toUpperCase() + area.slice(1) : 'Okänt område');
  const serviceNameMap: Record<string, string> = {
    hemstadning: 'Hemstädning',
    flyttstadning: 'Flyttstädning',
    storstadning: 'Storstädning',
    foretagsstadning: 'Företagsstädning',
    byggstadning: 'Byggstädning',
    trappstadning: 'Trappstädning',
    bodstadning: 'Bod/etableringsstädning',
    fonsterputsning: 'Fönsterputsning'
  };
  const displayBaseService = serviceNameMap[baseService.toLowerCase()] || (baseService.charAt(0).toUpperCase() + baseService.slice(1).replace(/stadning/i, 'städning'));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src={heroImage}
            alt={`${displayBaseService} i ${displayAreaName}`}
            className="w-full h-full object-cover object-center opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container-custom relative z-10 text-text-light">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-cta-hover rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6 drop-shadow-lg">
              {displayBaseService} i <span className="text-white italic font-normal">{displayAreaName}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/90 leading-relaxed mb-8 drop-shadow-md">
              {description}
            </p>
            <a href="https://boka.stodona.se" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Boka {displayBaseService.toLowerCase()} i {displayAreaName}
            </a>
          </motion.div>
        </div>
      </section>





      {/* Content Section - What's included */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                Vad ingår i vår {displayBaseService.toLowerCase()} i {displayAreaName}?
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                När du anlitar Stodona för {displayBaseService.toLowerCase()} i {displayAreaName} kan du
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
                  Vill du ha ett skinande rent hem i {displayAreaName}?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi har lediga tider i {displayAreaName} den här veckan. Boka nu och få
                  hotellkänsla hemma.
                </p>
                <a href="https://boka.stodona.se" className="btn-primary">
                  Boka {displayBaseService.toLowerCase()} direkt
                </a>
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
                RUT-avdrag för {displayBaseService.toLowerCase()}
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                När du anlitar oss för {displayBaseService.toLowerCase()} har du rätt till RUT-avdrag.
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
                  <p className="font-bold text-sm">— Sofia, {displayAreaName}</p>
                </div>

                <WhyStodona />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Vanliga frågor om {displayBaseService.toLowerCase()} i {displayAreaName}
            </h2>
            <p className="text-text-secondary text-lg">
              Här har vi samlat de vanligaste frågorna vi får om vår
              {displayBaseService.toLowerCase()}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[ // FAQ content can be made dynamic based on baseService if needed
              {
                q: "Har ni med er eget städmaterial?",
                a: "Ja, vi tar med oss allt städmaterial och alla rengöringsprodukter som behövs. Vi använder miljövänliga och professionella produkter för bästa resultat. Det enda du behöver tillhandahålla är en fungerande dammsugare.",
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
                className="card-rounded bg-white p-6 border border-text-primary/10"
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

      {/* Sub-areas / More Info */}
      {subAreas && subAreas.length > 0 && (
        <section className="section-spacing bg-white">
          <div className="container-custom">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Vi täcker även <span className="text-cta-hover">underområden</span> i {displayAreaName}
              </h2>
              <p className="text-text-secondary text-lg">
                Vårt team är redo att hjälpa dig oavsett var i {displayAreaName} du bor.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {subAreas.map((subArea, index) => (
                <motion.div
                  key={subArea.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={subArea.link}
                    className="flex items-center justify-center gap-3 p-4 bg-bg-primary rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <MapPin className="w-5 h-5 text-text-secondary group-hover:text-cta-hover transition-colors" />
                    <span className="text-lg font-medium text-text-primary group-hover:text-cta-hover transition-colors">
                      {subArea.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* General CTA */}
      <section className="py-20 bg-cta-hover text-white relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Få ett rent hem i {displayAreaName} idag!
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Boka din städning snabbt och enkelt. Njut av mer fritid och ett skinande rent resultat.
          </p>
          <a
            href="https://boka.stodona.se"
            className="btn-primary bg-white text-cta-hover hover:bg-bg-primary hover:text-white text-lg px-8 py-4"
          >
            Boka {displayBaseService.toLowerCase()} nu
          </a>
        </div>
      </section>
    </div>
  );
}
