-- ============================================================
-- CAPTURED FROM PROD 2026-07-11 -- already exists; documentation/parity only.
-- Sales planning tables (Sales Formula): products + targets. Platform-admin only.
-- Idempotent (no-op on prod). Depends on: is_platform_admin().
-- ============================================================

create table if not exists public.sales_products (
  id             uuid    not null default gen_random_uuid() primary key,
  key            text    not null unique,
  name           text    not null,
  category       text    not null default 'software',
  avg_deal_value numeric not null default 0,
  is_placeholder boolean not null default true,
  active         boolean not null default true,
  sort           integer not null default 100,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.sales_products enable row level security;

drop policy if exists sales_products_admin on public.sales_products;
create policy sales_products_admin on public.sales_products
  for all using (is_platform_admin()) with check (is_platform_admin());

create table if not exists public.sales_targets (
  id                  uuid    not null default gen_random_uuid() primary key,
  name                text    not null,
  product_key         text,
  period              text    not null default 'monthly',
  revenue_target      numeric not null default 0,
  avg_deal_value      numeric not null default 0,
  close_rate          numeric not null default 0.30,
  show_rate           numeric not null default 0.80,
  booking_rate        numeric not null default 0.25,
  contact_rate        numeric not null default 0.35,
  cta_conversion_rate numeric not null default 0.05,
  is_placeholder      boolean not null default false,
  created_by          uuid    default auth.uid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.sales_targets enable row level security;

drop policy if exists sales_targets_admin on public.sales_targets;
create policy sales_targets_admin on public.sales_targets
  for all using (is_platform_admin()) with check (is_platform_admin());
