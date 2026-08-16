-- ============================================================
-- Lock down SECURITY DEFINER RPCs that were anon/authenticated-executable via the
-- default PUBLIC grant but are meant to be service-role-only or internal.
-- Repo path: supabase/rpc-execute-lockdown.sql
-- ------------------------------------------------------------
-- Postgres grants EXECUTE on new functions to PUBLIC by default, and anon +
-- authenticated inherit through PUBLIC. Revoking from anon/authenticated BY NAME is
-- a no-op while PUBLIC still holds the grant -- you must revoke from PUBLIC. Three
-- SECURITY DEFINER functions were reachable from the browser that should not be:
--
--   tk_issue_tickets(uuid)          HIGH - mints status='valid' tickets for an order
--     with no auth check. Intended to run only from the paid-order webhook
--     (service_role). Anyone could have minted free tickets for an unpaid/cancelled
--     order. Added an `o.status = 'paid'` guard (defence in depth) AND locked exec.
--   mfa_recovery_consume(text,text) MED - consumes a 2FA backup code. Documented as
--     service-role-only (supabase/mfa.sql) but the revoke had drifted in prod.
--   audit_email_of(uuid)            LOW - resolves user_id -> email; internal helper
--     for the audit-log writer only (a SECURITY DEFINER function that runs as owner),
--     was anon-callable = email disclosure. No external caller.
--
-- APPLIED TO PROD 2026-08-05 - applied via MCP at Carson's authorization; verified
-- anon/authenticated EXECUTE = false for all three, service_role = true for the two
-- backend ones, paid-guard present in tk_issue_tickets. Pure ASCII, re-runnable.
-- ============================================================

-- 1) tk_issue_tickets: re-create with the paid-order guard (body otherwise identical).
create or replace function public.tk_issue_tickets(p_order_id uuid)
 returns void language plpgsql security definer
 set search_path to 'public','extensions'
as $function$
declare
    o tk_orders%rowtype; it tk_order_items%rowtype;
    v_secret text; v_next integer; i integer; v_tid uuid;
begin
    select * into o from tk_orders where id = p_order_id;
    if not found then raise exception 'Order not found'; end if;
    if o.status <> 'paid' then raise exception 'Order not paid'; end if;
    if exists (select 1 from tk_tickets where order_id = p_order_id) then
        return;  -- idempotent: never issue twice
    end if;
    perform pg_advisory_xact_lock(hashtext(o.event_id::text));
    select signing_secret into v_secret from tk_events where id = o.event_id;
    for it in select * from tk_order_items where order_id = p_order_id loop
        for i in 1..it.quantity loop
            v_tid := gen_random_uuid();
            select coalesce(max(serial_no),0) + 1 into v_next from tk_tickets where event_id = o.event_id;
            insert into tk_tickets
                (id, order_id, event_id, club_id, ticket_type_id, serial_no, signature, holder_name, status)
            values
                (v_tid, p_order_id, o.event_id, o.club_id, it.ticket_type_id, v_next,
                 encode(hmac(v_tid::text || '.' || o.event_id::text, v_secret, 'sha256'), 'hex'),
                 o.buyer_name, 'valid');
        end loop;
        update tk_ticket_types set quantity_sold = quantity_sold + it.quantity where id = it.ticket_type_id;
    end loop;
end;
$function$;

-- 2) Lock execution to the roles that legitimately need it.
revoke execute on function public.tk_issue_tickets(uuid)          from public, anon, authenticated;
grant  execute on function public.tk_issue_tickets(uuid)          to service_role;

revoke execute on function public.mfa_recovery_consume(text,text) from public, anon, authenticated;
grant  execute on function public.mfa_recovery_consume(text,text) to service_role;

revoke execute on function public.audit_email_of(uuid)            from public, anon, authenticated;
