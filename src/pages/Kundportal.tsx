import React from 'react';
import { motion } from 'motion/react';
import { User, Lock } from 'lucide-react';

export default function Kundportal() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-bg-primary">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-cta-hover/20 to-transparent -z-10 blur-3xl rounded-full"></div>
        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <User className="w-8 h-8 text-cta-hover" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Stodonas <span className="text-cta-hover">Kundportal</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8">
              Logga in för att enkelt hantera dina bokningar, se historik och kommunicera med oss.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login Steps */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto card-rounded bg-bg-primary p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Så här loggar du in</h2>
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
                <p className="font-bold text-lg mb-2">Öppna portalen</p>
                <p className="text-text-secondary max-w-md">Gå till <a href="http://stodona.twportal.se" target="_blank" rel="noopener noreferrer" className="text-cta-hover hover:underline">stodona.twportal.se</a>, scrolla ner och tryck på "Registrera dig".</p>
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
                <p className="font-bold text-lg mb-2">Ange din e-postadress</p>
                <p className="text-text-secondary max-w-md">Använd samma e-postadress som är registrerad hos oss (den du får fakturor till).</p>
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
                <p className="font-bold text-lg mb-2">Aktivera ditt konto</p>
                <p className="text-text-secondary max-w-md">Avvakta ett par minuter så får du ett aktiveringsmail. Följ instruktionerna i mailet.</p>
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
                <p className="font-bold text-lg mb-2">Logga in</p>
                <p className="text-text-secondary max-w-md">Nu kan du logga in och se all information i kundportalen.</p>
              </motion.li>
            </ol>
            <div className="text-center mt-12">
              <a href="http://stodona.twportal.se" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Gå till Kundportalen
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
