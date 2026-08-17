-- ============================================================
-- club_videos -- the video highlights collection. Repo path: supabase/club-videos.sql
--
-- Carson's brief: a club posts video LINKS, a page shows a main video plus two or three more,
-- and older ones are ARCHIVED as highlights the way news is. It may start as one video and grow.
--
-- Modelled on public.news deliberately, down to the policy names and the shared content_status
-- enum, because it is the same lifecycle: draft -> published -> archived. Nothing new is
-- invented for archiving; content_status already has 'archived'.
--
-- LINKS ONLY, no uploads. The url is a YouTube/Vimeo/file address and the renderer embeds it
-- (src/components/blocks/MediaEmbed.tsx). That is also why this is safe for a public bucket
-- concern that does not apply: no media is stored here, only an address.
--
-- Ordering, not a "featured" flag: the section renders the FIRST video large and the rest as a
-- row (the same feature/grid/list choice the news section already offers). A boolean would let a
-- club create two "main" videos and have the renderer silently pick one.
--
-- Depends on: public.clubs, public.content_status, public.is_club_admin, public.is_super_admin,
--             public.my_club_ids, public.update_updated_at.
-- ============================================================

create table if not exists public.club_videos (
  id            uuid primary key default uuid_generate_v4(),
  club_id       uuid not null references public.clubs(id) on delete cascade,
  title         text not null,
  video_url     text not null,
  description   text,
  -- Optional poster. Absent is fine: YouTube and Vimeo supply their own.
  thumbnail_url text,
  -- Free text, e.g. "2026 Round 12" -- lets a club group a season's highlights without a
  -- second table. Not an enum: nobody can enumerate a club's seasons in advance.
  collection    text,
  status        public.content_status not null default 'draft',
  published_at  timestamptz,
  -- Lower sorts first. The first PUBLISHED video is the main one.
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- The public read is always (club, published, ordered), so the index matches it.
create index if not exists club_videos_club_status_order_idx
  on public.club_videos (club_id, status, display_order);

alter table public.club_videos enable row level security;

-- Mirrors news exactly. The public may read a PUBLISHED video of a PUBLISHED club and nothing
-- else -- an archived or draft video is invisible, which is what makes "archive it" a real
-- action rather than a label.
drop policy if exists club_videos_public_read on public.club_videos;
create policy club_videos_public_read on public.club_videos
  for select to public
  using (
    status = 'published'::public.content_status
    and club_id in (select id from public.clubs where website_status = 'published'::public.website_status)
  );

drop policy if exists club_videos_member_read on public.club_videos;
create policy club_videos_member_read on public.club_videos
  for select to authenticated
  using (club_id in (select public.my_club_ids()));

drop policy if exists club_videos_member_write on public.club_videos;
create policy club_videos_member_write on public.club_videos
  for all to authenticated
  using (club_id in (select public.my_club_ids()))
  with check (club_id in (select public.my_club_ids()));

drop policy if exists club_videos_admin_all on public.club_videos;
create policy club_videos_admin_all on public.club_videos
  for all to public
  using (public.is_club_admin(club_id) or public.is_super_admin());

grant select on public.club_videos to anon, authenticated;
grant insert, update, delete on public.club_videos to authenticated;

-- public.update_updated_at, NOT update_updated_at_column -- the latter exists only in the
-- storage schema on this project and CREATE TRIGGER fails against it.
drop trigger if exists club_videos_updated_at on public.club_videos;
create trigger club_videos_updated_at
  before update on public.club_videos
  for each row execute function public.update_updated_at();

-- ------------------------------------------------------------
-- After applying, verify:
--   * anon select on a published club -> published videos only, ordered by display_order.
--   * a draft or archived video -> invisible to anon.
--   * every video of an UNPUBLISHED club -> invisible to anon.
--   * updating a row bumps updated_at.
-- ============================================================
