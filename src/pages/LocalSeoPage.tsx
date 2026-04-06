import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, HelpCircle, CheckCircle2, Star } from 'lucide-react';
import WhyStodona from '../components/WhyStodona';
import { useLanguage } from '../context/LanguageContext';

interface LocalSeoPageProps {
  baseService: string;
  areaName: string;
  description: string;
  heroImage: string;
  subAreas?: { name: string; link: string }[];
}

function getPreposition(area: string): string {
  const paAreas = ['Lidingö', 'Ekerö', 'Vaxholm', 'Östermalm', 'Södermalm'];
  return paAreas.some(a => area.toLowerCase().includes(a.toLowerCase())) ? 'på' : 'i';
}

export default function LocalSeoPage({ baseService, areaName, description, heroImage, subAreas }: LocalSeoPageProps) {
  const { lang } = useLanguage();
  const { area } = useParams<{ area: string }>();
  const displayAreaName = areaName || (area ? area.charAt(0).toUpperCase() + area.slice(1) : 'Okänt område');
  const prep = getPreposition(displayAreaName);
  const serviceNameMap: Record<string, string> = {
    hemstadning: 'Hemstädning',
    flyttstadning: 'Flyttstädning',
    storstadning: 'Storstädning',
    foretagsstadning: 'Företagsstädning',
    byggstadning: 'Byggstädning',
    trappstadning: 'Trappstädning',
    bodstadning: 'Bod/etableringsstädning',
    fonsterputsning: 'Fönsterputsning',
    stadfirma: 'Städfirma'
  };
  const displayBaseService = serviceNameMap[baseService.toLowerCase()] || (baseService.charAt(0).toUpperCase() + baseService.slice(1).replace(/stadning/i, 'städning'));

  // Service-specific checklists
  const serviceChecklists: Record<string, { title: string; items: string[] }[]> = {
    hemstadning: [
      { title: 'Alla rum', items: ['Dammsugning av golv, mattor och klädda möbler', 'Fuktmoppning av alla golv', 'Avtorkning av fria ytor, dörrar, karmar och strömbrytare', 'Tömning av papperskorgar', 'Putsning av speglar'] },
      { title: 'Kök', items: ['Rengöring av diskbänk, arbetsbänkar och spishäll', 'Avtorkning av vitvaror utvändigt', 'Rengöring inuti mikrovågsugn', 'Avtorkning av köksluckor och lådfronter'] },
      { title: 'Badrum', items: ['Rengöring av toalett, handfat och dusch/badkar', 'Avtorkning av badrumsskåp utvändigt', 'Rengöring av kranar och munstycken'] },
    ],
    fonsterputsning: [
      { title: 'Fönsterputsning', items: ['Putsning av fönsterglas – insida och utsida', 'Putsning mellan glasen (om delbara fönster)', 'Avtorkning av fönsterkarmar och fönsterbänkar', 'Vi tar med all utrustning och miljövänliga rengöringsmedel'] },
      { title: 'Bra att veta', items: ['Plocka undan blommor och föremål från fönsterbrädorna', 'Dra undan gardiner och persienner', 'Meddela oss om fönstren är svåråtkomliga eller kräver specialstege', 'Vi putsar fönster året runt, så länge det inte är extrem kyla'] },
    ],
    storstadning: [
      { title: 'Alla rum', items: ['Dammsugning och fuktmoppning av alla golv', 'Avtorkning av lister, socklar och dörrkarmar', 'Putsning av speglar och fönsterbrädor', 'Avtorkning av lampor och takarmaturer', 'Dammsugning av möbler och under kuddar'] },
      { title: 'Kök – djuprengöring', items: ['Rengöring av ugn invändigt och utvändigt', 'Rengöring inuti kylskåp och frys', 'Avtorkning av skåp invändigt och utvändigt', 'Rengöring av spisfläkt och filter', 'Avkalkning av kranar och diskbänk'] },
      { title: 'Badrum – djuprengöring', items: ['Djuprengöring av kakel och fogar', 'Avkalkning av duschhörna och badkar', 'Rengöring av ventiler och golvbrunn', 'Putsning av alla ytor och armaturer'] },
    ],
    flyttstadning: [
      { title: 'Alla rum', items: ['Dammsugning och våttorkning av golv, lister och socklar', 'Rengöring av fönster invändigt, karmar och bänkar', 'Avtorkning av eluttag, strömbrytare och dörrar', 'Rengöring av garderober och skåp invändigt'] },
      { title: 'Kök', items: ['Rengöring av ugn, spis och fläkt grundligt', 'Rengöring inuti alla skåp och lådor', 'Rengöring av kylskåp och frys invändigt', 'Avkalkning och rengöring av diskmaskin'] },
      { title: 'Badrum', items: ['Djuprengöring av toalett, handfat och dusch', 'Avkalkning av kakel och armaturer', 'Rengöring av ventiler och golvbrunn'] },
    ],
    foretagsstadning: [
      { title: 'Kontor och gemensamma ytor', items: ['Dammsugning och moppning av alla golv', 'Avtorkning av skrivbord, bord och fria ytor', 'Tömning av papperskorgar och byte av påsar', 'Putsning av glaspartier och speglar'] },
      { title: 'Kök och pentry', items: ['Rengöring av diskbänk och bänkytor', 'Avtorkning av vitvaror utvändigt', 'Påfyllning av diskmedel och handtvål'] },
      { title: 'Toaletter', items: ['Rengöring och desinficering av toaletter', 'Påfyllning av toalettpapper och tvål', 'Rengöring av speglar och handfat'] },
    ],
    byggstadning: [
      { title: 'Grovstädning', items: ['Bortforsling av byggdamm och skräp', 'Dammsugning av alla ytor inklusive väggar och tak', 'Våttorkning av golv, väggar och fönster', 'Rengöring av ventiler och eluttag'] },
      { title: 'Finstädning', items: ['Putsning av fönster och glaspartier', 'Avtorkning av alla lister, karmar och socklar', 'Rengöring av kök och badrum grundligt', 'Slutlig inspektion och kvalitetskontroll'] },
    ],
    trappstadning: [
      { title: 'Trapphus', items: ['Sopning och moppning av alla trappsteg', 'Avtorkning av ledstänger och räcken', 'Rengöring av entrépartier och dörrar', 'Putsning av speglar och glaspartier', 'Tömning av papperskorgar'] },
    ],
    bodstadning: [
      { title: 'Bod/etablering', items: ['Dammsugning och moppning av golv', 'Avtorkning av bord, bänkar och ytor', 'Rengöring av köksutrustning och pentry', 'Rengöring av toaletter och duschrum', 'Tömning av papperskorgar'] },
    ],
    stadfirma: [
      { title: 'Vad vi erbjuder', items: ['Hemstädning för en smidigare vardag', 'Professionell storstädning och djuprengöring', 'Flyttstädning med 100% kvalitetsgaranti', 'Fönsterputsning för rändfria glas'] },
      { title: 'Varför Stodona som städfirma?', items: ['Vi städar med egna checklistor för garanterat resultat', 'Samma städteam vid varje löpande städning', 'Fast pris utan dolda avgifter', 'All personal är kollektivansluten och ansvarsförsäkrad'] },
    ],
  };

  // Service-specific FAQs
  const serviceFaqs: Record<string, { q: string; a: string }[]> = {
    hemstadning: [
      { q: 'Har ni med er eget städmaterial?', a: 'Ja, vi tar med oss allt städmaterial och alla rengöringsprodukter som behövs. Vi använder miljövänliga och professionella produkter för bästa resultat. Det enda du behöver tillhandahålla är en fungerande dammsugare.' },
      { q: 'Är det samma person som städar varje gång?', a: 'Vi strävar alltid efter att det ska vara samma städare eller team som kommer till dig vid regelbunden städning. Vid sjukdom eller ledighet skickar vi en vikarie för att din städning inte ska bli inställd.' },
      { q: 'Har ni någon bindningstid?', a: 'Nej, vi har ingen bindningstid på våra abonnemang. Du kan när som helst säga upp eller pausa din städning med 14 dagars varsel.' },
      { q: 'Vad händer om något går sönder?', a: 'Vi är fullt ansvarsförsäkrade. Skulle olyckan vara framme och något går sönder under städningen ersätter vi det givetvis.' },
      { q: 'Hur fungerar RUT-avdraget?', a: 'Vi sköter all administration kring RUT-avdraget. Du betalar endast 50% av arbetskostnaden på din faktura, och vi ansöker om resten från Skatteverket.' },
      { q: 'Måste jag vara hemma när ni städar?', a: 'Nej, du behöver inte vara hemma. De flesta av våra kunder ger oss en nyckel eller kod så att vi kan städa medan de är på jobbet.' },
    ],
    fonsterputsning: [
      { q: 'Putsar ni fönster på vintern?', a: 'Ja, vi putsar fönster året runt, så länge det inte är extrem kyla eller storm. Vi rekommenderar regelbunden putsning för bästa resultat.' },
      { q: 'Vem står för utrustningen?', a: 'Vi tar med allt vi behöver – skrapor, moppar, miljövänliga rengöringsmedel och stegar. Meddela oss i förväg om du har ovanligt hög takhöjd.' },
      { q: 'Ingår fönsterputsning i hemstädningen?', a: 'Nej, fönsterputsning bokas som en separat tjänst. Du kan dock kombinera fönsterputsning med din hemstädning för att få allt gjort vid samma tillfälle.' },
      { q: 'Hur ofta bör man putsa fönster?', a: 'Vi rekommenderar fönsterputsning 2-4 gånger per år för bästa resultat. Många av våra kunder bokar vår- och höstputsning.' },
      { q: 'Hur fungerar RUT-avdraget för fönsterputsning?', a: 'Fönsterputsning berättigar till RUT-avdrag. Du betalar bara 50% av arbetskostnaden. Vi sköter all administration åt dig.' },
    ],
    storstadning: [
      { q: 'Vad är skillnaden mellan hemstädning och storstädning?', a: 'Storstädning är en djupare rengöring som når ställen som inte ingår i vanlig hemstädning – som insidan av ugn, kylskåp, skåp, fönsterputsning och avkalkning.' },
      { q: 'Hur lång tid tar en storstädning?', a: 'Det beror på bostadens storlek och skick, men räkna med 4-8 timmar för en normalbostad. Vi ger dig en tidsuppskattning vid bokning.' },
      { q: 'Hur ofta bör man storstäda?', a: 'Vi rekommenderar storstädning 1-2 gånger per år, gärna vår och höst, som komplement till regelbunden hemstädning.' },
      { q: 'Vad händer om något går sönder?', a: 'Vi är fullt ansvarsförsäkrade. Skulle olyckan vara framme och något går sönder under städningen ersätter vi det givetvis.' },
      { q: 'Hur fungerar RUT-avdraget?', a: 'Vi sköter all administration kring RUT-avdraget. Du betalar endast 50% av arbetskostnaden på din faktura.' },
    ],
    stadfirma: [
      { q: 'Erbjuder ni städning i mitt område?', a: 'Ja! Vi har lokala team som städar dagligen och vi har oftast lediga tider redan samma vecka.' },
      { q: 'Är ni ansvarsförsäkrade?', a: 'Självklart. Vi är fullt ansvarsförsäkrade så att du alltid kan känna dig helt trygg när vi städar.' },
      { q: 'Hur fungerar RUT-avdraget när jag bokar en städfirma?', a: 'Vi sköter all administration. Du betalar bara 50% av kostnaden och RUT dras automatiskt direkt på din faktura.' },
    ],
  };

  const activeChecklists = serviceChecklists[baseService.toLowerCase()] || serviceChecklists.hemstadning;
  const activeFaqs = serviceFaqs[baseService.toLowerCase()] || serviceFaqs.hemstadning;

  // Service-specific intro text
  const serviceIntroTexts: Record<string, string> = {
    hemstadning: `När du anlitar Stodona, din lokala städfirma, för professionell ${displayBaseService.toLowerCase()} ${prep} ${displayAreaName} kan du alltid förvänta dig ett skinande rent hem. Vår erfarna städpersonal följer en noggrann checklista för bäst hemstädning varje gång.`,
    fonsterputsning: `Att putsa fönster kan vara både tidskrävande och svårt. Som den främsta städfirman för fönsterputsning ${prep} ${displayAreaName} har vi utrustningen som krävs för att ge dig skinande och helt rändfria fönster.`,
    storstadning: `Vår professionella storstädning ${prep} ${displayAreaName} är en djupgående rengöring för dig som vill ha marknadens bästa städhjälp. Perfekt för en ordentlig djuprengöring av hela bostaden.`,
    flyttstadning: `Vår städfirma erbjuder marknadens bästa flyttstädning ${prep} ${displayAreaName}. Vi tillämpar en noggrann checklista för flyttstäd som säkerställer att din bostad blir godkänd med flyttstädningsgaranti.`,
    foretagsstadning: `Vi är en rekommenderad städfirma som erbjuder skräddarsydd kontorsstädning och företagsstädning ${prep} ${displayAreaName}. Låt våra städexperter skapa en ren och trivsam arbetsmiljö för ert företag.`,
    byggstadning: `Efter renovering eller nybygge behövs en rejäl grovstädning. Vi erbjuder professionell byggstädning ${prep} ${displayAreaName}. Från byggdamm till finstädning – vi är städfirman som gör lokalen inflyttningsklar.`,
    trappstadning: `Håll ert trapphus välkomnande med marknadens mest prisvärda trappstädning ${prep} ${displayAreaName}. Vår städfirma underhåller BRF:er och fastigheter med högsta städkvalitet.`,
    bodstadning: `Vi är städfirman för professionell bodstädning ${prep} ${displayAreaName}. Oavsett hur många etableringsytor eller manskapsbodar ni har, erbjuder vi löpande och noggrann byggbodstädning för en ren arbetsmiljö.`,
    stadfirma: `Letar du efter en trygg och pålitlig städfirma ${prep} ${displayAreaName}? Vi städar redan hos många nöjda kunder i närområdet varje vecka. Oavsett om du behöver veckostädning, en rejäl storstädning eller hjälp inför flytten så finns vårt team redo att leverera ett skinande rent resultat.`
  };
  const introText = serviceIntroTexts[baseService.toLowerCase()] || serviceIntroTexts.hemstadning;

  const areaSlug = displayAreaName.toLowerCase().replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/\s+/g, '-');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: activeFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Stodona',
    description: `${displayBaseService} ${prep} ${displayAreaName}. Professionell städning med RUT-avdrag.`,
    url: `https://stodona.se/${baseService.toLowerCase()}-${areaSlug}`,
    areaServed: { '@type': 'Place', name: displayAreaName },
    priceRange: '$$',
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{displayBaseService} {prep} {displayAreaName} | Stodona – Boka med RUT-avdrag</title>
        <meta name="description" content={`${displayBaseService} ${prep} ${displayAreaName}. ${introText.substring(0, 150)}... Boka enkelt online – Stodona.`} />
        <link rel="canonical" href={`https://stodona.se/${baseService.toLowerCase()}-${areaSlug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src={heroImage}
            alt={`${displayBaseService} ${prep} ${displayAreaName}`}
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
            
            {/* Hyperlocal Trust Badge */}
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20 text-white font-medium shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0" />
                <span className="text-sm md:text-base tracking-wide">Vi städar redan {prep} {displayAreaName} varje vecka. Lediga tider finns!</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6 drop-shadow-lg">
              {displayBaseService} {prep} <span className="text-white italic font-normal">{displayAreaName}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/90 leading-relaxed mb-8 drop-shadow-md">
              {description}
            </p>
            <a href="https://boka.stodona.se" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Boka {displayBaseService.toLowerCase()} {prep} {displayAreaName}
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
                Vad ingår i vår {displayBaseService.toLowerCase()} {prep} {displayAreaName}?
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                {introText}
              </p>

              {activeChecklists.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-2xl font-bold mt-12 mb-4">{section.title}</h3>
                  <ul className="space-y-3 mb-8">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-text-primary shrink-0 mt-0.5" />{" "}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Vill du ha ett skinande rent hem {prep} {displayAreaName}?
                </h3>
                <p className="mb-6 text-text-secondary">
                  Vi har lediga tider i ditt område. Boka nu och få
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
              Vanliga frågor om {displayBaseService.toLowerCase()} {prep} {displayAreaName}
            </h2>
            <p className="text-text-secondary text-lg">
              Här har vi samlat de vanligaste frågorna vi får om vår
              {displayBaseService.toLowerCase()}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {activeFaqs.map((faq, i) => (
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
                Vi täcker även <span className="text-cta-hover">underområden</span> {prep} {displayAreaName}
              </h2>
              <p className="text-text-secondary text-lg">
                Vårt team är redo att hjälpa dig oavsett var {prep} {displayAreaName} du bor.
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
            Få ett rent hem {prep} {displayAreaName} idag!
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
