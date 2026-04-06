import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SERVICE_CARDS } from "../constants";
import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import ContactPopup from "../components/ContactPopup";
import { useSearchParams } from "react-router-dom";

export default function Home() {
  const { lang } = useLanguage();
  const [isContactOpen, setIsContactOpen] = useState(false);
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

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Stodona – Professionell städning i Stockholm | Hemstädning med RUT-avdrag</title>
        <meta name="description" content="Stodona erbjuder hemstädning, fönsterputsning, flyttstädning och storstädning i Stockholm. Samma team varje gång. RUT-avdrag – betala bara 50%. Boka online!" />
        <link rel="canonical" href="https://stodona.se" />
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
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden text-text-light">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/stodonavideo.mp4" type="video/mp4" />
          </video>
          {/* Dark Overlay 50% */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container-custom relative z-20">
          <div className="max-w-3xl mt-4 sm:mt-12 md:mt-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-4 sm:mb-6 drop-shadow-lg"
            >
              {t('home.hero.title1', lang)}
              <br />
              <span className="italic font-normal text-cta-hover">
                {t('home.hero.title2', lang)}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-text-light/90 mb-6 sm:mb-10 max-w-2xl leading-relaxed drop-shadow-md"
            >
              {t('home.hero.subtitle', lang)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12"
            >
              <a
                href="https://boka.stodona.se"
                className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 shadow-lg"
              >
                {t('home.hero.cta1', lang)}
              </a>
              <button
                onClick={() => setIsContactOpen(true)}
                className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-text-primary text-lg px-8 py-4 shadow-lg backdrop-blur-sm"
              >
                {t('home.hero.cta2', lang)}
              </button>
            </motion.div>

            <ContactPopup isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-text-light/90 drop-shadow-md"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('home.hero.bullet1', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('home.hero.bullet2', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('home.hero.bullet3', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cta-hover" />
                <span>{t('home.hero.bullet4', lang)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Boka Section */}
      <section className="pt-8 pb-4 bg-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square bg-cta-hover/5 blur-[120px] rounded-full -z-10"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-bg-primary text-text-secondary text-xs font-bold tracking-widest uppercase mb-6">
              {t('home.book.badge', lang)}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              {t('home.book.title1', lang)} <br />
              <span className="text-cta-hover italic font-normal">{t('home.book.title2', lang)}</span>
            </h2>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-8">
              {t('home.book.subtitle', lang)}
            </p>
            <div className="mt-12 text-left">
              <QuickBookingWidget />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1.5. Insight Section - Apple Style */}
      <section className="py-16 sm:py-24 md:py-32 bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
                <img
                  src="/familj-stodona.jpg"
                  alt="Glad familj hemma med Stodona"
                  className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
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
                  href="https://boka.stodona.se"
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <ShieldCheck className="w-7 h-7 text-text-primary group-hover:text-cta-hover transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cta-hover transition-colors duration-300">{t('home.why.q1.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q1.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:-rotate-3">
                  <Sparkles className="w-7 h-7 text-text-primary group-hover:text-cta-hover transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cta-hover transition-colors duration-300">{t('home.why.q2.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q2.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card-rounded bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-cta-hover/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cta-hover/5 rounded-bl-full z-0 group-hover:bg-cta-hover/10 transition-colors duration-500"></div>
              <div className="flex flex-col gap-6 items-start relative z-10">
                <div className="w-14 h-14 bg-bg-primary group-hover:bg-cta-hover/20 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <Star className="w-7 h-7 text-text-primary group-hover:text-cta-hover transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cta-hover transition-colors duration-300">{t('home.why.q3.title', lang)}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('home.why.q3.text', lang)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Tjänstekort */}
      <section className="section-spacing relative overflow-hidden bg-white">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-bg-primary/30 -z-10 rounded-l-full blur-3xl transform translate-x-1/3"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t('home.services.title', lang)}
              </h2>
              <p className="text-text-secondary text-lg">
                {t('home.services.subtitle', lang)}
              </p>
            </div>
            <a href="https://boka.stodona.se" className="btn-secondary shrink-0 hover:bg-cta-hover hover:border-cta-hover hover:text-text-primary transition-all duration-300">
              {t('home.services.allprices', lang)}
            </a>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICE_CARDS.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={service.link}
                  className="group block card-rounded bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-text-primary/5 hover:border-cta-hover/30 h-full flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-cta-hover transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary mb-6 line-clamp-2 flex-grow">
                      {service.description}
                    </p>
                    <div className="flex items-center text-sm font-bold text-text-primary group-hover:text-cta-hover transition-colors duration-300 mt-auto">
                      {t('home.services.readmore', lang)}{" "}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
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
              href="https://boka.stodona.se"
              className="btn-primary bg-text-primary text-bg-primary hover:bg-white hover:text-text-primary text-lg px-8 py-4"
            >
              {t('home.cta.btn1', lang)}
            </a>
            <a
              href="https://boka.stodona.se"
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
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
    </div>
  );
}
