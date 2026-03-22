import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, Search } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    title: 'Om RUT-avdraget',
    icon: '💰',
    items: [
      {
        q: 'Vad är RUT-avdrag?',
        a: 'RUT-avdrag är en skattereduktion som innebär att du bara betalar 50% av arbetskostnaden för hushållsnära tjänster som hemstädning, fönsterputsning och flyttstädning. Det maximala avdraget är 75 000 kr per person och år. Läs mer på <a href="https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete/rutarbete.4.2ef18e6a125bbb56b74000007782.html" target="_blank" rel="noopener noreferrer">Skatteverkets sida om RUT-avdrag</a>.',
      },
      {
        q: 'Hur fungerar RUT-avdraget hos Stodona?',
        a: 'Vi sköter all administration åt dig. Du betalar bara 50% av arbetskostnaden direkt på fakturan – resten ansöker vi om från Skatteverket. Du behöver inte göra något själv.',
      },
      {
        q: 'Vilka tjänster berättigar till RUT-avdrag?',
        a: 'Alla våra städtjänster för privatpersoner berättigar till RUT-avdrag: <a href="/hemstadning">hemstädning</a>, <a href="/fonsterputsning">fönsterputsning</a>, <a href="/flyttstadning">flyttstädning</a>, <a href="/storstadning">storstädning</a>, <a href="/trappstadning">trappstädning</a> och <a href="/byggstadning">byggstädning</a>. Företagsstädning ingår inte i RUT. Se <a href="https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete/rutarbete/vadgerratttillrutavdrag.4.5c281c7015abecc2e202ce4.html" target="_blank" rel="noopener noreferrer">Skatteverkets lista</a> för detaljer.',
      },
      {
        q: 'Hur mycket kan jag spara med RUT-avdrag?',
        a: 'Du sparar 50% av arbetskostnaden, upp till 75 000 kr per person och år. Det inkluderar alla typer av RUT-berättigade tjänster. Materialkostnader ingår inte i avdraget. Källa: <a href="https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete.4.2ef18e6a125bbb56b74000005937.html" target="_blank" rel="noopener noreferrer">Skatteverket – ROT och RUT</a>.',
      },
      {
        q: 'Kan jag använda RUT-avdrag om jag bor i bostadsrätt?',
        a: 'Ja, absolut! RUT-avdrag gäller oavsett om du bor i villa, bostadsrätt eller hyresrätt. Det enda kravet är att du har tillräckligt med skatt att dra av mot. Läs mer hos <a href="https://www.konsumentverket.se/for-foretag/marknadsforing/rutavdrag/" target="_blank" rel="noopener noreferrer">Konsumentverket</a>.',
      },
    ],
  },
  {
    title: 'Hemstädning',
    icon: '🏠',
    items: [
      {
        q: 'Vad ingår i hemstädningen?',
        a: 'I vår hemstädning ingår: dammsugning och moppning av golv, avtorkning av fria ytor, rengöring av kök (diskbänk, spis, vitvaror utvändigt), badrumsstädning (toalett, handfat, dusch/badkar), putsning av speglar och tömning av papperskorgar. Se hela listan på vår <a href="/hemstadning">hemstädningssida</a>.',
      },
      {
        q: 'Hur ofta bör man ha hemstädning?',
        a: 'Det beror på hushållets storlek och behov. De vanligaste alternativen är varje vecka, varannan vecka eller en gång i månaden. Enligt <a href="https://www.folkhalsomyndigheten.se/" target="_blank" rel="noopener noreferrer">Folkhälsomyndigheten</a> bidrar en ren inomhusmiljö till bättre hälsa, särskilt för allergiker.',
      },
      {
        q: 'Kommer det samma städare varje gång?',
        a: 'Ja! Hos Stodona skickar vi alltid samma team till dig. De lär känna ditt hem, dina preferenser och vet exakt vad som behöver göras. Om din ordinarie städare är sjuk meddelar vi dig i förväg.',
      },
      {
        q: 'Behöver jag vara hemma under städningen?',
        a: 'Nej, du behöver inte vara hemma. De flesta av våra kunder lämnar en nyckel som vi förvarar säkert. Du kan också lämna en portkod eller sätter in en kodlåsenhet. Vi är fullt ansvarsförsäkrade.',
      },
      {
        q: 'Har ni med eget städmaterial?',
        a: 'Ja, vi tar med alla rengöringsprodukter och all utrustning. Det enda du behöver ha hemma är en fungerande dammsugare. Vi använder miljövänliga och professionella produkter.',
      },
      {
        q: 'Har ni bindningstid?',
        a: 'Nej, vi har ingen bindningstid. Du kan pausa eller avsluta ditt abonnemang när som helst. Vi tror på att behålla kunder genom kvalitet, inte kontrakt.',
      },
    ],
  },
  {
    title: 'Fönsterputsning',
    icon: '🪟',
    items: [
      {
        q: 'Vad ingår i fönsterputsning?',
        a: 'Vi putsar fönsterglas insida och utsida, fönsterkarmar, fönsterbänkar och putsning mellan glasen (om fönstren är delbara). Läs mer på vår <a href="/fonsterputsning">fönsterputsningssida</a>.',
      },
      {
        q: 'Hur ofta bör man putsa fönster?',
        a: 'Vi rekommenderar 2–4 gånger per år. Vår och höst är mest populärt. Bor du nära vatten, skog eller trafikerad väg kan det vara bra att putsa oftare. Läs vår <a href="/blogg/hur-ofta-bor-man-putsa-fonster">guide om fönsterputsning</a>.',
      },
      {
        q: 'Putsar ni fönster utsida på höga våningar?',
        a: 'Ja, vi putsar fönster utsida oavsett våning. Vi har professionell utrustning för att nå högt belägna fönster. Kontakta oss via <a href="/kontakt">kontaktsidan</a> för att diskutera dina specifika behov.',
      },
      {
        q: 'Ingår fönsterputsning i hemstädningen?',
        a: 'Nej, fönsterputsning bokas som en separat tjänst. Du kan dock kombinera hemstädning med fönsterputsning vid samma tillfälle för att spara tid.',
      },
    ],
  },
  {
    title: 'Flyttstädning',
    icon: '📦',
    items: [
      {
        q: 'Vad ingår i flyttstädning?',
        a: 'Flyttstädning är en grundlig rengöring av hela bostaden: ugn, kylskåp, frys, alla skåp och lådor, fönster invändigt, badrummet i detalj och alla golv. Se vår <a href="/flyttstadning">flyttstädningssida</a> eller läs vår <a href="/blogg/checklista-infor-flyttstadning">checklista inför flyttstädning</a>.',
      },
      {
        q: 'Har ni flyttstädningsgaranti?',
        a: 'Ja! Om din hyresvärd, mäklare eller köpare inte godkänner städningen så kommer vi tillbaka och åtgärdar utan extra kostnad. Garantin gäller om du kontaktar oss inom 48 timmar efter städningen.',
      },
      {
        q: 'Hur långt i förväg ska jag boka?',
        a: 'Vi rekommenderar att boka minst 1 vecka i förväg, gärna 2 veckor om du flyttar under högsäsong (juni–augusti, december). Kontakta oss på <a href="tel:0101780150">010-178 01 50</a> för snabb bokning.',
      },
      {
        q: 'Måste lägenheten vara tom innan ni kommer?',
        a: 'Ja, bostaden bör vara helt tom för att vi ska kunna komma åt alla ytor ordentligt. Tänk på att tömma alla garderober, skåp och lådor samt ta bort gardinstänger och krokar.',
      },
    ],
  },
  {
    title: 'Storstädning & byggstädning',
    icon: '✨',
    items: [
      {
        q: 'Vad är skillnaden mellan hemstädning och storstädning?',
        a: 'Hemstädning är regelbundet underhåll, medan storstädning är en djupgående engångsrengöring som inkluderar ugn, kylskåp, skåp invändigt och andra ytor du normalt inte når. Läs mer i vår <a href="/blogg/hemstadning-vs-storstadning-skillnad">artikel om skillnaderna</a>.',
      },
      {
        q: 'Hur ofta bör man storstäda?',
        a: 'Vi rekommenderar 1–2 gånger per år, vanligtvis vår och/eller höst. Många kunder kombinerar storstädning med regelbunden hemstädning. Se vår <a href="/storstadning">storstädningssida</a>.',
      },
      {
        q: 'Erbjuder ni byggstädning efter renovering?',
        a: 'Ja! Vi erbjuder professionell <a href="/byggstadning">byggstädning</a> efter renoveringar och nybyggen. Från grovstädning till finstädning – vi lämnar lokalen inflyttningsklar.',
      },
    ],
  },
  {
    title: 'Bokning & betalning',
    icon: '📋',
    items: [
      {
        q: 'Hur bokar jag städning?',
        a: 'Du kan boka direkt via vår <a href="https://boka.stodona.se" target="_blank" rel="noopener noreferrer">onlinebokning</a>, ringa oss på <a href="tel:0101780150">010-178 01 50</a> eller mejla <a href="mailto:info@stodona.se">info@stodona.se</a>.',
      },
      {
        q: 'Hur betalar jag?',
        a: 'Vi skickar faktura efter utförd tjänst. Du betalar hälften av arbetskostnaden tack vare RUT-avdraget – vi hanterar resten med Skatteverket.',
      },
      {
        q: 'Kan jag avboka eller ändra en bokad tid?',
        a: 'Ja, vi ber dig meddela oss minst 48 timmar innan planerad tid om du behöver ändra eller avboka. Kontakta oss via telefon eller e-post.',
      },
      {
        q: 'Hur snabbt kan ni komma?',
        a: 'Vi har ofta lediga tider redan samma vecka. Vid akuta behov kan vi ibland komma redan nästa dag. <a href="https://boka.stodona.se" target="_blank" rel="noopener noreferrer">Kolla tillgängliga tider</a>.',
      },
    ],
  },
  {
    title: 'Trygghet & kvalitet',
    icon: '🛡️',
    items: [
      {
        q: 'Är ni försäkrade?',
        a: 'Ja, Stodona är fullt ansvarsförsäkrade. Om en olycka skulle inträffa under städningen täcker vår försäkring eventuella skador. Du kan känna dig helt trygg.',
      },
      {
        q: 'Vad händer om jag inte är nöjd med städningen?',
        a: 'Vi erbjuder nöjdhetsgaranti. Om du inte är nöjd med resultatet, kontakta oss inom 24 timmar så kommer vi tillbaka och åtgärdar utan extra kostnad.',
      },
      {
        q: 'Har era anställda F-skattsedel?',
        a: 'Alla våra städare är anställda direkt hos Stodona med kollektivavtalsenliga villkor. Vi har F-skattsedel och följer alla krav enligt <a href="https://www.skatteverket.se/foretag/skatterochavdrag/rotrutarbete/telefonfskattochartikelhantering/telefonfskattochartikelhantering.4.71004e4c133e23bf6db800019377.html" target="_blank" rel="noopener noreferrer">Skatteverkets regler</a>.',
      },
      {
        q: 'Vilka produkter använder ni?',
        a: 'Vi använder miljövänliga och professionella rengöringsprodukter som är skonsamma mot både din hälsa och miljön. Alla produkter är godkända enligt gällande regelverk.',
      },
    ],
  },
  {
    title: 'Företagsstädning',
    icon: '🏢',
    items: [
      {
        q: 'Erbjuder ni kontorsstädning?',
        a: 'Ja! Vi erbjuder professionell <a href="/foretagsstadning">företagsstädning</a> anpassad efter era behov och schema. Kontakta oss för en skräddarsydd offert.',
      },
      {
        q: 'Kan städning erbjudas som personalförmån?',
        a: 'Ja, hemstädning kan erbjudas som en avdragsgill personalförmån. Kontakta oss så berättar vi mer om hur det fungerar. Läs mer om förmånsbeskattning hos <a href="https://www.skatteverket.se/privat/skatter/arbeteochinkomst/formaner.4.4a4d586616058d860bc4b12.html" target="_blank" rel="noopener noreferrer">Skatteverket</a>.',
      },
      {
        q: 'Ingår RUT-avdrag för företag?',
        a: 'Nej, RUT-avdrag gäller bara privatpersoner. Företag drar av städkostnaden som en vanlig driftkostnad. Se <a href="https://www.skatteverket.se/foretag" target="_blank" rel="noopener noreferrer">Skatteverkets företagssida</a> för mer information.',
      },
    ],
  },
  {
    title: 'Våra tjänsteområden',
    icon: '📍',
    items: [
      {
        q: 'Var finns ni?',
        a: 'Vi erbjuder tjänster i hela Stockholmsområdet, inklusive Ekerö, Lidingö, Bromma, Solna, Sundbyberg, Nacka, Danderyd, Täby, Södermalm, Östermalm, Vasastan och fler. Se alla våra <a href="/sidkarta">tjänsteområden</a>.',
      },
      {
        q: 'Kan jag boka städning om jag bor utanför ert område?',
        a: 'Vi utökar ständigt vårt tjänsteområde. Kontakta oss på <a href="mailto:info@stodona.se">info@stodona.se</a> eller <a href="tel:0101780150">010-178 01 50</a> så berättar vi om vi kan komma till dig.',
      },
    ],
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-text-primary/10 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-primary/50 transition-colors group"
      >
        <span className="text-base font-bold pr-4 group-hover:text-cta-hover transition-colors">{item.q}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-cta-hover shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="px-5 pb-5"
        >
          <p
            className="text-text-secondary leading-relaxed [&_a]:text-cta-hover [&_a]:underline [&_a]:font-medium hover:[&_a]:opacity-80"
            dangerouslySetInnerHTML={{ __html: item.a }}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allFaqs = faqCategories.flatMap(cat => cat.items);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a.replace(/<[^>]*>/g, ''),
      },
    })),
  };

  const displayCategories = activeCategory
    ? faqCategories.filter(c => c.title === activeCategory)
    : faqCategories;

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Vanliga frågor (FAQ) | Stodona – Hemstädning, RUT-avdrag & Mer</title>
        <meta name="description" content="Svar på vanliga frågor om hemstädning, RUT-avdrag, fönsterputsning, flyttstädning och mer. Allt du behöver veta om Stodonas tjänster." />
        <link rel="canonical" href="https://stodona.se/faq" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 bg-bg-primary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-cta-hover rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Vanliga <span className="italic font-normal text-cta-hover">frågor</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Här har vi samlat svar på de vanligaste frågorna om våra städtjänster, RUT-avdrag och hur det fungerar att vara kund hos Stodona.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-8 bg-white border-b border-text-primary/10 sticky top-[72px] z-40">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === null
                  ? 'bg-cta-hover text-white'
                  : 'bg-bg-primary text-text-secondary hover:bg-cta-hover/10 hover:text-cta-hover'
              }`}
            >
              Alla frågor
            </button>
            {faqCategories.map(cat => (
              <button
                key={cat.title}
                onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.title
                    ? 'bg-cta-hover text-white'
                    : 'bg-bg-primary text-text-secondary hover:bg-cta-hover/10 hover:text-cta-hover'
                }`}
              >
                {cat.icon} {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          {displayCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: catIndex * 0.05 }}
              className="mb-12 last:mb-0"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item, i) => (
                  <FaqAccordion key={i} item={item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Helpful links */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Användbara länkar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Skatteverket – RUT-avdrag', url: 'https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete/rutarbete.4.2ef18e6a125bbb56b74000007782.html', desc: 'Allt om RUT-avdrag och vilka tjänster som berättigar.' },
              { title: 'Konsumentverket', url: 'https://www.konsumentverket.se/', desc: 'Dina rättigheter som konsument vid köp av tjänster.' },
              { title: 'Folkhälsomyndigheten – inomhusmiljö', url: 'https://www.folkhalsomyndigheten.se/livsvillkor-levnadsvanor/miljohalsa-och-halsoskydd/inomhusmiljo/', desc: 'Om vikten av en ren och hälsosam inomhusmiljö.' },
              { title: 'Stodona – Boka städning', url: 'https://boka.stodona.se', desc: 'Boka din städning snabbt och enkelt online.' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-text-primary/5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <ExternalLink className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm group-hover:text-cta-hover transition-colors">{link.title}</p>
                  <p className="text-text-secondary text-xs mt-1">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cta-hover text-white">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Hittade du inte svaret?</h2>
          <p className="text-lg mb-8 opacity-90">Kontakta oss så hjälper vi dig. Du når oss via telefon, e-post eller vårt bokningsformulär.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/kontakt" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-lg px-8 py-4">
              Kontakta oss
            </Link>
            <a href="tel:0101780150" className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Ring 010-178 01 50
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
