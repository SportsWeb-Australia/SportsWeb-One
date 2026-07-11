-- ============================================================
-- CAPTURED FROM PROD 2026-07-11 -- already exists; documentation/parity only.
-- Two clubs columns added off-repo (billing/account state). Idempotent.
-- Both are plain text (no enum, no check constraint) as they stand today.
-- ============================================================

alter table public.clubs
  add column if not exists account_status text not null default 'demo',
  add column if not exists plan           text;
