import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import type { ClubConfig } from "./content/types";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/blocks.css";
import "./sections/sections.css";
import "./sections/chrome/chrome.css";
import "./admin/composer.css";
import "./admin/admin-console.css";
import "./styles/migrations.css";

/**
 * Publish-time-baked pages ship the club config that produced them in a script tag,
 * so the first client render can start from the same data the server used and adopt
 * the existing DOM instead of throwing it away and re-rendering from empty.
 *
 * Anything else — a draft club, a page with no cache row, the admin — has no payload
 * and takes the original createRoot path unchanged.
 */
function readBakedClub(): ClubConfig | undefined {
  const el = document.getElementById("sw1-hydration-data");
  if (!el?.textContent) return undefined;
  try {
    return JSON.parse(el.textContent) as ClubConfig;
  } catch {
    // A malformed payload must not white-screen the site; fall back to fetching.
    return undefined;
  }
}

const rootEl = document.getElementById("root")!;
const bakedClub = readBakedClub();

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App initialClub={bakedClub} />
    </BrowserRouter>
  </React.StrictMode>
);

// Only hydrate when there is actually server markup to adopt; hydrating an empty
// container is a mismatch by definition.
if (bakedClub && rootEl.firstChild) {
  ReactDOM.hydrateRoot(rootEl, tree);
} else {
  ReactDOM.createRoot(rootEl).render(tree);
}
