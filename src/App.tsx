import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { club as clubConfig } from "./content/club.config";
import { ClubContext } from "./components/ClubContext";
import type { DesignVariant } from "./content/types";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { VariantSwitcher } from "./components/layout/VariantSwitcher";
import { AnnouncementBar } from "./components/blocks/AnnouncementBar";

import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Teams } from "./pages/Teams";
import { Fixtures } from "./pages/Fixtures";
import { News } from "./pages/News";
import { Events } from "./pages/Events";
import { Sponsors } from "./pages/Sponsors";
import { Documents } from "./pages/Documents";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";

/** Scroll to top on every route change. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [variant, setVariant] = useState<DesignVariant>(clubConfig.variant);

  // Inject brand colours (the only runtime-themed tokens) + active variant.
  useEffect(() => {
    const root = document.documentElement;
    const c = clubConfig.identity.colours;
    root.style.setProperty("--club-ink", c.ink);
    root.style.setProperty("--club-paper", c.paper);
    root.style.setProperty("--club-accent", c.accent);
    root.style.setProperty("--club-silver", c.silver);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-variant", variant);
  }, [variant]);

  return (
    <ClubContext.Provider value={{ club: clubConfig, variant, setVariant }}>
      <a href="#main" className="sw-skip">
        Skip to content
      </a>
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/news" element={<News />} />
          <Route path="/events" element={<Events />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {clubConfig.showVariantSwitcher && <VariantSwitcher />}
    </ClubContext.Provider>
  );
}
