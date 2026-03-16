import React from 'react';
import { motion } from 'motion/react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VarvaEnVan() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img 
            src="/familj-stodona.jpg" 
            alt="Värva en vän Stodona Stockholm" 
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
              <Gift className="w-8 h-8 text-bg-dark" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Värva en vän och få <br />
              <span className="italic font-normal text-cta-hover">50% rabatt</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/80 leading-relaxed mb-8">
              Vem känner du som behöver hjälp med städningen hemma? En vän, kollega eller granne? 
              Just nu har vi en riktigt bra värvningskampanj som ger er båda 50% rabatt på en faktura 
              när du rekommenderar Stodona.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-rounded bg-bg-primary p-8 text-center"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-cta-hover">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Tipsa om Stodona</h3>
              <p className="text-text-secondary">
                Du tipsar din vän om hemstädning med Stodona. Din vän anger ditt namn som referens i sin bokning.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card-rounded bg-bg-primary p-8 text-center"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-cta-hover">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Bokning</h3>
              <p className="text-text-secondary">
                Vi registrerar bokningen på dig som befintlig kund och även på din vän som du tipsat.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card-rounded bg-bg-primary p-8 text-center"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-xl font-bold text-cta-hover">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">50% rabatt</h3>
              <p className="text-text-secondary">
                Den andra månaden får ni båda 50% rabatt på fakturan. Enkelt och smidigt!
              </p>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Link to="/boka-stadning" className="btn-primary">
              Boka städning nu
            </Link>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto card-rounded bg-white p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Följande villkor gäller</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">För att erhålla erbjudandet måste din vän vara kund hos oss i minst 2 månader.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">Din vän får inte ha haft löpande städning med oss på minst 2 månader.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">För att du och din vän ska få ta del av erbjudandet måste din vän ange dig som referens vid bokning.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">Vännen kan inte i efterhand använda sig av erbjudandet.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">Erbjudandet går ej att kombinera med andra erbjudanden eller rabatter. (Har du som befintlig kund redan ett rabatterat pris så är det maximalt 50% rabatt du kan erhålla).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
