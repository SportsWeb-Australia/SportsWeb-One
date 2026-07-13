# RDCA Website — Handover Notes

_Last updated at service-worker **v33**. Deploy bundle: `rdca-deploy-flat.zip` (60 items, flat — files at zip root)._

This document + the deploy zip are a complete handover. A fresh chat can unzip the bundle into a working directory and continue.

---

## 1. Who / what this is

- **Client:** Carson — Click Sports Media, Melbourne. GitHub org **`SportsWeb-Australia`**.
- **Project:** A static website for the **RDCA (Ringwood & District Cricket Association)** cricket association.
- **Repo:** `SportsWeb-Australia/RDCA-V2` (index.html at repo ROOT).
- **Live URL:** https://rdca-sportsweb-version2.vercel.app (Vercel auto-deploys on push).
- Carson also runs sister projects mentioned in passing: **RDCA T20** site and **BHRDCA** site (both "nearly finished").
- Carson prefers **honest feedback**, **consolidated single-zip deliverables**, and reviews via **screenshots of the live deploy** (which lags local until he uploads).

## 2. Workflow (important)

1. Edits are made locally in the working dir **`/home/claude/rdca/`**.
2. After each batch: **bump the `sw.js` cache version**, rebuild the flat zip, and `present_files`.
3. Carson unzips and does **one upload to GitHub** (files at repo root, `index.html` at root) → Vercel auto-deploys.
4. Carson screenshots the **live** URL and sends back the next round of tweaks.

**Rebuild command (run from `/home/claude/rdca`):**
```bash
# bump version first, e.g. sed -i 's/rdca-v33/rdca-v34/' sw.js
rm -f /mnt/user-data/outputs/rdca-deploy-flat.zip
zip -rq /mnt/user-data/outputs/rdca-deploy-flat.zip . -x "*.DS_Store"
```
Then `present_files` on the zip. The bundle should be ~60 items.

> ⚠️ The container filesystem **resets between sessions**. The zip in `/mnt/user-data/outputs/` persists and IS the source of truth — unzip it to restore the working copy:
> ```bash
> mkdir -p /home/claude/rdca && cd /home/claude/rdca && unzip -oq /mnt/user-data/outputs/rdca-deploy-flat.zip
> ```

## 3. Environment constraints

- **bash network is DISABLED.** Cannot fetch/deploy from here.
- **Social feeds (Instagram/Elfsight, Facebook, TikTok) only render on the live deployed URL**, never locally.
- Validate JS with `node --check file.js`.
- Validate CSS brace balance:
  ```bash
  node -e 'const c=require("fs").readFileSync("_pages.css","utf8");const o=(c.match(/{/g)||[]).length,x=(c.match(/}/g)||[]).length;console.log(o,x,o===x?"OK":"MISMATCH");'
  ```
- Smoke-test a data-driven render fn with a `document`-stub harness (querySelector returns an object with an `innerHTML` setter); note `RDCA` attaches to `window`, so call `window.RDCA.render.<fn>(...)`.
- Extract an inline page `<script>` for checking: `awk '/^<script>$/,/^<\/script>$/' page.html | sed '1d;$d' > /tmp/x.js && node --check /tmp/x.js`.

---

## 4. Architecture

Two page styles:

- **Homepage (`index.html`, ~995 lines)** is **self-contained**: its own inline `<style>` + markup + nav + inline footer. It does NOT load `_shared.css` / `_pages.css` / `site-data.js` / `rdca-render.js` / `rdca-components.js`. **Edit `index.html` directly** for homepage changes.
- **All other pages** load `_shared.css` + `_pages.css`, inject shared chrome via `rdca-components.js` (`<div data-rdca="masthead">`, `sponsor-carousel`, `footer`, etc.), and render data-driven content via `rdca-render.js` reading `window.RDCA_DATA` from `site-data.js`.

### Core files
| File | Role |
|---|---|
| `index.html` | Homepage — **self-contained** inline CSS/HTML. All "Register" CTAs → `/register.html`. |
| `_shared.css` | Design system / tokens. Vars: `--bg:#f0f2f5 --navy:#0d1f3c --navy3:#1e3d6b --red:#cc2222 --muted:#5a6880 --r:14px` etc. |
| `_pages.css` | Page component styles (593/593 braces balanced). |
| `rdca-render.js` | Data-driven render fns (clubs, news, honours, teamSelections, sectionAbout, umpires, etc.). |
| `rdca-components.js` | Shared chrome injector: masthead (+mobile menu), ticker, ad-banner, sponsor-carousel, footer. |
| `site-data.js` | `window.RDCA_DATA` — all content (clubs, news, articles, teamSelections, social, events, players, sections, committees, honours, umpires…). |
| `pwa.js` | PWA install + match-day alerts + injected **back-to-top button** (works all pages). |
| `playhq.js` | PlayHQ embed helper. |
| `sw.js` | Service worker. **Cache name `rdca-vNN` — bump every batch.** Network-first for pages/css/js/json, cache-first for images. |
| `manifest.webmanifest` | PWA manifest. |
| `logos/` | 37 club logos (`.webp`). | `docs/` | PDFs. |

### Design system notes
- **Tabler Icons** webfont (`cdn.jsdelivr … @tabler/icons-webfont@2.44.0`; classes `ti ti-*`). `ti-cricket` is valid and used for Women's.
- Fonts: **Bebas Neue** (display), **DM Sans** (body), **JetBrains Mono** (mono accents).

---

## 5. Current state — recently completed (this run, v24→v33)

- **Registration page** `register.html` created — player registration form (name/email/mobile/section/player-type/club-picker populated from clubs data/consent), "powered by SportsWeb One" panel, "how it works" steps. **All Register CTAs site-wide now point to `/register.html`** (homepage hero/menu/app-grid/top-bar, and the comms "Register with your club / Register your mobile" CTAs). Front-end only — submit shows a confirmation note. **Live submissions → RDCA database is the SportsWeb One integration step (not wired yet).**
- **Social feeds width** — all feeds (IG/Elfsight, FB, TikTok) capped to a shared **500px** (`.soc-feed-col{max-width:500px}`) so Facebook matches Instagram. _FB Page Plugin is hard-capped at 500px by Facebook — cannot exceed it; that's why everything is capped to match._
- **Navy-callout buttons** — added `.callout-navy a.btn,.callout-navy .btn{color:#fff}` so buttons stay crisp white (the `.callout-navy a{color:#ff7a7a}` link colour was tinting them pink). Fixed the umpires "View appointments" button.
- **Footer menu** — replaced **Umpire Appointments** with **Communications** in the footer RDCA column (`rdca-components.js` line ~185). Header dropdown + mobile menu KEEP Umpire Appointments.
- **Advertise-With-Us tag** (homepage `.sw1-promo`) — roomier padding (`14px 16px`) + bigger gap below (`margin-bottom:18px`) so it isn't cramped against the gold EOFY banner.
- **Team-announcement spacing** (`team-selections.html`) — the division sections weren't wrapped, so had no gap. Wrapped `divs` in `<div class="mc-divisions">` (render), and opened up: `.mc-divisions{gap:42px;margin-top:24px}`, `.mc-division-hd{margin:0 0 20px;padding-bottom:12px}`, `.tsl-list{gap:18px}`, `.tsl-grid{gap:9px}`.
- **Team-announcement club-colour backgrounds** — each selection card now uses a **per-club tinted gradient** instead of the fixed navy. Added `clubBg(club)` + `mix()` helpers in `rdca-render.js`'s `teamSelections`; mixes the club's `colors` down into a dark navy base `#0b1424` (fractions: secondary 0.22, primary main 0.34, highlight 0.46) so white text/red chips stay readable on every club (lowest contrast ~5.85, all pass AA). Ringwood→charcoal, Kilsyth→maroon, Coldstream→forest, Croydon→deep gold, etc.

### Earlier in the run (context)
Player headshot swap; Team Line-Up (homepage `.tl2-*`) rebranded to Ringwood club colour + hover; Umpire Appointments page (`umpire-appointments.html`); buy-tickets on events; About full-width text + committee links; Women's cricket icon; featured news article (`newsFeatured`); Hall of Fame readability; footer logo home-link; back-to-top button; comms RECOMMENDED badge fix + 6 comms CTAs; contact phone placeholder note; real social embeds (Elfsight IG + official TikTok) in `social.html`; hero stat icons enlarged; FOV scrolling photo strip on `photos.html`; live-video ad banner on `video.html`.

---

## 6. Key data structures (`site-data.js` → `window.RDCA_DATA`)

- **`clubs[]`** (38) — each `{key,name,colors:[primary,secondary],logo:"/logos/x.webp", …}`. e.g. `ringwood colors:["#9aa1a8","#2b2f36"]`, `kilsyth:["#c8102e","#1a1a1a"]`, `coldstream:["#5fb52b","#2c6e17"]`, `croydon:["#f2c200","#1a1a1a"]`. **All 38 have colours.** Team-selection card backgrounds derive from these.
- **`teamSelections[]`** — mock XIs, each `{team,club,grade,round,date,venue,status,entered,players:[{n,name,role,c?,wk?}]}`. Latest (by `entered`) featured first, rest grouped by division.
- **`news[]`** (3 summaries; `news[0]` image is null → featured card pulls image from `articles[]` by slug), **`articles[]`** (full objects with images), **`documents[]`**, **`events[]`** (awards-night; ticket URLs still placeholder), **`players[]`** (jake-smith photo `/player-jake-smith.jpg`), **`sections{juniors,seniors,veterans,womens}`**, **`committees`**, **`honours`**, **`repCricket`**, **`matchCentre[]`**, **`umpires{links}`**.
- **`social[]`** (3 orgs) — `rdca` (fb + Elfsight IG), `cv` Cricket Victoria (fb + Elfsight IG + official TikTok `@vic.cricket`), `ca` Cricket Australia (fb + Elfsight IG + official TikTok `@cricketaus`). Elfsight app IDs are in the data; `social.html` builds org sections and loads elfsight + tiktok embed scripts AFTER innerHTML.

---

## 7. Standing open items & honest caveats (flagged to Carson)

- **Registration form** is front-end only (confirmation message). Live submissions → RDCA database = the **SportsWeb One integration step** (drop in the real embed/connector later).
- **Event ticket URLs** — Buy-tickets uses `e.ticketUrl` if set, else `#`. Awaiting real URLs.
- **Instagram feeds (Elfsight free tier)** show a small "Powered by Elfsight" badge + monthly view cap; badge-free/unlimited needs a paid plan. FB + TikTok embeds are free/official. **FB Page Plugin is hard-capped at 500px wide** (why all feeds are capped to match).
- **Team Line-Up / teamSelections / Umpire Appointments / player profiles are MOCK/illustrative.** Ringwood's stored colours are muted silver/charcoal (`#9aa1a8`/`#2b2f36`), so its Team Line-Up widget and selection card read grey-charcoal, not navy/red. Update `clubs[].colors` if real club colours differ — every card for that club updates.
- **`player-jake-smith.jpg`** is only 288×288 (soft when scaled large) — awaiting higher-res.
- **Photos** (FOV strip, section photo rows, gallery covers, news/featured images) use **stock Unsplash placeholders** until real RDCA photography is supplied.
- **Community Big Bash external link** and **RDCA T20 site link** are still `href="#"` placeholders awaiting real URLs.
- Club naming (Heathmont vs "Heathwood") + division groupings are provisional.
- **Roadmap not yet built:** draft→publish model for the site editor is a SportsWeb One concept, not implemented here; feedback is managed via **SitePulse**.

## 8. Board sneak-peek note (already delivered)

A paste-ready board-preview message was drafted for Carson: board-only preview, link to the live URL, notes it's WIP with sample/placeholder data + live IG/TikTok feeds, feedback via SitePulse, and that RDCA T20 + BHRDCA sites are nearly done. Reminder: upload the latest bundle before sharing.

---

## 9. Quick reference — where things live

- **Homepage change** → `index.html` (inline CSS/HTML; self-contained).
- **Nav / footer / masthead** → `rdca-components.js` (header dropdown ~line 116, mobile menu ~line 80, footer RDCA column ~line 185, footer Register btn ~line 130).
- **Any other page's content** → the matching render fn in `rdca-render.js` + the data in `site-data.js`.
- **Shared component styling** → `_pages.css`. **Tokens** → `_shared.css`.
- **After any change** → bump `sw.js` version, rebuild zip, `present_files`.
