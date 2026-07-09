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
