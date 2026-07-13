--
-- PostgreSQL database dump
--

\restrict LBWe8iNsPIIgerdoInsbZL65DItlcYC2h3a7MZpZcf1NgNVyzQ4qckQ0V3WNcBO

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA public;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: content_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_status AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: module_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.module_name AS ENUM (
    'shop',
    'ticketing',
    'registrations',
    'fixtures',
    'stats',
    'membership',
    'volunteers'
);


--
-- Name: package_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.package_level AS ENUM (
    'starter',
    'professional',
    'elite'
);


--
-- Name: sponsor_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sponsor_level AS ENUM (
    'platinum',
    'gold',
    'silver',
    'bronze',
    'supporter'
);


--
-- Name: sport_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sport_type AS ENUM (
    'afl',
    'cricket',
    'soccer',
    'netball',
    'basketball',
    'rugby_union',
    'rugby_league',
    'hockey',
    'tennis',
    'swimming',
    'other',
    'afl_netball'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'trial',
    'active',
    'past_due',
    'cancelled',
    'paused'
);


--
-- Name: template_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.template_status AS ENUM (
    'draft',
    'active',
    'deprecated'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'club_admin'
);


--
-- Name: website_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.website_status AS ENUM (
    'draft',
    'published',
    'suspended'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: access_audit_immutable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.access_audit_immutable() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  raise exception 'access_audit is append-only; % is not permitted', tg_op;
end $$;


--
-- Name: add_club_member(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_club_member(p_club uuid, p_profile jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_id uuid;
begin
  if not (public.is_platform_admin()
          or public.club_role(p_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised to add members for this club';
  end if;

  if coalesce(nullif(trim(p_profile->>'full_name'), ''), '') = '' then
    raise exception 'a member name is required';
  end if;

  insert into public.people (
    club_id, full_name, first_name, last_name, email, mobile,
    date_of_birth, status, member_since, created_by, created_at, updated_at
  ) values (
    p_club,
    trim(p_profile->>'full_name'),
    nullif(trim(p_profile->>'first_name'), ''),
    nullif(trim(p_profile->>'last_name'), ''),
    nullif(trim(p_profile->>'email'), ''),
    nullif(trim(p_profile->>'mobile'), ''),
    nullif(p_profile->>'date_of_birth', '')::date,
    coalesce(nullif(trim(p_profile->>'status'), ''), 'active'),
    nullif(p_profile->>'member_since', '')::date,
    auth.uid(), now(), now()
  ) returning id into v_id;

  return v_id;
end;
$$;


--
-- Name: add_person_role(uuid, uuid, text, text, uuid, uuid, text, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_person_role(p_club uuid, p_person uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_id uuid;
begin
  if not (public.is_platform_admin()
          or public.club_role(p_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised to manage roles for this club';
  end if;
  if coalesce(nullif(trim(p_role), ''), '') = '' then
    raise exception 'a role is required';
  end if;

  insert into public.person_roles (
    club_id, person_id, role, sport, team_id, season_id,
    committee_title, start_date, status, created_by
  ) values (
    p_club, p_person, trim(p_role), nullif(trim(p_sport), ''),
    p_team_id, p_season_id, nullif(trim(p_committee_title), ''),
    p_start_date, 'active', auth.uid()
  ) returning id into v_id;

  return v_id;
end;
$$;


--
-- Name: admin_create_club(text, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_create_club(p_name text, p_slug text, p_primary text DEFAULT '#1F8CA7'::text, p_secondary text DEFAULT '#111111'::text, p_tertiary text DEFAULT NULL::text, p_contact text DEFAULT NULL::text, p_sport text DEFAULT 'other'::text, p_admin_email text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_club  uuid;
  v_user  uuid;
  v_admin text := 'none';
  v_sport public.sport_type;
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  if p_slug is null or length(trim(p_slug)) = 0 then raise exception 'A slug is required'; end if;
  if exists (select 1 from public.clubs where slug = p_slug) then
    raise exception 'A club with the address "%" already exists', p_slug;
  end if;

  -- Safe enum cast: unknown/blank sports become 'other' rather than erroring.
  begin
    v_sport := nullif(trim(coalesce(p_sport, '')), '')::public.sport_type;
  exception when others then
    v_sport := 'other'::public.sport_type;
  end;
  if v_sport is null then v_sport := 'other'::public.sport_type; end if;

  insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, tertiary_colour, contact_email)
  values (p_name, p_slug, v_sport, p_primary, p_secondary, p_tertiary, p_contact)
  returning id into v_club;

  -- New clubs start with Volunteer Manager on trial; other paid modules off.
  insert into public.club_modules (club_id, module_key, status)
  values (v_club, 'volunteers', 'trial')
  on conflict (club_id, module_key) do update set status = excluded.status;

  -- If the first senior admin already has an account, link them now.
  if p_admin_email is not null and length(trim(p_admin_email)) > 0 then
    select id into v_user from auth.users where lower(email) = lower(trim(p_admin_email)) limit 1;
    if v_user is not null then
      insert into public.user_club_roles (user_id, club_id, role)
      values (v_user, v_club, 'club_senior_admin')
      on conflict (user_id, club_id) do update set role = excluded.role;
      v_admin := 'linked';
    else
      v_admin := 'no_account';
    end if;
  end if;

  return json_build_object('club_id', v_club, 'slug', p_slug, 'admin', v_admin);
end $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clubs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sport_type public.sport_type NOT NULL,
    domain text,
    logo_url text,
    primary_colour text DEFAULT '#1a1a2e'::text NOT NULL,
    secondary_colour text DEFAULT '#e8c100'::text NOT NULL,
    selected_template_id uuid,
    contact_email text,
    phone text,
    address text,
    facebook_url text,
    instagram_url text,
    twitter_url text,
    youtube_url text,
    website_status public.website_status DEFAULT 'draft'::public.website_status NOT NULL,
    subscription_status public.subscription_status DEFAULT 'trial'::public.subscription_status NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_trial boolean DEFAULT false NOT NULL,
    trial_started_at timestamp with time zone,
    trial_ends_at timestamp with time zone,
    tertiary_colour text,
    account_status text DEFAULT 'demo'::text NOT NULL,
    plan text,
    onboarding_drive_url text,
    preview_token uuid DEFAULT gen_random_uuid() NOT NULL,
    preview_token_expires_at timestamp with time zone,
    is_demo boolean DEFAULT false NOT NULL,
    theme_key text,
    theme_overrides jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: COLUMN clubs.account_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clubs.account_status IS 'demo | trial | active | paused | churned (free-form; drives paying-vs-trial-vs-demo)';


--
-- Name: COLUMN clubs.plan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clubs.plan IS 'free | starter | growth | pro | association | enterprise (free-form; null until set)';


--
-- Name: admin_get_club(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_get_club(p_club uuid) RETURNS SETOF public.clubs
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;
  return query select * from public.clubs c where c.id = p_club;
end
$$;


--
-- Name: admin_get_club_by_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_get_club_by_slug(p_slug text) RETURNS SETOF public.clubs
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not (
    public.is_platform_admin()
    or public.is_club_admin((select id from public.clubs where slug = p_slug))
  ) then
    raise exception 'not authorised';
  end if;
  return query select * from public.clubs c where c.slug = p_slug;
end
$$;


--
-- Name: admin_list_clubs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_clubs() RETURNS TABLE(id uuid, name text, slug text, sport_type text, account_status text, plan text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  return query
    select c.id, c.name, c.slug, c.sport_type::text,
           coalesce(c.account_status, 'demo'), c.plan
    from public.clubs c
    order by c.name;
end $$;


--
-- Name: admin_list_modules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_modules() RETURNS TABLE(club_id uuid, module_key text, status text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  return query select m.club_id, m.module_key, m.status from public.club_modules m;
end $$;


--
-- Name: admin_list_platform_staff(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_platform_staff() RETURNS TABLE(user_id uuid, email text, full_name text, role text, granted_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public', 'auth', 'pg_temp'
    AS $$
  select r.user_id,
         u.email,
         coalesce(
           nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
           nullif(trim(u.raw_user_meta_data->>'name'), ''),
           u.email
         ) as full_name,
         r.role,
         r.created_at
  from public.platform_user_roles r
  join auth.users u on u.id = r.user_id
  where public.is_platform_admin()                 -- gate: non-admins get nothing
  order by case r.role
             when 'superadmin'        then 0
             when 'sportsweb_manager' then 1
             else 2
           end, u.email;
$$;


--
-- Name: admin_list_seasons(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_seasons(p_club uuid) RETURNS TABLE(id uuid, name text, sport text, start_date date, end_date date, is_current boolean)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select s.id, s.name, s.sport, s.start_date, s.end_date, s.is_current
    from public.seasons s
   where s.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by s.is_current desc, s.start_date desc nulls last, s.name;
$$;


--
-- Name: admin_list_teams(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_teams(p_club uuid) RETURNS TABLE(id uuid, name text, sport text, age_group text, gender text, grade text, coach_name text, status text, display_order integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select t.id, t.name, t.sport, t.age_group, t.gender,
         t.grade, t.coach_name, t.status, t.display_order
    from public.teams t
   where t.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by t.display_order nulls last, t.name;
$$;


--
-- Name: admin_recent_messages(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_recent_messages(p_limit integer DEFAULT 12) RETURNS TABLE(id uuid, club_id uuid, club_name text, channels text[], subject text, audience text, recipient_count integer, status text, created_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  return query
    select m.id, m.club_id, c.name, m.channels, m.subject, m.audience,
           m.recipient_count, m.status, m.created_at
    from public.club_messages m
    left join public.clubs c on c.id = m.club_id
    order by m.created_at desc
    limit greatest(1, least(coalesce(p_limit, 12), 50));
end $$;


--
-- Name: admin_revoke_platform_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_revoke_platform_role(p_user_id uuid, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_super boolean;
begin
  if not public.is_platform_admin() then
    raise exception 'Not authorised';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You cannot revoke your own platform access';
  end if;

  v_super := exists (
    select 1 from public.platform_user_roles
    where user_id = auth.uid() and role = 'superadmin'
  );
  if not v_super and exists (
        select 1 from public.platform_user_roles
        where user_id = p_user_id and role in ('superadmin','sportsweb_manager')
     ) then
    raise exception 'Only a Super Admin can revoke that person''s access';
  end if;

  perform set_config('app.audit_reason', coalesce(p_reason, ''), true);

  -- Removing the last Super Admin is blocked by the protect_last_superadmin trigger.
  delete from public.platform_user_roles where user_id = p_user_id;
end $$;


--
-- Name: admin_set_club_account(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_club_account(p_club_id uuid, p_account_status text, p_plan text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  update public.clubs
     set account_status = coalesce(nullif(trim(p_account_status), ''), account_status),
         plan           = nullif(trim(p_plan), '')
   where id = p_club_id;
end $$;


--
-- Name: admin_set_module(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_module(p_club uuid, p_key text, p_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  insert into public.club_modules (club_id, module_key, status)
  values (p_club, p_key, p_status)
  on conflict (club_id, module_key) do update set status = excluded.status;
end $$;


--
-- Name: admin_set_platform_role(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_platform_role(p_user_id uuid, p_role text, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_super boolean;
begin
  if not public.is_platform_admin() then
    raise exception 'Not authorised';
  end if;
  if p_user_id is null then
    raise exception 'A person is required';
  end if;
  if p_role not in ('sportsweb_manager','sportsweb_admin') then
    raise exception 'Invalid or non-assignable role: %', p_role;
  end if;

  v_super := exists (
    select 1 from public.platform_user_roles
    where user_id = auth.uid() and role = 'superadmin'
  );

  -- Only a Super Admin may grant Manager, or touch someone who is currently
  -- a Super Admin / Manager.
  if p_role = 'sportsweb_manager' and not v_super then
    raise exception 'Only a Super Admin can assign the Manager role';
  end if;
  if not v_super and exists (
        select 1 from public.platform_user_roles
        where user_id = p_user_id and role in ('superadmin','sportsweb_manager')
     ) then
    raise exception 'Only a Super Admin can change that person''s access';
  end if;

  -- Record the reason for the audit triggers (transaction-local).
  perform set_config('app.audit_reason', coalesce(p_reason, ''), true);

  -- Replace any other platform role with the target role. Removing 'superadmin'
  -- is still guarded by the protect_last_superadmin trigger.
  delete from public.platform_user_roles
    where user_id = p_user_id and role <> p_role;
  insert into public.platform_user_roles (user_id, role)
    values (p_user_id, p_role)
    on conflict (user_id, role) do nothing;
end $$;


--
-- Name: audit_email_of(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.audit_email_of(p_uid uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth', 'pg_temp'
    AS $$
declare v text;
begin
  if p_uid is null then return null; end if;
  begin
    select email into v from auth.users where id = p_uid;
  exception when others then
    v := null;
  end;
  return v;
end $$;


--
-- Name: can_manage_club_people(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_manage_club_people(p_club uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select public.is_platform_admin() or public.club_role(p_club) = 'club_senior_admin';
$$;


--
-- Name: cancel_club_invite(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_club_invite(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_club uuid;
begin
  select club_id into v_club from public.club_member_invites where id = p_id;
  if v_club is null then
    return;
  end if;
  if not public.can_manage_club_people(v_club) then
    raise exception 'not authorised';
  end if;
  delete from public.club_member_invites where id = p_id and claimed_at is null;
end;
$$;


--
-- Name: capture_lead(text, text, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.capture_lead(p_name text, p_org text, p_role text, p_sport text, p_state text, p_email text, p_phone text, p_challenge text, p_source text DEFAULT 'website'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_id uuid;
begin
  if p_email is null or position('@' in p_email) = 0 or position('.' in p_email) = 0 then
    raise exception 'A valid email is required';
  end if;
  insert into public.leads (name, org, role, sport, state, email, phone, challenge, source)
  values (nullif(trim(p_name),''), nullif(trim(p_org),''), nullif(trim(p_role),''),
          nullif(trim(p_sport),''), nullif(trim(p_state),''), trim(p_email),
          nullif(trim(p_phone),''), nullif(trim(p_challenge),''),
          coalesce(nullif(trim(p_source),''),'website'))
  returning id into v_id;
  return json_build_object('id', v_id);
end
$$;


--
-- Name: claim_member_invites(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_member_invites() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_count int := 0;
  r       record;
begin
  if v_uid is null then
    return 0;
  end if;
  select lower(email) into v_email from auth.users where id = v_uid;
  if v_email is null then
    return 0;
  end if;

  for r in
    select * from public.club_member_invites
     where claimed_at is null and lower(email) = v_email
  loop
    insert into public.user_club_roles (user_id, club_id, role, display_name, committee_title)
    values (v_uid, r.club_id, r.role, r.display_name, r.committee_title)
    on conflict (user_id, club_id) do update
      set role            = excluded.role,
          display_name    = coalesce(excluded.display_name, public.user_club_roles.display_name),
          committee_title = coalesce(excluded.committee_title, public.user_club_roles.committee_title);

    update public.club_member_invites set claimed_at = now() where id = r.id;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;


--
-- Name: claim_trial_clubs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_trial_clubs() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_uid   uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_n     int := 0;
begin
  if v_uid is null or v_email = '' then
    return json_build_object('linked', 0);
  end if;

  insert into public.user_club_roles (user_id, club_id, role)
  select v_uid, c.id, 'club_senior_admin'
    from public.clubs c
   where c.is_trial = true
     and lower(coalesce(c.contact_email, '')) = v_email
     and not exists (
       select 1 from public.user_club_roles u
       where u.user_id = v_uid and u.club_id = c.id
     );
  get diagnostics v_n = row_count;

  return json_build_object('linked', v_n);
end
$$;


--
-- Name: club_retention(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.club_retention(p_club_id uuid) RETURNS json
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_curr uuid; v_prev uuid; v_curr_name text; v_prev_name text;
  v_prev_n int := 0; v_curr_n int := 0; v_retained int := 0;
begin
  if not (public.is_platform_admin() or p_club_id in (select public.my_club_ids())) then
    raise exception 'not authorised';
  end if;

  select id, name into v_curr, v_curr_name from public.seasons
   where club_id = p_club_id
   order by is_current desc, start_date desc nulls last, name desc limit 1;
  select id, name into v_prev, v_prev_name from public.seasons
   where club_id = p_club_id and id <> coalesce(v_curr, '00000000-0000-0000-0000-000000000000')
   order by start_date desc nulls last, name desc limit 1;

  if v_curr is null or v_prev is null then
    return json_build_object('have_two_seasons', false,
      'current_season', v_curr_name, 'previous_season', v_prev_name,
      'members_prev', 0, 'members_curr', 0, 'retained', 0, 'new', 0, 'churned', 0,
      'retention_rate', 0, 'churn_rate', 0);
  end if;

  select count(distinct person_id) into v_prev_n from public.person_roles
   where club_id = p_club_id and season_id = v_prev and role = 'player';
  select count(distinct person_id) into v_curr_n from public.person_roles
   where club_id = p_club_id and season_id = v_curr and role = 'player';
  select count(*) into v_retained from (
    select person_id from public.person_roles where club_id = p_club_id and season_id = v_prev and role = 'player'
    intersect
    select person_id from public.person_roles where club_id = p_club_id and season_id = v_curr and role = 'player'
  ) t;

  return json_build_object(
    'have_two_seasons', true,
    'current_season', v_curr_name, 'previous_season', v_prev_name,
    'members_prev', v_prev_n, 'members_curr', v_curr_n,
    'retained', v_retained, 'new', greatest(v_curr_n - v_retained, 0),
    'churned', greatest(v_prev_n - v_retained, 0),
    'retention_rate', case when v_prev_n > 0 then round(100.0 * v_retained / v_prev_n) else 0 end,
    'churn_rate', case when v_prev_n > 0 then round(100.0 * (v_prev_n - v_retained) / v_prev_n) else 0 end
  );
exception when others then
  return json_build_object('have_two_seasons', false, 'current_season', null, 'previous_season', null,
    'members_prev', 0, 'members_curr', 0, 'retained', 0, 'new', 0, 'churned', 0,
    'retention_rate', 0, 'churn_rate', 0);
end $$;


--
-- Name: club_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.club_role(p_club uuid) RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select role from public.user_club_roles where user_id = auth.uid() and club_id = p_club limit 1
$$;


--
-- Name: club_setup_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.club_setup_status(p_club_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_import   boolean := false;
  v_branding boolean := false;
  v_style    boolean := false;
  v_homepage boolean := false;
  v_teams    boolean := false;
  v_invite   boolean := false;
begin
  -- Access guard: platform admins, or a member / role-holder of THIS club.
  if not (
    public.is_platform_admin()
    or exists (select 1 from public.club_users      where user_id = auth.uid() and club_id = p_club_id)
    or exists (select 1 from public.user_club_roles where user_id = auth.uid() and club_id = p_club_id)
  ) then
    raise exception 'Not authorised for this club';
  end if;

  -- club.import — site content is in (imported or entered).
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id
        and content_key in ('hero.title','about.body.0')
        and coalesce(value,'') <> ''
    ) into v_import;
  exception when others then v_import := false; end;

  -- club.branding — a logo has been set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'branding.logo' and coalesce(value,'') <> ''
    ) into v_branding;
  exception when others then v_branding := false; end;

  -- club.style — a website style/variant has been chosen.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'site.variant' and coalesce(value,'') <> ''
    ) into v_style;
  exception when others then v_style := false; end;

  -- club.homepage — the hero headline is set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'hero.title' and coalesce(value,'') <> ''
    ) into v_homepage;
  exception when others then v_homepage := false; end;

  -- club.teams — at least one team exists.
  begin
    select exists (select 1 from public.teams where club_id = p_club_id) into v_teams;
  exception when others then v_teams := false; end;

  -- club.invite — at least one person record exists for the club.
  begin
    select exists (select 1 from public.people where club_id = p_club_id) into v_invite;
  exception when others then v_invite := false; end;

  return json_build_object(
    'club.import',   v_import,
    'club.branding', v_branding,
    'club.style',    v_style,
    'club.homepage', v_homepage,
    'club.teams',    v_teams,
    'club.invite',   v_invite
  );
end
$$;


--
-- Name: create_trial_club(text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_trial_club(p_name text, p_sport text DEFAULT 'afl'::text, p_variant text DEFAULT 'heritage'::text, p_email text DEFAULT NULL::text, p_primary text DEFAULT '#1F2A44'::text, p_secondary text DEFAULT '#C8102E'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_club  uuid;
  v_base  text;
  v_slug  text;
  v_n     int := 1;
  v_sport sport_type;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'A club name is required';
  end if;
  if length(p_name) > 80 then
    raise exception 'That club name is too long';
  end if;
  if p_email is null or position('@' in p_email) = 0 or position('.' in p_email) = 0 then
    raise exception 'A valid email is required';
  end if;

  begin
    v_sport := p_sport::sport_type;
  exception when others then
    v_sport := 'other'::sport_type;
  end;

  v_base := regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  if v_base = '' then v_base := 'club'; end if;
  v_slug := v_base;
  while exists (select 1 from public.clubs where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email,
                            is_trial, trial_started_at, trial_ends_at)
  values (trim(p_name), v_slug, v_sport, coalesce(p_primary,'#1F2A44'), coalesce(p_secondary,'#C8102E'),
          nullif(trim(coalesce(p_email,'')),''),
          true, now(), now() + interval '7 days')
  returning id into v_club;

  insert into public.club_content (club_id, content_key, value)
  values (v_club, 'site.variant', coalesce(nullif(trim(p_variant),''),'heritage'))
  on conflict (club_id, content_key) do update set value = excluded.value;

  insert into public.club_modules (club_id, module_key, status)
  values (v_club, 'volunteers', 'trial')
  on conflict (club_id, module_key) do update set status = excluded.status;

  -- NO content seeding. The club starts empty and renders its honest empty states.

  return json_build_object('club_id', v_club, 'slug', v_slug, 'variant',
                           coalesce(nullif(trim(p_variant),''),'heritage'));
end
$$;


--
-- Name: delete_person_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_person_role(p_role_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_club uuid;
begin
  select club_id into v_club from public.person_roles where id = p_role_id;
  if v_club is null then return; end if;
  if not (public.is_platform_admin()
          or public.club_role(v_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised';
  end if;

  delete from public.person_roles where id = p_role_id;
end;
$$;


--
-- Name: delete_season(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_season(p_club uuid, p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_used int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;

  select count(*) into v_used from public.person_roles where season_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % member role(s) use this season. End or reassign them first.', v_used;
  end if;

  select count(*) into v_used from public.registrations where season_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % registration(s) use this season.', v_used;
  end if;

  delete from public.seasons where id = p_id and club_id = p_club;
end;
$$;


--
-- Name: delete_team(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_team(p_club uuid, p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_used int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;

  select count(*) into v_used from public.person_roles where team_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % member role(s) are linked to this team. Reassign them first.', v_used;
  end if;

  delete from public.teams where id = p_id and club_id = p_club;
end;
$$;


--
-- Name: end_person_role(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.end_person_role(p_role_id uuid, p_end_date date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_club uuid;
begin
  select club_id into v_club from public.person_roles where id = p_role_id;
  if v_club is null then raise exception 'role not found'; end if;
  if not (public.is_platform_admin()
          or public.club_role(v_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised';
  end if;

  update public.person_roles
     set status = 'ended', end_date = coalesce(p_end_date, current_date), updated_at = now()
   where id = p_role_id;
end;
$$;


--
-- Name: f2_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.f2_touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin new.updated_at := now(); return new; end;
$$;


--
-- Name: get_club_by_preview_token(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_club_by_preview_token(p_token uuid) RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select to_jsonb(x) from (
    select c.id, c.slug, c.name, c.sport_type,
           c.primary_colour, c.secondary_colour, c.tertiary_colour,
           c.logo_url, c.address, c.phone, c.contact_email,
           c.facebook_url, c.instagram_url,
           c.selected_template_id,
           c.website_status
    from public.clubs c
    where p_token is not null
      and c.preview_token = p_token
      and (c.preview_token_expires_at is null or now() < c.preview_token_expires_at)
  ) x;
$$;


--
-- Name: get_club_content_by_preview_token(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_club_content_by_preview_token(p_token uuid) RETURNS TABLE(content_key text, value text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select cc.content_key, cc.value
  from public.club_content cc
  join public.clubs c on c.id = cc.club_id
  where p_token is not null
    and c.preview_token = p_token
    and (c.preview_token_expires_at is null or now() < c.preview_token_expires_at);
$$;


--
-- Name: get_member_detail(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_member_detail(p_club uuid, p_person uuid) RETURNS json
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_admin  boolean;
  v_result json;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) is not null) then
    raise exception 'not authorised to view this member';
  end if;

  v_admin := public.is_platform_admin()
             or public.club_role(p_club) in ('club_senior_admin', 'club_admin');

  select json_build_object(
    'profile', (
      select to_json(x) from (
        select p.id, p.full_name, p.first_name, p.last_name, p.email, p.mobile,
               p.date_of_birth, p.status, p.avatar_url, p.address, p.suburb,
               p.state, p.postcode, p.member_since, p.emergency_name,
               p.emergency_phone, p.notes, p.created_at,
               (p.date_of_birth is not null
                 and age(p.date_of_birth) < interval '18 years') as is_minor
          from public.people p
         where p.id = p_person and p.club_id = p_club
      ) x
    ),
    'roles', coalesce((
      select json_agg(r) from (
        select pr.id, pr.role, pr.sport, pr.committee_title, pr.status,
               pr.start_date, pr.end_date, pr.team_id, pr.season_id,
               t.name as team_name, s.name as season_name
          from public.person_roles pr
          left join public.teams   t on t.id = pr.team_id
          left join public.seasons s on s.id = pr.season_id
         where pr.person_id = p_person and pr.club_id = p_club
         order by pr.status, pr.role
      ) r
    ), '[]'::json),
    'relationships', coalesce((
      select json_agg(rel) from (
        select prl.id, prl.relationship,
               rp.id as related_id, rp.full_name as related_name,
               (rp.date_of_birth is not null
                 and age(rp.date_of_birth) < interval '18 years') as related_is_minor
          from public.person_relationships prl
          join public.people rp on rp.id = prl.related_person_id
         where prl.person_id = p_person and prl.club_id = p_club
         order by prl.relationship
      ) rel
    ), '[]'::json),
    'compliance', case when v_admin then coalesce((
      select json_agg(c) from (
        select cr.id, cr.check_type, cr.reference_no, cr.issued_on,
               cr.expires_on, cr.status
          from public.compliance_records cr
         where cr.person_id = p_person and cr.club_id = p_club
         order by cr.expires_on nulls last
      ) c
    ), '[]'::json) else null end,
    'registrations', case when v_admin then coalesce((
      select json_agg(reg) from (
        select rg.id, rg.membership_label, rg.status, rg.payment_status,
               rg.amount_cents, rg.amount_paid_cents, rg.registered_at,
               se.name as season_name
          from public.registrations rg
          left join public.seasons se on se.id = rg.season_id
         where rg.person_id = p_person and rg.club_id = p_club
         order by rg.registered_at desc nulls last
      ) reg
    ), '[]'::json) else null end,
    'can_edit',            v_admin,
    'can_view_sensitive',  v_admin
  ) into v_result;

  return v_result;
end;
$$;


--
-- Name: invite_club_member(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invite_club_member(p_club uuid, p_email text, p_name text, p_role text, p_title text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_email text := lower(trim(p_email));
  v_role  text := case when p_role = 'club_senior_admin' then 'club_senior_admin' else 'club_admin' end;
  v_uid   uuid;
begin
  if not public.can_manage_club_people(p_club) then
    raise exception 'not authorised to manage people for this club';
  end if;
  if v_email is null or v_email = '' or position('@' in v_email) = 0 then
    raise exception 'a valid email is required';
  end if;

  select id into v_uid from auth.users where lower(email) = v_email limit 1;

  if v_uid is not null then
    -- User already exists → grant access straight away.
    insert into public.user_club_roles (user_id, club_id, role, display_name, committee_title)
    values (v_uid, p_club, v_role, nullif(trim(p_name), ''), nullif(trim(p_title), ''))
    on conflict (user_id, club_id) do update
      set role            = excluded.role,
          display_name    = coalesce(excluded.display_name, public.user_club_roles.display_name),
          committee_title = coalesce(excluded.committee_title, public.user_club_roles.committee_title);
    return 'granted';
  end if;

  -- Otherwise store a pending invite (refresh it if one already exists).
  insert into public.club_member_invites (club_id, email, role, display_name, committee_title, invited_by)
  values (p_club, v_email, v_role, nullif(trim(p_name), ''), nullif(trim(p_title), ''), auth.uid())
  on conflict (club_id, lower(email)) where claimed_at is null do update
    set role            = excluded.role,
        display_name    = excluded.display_name,
        committee_title = excluded.committee_title,
        invited_by      = excluded.invited_by,
        created_at      = now();
  return 'invited';
end;
$$;


--
-- Name: is_club_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_club_admin(p_club_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  select exists (select 1 from club_users where user_id = auth.uid() and club_id = p_club_id and role in ('club_admin','super_admin'));
$$;


--
-- Name: is_club_senior(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_club_senior(p_club uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select public.is_platform_admin()
    or exists (select 1 from public.user_club_roles
               where user_id = auth.uid() and club_id = p_club and role = 'club_senior_admin')
    or exists (select 1 from public.club_users
               where user_id = auth.uid() and club_id = p_club and role::text = 'super_admin')
$$;


--
-- Name: is_launch_operator(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_launch_operator(p_region text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.launch_operators o
    where o.user_id = auth.uid()
      and (o.region = 'national' or p_region is null or o.region = p_region)
  );
$$;


--
-- Name: is_platform_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_platform_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.platform_user_roles
    where user_id = auth.uid()
      and role in ('superadmin', 'sportsweb_manager')
  )
$$;


--
-- Name: is_site_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_site_admin(p_club_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select is_platform_admin() or is_super_admin() or is_club_admin(p_club_id);
$$;


--
-- Name: is_sportsweb_builder(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_sportsweb_builder() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.platform_user_roles
    where user_id = auth.uid()
      and role = 'sportsweb_admin'
  )
$$;


--
-- Name: is_sportsweb_manager(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_sportsweb_manager() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.platform_user_roles
    where user_id = auth.uid()
      and role in ('superadmin', 'sportsweb_manager')
  )
$$;


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  select exists (select 1 from club_users where user_id = auth.uid() and role = 'super_admin');
$$;


--
-- Name: is_superadmin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_superadmin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (select 1 from public.platform_user_roles
                 where user_id = auth.uid() and role = 'superadmin')
$$;


--
-- Name: launch_step_is_admin_only(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.launch_step_is_admin_only(p_step_key text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select coalesce(
    (select access_level = 'admin_only' from public.launch_step_catalog where step_key = p_step_key),
    true
  );
$$;


--
-- Name: list_club_invites(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_club_invites(p_club uuid) RETURNS TABLE(id uuid, email text, role text, display_name text, committee_title text, created_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.can_manage_club_people(p_club) then
    return;
  end if;
  return query
    select i.id, i.email, i.role, i.display_name, i.committee_title, i.created_at
      from public.club_member_invites i
     where i.club_id = p_club and i.claimed_at is null
     order by i.created_at desc;
end;
$$;


--
-- Name: list_club_members(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_club_members(p_club uuid) RETURNS TABLE(person_id uuid, full_name text, first_name text, last_name text, email text, mobile text, status text, date_of_birth date, is_minor boolean, roles text[], teams text[], sports text[], current_payment_status text, created_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not (public.is_platform_admin() or public.club_role(p_club) is not null) then
    raise exception 'not authorised to view members for this club';
  end if;

  return query
  select
    p.id, p.full_name, p.first_name, p.last_name, p.email, p.mobile, p.status,
    p.date_of_birth,
    (p.date_of_birth is not null and age(p.date_of_birth) < interval '18 years') as is_minor,
    coalesce(array(
      select distinct pr.role from public.person_roles pr
       where pr.person_id = p.id and pr.status = 'active' order by pr.role
    ), '{}') as roles,
    coalesce(array(
      select distinct t.name from public.person_roles pr
        join public.teams t on t.id = pr.team_id
       where pr.person_id = p.id and pr.status = 'active' and pr.team_id is not null
       order by t.name
    ), '{}') as teams,
    coalesce(array(
      select distinct pr.sport from public.person_roles pr
       where pr.person_id = p.id and pr.status = 'active' and pr.sport is not null
       order by pr.sport
    ), '{}') as sports,
    (
      select r.payment_status from public.registrations r
       where r.person_id = p.id
       order by r.registered_at desc nulls last, r.created_at desc
       limit 1
    ) as current_payment_status,
    p.created_at
  from public.people p
  where p.club_id = p_club
  order by p.full_name nulls last;
end;
$$;


--
-- Name: list_club_people(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_club_people(p_club uuid) RETURNS TABLE(user_id uuid, email text, role text, display_name text, committee_title text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.can_manage_club_people(p_club) then
    return; -- not authorised → empty result
  end if;

  return query
  with merged as (
    select ucr.user_id,
           ucr.role::text as role,
           ucr.display_name,
           ucr.committee_title,
           2 as pref
      from public.user_club_roles ucr
     where ucr.club_id = p_club
    union all
    select cu.user_id,
           case cu.role::text when 'super_admin' then 'club_senior_admin' else 'club_admin' end as role,
           cu.display_name,
           cu.committee_title,
           1 as pref
      from public.club_users cu
     where cu.club_id = p_club
  ),
  best as (
    select distinct on (m.user_id)
           m.user_id, m.role, m.display_name, m.committee_title
      from merged m
     order by m.user_id, m.pref desc
  )
  select b.user_id, u.email::text, b.role, b.display_name, b.committee_title
    from best b
    join auth.users u on u.id = b.user_id
   order by u.email;
end;
$$;


--
-- Name: list_club_seasons(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_club_seasons(p_club uuid) RETURNS TABLE(id uuid, name text, sport text, is_current boolean)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select s.id, s.name, s.sport, s.is_current
    from public.seasons s
   where s.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by s.is_current desc, s.start_date desc nulls last;
$$;


--
-- Name: list_club_teams(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.list_club_teams(p_club uuid) RETURNS TABLE(id uuid, name text, sport text, age_group text, gender text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select t.id, t.name, t.sport, t.age_group, t.gender
    from public.teams t
   where t.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by t.display_order nulls last, t.name;
$$;


--
-- Name: log_access_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_access_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_actor  uuid := auth.uid();
  v_target uuid := coalesce(new.user_id, old.user_id);
  v_scope  text := tg_argv[0];                         -- 'platform' | 'club'
  -- club_id-safe: read via to_jsonb()->>'club_id' rather than a bare
  -- new.club_id field reference. platform_user_roles has no such column, and a
  -- direct field reference fails to resolve there even inside a guarded CASE.
  -- The string-keyed jsonb lookup returns NULL when the column is absent.
  v_club   uuid := case when tg_argv[0] = 'club'
                        then (to_jsonb(coalesce(new, old)) ->> 'club_id')::uuid
                        else null end;
  v_action text;
  v_old    text := old.role;
  v_new    text := new.role;
  v_reason text := nullif(current_setting('app.audit_reason', true), '');
begin
  if tg_op = 'INSERT' then
    v_action := 'granted';  v_old := null;
  elsif tg_op = 'DELETE' then
    v_action := 'revoked';  v_new := null;
  else  -- UPDATE
    if old.role is distinct from new.role then
      v_action := 'role_changed';
    else
      return null;  -- nothing access-relevant changed; don't log noise
    end if;
  end if;

  insert into public.access_audit
    (actor_id, actor_email, scope, club_id,
     target_user_id, target_email, action, old_role, new_role, reason)
  values
    (v_actor, public.audit_email_of(v_actor), v_scope, v_club,
     v_target, public.audit_email_of(v_target), v_action, v_old, v_new, v_reason);

  return null;  -- AFTER trigger
end $$;


--
-- Name: mfa_backup_codes_remaining(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mfa_backup_codes_remaining() RETURNS integer
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select count(*)::int
    from public.mfa_backup_codes
   where user_id = auth.uid() and used_at is null;
$$;


--
-- Name: mfa_recovery_consume(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mfa_recovery_consume(p_email text, p_code_hash text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_user uuid;
  v_code uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user is null then
    return null;
  end if;

  select id into v_code
    from public.mfa_backup_codes
   where user_id = v_user and code_hash = p_code_hash and used_at is null
   limit 1;
  if v_code is null then
    return null;
  end if;

  update public.mfa_backup_codes set used_at = now() where id = v_code;
  return v_user;
end;
$$;


--
-- Name: mfa_store_backup_codes(text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mfa_store_backup_codes(p_hashes text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from public.mfa_backup_codes where user_id = auth.uid();
  insert into public.mfa_backup_codes (user_id, code_hash)
  select auth.uid(), h from unnest(p_hashes) as h where coalesce(h, '') <> '';
end;
$$;


--
-- Name: my_club_ids(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.my_club_ids() RETURNS SETOF uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select club_id from public.club_users where user_id = auth.uid()
$$;


--
-- Name: my_platform_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.my_platform_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select role from public.platform_user_roles
  where user_id = auth.uid()
  order by case role
             when 'superadmin'        then 1
             when 'sportsweb_manager' then 2
             when 'sportsweb_admin'   then 3
             else 4
           end
  limit 1
$$;


--
-- Name: platform_dashboard(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.platform_dashboard(p_scope text DEFAULT 'all'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_mine        boolean := (p_scope = 'mine');
  v_clubs_total int := 0;
  v_clubs_month int := null;
  v_clubs_live  int := 0;
  v_clubs_setup int := 0;
  v_staff_plat  int := null;
  v_staff_club  int := null;
  v_modules     int := 0;
  v_by_plan     json := '{}'::json;
  v_paying      int := 0;
  v_trial       int := 0;
  v_demo        int := 0;
  v_avg_modules numeric := 0;
  v_members     int := 0;
  v_teams       int := 0;
  v_churned     int := 0;
  v_activation  numeric := 0;
  v_conversion  numeric := 0;
  v_msgs_month  int := 0;
  v_members_month int := 0;
  v_avg_members numeric := 0;
  v_at_risk     json := '[]'::json;
begin
  if not public.is_platform_admin() then
    raise exception 'Not authorised';
  end if;

  if v_mine then
    begin
      select count(distinct club_id) into v_clubs_total
      from public.club_launches where assigned_to = auth.uid();
    exception when others then v_clubs_total := 0; end;
  else
    select count(*) into v_clubs_total from public.clubs;
    begin
      select count(*) into v_clubs_month
      from public.clubs where created_at >= date_trunc('month', now());
    exception when others then v_clubs_month := null; end;
    begin
      select count(*) into v_staff_plat from public.platform_user_roles;
    exception when others then v_staff_plat := null; end;
    begin
      select count(distinct user_id) into v_staff_club from public.user_club_roles;
    exception when others then v_staff_club := null; end;
  end if;

  begin
    select count(distinct club_id) into v_clubs_live
    from public.club_launches
    where status = 'live' and (not v_mine or assigned_to = auth.uid());
  exception when others then v_clubs_live := 0; end;

  begin
    select count(distinct club_id) into v_clubs_setup
    from public.club_launches
    where status = 'in_progress' and (not v_mine or assigned_to = auth.uid());
  exception when others then v_clubs_setup := 0; end;

  begin
    if v_mine then
      select count(*) into v_modules
      from public.club_modules m
      where m.status <> 'locked'
        and m.club_id in (select club_id from public.club_launches where assigned_to = auth.uid());
    else
      select count(*) into v_modules
      from public.club_modules where status <> 'locked';
    end if;
  exception when others then v_modules := 0; end;

  -- Account breakdowns — clubs by plan, paying/trial/demo, avg modules per club.
  -- (Whole-platform figures; not narrowed by 'mine'.)
  begin
    select coalesce(json_object_agg(plan_label, n), '{}'::json) into v_by_plan
    from (
      select coalesce(nullif(trim(plan), ''), 'unset') as plan_label, count(*) as n
      from public.clubs
      group by 1
    ) t;
  exception when others then v_by_plan := '{}'::json; end;

  begin
    select
      count(*) filter (where account_status = 'active'),
      count(*) filter (where account_status = 'trial'),
      count(*) filter (where account_status = 'demo'),
      count(*) filter (where account_status = 'churned')
    into v_paying, v_trial, v_demo, v_churned
    from public.clubs;
  exception when others then v_paying := 0; v_trial := 0; v_demo := 0; v_churned := 0; end;

  begin
    if v_clubs_total > 0 then
      v_avg_modules := round(v_modules::numeric / v_clubs_total, 1);
    else
      v_avg_modules := 0;
    end if;
  exception when others then v_avg_modules := 0; end;

  -- Platform-wide totals across every club.
  begin
    select count(*) into v_members from public.people where coalesce(status, 'active') <> 'archived';
  exception when others then v_members := 0; end;
  begin
    select count(*) into v_teams from public.teams where coalesce(status, 'active') <> 'archived';
  exception when others then v_teams := 0; end;

  -- Funnel rates + engagement (actionable SaaS metrics, not vanity counts).
  begin
    v_activation := case when v_clubs_total > 0 then round(100.0 * v_clubs_live / v_clubs_total) else 0 end;
  exception when others then v_activation := 0; end;
  begin
    v_conversion := case when (v_paying + v_trial) > 0 then round(100.0 * v_paying / (v_paying + v_trial)) else 0 end;
  exception when others then v_conversion := 0; end;
  begin
    select count(*) into v_msgs_month from public.club_messages
      where created_at >= date_trunc('month', now());
  exception when others then v_msgs_month := 0; end;
  begin
    select count(*) into v_members_month from public.people
      where created_at >= date_trunc('month', now()) and coalesce(status, 'active') <> 'archived';
  exception when others then v_members_month := 0; end;
  begin
    v_avg_members := case when v_clubs_total > 0 then round(v_members::numeric / v_clubs_total, 1) else 0 end;
  exception when others then v_avg_members := 0; end;

  -- Clubs needing attention: in-progress setups stalled (7+ days no activity)
  -- or under 40% complete.
  begin
    with prog as (
      select l.id as launch_id, l.club_id, c.name as club_name, c.slug,
             count(p.id) as total,
             count(p.id) filter (where p.status = 'done') as done,
             max(coalesce(p.checked_at, p.updated_at)) as last_activity,
             l.started_at
      from public.club_launches l
      join public.clubs c on c.id = l.club_id
      left join public.launch_step_progress p on p.launch_id = l.id
      where l.status = 'in_progress'
        and (not v_mine or l.assigned_to = auth.uid())
      group by l.id, l.club_id, c.name, c.slug, l.started_at
    )
    select coalesce(json_agg(json_build_object(
             'club_id',   club_id,
             'club_name', club_name,
             'slug',      slug,
             'pct',       case when total > 0 then round(100.0 * done / total) else 0 end,
             'reason',    case
                            when coalesce(last_activity, started_at) < now() - interval '7 days'
                              then 'No progress in 7+ days'
                            when total > 0 and (100.0 * done / total) < 40
                              then 'Setup under 40%'
                            else 'In setup'
                          end
           ) order by coalesce(last_activity, started_at) asc), '[]'::json)
      into v_at_risk
    from prog
    where coalesce(last_activity, started_at) < now() - interval '7 days'
       or (total > 0 and (100.0 * done / total) < 40);
  exception when others then v_at_risk := '[]'::json; end;

  return json_build_object(
    'scope',           case when v_mine then 'mine' else 'all' end,
    'clubs_total',     v_clubs_total,
    'clubs_new_month', v_clubs_month,
    'clubs_live',      v_clubs_live,
    'clubs_in_setup',  v_clubs_setup,
    'staff_platform',  v_staff_plat,
    'staff_club',      v_staff_club,
    'modules_enabled', v_modules,
    'clubs_by_plan',   v_by_plan,
    'clubs_paying',    v_paying,
    'clubs_trial',     v_trial,
    'clubs_demo',      v_demo,
    'clubs_churned',   v_churned,
    'avg_modules_per_club', v_avg_modules,
    'total_members',   v_members,
    'total_teams',     v_teams,
    'avg_members_per_club', v_avg_members,
    'activation_rate', v_activation,
    'conversion_rate', v_conversion,
    'messages_month',  v_msgs_month,
    'members_new_month', v_members_month,
    'at_risk',         v_at_risk
  );
end $$;


--
-- Name: platform_retention(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.platform_retention() RETURNS json
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_retained int := 0; v_prev int := 0;
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  with ranked as (
    select club_id, id as season_id,
      row_number() over (partition by club_id order by is_current desc, start_date desc nulls last, name desc) rn
    from public.seasons
  ),
  curr as (select club_id, season_id from ranked where rn = 1),
  prev as (select club_id, season_id from ranked where rn = 2),
  prevp as (
    select distinct pr.club_id, pr.person_id from public.person_roles pr
     join prev on prev.club_id = pr.club_id and prev.season_id = pr.season_id
     where pr.role = 'player'
  ),
  currp as (
    select distinct pr.club_id, pr.person_id from public.person_roles pr
     join curr on curr.club_id = pr.club_id and curr.season_id = pr.season_id
     where pr.role = 'player'
  )
  select count(*) filter (where cp.person_id is not null), count(*)
    into v_retained, v_prev
  from prevp pp
  left join currp cp on cp.club_id = pp.club_id and cp.person_id = pp.person_id;

  return json_build_object(
    'members_prev', coalesce(v_prev, 0),
    'retained', coalesce(v_retained, 0),
    'retention_rate', case when coalesce(v_prev, 0) > 0 then round(100.0 * v_retained / v_prev) else 0 end
  );
exception when others then
  return json_build_object('members_prev', 0, 'retained', 0, 'retention_rate', 0);
end $$;


--
-- Name: protect_last_superadmin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.protect_last_superadmin() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare others int;
begin
  if tg_op = 'DELETE' and old.role = 'superadmin' then
    select count(*) into others from public.platform_user_roles
      where role = 'superadmin' and user_id <> old.user_id;
    if others = 0 then raise exception 'Cannot remove the final Superadmin.'; end if;
    return old;
  end if;
  if tg_op = 'UPDATE' and old.role = 'superadmin' and new.role <> 'superadmin' then
    select count(*) into others from public.platform_user_roles
      where role = 'superadmin' and user_id <> old.user_id;
    if others = 0 then raise exception 'Cannot demote the final Superadmin.'; end if;
  end if;
  return new;
end $$;


--
-- Name: public_club_page(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text DEFAULT NULL::text) RETURNS TABLE(layout jsonb, seo jsonb, title text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_token     uuid;
  v_preview   boolean := false;
  v_published boolean := false;
begin
  if p_club_id is null or p_slug is null then return; end if;
  if p_preview_token is not null then
    begin v_token := p_preview_token::uuid; exception when others then v_token := null; end;
    if v_token is not null then
      select exists (
        select 1 from public.clubs
        where id = p_club_id and preview_token = v_token
          and (preview_token_expires_at is null or now() < preview_token_expires_at)
      ) into v_preview;
    end if;
  end if;
  if v_preview then
    return query select p.draft_layout, p.seo, p.title
      from public.club_pages p where p.club_id = p_club_id and p.slug = p_slug;
    return;
  end if;
  select (website_status = 'published') into v_published from public.clubs where id = p_club_id;
  if coalesce(v_published, false) then
    return query select p.published_layout, p.seo, p.title
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug and p.published_layout is not null;
  end if;
end;
$$;


--
-- Name: publish_club_page(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.publish_club_page(p_page_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare v_club_id uuid; v_draft jsonb;
begin
  select club_id, draft_layout into v_club_id, v_draft from public.club_pages where id = p_page_id;
  if v_club_id is null then raise exception 'Page not found'; end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club'; end if;
  update public.club_pages
     set published_layout = v_draft, published_at = now(), updated_by = auth.uid()
   where id = p_page_id;
  insert into public.club_page_versions (club_id, page_id, layout, label, created_by)
  values (v_club_id, p_page_id, v_draft, 'published', auth.uid());
  return json_build_object('page_id', p_page_id, 'published_at', now());
end;
$$;


--
-- Name: restore_club_page_version(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.restore_club_page_version(p_version_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare v_club_id uuid; v_page_id uuid; v_layout jsonb;
begin
  select club_id, page_id, layout into v_club_id, v_page_id, v_layout
    from public.club_page_versions where id = p_version_id;
  if v_club_id is null then raise exception 'Version not found'; end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club'; end if;
  update public.club_pages set draft_layout = v_layout, updated_by = auth.uid() where id = v_page_id;
  return json_build_object('page_id', v_page_id, 'restored_from', p_version_id);
end;
$$;


--
-- Name: revert_club_page(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.revert_club_page(p_page_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare v_club_id uuid; v_pub jsonb;
begin
  select club_id, published_layout into v_club_id, v_pub from public.club_pages where id = p_page_id;
  if v_club_id is null then raise exception 'Page not found'; end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club'; end if;
  if v_pub is null then raise exception 'Nothing published to revert to'; end if;
  update public.club_pages set draft_layout = v_pub, updated_by = auth.uid() where id = p_page_id;
  return json_build_object('page_id', p_page_id, 'reverted', true);
end;
$$;


--
-- Name: rotate_club_preview_token(uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rotate_club_preview_token(p_club_id uuid, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_token uuid;
begin
  if not (is_platform_admin() or is_super_admin() or is_club_admin(p_club_id)) then
    raise exception 'not authorized';
  end if;
  update public.clubs
     set preview_token = gen_random_uuid(),
         preview_token_expires_at = p_expires_at
   where id = p_club_id
   returning preview_token into v_token;
  return v_token;
end;
$$;


--
-- Name: set_club_colours(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_club_colours(p_club uuid, p_primary text, p_secondary text, p_tertiary text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;

  -- primary_colour and secondary_colour are NOT NULL on clubs.
  if p_primary is null or p_secondary is null then
    raise exception 'primary and secondary colours are required';
  end if;

  -- Validate each provided value as a 6-digit hex colour (#rrggbb). tertiary
  -- may be null (cleared), but if present it must be valid too.
  if p_primary   !~ '^#[0-9a-fA-F]{6}$'
     or p_secondary !~ '^#[0-9a-fA-F]{6}$'
     or (p_tertiary is not null and p_tertiary !~ '^#[0-9a-fA-F]{6}$') then
    raise exception 'colours must be 6-digit hex (e.g. #ed2129)';
  end if;

  update public.clubs
     set primary_colour   = p_primary,
         secondary_colour = p_secondary,
         tertiary_colour  = p_tertiary
   where id = p_club;

  if not found then
    raise exception 'club not found';
  end if;
end
$_$;


--
-- Name: set_member_committee(uuid, uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_member_committee(p_user uuid, p_club uuid, p_display_name text, p_title text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.can_manage_club_people(p_club) then
    raise exception 'not authorised to manage people for this club';
  end if;

  update public.user_club_roles
     set display_name    = nullif(trim(p_display_name), ''),
         committee_title = nullif(trim(p_title), '')
   where user_id = p_user and club_id = p_club;

  update public.club_users
     set display_name    = nullif(trim(p_display_name), ''),
         committee_title = nullif(trim(p_title), '')
   where user_id = p_user and club_id = p_club;
end;
$$;


--
-- Name: set_my_committee_profile(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_my_committee_profile(p_club uuid, p_display_name text, p_title text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update public.user_club_roles
     set display_name    = nullif(trim(p_display_name), ''),
         committee_title = nullif(trim(p_title), '')
   where user_id = auth.uid() and club_id = p_club;

  update public.club_users
     set display_name    = nullif(trim(p_display_name), ''),
         committee_title = nullif(trim(p_title), '')
   where user_id = auth.uid() and club_id = p_club;
end;
$$;


--
-- Name: set_website_status(uuid, public.website_status); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_website_status(p_club uuid, p_status public.website_status) RETURNS public.website_status
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_current website_status;
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;

  select website_status into v_current from public.clubs where id = p_club;
  if not found then
    raise exception 'club not found';
  end if;

  -- Club admins are limited to draft/published and cannot touch a suspended club.
  if not public.is_platform_admin()
     and (p_status = 'suspended' or v_current = 'suspended') then
    raise exception 'not authorised';
  end if;

  update public.clubs set website_status = p_status where id = p_club;
  return p_status;
end
$$;


--
-- Name: sitepulse_notify_new_feedback(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sitepulse_notify_new_feedback() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'sitepulse_notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'sitepulse_webhook_secret';

  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',    'application/json',
                 'x-webhook-secret', v_secret
               ),
    body    := jsonb_build_object(
                 'id',          new.id,
                 'club_id',     new.club_id,
                 'category',    new.category,
                 'urgency',     new.urgency_flag,
                 'description', left(coalesce(new.description, ''), 500),
                 'page_url',    new.page_url,
                 'user_type',   new.user_type,
                 'created_at',  new.created_at
               )
  );

  return new;
exception
  when others then
    return new;
end;
$$;


--
-- Name: start_club_launch(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.start_club_launch(p_club_id uuid, p_region text DEFAULT 'national'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_launch_id uuid;
begin
  if not (public.is_platform_admin() or public.is_launch_operator(p_region)) then
    raise exception 'not authorised to start a launch';
  end if;

  insert into public.club_launches (club_id, region)
       values (p_club_id, coalesce(p_region,'national'))
  on conflict (club_id) do update set updated_at = now()
  returning id into v_launch_id;

  insert into public.launch_step_progress (launch_id, step_key)
  select v_launch_id, c.step_key
    from public.launch_step_catalog c
   where c.active = true
  on conflict (launch_id, step_key) do nothing;

  return v_launch_id;
end;
$$;


--
-- Name: sw1_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sw1_touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: tg_lsp_stamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_lsp_stamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at := now();

  if new.status = 'done' then
    -- critical steps cannot be completed without evidence
    if (select is_critical from public.launch_step_catalog where step_key = new.step_key)
       and coalesce(new.screenshot_path,'') = '' then
      raise exception 'This step is critical and needs a screenshot before it can be completed.';
    end if;
    if old.status is distinct from 'done' then
      new.checked_by := auth.uid();
      new.checked_at := now();
    end if;
  else
    new.checked_by := null;
    new.checked_at := null;
  end if;

  return new;
end;
$$;


--
-- Name: tk_add_staff(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_add_staff(p_club_id uuid, p_email text, p_role text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_uid uuid; v_email text := lower(trim(p_email)); v_status text;
begin
  if tk_my_role(p_club_id) <> 'admin' then raise exception 'Only a club admin can manage staff'; end if;
  if p_role not in ('manager','scanner') then raise exception 'Role must be manager or scanner'; end if;
  if v_email = '' then raise exception 'Email required'; end if;

  select id into v_uid from auth.users where lower(email) = v_email limit 1;
  v_status := case when v_uid is null then 'pending' else 'active' end;

  insert into tk_staff (club_id, user_id, email, role, status, created_by)
  values (p_club_id, v_uid, v_email, p_role, v_status, auth.uid())
  on conflict (club_id, lower(email)) do update
    set role    = excluded.role,
        user_id = coalesce(tk_staff.user_id, excluded.user_id),
        status  = case when coalesce(tk_staff.user_id, excluded.user_id) is null then 'pending' else 'active' end;

  return jsonb_build_object('status', v_status, 'email', v_email, 'role', p_role);
end;
$$;


--
-- Name: tk_admit_ticket(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_admit_ticket(p_ticket_id uuid, p_gate text DEFAULT NULL::text, p_device text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare t tk_tickets%rowtype; v_type text; v_result text;
begin
    select * into t from tk_tickets where id = p_ticket_id;
    if not found then return jsonb_build_object('result','not_found'); end if;

    if tk_my_role(t.club_id) is null then
        raise exception 'Not authorised to scan for this club';
    end if;

    if t.status = 'void' then v_result := 'void';
    elsif t.status = 'refunded' then v_result := 'refunded';
    elsif t.status = 'redeemed' then v_result := 'duplicate';
    else
        update tk_tickets
           set status='redeemed', redeemed_at=now(), redeemed_by=auth.uid(), redeemed_gate=p_gate
         where id=t.id and status='valid';
        v_result := case when found then 'admitted' else 'duplicate' end;
    end if;

    insert into tk_scans (ticket_id, event_id, club_id, result, scanned_by, gate, device_id)
    values (t.id, t.event_id, t.club_id, v_result, auth.uid(), p_gate, p_device);

    select name into v_type from tk_ticket_types where id = t.ticket_type_id;
    return jsonb_build_object('result', v_result,
        'ticket', jsonb_build_object('serial_no', t.serial_no, 'type', v_type, 'holder_name', t.holder_name));
end;
$$;


--
-- Name: tk_calc_fee(uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_calc_fee(p_fee_rule_id uuid, p_subtotal_cents integer, p_ticket_count integer) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
    r tk_fee_rules%rowtype;
    v_fee integer;
begin
    if p_fee_rule_id is null then
        return 0;
    end if;
    select * into r from tk_fee_rules where id = p_fee_rule_id and is_active;
    if not found then
        return 0;
    end if;

    v_fee := round(p_subtotal_cents * r.percent_bps / 10000.0)
           + case when r.fixed_basis = 'per_ticket'
                  then r.fixed_cents * coalesce(p_ticket_count, 1)
                  else r.fixed_cents end;

    if r.min_fee_cents is not null and v_fee < r.min_fee_cents then
        v_fee := r.min_fee_cents;
    end if;
    if r.max_fee_cents is not null and v_fee > r.max_fee_cents then
        v_fee := r.max_fee_cents;
    end if;

    return greatest(v_fee, 0);
end;
$$;


--
-- Name: tk_can_view_club(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_can_view_club(p_club_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from club_users
    where club_id = p_club_id and user_id = auth.uid()
  ) or (tk_my_role(p_club_id) is not null);
$$;


--
-- Name: tk_checkout_pricing(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_checkout_pricing(p_event_id uuid, p_items jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
    v_event    tk_events%rowtype;
    v_item     jsonb;
    v_type     tk_ticket_types%rowtype;
    v_qty      integer;
    v_avail    integer;
    v_subtotal integer := 0;
    v_count    integer := 0;
    v_lines    jsonb   := '[]'::jsonb;
    v_rule     tk_fee_rules%rowtype;
    v_fee      integer := 0;
    v_acct     text;
    v_charges  boolean := false;
begin
    select * into v_event from tk_events where id = p_event_id and status = 'published';
    if not found then raise exception 'Event not available'; end if;

    for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
        v_qty := (v_item->>'quantity')::int;
        if v_qty is null or v_qty <= 0 then continue; end if;

        select * into v_type from tk_ticket_types
        where id = (v_item->>'ticket_type_id')::uuid and event_id = p_event_id and is_active;
        if not found then raise exception 'Ticket type not available'; end if;

        if (v_type.sales_start_at is not null and now() < v_type.sales_start_at)
        or (v_type.sales_end_at   is not null and now() > v_type.sales_end_at) then
            raise exception 'Sales are closed for %', v_type.name;
        end if;

        if v_type.quantity_total is not null then
            v_avail := v_type.quantity_total - v_type.quantity_sold;
            if v_qty > v_avail then raise exception 'Only % left for %', greatest(v_avail,0), v_type.name; end if;
        end if;

        if v_qty > v_type.max_per_order then
            raise exception 'Limit of % per order for %', v_type.max_per_order, v_type.name;
        end if;

        v_subtotal := v_subtotal + (v_type.price_cents * v_qty);
        v_count    := v_count + v_qty;
        v_lines := v_lines || jsonb_build_object(
            'ticket_type_id',  v_type.id,
            'name',            v_type.name,
            'quantity',        v_qty,
            'unit_price_cents',v_type.price_cents
        );
    end loop;

    -- resolve fee rule: event-specific → club-wide → platform default
    select * into v_rule from tk_fee_rules
     where is_active
       and ( event_id = p_event_id
             or (event_id is null and club_id = v_event.club_id)
             or (event_id is null and club_id is null) )
     order by (event_id = p_event_id) desc nulls last,
              (club_id  = v_event.club_id) desc nulls last
     limit 1;
    if found and v_subtotal > 0 then
        v_fee := tk_calc_fee(v_rule.id, v_subtotal, v_count);
    end if;

    select stripe_account_id, charges_enabled into v_acct, v_charges
      from tk_club_stripe where club_id = v_event.club_id;

    return jsonb_build_object(
        'club_id',               v_event.club_id,
        'currency',              v_event.currency,
        'subtotal_cents',        v_subtotal,
        'total_cents',           v_subtotal,            -- buyer pays face value
        'application_fee_cents', v_fee,                 -- platform cut (from club)
        'ticket_count',          v_count,
        'lines',                 v_lines,
        'stripe_account_id',     v_acct,
        'charges_enabled',       coalesce(v_charges, false)
    );
end;
$$;


--
-- Name: tk_claim_staff(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_claim_staff() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update tk_staff s
     set user_id = auth.uid(), status = 'active'
    from auth.users u
   where u.id = auth.uid()
     and s.user_id is null
     and lower(s.email) = lower(u.email);
end;
$$;


--
-- Name: tk_club_events(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_club_events(p_club_id uuid) RETURNS TABLE(id uuid, name text, starts_at timestamp with time zone, status text, tickets_issued bigint, tickets_in bigint, gross_cents bigint, collected_cents bigint)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    e.id, e.name, e.starts_at, e.status,
    coalesce(s.tickets_issued,   0)::bigint,
    coalesce(s.tickets_redeemed, 0)::bigint,
    coalesce(s.gross_cents,      0)::bigint,
    coalesce(s.collected_cents,  0)::bigint
  from tk_events e
  left join tk_event_sales_summary s on s.event_id = e.id
  where e.club_id = p_club_id
    and tk_can_view_club(p_club_id)
  order by e.starts_at desc nulls last;
$$;


--
-- Name: tk_club_summary(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_club_summary(p_club_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v       jsonb;
  v_agg   jsonb;
  v_next  jsonb;
begin
  if not tk_can_view_club(p_club_id) then
    raise exception 'Not authorised for this club';
  end if;

  -- event counts
  select jsonb_build_object(
    'events_total',     count(*),
    'events_published', count(*) filter (where status = 'published'),
    'events_draft',     count(*) filter (where status = 'draft'),
    'events_upcoming',  count(*) filter (
                          where status = 'published'
                            and (starts_at is null or starts_at >= now())
                        )
  )
  into v
  from tk_events
  where club_id = p_club_id;

  -- ticket + revenue totals (across all events)
  select jsonb_build_object(
    'tickets_issued',  coalesce(sum(tickets_issued),   0),
    'tickets_in',      coalesce(sum(tickets_redeemed), 0),
    'gross_cents',     coalesce(sum(gross_cents),      0),
    'collected_cents', coalesce(sum(collected_cents),  0)
  )
  into v_agg
  from tk_event_sales_summary
  where club_id = p_club_id;
  v := v || v_agg;

  -- collected in the last 30 days
  v := v || jsonb_build_object(
    'collected_30d_cents',
    (select coalesce(sum(total_cents), 0)
       from tk_orders
      where club_id = p_club_id
        and status = 'paid'
        and paid_at >= now() - interval '30 days')
  );

  -- soonest upcoming published event
  select jsonb_build_object('id', id, 'name', name, 'starts_at', starts_at)
  into v_next
  from tk_events
  where club_id = p_club_id
    and status = 'published'
    and (starts_at is null or starts_at >= now())
  order by starts_at asc nulls last
  limit 1;
  v := v || jsonb_build_object('next_event', v_next);

  return v;
end;
$$;


--
-- Name: tk_create_scan_code(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_create_scan_code(p_club_id uuid, p_event_id uuid, p_label text DEFAULT 'Gate'::text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
declare v_code text;
begin
  if tk_my_role(p_club_id) <> 'admin' then raise exception 'Only a club admin can create scan codes'; end if;
  if p_event_id is null then raise exception 'A gate code must belong to an event'; end if;
  v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  insert into tk_scan_codes (club_id, event_id, code, label, created_by)
  values (p_club_id, p_event_id, v_code, p_label, auth.uid());
  return v_code;
end;
$$;


--
-- Name: tk_events_for_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_events_for_code(p_code text) RETURNS TABLE(id uuid, name text, starts_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    with cd as (
        select * from tk_scan_codes
        where code = upper(trim(coalesce(p_code,''))) and is_active
          and (expires_at is null or now() <= expires_at)
        limit 1
    )
    select e.id, e.name, e.starts_at
    from tk_events e join cd on e.club_id = cd.club_id
    where (cd.event_id is null or e.id = cd.event_id)
      and e.status = 'published'
    order by e.starts_at nulls last;
$$;


--
-- Name: tk_feature(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_feature(p_club_id uuid, p_feature text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select tk_module_enabled(p_club_id);
$$;


--
-- Name: tk_fee_for_club(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_fee_for_club(p_club_id uuid) RETURNS TABLE(label text, percent_bps integer, fixed_cents integer, fixed_basis text, min_fee_cents integer, max_fee_cents integer)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select label, percent_bps, fixed_cents, fixed_basis, min_fee_cents, max_fee_cents
    from tk_fee_rules
    where is_active and event_id is null
      and (club_id = p_club_id or club_id is null)
    order by (club_id is not null) desc   -- club-specific first
    limit 1;
$$;


--
-- Name: tk_get_order_tickets(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_get_order_tickets(p_order_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
    o        tk_orders%rowtype;
    ev       tk_events%rowtype;
    v_list   jsonb;
begin
    select * into o from tk_orders where id = p_order_id and status = 'paid';
    if not found then
        return jsonb_build_object('found', false);
    end if;

    select * into ev from tk_events where id = o.event_id;

    select coalesce(jsonb_agg(
        jsonb_build_object(
            'id',          t.id,
            'serial_no',   t.serial_no,
            'type',        tt.name,
            'holder_name', t.holder_name,
            'status',      t.status,
            'qr',          t.id::text || '.' || t.event_id::text || '.' || t.signature
        ) order by t.serial_no
    ), '[]'::jsonb)
    into v_list
    from tk_tickets t
    join tk_ticket_types tt on tt.id = t.ticket_type_id
    where t.order_id = p_order_id;

    return jsonb_build_object(
        'found',      true,
        'order_id',   o.id,
        'buyer_name', o.buyer_name,
        'event', jsonb_build_object(
            'name',          ev.name,
            'venue_name',    ev.venue_name,
            'venue_address', ev.venue_address,
            'starts_at',     ev.starts_at,
            'timezone',      ev.timezone,
            'brand_color',   ev.ticket_template->>'brandColor'
        ),
        'tickets', v_list
    );
end;
$$;


--
-- Name: tk_has_club_role(uuid, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_has_club_role(p_club_id uuid, p_roles text[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select exists (
        select 1 from club_users cu
        where cu.club_id = p_club_id
          and cu.user_id = auth.uid()
          and cu.role::text = any(p_roles)
    );
$$;


--
-- Name: tk_is_club_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_is_club_member(p_club_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select exists (
        select 1 from club_users cu
        where cu.club_id = p_club_id
          and cu.user_id = auth.uid()
    );
$$;


--
-- Name: tk_is_platform_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_is_platform_admin(p_uid uuid) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$ select false; $$;


--
-- Name: tk_issue_tickets(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_issue_tickets(p_order_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
declare
    o         tk_orders%rowtype;
    it        tk_order_items%rowtype;
    v_secret  text;
    v_next    integer;
    i         integer;
    v_tid     uuid;
begin
    select * into o from tk_orders where id = p_order_id;
    if not found then raise exception 'Order not found'; end if;

    if exists (select 1 from tk_tickets where order_id = p_order_id) then
        return;  -- idempotent: never issue twice
    end if;

    perform pg_advisory_xact_lock(hashtext(o.event_id::text));
    select signing_secret into v_secret from tk_events where id = o.event_id;

    for it in select * from tk_order_items where order_id = p_order_id loop
        for i in 1..it.quantity loop
            v_tid := gen_random_uuid();
            select coalesce(max(serial_no),0) + 1 into v_next
              from tk_tickets where event_id = o.event_id;

            insert into tk_tickets
                (id, order_id, event_id, club_id, ticket_type_id,
                 serial_no, signature, holder_name, status)
            values
                (v_tid, p_order_id, o.event_id, o.club_id, it.ticket_type_id,
                 v_next,
                 encode(hmac(v_tid::text || '.' || o.event_id::text, v_secret, 'sha256'), 'hex'),
                 o.buyer_name,
                 'valid');
        end loop;

        update tk_ticket_types
           set quantity_sold = quantity_sold + it.quantity
         where id = it.ticket_type_id;
    end loop;
end;
$$;


--
-- Name: tk_list_scan_codes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_list_scan_codes(p_event_id uuid) RETURNS TABLE(id uuid, code text, label text, is_active boolean, created_at timestamp with time zone, expires_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select sc.id, sc.code, sc.label, sc.is_active, sc.created_at, sc.expires_at
  from tk_scan_codes sc
  join tk_events e on e.id = sc.event_id
  where sc.event_id = p_event_id
    and tk_my_role(e.club_id) in ('admin','manager')
  order by sc.created_at desc;
$$;


--
-- Name: tk_list_staff(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_list_staff(p_club_id uuid) RETURNS TABLE(id uuid, email text, role text, status text, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select s.id, coalesce(s.email, u.email) as email, s.role, s.status, s.created_at
  from tk_staff s
  left join auth.users u on u.id = s.user_id
  where s.club_id = p_club_id
    and tk_my_role(p_club_id) = 'admin'
  order by s.created_at desc;
$$;


--
-- Name: tk_module_enabled(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_module_enabled(p_club_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select exists (
        select 1 from modules m
        where m.club_id = p_club_id
          and m.module_name::text = 'ticketing'
          and m.enabled = true
    );
$$;


--
-- Name: tk_my_clubs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_my_clubs() RETURNS TABLE(id uuid, name text, slug text, primary_colour text, logo_url text)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    select c.id, c.name, c.slug, c.primary_colour, c.logo_url
    from clubs c
    where tk_is_platform_admin(auth.uid())
       or exists (select 1 from club_users cu
                   where cu.club_id = c.id and cu.user_id = auth.uid())
       or exists (select 1 from tk_staff s
                   where s.club_id = c.id and s.user_id = auth.uid() and s.role = 'manager')
    order by c.name;
$$;


--
-- Name: tk_my_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_my_role(p_club_id uuid) RETURNS text
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select case
    when tk_is_platform_admin(auth.uid()) then 'admin'
    when exists (select 1 from club_users cu
                  where cu.club_id = p_club_id and cu.user_id = auth.uid()
                    and cu.role::text = 'admin') then 'admin'
    when exists (select 1 from tk_staff s
                  where s.club_id = p_club_id and s.user_id = auth.uid()
                    and s.role = 'manager') then 'manager'
    when exists (select 1 from tk_staff s
                  where s.club_id = p_club_id and s.user_id = auth.uid()
                    and s.role = 'scanner') then 'scanner'
    else null
  end;
$$;


--
-- Name: tk_quote_order(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_quote_order(p_event_id uuid, p_items jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
    v_event    tk_events%rowtype;
    v_item     jsonb;
    v_type     tk_ticket_types%rowtype;
    v_qty      integer;
    v_avail    integer;
    v_subtotal integer := 0;
    v_count    integer := 0;
    v_lines    jsonb   := '[]'::jsonb;
begin
    select * into v_event
    from tk_events
    where id = p_event_id and status = 'published';
    if not found then
        raise exception 'Event not available';
    end if;

    for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb))
    loop
        v_qty := (v_item->>'quantity')::int;
        if v_qty is null or v_qty <= 0 then
            continue;
        end if;

        select * into v_type
        from tk_ticket_types
        where id = (v_item->>'ticket_type_id')::uuid
          and event_id = p_event_id
          and is_active;
        if not found then
            raise exception 'Ticket type not available';
        end if;

        -- sales window
        if (v_type.sales_start_at is not null and now() < v_type.sales_start_at)
        or (v_type.sales_end_at   is not null and now() > v_type.sales_end_at) then
            raise exception 'Sales are closed for %', v_type.name;
        end if;

        -- availability
        if v_type.quantity_total is not null then
            v_avail := v_type.quantity_total - v_type.quantity_sold;
            if v_qty > v_avail then
                raise exception 'Only % left for %', greatest(v_avail,0), v_type.name;
            end if;
        end if;

        -- per-order cap
        if v_qty > v_type.max_per_order then
            raise exception 'Limit of % per order for %', v_type.max_per_order, v_type.name;
        end if;

        v_subtotal := v_subtotal + (v_type.price_cents * v_qty);
        v_count    := v_count + v_qty;
        v_lines := v_lines || jsonb_build_object(
            'ticket_type_id',  v_type.id,
            'name',            v_type.name,
            'quantity',        v_qty,
            'unit_price_cents',v_type.price_cents,
            'line_total_cents',v_type.price_cents * v_qty
        );
    end loop;

    -- buyer pays face value; total == subtotal (no surcharge)
    return jsonb_build_object(
        'event_id',       p_event_id,
        'currency',       v_event.currency,
        'subtotal_cents', v_subtotal,
        'total_cents',    v_subtotal,
        'ticket_count',   v_count,
        'lines',          v_lines
    );
end;
$$;


--
-- Name: tk_remove_staff(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_remove_staff(p_staff_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_club uuid;
begin
  select club_id into v_club from tk_staff where id = p_staff_id;
  if v_club is null then return; end if;
  if tk_my_role(v_club) <> 'admin' then raise exception 'Only a club admin can manage staff'; end if;
  delete from tk_staff where id = p_staff_id;
end;
$$;


--
-- Name: tk_scan_ticket(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_scan_ticket(p_qr text, p_gate text DEFAULT NULL::text, p_device text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
declare
    v_parts text[]; v_tid uuid; v_eid uuid; v_sig text;
    t tk_tickets%rowtype; v_secret text; v_expected text; v_type text; v_result text;
begin
    v_parts := string_to_array(coalesce(p_qr,''), '.');
    if array_length(v_parts,1) <> 3 then
        return jsonb_build_object('result','invalid','message','Unrecognised code');
    end if;
    begin
        v_tid := v_parts[1]::uuid; v_eid := v_parts[2]::uuid;
    exception when others then
        return jsonb_build_object('result','invalid','message','Unrecognised code');
    end;
    v_sig := v_parts[3];

    select * into t from tk_tickets where id = v_tid;
    if not found then
        return jsonb_build_object('result','not_found','message','Ticket not found');
    end if;

    if tk_my_role(t.club_id) is null then
        raise exception 'Not authorised to scan for this club';
    end if;

    select signing_secret into v_secret from tk_events where id = t.event_id;
    v_expected := encode(hmac(t.id::text || '.' || t.event_id::text, v_secret, 'sha256'), 'hex');

    if t.event_id <> v_eid then v_result := 'wrong_event';
    elsif v_sig <> v_expected then v_result := 'invalid_sig';
    elsif t.status = 'void' then v_result := 'void';
    elsif t.status = 'refunded' then v_result := 'refunded';
    elsif t.status = 'redeemed' then v_result := 'duplicate';
    else v_result := 'admitted';
    end if;

    if v_result = 'admitted' then
        update tk_tickets
           set status='redeemed', redeemed_at=now(), redeemed_by=auth.uid(), redeemed_gate=p_gate
         where id=t.id and status='valid';
        if not found then v_result := 'duplicate'; end if;
    end if;

    insert into tk_scans (ticket_id, event_id, club_id, result, scanned_by, gate, device_id)
    values (t.id, t.event_id, t.club_id, v_result, auth.uid(), p_gate, p_device);

    select name into v_type from tk_ticket_types where id = t.ticket_type_id;
    return jsonb_build_object('result', v_result,
        'ticket', jsonb_build_object('serial_no', t.serial_no, 'type', v_type,
                                     'holder_name', t.holder_name, 'redeemed_at', t.redeemed_at));
end;
$$;


--
-- Name: tk_scan_with_code(text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_scan_with_code(p_code text, p_qr text, p_gate text DEFAULT NULL::text, p_device text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
declare
    cd tk_scan_codes%rowtype;
    v_parts text[]; v_tid uuid; v_eid uuid; v_sig text;
    t tk_tickets%rowtype; v_secret text; v_expected text; v_type text; v_result text;
begin
    select * into cd from tk_scan_codes
     where code = upper(trim(coalesce(p_code,''))) and is_active limit 1;
    if not found then
        return jsonb_build_object('result','unauthorised','message','Invalid or inactive code');
    end if;
    if cd.expires_at is not null and now() > cd.expires_at then
        return jsonb_build_object('result','unauthorised','message','Code expired');
    end if;

    v_parts := string_to_array(coalesce(p_qr,''), '.');
    if array_length(v_parts,1) <> 3 then
        return jsonb_build_object('result','invalid','message','Unrecognised code');
    end if;
    begin
        v_tid := v_parts[1]::uuid; v_eid := v_parts[2]::uuid;
    exception when others then
        return jsonb_build_object('result','invalid','message','Unrecognised code');
    end;
    v_sig := v_parts[3];

    select * into t from tk_tickets where id = v_tid;
    if not found then
        return jsonb_build_object('result','not_found','message','Ticket not found');
    end if;

    -- code must belong to the ticket's club (and event, if event-scoped)
    if t.club_id <> cd.club_id or (cd.event_id is not null and t.event_id <> cd.event_id) then
        return jsonb_build_object('result','wrong_event','message','Code not valid for this ticket');
    end if;

    select signing_secret into v_secret from tk_events where id = t.event_id;
    v_expected := encode(hmac(t.id::text || '.' || t.event_id::text, v_secret, 'sha256'), 'hex');

    if t.event_id <> v_eid then v_result := 'wrong_event';
    elsif v_sig <> v_expected then v_result := 'invalid_sig';
    elsif t.status = 'void' then v_result := 'void';
    elsif t.status = 'refunded' then v_result := 'refunded';
    elsif t.status = 'redeemed' then v_result := 'duplicate';
    else v_result := 'admitted';
    end if;

    if v_result = 'admitted' then
        update tk_tickets
           set status='redeemed', redeemed_at=now(), redeemed_gate=coalesce(p_gate, cd.label)
         where id=t.id and status='valid';
        if not found then v_result := 'duplicate'; end if;
    end if;

    insert into tk_scans (ticket_id, event_id, club_id, result, scanned_by, gate, device_id)
    values (t.id, t.event_id, t.club_id, v_result, null, coalesce(p_gate, cd.label), p_device);

    select name into v_type from tk_ticket_types where id = t.ticket_type_id;
    return jsonb_build_object('result', v_result,
        'ticket', jsonb_build_object('serial_no', t.serial_no, 'type', v_type, 'holder_name', t.holder_name));
end;
$$;


--
-- Name: tk_set_scan_code_active(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_set_scan_code_active(p_code_id uuid, p_active boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_club uuid;
begin
  select club_id into v_club from tk_scan_codes where id = p_code_id;
  if v_club is null then return; end if;
  if tk_my_role(v_club) <> 'admin' then raise exception 'Only a club admin can change scan codes'; end if;
  update tk_scan_codes set is_active = p_active where id = p_code_id;
end;
$$;


--
-- Name: tk_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tk_touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at := now(); return new; end; $$;


--
-- Name: update_member_profile(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_member_profile(p_club uuid, p_person uuid, p_patch jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not (public.is_platform_admin()
          or public.club_role(p_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised to edit members for this club';
  end if;

  update public.people p set
    full_name       = coalesce(nullif(trim(p_patch->>'full_name'), ''), p.full_name),
    email           = case when p_patch ? 'email'           then nullif(trim(p_patch->>'email'), '')           else p.email end,
    mobile          = case when p_patch ? 'mobile'          then nullif(trim(p_patch->>'mobile'), '')          else p.mobile end,
    date_of_birth   = case when p_patch ? 'date_of_birth'   then nullif(p_patch->>'date_of_birth', '')::date    else p.date_of_birth end,
    status          = coalesce(nullif(trim(p_patch->>'status'), ''), p.status),
    address         = case when p_patch ? 'address'         then nullif(trim(p_patch->>'address'), '')         else p.address end,
    suburb          = case when p_patch ? 'suburb'          then nullif(trim(p_patch->>'suburb'), '')          else p.suburb end,
    state           = case when p_patch ? 'state'           then nullif(trim(p_patch->>'state'), '')           else p.state end,
    postcode        = case when p_patch ? 'postcode'        then nullif(trim(p_patch->>'postcode'), '')        else p.postcode end,
    member_since    = case when p_patch ? 'member_since'    then nullif(p_patch->>'member_since', '')::date     else p.member_since end,
    emergency_name  = case when p_patch ? 'emergency_name'  then nullif(trim(p_patch->>'emergency_name'), '')  else p.emergency_name end,
    emergency_phone = case when p_patch ? 'emergency_phone' then nullif(trim(p_patch->>'emergency_phone'), '') else p.emergency_phone end,
    notes           = case when p_patch ? 'notes'           then nullif(trim(p_patch->>'notes'), '')           else p.notes end,
    avatar_url      = case when p_patch ? 'avatar_url'      then nullif(trim(p_patch->>'avatar_url'), '')      else p.avatar_url end,
    updated_at      = now()
  where p.id = p_person and p.club_id = p_club;
end;
$$;


--
-- Name: update_person_role(uuid, text, text, uuid, uuid, text, date, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_person_role(p_role_id uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date, p_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_club uuid;
begin
  select club_id into v_club from public.person_roles where id = p_role_id;
  if v_club is null then raise exception 'role not found'; end if;
  if not (public.is_platform_admin()
          or public.club_role(v_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised to manage roles for this club';
  end if;

  update public.person_roles set
    role            = coalesce(nullif(trim(p_role), ''), role),
    sport           = nullif(trim(p_sport), ''),
    team_id         = p_team_id,
    season_id       = p_season_id,
    committee_title = nullif(trim(p_committee_title), ''),
    start_date      = p_start_date,
    status          = coalesce(nullif(trim(p_status), ''), status),
    updated_at      = now()
  where id = p_role_id;
end;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at = now(); return new; end;
$$;


--
-- Name: upsert_season(uuid, uuid, text, text, date, date, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_season(p_club uuid, p_id uuid, p_name text, p_sport text, p_start date, p_end date, p_is_current boolean) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_id uuid;
  v_sport text := nullif(trim(p_sport), '');
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Season name is required';
  end if;

  if p_id is null then
    insert into public.seasons (club_id, name, sport, start_date, end_date, is_current)
    values (p_club, trim(p_name), v_sport, p_start, p_end, coalesce(p_is_current, false))
    returning id into v_id;
  else
    update public.seasons
       set name = trim(p_name),
           sport = v_sport,
           start_date = p_start,
           end_date = p_end,
           is_current = coalesce(p_is_current, false)
     where id = p_id and club_id = p_club
    returning id into v_id;
    if v_id is null then
      raise exception 'Season not found';
    end if;
  end if;

  -- Only one current season per club + sport.
  if coalesce(p_is_current, false) then
    update public.seasons
       set is_current = false
     where club_id = p_club
       and id <> v_id
       and coalesce(sport, '') = coalesce(v_sport, '');
  end if;

  return v_id;
end;
$$;


--
-- Name: upsert_team(uuid, uuid, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_team(p_club uuid, p_id uuid, p_name text, p_sport text, p_age_group text, p_gender text, p_grade text, p_coach text, p_status text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_id uuid;
  v_slug text;
  v_ord int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Team name is required';
  end if;

  if p_id is null then
    v_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
    if coalesce(v_slug, '') = '' then
      v_slug := 'team';
    end if;
    if exists (select 1 from public.teams where club_id = p_club and slug = v_slug) then
      v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
    end if;
    select coalesce(max(display_order), 0) + 1 into v_ord from public.teams where club_id = p_club;

    insert into public.teams (
      club_id, name, slug, sport, age_group, gender, grade, coach_name, status, display_order
    ) values (
      p_club, trim(p_name), v_slug,
      nullif(trim(p_sport), ''), nullif(trim(p_age_group), ''), nullif(trim(p_gender), ''),
      nullif(trim(p_grade), ''), nullif(trim(p_coach), ''),
      coalesce(nullif(trim(p_status), ''), 'draft')::content_status, v_ord
    )
    returning id into v_id;
  else
    update public.teams
       set name = trim(p_name),
           sport = nullif(trim(p_sport), ''),
           age_group = nullif(trim(p_age_group), ''),
           gender = nullif(trim(p_gender), ''),
           grade = nullif(trim(p_grade), ''),
           coach_name = nullif(trim(p_coach), ''),
           status = coalesce(nullif(trim(p_status), '')::content_status, status)
     where id = p_id and club_id = p_club
    returning id into v_id;
    if v_id is null then
      raise exception 'Team not found';
    end if;
  end if;

  return v_id;
end;
$$;


--
-- Name: vm_effective_features(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_effective_features(p_club uuid) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_key text; v_cfg jsonb; v_feat jsonb;
begin
  if not public.vm_module_enabled(p_club) then return '{}'::jsonb; end if;
  select plan_key, config into v_key, v_cfg from public.volunteer_settings where club_id = p_club limit 1;
  v_key := coalesce(v_key, 'vm_free');
  select features into v_feat from public.volunteer_plans where key = v_key limit 1;
  if v_feat is null then select features into v_feat from public.volunteer_plans where key = 'vm_free' limit 1; end if;
  return jsonb_build_object(
    'flags',  coalesce(v_feat->'flags','{}'::jsonb)  || coalesce(v_cfg->'flags','{}'::jsonb),
    'limits', coalesce(v_feat->'limits','{}'::jsonb) || coalesce(v_cfg->'limits','{}'::jsonb),
    'plan',   v_key);
end $$;


--
-- Name: vm_feature(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_feature(p_club uuid, p_key text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select coalesce((public.vm_effective_features(p_club)->'flags'->>p_key)::boolean, false);
$$;


--
-- Name: vm_is_club_member(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_is_club_member(p_club uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.club_users cu
    where cu.club_id = p_club and cu.user_id = auth.uid()
  );
$$;


--
-- Name: vm_limit(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_limit(p_club uuid, p_key text) RETURNS integer
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select (public.vm_effective_features(p_club)->'limits'->>p_key)::int;
$$;


--
-- Name: vm_marketing_opt_in_by_mobile(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_marketing_opt_in_by_mobile(p_mobile text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare n int; v_last text;
begin
  v_last := right(regexp_replace(coalesce(p_mobile,''),'\D','','g'),9);
  if length(v_last) < 8 then return 0; end if;
  update people set marketing_opt_out=false, marketing_opt_out_at=null, sms_marketing_consent=true
   where right(regexp_replace(coalesce(mobile,''),'\D','','g'),9)=v_last;
  get diagnostics n = row_count; return n;
end; $$;


--
-- Name: vm_marketing_opt_out_by_mobile(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_marketing_opt_out_by_mobile(p_mobile text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare n int; v_last text;
begin
  v_last := right(regexp_replace(coalesce(p_mobile,''),'\D','','g'),9);
  if length(v_last) < 8 then return 0; end if;
  update people set marketing_opt_out=true, marketing_opt_out_at=now(), sms_marketing_consent=false
   where right(regexp_replace(coalesce(mobile,''),'\D','','g'),9)=v_last;
  get diagnostics n = row_count; return n;
end; $$;


--
-- Name: vm_module_enabled(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_module_enabled(p_club uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.modules m
    where m.club_id = p_club and m.module_name::text = 'volunteers' and m.enabled = true
  );
$$;


--
-- Name: vm_sms_quota(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_sms_quota(p_club uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_included int; v_trial int; v_trial_active boolean; v_credits int; v_used int; v_monthly int;
begin
  select nullif(vp.features->'limits'->>'sms_monthly','')::int, coalesce(vs.trial_sms_allowance,0),
         (vs.trial_ends_at is not null and vs.trial_ends_at > now()), coalesce(vs.sms_credit_balance,0)
    into v_included, v_trial, v_trial_active, v_credits
  from volunteer_settings vs left join volunteer_plans vp on vp.key = vs.plan_key where vs.club_id = p_club;
  v_included:=coalesce(v_included,0); v_trial:=coalesce(v_trial,0); v_trial_active:=coalesce(v_trial_active,false); v_credits:=coalesce(v_credits,0);
  select count(*) into v_used from volunteer_message_recipients
   where club_id=p_club and channel='sms' and sent_at >= date_trunc('month', now());
  v_monthly := case when v_trial_active then v_trial else v_included end;
  return jsonb_build_object('used',coalesce(v_used,0),'monthly',v_monthly,'credits',v_credits,
    'allowance',v_monthly+v_credits,'remaining',greatest(0,v_monthly-coalesce(v_used,0))+v_credits,
    'trial',v_trial_active,'plan_included',v_included);
end; $$;


--
-- Name: vm_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vm_touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at = now(); return new; end;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: access_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_audit (
    id bigint NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    actor_id uuid,
    actor_email text,
    scope text NOT NULL,
    club_id uuid,
    target_user_id uuid NOT NULL,
    target_email text,
    action text NOT NULL,
    old_role text,
    new_role text,
    reason text,
    CONSTRAINT access_audit_action_check CHECK ((action = ANY (ARRAY['granted'::text, 'role_changed'::text, 'revoked'::text]))),
    CONSTRAINT access_audit_scope_check CHECK ((scope = ANY (ARRAY['platform'::text, 'club'::text])))
);


--
-- Name: TABLE access_audit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.access_audit IS 'Append-only governance log of platform/club access grants, role changes and revocations. Rows are never updated or deleted.';


--
-- Name: access_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.access_audit ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.access_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: club_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_content (
    club_id uuid NOT NULL,
    content_key text NOT NULL,
    value text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: club_launches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_launches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    status text DEFAULT 'in_progress'::text NOT NULL,
    region text DEFAULT 'national'::text NOT NULL,
    assigned_to uuid,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    went_live_at timestamp with time zone,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT club_launches_status_check CHECK ((status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'paused'::text, 'live'::text])))
);


--
-- Name: club_member_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_member_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'club_admin'::text NOT NULL,
    display_name text,
    committee_title text,
    invited_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    claimed_at timestamp with time zone,
    CONSTRAINT club_member_invites_role_check CHECK ((role = ANY (ARRAY['club_senior_admin'::text, 'club_admin'::text])))
);


--
-- Name: club_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    channels text[] DEFAULT '{}'::text[] NOT NULL,
    subject text,
    body text NOT NULL,
    audience text,
    recipient_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: club_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_modules (
    club_id uuid NOT NULL,
    module_key text NOT NULL,
    status text DEFAULT 'enabled'::text NOT NULL,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: club_modules_backup_20260622; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_modules_backup_20260622 (
    club_id uuid,
    module_key text,
    status text,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone
);


--
-- Name: club_needs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_needs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    filled_by text,
    recommended_variant text,
    modules_interest text[],
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT club_needs_filled_by_check CHECK (((filled_by IS NULL) OR (filled_by = ANY (ARRAY['club'::text, 'admin'::text])))),
    CONSTRAINT club_needs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'complete'::text])))
);


--
-- Name: club_onboarding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_onboarding (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    club_name text,
    contact_name text,
    contact_email text,
    status text DEFAULT 'submitted'::text NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    page_url text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: club_page_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_page_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    page_id uuid NOT NULL,
    layout jsonb NOT NULL,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: club_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    nav_label text,
    nav_order integer,
    nav_visible boolean DEFAULT true NOT NULL,
    nav_parent_id uuid,
    is_home boolean DEFAULT false NOT NULL,
    seo jsonb DEFAULT '{}'::jsonb NOT NULL,
    draft_layout jsonb DEFAULT '[]'::jsonb NOT NULL,
    published_layout jsonb,
    published_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid
);


--
-- Name: club_themes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    tokens jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_preset boolean DEFAULT true NOT NULL
);


--
-- Name: club_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.user_role DEFAULT 'club_admin'::public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name text,
    committee_title text
);


--
-- Name: compliance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    check_type text NOT NULL,
    reference_no text,
    document_id uuid,
    issued_on date,
    expires_on date,
    verified_by uuid,
    verified_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    image_url text,
    ticket_url text,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    featured boolean DEFAULT false,
    tag text,
    tickets_url text,
    map_url text,
    video_url text
);


--
-- Name: injuries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.injuries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    injury_type text DEFAULT 'general'::text NOT NULL,
    occurred_on date DEFAULT CURRENT_DATE NOT NULL,
    description text,
    status text DEFAULT 'open'::text NOT NULL,
    is_concussion boolean DEFAULT false NOT NULL,
    rtp_stage smallint DEFAULT 0 NOT NULL,
    medical_clearance boolean DEFAULT false NOT NULL,
    cleared_on date,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT injuries_injury_type_check CHECK ((injury_type = ANY (ARRAY['general'::text, 'soft_tissue'::text, 'fracture'::text, 'concussion'::text, 'other'::text]))),
    CONSTRAINT injuries_status_check CHECK ((status = ANY (ARRAY['open'::text, 'recovering'::text, 'cleared'::text])))
);


--
-- Name: ladder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ladder (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    grade text DEFAULT 'Seniors'::text NOT NULL,
    "position" integer,
    team text NOT NULL,
    logo text,
    played integer DEFAULT 0,
    won integer DEFAULT 0,
    lost integer DEFAULT 0,
    drawn integer DEFAULT 0,
    points integer DEFAULT 0,
    percentage numeric DEFAULT 0,
    is_own boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: launch_operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_operators (
    user_id uuid NOT NULL,
    region text DEFAULT 'national'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);


--
-- Name: launch_phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_phases (
    phase_no integer NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    summary text,
    sort integer DEFAULT 0 NOT NULL
);


--
-- Name: launch_step_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_step_catalog (
    step_key text NOT NULL,
    phase_no integer NOT NULL,
    title text NOT NULL,
    help_md text,
    is_critical boolean DEFAULT false NOT NULL,
    access_level text DEFAULT 'operator'::text NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    audience text DEFAULT 'operator'::text NOT NULL,
    expected_label text,
    cta_route text,
    CONSTRAINT launch_step_catalog_access_level_check CHECK ((access_level = ANY (ARRAY['admin_only'::text, 'operator'::text]))),
    CONSTRAINT launch_step_catalog_audience_check CHECK ((audience = ANY (ARRAY['operator'::text, 'club'::text, 'both'::text])))
);


--
-- Name: launch_step_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_step_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    launch_id uuid NOT NULL,
    step_key text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    checked_by uuid,
    checked_at timestamp with time zone,
    screenshot_path text,
    notes text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT launch_step_progress_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'done'::text, 'skipped'::text, 'blocked'::text])))
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    org text,
    role text,
    sport text,
    state text,
    email text NOT NULL,
    phone text,
    challenge text,
    source text DEFAULT 'website'::text NOT NULL
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    grade text DEFAULT 'Seniors'::text NOT NULL,
    round text,
    match_date timestamp with time zone,
    opponent text NOT NULL,
    opponent_logo text,
    home_away text DEFAULT 'Home'::text,
    our_score integer,
    opponent_score integer,
    status text DEFAULT 'scheduled'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mfa_backup_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mfa_backup_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code_hash text NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    module_name public.module_name NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    external_url text,
    label text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    summary text,
    content text,
    featured_image_url text,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    author text,
    image_url text,
    video_url text
);


--
-- Name: people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    user_id uuid,
    full_name text NOT NULL,
    first_name text,
    last_name text,
    email text,
    mobile text,
    date_of_birth date,
    roles text[] DEFAULT '{}'::text[],
    emergency_name text,
    emergency_phone text,
    notes text,
    tags text[] DEFAULT '{}'::text[],
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sms_marketing_consent boolean DEFAULT false NOT NULL,
    email_marketing_consent boolean DEFAULT false NOT NULL,
    marketing_opt_out boolean DEFAULT false NOT NULL,
    marketing_opt_out_at timestamp with time zone,
    unsubscribe_token uuid DEFAULT gen_random_uuid() NOT NULL,
    avatar_url text,
    address text,
    suburb text,
    state text,
    postcode text,
    member_since date,
    is_public boolean DEFAULT false NOT NULL,
    CONSTRAINT people_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])))
);


--
-- Name: person_compliance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_compliance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    type text NOT NULL,
    identifier text,
    issued_on date,
    expires_on date,
    status text DEFAULT 'valid'::text NOT NULL,
    notes text,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT person_compliance_status_check CHECK ((status = ANY (ARRAY['valid'::text, 'expiring'::text, 'expired'::text, 'pending'::text, 'na'::text]))),
    CONSTRAINT person_compliance_type_check CHECK ((type = ANY (ARRAY['wwcc'::text, 'first_aid'::text, 'coaching_accreditation'::text, 'police_check'::text, 'member_protection'::text, 'other'::text])))
);


--
-- Name: person_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_relationships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    related_person_id uuid,
    related_name text,
    related_email text,
    related_mobile text,
    relationship text DEFAULT 'guardian'::text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT person_relationships_relationship_check CHECK ((relationship = ANY (ARRAY['guardian'::text, 'parent'::text, 'emergency'::text, 'partner'::text, 'sibling'::text, 'other'::text])))
);


--
-- Name: person_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.person_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    role text NOT NULL,
    sport text,
    team_id uuid,
    season_id uuid,
    committee_title text,
    start_date date,
    end_date date,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_admins (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_user_roles (
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT platform_user_roles_role_v2 CHECK ((role = ANY (ARRAY['superadmin'::text, 'sportsweb_manager'::text, 'sportsweb_admin'::text])))
);


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    season_id uuid,
    registration_type text DEFAULT 'player'::text NOT NULL,
    membership_label text,
    status text DEFAULT 'pending'::text NOT NULL,
    amount_cents integer DEFAULT 0 NOT NULL,
    amount_paid_cents integer DEFAULT 0 NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    payment_ref text,
    registered_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT registrations_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'part_paid'::text, 'paid'::text, 'refunded'::text, 'waived'::text]))),
    CONSTRAINT registrations_registration_type_check CHECK ((registration_type = ANY (ARRAY['player'::text, 'member'::text, 'official'::text, 'coach'::text, 'volunteer'::text]))),
    CONSTRAINT registrations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'lapsed'::text, 'cancelled'::text])))
);


--
-- Name: sales_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    category text DEFAULT 'software'::text NOT NULL,
    avg_deal_value numeric DEFAULT 0 NOT NULL,
    is_placeholder boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    sort integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_targets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    product_key text,
    period text DEFAULT 'monthly'::text NOT NULL,
    revenue_target numeric DEFAULT 0 NOT NULL,
    avg_deal_value numeric DEFAULT 0 NOT NULL,
    close_rate numeric DEFAULT 0.30 NOT NULL,
    show_rate numeric DEFAULT 0.80 NOT NULL,
    booking_rate numeric DEFAULT 0.25 NOT NULL,
    contact_rate numeric DEFAULT 0.35 NOT NULL,
    cta_conversion_rate numeric DEFAULT 0.05 NOT NULL,
    is_placeholder boolean DEFAULT false NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    name text NOT NULL,
    start_date date,
    end_date date,
    is_current boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sport text
);


--
-- Name: sitepulse_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sitepulse_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feedback_id uuid NOT NULL,
    club_id uuid NOT NULL,
    author_type text NOT NULL,
    author_id uuid,
    visibility text DEFAULT 'internal'::text NOT NULL,
    body text NOT NULL,
    attachment_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sitepulse_comments_author_type_check CHECK ((author_type = ANY (ARRAY['team'::text, 'club'::text, 'system'::text]))),
    CONSTRAINT sitepulse_comments_visibility_check CHECK ((visibility = ANY (ARRAY['internal'::text, 'client_visible'::text])))
);


--
-- Name: sitepulse_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sitepulse_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    source text DEFAULT 'report'::text NOT NULL,
    page_url text,
    title text,
    description text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    attachment_url text,
    submitted_by_name text,
    submitted_by_email text,
    submitted_by_role text,
    user_type text DEFAULT 'public'::text NOT NULL,
    device_type text,
    browser text,
    os text,
    viewport text,
    status text DEFAULT 'new'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    urgency_flag boolean DEFAULT false NOT NULL,
    contact_requested boolean DEFAULT false NOT NULL,
    assigned_to uuid,
    ai_summary text,
    ai_recommended_action text,
    ai_responsibility text,
    ai_confidence numeric,
    status_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT sitepulse_feedback_ai_confidence_check CHECK (((ai_confidence >= (0)::numeric) AND (ai_confidence <= (1)::numeric))),
    CONSTRAINT sitepulse_feedback_ai_responsibility_check CHECK ((ai_responsibility = ANY (ARRAY['club'::text, 'sportsweb'::text, 'template'::text]))),
    CONSTRAINT sitepulse_feedback_category_check CHECK ((category = ANY (ARRAY['spelling'::text, 'broken_link'::text, 'incorrect_info'::text, 'missing_info'::text, 'image_logo'::text, 'mobile_display'::text, 'desktop_display'::text, 'sports_data'::text, 'sponsor'::text, 'event_ticketing'::text, 'store'::text, 'accessibility'::text, 'improvement'::text, 'bug'::text, 'other'::text]))),
    CONSTRAINT sitepulse_feedback_device_type_check CHECK ((device_type = ANY (ARRAY['mobile'::text, 'tablet'::text, 'desktop'::text]))),
    CONSTRAINT sitepulse_feedback_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT sitepulse_feedback_source_check CHECK ((source = ANY (ARRAY['report'::text, 'onboarding'::text]))),
    CONSTRAINT sitepulse_feedback_status_check CHECK ((status = ANY (ARRAY['new'::text, 'needs_review'::text, 'accepted'::text, 'in_progress'::text, 'waiting_on_club'::text, 'waiting_on_sportsweb'::text, 'resolved'::text, 'rejected'::text, 'archived'::text]))),
    CONSTRAINT sitepulse_feedback_user_type_check CHECK ((user_type = ANY (ARRAY['public'::text, 'club_admin'::text, 'committee'::text, 'sportsweb'::text])))
);


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    name text NOT NULL,
    logo_url text,
    website_url text,
    sponsor_level public.sponsor_level DEFAULT 'supporter'::public.sponsor_level NOT NULL,
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    blurb text,
    in_carousel boolean DEFAULT true
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    team_id uuid NOT NULL,
    person_id uuid NOT NULL,
    season_id uuid,
    role text DEFAULT 'player'::text NOT NULL,
    jumper_no text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT team_members_role_check CHECK ((role = ANY (ARRAY['player'::text, 'captain'::text, 'vice_captain'::text, 'coach'::text, 'assistant_coach'::text, 'manager'::text, 'official'::text]))),
    CONSTRAINT team_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])))
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    club_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    age_group text,
    gender text,
    grade text,
    coach_name text,
    training_details text,
    description text,
    hero_image_url text,
    display_order integer DEFAULT 0 NOT NULL,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    video_url text,
    sport text
);


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sport_type public.sport_type,
    description text,
    preview_image_url text,
    template_key text NOT NULL,
    status public.template_status DEFAULT 'draft'::public.template_status NOT NULL,
    package_level public.package_level DEFAULT 'starter'::public.package_level NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tk_club_stripe; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_club_stripe (
    club_id uuid NOT NULL,
    stripe_account_id text NOT NULL,
    charges_enabled boolean DEFAULT false NOT NULL,
    details_submitted boolean DEFAULT false NOT NULL,
    payouts_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tk_event_sales_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.tk_event_sales_summary AS
SELECT
    NULL::uuid AS event_id,
    NULL::uuid AS club_id,
    NULL::text AS name,
    NULL::text AS status,
    NULL::bigint AS paid_orders,
    NULL::bigint AS gross_cents,
    NULL::bigint AS fees_cents,
    NULL::bigint AS collected_cents,
    NULL::bigint AS tickets_issued,
    NULL::bigint AS tickets_redeemed,
    NULL::bigint AS door_orders;


--
-- Name: tk_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    venue_name text,
    venue_address text,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    timezone text DEFAULT 'Australia/Melbourne'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    capacity integer,
    is_free boolean DEFAULT false NOT NULL,
    currency text DEFAULT 'aud'::text NOT NULL,
    cover_image_url text,
    ticket_template jsonb DEFAULT '{}'::jsonb NOT NULL,
    signing_secret text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tk_events_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text, 'completed'::text])))
);


--
-- Name: tk_fee_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_fee_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    event_id uuid,
    label text DEFAULT 'Standard fee'::text NOT NULL,
    percent_bps integer DEFAULT 0 NOT NULL,
    fixed_cents integer DEFAULT 0 NOT NULL,
    fixed_basis text DEFAULT 'per_order'::text NOT NULL,
    min_fee_cents integer,
    max_fee_cents integer,
    face_min_cents integer,
    face_max_cents integer,
    absorbed_by text DEFAULT 'buyer'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tk_fee_rules_absorbed_by_check CHECK ((absorbed_by = ANY (ARRAY['buyer'::text, 'club'::text]))),
    CONSTRAINT tk_fee_rules_fixed_basis_check CHECK ((fixed_basis = ANY (ARRAY['per_order'::text, 'per_ticket'::text])))
);


--
-- Name: tk_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    ticket_type_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price_cents integer NOT NULL,
    CONSTRAINT tk_order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: tk_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    event_id uuid NOT NULL,
    buyer_name text,
    buyer_email text,
    buyer_phone text,
    channel text DEFAULT 'online'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal_cents integer DEFAULT 0 NOT NULL,
    fee_cents integer DEFAULT 0 NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    fee_absorbed_by text DEFAULT 'buyer'::text NOT NULL,
    stripe_payment_intent_id text,
    stripe_checkout_session_id text,
    sold_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone,
    CONSTRAINT tk_orders_channel_check CHECK ((channel = ANY (ARRAY['online'::text, 'door_cash'::text, 'door_card'::text, 'comp'::text]))),
    CONSTRAINT tk_orders_fee_absorbed_by_check CHECK ((fee_absorbed_by = ANY (ARRAY['buyer'::text, 'club'::text]))),
    CONSTRAINT tk_orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'cancelled'::text])))
);


--
-- Name: tk_scan_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_scan_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    event_id uuid,
    code text NOT NULL,
    label text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: tk_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid,
    event_id uuid NOT NULL,
    club_id uuid NOT NULL,
    result text NOT NULL,
    scanned_by uuid,
    gate text,
    device_id text,
    scanned_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tk_scans_result_check CHECK ((result = ANY (ARRAY['admitted'::text, 'duplicate'::text, 'invalid_sig'::text, 'wrong_event'::text, 'void'::text, 'refunded'::text, 'not_found'::text])))
);


--
-- Name: tk_staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    user_id uuid,
    role text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    status text DEFAULT 'active'::text NOT NULL,
    CONSTRAINT tk_staff_role_check CHECK ((role = ANY (ARRAY['manager'::text, 'scanner'::text]))),
    CONSTRAINT tk_staff_status_chk CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text])))
);


--
-- Name: tk_ticket_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_ticket_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    club_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price_cents integer DEFAULT 0 NOT NULL,
    quantity_total integer,
    quantity_sold integer DEFAULT 0 NOT NULL,
    max_per_order integer DEFAULT 10 NOT NULL,
    sales_start_at timestamp with time zone,
    sales_end_at timestamp with time zone,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    fee_rule_id uuid,
    template_override jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tk_ticket_types_check CHECK (((quantity_total IS NULL) OR (quantity_sold <= quantity_total)))
);


--
-- Name: tk_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tk_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    event_id uuid NOT NULL,
    club_id uuid NOT NULL,
    ticket_type_id uuid NOT NULL,
    serial_no integer,
    signature text NOT NULL,
    holder_name text,
    status text DEFAULT 'valid'::text NOT NULL,
    redeemed_at timestamp with time zone,
    redeemed_by uuid,
    redeemed_gate text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tk_tickets_status_check CHECK ((status = ANY (ARRAY['valid'::text, 'redeemed'::text, 'void'::text, 'refunded'::text])))
);


--
-- Name: trial_email_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trial_email_log (
    club_id uuid NOT NULL,
    stage text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_club_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_club_roles (
    user_id uuid NOT NULL,
    club_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name text,
    committee_title text,
    CONSTRAINT user_club_roles_role_check CHECK ((role = ANY (ARRAY['club_senior_admin'::text, 'club_admin'::text])))
);


--
-- Name: v_club_launch_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_club_launch_status AS
SELECT
    NULL::uuid AS launch_id,
    NULL::uuid AS club_id,
    NULL::text AS club_name,
    NULL::text AS club_slug,
    NULL::text AS status,
    NULL::text AS region,
    NULL::timestamp with time zone AS started_at,
    NULL::timestamp with time zone AS went_live_at,
    NULL::bigint AS steps_total,
    NULL::bigint AS steps_done,
    NULL::timestamp with time zone AS last_activity,
    NULL::integer AS current_phase,
    NULL::numeric AS days_to_live;


--
-- Name: v_club_people; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_club_people WITH (security_invoker='true') AS
 SELECT id AS person_id,
    club_id,
    full_name,
    first_name,
    last_name,
    email,
    mobile,
    date_of_birth,
    roles,
    status,
    (EXISTS ( SELECT 1
           FROM public.registrations r
          WHERE ((r.person_id = p.id) AND (r.status = 'active'::text)))) AS is_registered,
    ( SELECT count(*) AS count
           FROM public.team_members tm
          WHERE ((tm.person_id = p.id) AND (tm.status = 'active'::text))) AS active_teams,
    (EXISTS ( SELECT 1
           FROM public.person_compliance c
          WHERE ((c.person_id = p.id) AND (c.type = 'wwcc'::text) AND (c.status = 'valid'::text)))) AS wwcc_valid,
    (EXISTS ( SELECT 1
           FROM public.person_compliance c
          WHERE ((c.person_id = p.id) AND (c.expires_on IS NOT NULL) AND (c.expires_on <= (CURRENT_DATE + 30))))) AS compliance_due_soon,
    (EXISTS ( SELECT 1
           FROM public.injuries i
          WHERE ((i.person_id = p.id) AND (i.status <> 'cleared'::text)))) AS has_open_injury,
    (EXISTS ( SELECT 1
           FROM public.injuries i
          WHERE ((i.person_id = p.id) AND i.is_concussion AND (i.status <> 'cleared'::text)))) AS active_concussion
   FROM public.people p;


--
-- Name: volunteer_ai_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_ai_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    type text,
    title text,
    summary text,
    payload jsonb DEFAULT '{}'::jsonb,
    confidence numeric(4,3),
    target_table text,
    target_id uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    status text DEFAULT 'needs_review'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_ai_suggestions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'needs_review'::text, 'approved'::text, 'dismissed'::text, 'actioned'::text])))
);


--
-- Name: volunteer_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    opportunity_id uuid,
    person_id uuid,
    volunteer_id uuid,
    response text,
    applicant_name text,
    applicant_mobile text,
    applicant_email text,
    message text,
    status text DEFAULT 'new'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_applications_response_check CHECK ((response = ANY (ARRAY['hand_up'::text, 'ask_next_time'::text, 'occasional'::text, 'share_only'::text, 'offer_skill'::text]))),
    CONSTRAINT volunteer_applications_status_check CHECK ((status = ANY (ARRAY['new'::text, 'under_review'::text, 'approved'::text, 'declined'::text, 'withdrawn'::text])))
);


--
-- Name: volunteer_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    recurring boolean DEFAULT true,
    day_of_week integer,
    on_date date,
    start_time time without time zone,
    end_time time without time zone,
    note text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_availability_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: volunteer_compliance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_compliance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    check_type text NOT NULL,
    reference_no text,
    document_id uuid,
    issued_on date,
    expires_on date,
    verified_by uuid,
    verified_at timestamp with time zone,
    status text DEFAULT 'pending_review'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_compliance_records_status_check CHECK ((status = ANY (ARRAY['valid'::text, 'expiring_soon'::text, 'expired'::text, 'not_required'::text, 'missing'::text, 'pending_review'::text])))
);


--
-- Name: volunteer_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid,
    kind text,
    title text,
    storage_path text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_documents_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'archived'::text])))
);


--
-- Name: volunteer_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    volunteer_id uuid,
    shift_id uuid,
    survey_type text,
    rating integer,
    responses jsonb DEFAULT '{}'::jsonb,
    comment text,
    ai_summary text,
    status text DEFAULT 'new'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT volunteer_feedback_status_check CHECK ((status = ANY (ARRAY['new'::text, 'reviewed'::text, 'actioned'::text, 'archived'::text])))
);


--
-- Name: volunteer_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    volunteer_id uuid NOT NULL,
    assignment_id uuid,
    occurred_on date DEFAULT CURRENT_DATE NOT NULL,
    hours numeric(5,2) DEFAULT 0 NOT NULL,
    source text DEFAULT 'shift'::text,
    note text,
    status text DEFAULT 'confirmed'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_hours_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'adjusted'::text, 'void'::text])))
);


--
-- Name: volunteer_message_dispatches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_message_dispatches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    message_id uuid NOT NULL,
    connection_id uuid,
    channel text NOT NULL,
    provider text NOT NULL,
    provider_ref text,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    stats jsonb DEFAULT '{}'::jsonb,
    error text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_message_dispatches_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: volunteer_message_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_message_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    message_id uuid NOT NULL,
    dispatch_id uuid,
    volunteer_id uuid,
    person_id uuid,
    channel text NOT NULL,
    address text,
    provider_message_id text,
    error text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    opened_at timestamp with time zone,
    clicked_at timestamp with time zone,
    status text DEFAULT 'queued'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cost_estimate numeric,
    CONSTRAINT volunteer_message_recipients_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'sent'::text, 'delivered'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'failed'::text, 'unsubscribed'::text])))
);


--
-- Name: volunteer_message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_message_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    key text,
    name text NOT NULL,
    type text,
    default_channel text,
    subject text,
    body text,
    tokens text[] DEFAULT '{}'::text[],
    is_system boolean DEFAULT false,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    template_id uuid,
    opportunity_id uuid,
    roster_id uuid,
    type text,
    title text,
    subject text,
    body text,
    channels text[] DEFAULT '{}'::text[],
    audience jsonb DEFAULT '{}'::jsonb,
    scheduled_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    sent_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category text DEFAULT 'operational'::text NOT NULL,
    CONSTRAINT volunteer_messages_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'needs_review'::text, 'approved'::text, 'scheduled'::text, 'sending'::text, 'sent'::text, 'partially_sent'::text, 'cancelled'::text, 'failed'::text])))
);


--
-- Name: volunteer_opportunities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    role_id uuid,
    team_id uuid,
    event_id uuid,
    fixture_id uuid,
    title text NOT NULL,
    description text,
    location text,
    starts_at timestamp with time zone,
    recurrence text,
    volunteers_needed integer DEFAULT 1,
    required_skills text[] DEFAULT '{}'::text[],
    required_checks text[] DEFAULT '{}'::text[],
    signup_deadline timestamp with time zone,
    visibility text DEFAULT 'public'::text NOT NULL,
    ai_suggested_audience jsonb,
    signup_token text DEFAULT encode(extensions.gen_random_bytes(8), 'hex'::text),
    status text DEFAULT 'open'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_opportunities_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'open'::text, 'filled'::text, 'closed'::text, 'cancelled'::text]))),
    CONSTRAINT volunteer_opportunities_visibility_check CHECK ((visibility = ANY (ARRAY['public'::text, 'members_only'::text, 'team_only'::text, 'committee_only'::text])))
);


--
-- Name: volunteer_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    key text,
    name text NOT NULL,
    tier_rank integer DEFAULT 0 NOT NULL,
    blurb text,
    is_standalone_available boolean DEFAULT true,
    included_in_sportsweb_tiers text[] DEFAULT '{}'::text[],
    price_monthly numeric(8,2),
    price_annual numeric(8,2),
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system boolean DEFAULT true,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_plans_status_check CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text])))
);


--
-- Name: volunteer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    linked_player_id uuid,
    emergency_name text,
    emergency_phone text,
    preferred_team_ids uuid[] DEFAULT '{}'::uuid[],
    preferred_roles text[] DEFAULT '{}'::text[],
    max_shifts_week integer,
    max_shifts_month integer,
    induction_completed boolean DEFAULT false,
    training_completed boolean DEFAULT false,
    notes text,
    internal_tags text[] DEFAULT '{}'::text[],
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_provider_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_provider_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    channel text NOT NULL,
    provider text NOT NULL,
    display_name text,
    is_enabled boolean DEFAULT true,
    external_account_ref text,
    config jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_provider_connections_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text, 'in_app'::text, 'whatsapp'::text, 'facebook'::text, 'website'::text]))),
    CONSTRAINT volunteer_provider_connections_provider_check CHECK ((provider = ANY (ARRAY['twilio'::text, 'zoho_campaigns'::text, 'zoho_pagesense'::text, 'webpushr'::text, 'resend'::text, 'supabase'::text, 'manual'::text, 'other'::text])))
);


--
-- Name: volunteer_recognition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_recognition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    volunteer_id uuid NOT NULL,
    kind text,
    badge text,
    reason text,
    sponsor_id uuid,
    published_to text[] DEFAULT '{}'::text[],
    status text DEFAULT 'suggested'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_recognition_status_check CHECK ((status = ANY (ARRAY['suggested'::text, 'approved'::text, 'published'::text, 'dismissed'::text])))
);


--
-- Name: volunteer_role_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_role_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    key text,
    title text NOT NULL,
    category text,
    description text,
    typical_time text,
    required_skills text[] DEFAULT '{}'::text[],
    required_checks text[] DEFAULT '{}'::text[],
    required_training text[] DEFAULT '{}'::text[],
    risk_level text DEFAULT 'low'::text,
    suitable_for text[] DEFAULT '{}'::text[],
    default_instructions text,
    success_looks_like text,
    reports_to text,
    is_system boolean DEFAULT false,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_role_templates_risk_level_check CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
);


--
-- Name: volunteer_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    template_id uuid,
    team_id uuid,
    title text NOT NULL,
    description text,
    typical_time text,
    required_skills text[] DEFAULT '{}'::text[],
    required_checks text[] DEFAULT '{}'::text[],
    required_training text[] DEFAULT '{}'::text[],
    risk_level text DEFAULT 'low'::text,
    suitable_for text[] DEFAULT '{}'::text[],
    default_instructions text,
    success_looks_like text,
    reports_to text,
    links jsonb DEFAULT '[]'::jsonb,
    ai_position_description text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_roles_risk_level_check CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
);


--
-- Name: volunteer_rosters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_rosters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    season_id uuid,
    team_id uuid,
    event_id uuid,
    fixture_id uuid,
    title text NOT NULL,
    roster_date date,
    kind text,
    ai_generated boolean DEFAULT false,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_rosters_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'open'::text, 'published'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: volunteer_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    plan_key text DEFAULT 'vm_free'::text,
    volunteer_value_per_hour numeric(8,2) DEFAULT 40,
    reminder_offsets_days integer[] DEFAULT '{60,30,7,0}'::integer[],
    require_approval_before_send boolean DEFAULT true,
    block_restricted_without_checks boolean DEFAULT true,
    avoid_overuse boolean DEFAULT true,
    allow_self_select boolean DEFAULT true,
    publish_to_website boolean DEFAULT true,
    config jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    check_in_method text DEFAULT 'off'::text NOT NULL,
    check_in_token text DEFAULT encode(extensions.gen_random_bytes(8), 'hex'::text),
    sms_sender_id text,
    sms_sender_status text DEFAULT 'not_started'::text NOT NULL,
    trial_ends_at timestamp with time zone,
    trial_sms_allowance integer DEFAULT 25 NOT NULL,
    sms_credit_balance integer DEFAULT 0 NOT NULL
);


--
-- Name: volunteer_shift_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_shift_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    shift_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    assignment_type text DEFAULT 'assigned'::text NOT NULL,
    ai_reason text,
    ai_confidence numeric(4,3),
    override_check boolean DEFAULT false,
    override_by uuid,
    hours_credited numeric(5,2),
    check_in_at timestamp with time zone,
    status text DEFAULT 'invited'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_shift_assignments_assignment_type_check CHECK ((assignment_type = ANY (ARRAY['assigned'::text, 'backup'::text, 'waitlist'::text, 'self_selected'::text, 'proposed'::text]))),
    CONSTRAINT volunteer_shift_assignments_status_check CHECK ((status = ANY (ARRAY['proposed'::text, 'invited'::text, 'confirmed'::text, 'declined'::text, 'checked_in'::text, 'completed'::text, 'no_show'::text, 'cancelled'::text])))
);


--
-- Name: volunteer_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_shifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    roster_id uuid,
    role_id uuid,
    team_id uuid,
    title text NOT NULL,
    shift_date date,
    start_time time without time zone,
    end_time time without time zone,
    location text,
    volunteers_needed integer DEFAULT 1,
    instructions text,
    requires_check_in boolean DEFAULT false,
    status text DEFAULT 'open'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    check_in_token text DEFAULT encode(extensions.gen_random_bytes(8), 'hex'::text),
    CONSTRAINT volunteer_shifts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'open'::text, 'filled'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: volunteer_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    name text NOT NULL,
    level text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_sms_packs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_sms_packs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    sms_count integer NOT NULL,
    amount_aud numeric,
    source text DEFAULT 'manual'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: volunteer_training_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteer_training_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    volunteer_id uuid NOT NULL,
    course text NOT NULL,
    source text,
    document_id uuid,
    completed_on date,
    expires_on date,
    status text DEFAULT 'not_started'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteer_training_records_status_check CHECK ((status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text, 'expired'::text])))
);


--
-- Name: volunteers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volunteers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    person_id uuid NOT NULL,
    season_id uuid,
    source text,
    volunteer_since date,
    status text DEFAULT 'prospect'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT volunteers_status_check CHECK ((status = ANY (ARRAY['prospect'::text, 'applied'::text, 'approved'::text, 'active'::text, 'paused'::text, 'inactive'::text, 'archived'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text,
    rollback text[]
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: access_audit access_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_audit
    ADD CONSTRAINT access_audit_pkey PRIMARY KEY (id);


--
-- Name: club_content club_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_content
    ADD CONSTRAINT club_content_pkey PRIMARY KEY (club_id, content_key);


--
-- Name: club_launches club_launches_club_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_launches
    ADD CONSTRAINT club_launches_club_id_key UNIQUE (club_id);


--
-- Name: club_launches club_launches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_launches
    ADD CONSTRAINT club_launches_pkey PRIMARY KEY (id);


--
-- Name: club_member_invites club_member_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_member_invites
    ADD CONSTRAINT club_member_invites_pkey PRIMARY KEY (id);


--
-- Name: club_messages club_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_messages
    ADD CONSTRAINT club_messages_pkey PRIMARY KEY (id);


--
-- Name: club_modules club_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_modules
    ADD CONSTRAINT club_modules_pkey PRIMARY KEY (club_id, module_key);


--
-- Name: club_needs club_needs_club_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_needs
    ADD CONSTRAINT club_needs_club_id_key UNIQUE (club_id);


--
-- Name: club_needs club_needs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_needs
    ADD CONSTRAINT club_needs_pkey PRIMARY KEY (id);


--
-- Name: club_onboarding club_onboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_onboarding
    ADD CONSTRAINT club_onboarding_pkey PRIMARY KEY (id);


--
-- Name: club_page_versions club_page_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_page_versions
    ADD CONSTRAINT club_page_versions_pkey PRIMARY KEY (id);


--
-- Name: club_pages club_pages_club_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_pages
    ADD CONSTRAINT club_pages_club_id_slug_key UNIQUE (club_id, slug);


--
-- Name: club_pages club_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_pages
    ADD CONSTRAINT club_pages_pkey PRIMARY KEY (id);


--
-- Name: club_themes club_themes_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_themes
    ADD CONSTRAINT club_themes_key_key UNIQUE (key);


--
-- Name: club_themes club_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_themes
    ADD CONSTRAINT club_themes_pkey PRIMARY KEY (id);


--
-- Name: club_users club_users_club_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_users
    ADD CONSTRAINT club_users_club_id_user_id_key UNIQUE (club_id, user_id);


--
-- Name: club_users club_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_users
    ADD CONSTRAINT club_users_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_domain_key UNIQUE (domain);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_slug_key UNIQUE (slug);


--
-- Name: compliance_records compliance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_records
    ADD CONSTRAINT compliance_records_pkey PRIMARY KEY (id);


--
-- Name: events events_club_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_club_id_slug_key UNIQUE (club_id, slug);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: injuries injuries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_pkey PRIMARY KEY (id);


--
-- Name: ladder ladder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ladder
    ADD CONSTRAINT ladder_pkey PRIMARY KEY (id);


--
-- Name: launch_operators launch_operators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_operators
    ADD CONSTRAINT launch_operators_pkey PRIMARY KEY (user_id, region);


--
-- Name: launch_phases launch_phases_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_phases
    ADD CONSTRAINT launch_phases_key_key UNIQUE (key);


--
-- Name: launch_phases launch_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_phases
    ADD CONSTRAINT launch_phases_pkey PRIMARY KEY (phase_no);


--
-- Name: launch_step_catalog launch_step_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_catalog
    ADD CONSTRAINT launch_step_catalog_pkey PRIMARY KEY (step_key);


--
-- Name: launch_step_progress launch_step_progress_launch_id_step_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_progress
    ADD CONSTRAINT launch_step_progress_launch_id_step_key_key UNIQUE (launch_id, step_key);


--
-- Name: launch_step_progress launch_step_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_progress
    ADD CONSTRAINT launch_step_progress_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: mfa_backup_codes mfa_backup_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT mfa_backup_codes_pkey PRIMARY KEY (id);


--
-- Name: modules modules_club_id_module_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_club_id_module_name_key UNIQUE (club_id, module_name);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: news news_club_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_club_id_slug_key UNIQUE (club_id, slug);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: person_compliance person_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_compliance
    ADD CONSTRAINT person_compliance_pkey PRIMARY KEY (id);


--
-- Name: person_relationships person_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_relationships
    ADD CONSTRAINT person_relationships_pkey PRIMARY KEY (id);


--
-- Name: person_roles person_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_roles
    ADD CONSTRAINT person_roles_pkey PRIMARY KEY (id);


--
-- Name: platform_admins platform_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_pkey PRIMARY KEY (user_id);


--
-- Name: platform_user_roles platform_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_user_roles
    ADD CONSTRAINT platform_user_roles_pkey PRIMARY KEY (user_id, role);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: sales_products sales_products_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_products
    ADD CONSTRAINT sales_products_key_key UNIQUE (key);


--
-- Name: sales_products sales_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_products
    ADD CONSTRAINT sales_products_pkey PRIMARY KEY (id);


--
-- Name: sales_targets sales_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_club_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_club_id_name_key UNIQUE (club_id, name);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: sitepulse_comments sitepulse_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sitepulse_comments
    ADD CONSTRAINT sitepulse_comments_pkey PRIMARY KEY (id);


--
-- Name: sitepulse_feedback sitepulse_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sitepulse_feedback
    ADD CONSTRAINT sitepulse_feedback_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_person_id_season_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_person_id_season_id_key UNIQUE (team_id, person_id, season_id);


--
-- Name: teams teams_club_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_club_id_slug_key UNIQUE (club_id, slug);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: templates templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_slug_key UNIQUE (slug);


--
-- Name: templates templates_template_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_template_key_key UNIQUE (template_key);


--
-- Name: tk_club_stripe tk_club_stripe_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_club_stripe
    ADD CONSTRAINT tk_club_stripe_pkey PRIMARY KEY (club_id);


--
-- Name: tk_events tk_events_club_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_events
    ADD CONSTRAINT tk_events_club_id_slug_key UNIQUE (club_id, slug);


--
-- Name: tk_events tk_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_events
    ADD CONSTRAINT tk_events_pkey PRIMARY KEY (id);


--
-- Name: tk_fee_rules tk_fee_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_fee_rules
    ADD CONSTRAINT tk_fee_rules_pkey PRIMARY KEY (id);


--
-- Name: tk_order_items tk_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_order_items
    ADD CONSTRAINT tk_order_items_pkey PRIMARY KEY (id);


--
-- Name: tk_orders tk_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_orders
    ADD CONSTRAINT tk_orders_pkey PRIMARY KEY (id);


--
-- Name: tk_scan_codes tk_scan_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scan_codes
    ADD CONSTRAINT tk_scan_codes_code_key UNIQUE (code);


--
-- Name: tk_scan_codes tk_scan_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scan_codes
    ADD CONSTRAINT tk_scan_codes_pkey PRIMARY KEY (id);


--
-- Name: tk_scans tk_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scans
    ADD CONSTRAINT tk_scans_pkey PRIMARY KEY (id);


--
-- Name: tk_staff tk_staff_club_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_staff
    ADD CONSTRAINT tk_staff_club_id_user_id_key UNIQUE (club_id, user_id);


--
-- Name: tk_staff tk_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_staff
    ADD CONSTRAINT tk_staff_pkey PRIMARY KEY (id);


--
-- Name: tk_ticket_types tk_ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_ticket_types
    ADD CONSTRAINT tk_ticket_types_pkey PRIMARY KEY (id);


--
-- Name: tk_tickets tk_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_tickets
    ADD CONSTRAINT tk_tickets_pkey PRIMARY KEY (id);


--
-- Name: trial_email_log trial_email_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_email_log
    ADD CONSTRAINT trial_email_log_pkey PRIMARY KEY (club_id, stage);


--
-- Name: user_club_roles user_club_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_club_roles
    ADD CONSTRAINT user_club_roles_pkey PRIMARY KEY (user_id, club_id);


--
-- Name: volunteer_ai_suggestions volunteer_ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_ai_suggestions
    ADD CONSTRAINT volunteer_ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: volunteer_applications volunteer_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_pkey PRIMARY KEY (id);


--
-- Name: volunteer_availability volunteer_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_availability
    ADD CONSTRAINT volunteer_availability_pkey PRIMARY KEY (id);


--
-- Name: volunteer_compliance_records volunteer_compliance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_compliance_records
    ADD CONSTRAINT volunteer_compliance_records_pkey PRIMARY KEY (id);


--
-- Name: volunteer_compliance_records volunteer_compliance_records_volunteer_id_check_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_compliance_records
    ADD CONSTRAINT volunteer_compliance_records_volunteer_id_check_type_key UNIQUE (volunteer_id, check_type);


--
-- Name: volunteer_documents volunteer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_documents
    ADD CONSTRAINT volunteer_documents_pkey PRIMARY KEY (id);


--
-- Name: volunteer_feedback volunteer_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_feedback
    ADD CONSTRAINT volunteer_feedback_pkey PRIMARY KEY (id);


--
-- Name: volunteer_hours volunteer_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_pkey PRIMARY KEY (id);


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_dispatches
    ADD CONSTRAINT volunteer_message_dispatches_pkey PRIMARY KEY (id);


--
-- Name: volunteer_message_recipients volunteer_message_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_pkey PRIMARY KEY (id);


--
-- Name: volunteer_message_templates volunteer_message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_templates
    ADD CONSTRAINT volunteer_message_templates_pkey PRIMARY KEY (id);


--
-- Name: volunteer_messages volunteer_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_messages
    ADD CONSTRAINT volunteer_messages_pkey PRIMARY KEY (id);


--
-- Name: volunteer_opportunities volunteer_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_pkey PRIMARY KEY (id);


--
-- Name: volunteer_opportunities volunteer_opportunities_signup_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_signup_token_key UNIQUE (signup_token);


--
-- Name: volunteer_plans volunteer_plans_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_plans
    ADD CONSTRAINT volunteer_plans_key_key UNIQUE (key);


--
-- Name: volunteer_plans volunteer_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_plans
    ADD CONSTRAINT volunteer_plans_pkey PRIMARY KEY (id);


--
-- Name: volunteer_profiles volunteer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_pkey PRIMARY KEY (id);


--
-- Name: volunteer_profiles volunteer_profiles_volunteer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_volunteer_id_key UNIQUE (volunteer_id);


--
-- Name: volunteer_provider_connections volunteer_provider_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_provider_connections
    ADD CONSTRAINT volunteer_provider_connections_pkey PRIMARY KEY (id);


--
-- Name: volunteer_recognition volunteer_recognition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_recognition
    ADD CONSTRAINT volunteer_recognition_pkey PRIMARY KEY (id);


--
-- Name: volunteer_role_templates volunteer_role_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_role_templates
    ADD CONSTRAINT volunteer_role_templates_pkey PRIMARY KEY (id);


--
-- Name: volunteer_roles volunteer_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_roles
    ADD CONSTRAINT volunteer_roles_pkey PRIMARY KEY (id);


--
-- Name: volunteer_rosters volunteer_rosters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_rosters
    ADD CONSTRAINT volunteer_rosters_pkey PRIMARY KEY (id);


--
-- Name: volunteer_settings volunteer_settings_club_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_settings
    ADD CONSTRAINT volunteer_settings_club_id_key UNIQUE (club_id);


--
-- Name: volunteer_settings volunteer_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_settings
    ADD CONSTRAINT volunteer_settings_pkey PRIMARY KEY (id);


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shift_assignments
    ADD CONSTRAINT volunteer_shift_assignments_pkey PRIMARY KEY (id);


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_shift_id_volunteer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shift_assignments
    ADD CONSTRAINT volunteer_shift_assignments_shift_id_volunteer_id_key UNIQUE (shift_id, volunteer_id);


--
-- Name: volunteer_shifts volunteer_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shifts
    ADD CONSTRAINT volunteer_shifts_pkey PRIMARY KEY (id);


--
-- Name: volunteer_skills volunteer_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skills
    ADD CONSTRAINT volunteer_skills_pkey PRIMARY KEY (id);


--
-- Name: volunteer_sms_packs volunteer_sms_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_sms_packs
    ADD CONSTRAINT volunteer_sms_packs_pkey PRIMARY KEY (id);


--
-- Name: volunteer_training_records volunteer_training_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_training_records
    ADD CONSTRAINT volunteer_training_records_pkey PRIMARY KEY (id);


--
-- Name: volunteers volunteers_club_id_person_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_club_id_person_id_key UNIQUE (club_id, person_id);


--
-- Name: volunteers volunteers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: access_audit_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX access_audit_at_idx ON public.access_audit USING btree (at DESC);


--
-- Name: access_audit_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX access_audit_club_idx ON public.access_audit USING btree (club_id, at DESC);


--
-- Name: access_audit_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX access_audit_target_idx ON public.access_audit USING btree (target_user_id, at DESC);


--
-- Name: club_member_invites_unique_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX club_member_invites_unique_pending ON public.club_member_invites USING btree (club_id, lower(email)) WHERE (claimed_at IS NULL);


--
-- Name: club_onboarding_club_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX club_onboarding_club_id_idx ON public.club_onboarding USING btree (club_id);


--
-- Name: club_onboarding_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX club_onboarding_status_idx ON public.club_onboarding USING btree (status);


--
-- Name: club_page_versions_page_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX club_page_versions_page_idx ON public.club_page_versions USING btree (page_id, created_at DESC);


--
-- Name: club_pages_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX club_pages_club_idx ON public.club_pages USING btree (club_id);


--
-- Name: club_pages_one_home; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX club_pages_one_home ON public.club_pages USING btree (club_id) WHERE is_home;


--
-- Name: compliance_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compliance_expiry_idx ON public.compliance_records USING btree (club_id, expires_on);


--
-- Name: compliance_person_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compliance_person_idx ON public.compliance_records USING btree (person_id);


--
-- Name: idx_club_launches_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_club_launches_region ON public.club_launches USING btree (region);


--
-- Name: idx_club_launches_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_club_launches_status ON public.club_launches USING btree (status);


--
-- Name: idx_injuries_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_injuries_person ON public.injuries USING btree (person_id);


--
-- Name: idx_lsp_launch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lsp_launch ON public.launch_step_progress USING btree (launch_id);


--
-- Name: idx_people_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_people_club ON public.people USING btree (club_id, status);


--
-- Name: idx_people_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_people_user ON public.people USING btree (user_id);


--
-- Name: idx_person_comp_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_comp_expires ON public.person_compliance USING btree (expires_on);


--
-- Name: idx_person_comp_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_comp_person ON public.person_compliance USING btree (person_id);


--
-- Name: idx_person_rel_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_person_rel_person ON public.person_relationships USING btree (person_id);


--
-- Name: idx_registrations_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_club ON public.registrations USING btree (club_id);


--
-- Name: idx_registrations_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_person ON public.registrations USING btree (person_id);


--
-- Name: idx_registrations_season; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_season ON public.registrations USING btree (season_id);


--
-- Name: idx_sitepulse_cm_fb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sitepulse_cm_fb ON public.sitepulse_comments USING btree (feedback_id);


--
-- Name: idx_sitepulse_fb_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sitepulse_fb_club ON public.sitepulse_feedback USING btree (club_id);


--
-- Name: idx_sitepulse_fb_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sitepulse_fb_priority ON public.sitepulse_feedback USING btree (priority);


--
-- Name: idx_sitepulse_fb_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sitepulse_fb_source ON public.sitepulse_feedback USING btree (source);


--
-- Name: idx_sitepulse_fb_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sitepulse_fb_status ON public.sitepulse_feedback USING btree (status);


--
-- Name: idx_sitepulse_fb_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_sitepulse_fb_token ON public.sitepulse_feedback USING btree (status_token);


--
-- Name: idx_team_members_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_members_person ON public.team_members USING btree (person_id);


--
-- Name: idx_team_members_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_members_team ON public.team_members USING btree (team_id);


--
-- Name: idx_vai_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vai_club ON public.volunteer_ai_suggestions USING btree (club_id, status);


--
-- Name: idx_vapp_opp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vapp_opp ON public.volunteer_applications USING btree (opportunity_id);


--
-- Name: idx_vassign_shift; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vassign_shift ON public.volunteer_shift_assignments USING btree (shift_id);


--
-- Name: idx_vassign_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vassign_vol ON public.volunteer_shift_assignments USING btree (volunteer_id, status);


--
-- Name: idx_vavail_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vavail_vol ON public.volunteer_availability USING btree (volunteer_id);


--
-- Name: idx_vcomp_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vcomp_expiry ON public.volunteer_compliance_records USING btree (club_id, expires_on);


--
-- Name: idx_vcomp_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vcomp_vol ON public.volunteer_compliance_records USING btree (volunteer_id);


--
-- Name: idx_vdocs_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vdocs_vol ON public.volunteer_documents USING btree (volunteer_id);


--
-- Name: idx_vhours_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vhours_vol ON public.volunteer_hours USING btree (volunteer_id, occurred_on);


--
-- Name: idx_vmsg_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vmsg_club ON public.volunteer_messages USING btree (club_id, status);


--
-- Name: idx_vol_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vol_club ON public.volunteers USING btree (club_id, status);


--
-- Name: idx_vol_person; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vol_person ON public.volunteers USING btree (person_id);


--
-- Name: idx_vopp_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vopp_club ON public.volunteer_opportunities USING btree (club_id, status);


--
-- Name: idx_vprof_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vprof_vol ON public.volunteer_profiles USING btree (volunteer_id);


--
-- Name: idx_vrcpt_msg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vrcpt_msg ON public.volunteer_message_recipients USING btree (message_id);


--
-- Name: idx_vrcpt_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vrcpt_provider ON public.volunteer_message_recipients USING btree (provider_message_id);


--
-- Name: idx_vroles_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vroles_club ON public.volunteer_roles USING btree (club_id);


--
-- Name: idx_vrost_club; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vrost_club ON public.volunteer_rosters USING btree (club_id, roster_date);


--
-- Name: idx_vsettings_checkin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vsettings_checkin ON public.volunteer_settings USING btree (check_in_token);


--
-- Name: idx_vshift_checkin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vshift_checkin ON public.volunteer_shifts USING btree (check_in_token);


--
-- Name: idx_vshift_club_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vshift_club_date ON public.volunteer_shifts USING btree (club_id, shift_date, status);


--
-- Name: idx_vshift_roster; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vshift_roster ON public.volunteer_shifts USING btree (roster_id);


--
-- Name: idx_vskills_vol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vskills_vol ON public.volunteer_skills USING btree (volunteer_id);


--
-- Name: ladder_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ladder_club_idx ON public.ladder USING btree (club_id, grade, "position");


--
-- Name: matches_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_club_idx ON public.matches USING btree (club_id, match_date);


--
-- Name: mfa_backup_codes_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mfa_backup_codes_user_idx ON public.mfa_backup_codes USING btree (user_id);


--
-- Name: people_unsubscribe_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX people_unsubscribe_token_idx ON public.people USING btree (unsubscribe_token);


--
-- Name: person_rel_person_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_rel_person_idx ON public.person_relationships USING btree (person_id);


--
-- Name: person_rel_related_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_rel_related_idx ON public.person_relationships USING btree (related_person_id);


--
-- Name: person_roles_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_roles_club_idx ON public.person_roles USING btree (club_id, role);


--
-- Name: person_roles_person_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_roles_person_idx ON public.person_roles USING btree (person_id);


--
-- Name: person_roles_season_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_roles_season_idx ON public.person_roles USING btree (season_id) WHERE (season_id IS NOT NULL);


--
-- Name: person_roles_team_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX person_roles_team_idx ON public.person_roles USING btree (team_id) WHERE (team_id IS NOT NULL);


--
-- Name: templates_is_default_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX templates_is_default_idx ON public.templates USING btree (is_default) WHERE (is_default = true);


--
-- Name: tk_events_club_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_events_club_idx ON public.tk_events USING btree (club_id);


--
-- Name: tk_events_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_events_status_idx ON public.tk_events USING btree (status);


--
-- Name: tk_orders_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_orders_event_idx ON public.tk_orders USING btree (event_id);


--
-- Name: tk_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_orders_status_idx ON public.tk_orders USING btree (status);


--
-- Name: tk_scans_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_scans_event_idx ON public.tk_scans USING btree (event_id);


--
-- Name: tk_staff_club_email_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tk_staff_club_email_uniq ON public.tk_staff USING btree (club_id, lower(email));


--
-- Name: tk_ticket_types_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_ticket_types_event_idx ON public.tk_ticket_types USING btree (event_id);


--
-- Name: tk_tickets_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_tickets_event_idx ON public.tk_tickets USING btree (event_id);


--
-- Name: tk_tickets_event_serial_ux; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tk_tickets_event_serial_ux ON public.tk_tickets USING btree (event_id, serial_no);


--
-- Name: tk_tickets_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_tickets_order_idx ON public.tk_tickets USING btree (order_id);


--
-- Name: tk_tickets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tk_tickets_status_idx ON public.tk_tickets USING btree (status);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: tk_event_sales_summary _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.tk_event_sales_summary AS
 SELECT e.id AS event_id,
    e.club_id,
    e.name,
    e.status,
    count(DISTINCT o.id) FILTER (WHERE (o.status = 'paid'::text)) AS paid_orders,
    COALESCE(sum(o.subtotal_cents) FILTER (WHERE (o.status = 'paid'::text)), (0)::bigint) AS gross_cents,
    COALESCE(sum(o.fee_cents) FILTER (WHERE (o.status = 'paid'::text)), (0)::bigint) AS fees_cents,
    COALESCE(sum(o.total_cents) FILTER (WHERE (o.status = 'paid'::text)), (0)::bigint) AS collected_cents,
    count(t.id) FILTER (WHERE (t.status = ANY (ARRAY['valid'::text, 'redeemed'::text]))) AS tickets_issued,
    count(t.id) FILTER (WHERE (t.status = 'redeemed'::text)) AS tickets_redeemed,
    count(o.id) FILTER (WHERE ((o.status = 'paid'::text) AND (o.channel ~~ 'door%'::text))) AS door_orders
   FROM ((public.tk_events e
     LEFT JOIN public.tk_orders o ON ((o.event_id = e.id)))
     LEFT JOIN public.tk_tickets t ON ((t.event_id = e.id)))
  GROUP BY e.id;


--
-- Name: v_club_launch_status _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.v_club_launch_status WITH (security_invoker='true') AS
 SELECT l.id AS launch_id,
    l.club_id,
    c.name AS club_name,
    c.slug AS club_slug,
    l.status,
    l.region,
    l.started_at,
    l.went_live_at,
    count(p.*) AS steps_total,
    count(*) FILTER (WHERE (p.status = 'done'::text)) AS steps_done,
    max(p.checked_at) AS last_activity,
    COALESCE(min(cat.phase_no) FILTER (WHERE (p.status <> 'done'::text)), max(cat.phase_no)) AS current_phase,
        CASE
            WHEN (l.went_live_at IS NOT NULL) THEN round((EXTRACT(epoch FROM (l.went_live_at - l.started_at)) / 86400.0), 1)
            ELSE NULL::numeric
        END AS days_to_live
   FROM (((public.club_launches l
     JOIN public.clubs c ON ((c.id = l.club_id)))
     LEFT JOIN public.launch_step_progress p ON ((p.launch_id = l.id)))
     LEFT JOIN public.launch_step_catalog cat ON ((cat.step_key = p.step_key)))
  GROUP BY l.id, c.name, c.slug;


--
-- Name: club_pages club_pages_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER club_pages_touch_updated_at BEFORE UPDATE ON public.club_pages FOR EACH ROW EXECUTE FUNCTION public.f2_touch_updated_at();


--
-- Name: clubs clubs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: events events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: modules modules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: news news_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: people people_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER people_touch BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: sponsors sponsors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sponsors_updated_at BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: teams teams_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: templates templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: tk_events tk_events_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tk_events_touch BEFORE UPDATE ON public.tk_events FOR EACH ROW EXECUTE FUNCTION public.tk_touch_updated_at();


--
-- Name: tk_fee_rules tk_fee_rules_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tk_fee_rules_touch BEFORE UPDATE ON public.tk_fee_rules FOR EACH ROW EXECUTE FUNCTION public.tk_touch_updated_at();


--
-- Name: tk_ticket_types tk_ticket_types_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tk_ticket_types_touch BEFORE UPDATE ON public.tk_ticket_types FOR EACH ROW EXECUTE FUNCTION public.tk_touch_updated_at();


--
-- Name: access_audit trg_access_audit_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_access_audit_immutable BEFORE DELETE OR UPDATE ON public.access_audit FOR EACH ROW EXECUTE FUNCTION public.access_audit_immutable();


--
-- Name: user_club_roles trg_audit_club_roles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_club_roles AFTER INSERT OR DELETE OR UPDATE ON public.user_club_roles FOR EACH ROW EXECUTE FUNCTION public.log_access_change('club');


--
-- Name: platform_user_roles trg_audit_platform_roles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_audit_platform_roles AFTER INSERT OR DELETE OR UPDATE ON public.platform_user_roles FOR EACH ROW EXECUTE FUNCTION public.log_access_change('platform');


--
-- Name: injuries trg_injuries_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_injuries_touch BEFORE UPDATE ON public.injuries FOR EACH ROW EXECUTE FUNCTION public.sw1_touch_updated_at();


--
-- Name: launch_step_progress trg_lsp_stamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_lsp_stamp BEFORE UPDATE ON public.launch_step_progress FOR EACH ROW EXECUTE FUNCTION public.tg_lsp_stamp();


--
-- Name: person_compliance trg_person_comp_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_person_comp_touch BEFORE UPDATE ON public.person_compliance FOR EACH ROW EXECUTE FUNCTION public.sw1_touch_updated_at();


--
-- Name: person_relationships trg_person_rel_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_person_rel_touch BEFORE UPDATE ON public.person_relationships FOR EACH ROW EXECUTE FUNCTION public.sw1_touch_updated_at();


--
-- Name: platform_user_roles trg_protect_last_superadmin; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_protect_last_superadmin BEFORE DELETE OR UPDATE ON public.platform_user_roles FOR EACH ROW EXECUTE FUNCTION public.protect_last_superadmin();


--
-- Name: registrations trg_registrations_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_registrations_touch BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.sw1_touch_updated_at();


--
-- Name: sitepulse_feedback trg_sitepulse_notify; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sitepulse_notify AFTER INSERT ON public.sitepulse_feedback FOR EACH ROW EXECUTE FUNCTION public.sitepulse_notify_new_feedback();


--
-- Name: team_members trg_team_members_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_team_members_touch BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.sw1_touch_updated_at();


--
-- Name: volunteer_ai_suggestions volunteer_ai_suggestions_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_ai_suggestions_touch BEFORE UPDATE ON public.volunteer_ai_suggestions FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_applications volunteer_applications_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_applications_touch BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_availability volunteer_availability_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_availability_touch BEFORE UPDATE ON public.volunteer_availability FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_compliance_records volunteer_compliance_records_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_compliance_records_touch BEFORE UPDATE ON public.volunteer_compliance_records FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_documents volunteer_documents_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_documents_touch BEFORE UPDATE ON public.volunteer_documents FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_feedback volunteer_feedback_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_feedback_touch BEFORE UPDATE ON public.volunteer_feedback FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_hours volunteer_hours_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_hours_touch BEFORE UPDATE ON public.volunteer_hours FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_message_dispatches_touch BEFORE UPDATE ON public.volunteer_message_dispatches FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_message_recipients volunteer_message_recipients_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_message_recipients_touch BEFORE UPDATE ON public.volunteer_message_recipients FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_message_templates volunteer_message_templates_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_message_templates_touch BEFORE UPDATE ON public.volunteer_message_templates FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_messages volunteer_messages_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_messages_touch BEFORE UPDATE ON public.volunteer_messages FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_opportunities volunteer_opportunities_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_opportunities_touch BEFORE UPDATE ON public.volunteer_opportunities FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_plans volunteer_plans_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_plans_touch BEFORE UPDATE ON public.volunteer_plans FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_profiles volunteer_profiles_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_profiles_touch BEFORE UPDATE ON public.volunteer_profiles FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_provider_connections volunteer_provider_connections_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_provider_connections_touch BEFORE UPDATE ON public.volunteer_provider_connections FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_recognition volunteer_recognition_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_recognition_touch BEFORE UPDATE ON public.volunteer_recognition FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_role_templates volunteer_role_templates_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_role_templates_touch BEFORE UPDATE ON public.volunteer_role_templates FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_roles volunteer_roles_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_roles_touch BEFORE UPDATE ON public.volunteer_roles FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_rosters volunteer_rosters_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_rosters_touch BEFORE UPDATE ON public.volunteer_rosters FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_settings volunteer_settings_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_settings_touch BEFORE UPDATE ON public.volunteer_settings FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_shift_assignments_touch BEFORE UPDATE ON public.volunteer_shift_assignments FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_shifts volunteer_shifts_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_shifts_touch BEFORE UPDATE ON public.volunteer_shifts FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_skills volunteer_skills_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_skills_touch BEFORE UPDATE ON public.volunteer_skills FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteer_training_records volunteer_training_records_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteer_training_records_touch BEFORE UPDATE ON public.volunteer_training_records FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: volunteers volunteers_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER volunteers_touch BEFORE UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.vm_touch_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: club_content club_content_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_content
    ADD CONSTRAINT club_content_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_launches club_launches_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_launches
    ADD CONSTRAINT club_launches_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: club_launches club_launches_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_launches
    ADD CONSTRAINT club_launches_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_launches club_launches_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_launches
    ADD CONSTRAINT club_launches_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: club_member_invites club_member_invites_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_member_invites
    ADD CONSTRAINT club_member_invites_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_member_invites club_member_invites_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_member_invites
    ADD CONSTRAINT club_member_invites_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);


--
-- Name: club_messages club_messages_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_messages
    ADD CONSTRAINT club_messages_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_modules club_modules_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_modules
    ADD CONSTRAINT club_modules_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_needs club_needs_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_needs
    ADD CONSTRAINT club_needs_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_onboarding club_onboarding_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_onboarding
    ADD CONSTRAINT club_onboarding_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_page_versions club_page_versions_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_page_versions
    ADD CONSTRAINT club_page_versions_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_page_versions club_page_versions_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_page_versions
    ADD CONSTRAINT club_page_versions_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.club_pages(id) ON DELETE CASCADE;


--
-- Name: club_pages club_pages_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_pages
    ADD CONSTRAINT club_pages_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_pages club_pages_nav_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_pages
    ADD CONSTRAINT club_pages_nav_parent_id_fkey FOREIGN KEY (nav_parent_id) REFERENCES public.club_pages(id) ON DELETE SET NULL;


--
-- Name: club_users club_users_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_users
    ADD CONSTRAINT club_users_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: club_users club_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_users
    ADD CONSTRAINT club_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: clubs clubs_selected_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_selected_template_id_fkey FOREIGN KEY (selected_template_id) REFERENCES public.templates(id) ON DELETE SET NULL;


--
-- Name: clubs clubs_theme_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_theme_key_fkey FOREIGN KEY (theme_key) REFERENCES public.club_themes(key) ON DELETE SET NULL;


--
-- Name: compliance_records compliance_records_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_records
    ADD CONSTRAINT compliance_records_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: compliance_records compliance_records_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_records
    ADD CONSTRAINT compliance_records_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: events events_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: injuries injuries_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: injuries injuries_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT injuries_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: ladder ladder_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ladder
    ADD CONSTRAINT ladder_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: launch_operators launch_operators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_operators
    ADD CONSTRAINT launch_operators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: launch_step_catalog launch_step_catalog_phase_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_catalog
    ADD CONSTRAINT launch_step_catalog_phase_no_fkey FOREIGN KEY (phase_no) REFERENCES public.launch_phases(phase_no);


--
-- Name: launch_step_progress launch_step_progress_checked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_progress
    ADD CONSTRAINT launch_step_progress_checked_by_fkey FOREIGN KEY (checked_by) REFERENCES auth.users(id);


--
-- Name: launch_step_progress launch_step_progress_launch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_progress
    ADD CONSTRAINT launch_step_progress_launch_id_fkey FOREIGN KEY (launch_id) REFERENCES public.club_launches(id) ON DELETE CASCADE;


--
-- Name: launch_step_progress launch_step_progress_step_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_step_progress
    ADD CONSTRAINT launch_step_progress_step_key_fkey FOREIGN KEY (step_key) REFERENCES public.launch_step_catalog(step_key);


--
-- Name: matches matches_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: mfa_backup_codes mfa_backup_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfa_backup_codes
    ADD CONSTRAINT mfa_backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: modules modules_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: news news_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: people people_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: person_compliance person_compliance_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_compliance
    ADD CONSTRAINT person_compliance_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: person_compliance person_compliance_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_compliance
    ADD CONSTRAINT person_compliance_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: person_relationships person_relationships_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_relationships
    ADD CONSTRAINT person_relationships_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: person_relationships person_relationships_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_relationships
    ADD CONSTRAINT person_relationships_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: person_relationships person_relationships_related_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_relationships
    ADD CONSTRAINT person_relationships_related_person_id_fkey FOREIGN KEY (related_person_id) REFERENCES public.people(id) ON DELETE SET NULL;


--
-- Name: person_roles person_roles_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_roles
    ADD CONSTRAINT person_roles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: person_roles person_roles_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_roles
    ADD CONSTRAINT person_roles_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: person_roles person_roles_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_roles
    ADD CONSTRAINT person_roles_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: person_roles person_roles_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.person_roles
    ADD CONSTRAINT person_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: platform_admins platform_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_admins
    ADD CONSTRAINT platform_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: platform_user_roles platform_user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_user_roles
    ADD CONSTRAINT platform_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: registrations registrations_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: seasons seasons_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: sitepulse_comments sitepulse_comments_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sitepulse_comments
    ADD CONSTRAINT sitepulse_comments_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: sitepulse_comments sitepulse_comments_feedback_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sitepulse_comments
    ADD CONSTRAINT sitepulse_comments_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.sitepulse_feedback(id) ON DELETE CASCADE;


--
-- Name: sitepulse_feedback sitepulse_feedback_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sitepulse_feedback
    ADD CONSTRAINT sitepulse_feedback_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: sponsors sponsors_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE SET NULL;


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: teams teams_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_club_stripe tk_club_stripe_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_club_stripe
    ADD CONSTRAINT tk_club_stripe_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_events tk_events_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_events
    ADD CONSTRAINT tk_events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_fee_rules tk_fee_rules_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_fee_rules
    ADD CONSTRAINT tk_fee_rules_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_order_items tk_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_order_items
    ADD CONSTRAINT tk_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.tk_orders(id) ON DELETE CASCADE;


--
-- Name: tk_order_items tk_order_items_ticket_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_order_items
    ADD CONSTRAINT tk_order_items_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.tk_ticket_types(id);


--
-- Name: tk_orders tk_orders_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_orders
    ADD CONSTRAINT tk_orders_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_orders tk_orders_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_orders
    ADD CONSTRAINT tk_orders_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tk_events(id) ON DELETE CASCADE;


--
-- Name: tk_scan_codes tk_scan_codes_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scan_codes
    ADD CONSTRAINT tk_scan_codes_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_scan_codes tk_scan_codes_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scan_codes
    ADD CONSTRAINT tk_scan_codes_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tk_events(id) ON DELETE CASCADE;


--
-- Name: tk_scans tk_scans_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scans
    ADD CONSTRAINT tk_scans_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_scans tk_scans_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scans
    ADD CONSTRAINT tk_scans_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tk_events(id) ON DELETE CASCADE;


--
-- Name: tk_scans tk_scans_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_scans
    ADD CONSTRAINT tk_scans_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tk_tickets(id) ON DELETE SET NULL;


--
-- Name: tk_staff tk_staff_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_staff
    ADD CONSTRAINT tk_staff_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_ticket_types tk_ticket_types_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_ticket_types
    ADD CONSTRAINT tk_ticket_types_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_ticket_types tk_ticket_types_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_ticket_types
    ADD CONSTRAINT tk_ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tk_events(id) ON DELETE CASCADE;


--
-- Name: tk_ticket_types tk_ticket_types_fee_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_ticket_types
    ADD CONSTRAINT tk_ticket_types_fee_rule_id_fkey FOREIGN KEY (fee_rule_id) REFERENCES public.tk_fee_rules(id);


--
-- Name: tk_tickets tk_tickets_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_tickets
    ADD CONSTRAINT tk_tickets_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: tk_tickets tk_tickets_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_tickets
    ADD CONSTRAINT tk_tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tk_events(id) ON DELETE CASCADE;


--
-- Name: tk_tickets tk_tickets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_tickets
    ADD CONSTRAINT tk_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.tk_orders(id) ON DELETE CASCADE;


--
-- Name: tk_tickets tk_tickets_ticket_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tk_tickets
    ADD CONSTRAINT tk_tickets_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.tk_ticket_types(id);


--
-- Name: trial_email_log trial_email_log_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_email_log
    ADD CONSTRAINT trial_email_log_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: user_club_roles user_club_roles_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_club_roles
    ADD CONSTRAINT user_club_roles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: user_club_roles user_club_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_club_roles
    ADD CONSTRAINT user_club_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: volunteer_ai_suggestions volunteer_ai_suggestions_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_ai_suggestions
    ADD CONSTRAINT volunteer_ai_suggestions_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_applications volunteer_applications_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_applications volunteer_applications_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE;


--
-- Name: volunteer_applications volunteer_applications_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE SET NULL;


--
-- Name: volunteer_applications volunteer_applications_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_applications
    ADD CONSTRAINT volunteer_applications_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE SET NULL;


--
-- Name: volunteer_availability volunteer_availability_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_availability
    ADD CONSTRAINT volunteer_availability_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_availability volunteer_availability_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_availability
    ADD CONSTRAINT volunteer_availability_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_compliance_records volunteer_compliance_records_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_compliance_records
    ADD CONSTRAINT volunteer_compliance_records_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_compliance_records volunteer_compliance_records_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_compliance_records
    ADD CONSTRAINT volunteer_compliance_records_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.volunteer_documents(id) ON DELETE SET NULL;


--
-- Name: volunteer_compliance_records volunteer_compliance_records_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_compliance_records
    ADD CONSTRAINT volunteer_compliance_records_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_documents volunteer_documents_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_documents
    ADD CONSTRAINT volunteer_documents_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_documents volunteer_documents_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_documents
    ADD CONSTRAINT volunteer_documents_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_feedback volunteer_feedback_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_feedback
    ADD CONSTRAINT volunteer_feedback_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_feedback volunteer_feedback_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_feedback
    ADD CONSTRAINT volunteer_feedback_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.volunteer_shifts(id) ON DELETE SET NULL;


--
-- Name: volunteer_feedback volunteer_feedback_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_feedback
    ADD CONSTRAINT volunteer_feedback_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE SET NULL;


--
-- Name: volunteer_hours volunteer_hours_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.volunteer_shift_assignments(id) ON DELETE SET NULL;


--
-- Name: volunteer_hours volunteer_hours_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_hours volunteer_hours_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_hours
    ADD CONSTRAINT volunteer_hours_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_dispatches
    ADD CONSTRAINT volunteer_message_dispatches_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_dispatches
    ADD CONSTRAINT volunteer_message_dispatches_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.volunteer_provider_connections(id) ON DELETE SET NULL;


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_dispatches
    ADD CONSTRAINT volunteer_message_dispatches_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.volunteer_messages(id) ON DELETE CASCADE;


--
-- Name: volunteer_message_recipients volunteer_message_recipients_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_message_recipients volunteer_message_recipients_dispatch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_dispatch_id_fkey FOREIGN KEY (dispatch_id) REFERENCES public.volunteer_message_dispatches(id) ON DELETE SET NULL;


--
-- Name: volunteer_message_recipients volunteer_message_recipients_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.volunteer_messages(id) ON DELETE CASCADE;


--
-- Name: volunteer_message_recipients volunteer_message_recipients_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE SET NULL;


--
-- Name: volunteer_message_recipients volunteer_message_recipients_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_recipients
    ADD CONSTRAINT volunteer_message_recipients_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE SET NULL;


--
-- Name: volunteer_message_templates volunteer_message_templates_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_message_templates
    ADD CONSTRAINT volunteer_message_templates_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_messages volunteer_messages_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_messages
    ADD CONSTRAINT volunteer_messages_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_messages volunteer_messages_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_messages
    ADD CONSTRAINT volunteer_messages_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.volunteer_opportunities(id) ON DELETE SET NULL;


--
-- Name: volunteer_messages volunteer_messages_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_messages
    ADD CONSTRAINT volunteer_messages_roster_id_fkey FOREIGN KEY (roster_id) REFERENCES public.volunteer_rosters(id) ON DELETE SET NULL;


--
-- Name: volunteer_messages volunteer_messages_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_messages
    ADD CONSTRAINT volunteer_messages_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.volunteer_message_templates(id) ON DELETE SET NULL;


--
-- Name: volunteer_opportunities volunteer_opportunities_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_opportunities volunteer_opportunities_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: volunteer_opportunities volunteer_opportunities_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.volunteer_roles(id) ON DELETE SET NULL;


--
-- Name: volunteer_opportunities volunteer_opportunities_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_opportunities
    ADD CONSTRAINT volunteer_opportunities_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: volunteer_plans volunteer_plans_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_plans
    ADD CONSTRAINT volunteer_plans_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_profiles volunteer_profiles_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_profiles volunteer_profiles_linked_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_linked_player_id_fkey FOREIGN KEY (linked_player_id) REFERENCES public.people(id) ON DELETE SET NULL;


--
-- Name: volunteer_profiles volunteer_profiles_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_profiles
    ADD CONSTRAINT volunteer_profiles_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_provider_connections volunteer_provider_connections_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_provider_connections
    ADD CONSTRAINT volunteer_provider_connections_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_recognition volunteer_recognition_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_recognition
    ADD CONSTRAINT volunteer_recognition_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_recognition volunteer_recognition_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_recognition
    ADD CONSTRAINT volunteer_recognition_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(id) ON DELETE SET NULL;


--
-- Name: volunteer_recognition volunteer_recognition_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_recognition
    ADD CONSTRAINT volunteer_recognition_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_role_templates volunteer_role_templates_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_role_templates
    ADD CONSTRAINT volunteer_role_templates_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_roles volunteer_roles_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_roles
    ADD CONSTRAINT volunteer_roles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_roles volunteer_roles_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_roles
    ADD CONSTRAINT volunteer_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: volunteer_roles volunteer_roles_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_roles
    ADD CONSTRAINT volunteer_roles_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.volunteer_role_templates(id) ON DELETE SET NULL;


--
-- Name: volunteer_rosters volunteer_rosters_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_rosters
    ADD CONSTRAINT volunteer_rosters_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_rosters volunteer_rosters_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_rosters
    ADD CONSTRAINT volunteer_rosters_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: volunteer_rosters volunteer_rosters_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_rosters
    ADD CONSTRAINT volunteer_rosters_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: volunteer_settings volunteer_settings_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_settings
    ADD CONSTRAINT volunteer_settings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shift_assignments
    ADD CONSTRAINT volunteer_shift_assignments_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shift_assignments
    ADD CONSTRAINT volunteer_shift_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.volunteer_shifts(id) ON DELETE CASCADE;


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shift_assignments
    ADD CONSTRAINT volunteer_shift_assignments_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_shifts volunteer_shifts_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shifts
    ADD CONSTRAINT volunteer_shifts_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_shifts volunteer_shifts_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shifts
    ADD CONSTRAINT volunteer_shifts_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.volunteer_roles(id) ON DELETE SET NULL;


--
-- Name: volunteer_shifts volunteer_shifts_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shifts
    ADD CONSTRAINT volunteer_shifts_roster_id_fkey FOREIGN KEY (roster_id) REFERENCES public.volunteer_rosters(id) ON DELETE CASCADE;


--
-- Name: volunteer_shifts volunteer_shifts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_shifts
    ADD CONSTRAINT volunteer_shifts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: volunteer_skills volunteer_skills_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skills
    ADD CONSTRAINT volunteer_skills_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_skills volunteer_skills_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_skills
    ADD CONSTRAINT volunteer_skills_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteer_training_records volunteer_training_records_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_training_records
    ADD CONSTRAINT volunteer_training_records_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteer_training_records volunteer_training_records_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_training_records
    ADD CONSTRAINT volunteer_training_records_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.volunteer_documents(id) ON DELETE SET NULL;


--
-- Name: volunteer_training_records volunteer_training_records_volunteer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteer_training_records
    ADD CONSTRAINT volunteer_training_records_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id) ON DELETE CASCADE;


--
-- Name: volunteers volunteers_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;


--
-- Name: volunteers volunteers_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volunteers
    ADD CONSTRAINT volunteers_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: access_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: access_audit access_audit_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY access_audit_read ON public.access_audit FOR SELECT USING (public.is_platform_admin());


--
-- Name: club_launches cl_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cl_read ON public.club_launches FOR SELECT TO authenticated USING ((public.is_platform_admin() OR public.is_launch_operator(region)));


--
-- Name: club_launches cl_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cl_write ON public.club_launches TO authenticated USING ((public.is_platform_admin() OR public.is_launch_operator(region))) WITH CHECK ((public.is_platform_admin() OR public.is_launch_operator(region)));


--
-- Name: club_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_content ENABLE ROW LEVEL SECURITY;

--
-- Name: club_content club_content_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_content_member_write ON public.club_content USING ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids)))) WITH CHECK ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: club_content club_content_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_content_public_read ON public.club_content FOR SELECT USING ((club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status))));


--
-- Name: club_launches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_launches ENABLE ROW LEVEL SECURITY;

--
-- Name: club_member_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_member_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: club_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: club_messages club_messages_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_messages_member_read ON public.club_messages FOR SELECT USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: club_messages club_messages_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_messages_member_write ON public.club_messages USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: club_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: club_modules_backup_20260622; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_modules_backup_20260622 ENABLE ROW LEVEL SECURITY;

--
-- Name: club_modules club_modules_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_modules_member_read ON public.club_modules FOR SELECT USING (public.vm_is_club_member(club_id));


--
-- Name: club_modules club_modules_platform_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_modules_platform_write ON public.club_modules TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: club_modules club_modules_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_modules_public_read ON public.club_modules FOR SELECT USING ((club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status))));


--
-- Name: club_needs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_needs ENABLE ROW LEVEL SECURITY;

--
-- Name: club_needs club_needs_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_needs_rw ON public.club_needs USING ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids)))) WITH CHECK ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: club_onboarding; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_onboarding ENABLE ROW LEVEL SECURITY;

--
-- Name: club_onboarding club_onboarding_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_onboarding_read ON public.club_onboarding FOR SELECT USING ((public.is_platform_admin() OR public.is_super_admin() OR public.is_club_admin(club_id)));


--
-- Name: club_page_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_page_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: club_page_versions club_page_versions_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_page_versions_rw ON public.club_page_versions USING ((public.is_platform_admin() OR public.vm_is_club_member(club_id))) WITH CHECK ((public.is_platform_admin() OR public.vm_is_club_member(club_id)));


--
-- Name: club_pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: club_pages club_pages_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_pages_rw ON public.club_pages USING ((public.is_platform_admin() OR public.vm_is_club_member(club_id))) WITH CHECK ((public.is_platform_admin() OR public.vm_is_club_member(club_id)));


--
-- Name: club_themes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_themes ENABLE ROW LEVEL SECURITY;

--
-- Name: club_themes club_themes_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_themes_admin ON public.club_themes USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: club_themes club_themes_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_themes_read ON public.club_themes FOR SELECT USING (true);


--
-- Name: club_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_users ENABLE ROW LEVEL SECURITY;

--
-- Name: club_users club_users_own_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_users_own_read ON public.club_users FOR SELECT USING (((user_id = auth.uid()) OR public.is_super_admin()));


--
-- Name: club_users club_users_self_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_users_self_read ON public.club_users FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: club_users club_users_super_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY club_users_super_admin_all ON public.club_users USING (public.is_super_admin());


--
-- Name: clubs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

--
-- Name: clubs clubs_admin_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clubs_admin_read ON public.clubs FOR SELECT USING ((public.is_club_admin(id) OR public.is_super_admin()));


--
-- Name: clubs clubs_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clubs_public_read ON public.clubs FOR SELECT USING ((website_status = 'published'::public.website_status));


--
-- Name: clubs clubs_super_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY clubs_super_admin_all ON public.clubs USING (public.is_super_admin());


--
-- Name: compliance_records compliance_admin_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY compliance_admin_rw ON public.compliance_records USING ((public.is_platform_admin() OR (public.club_role(club_id) = ANY (ARRAY['club_senior_admin'::text, 'club_admin'::text])))) WITH CHECK ((public.is_platform_admin() OR (public.club_role(club_id) = ANY (ARRAY['club_senior_admin'::text, 'club_admin'::text]))));


--
-- Name: compliance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: events events_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_admin_all ON public.events USING ((public.is_club_admin(club_id) OR public.is_super_admin()));


--
-- Name: events events_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_member_read ON public.events FOR SELECT TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: events events_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_member_write ON public.events TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: events events_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_public_read ON public.events FOR SELECT USING (((status = 'published'::public.content_status) AND (club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status)))));


--
-- Name: injuries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;

--
-- Name: injuries injuries_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY injuries_read ON public.injuries FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = injuries.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = injuries.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: injuries injuries_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY injuries_write ON public.injuries USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: ladder; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ladder ENABLE ROW LEVEL SECURITY;

--
-- Name: ladder ladder_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ladder_member_write ON public.ladder USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: ladder ladder_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ladder_public_read ON public.ladder FOR SELECT USING ((club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status))));


--
-- Name: launch_operators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.launch_operators ENABLE ROW LEVEL SECURITY;

--
-- Name: launch_phases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.launch_phases ENABLE ROW LEVEL SECURITY;

--
-- Name: launch_step_catalog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.launch_step_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: launch_step_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.launch_step_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: launch_operators lo_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lo_admin ON public.launch_operators TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: launch_operators lo_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lo_self ON public.launch_operators FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_platform_admin()));


--
-- Name: launch_phases lp_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lp_admin ON public.launch_phases TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: launch_phases lp_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lp_read ON public.launch_phases FOR SELECT TO authenticated USING ((public.is_platform_admin() OR public.is_launch_operator()));


--
-- Name: launch_step_catalog lsc_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lsc_admin ON public.launch_step_catalog TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: launch_step_catalog lsc_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lsc_read ON public.launch_step_catalog FOR SELECT TO authenticated USING ((public.is_platform_admin() OR public.is_launch_operator()));


--
-- Name: launch_step_progress lsp_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lsp_insert ON public.launch_step_progress FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());


--
-- Name: launch_step_progress lsp_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lsp_read ON public.launch_step_progress FOR SELECT TO authenticated USING ((public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.club_launches l
  WHERE ((l.id = launch_step_progress.launch_id) AND public.is_launch_operator(l.region))))));


--
-- Name: launch_step_progress lsp_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY lsp_update ON public.launch_step_progress FOR UPDATE TO authenticated USING ((public.is_platform_admin() OR ((NOT public.launch_step_is_admin_only(step_key)) AND (EXISTS ( SELECT 1
   FROM public.club_launches l
  WHERE ((l.id = launch_step_progress.launch_id) AND public.is_launch_operator(l.region))))))) WITH CHECK ((public.is_platform_admin() OR ((NOT public.launch_step_is_admin_only(step_key)) AND (EXISTS ( SELECT 1
   FROM public.club_launches l
  WHERE ((l.id = launch_step_progress.launch_id) AND public.is_launch_operator(l.region)))))));


--
-- Name: matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

--
-- Name: matches matches_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY matches_member_write ON public.matches USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: matches matches_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY matches_public_read ON public.matches FOR SELECT USING ((club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status))));


--
-- Name: mfa_backup_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- Name: modules modules_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modules_admin_all ON public.modules USING ((public.is_club_admin(club_id) OR public.is_super_admin()));


--
-- Name: modules modules_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY modules_public_read ON public.modules FOR SELECT USING ((enabled = true));


--
-- Name: news; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

--
-- Name: news news_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY news_admin_all ON public.news USING ((public.is_club_admin(club_id) OR public.is_super_admin()));


--
-- Name: news news_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY news_member_read ON public.news FOR SELECT TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: news news_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY news_member_write ON public.news TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: news news_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY news_public_read ON public.news FOR SELECT USING (((status = 'published'::public.content_status) AND (club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status)))));


--
-- Name: mfa_backup_codes own backup codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "own backup codes" ON public.mfa_backup_codes FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

--
-- Name: people people_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY people_mod ON public.people TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: people people_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY people_sel ON public.people FOR SELECT TO authenticated USING (public.vm_is_club_member(club_id));


--
-- Name: person_compliance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.person_compliance ENABLE ROW LEVEL SECURITY;

--
-- Name: person_compliance person_compliance_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_compliance_read ON public.person_compliance FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = person_compliance.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = person_compliance.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: person_compliance person_compliance_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_compliance_write ON public.person_compliance USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: person_relationships person_rel_member_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_rel_member_rw ON public.person_relationships USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: person_relationships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.person_relationships ENABLE ROW LEVEL SECURITY;

--
-- Name: person_relationships person_relationships_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_relationships_read ON public.person_relationships FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = person_relationships.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = person_relationships.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: person_relationships person_relationships_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_relationships_write ON public.person_relationships USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: person_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.person_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: person_roles person_roles_member_rw; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY person_roles_member_rw ON public.person_roles USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: platform_admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_admins platform_admins_self_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY platform_admins_self_read ON public.platform_admins FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: platform_user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_user_roles pur_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pur_read ON public.platform_user_roles FOR SELECT USING (((user_id = auth.uid()) OR public.is_superadmin()));


--
-- Name: platform_user_roles pur_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY pur_write ON public.platform_user_roles USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());


--
-- Name: registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: registrations registrations_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY registrations_read ON public.registrations FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = registrations.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = registrations.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: registrations registrations_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY registrations_write ON public.registrations USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: sales_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales_products ENABLE ROW LEVEL SECURITY;

--
-- Name: sales_products sales_products_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_products_admin ON public.sales_products USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: sales_targets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

--
-- Name: sales_targets sales_targets_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_targets_admin ON public.sales_targets USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: seasons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

--
-- Name: seasons seasons_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY seasons_read ON public.seasons FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = seasons.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = seasons.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: seasons seasons_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY seasons_write ON public.seasons USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: sitepulse_comments sitepulse_cm_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sitepulse_cm_insert ON public.sitepulse_comments FOR INSERT WITH CHECK ((public.is_platform_admin() OR ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)) AND (visibility = 'client_visible'::text))));


--
-- Name: sitepulse_comments sitepulse_cm_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sitepulse_cm_select ON public.sitepulse_comments FOR SELECT USING ((public.is_platform_admin() OR ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)) AND (visibility = 'client_visible'::text))));


--
-- Name: sitepulse_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sitepulse_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: sitepulse_feedback sitepulse_fb_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sitepulse_fb_insert ON public.sitepulse_feedback FOR INSERT WITH CHECK ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: sitepulse_feedback sitepulse_fb_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sitepulse_fb_select ON public.sitepulse_feedback FOR SELECT USING ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: sitepulse_feedback sitepulse_fb_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sitepulse_fb_update ON public.sitepulse_feedback FOR UPDATE USING ((public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: sitepulse_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sitepulse_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsors sponsors_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sponsors_admin_all ON public.sponsors USING ((public.is_club_admin(club_id) OR public.is_super_admin()));


--
-- Name: sponsors sponsors_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sponsors_member_read ON public.sponsors FOR SELECT TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: sponsors sponsors_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sponsors_member_write ON public.sponsors TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: sponsors sponsors_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sponsors_public_read ON public.sponsors FOR SELECT USING (((status = 'published'::public.content_status) AND (club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status)))));


--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members team_members_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY team_members_read ON public.team_members FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.club_users cu
  WHERE ((cu.club_id = team_members.club_id) AND (cu.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.user_club_roles ucr
  WHERE ((ucr.club_id = team_members.club_id) AND (ucr.user_id = auth.uid()))))));


--
-- Name: team_members team_members_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY team_members_write ON public.team_members USING (public.is_club_senior(club_id)) WITH CHECK (public.is_club_senior(club_id));


--
-- Name: teams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

--
-- Name: teams teams_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_admin_all ON public.teams USING ((public.is_club_admin(club_id) OR public.is_super_admin()));


--
-- Name: teams teams_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_member_read ON public.teams FOR SELECT TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: teams teams_member_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_member_write ON public.teams TO authenticated USING ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids))) WITH CHECK ((club_id IN ( SELECT public.my_club_ids() AS my_club_ids)));


--
-- Name: teams teams_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_public_read ON public.teams FOR SELECT USING (((status = 'published'::public.content_status) AND (club_id IN ( SELECT clubs.id
   FROM public.clubs
  WHERE (clubs.website_status = 'published'::public.website_status)))));


--
-- Name: templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

--
-- Name: templates templates_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY templates_public_read ON public.templates FOR SELECT USING ((status = 'active'::public.template_status));


--
-- Name: templates templates_super_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY templates_super_admin_all ON public.templates USING (public.is_super_admin());


--
-- Name: tk_club_stripe; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_club_stripe ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_club_stripe tk_club_stripe_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_club_stripe_member_read ON public.tk_club_stripe FOR SELECT USING (public.tk_is_club_member(club_id));


--
-- Name: tk_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_events ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_events tk_events_member_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_events_member_all ON public.tk_events USING (public.tk_is_club_member(club_id)) WITH CHECK (public.tk_is_club_member(club_id));


--
-- Name: tk_events tk_events_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_events_public_read ON public.tk_events FOR SELECT USING ((status = 'published'::text));


--
-- Name: tk_fee_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_fee_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_fee_rules tk_fee_rules_member_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_fee_rules_member_all ON public.tk_fee_rules USING (((club_id IS NULL) OR public.tk_is_club_member(club_id))) WITH CHECK (((club_id IS NULL) OR public.tk_is_club_member(club_id)));


--
-- Name: tk_order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_order_items tk_order_items_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_order_items_member ON public.tk_order_items USING ((EXISTS ( SELECT 1
   FROM public.tk_orders o
  WHERE ((o.id = tk_order_items.order_id) AND public.tk_is_club_member(o.club_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.tk_orders o
  WHERE ((o.id = tk_order_items.order_id) AND public.tk_is_club_member(o.club_id)))));


--
-- Name: tk_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_orders tk_orders_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_orders_member_read ON public.tk_orders FOR SELECT USING (public.tk_is_club_member(club_id));


--
-- Name: tk_orders tk_orders_staff_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_orders_staff_insert ON public.tk_orders FOR INSERT WITH CHECK (public.tk_has_club_role(club_id, ARRAY['admin'::text, 'supervisor'::text, 'gate'::text, 'seller'::text]));


--
-- Name: tk_scan_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_scan_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_scan_codes tk_scan_codes_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_scan_codes_admin_all ON public.tk_scan_codes USING ((public.tk_my_role(club_id) = 'admin'::text)) WITH CHECK ((public.tk_my_role(club_id) = 'admin'::text));


--
-- Name: tk_scans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_scans tk_scans_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_scans_member ON public.tk_scans USING (public.tk_is_club_member(club_id)) WITH CHECK (public.tk_is_club_member(club_id));


--
-- Name: tk_staff; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_staff ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_staff tk_staff_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_staff_admin_all ON public.tk_staff USING ((public.tk_my_role(club_id) = 'admin'::text)) WITH CHECK ((public.tk_my_role(club_id) = 'admin'::text));


--
-- Name: tk_ticket_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_ticket_types ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tk_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: tk_tickets tk_tickets_member_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_tickets_member_read ON public.tk_tickets FOR SELECT USING (public.tk_is_club_member(club_id));


--
-- Name: tk_tickets tk_tickets_redeem; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_tickets_redeem ON public.tk_tickets FOR UPDATE USING (public.tk_has_club_role(club_id, ARRAY['admin'::text, 'supervisor'::text, 'gate'::text, 'scanner'::text])) WITH CHECK (public.tk_has_club_role(club_id, ARRAY['admin'::text, 'supervisor'::text, 'gate'::text, 'scanner'::text]));


--
-- Name: tk_ticket_types tk_types_member_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_types_member_all ON public.tk_ticket_types USING (public.tk_is_club_member(club_id)) WITH CHECK (public.tk_is_club_member(club_id));


--
-- Name: tk_ticket_types tk_types_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tk_types_public_read ON public.tk_ticket_types FOR SELECT USING ((is_active AND (EXISTS ( SELECT 1
   FROM public.tk_events e
  WHERE ((e.id = tk_ticket_types.event_id) AND (e.status = 'published'::text))))));


--
-- Name: trial_email_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trial_email_log ENABLE ROW LEVEL SECURITY;

--
-- Name: user_club_roles ucr_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ucr_read ON public.user_club_roles FOR SELECT USING (((user_id = auth.uid()) OR public.is_platform_admin() OR (club_id IN ( SELECT public.my_club_ids() AS my_club_ids))));


--
-- Name: user_club_roles ucr_senior_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ucr_senior_write ON public.user_club_roles TO authenticated USING ((public.is_club_senior(club_id) AND (role = 'club_admin'::text))) WITH CHECK ((public.is_club_senior(club_id) AND (role = 'club_admin'::text)));


--
-- Name: user_club_roles ucr_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY ucr_write ON public.user_club_roles USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());


--
-- Name: user_club_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_club_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_sms_packs vm_sms_packs_club; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vm_sms_packs_club ON public.volunteer_sms_packs FOR SELECT TO authenticated USING (public.vm_is_club_member(club_id));


--
-- Name: volunteer_ai_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_ai_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_ai_suggestions volunteer_ai_suggestions_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_ai_suggestions_mod ON public.volunteer_ai_suggestions TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_ai_suggestions volunteer_ai_suggestions_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_ai_suggestions_sel ON public.volunteer_ai_suggestions FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_applications volunteer_applications_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_applications_mod ON public.volunteer_applications TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_applications volunteer_applications_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_applications_sel ON public.volunteer_applications FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_availability; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_availability ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_availability volunteer_availability_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_availability_mod ON public.volunteer_availability TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_availability volunteer_availability_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_availability_sel ON public.volunteer_availability FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_compliance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_compliance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_compliance_records volunteer_compliance_records_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_compliance_records_mod ON public.volunteer_compliance_records TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_compliance_records volunteer_compliance_records_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_compliance_records_sel ON public.volunteer_compliance_records FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_documents volunteer_documents_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_documents_mod ON public.volunteer_documents TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_documents volunteer_documents_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_documents_sel ON public.volunteer_documents FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_feedback volunteer_feedback_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_feedback_mod ON public.volunteer_feedback TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_feedback volunteer_feedback_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_feedback_sel ON public.volunteer_feedback FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_hours volunteer_hours_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_mod ON public.volunteer_hours TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_hours volunteer_hours_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_hours_sel ON public.volunteer_hours FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_message_dispatches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_message_dispatches ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_dispatches_mod ON public.volunteer_message_dispatches TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_message_dispatches volunteer_message_dispatches_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_dispatches_sel ON public.volunteer_message_dispatches FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_message_recipients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_message_recipients ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_message_recipients volunteer_message_recipients_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_recipients_mod ON public.volunteer_message_recipients TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_message_recipients volunteer_message_recipients_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_recipients_sel ON public.volunteer_message_recipients FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_message_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_message_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_message_templates volunteer_message_templates_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_templates_mod ON public.volunteer_message_templates TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_message_templates volunteer_message_templates_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_message_templates_sel ON public.volunteer_message_templates FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_messages volunteer_messages_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_messages_mod ON public.volunteer_messages TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_messages volunteer_messages_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_messages_sel ON public.volunteer_messages FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_opportunities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_opportunities volunteer_opportunities_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_opportunities_mod ON public.volunteer_opportunities TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_opportunities volunteer_opportunities_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_opportunities_sel ON public.volunteer_opportunities FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_plans volunteer_plans_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_plans_mod ON public.volunteer_plans TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_plans volunteer_plans_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_plans_sel ON public.volunteer_plans FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_profiles volunteer_profiles_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_profiles_mod ON public.volunteer_profiles TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_profiles volunteer_profiles_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_profiles_sel ON public.volunteer_profiles FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_provider_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_provider_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_provider_connections volunteer_provider_connections_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_provider_connections_mod ON public.volunteer_provider_connections TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_provider_connections volunteer_provider_connections_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_provider_connections_sel ON public.volunteer_provider_connections FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_recognition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_recognition ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_recognition volunteer_recognition_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_recognition_mod ON public.volunteer_recognition TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_recognition volunteer_recognition_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_recognition_sel ON public.volunteer_recognition FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_role_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_role_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_role_templates volunteer_role_templates_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_role_templates_mod ON public.volunteer_role_templates TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_role_templates volunteer_role_templates_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_role_templates_sel ON public.volunteer_role_templates FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_roles volunteer_roles_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_roles_mod ON public.volunteer_roles TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_roles volunteer_roles_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_roles_sel ON public.volunteer_roles FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_rosters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_rosters ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_rosters volunteer_rosters_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_rosters_mod ON public.volunteer_rosters TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_rosters volunteer_rosters_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_rosters_sel ON public.volunteer_rosters FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_settings volunteer_settings_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_settings_mod ON public.volunteer_settings TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_settings volunteer_settings_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_settings_sel ON public.volunteer_settings FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_shift_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_shift_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_shift_assignments_mod ON public.volunteer_shift_assignments TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_shift_assignments volunteer_shift_assignments_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_shift_assignments_sel ON public.volunteer_shift_assignments FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_shifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_shifts volunteer_shifts_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_shifts_mod ON public.volunteer_shifts TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_shifts volunteer_shifts_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_shifts_sel ON public.volunteer_shifts FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_skills volunteer_skills_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_skills_mod ON public.volunteer_skills TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_skills volunteer_skills_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_skills_sel ON public.volunteer_skills FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteer_sms_packs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_sms_packs ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_training_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteer_training_records ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteer_training_records volunteer_training_records_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_training_records_mod ON public.volunteer_training_records TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteer_training_records volunteer_training_records_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteer_training_records_sel ON public.volunteer_training_records FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: volunteers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

--
-- Name: volunteers volunteers_mod; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteers_mod ON public.volunteers TO authenticated USING (public.vm_is_club_member(club_id)) WITH CHECK (public.vm_is_club_member(club_id));


--
-- Name: volunteers volunteers_sel; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY volunteers_sel ON public.volunteers FOR SELECT TO authenticated USING (((club_id IS NULL) OR public.vm_is_club_member(club_id)));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: objects club-media member delete; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "club-media member delete" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'club-media'::text) AND (public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.my_club_ids() cid(cid)
  WHERE ((cid.cid)::text = (storage.foldername(objects.name))[1]))))));


--
-- Name: objects club-media member insert; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "club-media member insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'club-media'::text) AND (public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.my_club_ids() cid(cid)
  WHERE ((cid.cid)::text = (storage.foldername(objects.name))[1]))))));


--
-- Name: objects club-media member update; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "club-media member update" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'club-media'::text) AND (public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.my_club_ids() cid(cid)
  WHERE ((cid.cid)::text = (storage.foldername(objects.name))[1]))))));


--
-- Name: objects club-media read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "club-media read" ON storage.objects FOR SELECT USING ((bucket_id = 'club-media'::text));


--
-- Name: objects club_onboarding_read_files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY club_onboarding_read_files ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'club-onboarding'::text) AND (public.is_platform_admin() OR public.is_super_admin())));


--
-- Name: objects club_onboarding_upload; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY club_onboarding_upload ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK ((bucket_id = 'club-onboarding'::text));


--
-- Name: objects le_read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY le_read ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'launch-evidence'::text) AND (public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.club_launches l
  WHERE (((l.id)::text = split_part(objects.name, '/'::text, 1)) AND public.is_launch_operator(l.region)))))));


--
-- Name: objects le_write; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY le_write ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'launch-evidence'::text) AND (public.is_platform_admin() OR (EXISTS ( SELECT 1
   FROM public.club_launches l
  WHERE (((l.id)::text = split_part(objects.name, '/'::text, 1)) AND public.is_launch_operator(l.region)))))));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: objects tk_logos_delete; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY tk_logos_delete ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'tk-logos'::text));


--
-- Name: objects tk_logos_insert; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY tk_logos_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'tk-logos'::text));


--
-- Name: objects tk_logos_read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY tk_logos_read ON storage.objects FOR SELECT USING ((bucket_id = 'tk-logos'::text));


--
-- Name: objects tk_logos_update; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY tk_logos_update ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'tk-logos'::text));


--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA cron; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA cron TO postgres WITH GRANT OPTION;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION job_cache_invalidate(); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.job_cache_invalidate() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(schedule text, command text); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.schedule(schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(job_name text, schedule text, command text); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.schedule(job_name text, schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_id bigint); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.unschedule(job_id bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_name text); Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON FUNCTION cron.unschedule(job_name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: -
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: -
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: -
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: -
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION add_club_member(p_club uuid, p_profile jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.add_club_member(p_club uuid, p_profile jsonb) TO authenticated;


--
-- Name: FUNCTION add_person_role(p_club uuid, p_person uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.add_person_role(p_club uuid, p_person uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date) TO authenticated;


--
-- Name: FUNCTION admin_create_club(p_name text, p_slug text, p_primary text, p_secondary text, p_tertiary text, p_contact text, p_sport text, p_admin_email text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_create_club(p_name text, p_slug text, p_primary text, p_secondary text, p_tertiary text, p_contact text, p_sport text, p_admin_email text) TO authenticated;


--
-- Name: TABLE clubs; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.clubs TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.clubs TO authenticated;
GRANT ALL ON TABLE public.clubs TO service_role;


--
-- Name: FUNCTION admin_get_club(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_get_club(p_club uuid) TO authenticated;


--
-- Name: FUNCTION admin_get_club_by_slug(p_slug text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_get_club_by_slug(p_slug text) TO authenticated;


--
-- Name: FUNCTION admin_list_clubs(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_list_clubs() TO authenticated;


--
-- Name: FUNCTION admin_list_modules(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_list_modules() TO authenticated;


--
-- Name: FUNCTION admin_list_platform_staff(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_list_platform_staff() TO authenticated;


--
-- Name: FUNCTION admin_list_seasons(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_list_seasons(p_club uuid) TO authenticated;


--
-- Name: FUNCTION admin_list_teams(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_list_teams(p_club uuid) TO authenticated;


--
-- Name: FUNCTION admin_recent_messages(p_limit integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_recent_messages(p_limit integer) TO authenticated;


--
-- Name: FUNCTION admin_revoke_platform_role(p_user_id uuid, p_reason text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_revoke_platform_role(p_user_id uuid, p_reason text) TO authenticated;


--
-- Name: FUNCTION admin_set_club_account(p_club_id uuid, p_account_status text, p_plan text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_set_club_account(p_club_id uuid, p_account_status text, p_plan text) TO authenticated;


--
-- Name: FUNCTION admin_set_module(p_club uuid, p_key text, p_status text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_set_module(p_club uuid, p_key text, p_status text) TO authenticated;


--
-- Name: FUNCTION admin_set_platform_role(p_user_id uuid, p_role text, p_reason text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.admin_set_platform_role(p_user_id uuid, p_role text, p_reason text) TO authenticated;


--
-- Name: FUNCTION can_manage_club_people(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.can_manage_club_people(p_club uuid) TO authenticated;


--
-- Name: FUNCTION cancel_club_invite(p_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.cancel_club_invite(p_id uuid) TO authenticated;


--
-- Name: FUNCTION capture_lead(p_name text, p_org text, p_role text, p_sport text, p_state text, p_email text, p_phone text, p_challenge text, p_source text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.capture_lead(p_name text, p_org text, p_role text, p_sport text, p_state text, p_email text, p_phone text, p_challenge text, p_source text) TO anon;
GRANT ALL ON FUNCTION public.capture_lead(p_name text, p_org text, p_role text, p_sport text, p_state text, p_email text, p_phone text, p_challenge text, p_source text) TO authenticated;


--
-- Name: FUNCTION claim_member_invites(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.claim_member_invites() TO authenticated;


--
-- Name: FUNCTION claim_trial_clubs(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.claim_trial_clubs() TO authenticated;


--
-- Name: FUNCTION club_retention(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.club_retention(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION club_role(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.club_role(p_club uuid) TO authenticated;


--
-- Name: FUNCTION club_setup_status(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.club_setup_status(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION create_trial_club(p_name text, p_sport text, p_variant text, p_email text, p_primary text, p_secondary text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.create_trial_club(p_name text, p_sport text, p_variant text, p_email text, p_primary text, p_secondary text) TO anon;
GRANT ALL ON FUNCTION public.create_trial_club(p_name text, p_sport text, p_variant text, p_email text, p_primary text, p_secondary text) TO authenticated;


--
-- Name: FUNCTION delete_person_role(p_role_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.delete_person_role(p_role_id uuid) TO authenticated;


--
-- Name: FUNCTION delete_season(p_club uuid, p_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.delete_season(p_club uuid, p_id uuid) TO authenticated;


--
-- Name: FUNCTION delete_team(p_club uuid, p_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.delete_team(p_club uuid, p_id uuid) TO authenticated;


--
-- Name: FUNCTION end_person_role(p_role_id uuid, p_end_date date); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.end_person_role(p_role_id uuid, p_end_date date) TO authenticated;


--
-- Name: FUNCTION get_club_by_preview_token(p_token uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.get_club_by_preview_token(p_token uuid) TO anon;
GRANT ALL ON FUNCTION public.get_club_by_preview_token(p_token uuid) TO authenticated;


--
-- Name: FUNCTION get_club_content_by_preview_token(p_token uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.get_club_content_by_preview_token(p_token uuid) TO anon;
GRANT ALL ON FUNCTION public.get_club_content_by_preview_token(p_token uuid) TO authenticated;


--
-- Name: FUNCTION get_member_detail(p_club uuid, p_person uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.get_member_detail(p_club uuid, p_person uuid) TO authenticated;


--
-- Name: FUNCTION invite_club_member(p_club uuid, p_email text, p_name text, p_role text, p_title text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.invite_club_member(p_club uuid, p_email text, p_name text, p_role text, p_title text) TO authenticated;


--
-- Name: FUNCTION is_club_admin(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_club_admin(p_club_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_club_admin(p_club_id uuid) TO service_role;


--
-- Name: FUNCTION is_club_senior(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_club_senior(p_club uuid) TO authenticated;


--
-- Name: FUNCTION is_launch_operator(p_region text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_launch_operator(p_region text) TO authenticated;


--
-- Name: FUNCTION is_platform_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_platform_admin() TO authenticated;


--
-- Name: FUNCTION is_site_admin(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_site_admin(p_club_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_site_admin(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION is_sportsweb_builder(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_sportsweb_builder() TO authenticated;


--
-- Name: FUNCTION is_sportsweb_manager(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_sportsweb_manager() TO authenticated;


--
-- Name: FUNCTION is_super_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_super_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_super_admin() TO service_role;


--
-- Name: FUNCTION is_superadmin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_superadmin() TO authenticated;


--
-- Name: FUNCTION launch_step_is_admin_only(p_step_key text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.launch_step_is_admin_only(p_step_key text) TO authenticated;


--
-- Name: FUNCTION list_club_invites(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.list_club_invites(p_club uuid) TO authenticated;


--
-- Name: FUNCTION list_club_members(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.list_club_members(p_club uuid) TO authenticated;


--
-- Name: FUNCTION list_club_people(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.list_club_people(p_club uuid) TO authenticated;


--
-- Name: FUNCTION list_club_seasons(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.list_club_seasons(p_club uuid) TO authenticated;


--
-- Name: FUNCTION list_club_teams(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.list_club_teams(p_club uuid) TO authenticated;


--
-- Name: FUNCTION mfa_backup_codes_remaining(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.mfa_backup_codes_remaining() TO authenticated;


--
-- Name: FUNCTION mfa_store_backup_codes(p_hashes text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.mfa_store_backup_codes(p_hashes text[]) TO authenticated;


--
-- Name: FUNCTION my_club_ids(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.my_club_ids() TO authenticated;
GRANT ALL ON FUNCTION public.my_club_ids() TO service_role;


--
-- Name: FUNCTION my_platform_role(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.my_platform_role() TO authenticated;


--
-- Name: FUNCTION platform_dashboard(p_scope text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.platform_dashboard(p_scope text) TO authenticated;


--
-- Name: FUNCTION platform_retention(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.platform_retention() TO authenticated;


--
-- Name: FUNCTION public_club_page(p_club_id uuid, p_slug text, p_preview_token text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text) TO anon;
GRANT ALL ON FUNCTION public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text) TO authenticated;


--
-- Name: FUNCTION publish_club_page(p_page_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.publish_club_page(p_page_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.publish_club_page(p_page_id uuid) TO authenticated;


--
-- Name: FUNCTION restore_club_page_version(p_version_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.restore_club_page_version(p_version_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.restore_club_page_version(p_version_id uuid) TO authenticated;


--
-- Name: FUNCTION revert_club_page(p_page_id uuid); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.revert_club_page(p_page_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.revert_club_page(p_page_id uuid) TO authenticated;


--
-- Name: FUNCTION rotate_club_preview_token(p_club_id uuid, p_expires_at timestamp with time zone); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.rotate_club_preview_token(p_club_id uuid, p_expires_at timestamp with time zone) TO authenticated;


--
-- Name: FUNCTION set_club_colours(p_club uuid, p_primary text, p_secondary text, p_tertiary text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_club_colours(p_club uuid, p_primary text, p_secondary text, p_tertiary text) TO authenticated;


--
-- Name: FUNCTION set_member_committee(p_user uuid, p_club uuid, p_display_name text, p_title text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_member_committee(p_user uuid, p_club uuid, p_display_name text, p_title text) TO authenticated;


--
-- Name: FUNCTION set_my_committee_profile(p_club uuid, p_display_name text, p_title text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_my_committee_profile(p_club uuid, p_display_name text, p_title text) TO authenticated;


--
-- Name: FUNCTION set_website_status(p_club uuid, p_status public.website_status); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_website_status(p_club uuid, p_status public.website_status) TO authenticated;


--
-- Name: FUNCTION start_club_launch(p_club_id uuid, p_region text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.start_club_launch(p_club_id uuid, p_region text) TO authenticated;


--
-- Name: FUNCTION tk_add_staff(p_club_id uuid, p_email text, p_role text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_add_staff(p_club_id uuid, p_email text, p_role text) TO authenticated;


--
-- Name: FUNCTION tk_admit_ticket(p_ticket_id uuid, p_gate text, p_device text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_admit_ticket(p_ticket_id uuid, p_gate text, p_device text) TO authenticated;


--
-- Name: FUNCTION tk_calc_fee(p_fee_rule_id uuid, p_subtotal_cents integer, p_ticket_count integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_calc_fee(p_fee_rule_id uuid, p_subtotal_cents integer, p_ticket_count integer) TO authenticated;


--
-- Name: FUNCTION tk_can_view_club(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_can_view_club(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_checkout_pricing(p_event_id uuid, p_items jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_checkout_pricing(p_event_id uuid, p_items jsonb) TO service_role;


--
-- Name: FUNCTION tk_claim_staff(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_claim_staff() TO authenticated;


--
-- Name: FUNCTION tk_club_events(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_club_events(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_club_summary(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_club_summary(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_create_scan_code(p_club_id uuid, p_event_id uuid, p_label text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_create_scan_code(p_club_id uuid, p_event_id uuid, p_label text) TO authenticated;


--
-- Name: FUNCTION tk_events_for_code(p_code text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_events_for_code(p_code text) TO anon;
GRANT ALL ON FUNCTION public.tk_events_for_code(p_code text) TO authenticated;


--
-- Name: FUNCTION tk_feature(p_club_id uuid, p_feature text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_feature(p_club_id uuid, p_feature text) TO authenticated;


--
-- Name: FUNCTION tk_fee_for_club(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_fee_for_club(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_get_order_tickets(p_order_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_get_order_tickets(p_order_id uuid) TO anon;
GRANT ALL ON FUNCTION public.tk_get_order_tickets(p_order_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_is_platform_admin(p_uid uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_is_platform_admin(p_uid uuid) TO anon;
GRANT ALL ON FUNCTION public.tk_is_platform_admin(p_uid uuid) TO authenticated;


--
-- Name: FUNCTION tk_issue_tickets(p_order_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_issue_tickets(p_order_id uuid) TO service_role;


--
-- Name: FUNCTION tk_list_scan_codes(p_event_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_list_scan_codes(p_event_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_list_staff(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_list_staff(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_module_enabled(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_module_enabled(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_my_clubs(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_my_clubs() TO authenticated;


--
-- Name: FUNCTION tk_my_role(p_club_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_my_role(p_club_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_quote_order(p_event_id uuid, p_items jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_quote_order(p_event_id uuid, p_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.tk_quote_order(p_event_id uuid, p_items jsonb) TO authenticated;


--
-- Name: FUNCTION tk_remove_staff(p_staff_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_remove_staff(p_staff_id uuid) TO authenticated;


--
-- Name: FUNCTION tk_scan_ticket(p_qr text, p_gate text, p_device text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_scan_ticket(p_qr text, p_gate text, p_device text) TO authenticated;


--
-- Name: FUNCTION tk_scan_with_code(p_code text, p_qr text, p_gate text, p_device text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_scan_with_code(p_code text, p_qr text, p_gate text, p_device text) TO anon;
GRANT ALL ON FUNCTION public.tk_scan_with_code(p_code text, p_qr text, p_gate text, p_device text) TO authenticated;


--
-- Name: FUNCTION tk_set_scan_code_active(p_code_id uuid, p_active boolean); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.tk_set_scan_code_active(p_code_id uuid, p_active boolean) TO authenticated;


--
-- Name: FUNCTION update_member_profile(p_club uuid, p_person uuid, p_patch jsonb); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_member_profile(p_club uuid, p_person uuid, p_patch jsonb) TO authenticated;


--
-- Name: FUNCTION update_person_role(p_role_id uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date, p_status text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_person_role(p_role_id uuid, p_role text, p_sport text, p_team_id uuid, p_season_id uuid, p_committee_title text, p_start_date date, p_status text) TO authenticated;


--
-- Name: FUNCTION update_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at() TO service_role;


--
-- Name: FUNCTION upsert_season(p_club uuid, p_id uuid, p_name text, p_sport text, p_start date, p_end date, p_is_current boolean); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.upsert_season(p_club uuid, p_id uuid, p_name text, p_sport text, p_start date, p_end date, p_is_current boolean) TO authenticated;


--
-- Name: FUNCTION upsert_team(p_club uuid, p_id uuid, p_name text, p_sport text, p_age_group text, p_gender text, p_grade text, p_coach text, p_status text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.upsert_team(p_club uuid, p_id uuid, p_name text, p_sport text, p_age_group text, p_gender text, p_grade text, p_coach text, p_status text) TO authenticated;


--
-- Name: FUNCTION vm_effective_features(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_effective_features(p_club uuid) TO authenticated;
GRANT ALL ON FUNCTION public.vm_effective_features(p_club uuid) TO service_role;


--
-- Name: FUNCTION vm_feature(p_club uuid, p_key text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_feature(p_club uuid, p_key text) TO authenticated;
GRANT ALL ON FUNCTION public.vm_feature(p_club uuid, p_key text) TO service_role;


--
-- Name: FUNCTION vm_is_club_member(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_is_club_member(p_club uuid) TO authenticated;
GRANT ALL ON FUNCTION public.vm_is_club_member(p_club uuid) TO service_role;


--
-- Name: FUNCTION vm_limit(p_club uuid, p_key text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_limit(p_club uuid, p_key text) TO authenticated;
GRANT ALL ON FUNCTION public.vm_limit(p_club uuid, p_key text) TO service_role;


--
-- Name: FUNCTION vm_marketing_opt_in_by_mobile(p_mobile text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_marketing_opt_in_by_mobile(p_mobile text) TO service_role;


--
-- Name: FUNCTION vm_marketing_opt_out_by_mobile(p_mobile text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_marketing_opt_out_by_mobile(p_mobile text) TO service_role;


--
-- Name: FUNCTION vm_module_enabled(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_module_enabled(p_club uuid) TO authenticated;
GRANT ALL ON FUNCTION public.vm_module_enabled(p_club uuid) TO service_role;


--
-- Name: FUNCTION vm_sms_quota(p_club uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_sms_quota(p_club uuid) TO authenticated;
GRANT ALL ON FUNCTION public.vm_sms_quota(p_club uuid) TO service_role;


--
-- Name: FUNCTION vm_touch_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.vm_touch_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.vm_touch_updated_at() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: -
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: -
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: -
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: -
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE job; Type: ACL; Schema: cron; Owner: -
--

GRANT SELECT ON TABLE cron.job TO postgres WITH GRANT OPTION;


--
-- Name: TABLE job_run_details; Type: ACL; Schema: cron; Owner: -
--

GRANT ALL ON TABLE cron.job_run_details TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: -
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE access_audit; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.access_audit TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.access_audit TO service_role;


--
-- Name: TABLE club_content; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_content TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_content TO service_role;
GRANT SELECT ON TABLE public.club_content TO anon;


--
-- Name: TABLE club_launches; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_launches TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_launches TO service_role;


--
-- Name: TABLE club_member_invites; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_member_invites TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_member_invites TO service_role;


--
-- Name: TABLE club_messages; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_messages TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_messages TO service_role;


--
-- Name: TABLE club_modules; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_modules TO authenticated;
GRANT SELECT ON TABLE public.club_modules TO anon;


--
-- Name: TABLE club_modules_backup_20260622; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_modules_backup_20260622 TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_modules_backup_20260622 TO service_role;


--
-- Name: TABLE club_needs; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_needs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_needs TO service_role;


--
-- Name: TABLE club_onboarding; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_onboarding TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_onboarding TO service_role;


--
-- Name: TABLE club_page_versions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.club_page_versions TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_page_versions TO service_role;


--
-- Name: TABLE club_pages; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.club_pages TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_pages TO service_role;


--
-- Name: COLUMN club_pages.club_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(club_id) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.slug; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(slug) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.title; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(title),UPDATE(title) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.nav_label; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(nav_label),UPDATE(nav_label) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.nav_order; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(nav_order),UPDATE(nav_order) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.nav_visible; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(nav_visible),UPDATE(nav_visible) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.nav_parent_id; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(nav_parent_id),UPDATE(nav_parent_id) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.is_home; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(is_home) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.seo; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(seo),UPDATE(seo) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.draft_layout; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(draft_layout),UPDATE(draft_layout) ON TABLE public.club_pages TO authenticated;


--
-- Name: COLUMN club_pages.updated_by; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(updated_by),UPDATE(updated_by) ON TABLE public.club_pages TO authenticated;


--
-- Name: TABLE club_themes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_themes TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_themes TO service_role;
GRANT SELECT ON TABLE public.club_themes TO anon;


--
-- Name: TABLE club_users; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.club_users TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.club_users TO authenticated;
GRANT ALL ON TABLE public.club_users TO service_role;


--
-- Name: TABLE compliance_records; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.compliance_records TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.compliance_records TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.events TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE injuries; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.injuries TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.injuries TO service_role;


--
-- Name: TABLE ladder; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ladder TO authenticated;
GRANT SELECT ON TABLE public.ladder TO anon;


--
-- Name: TABLE launch_operators; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_operators TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_operators TO service_role;


--
-- Name: TABLE launch_phases; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_phases TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_phases TO service_role;


--
-- Name: TABLE launch_step_catalog; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_step_catalog TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_step_catalog TO service_role;


--
-- Name: TABLE launch_step_progress; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_step_progress TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.launch_step_progress TO service_role;


--
-- Name: TABLE leads; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leads TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leads TO service_role;


--
-- Name: TABLE matches; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.matches TO authenticated;
GRANT SELECT ON TABLE public.matches TO anon;


--
-- Name: TABLE mfa_backup_codes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.mfa_backup_codes TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.mfa_backup_codes TO service_role;


--
-- Name: TABLE modules; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.modules TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.modules TO authenticated;
GRANT ALL ON TABLE public.modules TO service_role;


--
-- Name: TABLE news; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.news TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.news TO authenticated;
GRANT ALL ON TABLE public.news TO service_role;


--
-- Name: TABLE people; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.people TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.people TO service_role;


--
-- Name: TABLE person_compliance; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_compliance TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_compliance TO service_role;


--
-- Name: TABLE person_relationships; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_relationships TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_relationships TO service_role;


--
-- Name: TABLE person_roles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_roles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.person_roles TO service_role;


--
-- Name: TABLE platform_admins; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.platform_admins TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.platform_admins TO service_role;


--
-- Name: TABLE platform_user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.platform_user_roles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.platform_user_roles TO service_role;


--
-- Name: TABLE registrations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.registrations TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.registrations TO service_role;


--
-- Name: TABLE sales_products; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sales_products TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sales_products TO service_role;


--
-- Name: TABLE sales_targets; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sales_targets TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sales_targets TO service_role;


--
-- Name: TABLE seasons; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.seasons TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.seasons TO service_role;


--
-- Name: TABLE sitepulse_comments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sitepulse_comments TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sitepulse_comments TO service_role;


--
-- Name: TABLE sitepulse_feedback; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sitepulse_feedback TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sitepulse_feedback TO service_role;


--
-- Name: TABLE sponsors; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.sponsors TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sponsors TO authenticated;
GRANT ALL ON TABLE public.sponsors TO service_role;


--
-- Name: TABLE team_members; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.team_members TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.team_members TO service_role;


--
-- Name: TABLE teams; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.teams TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.teams TO authenticated;
GRANT ALL ON TABLE public.teams TO service_role;


--
-- Name: TABLE templates; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.templates TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.templates TO authenticated;
GRANT ALL ON TABLE public.templates TO service_role;


--
-- Name: TABLE tk_club_stripe; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_club_stripe TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_club_stripe TO service_role;


--
-- Name: TABLE tk_event_sales_summary; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_event_sales_summary TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_event_sales_summary TO service_role;


--
-- Name: TABLE tk_events; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_events TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_events TO service_role;
GRANT SELECT ON TABLE public.tk_events TO anon;


--
-- Name: TABLE tk_fee_rules; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_fee_rules TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_fee_rules TO service_role;


--
-- Name: TABLE tk_order_items; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_order_items TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_order_items TO service_role;


--
-- Name: TABLE tk_orders; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_orders TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_orders TO service_role;


--
-- Name: TABLE tk_scan_codes; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_scan_codes TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_scan_codes TO service_role;


--
-- Name: TABLE tk_scans; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_scans TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_scans TO service_role;


--
-- Name: TABLE tk_staff; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_staff TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_staff TO service_role;


--
-- Name: TABLE tk_ticket_types; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_ticket_types TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_ticket_types TO service_role;
GRANT SELECT ON TABLE public.tk_ticket_types TO anon;


--
-- Name: TABLE tk_tickets; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_tickets TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tk_tickets TO service_role;


--
-- Name: TABLE trial_email_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.trial_email_log TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.trial_email_log TO service_role;


--
-- Name: TABLE user_club_roles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_club_roles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_club_roles TO service_role;


--
-- Name: TABLE v_club_launch_status; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.v_club_launch_status TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.v_club_launch_status TO service_role;


--
-- Name: TABLE v_club_people; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.v_club_people TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.v_club_people TO service_role;


--
-- Name: TABLE volunteer_ai_suggestions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_ai_suggestions TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_ai_suggestions TO service_role;


--
-- Name: TABLE volunteer_applications; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_applications TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_applications TO service_role;


--
-- Name: TABLE volunteer_availability; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_availability TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_availability TO service_role;


--
-- Name: TABLE volunteer_compliance_records; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_compliance_records TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_compliance_records TO service_role;


--
-- Name: TABLE volunteer_documents; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_documents TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_documents TO service_role;


--
-- Name: TABLE volunteer_feedback; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_feedback TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_feedback TO service_role;


--
-- Name: TABLE volunteer_hours; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_hours TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_hours TO service_role;


--
-- Name: TABLE volunteer_message_dispatches; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_dispatches TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_dispatches TO service_role;


--
-- Name: TABLE volunteer_message_recipients; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_recipients TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_recipients TO service_role;


--
-- Name: TABLE volunteer_message_templates; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_templates TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_message_templates TO service_role;


--
-- Name: TABLE volunteer_messages; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_messages TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_messages TO service_role;


--
-- Name: TABLE volunteer_opportunities; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_opportunities TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_opportunities TO service_role;


--
-- Name: TABLE volunteer_plans; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_plans TO authenticated;
GRANT SELECT ON TABLE public.volunteer_plans TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_plans TO service_role;


--
-- Name: TABLE volunteer_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_profiles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_profiles TO service_role;


--
-- Name: TABLE volunteer_provider_connections; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_provider_connections TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_provider_connections TO service_role;


--
-- Name: TABLE volunteer_recognition; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_recognition TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_recognition TO service_role;


--
-- Name: TABLE volunteer_role_templates; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_role_templates TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_role_templates TO service_role;


--
-- Name: TABLE volunteer_roles; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_roles TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_roles TO service_role;


--
-- Name: TABLE volunteer_rosters; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_rosters TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_rosters TO service_role;


--
-- Name: TABLE volunteer_settings; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_settings TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_settings TO service_role;


--
-- Name: TABLE volunteer_shift_assignments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_shift_assignments TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_shift_assignments TO service_role;


--
-- Name: TABLE volunteer_shifts; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_shifts TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_shifts TO service_role;


--
-- Name: TABLE volunteer_skills; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_skills TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_skills TO service_role;


--
-- Name: TABLE volunteer_sms_packs; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_sms_packs TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_sms_packs TO service_role;


--
-- Name: TABLE volunteer_training_records; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_training_records TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteer_training_records TO service_role;


--
-- Name: TABLE volunteers; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteers TO authenticated;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.volunteers TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: -
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: -
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: -
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: -
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: -
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: -
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: -
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: -
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: cron; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: cron; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: cron; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict LBWe8iNsPIIgerdoInsbZL65DItlcYC2h3a7MZpZcf1NgNVyzQ4qckQ0V3WNcBO

