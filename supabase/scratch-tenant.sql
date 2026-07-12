-- ============================================================
-- Scratch tenant -- the designated place to write test data. Repo: supabase/scratch-tenant.sql
-- ------------------------------------------------------------
-- Upgraded guardrail (Codey, this session): NEVER write test data to any REAL club
-- (is_demo = false), published or draft. Dookie is a real club. Test writes go ONLY to a
-- dedicated is_demo = true scratch tenant that exists to be written to and broken.
--
-- This provisions that tenant. is_demo = true, so it is honestly labelled and (once the
-- per-club SEO work lands) noindex. Idempotent -- safe to re-run.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name. Pure ASCII.
-- Depends on: clubs.is_demo (supabase/strip-seeding-and-demo-flag.sql). Run that FIRST.
-- ============================================================

insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email, is_demo)
select 'SCRATCH - Test Tenant (safe to break)', 'scratch-tenant', 'other'::sport_type,
       '#888888', '#333333', 'scratch@sportsweb.com.au', true
where not exists (select 1 from public.clubs where slug = 'scratch-tenant');

-- Guarantee the flag even if the row predates this script.
update public.clubs set is_demo = true where slug = 'scratch-tenant';

-- View / write against it at:  /?club=scratch-tenant
-- After applying, verify: select slug, is_demo, website_status from public.clubs
--                          where slug = 'scratch-tenant';  -> is_demo = true.
-- ============================================================
