import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Star, Quote, MapPin } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  service: string;
  rating: number;
  text: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Anna K.',
    location: 'Ekerö',
    service: 'Hemstädning',
    rating: 5,
    text: 'Vi har haft Stodona i snart ett år och är otroligt nöjda. Samma team varje gång som verkligen lär känna vårt hem. Det är som att komma hem till ett nytt hus varje gång!',
    date: '2026-02-15',
  },
  {
    name: 'Marcus L.',
    location: 'Lidingö',
    service: 'Fönsterputsning',
    rating: 5,
    text: 'Fantastisk fönsterputsning! Inga ränder, inga missade rutor. De putsade även balkongglasen som vi inte ens frågade om. Mycket professionella.',
    date: '2026-02-08',
  },
  {
    name: 'Sofia & Erik',
    location: 'Bromma',
    service: 'Flyttstädning',
    rating: 5,
    text: 'Bokade flyttstädning inför vår försäljning. Lägenheten var skinande ren och mäklaren var imponerad. Besiktningen gick igenom utan anmärkning!',
    date: '2026-01-28',
  },
  {
    name: 'Kristina M.',
    location: 'Sundbyberg',
    service: 'Hemstädning',
    rating: 5,
    text: 'Som tvåbarnsmamma med fulltidsjobb är Stodona en livräddare. Flexibla tider, alltid pålitliga och RUT-avdraget gör det prisvärt. Rekommenderar varmt!',
    date: '2026-01-20',
  },
  {
    name: 'Johan P.',
    location: 'Solna',
    service: 'Storstädning',
    rating: 5,
    text: 'Beställde storstädning inför jul. De nådde ställen jag inte visste existerade. Ugnen ser ut som ny och badrummet glänser. Klockrena!',
    date: '2025-12-18',
  },
  {
    name: 'Linda & Per',
    location: 'Nacka',
    service: 'Hemstädning',
    rating: 5,
    text: 'Har testat tre olika städfirmor tidigare men Stodona är bäst. Det som gör skillnaden är att det alltid kommer samma person. Hon vet exakt hur vi vill ha det.',
    date: '2025-12-05',
  },
  {
    name: 'Emma S.',
    location: 'Danderyd',
    service: 'Företagsstädning',
    rating: 5,
    text: 'Vi anlitar Stodona för vårt kontor på 200 kvm. Alltid punktliga, noggranna och trevliga. Våra anställda märker verkligen skillnaden sen vi bytte till Stodona.',
    date: '2025-11-22',
  },
  {
    name: 'Henrik J.',
    location: 'Täby',
    service: 'Byggstädning',
    rating: 5,
    text: 'Efter en totalrenovering av badrummet ringde vi Stodona. De gjorde en fantastisk byggstädning – allt damm, cement och smuts var borta. Sparade oss timmar av eget jobb.',
    date: '2025-11-10',
  },
  {
    name: 'Maria W.',
    location: 'Södermalm',
    service: 'Hemstädning',
    rating: 5,
    text: 'Bästa investeringen vi gjort! Tänk att komma hem till ett skinande rent hem utan att behöva lyfta ett finger. Och priset med RUT? Helt oslagbart.',
    date: '2025-10-30',
  },
  {
    name: 'Anders & Lisa',
    location: 'Östermalm',
    service: 'Fönsterputsning',
    rating: 5,
    text: 'Stora fönster i vår lägenhet på Östermalm – vi hade skjutit upp putsningen i månader. Stodona kom, putsade insida och utsida på under 2 timmar. Otrolig skillnad!',
    date: '2025-10-15',
  },
  {
    name: 'Karin B.',
    location: 'Vasastan',
    service: 'Hemstädning',
    rating: 4,
    text: 'Mycket nöjd med städningen generellt. Uppskattar att samma person kommer varje gång och att det är enkelt att boka om vid behov.',
    date: '2025-09-28',
  },
  {
    name: 'Thomas F.',
    location: 'Huddinge',
    service: 'Trappstädning',
    rating: 5,
    text: 'Vår brf bokade trappstädning via Stodona. Alla grannar är nöjda och trapphuset har aldrig sett så bra ut. Vi har förlängt avtalet direkt!',
    date: '2025-09-15',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function Kundrecensioner() {
  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Stodona',
    image: 'https://stodona.se/stodona-logo.png',
    telephone: '010-178 01 50',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Stockholm',
      addressRegion: 'Stockholm',
      addressCountry: 'SE',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: testimonials.length.toString(),
    },
    review: testimonials.map(t => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.name },
      datePublished: t.date,
      reviewBody: t.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating.toString(),
        bestRating: '5',
      },
    })),
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Kundrecensioner | Stodona – Vad våra kunder säger</title>
        <meta name="description" content={`Läs ${testimonials.length} kundrecensioner om Stodona. Snittbetyg ${avgRating}/5. Hemstädning, fönsterputsning och flyttstädning i Stockholm.`} />
        <link rel="canonical" href="https://stodona.se/recensioner" />
        <meta property="og:title" content="Kundrecensioner | Stodona" />
        <meta property="og:description" content={`${testimonials.length} kundrecensioner. Snittbetyg ${avgRating}/5 stjärnor.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stodona.se/recensioner" />
        <script type="application/ld+json">{JSON.stringify(reviewSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 bg-bg-primary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-cta-hover rounded-full flex items-center justify-center mx-auto mb-6">
              <Quote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kund<span className="italic font-normal text-cta-hover">recensioner</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Vad säger våra kunder om oss? Här kan du läsa omdömen från verkliga kunder i hela Stockholmsområdet.
            </p>

            {/* Aggregate rating */}
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-4 shadow-sm">
              <div className="text-4xl font-bold text-cta-hover">{avgRating}</div>
              <div className="text-left">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">Baserat på {testimonials.length} recensioner</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-bg-primary rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-text-secondary bg-white px-2 py-1 rounded-full">{review.service}</span>
                  </div>
                  <blockquote className="text-text-primary text-sm leading-relaxed mb-4 italic">
                    "{review.text}"
                  </blockquote>
                </div>
                <div className="flex items-center justify-between border-t border-text-primary/5 pt-3 mt-auto">
                  <span className="font-bold text-sm">{review.name}</span>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <MapPin className="w-3 h-3" />
                    {review.location}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cta-hover text-white">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bli nästa nöjda kund</h2>
          <p className="text-lg mb-8 opacity-90">
            Testa Stodona utan bindningstid. Samma team varje gång och alltid med RUT-avdrag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://boka.stodona.se" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-lg px-8 py-4">
              Boka städning
            </a>
            <a href="tel:0101780150" className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Ring 010-178 01 50
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
