import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, User } from "lucide-react";
import Logo from "./Logo";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../translations";
import CookieConsent from "./CookieConsent";
import StickyCTA from "./StickyCTA";
import ChatWidget from "./ChatWidget";
import FooterNewsletter from "./FooterNewsletter";
import UspMarquee from "./UspMarquee";
import LiveBookingToast from "./LiveBookingToast";
import { capturePartnerRefOnLoad, migrateRefOnConsent } from "../utils/partnerRef";
import { bookingUrl, installBookingLinkInterceptor } from "../utils/bookingUrl";

// Barnpassnings-relaterade sidor ska inte visa städnings-notiser (rabattpopup,
// live-bokningstoast, mobil städ-CTA) eftersom de är irrelevanta där.
const BABYSITTING_PREFIXES = [
  "/barnpassning",
  "/barnvakt",
  "/nanny",
  "/jobba-som-barnvakt",
  "/foretag-barnpassning",
  "/ny-kund",
  "/bli-kund",
  "/ansok-barnvakt",
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const { pathname } = useLocation();
  const isBabysittingPage = BABYSITTING_PREFIXES.some((p) => pathname.startsWith(p));

  // Influencerspårning. Webbplatsen BÄR bara referensen vidare till
  // boka.stodona.se — ingen provision, ingen partnerdata och ingen rabatt
  // beräknas här. Interceptorn är ett säkerhetsnät för bokningslänkar som
  // skrivits som fri text (t.ex. i bloggartiklar) och därför inte går genom
  // hjälpfunktionen `bookingUrl()`.
  useEffect(() => {
    capturePartnerRefOnLoad();
    migrateRefOnConsent();
    return installBookingLinkInterceptor();
  }, []);
  // Dold influencer-sida: dölj publika kampanj-overlays (15%-remsa/popup, boknotiser)
  // så den exklusiva känslan bevaras och inte krockar med 50%-erbjudandet.
  const isInfluencerPage = pathname.startsWith("/influencersamarbete");

  // På barnpassningssidorna visar vi barnpassnings-nav istället för städtjänster.
  const navItems = isBabysittingPage
    ? [
        { to: "/", label: "Hemservice" },
        { to: "/barnpassning", label: "Barnpassning för privatpersoner" },
        { to: "/barnpassning-foretag", label: "Barnpassning för företag" },
      ]
    : [
        { to: "/hemstadning", label: t("nav.hemstadning", lang) },
        { to: "/storstadning", label: t("nav.storstadning", lang) },
        { to: "/fonsterputsning", label: t("nav.fonsterputsning", lang) },
        { to: "/flyttstadning", label: t("nav.flyttstadning", lang) },
        { to: "/foretagsstadning", label: t("nav.foretagsstadning", lang) },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* USP-remsan ligger allra överst på startsidan – ovanför menyn. Den
          ligger i flödet och rullar alltså bort med sidan, medan headern
          fastnar i toppen som förut. */}
      {pathname === "/" && <UspMarquee />}
      <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-text-primary/10">
        {/* Loggan står centrerad överst och menyn på egen rad under den, med
            bokningsknappen i samma rad som menylänkarna. Kontaktikonerna och
            språkvalet ligger i högerkanten av logotypraden så att menyraden
            kan hållas centrerad. */}
        <div className="container-custom py-4 md:py-5">
          <div className="relative flex items-center justify-center">
            <Link to="/" className="block">
              <Logo />
            </Link>

            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-4">
              <a
                href="tel:0101780150"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Ring oss: 010-178 01 50"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@stodona.se"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Mejla oss: info@stodona.se"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://stodona.twportal.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Kundportal"
              >
                <User className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1 text-xs font-semibold pl-4 border-l border-text-primary/10">
                <button
                  onClick={() => setLang('SV')}
                  className={`transition-colors ${lang === 'SV' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  SV
                </button>
                <span className="text-text-primary/30">/</span>
                <button
                  onClick={() => setLang('EN')}
                  className={`transition-colors ${lang === 'EN' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <button
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-7 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium hover:text-cta-hover transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {isBabysittingPage ? (
              <Link to="/ny-kund" className="btn-primary py-2 px-5 text-sm">
                Boka/Se upplägg
              </Link>
            ) : (
              <a href={bookingUrl()} className="btn-primary py-2 px-5 text-sm">
                {t('nav.boka', lang)}
              </a>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-bg-primary border-b border-text-primary/10 p-6 flex flex-col gap-4 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-6 pt-4 border-t border-text-primary/10 mt-2">
              <a
                href="tel:0101780150"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Ring oss: 010-178 01 50"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@stodona.se"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Mejla oss: info@stodona.se"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://stodona.twportal.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-cta-hover transition-colors flex items-center gap-2"
                title="Kundportal"
              >
                <User className="w-5 h-5" />
              </a>
            </div>

            {isBabysittingPage ? (
              <Link
                to="/ny-kund"
                className="btn-primary w-full mt-4 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Boka/Se upplägg
              </Link>
            ) : (
              <a
                href={bookingUrl()}
                className="btn-primary w-full mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.boka', lang)}
              </a>
            )}
            <div className="flex items-center justify-center gap-2 text-sm font-semibold mt-4">
              <button
                onClick={() => setLang('SV')}
                className={`transition-colors ${lang === 'SV' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                SV
              </button>
              <span className="text-text-primary/30">/</span>
              <button
                onClick={() => setLang('EN')}
                className={`transition-colors ${lang === 'EN' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                EN
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-bg-dark text-text-light py-12 sm:py-20">
        <div className="container-custom grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Logo dark={true} className="mb-4 sm:mb-6" />
            <p className="text-text-light/70 text-sm leading-relaxed">
              {t('footer.description', lang)}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-wider text-text-light/50">
              {t('footer.services', lang)}
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              {isBabysittingPage ? (
                <>
                  <li>
                    <Link to="/barnpassning" className="hover:text-cta-hover transition-colors">
                      Barnpassning
                    </Link>
                  </li>
                  <li>
                    <Link to="/barnpassning-foretag" className="hover:text-cta-hover transition-colors">
                      Barnpassning för företag
                    </Link>
                  </li>
                  <li>
                    <Link to="/jobba-som-barnvakt" className="hover:text-cta-hover transition-colors">
                      Jobba som barnvakt
                    </Link>
                  </li>
                  <li>
                    <Link to="/ny-kund" className="hover:text-cta-hover transition-colors">
                      Bli kund
                    </Link>
                  </li>
                  <li>
                    <Link to="/" className="hover:text-cta-hover transition-colors">
                      Hemservice &amp; städning
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/hemstadning" className="hover:text-cta-hover transition-colors">
                      {t('footer.hemstadning', lang)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/flyttstadning" className="hover:text-cta-hover transition-colors">
                      {t('footer.flyttstadning', lang)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/foretagsstadning" className="hover:text-cta-hover transition-colors">
                      {t('footer.foretagsstadning', lang)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/storstadning" className="hover:text-cta-hover transition-colors">
                      {t('footer.storstadning', lang)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/fonsterputsning" className="hover:text-cta-hover transition-colors">
                      {t('footer.fonsterputsning', lang)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/byggstadning" className="hover:text-cta-hover transition-colors">
                      {t('footer.byggstadning', lang)}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          {/* Företagslänkarna delade i två spalter – listan blev annars
              dubbelt så lång som de andra och drog ut hela footern. */}
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-wider text-text-light/50">
              {t('footer.company', lang)}
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/om-oss" className="hover:text-cta-hover transition-colors">
                  {t('footer.omoss', lang)}
                </Link>
              </li>
              <li>
                <Link to="/sa-arbetar-vi" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Så arbetar vi' : 'How we work'}
                </Link>
              </li>
              <li>
                <Link to="/kvalitet-och-trygghet" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Kvalitet & trygghet' : 'Quality & security'}
                </Link>
              </li>
              <li>
                <Link to="/jobba-hos-oss" className="hover:text-cta-hover transition-colors">
                  {t('footer.jobba', lang)}
                </Link>
              </li>
              <li>
                <Link to="/samarbeten-och-affiliate" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Samarbeten och affiliate' : 'Partnerships & affiliate'}
                </Link>
              </li>
              <li>
                <Link to="/blogg" className="hover:text-cta-hover transition-colors">
                  Blogg
                </Link>
              </li>
              <li>
                <Link to="/recensioner" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Recensioner' : 'Reviews'}
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="hover:text-cta-hover transition-colors">
                  {t('footer.kontakt', lang)}
                </Link>
              </li>
              <li>
                <Link to="/visselblasning" className="hover:text-cta-hover transition-colors">
                  {t('footer.visselblasning', lang)}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-wider text-text-light/50">
              {lang === 'SV' ? 'För dig som kund' : 'For customers'}
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a href={bookingUrl()} className="hover:text-cta-hover transition-colors">
                  {t('footer.priser', lang)}
                </a>
              </li>
              <li>
                <Link to="/stadabonnemang" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Städabonnemang' : 'Cleaning subscription'}
                </Link>
              </li>
              <li>
                <Link to="/rut-avdrag" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'RUT-avdrag' : 'RUT deduction'}
                </Link>
              </li>
              <li>
                <Link to="/kundportalen" className="hover:text-cta-hover transition-colors">
                  {t('footer.kundportalen', lang)}
                </Link>
              </li>
              <li>
                <Link to="/e-faktura" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'E-faktura' : 'E-invoice'}
                </Link>
              </li>
              <li>
                <Link to="/avbokning" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Avbokning' : 'Cancellation'}
                </Link>
              </li>
              <li>
                <Link to="/byta-stadbolag" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Byta städbolag' : 'Switch cleaning company'}
                </Link>
              </li>
              <li>
                <Link to="/presentkort" className="hover:text-cta-hover transition-colors">
                  {lang === 'SV' ? 'Presentkort' : 'Gift cards'}
                </Link>
              </li>
              <li>
                <Link to="/varva-en-van" className="hover:text-cta-hover transition-colors">
                  {t('footer.varvaenvan', lang)}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-cta-hover transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-wider text-text-light/50">
              {t('footer.contact', lang)}
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-text-light/70">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-cta-hover" />
                </div>
                <a href="tel:0101780150" className="hover:text-cta-hover transition-colors">
                  010-178 01 50
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-cta-hover" />
                </div>
                <a href="mailto:info@stodona.se" className="hover:text-cta-hover transition-colors">
                  info@stodona.se
                </a>
              </li>
              <li className="flex items-center gap-3 mt-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-cta-hover" />
                </div>
                <a href="https://stodona.twportal.se/" target="_blank" rel="noopener noreferrer" className="hover:text-cta-hover transition-colors">
                  {t('footer.kundportal', lang)}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <FooterNewsletter />
            </div>
          </div>
        </div>
        <div className="container-custom mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-text-light/10 flex flex-col md:flex-row items-center justify-between text-xs text-text-light/50 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Stodona. {t('footer.rights', lang)}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2 md:mt-0">
            <Link to="/integritetspolicy" className="hover:text-text-light">
              {t('footer.integritetspolicy', lang)}
            </Link>
            <Link to="/villkor" className="hover:text-text-light">
              {t('footer.villkor', lang)}
            </Link>
            <Link to="/cookie-policy" className="hover:text-text-light">
              {t('footer.cookiepolicy', lang)}
            </Link>
            <Link to="/sidkarta" className="hover:text-text-light">
              {t('footer.sidkarta', lang)}
            </Link>
          </div>
        </div>
      </footer>
      <CookieConsent />
      {!isInfluencerPage && <ChatWidget />}
      {!isBabysittingPage && !isInfluencerPage && (
        <>
          <StickyCTA />
          <LiveBookingToast />
        </>
      )}
    </div>
  );
}
