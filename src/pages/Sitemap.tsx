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
  MapPin
} from "lucide-react";
import { SERVICE_AREAS, SERVICE_CARDS } from "../constants";

export default function Sitemap() {
  const mainPages = [
    { name: "Startsida", path: "/", icon: Home },
    { name: "Om oss", path: "/om-oss", icon: Info },
    { name: "Kontakt", path: "/kontakt", icon: Phone },
    { name: "Boka städning", path: "/boka-stadning", icon: Sparkles },
    { name: "Kundportalen", path: "/kundportalen", icon: ShieldCheck },
    { name: "Värva en vän", path: "/varva-en-van", icon: Sparkles },
    { name: "Visselblåsning", path: "/visselblasning", icon: ShieldCheck },
    { name: "Cookie Policy", path: "/cookie-policy", icon: Info },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-bg-dark text-text-light">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
            >
              Sidkarta <span className="italic font-normal text-cta-hover">Stodona</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-text-light/80 mb-10 max-w-2xl leading-relaxed"
            >
              Här hittar du en översikt över alla sidor på vår webbplats. Navigera enkelt mellan våra tjänster och lokala områden.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Main Pages */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Huvudsidor</h2>
              </div>
              <ul className="space-y-3">
                {mainPages.map((page) => (
                  <li key={page.path}>
                    <Link 
                      to={page.path}
                      className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group"
                    >
                      <page.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      <span>{page.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Våra tjänster</h2>
              </div>
              <ul className="space-y-3">
                {SERVICE_CARDS.map((service) => (
                  <li key={service.link}>
                    <Link 
                      to={service.link}
                      className="flex items-center gap-2 text-text-secondary hover:text-cta-hover transition-colors group"
                    >
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      <span>{service.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Areas */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Områden</h2>
              </div>
              <div className="space-y-4">
                {SERVICE_AREAS.map((area) => (
                  <div key={area.path}>
                    <Link 
                      to={`/stadning-${area.path}`}
                      className="flex items-center gap-2 text-text-primary hover:text-cta-hover transition-colors group font-medium mb-1"
                    >
                      <MapPin className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                      <span>Städning {area.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                    <div className="pl-6 space-y-0.5">
                      {['hemstadning', 'fonsterputsning', 'flyttstadning', 'storstadning', 'foretagsstadning', 'byggstadning', 'trappstadning'].map((service) => {
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
                          <Link
                            key={`${service}-${area.path}`}
                            to={`/${service}-${area.path}`}
                            className="flex items-center gap-1 text-text-secondary hover:text-cta-hover transition-colors text-xs"
                          >
                            <ChevronRight className="w-3 h-3 opacity-30" />
                            <span>{serviceNames[service]} {area.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
