import React from 'react';
import { motion } from 'motion/react';
import { User, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Kundportal() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
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
                <p className="text-text-secondary max-w-md">{lang === 'SV' ? <>Gå till <a href="http://stodona.twportal.se" target="_blank" rel="noopener noreferrer" className="text-cta-hover hover:underline">stodona.twportal.se</a>, scrolla ner och tryck på "Registrera dig".</> : <>Go to <a href="http://stodona.twportal.se" target="_blank" rel="noopener noreferrer" className="text-cta-hover hover:underline">stodona.twportal.se</a>, scroll down and click "Register".</>}</p>
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
              <a href="http://stodona.twportal.se" target="_blank" rel="noopener noreferrer" className="btn-primary">
                {lang === 'SV' ? 'Gå till Kundportalen' : 'Go to Customer Portal'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
