import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ClubContext } from "./components/ClubContext";
import { AuthProvider } from "./lib/auth";
import { EditProvider } from "./lib/edit";
import { EditToggle } from "./components/edit/Editable";
import type { ClubConfig, DesignVariant } from "./content/types";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { BackToTop } from "./components/layout/BackToTop";
import { MobileTabBar } from "./components/layout/MobileTabBar";
import { AnnouncementBar } from "./components/blocks/AnnouncementBar";
import { TrialBanner } from "./components/blocks/TrialBanner";
import { AppPrompts } from "./components/pwa/AppPrompts";
import { SitePulseWidget } from "./components/SitePulseWidget";

import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Teams } from "./pages/Teams";
import { Sport } from "./pages/Sport";
import { Program } from "./pages/Program";
import { Fixtures } from "./pages/Fixtures";
import { News } from "./pages/News";
import { NewsArticle } from "./pages/NewsArticle";
import { Events } from "./pages/Events";
import { EventDetail } from "./pages/EventDetail";
import { Sponsors } from "./pages/Sponsors";
import { Documents } from "./pages/Documents";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";
import { SeoManager } from "./lib/seo";

/** Scroll to top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export interface PublicSiteProps {
  club: ClubConfig;
  variant: DesignVariant;
  setVariant: (v: DesignVariant) => void;
}

/**
 * The public club site: chrome + route tree, and nothing else.
 *
 * Pure by contract — no data fetching, no browser globals at render time — so the
 * same tree renders in the browser (App) and under renderToString in Node (the
 * publish-time bake). Anything host- or session-dependent stays in App.tsx.
 */
export function PublicSite({ club, variant, setVariant }: PublicSiteProps) {
  return (
    <AuthProvider>
      <ClubContext.Provider value={{ club, variant, setVariant }}>
        <EditProvider>
          <a href="#main" className="sw-skip">
            Skip to content
          </a>
          <ScrollToTop />
          <SeoManager />
          {club.previewMode ? (
            <div className="sw-draftbar" role="status">
              Preview — this site is not yet public. You're viewing a shared draft for review.
            </div>
          ) : club.websiteStatus && club.websiteStatus !== "published" ? (
            <div className="sw-draftbar" role="status">
              Draft preview — not visible to the public yet
            </div>
          ) : null}
          <TrialBanner />
          <AnnouncementBar />
          <Header />
          <main id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/football" element={<Sport sport="Football" />} />
              <Route path="/netball" element={<Sport sport="Netball" />} />
              <Route path="/program/:slug" element={<Program />} />
              <Route path="/fixtures" element={<Fixtures />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsArticle />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <BackToTop />
          <MobileTabBar />
          <AppPrompts />
          {/* On-page inline editor: floating Edit/Publish toggle for a signed-in admin on their own club. */}
          <EditToggle />
          {/* Public-site feedback widget (SitePulse). Draft -> everyone; published -> admins only. */}
          <SitePulseWidget clubId={club.clubId} websiteStatus={club.websiteStatus} />
        </EditProvider>
      </ClubContext.Provider>
    </AuthProvider>
  );
}
