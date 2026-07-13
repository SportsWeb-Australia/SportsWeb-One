-- ============================================================
-- BRANCH-ONLY SEED -- fixtures for the SportsWeb One `develop` branch.
-- NEVER run this against production. It contains NO production data; every row here is a
-- fabricated fixture in an is_demo tenant, on the branch's isolated Postgres + auth stack.
--
-- Passwords are PLACEHOLDERS (:PW_ADMIN, :PW_PLATFORM) supplied at apply time -- NEVER commit
-- real values. GoTrue gotcha baked in: the *_token / *_change columns MUST be '' not NULL.
--
-- What it makes, so the fences can be proven end-to-end:
--   * a scratch tenant (is_demo) with a home page the composer edits
--   * a club-admin test user (member of the scratch tenant) -> vm_is_club_member() resolves true
--   * a platform-admin test user (platform_user_roles superadmin) -> is_platform_admin() resolves true
--   * a second is_demo render-test club with a published page
-- ============================================================

-- ---- theme rows (FK target for clubs.theme_key) ----------------------------
-- Minimal tokens on the branch; faithful platform token VALUES are prod config loaded via a
-- lossless channel (the fences never read token values -- only the rows + is_selectable).
insert into public.club_themes (key, name, tokens, is_preset) values
  ('arena','Arena','{}'::jsonb,true), ('broadcast','Broadcast','{}'::jsonb,true),
  ('classic','Classic','{}'::jsonb,true), ('coastal','Coastal','{}'::jsonb,true),
  ('editorial','Editorial','{}'::jsonb,true), ('heritage','Heritage','{}'::jsonb,true),
  ('momentum','Momentum','{}'::jsonb,true), ('stadium','Stadium','{}'::jsonb,true)
on conflict (key) do nothing;

-- ---- clubs (both is_demo) --------------------------------------------------
insert into public.clubs (id, name, slug, sport_type, is_demo, theme_key, primary_colour, secondary_colour, tertiary_colour)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441de','Scratch Tenant','scratch-tenant','afl_netball',true,'classic','#1e3a8a','#f59e0b','#111827')
on conflict (id) do update set is_demo = true, theme_key = excluded.theme_key;

insert into public.clubs (id, name, slug, sport_type, is_demo, theme_key, primary_colour, secondary_colour, tertiary_colour)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441df','Render Test United','render-test','soccer',true,'coastal','#0e7490','#f97316','#0f172a')
on conflict (id) do update set is_demo = true, theme_key = excluded.theme_key;

-- ---- test users (branch auth ONLY) -----------------------------------------
-- club admin
delete from auth.identities where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from public.club_users where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from auth.users where id = 'aaaaaaaa-0000-4000-8000-000000000001';
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'composer-test@scratchtest.com',
  crypt(:PW_ADMIN, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, false,
  '', '', '', '', '', '', '', ''
);
insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'email',
  jsonb_build_object('sub','aaaaaaaa-0000-4000-8000-000000000001','email','composer-test@scratchtest.com','email_verified',true),
  now(), now(), now());

-- platform admin
delete from public.platform_user_roles where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';
delete from auth.identities where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';
delete from auth.users where id = 'bbbbbbbb-0000-4000-8000-000000000002';
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002',
  'authenticated', 'authenticated', 'platform-test@scratchtest.com',
  crypt(:PW_PLATFORM, gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, false,
  '', '', '', '', '', '', '', ''
);
insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'bbbbbbbb-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000002', 'email',
  jsonb_build_object('sub','bbbbbbbb-0000-4000-8000-000000000002','email','platform-test@scratchtest.com','email_verified',true),
  now(), now(), now());

-- ---- memberships (make the gate functions resolve) -------------------------
insert into public.club_users (club_id, user_id, role)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441de','aaaaaaaa-0000-4000-8000-000000000001','club_admin')
on conflict do nothing;

insert into public.platform_user_roles (user_id, role)
values ('bbbbbbbb-0000-4000-8000-000000000002','superadmin')
on conflict do nothing;

-- ---- scratch tenant home page (what the composer edits) --------------------
delete from public.club_pages where club_id = '2d5e7d88-aa32-43a7-a594-4d2f813441de' and slug = 'home';
insert into public.club_pages (club_id, slug, title, draft_layout)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441de','home','Home',
  '[{"id":"seed-hero","type":"hero","props":{"title":"Scratch Tenant","layout":"centred"},"visible":true},
    {"id":"seed-rt","type":"rich_text","props":{"body":[{"kind":"paragraph","text":"About the scratch tenant."}]},"visible":true},
    {"id":"seed-news","type":"news","props":{"layout":"grid","count":3},"visible":true}]'::jsonb);

-- ---- render-test club published page (public renderer) ---------------------
delete from public.club_pages where club_id = '2d5e7d88-aa32-43a7-a594-4d2f813441df' and slug = 'home';
insert into public.club_pages (club_id, slug, title, draft_layout, published_layout)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441df','home','Home',
  '[{"id":"rt-hero","type":"hero","props":{"title":"Render Test United","layout":"media-split"},"visible":true}]'::jsonb,
  '[{"id":"rt-hero","type":"hero","props":{"title":"Render Test United","layout":"media-split"},"visible":true}]'::jsonb);
