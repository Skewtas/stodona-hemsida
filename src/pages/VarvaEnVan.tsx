import { Helmet } from "../seo";
import React from 'react';
import { motion } from 'motion/react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { bookingUrl } from "../utils/bookingUrl";

export default function VarvaEnVan() {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Värva en vän – Få 50% rabatt | Stodona</title>
        <meta name="description" content="Värva en vän till Stodona: din vän får 15 % rabatt på sitt städabonnemang och du får 50 % rabatt på en faktura." />
        <meta property="og:title" content="Värva en vän – Få 50% rabatt | Stodona" />
        <meta property="og:description" content="Ge din personliga kod till en vän. Din vän får 15 % rabatt och du får 50 % rabatt på en faktura." />
        <link rel="canonical" href="https://stodona.se/varva-en-van" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="absolute inset-0 z-0">
          <img
            src="/familj-stodona.jpg"
            alt="Värva en vän Stodona Stockholm"
            className="w-full h-full object-cover opacity-40"
            width="1024"
            height="1536"
            loading="eager"
            fetchPriority="high"
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
              {lang === 'SV' ? 'Vem känner du som behöver hjälp med städningen hemma? En vän, kollega eller granne? Som abonnemangskund har du en personlig värvningskod. Din vän får 15 % rabatt på sitt städabonnemang, och du får 50 % rabatt på en hel faktura.' : 'Do you know someone who needs help with cleaning at home? A friend, colleague or neighbor? As a subscription customer you have a personal referral code. Your friend gets 15% off their cleaning subscription, and you get 50% off a full invoice.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Skicka din kod' : 'Share your code'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'Din personliga värvningskod står i mejlen du får från oss. Skicka den till en vän – som SMS, på WhatsApp eller i ett mejl.' : 'Your personal referral code is in the emails you get from us. Send it to a friend – by text, WhatsApp or email.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Din vän får 15 %' : 'Your friend gets 15%'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'Din vän bokar ett städabonnemang med koden – direkt på hemsidan eller via en offert – och får 15 % rabatt på alla sina städningar.' : 'Your friend books a cleaning subscription with the code – on the website or through a quote – and gets 15% off all their cleanings.'}
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
              <h3 className="text-xl font-bold mb-4">{lang === 'SV' ? 'Du får 50 %' : 'You get 50%'}</h3>
              <p className="text-text-secondary">
                {lang === 'SV' ? 'När din vän har fått sin andra faktura får du 50 % rabatt på en hel faktura. Vi drar av det åt dig – du behöver inte göra något.' : 'When your friend has received their second invoice, you get 50% off a full invoice. We deduct it for you – you do not need to do anything.'}
              </p>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <a href={bookingUrl()} className="btn-primary">
              {lang === 'SV' ? 'Boka städning nu' : 'Book cleaning now'}
            </a>
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
                <span className="text-text-secondary">{lang === 'SV' ? 'Du får din rabatt när din vän har fått sin andra faktura och har kvar sitt abonnemang.' : 'You get your discount when your friend has received their second invoice and still has their subscription.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Din vän får inte ha haft en städning hos oss de senaste 2 månaderna.' : 'Your friend must not have had a cleaning with us in the last 2 months.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Du behöver själv ha varit kund hos oss i minst 2 månader och ha kvar ditt abonnemang när rabatten ges.' : 'You need to have been a customer with us for at least 2 months yourself, and still have your subscription when the discount is given.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Din vän måste ange din kod när hen bokar ett städabonnemang. Koden kan inte läggas till i efterhand.' : 'Your friend must enter your code when booking a cleaning subscription. The code cannot be added afterwards.'}</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" />
                <span className="text-text-secondary">{lang === 'SV' ? 'Rabatten på 50 % gäller ordinarie pris på en faktura. Erbjudandet går ej att kombinera med andra erbjudanden eller rabatter. (Har du som befintlig kund redan ett rabatterat pris så är det maximalt 50 % rabatt du kan erhålla).' : 'The 50% discount applies to the regular price on one invoice. The offer cannot be combined with other offers or discounts. (If you as an existing customer already have a discounted price, the maximum discount you can receive is 50%).'}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
