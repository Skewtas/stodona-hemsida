import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center px-4">
      <Helmet>
        <title>Sidan hittades inte | Stodona</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <div className="text-8xl md:text-9xl font-bold text-cta-hover/20 mb-4">404</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Sidan hittades inte</h1>
        <p className="text-text-secondary text-lg mb-10 leading-relaxed">
          Tyvärr kunde vi inte hitta sidan du letar efter. Den kan ha flyttats eller tagits bort.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary bg-cta-hover text-text-primary hover:bg-cta-hover/90 text-base px-6 py-3 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Till startsidan
          </Link>
          <Link
            to="/sidkarta"
            className="btn-secondary text-base px-6 py-3 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Sidkarta
          </Link>
        </div>

        <div className="mt-12 p-6 bg-bg-primary rounded-2xl">
          <p className="text-sm text-text-secondary mb-3">Populära sidor:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Hemstädning', to: '/hemstadning' },
              { label: 'Fönsterputsning', to: '/fonsterputsning' },
              { label: 'Flyttstädning', to: '/flyttstadning' },
              { label: 'Boka städning', to: '/boka-stadning' },
              { label: 'FAQ', to: '/faq' },
              { label: 'Blogg', to: '/blogg' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 bg-white rounded-full text-sm font-medium hover:bg-cta-hover hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
