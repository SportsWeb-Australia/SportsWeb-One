-- ============================================================
-- people.is_public -- PII opt-in for public committee/contacts. Repo: supabase/people-is-public.sql
-- Built against docs/F2-design-doc.md sec 9b ("two hard constraints": PII).
-- ------------------------------------------------------------
-- A volunteer's name, phone and email is opt-IN to the public site, never opt-out. The
-- committee section renders people; today people is member-only RLS so there is no public
-- leak, BUT the section is DESIGNED to render publicly and P5 builds association contacts on
-- top of it. When a public read is added to people at P5, THIS column is the gate -- a
-- member-only policy today is not a substitute for the column.
--
-- Default false: existing rows become non-public until a human opts each in. Committee
-- sections then render nothing until someone opts a person in -- which is correct.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name (new migration; the
-- earlier overrides do not generalise). Pure ASCII.
-- ============================================================

alter table public.people add column if not exists is_public boolean not null default false;

-- After applying, verify:
--   * people.is_public exists, default false, every existing row = false.
--   * committee section on the F2 render shows its empty state until a person is opted in.
--   * P5 (when it adds a public read policy to people): the USING clause includes
--     is_public = true, so only opt-in rows are ever publicly reachable.
-- ============================================================
