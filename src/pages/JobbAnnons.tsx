import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "../seo";
import { motion } from "motion/react";
import { MapPin, Clock, CheckCircle2, ArrowLeft, ListChecks, UserCheck, Gift } from "lucide-react";
import { getJob, JOBS_POSTED_DATE } from "../jobsData";
import JobApplicationForm from "../components/JobApplicationForm";

export default function JobbAnnons() {
  const { slug } = useParams<{ slug: string }>();
  const job = getJob(slug);

  if (!job) return <Navigate to="/jobba-hos-oss" replace />;

  const Icon = job.icon;
  const url = `https://stodona.se/jobb/${job.slug}`;

  const jobSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${job.intro} ${job.about}`,
    datePosted: JOBS_POSTED_DATE,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "Stodona",
      sameAs: "https://stodona.se",
      logo: "https://stodona.se/logotyp.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Stockholm",
        addressRegion: "Stockholm",
        addressCountry: "SE",
      },
    },
    directApply: true,
    url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: "https://stodona.se/" },
      { "@type": "ListItem", position: 2, name: "Jobba med oss", item: "https://stodona.se/jobba-hos-oss" },
      { "@type": "ListItem", position: 3, name: job.title, item: url },
    ],
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{job.title} sökes i Stockholm | Jobba hos Stodona</title>
        <meta name="description" content={`${job.title} – ${job.intro} Ansök enkelt hos Stodona i Stockholm.`} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(jobSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden text-text-light">
        <img src={job.image} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-bg-dark/92 via-bg-dark/70 to-bg-dark/45" />
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-80 h-80 rounded-full bg-cta-hover/20 blur-3xl z-0" />

        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Link to="/jobba-hos-oss" className="inline-flex items-center gap-2 text-text-light/80 hover:text-cta-hover transition-colors text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Alla lediga tjänster
            </Link>
            <div className="flex items-center gap-4 mb-5">
              <span className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-cta-hover" />
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-500/90 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Öppen ansökan
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-5 drop-shadow-xl">{job.title}</h1>
            <p className="text-lg md:text-xl text-text-light/90 max-w-2xl leading-relaxed mb-6 drop-shadow-md">{job.intro}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-text-light/85">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cta-hover" /> {job.location}</span>
              <span className="text-text-light/40">·</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-cta-hover" /> {job.type}</span>
            </div>
            <a href="#ansok" className="btn-primary bg-cta-hover text-text-primary hover:bg-white text-lg px-8 py-4 mt-8 inline-flex shadow-lg">
              Ansök nu
            </a>
          </motion.div>
        </div>
      </section>

      {/* Innehåll */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Beskrivning */}
            <div className="lg:col-span-7 space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Om rollen</h2>
                <p className="text-text-secondary text-lg leading-relaxed">{job.about}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl md:text-3xl font-bold mb-5 flex items-center gap-3">
                  <ListChecks className="w-7 h-7 text-cta-hover" /> Dina arbetsuppgifter
                </h2>
                <ul className="space-y-3">
                  {job.tasks.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-text-secondary text-lg">
                      <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" /> {t}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}>
                <h2 className="text-2xl md:text-3xl font-bold mb-5 flex items-center gap-3">
                  <UserCheck className="w-7 h-7 text-cta-hover" /> Vi söker dig som
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-text-secondary text-lg">
                      <CheckCircle2 className="w-6 h-6 text-cta-hover shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="bg-cta-hover/15 rounded-3xl p-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-5 flex items-center gap-3">
                  <Gift className="w-7 h-7 text-cta-hover" /> Vi erbjuder
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {job.offer.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-text-primary font-medium">
                      <CheckCircle2 className="w-5 h-5 text-cta-hover shrink-0 mt-0.5" /> {o}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Sidofakta */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="bg-bg-primary rounded-3xl p-8">
                  <h3 className="font-bold text-lg mb-5">Snabbfakta</h3>
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-text-secondary">Roll</dt><dd className="font-semibold text-right">{job.title}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-secondary">Omfattning</dt><dd className="font-semibold text-right">{job.type}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-secondary">Plats</dt><dd className="font-semibold text-right">{job.location}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-text-secondary">Arbetsgivare</dt><dd className="font-semibold text-right">Stodona AB</dd></div>
                  </dl>
                  <a href="#ansok" className="btn-primary w-full mt-8 bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-text-primary">
                    Ansök nu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ansökan */}
      <section id="ansok" className="section-spacing bg-bg-dark text-text-light scroll-mt-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-cta-hover/20 blur-3xl rounded-full z-0" />
        <div aria-hidden className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 bg-cta-hover/10 blur-3xl rounded-full z-0" />
        <div className="container-custom max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-text-light/80 text-xs font-bold tracking-widest uppercase mb-6">
              Ansök till {job.title.toLowerCase()}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">Redo att söka?</h2>
            <p className="text-text-light/70 text-lg">Fyll i formuläret och bifoga gärna ditt CV. Det tar bara någon minut.</p>
          </div>
          <JobApplicationForm defaultRole={job.title} lockRole />

          <p className="text-center mt-8 text-text-light/70">
            Vill du se andra tjänster?{" "}
            <Link to="/jobba-hos-oss" className="text-cta-hover font-medium hover:underline">Alla lediga tjänster</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
