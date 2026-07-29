-- ============================================================================
-- platform_docs : DB-backed SOP / help documents rendered in a styled in-app
-- viewer, surfaced contextually inside club onboarding steps.
-- SportsWeb One (project ref: uzibfawcwoapfbigpzum)
-- Manual run in the Supabase SQL Editor. ASCII. Re-runnable.
--
-- Read: platform admins (internal SOPs) OR rows marked visibility='club'.
-- Write: platform admins only (is_platform_admin()).
-- ============================================================================

-- 1. TABLE ------------------------------------------------------------------
create table if not exists public.platform_docs (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  title                text not null,
  category             text,                       -- e.g. 'Hosting & DNS'
  summary              text,
  body_md              text not null,              -- markdown source, rendered by the styled viewer
  visibility           text not null default 'platform_admin'
                         check (visibility in ('platform_admin','club')),
  roles                text[] not null default array['super_admin','sportsweb_manager'],
  onboarding_step_keys text[] not null default array[]::text[],  -- which onboarding steps link to this doc
  icon                 text,                        -- optional emoji/icon key for the viewer
  sort_order           int not null default 100,
  status               text not null default 'published'
                         check (status in ('draft','published')),
  updated_by           uuid default auth.uid() references auth.users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.platform_docs is
  'SOP / help docs rendered in the in-app styled viewer. Platform-admin authored; visibility=club exposes a doc to club users (future club-facing set).';

create index if not exists platform_docs_step_idx on public.platform_docs using gin (onboarding_step_keys);
create index if not exists platform_docs_visibility_idx on public.platform_docs (visibility);

-- 2. updated_at trigger (reuse existing function) ---------------------------
drop trigger if exists set_platform_docs_updated_at on public.platform_docs;
create trigger set_platform_docs_updated_at
  before update on public.platform_docs
  for each row execute function public.update_updated_at();

-- 3. RLS --------------------------------------------------------------------
alter table public.platform_docs enable row level security;

drop policy if exists platform_docs_select on public.platform_docs;
create policy platform_docs_select on public.platform_docs
  for select using (is_platform_admin() or visibility = 'club');

drop policy if exists platform_docs_insert on public.platform_docs;
create policy platform_docs_insert on public.platform_docs
  for insert with check (is_platform_admin());

drop policy if exists platform_docs_update on public.platform_docs;
create policy platform_docs_update on public.platform_docs
  for update using (is_platform_admin()) with check (is_platform_admin());

drop policy if exists platform_docs_delete on public.platform_docs;
create policy platform_docs_delete on public.platform_docs
  for delete using (is_platform_admin());

grant select, insert, update, delete on public.platform_docs to authenticated;

-- 4. SEED: the Vercel -> Cloudflare migration SOP --------------------------
insert into public.platform_docs (slug, title, category, summary, body_md,
                                   visibility, onboarding_step_keys, icon, sort_order, status)
values (
  'migrate-vercel-to-cloudflare',
  'Migrate a club site: Vercel to Cloudflare Pages',
  'Hosting & DNS',
  'Move a club site off Vercel onto Cloudflare Pages, DNS stays at VentraIP, email untouched. Standard method: site on www, bare domain redirects to www.',
  $doc$## Who this is for
Super Admin and SportsWeb Manager only. Internal ops SOP, not club-facing.

## The rules (read before every migration)
1. Never move nameservers. DNS stays at VentraIP for every club.
2. Never touch mail records (MX / SPF / DKIM / _dmarc / mail).
3. www is the real address; the bare domain 301-redirects to www.
4. Test on the free .pages.dev link before changing any DNS.
5. Screenshot the club's VentraIP DNS records before starting.

## Step 1 - Deploy to Cloudflare Pages
Cloudflare dash -> Workers & Pages -> Create application -> Pages -> Connect to Git -> pick the club repo. Framework preset None (never pick VitePress). Sites are a mix of two kinds - set the build accordingly:
- Vite/React app (repo has package.json): Build command `npm run build`, output `dist`.
- Static site (no package.json, just HTML): clear the Build command (leave empty), output `/` (repo root, or the folder holding index.html).
Leave Root directory (advanced) blank unless the app is in a sub-folder (e.g. apps/web). Add env vars if the site uses them. Save and Deploy. Quick tell: a build failing with "Could not read package.json" / ENOENT is a static site - clear the build command and set output to `/`.

## Step 2 - Test the free address
Open the your-project.pages.dev link. Click through pages, images, live data. Only continue once it looks correct.

## Step 3 - Register www in Cloudflare
Pages project -> Custom domains -> Set up a domain -> www.theclub.com.au -> Continue. Copy the .pages.dev target it shows.

## Step 4 - Point www at Cloudflare (VentraIP)
VentraIP -> My Services -> Domains -> DNS. Edit (or add) the www record: Type CNAME, Hostname www, Value your-project.pages.dev, TTL default. Save. Do NOT touch MX/SPF/DKIM.

## Step 5 - Redirect the bare domain (VentraIP)
VentraIP -> Manage DNS -> Forwarding -> Enable -> 301 Redirect (Permanent). Source blank (the root), Destination https://www.theclub.com.au. Save.

## Step 6 - Clean up Vercel (after ~1 day live)
Confirm both www and bare domain show the Cloudflare site with a padlock. Vercel -> old project -> Settings -> Domains -> remove the domain. Remove leftover Vercel-only DNS records if any.

## Flows
- Migration (from Vercel): all six steps.
- Green-field (new club, no Vercel): steps 1-5 only, records created fresh; skip step 6.

## Tracking
Recorded in site_migrations (one row per club); status + step checklist reportable on the Super Admin dashboard. Started via the onboarding Hosting & DNS step.

## Troubleshooting
- Inner pages 404 on refresh: add a public/_redirects file with `/*  /index.html  200`.
- Blank data/errors: missing env vars -> add in Pages Settings -> Retry deployment.
- No padlock yet: Cloudflare issues it minutes-to-hours after the www CNAME is seen.
- Old site still shows: DNS propagation, try incognito/phone data.
- Email stopped (should never happen): compare MX/SPF/DKIM to the before screenshot.$doc$,
  'platform_admin',
  array['hosting_dns'],
  'globe',
  10,
  'published'
)
on conflict (slug) do update
  set title = excluded.title,
      category = excluded.category,
      summary = excluded.summary,
      body_md = excluded.body_md,
      onboarding_step_keys = excluded.onboarding_step_keys,
      icon = excluded.icon,
      sort_order = excluded.sort_order,
      status = excluded.status;

-- ============================================================================
-- Verify:
--   select slug, title, category, onboarding_step_keys from public.platform_docs;
-- ============================================================================
