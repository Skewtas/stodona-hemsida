import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { HelpCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Helmet } from "../seo";
import AnswerFirst from "./AnswerFirst";
import { bookingUrl } from "../utils/bookingUrl";

export interface ContentSection {
  heading: string;
  body: React.ReactNode;
}
export interface ContentFaq {
  q: string;
  a: string;
}
export interface ContentPageProps {
  slug: string;               // t.ex. "rut-avdrag"
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;         // synligt namn i brödsmulan
  title: string;              // H1
  intro: string;              // kort ingress i heron
  answerHeading: string;
  answer: React.ReactNode;
  facts: { label: string; value: string }[];
  sections: ContentSection[];
  faq?: ContentFaq[];
  related?: { label: string; to: string }[];
  /** Ersätter standardtexten under "Redo att boka?" (t.ex. på abonnemangssidan). */
  ctaText?: string;
  /** Ersätter rubriken i CTA-blocket, för sidor som inte handlar om att boka. */
  ctaHeading?: string;
  /** Ersätter boka-knappen, t.ex. med en mejllänk. */
  ctaPrimary?: { label: string; href: string };
  /** Foto i heron. "split" ger två rutor bredvid varandra: foto till vänster,
      rubriken i en mörk ruta till höger. Annars ligger fotot bakom texten,
      med slöja så att kontrasten håller. */
  heroImage?: { src: string; alt: string; position?: string; layout?: "backdrop" | "split"; panelClass?: string };
}

export default function ContentPage(p: ContentPageProps) {
  const url = `https://stodona.se/${p.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
      { "@type": "ListItem", position: 2, name: p.breadcrumb, item: url },
    ],
  };
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.metaTitle,
    description: p.metaDescription,
    url,
    isPartOf: { "@type": "WebSite", name: "Stodona", url: "https://stodona.se/" },
    inLanguage: "sv-SE",
  };
  const faqSchema = p.faq && p.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{p.metaTitle}</title>
        <meta name="description" content={p.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={p.metaTitle} />
        <meta property="og:description" content={p.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      {/* Hero */}
      {p.heroImage?.layout === "split" ? (
        <section className="bg-bg-primary pt-24 md:pt-28">
          <div className="container-custom">
            <nav className="text-sm text-text-secondary mb-4" aria-label="Brödsmulor">
              <Link to="/" className="hover:text-text-primary">Hem</Link> <span className="mx-1.5">/</span>
              <span className="text-text-primary">{p.breadcrumb}</span>
            </nav>
          </div>
          {/* Rutorna går kant i kant över hela skärmen – ingen container. */}
          <div className="grid md:grid-cols-2">
            <div className="aspect-square md:max-h-[88vh] overflow-hidden">
              <img
                src={p.heroImage.src}
                alt={p.heroImage.alt}
                className="w-full h-full object-cover"
                style={{ objectPosition: p.heroImage.position ?? "center" }}
                width="1536"
                height="1024"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              className={`flex flex-col justify-center px-8 py-12 md:px-14 lg:px-20 min-h-[100vw] md:min-h-0 md:aspect-square md:max-h-[88vh] ${p.heroImage.panelClass ?? "bg-accent text-text-primary"}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">{p.title}</h1>
              <p className="text-lg md:text-xl leading-relaxed">{p.intro}</p>
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="relative isolate overflow-hidden bg-bg-dark text-text-light pt-32 pb-16 md:pt-40 md:pb-24">
          {p.heroImage && (
            <>
              <img
                src={p.heroImage.src}
                alt={p.heroImage.alt}
                className="absolute inset-0 -z-10 w-full h-full object-cover"
                style={{ objectPosition: p.heroImage.position ?? "center 45%" }}
                width="1536"
                height="1024"
                loading="eager"
                fetchPriority="high"
              />
              {/* Två slöjor: en jämn som dämpar hela fotot, och en från vänster
                  som gör bandet bakom rubrik och ingress mörkt nog för AA. */}
              <div className="absolute inset-0 -z-10 bg-bg-dark/70 md:bg-bg-dark/50" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg-dark via-bg-dark/70 to-transparent" />
            </>
          )}
          <div className="container-custom max-w-3xl">
            <nav className="text-sm text-text-light/60 mb-5" aria-label="Brödsmulor">
              <Link to="/" className="hover:text-cta-hover">Hem</Link> <span className="mx-1.5">/</span>
              <span className="text-text-light/80">{p.breadcrumb}</span>
            </nav>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold leading-tight mb-5">{p.title}</motion.h1>
            <p className="text-lg text-text-light/80 leading-relaxed max-w-2xl">{p.intro}</p>
          </div>
        </section>
      )}

      {/* Svar först */}
      <AnswerFirst heading={p.answerHeading} answer={p.answer} facts={p.facts} />

      {/* Sektioner */}
      <section className="section-spacing bg-white">
        <div className="container-custom max-w-3xl space-y-12">
          {p.sections.map((s) => (
            <motion.div key={s.heading} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{s.heading}</h2>
              <div className="text-text-secondary text-lg leading-relaxed space-y-4">{s.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {p.faq && p.faq.length > 0 && (
        <section className="section-spacing bg-bg-primary">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Vanliga frågor</h2>
            <div className="space-y-4">
              {p.faq.map((f) => (
                <div key={f.q} className="bg-white rounded-2xl p-6 border border-text-primary/5">
                  <h3 className="text-lg font-bold mb-2 flex items-start gap-3">
                    <HelpCircle className="w-6 h-6 text-cta-hover shrink-0" /> {f.q}
                  </h3>
                  <p className="text-text-secondary leading-relaxed pl-9">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Relaterat + CTA */}
      <section className="py-16 bg-bg-dark text-text-light">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{p.ctaHeading ?? "Redo att boka?"}</h2>
          <p className="text-text-light/80 mb-8">
            {p.ctaText ?? "Boka på 60 sekunder – RUT-avdraget dras direkt, ingen bindningstid."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={p.ctaPrimary?.href ?? bookingUrl()} className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 inline-flex items-center gap-2">
              {p.ctaPrimary?.label ?? "Boka städning"} <ArrowRight className="w-5 h-5" />
            </a>
            <Link to="/kontakt" className="btn-secondary border-text-light text-text-light hover:bg-text-light hover:text-bg-dark px-8 py-4">
              Kontakta oss
            </Link>
          </div>
          {p.related && p.related.length > 0 && (
            <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {p.related.map((r) => (
                <li key={r.to}>
                  <Link to={r.to} className="inline-flex items-center gap-1.5 text-text-light/70 hover:text-cta-hover">
                    <CheckCircle2 className="w-4 h-4 text-cta-hover" /> {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
