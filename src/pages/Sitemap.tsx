import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Map as MapIcon, 
  ChevronRight, 
  Home, 
  Sparkles, 
  Info, 
  Phone, 
  ShieldCheck,
  MapPin,
  BookOpen,
  HelpCircle,
  Star,
  FileText
} from "lucide-react";
import { SERVICE_AREAS, SERVICE_CARDS } from "../constants";
import { Helmet } from "react-helmet-async";

export default function Sitemap() {
  const mainPages = [
    { name: "Startsida", path: "/", icon: Home },
    { name: "Om oss", path: "/om-oss", icon: Info },
    { name: "Kontakt", path: "/kontakt", icon: Phone },
    { name: "Boka städning", path: "https://boka.stodona.se", icon: Sparkles },
    { name: "Kundportalen", path: "/kundportalen", icon: ShieldCheck },
    { name: "Blogg", path: "/blogg", icon: BookOpen },
    { name: "FAQ", path: "/faq", icon: HelpCircle },
    { name: "Recensioner", path: "/recensioner", icon: Star },
    { name: "Värva en vän", path: "/varva-en-van", icon: Sparkles },
  ];

  const legalPages = [
    { name: "Integritetspolicy", path: "/integritetspolicy" },
    { name: "Villkor", path: "/villkor" },
    { name: "Cookie Policy", path: "/cookie-policy" },
    { name: "Visselblåsning", path: "/visselblasning" },
  ];

  const serviceNames: Record<string, string> = {
    hemstadning: 'Hemstädning',
    fonsterputsning: 'Fönsterputsning',
    flyttstadning: 'Flyttstädning',
    storstadning: 'Storstädning',
    foretagsstadning: 'Företagsstädning',
    byggstadning: 'Byggstädning',
    trappstadning: 'Trappstädning',
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Sidkarta | Stodona – Alla sidor</title>
        <meta name="description" content="Komplett sidkarta för Stodona. Hitta alla tjänster, områden och sidor." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden bg-bg-dark text-text-light">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6"
            >
              Sid<span className="italic font-normal text-cta-hover">karta</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-light/80 max-w-2xl leading-relaxed"
            >
              Översikt över alla sidor på stodona.se. Navigera enkelt mellan tjänster och lokala områden.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="section-spacing bg-white">
        <div className="container-custom">

          {/* Row 1: Main Pages + Services + Legal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            {/* Main Pages */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-xl font-bold">Huvudsidor</h2>
              </div>
              <ul className="space-y-2.5">
                {mainPages.map((page) => (
                  <li key={page.path}>
                    {page.path.startsWith('http') ? (
                      <a 
                        href={page.path}
                        className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group text-sm"
                      >
                        <page.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        <span>{page.name}</span>
                      </a>
                    ) : (
                      <Link 
                        to={page.path}
                        className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group text-sm"
                      >
                        <page.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        <span>{page.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-xl font-bold">Våra tjänster</h2>
              </div>
              <ul className="space-y-2.5">
                {SERVICE_CARDS.map((service) => (
                  <li key={service.link}>
                    <Link 
                      to={service.link}
                      className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group text-sm"
                    >
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      <span>{service.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-xl font-bold">Juridiskt</h2>
              </div>
              <ul className="space-y-2.5">
                {legalPages.map((page) => (
                  <li key={page.path}>
                    <Link 
                      to={page.path}
                      className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group text-sm"
                    >
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      <span>{page.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-text-primary/10 mb-16" />

          {/* Row 2: Areas - Full width grid */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-text-primary" />
              </div>
              <h2 className="text-xl font-bold">Områden vi verkar i</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SERVICE_AREAS.map((area) => (
                <div key={area.path} className="bg-bg-primary rounded-xl p-5 hover:shadow-md transition-shadow">
                  <Link 
                    to={`/stadning-${area.path}`}
                    className="flex items-center gap-2 text-text-primary hover:text-cta-hover transition-colors group font-bold text-sm mb-3"
                  >
                    <MapPin className="w-4 h-4 text-cta-hover shrink-0" />
                    <span>{area.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ml-auto" />
                  </Link>
                  <div className="space-y-1 pl-6">
                    {Object.entries(serviceNames).map(([slug, name]) => (
                      <Link
                        key={`${slug}-${area.path}`}
                        to={`/${slug}-${area.path}`}
                        className="block text-text-secondary hover:text-cta-hover transition-colors text-xs leading-relaxed"
                      >
                        {name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
