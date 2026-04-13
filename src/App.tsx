/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LanguageProvider } from "./context/LanguageContext";
import PlaceholderPage from "./components/PlaceholderPage";

// Lazy loaded pages to enable code splitting
const Home = React.lazy(() => import("./pages/Home"));
const Hemstadning = React.lazy(() => import("./pages/Hemstadning"));
const Flyttstadning = React.lazy(() => import("./pages/Flyttstadning"));
const Storstadning = React.lazy(() => import("./pages/Storstadning"));
const Foretagsstadning = React.lazy(() => import("./pages/Foretagsstadning"));
const Byggstadning = React.lazy(() => import("./pages/Byggstadning"));
const Fonsterputsning = React.lazy(() => import("./pages/Fonsterputsning"));
const Trappstadning = React.lazy(() => import("./pages/Trappstadning"));
const Bodstadning = React.lazy(() => import("./pages/Bodstadning"));
const OmOss = React.lazy(() => import("./pages/OmOss"));
const JobbaHosOss = React.lazy(() => import("./pages/JobbaHosOss"));
const Kontakt = React.lazy(() => import("./pages/Kontakt"));
const Boka = React.lazy(() => import("./pages/Boka"));
const BokaStadning = React.lazy(() => import("./pages/BokaStadning"));
const VarvaEnVan = React.lazy(() => import("./pages/VarvaEnVan"));
const Kundportal = React.lazy(() => import("./pages/Kundportal"));
const Visselblasning = React.lazy(() => import("./pages/Visselblasning"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const Integritetspolicy = React.lazy(() => import("./pages/Integritetspolicy"));
const Villkor = React.lazy(() => import("./pages/Villkor"));
const Sitemap = React.lazy(() => import("./pages/Sitemap"));
const LocalSeoPage = React.lazy(() => import("./pages/LocalSeoPage"));
const StadningArea = React.lazy(() => import("./pages/StadningArea"));
const Blogg = React.lazy(() => import("./pages/Blogg"));
const BloggPost = React.lazy(() => import("./pages/BloggPost"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Kundrecensioner = React.lazy(() => import("./pages/Kundrecensioner"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AdminLeads = React.lazy(() => import("./pages/AdminLeads"));
const Priser = React.lazy(() => import("./pages/Priser"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 rounded-full border-4 border-text-primary/10 border-t-cta-hover animate-spin"></div>
  </div>
);
import { SERVICE_AREAS, SUB_AREAS_NACKA, SUB_AREAS_EKERO, SUB_AREAS_LIDINGO } from "./constants";
import ScrollToTop from "./components/ScrollToTop";

// All service types to generate routes for
const ALL_SERVICES = ['hemstadning', 'flyttstadning', 'foretagsstadning', 'fonsterputsning', 'storstadning', 'byggstadning', 'trappstadning', 'stadfirma'];

// Map area paths to their sub-areas
const SUB_AREA_MAP: Record<string, typeof SUB_AREAS_EKERO> = {
  ekero: SUB_AREAS_EKERO,
  lidingo: SUB_AREAS_LIDINGO,
  nacka: SUB_AREAS_NACKA,
};

function getSubAreasForService(areaPath: string, service: string) {
  const subAreas = SUB_AREA_MAP[areaPath];
  if (!subAreas) return [];
  // Nacka sub-areas don't use area prefix in path
  const prefix = areaPath === 'nacka' ? `/${service}-` : `/${service}-${areaPath}-`;
  return subAreas.map(sub => ({ ...sub, link: `${prefix}${sub.path}` }));
}

export default function App() {
  return (
    <LanguageProvider>
      <ScrollToTop />
      <Layout>
        <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hemstadning" element={<Hemstadning />} />
          <Route path="/flyttstadning" element={<Flyttstadning />} />
          <Route path="/storstadning" element={<Storstadning />} />
          <Route path="/foretagsstadning" element={<Foretagsstadning />} />
          <Route path="/byggstadning" element={<Byggstadning />} />
          <Route path="/fonsterputsning" element={<Fonsterputsning />} />
          <Route path="/trappstadning" element={<Trappstadning />} />
          <Route path="/bodstadning" element={<Bodstadning />} />
          <Route path="/om-oss" element={<OmOss />} />
          <Route path="/jobba-hos-oss" element={<JobbaHosOss />} />
          <Route path="/boka" element={<Boka />} />
          <Route path="/boka-stadning" element={<BokaStadning />} />
          <Route path="/priser" element={<Priser />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/kundportalen" element={<Kundportal />} />
          <Route path="/varva-en-van" element={<VarvaEnVan />} />
          <Route path="/visselblasning" element={<Visselblasning />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/integritetspolicy" element={<Integritetspolicy />} />
          <Route path="/villkor" element={<Villkor />} />
          <Route path="/sidkarta" element={<Sitemap />} />
          <Route path="/blogg" element={<Blogg />} />
          <Route path="/blogg/:slug" element={<BloggPost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/vanliga-fragor" element={<FAQ />} />
          <Route path="/recensioner" element={<Kundrecensioner />} />

          {/* Admin (without layout) */}
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* === AREA SEO PAGES === */}
          {SERVICE_AREAS.map((area) => (
            <React.Fragment key={`area-${area.path}`}>
              {/* Short URL — e.g. /ekero */}
              <Route
                path={`/${area.path}`}
                element={
                  <LocalSeoPage
                    baseService="hemstadning"
                    areaName={area.name}
                    description={area.description}
                    heroImage={area.heroImage}
                    subAreas={area.subAreas}
                  />
                }
              />

              {/* Hub page — e.g. /stadning-ekero */}
              <Route
                path={`/stadning-${area.path}`}
                element={
                  <StadningArea
                    areaName={area.name}
                    heroImage={area.heroImage}
                    subAreas={getSubAreasForService(area.path, 'hemstadning')}
                  />
                }
              />

              {/* All service types — e.g. /hemstadning-ekero, /fonsterputsning-lidingo */}
              {ALL_SERVICES.map((service) => (
                <Route
                  key={`${service}-${area.path}`}
                  path={`/${service}-${area.path}`}
                  element={
                    <LocalSeoPage
                      baseService={service}
                      areaName={area.name}
                      description={area.description}
                      heroImage={area.heroImage}
                      subAreas={getSubAreasForService(area.path, service)}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}

          {/* === SUB-AREA ROUTES === */}
          {/* Ekerö sub-areas — all services */}
          {SUB_AREAS_EKERO.map((subArea) => (
            <React.Fragment key={`ekero-sub-${subArea.path}`}>
              {ALL_SERVICES.map((service) => (
                <Route
                  key={`${service}-ekero-${subArea.path}`}
                  path={`/${service}-ekero-${subArea.path}`}
                  element={
                    <LocalSeoPage
                      baseService={service}
                      areaName={subArea.name}
                      description={subArea.description}
                      heroImage={subArea.heroImage}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}

          {/* Lidingö sub-areas — all services */}
          {SUB_AREAS_LIDINGO.map((subArea) => (
            <React.Fragment key={`lidingo-sub-${subArea.path}`}>
              {ALL_SERVICES.map((service) => (
                <Route
                  key={`${service}-lidingo-${subArea.path}`}
                  path={`/${service}-lidingo-${subArea.path}`}
                  element={
                    <LocalSeoPage
                      baseService={service}
                      areaName={subArea.name}
                      description={subArea.description}
                      heroImage={subArea.heroImage}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}

          {/* Nacka sub-areas — all services */}
          {SUB_AREAS_NACKA.map((subArea) => (
            <React.Fragment key={`nacka-sub-${subArea.path}`}>
              {ALL_SERVICES.map((service) => (
                <Route
                  key={`${service}-${subArea.path}`}
                  path={`/${service}-${subArea.path}`}
                  element={
                    <LocalSeoPage
                      baseService={service}
                      areaName={subArea.name}
                      description={subArea.description}
                      heroImage={subArea.heroImage}
                    />
                  }
                />
              ))}
            </React.Fragment>
          ))}

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </React.Suspense>
      </Layout>
    </LanguageProvider>
  );
}
