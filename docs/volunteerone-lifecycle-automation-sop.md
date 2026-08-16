# VolunteerOne — Enquiry → Sale → Retention → Renewal (Automation SOP)

**Product:** VolunteerOne (SportsWeb One module) · **Owner:** Carson / Click Sports Media
**Purpose:** One repeatable, mostly-automated machine that takes a stranger from first click to paying, happy, renewing club — with a human only where a human actually adds value.
**Principle (same as the product):** *automation prepares, a human commits.* Every outbound sequence is drafted and scheduled automatically; anything high-stakes (a sales call, a save on a cancelling club) surfaces as a task for a person.

> This SOP is the source of truth for the VolunteerOne go-to-market machine. It maps the customer journey, the email/SMS sequences behind it, the system events that fire them, and the build checklist to ship it. Pricing referenced: **$149/yr** standalone (Full), **Free forever** (≤40 volunteers), **bundled free** with Club Pro (Basic) / Club Growth (Full). **SMS is a paid add-on.**

---

## 1. The journey at a glance

| # | Stage | Entry trigger | Goal (exit) | Who runs it | Target |
|---|-------|---------------|-------------|-------------|--------|
| 0 | **Attract / Enquiry** | Visits landing page / referred | Captured lead OR trial start | 100% automated | ≥6% visitor→trial |
| 1 | **Trial start (Activate)** | Clicks *Start free trial* | First roster built + sent | Automated + in-app | ≥60% activate in 48h |
| 2 | **Trial nurture** | Day 0–14 of trial | Convert to paid | Automated, human on hot leads | ≥25% trial→paid |
| 3 | **Sale** | Card added / plan chosen | Payment succeeded | Stripe self-serve | — |
| 4 | **Onboard (First win)** | Payment / plan active | 2nd roster + 1 real check-in | Automated + in-app | ≥80% reach first win in 14d |
| 5 | **Retention (Engage)** | Active paying club | Weekly habit, low churn | Automated + health scoring | ≥90% 90-day retention |
| 6 | **Renewal** | 45 days pre-renewal | Renews (or upgrades) | Automated, human on at-risk | ≥85% renew |
| 7 | **Win-back** | Cancelled / expired | Return | Automated | ≥10% reactivate |

Everything below is one funnel. A club is always in exactly one stage; a stage change is a system event that starts/stops sequences.

---

## 2. Stages in detail

### Stage 0 — Attract / Enquiry  *(fully automated)*
- **Sources:** VolunteerOne landing page, SW1 in-app cross-sell ("Turn on VolunteerOne"), association referrals, club-to-club word of mouth, search/social.
- **Two doors, no dead ends:**
  - **Ready now →** *Start free trial* (no card) → Stage 1.
  - **Not ready →** lead magnet: "The 1-page club volunteer roster kit (PDF)" in exchange for email → enters **Nurture-cold** sequence (E-N1…N4) until they start a trial.
- **Capture:** email + club name + role. Write to `leads` (source, utm, created_at). No sales gate, no "book a demo" wall — self-serve first.
- **Automated:** instant lead-magnet delivery; UTM attribution; if SW1 already knows this club (existing website customer), tag `warm_existing_sw1` and route to the bundled-offer message instead.
- **Exit:** trial started (→1) or 30 days no action (→ low-frequency newsletter).

### Stage 1 — Trial start / Activation  *(automated + in-app guidance)*
- **Trigger:** trial created → `trial_started` event (sets `trial_ends_at = +14d`).
- **The one job:** get them to **first value = one roster built and sent**. Nothing else matters yet.
- **In-app:** 3-step setup checklist (Add a few volunteers → Let AI draft Saturday → Approve & send). Pre-seed a demo club so an empty club never looks empty.
- **Automated email:** E-A1 welcome (immediate), E-A2 nudge if not activated in 24h.
- **Activation signal:** `first_roster_sent = true`. Fire `activated` event → switch from "activate" to "convert" messaging.
- **Exit:** activated (→2 convert track) or 48h unactivated (→2 rescue track).

### Stage 2 — Trial nurture → conversion  *(automated; human on hot leads)*
- **Two tracks off Stage 1:**
  - **Convert track** (activated): show value they've already created — hours saved, messages sent, volunteers who said yes — then ask for the card.
  - **Rescue track** (not activated): remove friction, offer a 10-min setup call, extend value.
- **Human-in-the-loop:** any trial with ≥15 volunteers **or** ≥2 rosters sent surfaces as a **task** ("Hot trial — offer a call") on the sales board. Automation drafts the outreach; a person decides whether to send/call.
- **Conversion mechanics:** in-app *Upgrade* → Stripe Checkout ($149/yr). Card-on-file optional during trial; if added, auto-converts at day 14 with a heads-up email (E-C4) 3 days prior (legal + trust).
- **Exit:** paid (→3) or trial expired unpaid (→ downgrade to Free-forever if ≤40 volunteers, else → Win-back drip).

### Stage 3 — Sale  *(Stripe self-serve)*
- **Trigger:** Stripe `checkout.session.completed` / `invoice.paid` → webhook → set module `active`, `plan_key=vm_full`, `renews_at=+1yr`.
- **Automated:** receipt (Stripe-branded "SportsWeb One"), E-S1 "You're in" onboarding kickoff, internal `sale` event to metrics.
- **Add-ons:** SMS pack is a separate line item / metered add-on — offered post-sale ("Want text reminders? Add SMS") not bundled.
- **Exit:** → Stage 4 immediately.

### Stage 4 — Onboarding / First win  *(automated + in-app)*
- **Goal:** second roster + at least **one real QR/NFC check-in on a game day** = the habit is real.
- **Automated 14-day onboarding sequence** (E-O1…O4): rostering → publishing a "volunteers wanted" post to their SW1 site → check-in day → compliance/WWCC setup.
- **Milestones tracked:** `rosters_sent`, `checkins_recorded`, `opportunities_published`, `wwcc_tracked`. Each milestone = a small in-app win + (optional) congrats email.
- **Exit:** first-win reached (→5). If no 2nd roster in 14 days → **at-risk** flag, human task.

### Stage 5 — Retention / Engagement  *(automated + health scoring)*
- **Health score (0–100)**, recomputed weekly from: rosters/wk, check-ins/wk, logins by ≥2 committee members, messages sent, feature breadth. Bands: **Green / Amber / Red**.
- **Automated by band:**
  - **Green:** monthly value recap ("This month: 34 shifts filled, 18 hrs saved"), seasonal tips, referral ask, upsell (SMS add-on, association tier).
  - **Amber:** re-engagement ("Your Saturday roster isn't set — want AI to draft it?"), feature they haven't tried.
  - **Red:** save sequence + **human task** ("Red club — check in").
- **Seasonal awareness:** pre-season = onboarding surge content; off-season = "keep your volunteer list warm" + plan-next-year. Australian football/netball calendar drives timing.
- **Community/recognition loop:** end-of-season volunteer hours report + certificates = a natural "look what we did" moment → referral + renewal fuel.
- **Exit:** stays here until renewal window (→6) or cancels (→7).

### Stage 6 — Renewal  *(automated; human on at-risk / high-value)*
- **Window opens 45 days before `renews_at`.**
- **Automated renewal sequence** (E-R1…R4): value proof → renewal reminder → renew CTA (one click, card on file) → last-chance. Offer **upgrade** paths (association tier, SMS pack) inside the value proof, not just "pay again."
- **Auto-renew** if card on file (annual). Failed payment → dunning (E-R5a…c: retry, update-card, grace) before any downgrade.
- **At-risk (Amber/Red health) or high-value clubs** surface as a **task** for a personal renewal touch.
- **Exit:** renewed (→5, reset window) or lapsed (→7).

### Stage 7 — Win-back  *(automated)*
- **Trigger:** cancel or expiry. Immediate exit survey (1 question). Downgrade to Free-forever where eligible (keeps the relationship + data).
- **Win-back drip** (E-W1…W3 over 60 days): "we saved your data", what's new, a reason to come back (new season, new feature). Then quarterly newsletter only.
- **Exit:** reactivates (→3) or goes cold (newsletter list).

---

## 3. Email / SMS sequences (the content layer)

Timing is from the stage entry event. All emails: single clear CTA, plain committee-friendly voice, mobile-first, one-click unsubscribe, AU spelling. Transactional (receipts, trial-ending, dunning) always send; marketing respects unsubscribe.

**A · Activation (trial)**
- E-A1 — *0h* — "Welcome — let's fill your first roster" → CTA: build a roster.
- E-A2 — *24h if not activated* — "Stuck? AI will draft Saturday for you" → CTA: 1-click draft.

**C · Convert (trial nurture)**
- E-C1 — *day 2 (activated)* — "You just saved ~2 hours" (their real numbers) → soft upgrade.
- E-C2 — *day 5* — proof: "Dave said yes in one tap" / social proof → upgrade.
- E-C3 — *day 8* — objection handling ("no app, no lock-in, free-forever safety net").
- E-C4 — *day 11 (trial-ending, transactional)* — "Your trial ends in 3 days" + what they keep/lose.
- E-C5 — *day 14* — "Last day — keep everything for $149/yr" → upgrade.
- **Rescue (not activated):** R-1 *day 2* "Want a hand? 10-min setup call", R-2 *day 6* "We set up a demo club for you", R-3 *day 12* "Before your trial ends".

**S · Sale**
- E-S1 — *0h* — "You're in 🎉 here's your first-fortnight plan" → onboarding step 1.

**O · Onboarding**
- E-O1 — *day 1* — build your real Saturday roster.
- E-O2 — *day 4* — publish "volunteers wanted" to your website.
- E-O3 — *day 7* — game-day check-in: print your QR / set up NFC.
- E-O4 — *day 12* — track WWCC & inductions (compliance).

**Retention (evergreen, band-driven)**
- Monthly value recap (Green). Amber re-engagement. Red save. Seasonal: pre-season kickoff, mid-season tips, end-of-season hours report + referral ask.

**R · Renewal**
- E-R1 — *−45d* — "Your VolunteerOne year in numbers".
- E-R2 — *−30d* — renewal reminder + upgrade options.
- E-R3 — *−14d* — one-click renew.
- E-R4 — *−3d* — last chance / what you keep.
- E-R5a/b/c — dunning on failed auto-renew (retry / update card / grace).

**W · Win-back**
- E-W1 — *+2d* — "Your data's safe, here's how to come back."
- E-W2 — *+21d* — what's new.
- E-W3 — *+60d* — new-season reason to return.

**Cold nurture (lead magnet, pre-trial):** N1 deliver kit → N2 problem/story → N3 how VolunteerOne solves it → N4 start free trial.

---

## 4. Automation architecture (how it actually fires)

**Model:** events → rules → actions. The app emits lifecycle **events**; an automation layer maps each event to enrol/exit-from-sequence + task creation.

- **Source of truth:** `sportsweb-one` Supabase (single DB — VolunteerOne reads/writes here).
- **Lifecycle events (emit from app + webhooks):** `lead_captured`, `trial_started`, `activated`, `first_roster_sent`, `checkin_recorded`, `checkout_completed`, `payment_failed`, `renews_soon`, `renewed`, `cancelled`, `health_changed`.
- **Data to add:** `crm_contacts` (person), `crm_accounts`/reuse `clubs` (club + `lifecycle_stage`, `health_band`, `trial_ends_at`, `renews_at`, `plan_key`), `crm_events` (immutable log), `email_sends` (dedupe/audit), `sequence_enrolments` (contact × sequence × step × next_run_at).
- **The scheduler:** a Supabase **cron edge function** (every 15 min) walks `sequence_enrolments` where `next_run_at <= now()`, renders the step template, calls the send provider, advances the step, respects unsubscribe/suppression. Idempotent via `email_sends`.
- **Send providers:** transactional + sequences via **ZeptoMail** (already in the stack) *or* the shared SW1 notify endpoint; SMS add-on via the existing SMS path. Provider-neutral — templates live in DB, not the ESP.
- **Payments:** **Stripe** self-serve (mirror the FirstBrief pattern — price-agnostic via env `STRIPE_PRICE_ID`, "SportsWeb One" branding). Webhook → `checkout_completed` / `payment_failed` / renewal events.
- **Tasks for humans:** hot-trial, red-club-save, at-risk-renewal → rows in a `sales_tasks` board (reuse the migrations/tracker task UI pattern already shipped).
- **Attribution/metrics:** every stage change writes to `crm_events`; a funnel view rolls up conversion by stage + source.

**Guardrails:** frequency cap (max 2 marketing emails/week/contact), quiet hours, global suppression list, transactional always-send, one-click unsubscribe, AU privacy compliance, test-mode flag so we never email real clubs during build.

---

## 5. The funnel we're optimising

`Visitors → Trials (6%) → Activated (60%) → Paid (25% of trials) → First-win (80%) → 90-day retained (90%) → Renewed (85%) → Referral`.
Instrument each arrow. Weekly review: which arrow is leaking, ship one experiment against it. This SOP is versioned — update the numbers as real data lands.

---

## 6. Deploy checklist (build order)

1. **Data layer** — add CRM/lifecycle tables + `lifecycle_stage`/`health_band` on clubs; migration + RLS; seed stages.
2. **Event emission** — emit the Section-4 events from app actions + Stripe/ESP webhooks.
3. **Sequence engine** — `sequence_enrolments` + cron edge function (render → send → advance → suppress); `email_sends` audit.
4. **Templates** — load all Section-3 emails as DB templates (subject/body/CTA), with merge fields (club, numbers, links).
5. **Stripe** — self-serve Checkout for $149/yr + SMS add-on line item; webhooks → events; auto-renew + dunning.
6. **Health scoring** — weekly job computing 0–100 + band; drives Stage-5 branching.
7. **Task board** — hot-trial / red-club / at-risk-renewal tasks surfaced to a human.
8. **Metrics** — funnel view + weekly leak report.
9. **Publish this SOP** — insert into `platform_docs` (slug `volunteerone-lifecycle-automation`) so it renders in the in-app SOP viewer.
10. **Dry-run** in test mode end-to-end (fake club through all 7 stages) before going live.

---

## 7. Ownership & cadence
- **Machine owner:** Carson. **Build:** Codey (this repo + Supabase + Stripe/ESP).
- **Weekly:** funnel leak review (15 min). **Monthly:** sequence performance (open/click/convert per email), prune losers. **Seasonally:** refresh content for the AU club calendar.
- **Definition of done for "automated":** a new club can go stranger → trial → paid → first-win → renewal with zero manual email, and a human is pulled in only by an explicit task.
