import { Helmet } from "../seo";
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { User, Calendar, History, MessageSquare, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { bookingUrl } from '../utils/bookingUrl';

const PORTAL_URL = 'https://stodona.twportal.se';

/** Vad kunden faktiskt använder portalen till. */
const PORTAL_FEATURES = [
  {
    icon: Calendar,
    sv: { title: 'Se dina bokningar', text: 'Håll koll på kommande städtillfällen – vilken dag och vilken tid vi kommer.' },
    en: { title: 'See your bookings', text: 'Keep track of upcoming cleaning sessions – which day and time we are coming.' },
  },
  {
    icon: History,
    sv: { title: 'Följ din historik', text: 'Se vilka städningar som är utförda, så att du enkelt kan stämma av mot fakturan.' },
    en: { title: 'Follow your history', text: 'See which cleanings have been carried out so you can easily reconcile with the invoice.' },
  },
  {
    icon: MessageSquare,
    sv: { title: 'Kommunicera med oss', text: 'Skicka meddelanden om ditt uppdrag – önskemål, portkoder eller praktiska detaljer.' },
    en: { title: 'Communicate with us', text: 'Send messages about your assignment – preferences, door codes or practical details.' },
  },
  {
    icon: ShieldCheck,
    sv: { title: 'Tryggt och personligt', text: 'Portalen är kopplad till din e-postadress hos oss. Dina uppgifter hanteras enligt vår integritetspolicy.' },
    en: { title: 'Secure and personal', text: 'The portal is linked to your email address with us. Your data is handled per our privacy policy.' },
  },
];

const PORTAL_FAQS = [
  {
    sv: { q: 'Vilken e-postadress ska jag registrera mig med?', a: 'Använd samma e-postadress som är registrerad hos oss – den du får dina fakturor till. Är du osäker, hör av dig så kontrollerar vi vilken adress vi har.' },
    en: { q: 'Which email address should I register with?', a: 'Use the same email address that is registered with us – the one you receive your invoices to. If you are unsure, contact us and we will check which address we have.' },
  },
  {
    sv: { q: 'Jag har inte fått något aktiveringsmail', a: 'Aktiveringsmailet kan dröja ett par minuter. Kontrollera skräpposten och att adressen är den vi har registrerad. Har det ändå inte kommit fram – ring 010-178 01 50 eller mejla info@stodona.se så hjälper vi dig.' },
    en: { q: 'I have not received an activation email', a: 'The activation email can take a couple of minutes. Check your spam folder and that the address is the one we have registered. If it still has not arrived, call +46 10 178 01 50 or email info@stodona.se and we will help you.' },
  },
  {
    sv: { q: 'Jag har glömt mitt lösenord', a: 'Följ instruktionerna för glömt lösenord i portalen. Får du ändå inte tillbaka åtkomsten hjälper vi dig – kontakta oss så löser vi det.' },
    en: { q: 'I have forgotten my password', a: 'Follow the forgotten password instructions in the portal. If you still cannot regain access, contact us and we will sort it out.' },
  },
  {
    sv: { q: 'Kan jag boka om eller avboka en städning i portalen?', a: 'Ändringar av inbokade tider gör du enklast direkt med oss via telefon eller mejl, så bekräftar vi den nya tiden. Alla villkor finns på vår sida om avbokning.' },
    en: { q: 'Can I reschedule or cancel a cleaning in the portal?', a: 'Changes to booked times are easiest to make directly with us by phone or email, and we confirm the new time. All terms are on our cancellation page.' },
  },
  {
    sv: { q: 'Måste jag använda kundportalen?', a: 'Nej, portalen är ett komplement. Du kan alltid nå oss på telefon och mejl precis som vanligt.' },
    en: { q: 'Do I have to use the customer portal?', a: 'No, the portal is a complement. You can always reach us by phone and email as usual.' },
  },
  {
    sv: { q: 'Hur hanteras mina personuppgifter?', a: 'Vi behandlar dina uppgifter enligt GDPR och vår integritetspolicy. Uppgifterna används för att utföra och administrera dina städtjänster – inget annat.' },
    en: { q: 'How is my personal data handled?', a: 'We process your data in accordance with GDPR and our privacy policy. The data is used to carry out and administer your cleaning services – nothing else.' },
  },
];

export default function Kundportal() {
  const { lang } = useLanguage();
  const sv = lang === 'SV';
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PORTAL_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.sv.q,
      acceptedAnswer: { '@type': 'Answer', text: f.sv.a },
    })),
  };
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Kundportal – Hantera dina bokningar | Stodona</title>
        <meta name="description" content="Logga in på Stodonas kundportal för att hantera dina städbokningar, se historik och kommunicera med oss. Enkel och snabb åtkomst." />
        <meta property="og:title" content="Kundportal – Hantera dina bokningar | Stodona" />
        <meta property="og:description" content="Logga in och hantera dina bokningar, se historik och kontakta oss direkt." />
        <link rel="canonical" href="https://stodona.se/kundportalen" />
        <meta property="og:url" content="https://stodona.se/kundportalen" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/stodona_left_image.jpg" 
            alt="Kundportal Stodona" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <User className="w-8 h-8 text-bg-dark" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {lang === 'SV' ? 'Stodonas' : "Stodona's"} <span className="italic font-normal text-cta-hover">{lang === 'SV' ? 'Kundportal' : 'Customer Portal'}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/80 leading-relaxed mb-8">
              {lang === 'SV' ? 'Logga in för att enkelt hantera dina bokningar, se historik och kommunicera med oss.' : 'Log in to easily manage your bookings, view history and communicate with us.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login Steps */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto card-rounded bg-bg-primary p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">{lang === 'SV' ? 'Så här loggar du in' : 'How to log in'}</h2>
            <ol className="space-y-6 text-center">
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-xl font-bold text-cta-hover">
                  1
                </div>
                <p className="font-bold text-lg mb-2">{lang === 'SV' ? 'Öppna portalen' : 'Open the portal'}</p>
                <p className="text-text-secondary max-w-md">{lang === 'SV' ? <>Gå till <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="text-cta-hover hover:underline">stodona.twportal.se</a>, scrolla ner och tryck på "Registrera dig".</> : <>Go to <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="text-cta-hover hover:underline">stodona.twportal.se</a>, scroll down and click "Register".</>}</p>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-xl font-bold text-cta-hover">
                  2
                </div>
                <p className="font-bold text-lg mb-2">{lang === 'SV' ? 'Ange din e-postadress' : 'Enter your email address'}</p>
                <p className="text-text-secondary max-w-md">{lang === 'SV' ? 'Använd samma e-postadress som är registrerad hos oss (den du får fakturor till).' : 'Use the same email address that is registered with us (the one you receive invoices to).'}</p>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-xl font-bold text-cta-hover">
                  3
                </div>
                <p className="font-bold text-lg mb-2">{lang === 'SV' ? 'Aktivera ditt konto' : 'Activate your account'}</p>
                <p className="text-text-secondary max-w-md">{lang === 'SV' ? 'Avvakta ett par minuter så får du ett aktiveringsmail. Följ instruktionerna i mailet.' : 'Wait a few minutes and you will receive an activation email. Follow the instructions in the email.'}</p>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-xl font-bold text-cta-hover">
                  4
                </div>
                <p className="font-bold text-lg mb-2">{lang === 'SV' ? 'Logga in' : 'Log in'}</p>
                <p className="text-text-secondary max-w-md">{lang === 'SV' ? 'Nu kan du logga in och se all information i kundportalen.' : 'Now you can log in and see all information in the customer portal.'}</p>
              </motion.li>
            </ol>
            <div className="text-center mt-12">
              <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                {lang === 'SV' ? 'Gå till Kundportalen' : 'Go to Customer Portal'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Det här kan du göra i portalen */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {sv ? 'Det här kan du göra i portalen' : 'What you can do in the portal'}
          </h2>
          <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
            {sv
              ? 'Kundportalen är din översikt över städningen hos Stodona – öppen dygnet runt, oavsett var du är.'
              : 'The customer portal is your overview of your cleaning with Stodona – open around the clock, wherever you are.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {PORTAL_FEATURES.map((f, i) => (
              <motion.div
                key={f.sv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-3xl p-7 border border-text-primary/5 shadow-sm flex gap-4"
              >
                <div className="w-12 h-12 bg-bg-primary rounded-2xl flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-cta-hover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{sv ? f.sv.title : f.en.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{sv ? f.sv.text : f.en.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Behöver du ändra en tid? */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-4xl">
          <div className="card-rounded bg-bg-primary p-8 md:p-12 border border-text-primary/10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {sv ? 'Behöver du ändra, pausa eller avboka?' : 'Need to change, pause or cancel?'}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              {sv
                ? 'Hör av dig direkt till oss så bokar vi om din tid och bekräftar den nya. Vi har ingen bindningstid – du kan pausa din städning, till exempel under semestern, och abonnemang sägs upp med en kalendermånads varsel.'
                : 'Contact us directly and we will rebook your time and confirm the new one. There is no lock-in – you can pause your cleaning, for example during holidays, and subscriptions are cancelled with one calendar month\u2019s notice.'}
            </p>
            <p className="text-text-secondary leading-relaxed mb-8">
              {sv ? (
                <>
                  Ring <a href="tel:0101780150" className="text-cta-hover font-medium hover:underline">010-178 01 50</a> eller mejla{' '}
                  <a href="mailto:info@stodona.se" className="text-cta-hover font-medium hover:underline">info@stodona.se</a>. Alla villkor hittar du på{' '}
                  <Link to="/avbokning" className="text-cta-hover font-medium hover:underline">sidan om avbokning</Link>.
                </>
              ) : (
                <>
                  Call <a href="tel:0101780150" className="text-cta-hover font-medium hover:underline">+46 10 178 01 50</a> or email{' '}
                  <a href="mailto:info@stodona.se" className="text-cta-hover font-medium hover:underline">info@stodona.se</a>. All terms are on our{' '}
                  <Link to="/avbokning" className="text-cta-hover font-medium hover:underline">cancellation page</Link>.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/kontakt" className="btn-primary inline-flex items-center gap-2">
                {sv ? 'Kontakta oss' : 'Contact us'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/avbokning" className="btn-secondary">
                {sv ? 'Villkor för avbokning' : 'Cancellation terms'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            {sv ? 'Vanliga frågor om kundportalen' : 'Common questions about the portal'}
          </h2>
          <div className="space-y-4">
            {PORTAL_FAQS.map((f) => (
              <div key={f.sv.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {sv ? f.sv.q : f.en.q}
                </h3>
                <p className="text-text-secondary leading-relaxed pl-9">{sv ? f.sv.a : f.en.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-text-secondary mt-8">
            {sv ? (
              <>
                Läs mer om hur vi hanterar dina uppgifter i vår{' '}
                <Link to="/integritetspolicy" className="text-cta-hover font-medium hover:underline">integritetspolicy</Link>.
              </>
            ) : (
              <>
                Read more about how we handle your data in our{' '}
                <Link to="/integritetspolicy" className="text-cta-hover font-medium hover:underline">privacy policy</Link>.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Inte kund än */}
      <section className="py-16 bg-bg-dark text-text-light">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {sv ? 'Inte kund hos oss än?' : 'Not a customer yet?'}
          </h2>
          <p className="text-text-light/80 mb-8">
            {sv
              ? 'Kundportalen är för dig som redan har städning hos Stodona. Boka din första städning så skickar vi allt du behöver för att komma igång.'
              : 'The customer portal is for those who already have cleaning with Stodona. Book your first cleaning and we will send everything you need to get started.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={bookingUrl()} className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 inline-flex items-center gap-2">
              {sv ? 'Boka städning' : 'Book cleaning'} <ArrowRight className="w-5 h-5" />
            </a>
            <Link to="/priser" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark px-8 py-4">
              {sv ? 'Se priser' : 'See prices'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
