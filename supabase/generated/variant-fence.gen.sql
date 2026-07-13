-- GENERATED FILE -- do not edit by hand.
-- Source of truth: src/sections/presentation-fields.json
-- Regenerate: npm run gen:variant-sql   (the build fails if this file is stale)
--
-- The save-path variant fence (save_club_page_draft) uses these two functions to force
-- platform-controlled PRESENTATION fields to their stored-or-default value for non-admins.

create or replace function public._section_presentation_fields(sectype text)
returns text[] language sql immutable as $$
  select case sectype
    when 'hero' then array['layout']::text[]
    when 'news' then array['layout']::text[]
    when 'sponsors' then array['display']::text[]
    else array[]::text[]
  end;
$$;

create or replace function public._section_variant_default(sectype text, field text)
returns text language sql immutable as $$
  select case sectype || '.' || field
    when 'hero.layout' then 'centred'
    when 'news.layout' then 'grid'
    when 'sponsors.display' then 'strip'
    else null
  end;
$$;
