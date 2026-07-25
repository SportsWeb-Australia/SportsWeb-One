// SitePulse capture endpoint for SportsWeb One -- "sitepulse-ingest"
// Deploy in the SportsWeb One Supabase project (ref uzibfawcwoapfbigpzum),
// via Edge Functions -> Deploy a new function -> Via Editor. Name: sitepulse-ingest.
// Public endpoint: it is meant to be callable from club public websites.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Element picker capture (v1 additive; tolerant of v2 fields).
// Rule: NEVER reject a report over element data. If any field is malformed,
// null it and save the report anyway. The comment is the value; the element
// is a bonus. This also guards the DB CHECK on element_confidence -- an
// invalid value MUST become null here, or the whole insert would fail.
// v1 widget fills element_tag/element_label/element_meta; element_selector
// and element_confidence stay null until the v2 selector engine sends them.
// ---------------------------------------------------------------------------
const ALLOWED_CONFIDENCE = ["high", "medium", "low", "none"];

function sanitizeElement(body: Record<string, unknown>) {
  // tag: lowercase-alpha, <= 20 chars, else null
  let element_tag: string | null = null;
  if (typeof body.element_tag === "string") {
    const t = body.element_tag.toLowerCase();
    if (/^[a-z]+$/.test(t) && t.length <= 20) element_tag = t;
  }

  // label: trimmed, capped at 200 chars
  let element_label: string | null = null;
  if (typeof body.element_label === "string") {
    const l = body.element_label.trim();
    if (l.length > 0) element_label = l.slice(0, 200);
  }

  // meta: plain object serialising under ~4KB, else null
  let element_meta: Record<string, unknown> | null = null;
  if (
    body.element_meta && typeof body.element_meta === "object" &&
    !Array.isArray(body.element_meta)
  ) {
    try {
      if (JSON.stringify(body.element_meta).length <= 4096) {
        element_meta = body.element_meta as Record<string, unknown>;
      }
    } catch {
      // circular / non-serialisable -> leave null
    }
  }

  // selector (v2): string capped at 500 chars, else null
  let element_selector: string | null = null;
  if (typeof body.element_selector === "string" && body.element_selector.length > 0) {
    element_selector = body.element_selector.slice(0, 500);
  }

  // confidence (v2): one of the four allowed values or null (guards CHECK)
  let element_confidence: string | null = null;
  if (
    typeof body.element_confidence === "string" &&
    ALLOWED_CONFIDENCE.includes(body.element_confidence)
  ) {
    element_confidence = body.element_confidence;
  }

  return { element_tag, element_label, element_meta, element_selector, element_confidence };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const {
      club_id, source, page_url, description, category, title,
      submitted_by_name, submitted_by_email, submitted_by_role, user_type,
      device_type, browser, os, viewport, urgency_flag, contact_requested,
    } = body;

    if (!club_id || !description) {
      return json({ error: "Missing required fields: club_id, description" }, 400);
    }

    // Element data is fully optional and never a reason to reject a report.
    const element = sanitizeElement(body);

    // Service role -> bypasses RLS for this controlled server-side insert.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Confirm the club exists.
    const { data: club, error: clubErr } = await supabase
      .from("clubs").select("id").eq("id", club_id).single();
    if (clubErr || !club) return json({ error: "Unknown club_id" }, 400);

    const { data: inserted, error: insErr } = await supabase
      .from("sitepulse_feedback")
      .insert({
        club_id: club.id,
        source: source === "onboarding" ? "onboarding" : "report",
        page_url: page_url ?? null,
        description,
        category: category ?? "other",
        title: title ?? null,
        submitted_by_name: submitted_by_name ?? null,
        submitted_by_email: submitted_by_email ?? null,
        submitted_by_role: submitted_by_role ?? null,
        user_type: user_type ?? "public",
        device_type: device_type ?? null,
        browser: browser ?? null,
        os: os ?? null,
        viewport: viewport ?? null,
        urgency_flag: !!urgency_flag,
        contact_requested: !!contact_requested,
        // element picker (additive; all null when not sent)
        element_tag: element.element_tag,
        element_label: element.element_label,
        element_meta: element.element_meta,
        element_selector: element.element_selector,
        element_confidence: element.element_confidence,
      })
      .select("id, status_token")
      .single();

    if (insErr) return json({ error: insErr.message }, 400);

    // ----------------------------------------------------------------
    // TODO (notifications): route through the shared dispatch-message
    // Edge Function rather than emailing directly. Fire on new report and
    // immediately when urgency_flag is true. Wire to your dispatch-message
    // payload contract, e.g.:
    //   await supabase.functions.invoke("dispatch-message", { body: {...} });
    // ClickSend for SMS, ZeptoMail (api.zeptomail.com.au) for email,
    // WebPushr for push -- do not add a new comms path here.
    // ----------------------------------------------------------------

    return json({ id: inserted.id, status_token: inserted.status_token }, 201);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
