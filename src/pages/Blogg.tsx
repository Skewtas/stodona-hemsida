import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts } from '../blogData';

export default function Blogg() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Blogg | Stodona – Städtips, guider och inspiration</title>
        <meta name="description" content="Läs våra städtips, guider och inspiration. Professionella råd om hemstädning, fönsterputsning och mer från Stodona." />
        <link rel="canonical" href="https://stodona.se/blogg" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 bg-bg-primary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-cta-hover rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Stodonas <span className="italic font-normal text-cta-hover">blogg</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Tips, guider och inspiration för ett renare hem. Professionella råd från våra erfarna städare.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  to={`/blogg/${post.slug}`}
                  className="block h-full bg-bg-primary rounded-2xl border border-text-primary/5 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs font-semibold text-cta-hover bg-cta-hover/10 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-bold mb-3 group-hover:text-cta-hover transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-cta-hover font-medium text-sm group-hover:gap-2 transition-all">
                        Läs mer <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cta-hover text-white">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Behöver du hjälp med städningen?</h2>
          <p className="text-lg mb-8 opacity-90">Låt oss ta hand om städningen så kan du fokusera på det du gillar. RUT-avdrag ingår alltid.</p>
          <Link to="/boka-stadning" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-lg px-8 py-4">
            Boka städning
          </Link>
        </div>
      </section>
    </div>
  );
}
