# SitePulse — add the feedback widget to a site

The SitePulse feedback button (with the v1 element picker) is **one hosted script**
you drop onto any page, tagged with the club's id. Reports land in
**Super Admin → SitePulse**. No build step, no dependencies, no login for reporters.

---

## Where everything lives (pick-up points)

| Piece | Location |
|---|---|
| **Widget (hosted, ready to embed)** | `https://sportsweb-one-v1.vercel.app/sitepulse-widget.js` |
| Widget source | `SportsWeb-Australia/SportsWeb-One` → `public/sitepulse-widget.js` |
| Ingest API (where reports go) | `https://uzibfawcwoapfbigpzum.supabase.co/functions/v1/sitepulse-ingest` (Supabase project `sportsweb-one`) |
| Inbox (read/triage reports) | Super Admin app → **SitePulse** (`src/admin/SuperSitePulse.tsx`) |
| Help page ("How it works") | `https://sitepulse-help.vercel.app` (repo `SportsWeb-Australia/sitepulse-help`) |

You don't host or copy the widget file — every site points at the one hosted URL,
so updating it updates every embedding site at once.

---

## Add it to a site

Paste this just before `</body>` on every page you want covered:

```html
<script src="https://sportsweb-one-v1.vercel.app/sitepulse-widget.js"
        data-club-id="PUT-CLUB-UUID-HERE"
        data-source="onboarding"
        data-website-status="draft"
        data-help-url="https://sitepulse-help.vercel.app"></script>
```

That's the whole integration. A floating **Feedback** button appears bottom-right.

### The attributes

| Attribute | Required | Values | What it does |
|---|---|---|---|
| `data-club-id` | **Yes** | a `clubs` row UUID | Ties reports to the club. Must exist or the API rejects the report (400). |
| `data-source` | No (default `report`) | `onboarding` \| `report` | `onboarding` = pre-launch review mode ("Feedback" button + can show the How-it-works link). `report` = live-site mode ("Report an issue"). |
| `data-website-status` | No | `draft` \| `published` | Copy only. `report` + `published` → button reads "Report an issue"; `draft` → "Feedback". Nothing is stored. |
| `data-help-url` | No | your help-page URL | Shows a **How it works** link in the form footer — **onboarding mode only**. Omit it and no link renders (never a dead link). |

### Two common setups

**Pre-launch review** (committee/owner walking a staging site):
```html
<script src="https://sportsweb-one-v1.vercel.app/sitepulse-widget.js"
        data-club-id="CLUB-UUID"
        data-source="onboarding"
        data-help-url="https://sitepulse-help.vercel.app"></script>
```

**Live public site** (visitors can report issues):
```html
<script src="https://sportsweb-one-v1.vercel.app/sitepulse-widget.js"
        data-club-id="CLUB-UUID"
        data-source="report"
        data-website-status="published"></script>
```

---

## Using the element picker

Inside the form, **"Point at it"** lets the reviewer tap the exact thing they mean
(a logo, heading, button, link). It captures the element in human terms — tag, a
readable label, nearest heading, and coordinates — and attaches it to the report.
Pointing is always optional; a plain typed comment still submits.

---

## Verify it works

1. Load the page → the button shows bottom-right.
2. Open it, type something, optionally "Point at it", **Send**.
3. You get a short **reference number**.
4. The report appears in **Super Admin → SitePulse**, with the pinned element shown
   above the description and an **Open page → jump to element** button.

---

## Notes

- The anon key baked into the script is the project's public/safe legacy anon JWT
  (the ingest endpoint runs with Verify-JWT on). It is meant to be in the front end.
- Everything the picker captures is optional and validated server-side — a malformed
  field is dropped and the report is still saved; a report is never lost over it.
- **Help-page URL:** `sitepulse-help.vercel.app` is the current home; it will move to a
  SitePulse/SportsWeb domain later. When it does, update `data-help-url` in one place
  (the club-site injector), not per site.
