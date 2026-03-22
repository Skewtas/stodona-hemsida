import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '../blogData';

export default function BloggPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blogg" replace />;
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Stodona' },
    publisher: {
      '@type': 'Organization',
      name: 'Stodona',
      logo: { '@type': 'ImageObject', url: 'https://stodona.se/stodona-logo.png' },
    },
    image: `https://stodona.se${post.heroImage}`,
    url: `https://stodona.se/blogg/${post.slug}`,
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{post.title} | Stodona Blogg</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://stodona.se/blogg/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:image" content={`https://stodona.se${post.heroImage}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden bg-bg-primary">
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={post.heroImage} alt={post.title} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 to-bg-primary"></div>
        </div>
        <div className="container-custom relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/blogg" className="inline-flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Tillbaka till bloggen
            </Link>
            <span className="inline-block text-xs font-semibold text-cta-hover bg-cta-hover/10 px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} läsning</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-6xl mx-auto">
            <motion.article
              className="lg:col-span-8 prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <Link to={href || '/'} className="text-cta-hover hover:underline font-medium">
                      {children}
                    </Link>
                  ),
                  h2: ({ children }) => <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold mt-8 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 mb-6 list-disc pl-6">{children}</ul>,
                  ol: ({ children }) => <ol className="space-y-2 mb-6 list-decimal pl-6">{children}</ol>,
                  li: ({ children }) => <li className="text-text-secondary leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="text-text-primary font-bold">{children}</strong>,
                  table: ({ children }) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse text-sm">{children}</table></div>,
                  thead: ({ children }) => <thead className="bg-bg-primary">{children}</thead>,
                  th: ({ children }) => <th className="text-left p-3 font-bold border border-text-primary/10">{children}</th>,
                  td: ({ children }) => <td className="p-3 border border-text-primary/10 text-text-secondary">{children}</td>,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </motion.article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="card-rounded bg-cta-hover text-white p-8 text-center">
                  <h3 className="text-xl font-bold mb-3">Behöver du hjälp?</h3>
                  <p className="text-sm opacity-90 mb-6">Vi finns i hela Stockholmsområdet. Boka enkelt online med RUT-avdrag.</p>
                  <Link to="/boka-stadning" className="btn-primary bg-white text-cta-hover hover:bg-bg-primary text-sm px-6 py-3">
                    Boka städning
                  </Link>
                </div>

                {/* Related posts */}
                <div className="card-rounded bg-bg-primary p-6 border border-text-primary/5">
                  <h3 className="text-lg font-bold mb-4">Fler artiklar</h3>
                  <div className="space-y-4">
                    {blogPosts
                      .filter(p => p.slug !== post.slug)
                      .slice(0, 3)
                      .map(related => (
                        <Link
                          key={related.slug}
                          to={`/blogg/${related.slug}`}
                          className="block group"
                        >
                          <h4 className="text-sm font-medium group-hover:text-cta-hover transition-colors leading-snug mb-1">
                            {related.title}
                          </h4>
                          <span className="text-xs text-text-secondary">{related.readTime}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-bg-primary">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Redo att prova professionell städning?</h2>
          <p className="text-lg text-text-secondary mb-8">Boka din första städning med Stodona. Ingen bindningstid, samma team varje gång.</p>
          <Link to="/boka-stadning" className="btn-primary text-lg px-8 py-4">
            Boka nu – med RUT-avdrag
          </Link>
        </div>
      </section>
    </div>
  );
}
