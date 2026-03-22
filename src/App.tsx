/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import Hemstadning from "./pages/Hemstadning";
import Flyttstadning from "./pages/Flyttstadning";
import Storstadning from "./pages/Storstadning";
import Foretagsstadning from "./pages/Foretagsstadning";
import Byggstadning from "./pages/Byggstadning";
import Fonsterputsning from "./pages/Fonsterputsning";
import Trappstadning from "./pages/Trappstadning";
import Bodstadning from "./pages/Bodstadning";
import OmOss from "./pages/OmOss";
import Kontakt from "./pages/Kontakt";
import Boka from "./pages/Boka";
import BokaStadning from "./pages/BokaStadning";
import VarvaEnVan from "./pages/VarvaEnVan";
import Kundportal from "./pages/Kundportal";
import Visselblasning from "./pages/Visselblasning";
import CookiePolicy from "./pages/CookiePolicy";
import Integritetspolicy from "./pages/Integritetspolicy";
import Villkor from "./pages/Villkor";
import Sitemap from "./pages/Sitemap";
import LocalSeoPage from "./pages/LocalSeoPage";
import StadningArea from "./pages/StadningArea";
import Blogg from "./pages/Blogg";
import BloggPost from "./pages/BloggPost";
import FAQ from "./pages/FAQ";
import Kundrecensioner from "./pages/Kundrecensioner";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./components/PlaceholderPage";
import { SERVICE_AREAS, SUB_AREAS_NACKA, SUB_AREAS_EKERO, SUB_AREAS_LIDINGO } from "./constants";
import ScrollToTop from "./components/ScrollToTop";

// All service types to generate routes for
const ALL_SERVICES = ['hemstadning', 'flyttstadning', 'foretagsstadning', 'fonsterputsning', 'storstadning', 'byggstadning', 'trappstadning'];

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
          <Route path="/boka" element={<Boka />} />
          <Route path="/boka-stadning" element={<BokaStadning />} />
          <Route
            path="/priser"
            element={
              <PlaceholderPage
                title="Priser"
                description="Se våra transparenta priser för alla tjänster. Sidan är under uppbyggnad."
              />
            }
          />
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
      </Layout>
    </LanguageProvider>
  );
}
