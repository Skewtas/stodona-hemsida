import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, Star, Sparkles, Heart } from "lucide-react";
import WhyStodona from "../components/WhyStodona";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";

export default function OmOss() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Om Stodona – Professionell städning i Stockholm sedan 2019</title>
        <meta name="description" content="Lär känna Stodona – ett av Sveriges snabbast växande städbolag med ca 50 anställda. Vi levererar kvalitet, personlig service och det lilla extra." />
        <meta property="og:title" content="Om Stodona – Professionell städning i Stockholm sedan 2019" />
        <meta property="og:description" content="Stodona grundades 2019 med visionen att leverera wow-upplevelser inom städning. Lär känna oss!" />
        <link rel="canonical" href="https://stodona.se/om-oss" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/familj-stodona.jpg" 
            alt="Om Stodona Stockholm" 
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
              {lang === 'SV' ? 'Om Stodona.' : 'About Stodona.'}
              <br />
              <span className="italic font-normal text-cta-hover">
                {lang === 'SV' ? 'Det lilla extra.' : 'The little extra.'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              {lang === 'SV' ? 'Vilka är vi? Stodona är städbolaget som gör det lilla extra för sina kunder. Vi strävar efter att vara en partner som levererar en wow-upplevelse i varje steg.' : 'Who are we? Stodona is the cleaning company that goes the extra mile for its customers. We strive to be a partner that delivers a wow experience at every step.'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-6">
                {lang === 'SV' ? 'Vår vision' : 'Our vision'}
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                {lang === 'SV' ? 'Vi strävar efter att vara en partner som levererar en wow-upplevelse i varje steg – från första kontakten, genom utförandet av våra städtjänster, till uppföljningen och det slutliga resultatet.' : 'We strive to be a partner that delivers a wow experience at every step – from first contact, through the execution of our cleaning services, to follow-up and the final result.'}
              </p>
              <p className="mb-8">
                {lang === 'SV' ? 'Med Sveriges mest engagerade och kompetenta personal inom service, med fokus på hemservice, skapar vi inte bara rena hem utan också minnesvärda upplevelser.' : 'With Sweden\'s most dedicated and competent service staff, with a focus on home service, we create not only clean homes but also memorable experiences.'}
              </p>

              <h2 className="text-3xl font-bold mt-16 mb-6">
                {lang === 'SV' ? 'Stodonas historia' : 'Stodona\'s history'}
              </h2>
              <p className="mb-6">
                {lang === 'SV' ? 'Stodona AB grundades 2019 efter att vår ägare haft utmaningar med städbolag både på tidigare arbetsplatser och privat och såg ganska snabbt vikten av struktur, uppföljning, god service och det viktigaste av allt.. att ta hand om personalen som är ute hos kunder och jobbar.' : 'Stodona AB was founded in 2019 after our owner had challenges with cleaning companies both at previous workplaces and privately and quickly saw the importance of structure, follow-up, good service and most importantly.. taking care of the staff who are out working at customers\' homes.'}
              </p>
              <p className="mb-6">
                {lang === 'SV' ? <>Namnet Stodona kommer från orden <strong>städa</strong> och <strong>dona</strong>, där dona står för det lilla extra som gör att man som kund stannar hos oss.</> : <>The name Stodona comes from the words <strong>städa</strong> (clean) and <strong>dona</strong> (stuff/extras), where dona represents the little extra that makes customers stay with us.</>}
              </p>
              <p className="mb-12">
                {lang === 'SV' ? 'Vi är idag ett av Sveriges snabbast växande städbolag och har en personalstyrka om ca 50 personer. Vår framgång sitter i rekommendationer från befintliga kunder, vilket är ett fint kvitto på vårt arbete.' : 'Today we are one of Sweden\'s fastest growing cleaning companies with a staff of about 50 people. Our success lies in recommendations from existing customers, which is a great receipt of our work.'}
              </p>

              {/* Middle CTA */}
              <div className="my-16 p-8 bg-cta-hover/20 rounded-2xl border border-cta-hover/30 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {lang === 'SV' ? 'Vill du bli en del av Stodona?' : 'Want to be part of Stodona?'}
                </h3>
                <p className="mb-6 text-text-secondary">
                  {lang === 'SV' ? 'Vi letar alltid efter engagerade medarbetare.' : 'We are always looking for dedicated employees.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/kontakt" className="btn-primary">
                    {lang === 'SV' ? 'Kontakta oss' : 'Contact us'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="card-rounded bg-bg-dark text-text-light p-8 shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="italic text-sm mb-4">
                    {lang === 'SV' ? '"Stodona är mer än bara ett städbolag, de är en partner som verkligen bryr sig om resultatet."' : '"Stodona is more than just a cleaning company, they are a partner who truly cares about the result."'}
                  </p>
                  <p className="font-bold text-sm">— Karin, Bromma</p>
                </div>

                <WhyStodona />

                <div className="card-rounded bg-white p-8 border border-text-primary/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Företagsfakta' : 'Company facts'}</h3>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li><strong>{lang === 'SV' ? 'Grundat:' : 'Founded:'}</strong> 2019</li>
                    <li><strong>{lang === 'SV' ? 'Anställda:' : 'Employees:'}</strong> {lang === 'SV' ? 'ca 50 personer' : 'approx. 50 people'}</li>
                    <li><strong>{lang === 'SV' ? 'Org.nr:' : 'Org. no.:'}</strong> 559201-1059</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-16 bg-bg-primary">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            {lang === 'SV' ? 'Utforska våra tjänster' : 'Explore our services'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link to="/hemstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">🏠</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Hemstädning' : 'Home Cleaning'}</span>
            </Link>
            <Link to="/flyttstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">📦</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Flyttstädning' : 'Move-Out Cleaning'}</span>
            </Link>
            <Link to="/foretagsstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">🏢</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Företagsstädning' : 'Office Cleaning'}</span>
            </Link>
            <Link to="/fonsterputsning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">🪟</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Fönsterputsning' : 'Window Cleaning'}</span>
            </Link>
            <Link to="/storstadning" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">✨</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Storstädning' : 'Deep Cleaning'}</span>
            </Link>
            <Link to="/priser" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">💰</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Priser' : 'Pricing'}</span>
            </Link>
            <Link to="/recensioner" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">⭐</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Recensioner' : 'Reviews'}</span>
            </Link>
            <Link to="/faq" className="p-4 bg-white rounded-xl text-center hover:shadow-md transition-all hover:-translate-y-1">
              <span className="text-2xl block mb-2">❓</span>
              <span className="font-medium text-sm">{lang === 'SV' ? 'Vanliga frågor' : 'FAQ'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
