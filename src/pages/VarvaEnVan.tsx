import { Helmet } from 'react-helmet-async';
import React from 'react';
import { motion } from 'motion/react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function VarvaEnVan() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Värva en vän – Få 50% rabatt | Stodona</title>
        <meta name="description" content="Värva en vän till Stodona och få 50% rabatt på en faktura – för er båda! Tipsa om vår hemstädning och spara pengar tillsammans." />
        <meta property="og:title" content="Värva en vän – Få 50% rabatt | Stodona" />
        <meta property="og:description" content="Tipsa en vän om Stodona och få 50% rabatt på en faktura – för er båda!" />
        <link rel="canonical" href="https://stodona.se/varva-en-van" />
      </Helmet>
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
              {lang === 'SV' ? 'Värva en vän och få' : 'Refer a friend and get'} <br />
              <span className="italic font-normal text-cta-hover">{lang === 'SV' ? '50% rabatt' : '50% discount'}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light/80 leading-relaxed mb-8">
              {lang === 'SV' ? 'Vem känner du som behöver hjälp med städningen hemma? En vän, kollega eller granne? Just nu har vi en riktigt bra värvningskampanj som ger er båda 50% rabatt på en faktura när du rekommenderar Stodona.' : 'Do you know someone who needs help with cleaning at home? A friend, colleague or neighbor? Right now we have a great referral campaign that gives you both 50% discount on an invoice when you recommend Stodona.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Tipsa om Stodona' : 'Recommend Stodona'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'Du tipsar din vän om hemstädning med Stodona. Din vän anger ditt namn som referens i sin bokning.' : 'You recommend Stodona to your friend. Your friend enters your name as a reference in their booking.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Bokning' : 'Booking'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'Vi registrerar bokningen på dig som befintlig kund och även på din vän som du tipsat.' : 'We register the booking for you as an existing customer and also for your friend.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? '50% rabatt' : '50% discount'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'Den andra månaden får ni båda 50% rabatt på fakturan. Enkelt och smidigt!' : 'The second month you both get 50% discount on the invoice. Easy and smooth!'}
              </p>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Link to="/boka-stadning" className="btn-primary">
              {lang === 'SV' ? 'Boka städning nu' : 'Book cleaning now'}
            </Link>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="section-spacing bg-bg-primary">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto card-rounded bg-white p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">{lang === 'SV' ? 'Följande villkor gäller' : 'The following terms apply'}</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'För att erhålla erbjudandet måste din vän vara kund hos oss i minst 2 månader.' : 'To receive the offer, your friend must be a customer with us for at least 2 months.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Din vän får inte ha haft löpande städning med oss på minst 2 månader.' : 'Your friend must not have had regular cleaning with us for at least 2 months.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'För att du och din vän ska få ta del av erbjudandet måste din vän ange dig som referens vid bokning.' : 'For you and your friend to take part in the offer, your friend must enter you as a reference when booking.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Vännen kan inte i efterhand använda sig av erbjudandet.' : 'The friend cannot use the offer retroactively.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Erbjudandet går ej att kombinera med andra erbjudanden eller rabatter. (Har du som befintlig kund redan ett rabatterat pris så är det maximalt 50% rabatt du kan erhålla).' : 'The offer cannot be combined with other offers or discounts. (If you as an existing customer already have a discounted price, the maximum discount you can receive is 50%).'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
