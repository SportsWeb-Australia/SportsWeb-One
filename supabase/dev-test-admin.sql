-- ============================================================
-- DEV / TEST HARNESS ONLY -- a seeded club-admin for the scratch tenant, so an automated
-- headless browser can sign in and exercise authenticated admin UI (there is no other way
-- to reach a session in the preview). Repo: supabase/dev-test-admin.sql
-- ------------------------------------------------------------
-- NEVER run against a real project other than this dev/test one. The user is a member of the
-- is_demo scratch tenant only.
--
-- PASSWORD IS NEVER COMMITTED. Generate a strong random one at apply time and substitute it
-- for :PW below -- e.g. `openssl rand -base64 24`. The live value is stored outside git (a
-- password manager / local env), not here. If it ever needs rotating, re-run just the
-- encrypted_password UPDATE with a fresh random value.
--
-- GoTrue gotcha baked in: the *_token / *_change columns MUST be '' (empty), never NULL, or
-- password login 500s (GoTrue can't scan NULL into a Go string).
-- ============================================================

delete from auth.identities where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from public.club_users where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from auth.users where id = 'aaaaaaaa-0000-4000-8000-000000000001';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-0000-4000-8000-000000000001',
  'authenticated', 'authenticated',
  'composer-test@scratchtest.com',
  crypt(:PW, gen_salt('bf')),  -- :PW = a random password supplied at apply time; NEVER commit it
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, false,
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001', 'email',
  jsonb_build_object('sub','aaaaaaaa-0000-4000-8000-000000000001','email','composer-test@scratchtest.com','email_verified',true),
  now(), now(), now()
);

insert into public.club_users (club_id, user_id, role)
values ('2d5e7d88-aa32-43a7-a594-4d2f813441de', 'aaaaaaaa-0000-4000-8000-000000000001', 'club_admin')
on conflict do nothing;
-- ============================================================
