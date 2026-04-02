import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, CheckCircle2, HelpCircle, Star, Sparkles } from 'lucide-react';
import WhyStodona from '../components/WhyStodona';

interface SubAreaLink {
  name: string;
  link: string;
}

interface StadningAreaProps {
  areaName: string;
  heroImage: string;
  subAreas?: SubAreaLink[];
}

function getPrep(area: string): string {
  const paAreas = ['Lidingö', 'Ekerö', 'Vaxholm', 'Östermalm', 'Södermalm'];
  return paAreas.some(a => area.toLowerCase().includes(a.toLowerCase())) ? 'på' : 'i';
}

const serviceList = [
  { key: 'hemstadning', title: 'Hemstädning', desc: 'Regelbunden hemstädning med samma team varje gång. Noggrann checklista så ditt hem alltid är skinande rent.', icon: '🏠' },
  { key: 'fonsterputsning', title: 'Fönsterputsning', desc: 'Professionell fönsterputsning utan ränder. Vi putsar in- och utsida samt mellan glasen.', icon: '🪟' },
  { key: 'flyttstadning', title: 'Flyttstädning', desc: 'Grundlig flyttstädning med garanti. Vi lämnar din bostad i toppskick inför besiktning.', icon: '📦' },
  { key: 'storstadning', title: 'Storstädning', desc: 'Djupgående rengöring – ugn, kylskåp, skåp och mer. Perfekt 1–2 gånger per år.', icon: '✨' },
  { key: 'foretagsstadning', title: 'Företagsstädning', desc: 'Professionell kontors- och företagsstädning anpassad efter era behov och schema.', icon: '🏢' },
  { key: 'byggstadning', title: 'Byggstädning', desc: 'Städning efter renovering eller nybygge – från grovstädning till finstädning.', icon: '🔨' },
];

export default function StadningArea({ areaName, heroImage, subAreas }: StadningAreaProps) {
  const prep = getPrep(areaName);
  const slug = areaName.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/\s+/g, '-');

  const faqs = [
    { q: `Vilka tjänster erbjuder ni ${prep} ${areaName}?`, a: `Vi erbjuder hemstädning, fönsterputsning, flyttstädning, storstädning, företagsstädning och byggstädning ${prep} ${areaName}. Alla tjänster berättigar till RUT-avdrag.` },
    { q: 'Hur snabbt kan ni komma?', a: 'Vi har ofta lediga tider redan samma vecka. Boka via vår hemsida eller ring oss så hittar vi en tid som passar dig.' },
    { q: 'Hur fungerar RUT-avdraget?', a: 'Vi sköter all administration kring RUT-avdraget. Du betalar bara 50% av arbetskostnaden direkt på din faktura – resten ansöker vi om från Skatteverket.' },
    { q: 'Har ni med er eget städmaterial?', a: 'Ja, vi tar med allt material och alla rengöringsprodukter. Vi använder miljövänliga och professionella produkter. Det enda du behöver ha hemma är en fungerande dammsugare vid hemstädning.' },
    { q: 'Kan jag boka flera tjänster samtidigt?', a: `Absolut! Många kunder ${prep} ${areaName} kombinerar till exempel hemstädning med fönsterputsning. Kontakta oss så skräddarsyr vi ett paket.` },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Stodona',
    description: `Professionell städning ${prep} ${areaName}. Hemstädning, fönsterputsning, flyttstädning och mer med RUT-avdrag.`,
    url: `https://stodona.se/stadning-${slug}`,
    areaServed: { '@type': 'Place', name: areaName },
    priceRange: '$$',
    image: 'https://stodona.se/stodona-logo.png',
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Städning {prep} {areaName} | Stodona – Hemstädning, Fönsterputsning & Mer</title>
        <meta name="description" content={`Professionell städning ${prep} ${areaName}. Hemstädning, fönsterputsning, flyttstädning, storstädning med RUT-avdrag. Boka enkelt online – Stodona.`} />
        <link rel="canonical" href={`https://stodona.se/stadning-${slug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={heroImage} alt={`Städning ${prep} ${areaName}`} className="w-full h-full object-cover object-center opacity-70" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container-custom relative z-10 text-text-light">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-cta-hover rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6 drop-shadow-lg">
              Städning {prep} <span className="text-white italic font-normal">{areaName}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/90 leading-relaxed mb-4 drop-shadow-md">
              Stodona erbjuder professionell städning {prep} {areaName}. Hemstädning, fönsterputsning, flyttstädning, storstädning och mer – allt med RUT-avdrag.
            </p>
            <p className="text-base text-text-light/70 mb-8 drop-shadow-md">
              Vi är det lokala valet för hundratals hushåll {prep} {areaName}. Samma team, hög kvalitet, varje gång.
            </p>
            <a href="https://boka.stodona.se" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Boka städning {prep} {areaName}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Våra <span className="text-cta-hover">städtjänster</span> {prep} {areaName}</h2>
            <p className="text-text-secondary text-lg">Oavsett om du behöver regelbunden hemstädning, en grundlig storstädning eller professionell fönsterputsning – vi finns här för dig.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {serviceList.map((service, index) => (
              <motion.div key={service.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: index * 0.08 }}>
                <Link to={`/${service.key}-${slug}`} className="block h-full p-8 bg-bg-primary rounded-2xl border border-text-primary/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-cta-hover transition-colors">{service.title} {prep} {areaName}</h3>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">{service.desc}</p>
                  <span className="inline-flex items-center gap-2 text-cta-hover font-medium text-sm group-hover:gap-3 transition-all">Läs mer <ArrowRight className="w-4 h-4" /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stodona */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Varför välja Stodona {prep} {areaName}?</h2>
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                Stodona har blivit det självklara valet för hundratals hushåll {prep} {areaName}. Vi kombinerar lokal närvaro med professionell städning och ett kvalitetssystem som garanterar att varje besök håller samma höga standard.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 not-prose">
                {[
                  { title: 'Samma team varje gång', desc: 'Vi skickar alltid samma städare till dig så att de lär känna ditt hem.' },
                  { title: 'RUT-avdrag ingår', desc: 'Du betalar bara 50% – vi sköter all administration mot Skatteverket.' },
                  { title: 'Miljövänliga produkter', desc: 'Vi använder enbart skonsamma och effektiva rengöringsprodukter.' },
                  { title: 'Nöjdhetsgaranti', desc: 'Inte nöjd? Vi kommer tillbaka och åtgärdar utan extra kostnad.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-text-primary/5">
                    <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" />
                    <div><p className="font-bold text-sm mb-1">{item.title}</p><p className="text-text-secondary text-sm">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <h3 className="text-2xl font-bold mt-12 mb-4">RUT-avdrag för alla städtjänster</h3>
              <p className="text-lg text-text-secondary mb-6">
                Alla våra städtjänster {prep} {areaName} berättigar till RUT-avdrag, vilket innebär att du bara betalar 50% av arbetskostnaden. Vi drar av beloppet direkt på din faktura – smidigt och enkelt.
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="card-rounded bg-bg-dark text-text-light p-8 shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="italic text-sm mb-4">"Bästa städfirman vi anlitat {prep} {areaName}. Alltid i tid, grundliga och det doftar fantastiskt hemma."</p>
                  <p className="font-bold text-sm">— Nöjd kund, {areaName}</p>
                </div>
                <WhyStodona />
                <div className="card-rounded bg-cta-hover text-white p-8 shadow-sm text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Boka städning idag</h3>
                  <p className="text-sm opacity-90 mb-6">Vi har lediga tider {prep} {areaName}. Boka snabbt och enkelt online.</p>
                  <a href="https://boka.stodona.se" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-sm px-6 py-3">Boka nu</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-areas */}
      {subAreas && subAreas.length > 0 && (
        <section className="section-spacing bg-white">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Vi täcker <span className="text-cta-hover">hela {areaName}</span></h2>
              <p className="text-text-secondary text-lg">Vårt team finns redo att hjälpa dig oavsett var {prep} {areaName} du bor.</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {subAreas.map((area, index) => (
                <motion.div key={area.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.3, delay: index * 0.03 }}>
                  <Link to={area.link} className="flex items-center justify-center gap-2 p-3 bg-bg-primary rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <MapPin className="w-4 h-4 text-text-secondary group-hover:text-cta-hover transition-colors" />
                    <span className="text-sm font-medium text-text-primary group-hover:text-cta-hover transition-colors">{area.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Vanliga frågor om städning {prep} {areaName}</h2>
            <p className="text-text-secondary text-lg">Här har vi samlat de vanligaste frågorna om våra städtjänster {prep} {areaName}.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="card-rounded bg-white p-6 border border-text-primary/10">
                <h3 className="text-lg font-bold mb-3 flex items-start gap-3"><HelpCircle className="w-6 h-6 text-cta-hover shrink-0" />{faq.q}</h3>
                <p className="text-text-secondary pl-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-cta-hover text-white relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Redo för ett skinande rent hem {prep} {areaName}?</h2>
          <p className="text-xl mb-10 opacity-90">Boka din städning snabbt och enkelt. Njut av mer fritid och ett resultat du älskar.</p>
          <a href="https://boka.stodona.se" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary hover:text-white text-lg px-8 py-4">Boka städning nu</a>
        </div>
      </section>
    </div>
  );
}
