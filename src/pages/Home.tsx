import { Link } from "react-router-dom";
import { Helmet } from "../seo";
import { QuickBookingWidget } from "../components/QuickBookingWidget";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SERVICE_CARDS } from "../constants";
import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import ContactPopup from "../components/ContactPopup";
import { useSearchParams } from "react-router-dom";
import { bookingUrl } from "../utils/bookingUrl";
import { track } from "../utils/analytics";
import HeroVideo from "../components/HeroVideo";

// Värdena måste stavas exakt som tjänsterna heter i bokningssystemet – de
// skickas som ?service= och matchas mot SERVICES där. Etiketten översätts,
// värdet gör det aldrig.
const HERO_SERVICES = [
  { value: "Hemstädning", key: "nav.hemstadning" },
  { value: "Flyttstädning", key: "nav.flyttstadning" },
  { value: "Storstädning", key: "nav.storstadning" },
  { value: "Fönsterputsning", key: "nav.fonsterputsning" },
  { value: "Företagsstädning", key: "nav.foretagsstadning" },
] as const;

export default function Home() {
  const { lang } = useLanguage();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [heroSqm, setHeroSqm] = useState("");
  const [heroService, setHeroService] = useState<string>(HERO_SERVICES[0].value);
  const [showToast, setShowToast] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('contact_success') === 'true') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      searchParams.delete('contact_success');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  function startBooking(e: React.FormEvent) {
    e.preventDefault();
    const sqm = parseInt(heroSqm, 10);
    const giltig = Number.isFinite(sqm) && sqm >= 10 && sqm <= 500;
    track("booking_start", { source: "hero_sqm", service: heroService, sqm: giltig ? sqm : undefined });
    // Tjänsten följer alltid med; ytan bara när den är rimlig.
    window.location.href = bookingUrl({ service: heroService, ...(giltig ? { sqm } : {}) });
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Stodona – Professionell städning i Stockholm | Hemstädning med RUT-avdrag</title>
        <meta name="description" content="Stodona erbjuder hemstädning, fönsterputsning, flyttstädning och storstädning i Stockholm. Samma team varje gång. RUT-avdrag – betala bara 50%. Boka online!" />
        <link rel="canonical" href="https://stodona.se/" />
        <meta property="og:title" content="Stodona – Professionell städning i Stockholm" />
        <meta property="og:description" content="Hemstädning, fönsterputsning och flyttstädning med RUT-avdrag. Samma team varje gång. Boka online!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se" />
        <meta property="og:image" content="https://stodona.se/stodona-stad.jpg" />
        <meta property="og:locale" content="sv_SE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stodona – Professionell städning i Stockholm" />
        <meta name="twitter:description" content="Hemstädning med RUT-avdrag. Samma team varje gång. Boka online!" />
        <meta name="twitter:image" content="https://stodona.se/stodona-stad.jpg" />
        {/* LocalBusiness/Organization-schemat ligger statiskt i index.html så det syns för alla botar utan JS. */}
      </Helmet>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">
              {t('modal.contact.success', lang)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. Hero Section – två rutor bredvid varandra: bokningskortet till
          vänster och filmen till höger. Filmen ligger alltså inte längre som
          bakgrund bakom texten, utan i en egen ruta. På mobil staplas de med
          kortet överst så att bokningsformuläret möter besökaren först. */}
      <section className="relative overflow-hidden">
        {/* Från lg går rutorna ut i skärmkanterna, utan lucka emellan och med
            en höjd som fyller viewporten ned till vecket: USP-remsan är 45 px
            och headern 141 px på desktop, alltså 186 px att räkna bort. Under
            lg ligger rutorna kvar i den vanliga spalten. */}
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-0 items-stretch lg:min-h-[calc(100vh-186px)]">
            <div className="bg-white p-5 sm:p-10 md:p-12 lg:px-12 xl:px-20 shadow-2xl lg:shadow-none flex flex-col justify-center [container-type:inline-size]">
              <span className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-cta-hover/35 text-text-primary text-[11px] font-bold tracking-widest uppercase mb-5">
                <Star className="w-3.5 h-3.5 fill-current text-accent" /> 4,9 av 5 i snittbetyg
              </span>

                {/* Flytande grad så att "Bäst hemstädning i Stockholm." aldrig
                  bryts. Raden är 14,11 gånger bredare än teckengraden, och
                  kortet är numera en halv skärm brett – graden måste därför
                  följa KORTETS bredd (cqw) och inte fönstrets, annars bryts
                  raden i tvåspaltsläget. Brytgränsen går vid 7,08cqw, så 7cqw
                  är alltid säkert oavsett hur högt taket sätts. */}
              <h1 className="text-[clamp(1rem,7cqw,2.75rem)] font-bold leading-[1.15] text-text-primary mb-4">
                {t('home.hero.title1', lang)}
                <br />
                <span className="italic font-normal text-accent-deep">
                  {t('home.hero.title2', lang)}
                </span>
              </h1>

              {/* Bokningen påbörjas här. Tjänst och kvadratmetrar följer med till
                  boka.stodona.se som ?service= och ?sqm=, så besökaren slipper
                  fylla i dem två gånger. Tjänstvalet ligger dessutom här för att
                  det ska synas på första skärmen att vi gör mer än hemstädning –
                  på mobil ligger menyn bakom hamburgaren och tjänstesektionen
                  först vid 964 px. */}
              <form onSubmit={startBooking} className="mb-7">
                <span className="block text-text-secondary text-base sm:text-lg mb-3">
                  {t('home.hero.serviceLabel', lang)}
                </span>
                  {/* Fem knappar kräver ca 650 px och ryms inte på en rad nu när
                    kortet delar heron med filmrutan – de radbryter i stället,
                    så att alla tjänster syns utan sidscroll. */}
                <div
                  className="flex flex-wrap gap-2 mb-5"
                  role="group"
                  aria-label={t('home.hero.serviceLabel', lang)}
                >
                  {HERO_SERVICES.map((tjanst) => {
                    const vald = tjanst.value === heroService;
                    return (
                      <button
                        key={tjanst.value}
                        type="button"
                        onClick={() => setHeroService(tjanst.value)}
                        aria-pressed={vald}
                        className={`px-3 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                          vald
                            ? "bg-text-primary text-bg-primary border-text-primary"
                            : "bg-white/70 text-text-secondary border-text-primary/15 hover:border-accent hover:text-text-primary"
                        }`}
                      >
                        {t(tjanst.key, lang)}
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="hero-sqm" className="block text-text-secondary text-base sm:text-lg mb-3">
                  {t('home.hero.sqmLabel', lang)}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative sm:w-44">
                    <input
                      id="hero-sqm"
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={500}
                      value={heroSqm}
                      onChange={(e) => setHeroSqm(e.target.value)}
                      placeholder="70"
                      className="w-full bg-white border border-text-primary/15 pl-4 pr-12 py-4 text-lg font-medium text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-shadow"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium pointer-events-none">
                      kvm
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-primary px-8 py-4 font-bold tracking-wide uppercase text-sm hover:bg-accent-deep transition-colors"
                  >
                    {t('home.hero.sqmCta', lang)} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary underline underline-offset-4"
                >
                  {t('home.hero.cta2', lang)}
                </button>
              </div>

              <ContactPopup isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm font-medium text-text-secondary border-t border-text-primary/10 pt-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{t(`home.hero.bullet${n}`, lang)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filmrutan. På mobil får den ett fast bildförhållande så att den
                inte tar över skärmen; från lg och uppåt sträcker den sig i
                stället till samma höjd som kortet bredvid. */}
            <div className="relative overflow-hidden shadow-2xl lg:shadow-none aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-full">
              {/* Inget CSS-filter längre. Klippet är nästan helvitt (medel-
                  luminans 222) – brightness(1.06) tryckte 32 % av bildrutan
                  över 250 och plattade ut all textur i sängkläderna. Filtret
                  fanns för att lyfta filmen bakom en mörk tonad överlagring,
                  och den överlagringen finns inte kvar. */}
              <HeroVideo
                srcAv1="/stodona-hero-av1.mp4"
                src="/stodona-hero.mp4"
                poster="/hero-poster.webp"
                alt="Nystädat sovrum med uppbäddad säng"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tjänstekort – fullbredd, direkt under heron */}
      <section className="relative bg-white py-16 sm:py-24">
        <div className="container-custom mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.45 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t('home.services.title', lang)}
              </h2>
              <p className="text-text-secondary text-lg">
                {t('home.services.subtitle', lang)}
              </p>
            </div>
            <a href={bookingUrl()} className="btn-secondary shrink-0 hover:bg-cta-hover hover:border-cta-hover hover:text-text-primary transition-all duration-300">
              {t('home.services.allprices', lang)}
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {SERVICE_CARDS.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
            >
              <Link
                to={service.link}
                className="group relative block overflow-hidden h-[400px] lg:h-[460px]"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-text-light">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-md">
                    {service.title}
                  </h3>
                  <p className="text-text-light/85 mb-4 max-w-sm drop-shadow">
                    {service.description}
                  </p>
                  <div className="inline-flex items-center text-sm font-bold uppercase tracking-wide">
                    {t('home.services.readmore', lang)}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5b. Barnpassning – egen tjänstegren, länkad från startsidan så att både
           besökare och sökrobotar hittar dit. */}
      <section className="bg-bg-dark text-text-light py-14 sm:py-20">
        <div className="container-custom grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-5">
              Även barnpassning
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Barnvakt och barnpassning i Stockholm
            </h2>
            <p className="text-text-light/80 leading-relaxed mb-6 max-w-xl">
              Enstaka kvällar eller fast nanny varje vecka. Alla barnvakter är
              referenstagna, HLR-utbildade och kontrollerade mot belastningsregistret –
              och anställda hos oss. Från 199 kr i timmen efter RUT-avdrag.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/barnpassning"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white px-7 py-3 inline-flex items-center gap-2"
              >
                Läs om barnpassning <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/blogg/vad-kostar-barnvakt-stockholm"
                className="btn-secondary border-text-light/40 text-text-light hover:bg-text-light hover:text-text-primary px-7 py-3"
              >
                Vad kostar en barnvakt?
              </Link>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
            <HeroVideo
              src="/barnpassning-hero.mp4"
              poster="/barnpassning-hero-poster.jpg"
              alt="Två barn som hoppar i sängen hemma"
              lazy
            />
          </div>
        </div>
      </section>

      {/* 1.5. Insight Section - Apple Style */}
      <section className="py-14 sm:py-20 md:py-24 bg-bg-primary overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Vänster: bokningsrutan. Den låg tidigare i en egen sektion
                ovanför – här står den i stället bredvid texten om varför
                städningen ställer till det, så argumentet och handlingen
                möts på samma skärm. */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <QuickBookingWidget />
            </motion.div>

            {/* Right: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col items-start text-left"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-bg-primary text-text-secondary text-xs font-bold tracking-widest uppercase mb-8">
                {t('home.insight.badge', lang)}
              </span>
              <h2 className="text-4xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight text-text-primary">
                {t('home.insight.title', lang)}
              </h2>
              <div className="text-lg md:text-xl text-text-secondary leading-relaxed space-y-4">
                <p>
                  {t('home.insight.p1', lang)} {t('home.insight.p2', lang)} {t('home.insight.p3', lang)}
                </p>
              </div>

              <div className="mt-12">
                <a
                  href={bookingUrl()}
                  className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg inline-flex items-center gap-2"
                >
                  {t('home.insight.cta', lang)}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Recensioner */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('home.reviews.title', lang)}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-lg">4.9/5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-rounded bg-bg-primary p-6">
              <div className="flex text-yellow-500 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-lg font-medium mb-6 italic">
                {t('home.reviews.r1.text', lang)}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-text-primary/10 flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <p className="font-bold text-sm">Anna S.</p>
                  <p className="text-xs text-text-secondary">
                    {t('home.reviews.r1.service', lang)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-rounded bg-bg-primary p-6">
              <div className="flex text-yellow-500 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-lg font-medium mb-6 italic">
                {t('home.reviews.r2.text', lang)}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-text-primary/10 flex items-center justify-center font-bold">
                  J
                </div>
                <div>
                  <p className="font-bold text-sm">Johan E.</p>
                  <p className="text-xs text-text-secondary">
                    {t('home.reviews.r2.service', lang)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-rounded bg-bg-primary p-6">
              <div className="flex text-yellow-500 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-lg font-medium mb-6 italic">
                {t('home.reviews.r3.text', lang)}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-text-primary/10 flex items-center justify-center font-bold">
                  M
                </div>
                <div>
                  <p className="font-bold text-sm">Mikael L.</p>
                  <p className="text-xs text-text-secondary">
                    {t('home.reviews.r3.service', lang)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-kolumn Quality System */}
      <section className="section-spacing relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-cta-hover/10 to-transparent -z-10 blur-3xl rounded-full"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('home.why.title', lang)}
            </h2>
            <p className="text-text-secondary text-lg">
              {t('home.why.subtitle', lang)}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Boxes */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <ShieldCheck className="w-7 h-7 text-text-primary group-hover:text-accent-deep transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-deep transition-colors duration-300">{t('home.why.q1.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q1.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                  <Sparkles className="w-7 h-7 text-text-primary group-hover:text-accent-deep transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-deep transition-colors duration-300">{t('home.why.q2.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q2.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <Star className="w-7 h-7 text-text-primary group-hover:text-accent-deep transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-deep transition-colors duration-300">{t('home.why.q3.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q3.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Presentkort – säsongs-CTA */}
      <section className="py-14 bg-cta-hover text-text-primary">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-text-primary/10 text-text-primary text-xs font-bold tracking-widest uppercase mb-4">
              <Gift className="w-4 h-4" /> Presentkort
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Ge bort ett rent hem 🎁</h2>
            <p className="text-text-primary/80">Den perfekta presenten till jul, inflytt eller nybliven förälder.</p>
          </div>
          <Link to="/presentkort" className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4 shrink-0">
            Köp presentkort
          </Link>
        </div>
      </section>

      {/* Byta städbolag CTA */}
      <section className="py-14 bg-bg-dark text-text-light">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-4">
              Missnöjd med ditt städbolag?
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Byta städbolag är enklare än du tror</h2>
            <p className="text-text-light/75">Vi tar reda på vad som inte fungerat – och ser till att det blir rätt.</p>
          </div>
          <Link to="/byta-stadbolag" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shrink-0">
            Läs om att byta till Stodona
          </Link>
        </div>
      </section>

      {/* 7. Stark slut-CTA */}
      <section className="py-16 sm:py-24 bg-cta-hover text-text-primary relative overflow-hidden">
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
            {t('home.cta.title', lang)}
          </h2>
          <p className="text-xl mb-10 opacity-90">
            {t('home.cta.subtitle', lang)}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={bookingUrl()}
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              {t('home.cta.btn1', lang)}
            </a>
            <a
              href={bookingUrl()}
              className="btn-secondary border-text-primary text-text-primary hover:bg-text-primary hover:text-bg-primary text-lg px-8 py-4"
            >
              {t('home.cta.btn2', lang)}
            </a>
          </div>
          <p className="mt-6 text-sm font-medium opacity-80">
            {t('home.cta.urgency', lang)}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] aspect-square rounded-full border-[100px] border-text-primary/10"></div>
          <div className="absolute -bottom-[40%] -left-[10%] w-[60%] aspect-square rounded-full border-[80px] border-text-primary/10"></div>
        </div>
      </section>

      {/* 2. Här har vi flest kunder - Serviceområden */}
      <section className="section-spacing bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('home.areas.title1', lang)}{" "}
              <span className="text-cta-hover">{t('home.areas.title2', lang)}</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              {t('home.areas.subtitle', lang)}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { name: "Ekerö", link: "/ekero" },
              { name: "Lidingö", link: "/lidingo" },
              { name: "Nacka", link: "/nacka" },
              { name: "Sundbyberg", link: "/sundbyberg" },
              { name: "Solna", link: "/solna" },
              { name: "Östermalm", link: "/ostermalm" },
              { name: "Vasastan", link: "/vasastan" },
              { name: "Torsplan", link: "/torsplan" },
              { name: "Södermalm", link: "/sodermalm" },
              { name: "Haninge", link: "/haninge" },
              { name: "Järfälla", link: "/jarfalla" },
              { name: "Danderyd", link: "/danderyd" },
              { name: "Sollentuna", link: "/sollentuna" },
              { name: "Huddinge", link: "/huddinge" },
              { name: "Bromma", link: "/bromma" },
              { name: "Djursholm", link: "/djursholm" },
              { name: "Täby", link: "/taby" },
              { name: "Vaxholm", link: "/vaxholm" },
              { name: "Upplands Väsby", link: "/upplands-vasby" },
              { name: lang === 'EN' ? 'Other parts of Stockholm' : 'Andra delar av Stockholm', link: "/stockholm" },
            ].map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={area.link}
                  className="flex items-center justify-center gap-2 p-2.5 bg-bg-primary rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <MapPin className="w-4 h-4 text-text-secondary group-hover:text-accent-deep transition-colors" />
                  <span className="text-sm font-medium text-text-primary group-hover:text-accent-deep transition-colors">
                    {area.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
