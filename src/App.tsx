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
import PlaceholderPage from "./components/PlaceholderPage";
import { SERVICE_AREAS, SUB_AREAS_NACKA, SUB_AREAS_EKERO, SUB_AREAS_LIDINGO } from "./constants";
import ScrollToTop from "./components/ScrollToTop";

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

          {/* Local SEO Pages (Short URLs) */}
          {SERVICE_AREAS.map((area) => (
            <Route
              key={`short-${area.path}`}
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
          ))}

          {/* Local SEO Pages (Dynamic) */}
          {SERVICE_AREAS.map((area) => (
            <React.Fragment key={area.path}>
              <Route
                path={`/hemstadning-${area.path}`}
                element={
                  <LocalSeoPage
                    baseService="hemstadning"
                    areaName={area.name}
                    description={area.description}
                    heroImage={area.heroImage}
                    subAreas={area.path === "nacka" ? SUB_AREAS_NACKA.map(sub => ({ ...sub, link: `/hemstadning-${sub.path}` })) : (area.path === "ekero" ? SUB_AREAS_EKERO.map(sub => ({ ...sub, link: `/hemstadning-ekero-${sub.path}` })) : (area.path === "lidingo" ? SUB_AREAS_LIDINGO.map(sub => ({ ...sub, link: `/hemstadning-lidingo-${sub.path}` })) : []))}
                  />
                }
              />
              <Route
                path={`/flyttstadning-${area.path}`}
                element={
                  <LocalSeoPage
                    baseService="flyttstadning"
                    areaName={area.name}
                    description={area.description}
                    heroImage={area.heroImage}
                    subAreas={area.path === "nacka" ? SUB_AREAS_NACKA.map(sub => ({ ...sub, link: `/flyttstadning-${sub.path}` })) : (area.path === "ekero" ? SUB_AREAS_EKERO.map(sub => ({ ...sub, link: `/flyttstadning-ekero-${sub.path}` })) : (area.path === "lidingo" ? SUB_AREAS_LIDINGO.map(sub => ({ ...sub, link: `/flyttstadning-lidingo-${sub.path}` })) : []))}
                  />
                }
              />
              <Route
                path={`/foretagsstadning-${area.path}`}
                element={
                  <LocalSeoPage
                    baseService="foretagsstadning"
                    areaName={area.name}
                    description={area.description}
                    heroImage={area.heroImage}
                    subAreas={area.path === "nacka" ? SUB_AREAS_NACKA.map(sub => ({ ...sub, link: `/foretagsstadning-${sub.path}` })) : (area.path === "ekero" ? SUB_AREAS_EKERO.map(sub => ({ ...sub, link: `/foretagsstadning-ekero-${sub.path}` })) : (area.path === "lidingo" ? SUB_AREAS_LIDINGO.map(sub => ({ ...sub, link: `/foretagsstadning-lidingo-${sub.path}` })) : []))}
                  />
                }
              />
            </React.Fragment>
          ))}

          {/* Ekerö Sub-area Routes for Hemstädning */}
          {SUB_AREAS_EKERO.map((subArea) => (
            <Route

              path={`/hemstadning-ekero-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="hemstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Ekerö Sub-area Routes for Flyttstädning */}
          {SUB_AREAS_EKERO.map((subArea) => (
            <Route

              path={`/flyttstadning-ekero-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="flyttstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Ekerö Sub-area Routes for Företagsstädning */}
          {SUB_AREAS_EKERO.map((subArea) => (
            <Route

              path={`/foretagsstadning-ekero-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="foretagsstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Lidingö Sub-area Routes for Hemstädning */}
          {SUB_AREAS_LIDINGO.map((subArea) => (
            <Route

              path={`/hemstadning-lidingo-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="hemstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Lidingö Sub-area Routes for Flyttstädning */}
          {SUB_AREAS_LIDINGO.map((subArea) => (
            <Route

              path={`/flyttstadning-lidingo-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="flyttstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Lidingö Sub-area Routes for Företagsstädning */}
          {SUB_AREAS_LIDINGO.map((subArea) => (
            <Route

              path={`/foretagsstadning-lidingo-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="foretagsstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Nacka Sub-area Routes for Hemstädning */}
          {SUB_AREAS_NACKA.map((subArea) => (
            <Route
              path={`/hemstadning-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="hemstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Nacka Sub-area Routes for Flyttstädning */}
          {SUB_AREAS_NACKA.map((subArea) => (
            <Route
              path={`/flyttstadning-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="flyttstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}

          {/* Nacka Sub-area Routes for Företagsstädning */}
          {SUB_AREAS_NACKA.map((subArea) => (
            <Route
              path={`/foretagsstadning-${subArea.path}`}
              element={
                <LocalSeoPage
                  baseService="foretagsstadning"
                  areaName={subArea.name}
                  description={subArea.description}
                  heroImage={subArea.heroImage}
                />
              }
            />
          ))}
        </Routes>
      </Layout>
    </LanguageProvider>
  );
}
