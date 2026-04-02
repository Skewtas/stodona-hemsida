import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, CheckCircle2, HelpCircle, Star, Sparkles } from 'lucide-react';
import WhyStodona from '../components/WhyStodona';

const services = [
  {
    title: 'Hemstädning',
    description: 'Regelbunden hemstädning med samma team varje gång. Vi följer en noggrann checklista så att ditt hem alltid är skinande rent.',
    link: '/hemstadning-ekero',
    icon: '🏠',
  },
  {
    title: 'Fönsterputsning',
    description: 'Professionell fönsterputsning utan ränder. Vi putsar in- och utsida samt mellan glasen om de är delbara.',
    link: '/fonsterputsning-ekero',
    icon: '🪟',
  },
  {
    title: 'Flyttstädning',
    description: 'Grundlig flyttstädning med garanti. Vi lämnar din bostad i toppskick inför besiktning.',
    link: '/flyttstadning-ekero',
    icon: '📦',
  },
  {
    title: 'Storstädning',
    description: 'Djupgående rengöring av hela hemmet – ugn, kylskåp, skåp och mycket mer. Perfekt 1–2 gånger per år.',
    link: '/storstadning-ekero',
    icon: '✨',
  },
  {
    title: 'Företagsstädning',
    description: 'Professionell kontors- och företagsstädning anpassad efter era behov och schema.',
    link: '/foretagsstadning-ekero',
    icon: '🏢',
  },
  {
    title: 'Byggstädning',
    description: 'Städning efter renovering eller nybygge – från grovstädning till finstädning.',
    link: '/byggstadning-ekero',
    icon: '🔨',
  },
];

const faqs = [
  {
    q: 'Vilka områden på Ekerö täcker ni?',
    a: 'Vi täcker hela Ekerö kommun – inklusive Drottningholm, Stenhamra, Sundby, Tureholm, Hilleshögby, Kungsberga, Lilla Stenby, Lurudden, Söderby, Älvnäs, Ölsta, Jungfrusund, Sånga Säby, Ekeby och Slottshagen.',
  },
  {
    q: 'Hur snabbt kan ni komma?',
    a: 'Vi har ofta lediga tider redan samma vecka. Boka via vår hemsida eller ring oss så hittar vi en tid som passar dig.',
  },
  {
    q: 'Hur fungerar RUT-avdraget?',
    a: 'Vi sköter all administration kring RUT-avdraget. Du betalar bara 50% av arbetskostnaden direkt på din faktura – resten ansöker vi om från Skatteverket.',
  },
  {
    q: 'Har ni med er eget städmaterial?',
    a: 'Ja, vi tar med oss allt material och alla rengöringsprodukter. Vi använder miljövänliga och professionella produkter. Det enda du behöver ha hemma är en fungerande dammsugare vid hemstädning.',
  },
  {
    q: 'Kan jag boka flera tjänster samtidigt?',
    a: 'Absolut! Många kunder kombinerar till exempel hemstädning med fönsterputsning. Kontakta oss så skräddarsyr vi ett paket som passar dina behov.',
  },
];

export default function StadningEkero() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Städning på Ekerö – Hemstädning, Flyttstädning & mer | Stodona</title>
        <meta name="description" content="Professionell städning på Ekerö. Hemstädning, fönsterputsning, flyttstädning, storstädning och mer med RUT-avdrag. Boka enkelt online – Stodona." />
        <meta property="og:title" content="Städning på Ekerö – Hemstädning, Flyttstädning & mer | Stodona" />
        <meta property="og:description" content="Stodona erbjuder professionell städning på Ekerö. Boka hemstädning, fönsterputsning eller flyttstädning med RUT-avdrag." />
        <link rel="canonical" href="https://stodona.se/stadning-ekero" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src="/ekerobron_ekero.png"
            alt="Städning på Ekerö – Stodona"
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
              Städning på <span className="text-white italic font-normal">Ekerö</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/90 leading-relaxed mb-4 drop-shadow-md">
              Stodona erbjuder professionell städning på Ekerö och hela Mälardalen. Hemstädning, fönsterputsning, flyttstädning, storstädning och mer – allt med RUT-avdrag.
            </p>
            <p className="text-base text-text-light/70 mb-8 drop-shadow-md">
              Vi är det lokala valet för hundratals hushåll på Ekerö. Samma team, hög kvalitet, varje gång.
            </p>
            <a href="https://boka.stodona.se" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg">
              Boka städning på Ekerö
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Våra <span className="text-cta-hover">städtjänster</span> på Ekerö
            </h2>
            <p className="text-text-secondary text-lg">
              Oavsett om du behöver regelbunden hemstädning, en grundlig storstädning eller professionell fönsterputsning – vi finns här för dig.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  to={service.link}
                  className="block h-full p-8 bg-bg-primary rounded-2xl border border-text-primary/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-cta-hover transition-colors">
                    {service.title} på Ekerö
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-cta-hover font-medium text-sm group-hover:gap-3 transition-all">
                    Läs mer <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stodona + Trust Section */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Varför välja Stodona för städning på Ekerö?
              </h2>
              <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                Stodona har blivit det självklara valet för hundratals hushåll på Ekerö och i Mälardalen. Vi kombinerar lokal närvaro med professionell städning och ett kvalitetssystem som garanterar att varje besök håller samma höga standard.
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
                    <div>
                      <p className="font-bold text-sm mb-1">{item.title}</p>
                      <p className="text-text-secondary text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold mt-12 mb-4">RUT-avdrag för alla städtjänster</h3>
              <p className="text-lg text-text-secondary mb-6">
                Alla våra städtjänster på Ekerö berättigar till RUT-avdrag, vilket innebär att du bara betalar 50% av arbetskostnaden. Vi drar av beloppet direkt på din faktura – smidigt och enkelt. Det gäller hemstädning, fönsterputsning, storstädning, flyttstädning och mer.
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
                    "Bästa städfirman vi anlitat på Ekerö. Alltid i tid, grundliga och det doftar fantastiskt när man kommer hem."
                  </p>
                  <p className="font-bold text-sm">— Sofia, Ekerö</p>
                </div>

                <WhyStodona />

                {/* CTA Card */}
                <div className="card-rounded bg-cta-hover text-white p-8 shadow-sm text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Boka städning idag</h3>
                  <p className="text-sm opacity-90 mb-6">
                    Vi har lediga tider på Ekerö. Boka snabbt och enkelt online.
                  </p>
                  <a href="https://boka.stodona.se" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-sm px-6 py-3">
                    Boka nu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-areas */}
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
              Vi täcker <span className="text-cta-hover">hela Ekerö</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Vårt team finns redo att hjälpa dig oavsett var på Ekerö du bor.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Drottningholm', link: '/hemstadning-ekero-drottningholm' },
              { name: 'Stenhamra', link: '/hemstadning-ekero-stenhamra' },
              { name: 'Sundby', link: '/hemstadning-ekero-sundby' },
              { name: 'Tureholm', link: '/hemstadning-ekero-tureholm' },
              { name: 'Hilleshögby', link: '/hemstadning-ekero-hilleshogby' },
              { name: 'Kungsberga', link: '/hemstadning-ekero-kungsberga' },
              { name: 'Lilla Stenby', link: '/hemstadning-ekero-lilla-stenby' },
              { name: 'Lurudden', link: '/hemstadning-ekero-lurudden' },
              { name: 'Söderby', link: '/hemstadning-ekero-soderby' },
              { name: 'Älvnäs', link: '/hemstadning-ekero-alvnas' },
              { name: 'Ölsta', link: '/hemstadning-ekero-olsta' },
              { name: 'Jungfrusund', link: '/hemstadning-ekero-jungfrusund' },
              { name: 'Sånga Säby', link: '/hemstadning-ekero-sanga-saby' },
              { name: 'Ekeby', link: '/hemstadning-ekero-ekeby-tomtomrade' },
              { name: 'Parksidan & Solsidan', link: '/hemstadning-ekero-parksidan-solsidan' },
              { name: 'Slottshagen', link: '/hemstadning-ekero-slottshagen' },
            ].map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Link
                  to={area.link}
                  className="flex items-center justify-center gap-2 p-3 bg-bg-primary rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <MapPin className="w-4 h-4 text-text-secondary group-hover:text-cta-hover transition-colors" />
                  <span className="text-sm font-medium text-text-primary group-hover:text-cta-hover transition-colors">
                    {area.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Vanliga frågor om städning på Ekerö
            </h2>
            <p className="text-text-secondary text-lg">
              Här har vi samlat de vanligaste frågorna om våra städtjänster på Ekerö.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
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

      {/* Bottom CTA */}
      <section className="py-20 bg-cta-hover text-white relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Redo för ett skinande rent hem på Ekerö?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Boka din städning snabbt och enkelt. Njut av mer fritid och ett resultat du älskar.
          </p>
          <a
            href="https://boka.stodona.se"
            className="btn-primary bg-white text-cta-hover hover:bg-bg-primary hover:text-white text-lg px-8 py-4"
          >
            Boka städning nu
          </a>
        </div>
      </section>
    </div>
  );
}
