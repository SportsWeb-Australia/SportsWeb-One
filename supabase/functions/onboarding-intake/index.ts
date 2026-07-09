// ============================================================================
// onboarding-intake — Supabase Edge Function
// Repo path: supabase/functions/onboarding-intake/index.ts
// ----------------------------------------------------------------------------
// Receives a JSON payload from the public Club Website Onboarding form and
// inserts one row into public.club_onboarding using the service role.
// The form calls this with the project's anon/publishable key (public).
//
// Deploy:  supabase functions deploy onboarding-intake --project-ref uzibfawcwoapfbigpzum --no-verify-jwt
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically at runtime.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Only accept a club_id that is a valid uuid; otherwise store null (pre-link intake).
  const rawClubId = typeof body.club_id === "string" ? body.club_id : "";
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawClubId);

  const row = {
    club_id: isUuid ? rawClubId : null,
    club_name: (body.club_name as string) ?? null,
    contact_name: (body.contact_name as string) ?? null,
    contact_email: (body.contact_email as string) ?? null,
    answers: (body.answers as Record<string, unknown>) ?? {},
    page_url: (body.page_url as string) ?? null,
    status: "submitted",
  };

  const { data, error } = await supabase
    .from("club_onboarding")
    .insert(row)
    .select("id")
    .single();

  if (error) return json({ error: error.message }, 400);

  // Notify the SportsWeb team of a new submission — BEST EFFORT.
  // A failed notification must never fail the club's submission, so it's wrapped
  // in try/catch and the response is returned regardless.
  //
  // Aligned to the shared `notify` function (supabase/functions/notify/index.ts):
  //   server-to-server, authed with the `x-webhook-secret: <VM_WEBHOOK_SECRET>`
  //   header, body { club_id, channel, to, subject, body, category }.
  // notify REQUIRES a non-null club_id (used for sender name + logging), so we
  // only fire when we have one — either the linked club, or a PLATFORM_CLUB_ID
  // fallback for pre-link intake. If neither the club_id nor VM_WEBHOOK_SECRET is
  // present, we skip the alert entirely (the submission is already saved).
  const alertClubId = row.club_id ?? Deno.env.get("PLATFORM_CLUB_ID") ?? null;
  const webhookSecret = Deno.env.get("VM_WEBHOOK_SECRET");
  if (alertClubId && webhookSecret) {
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": webhookSecret,
        },
        body: JSON.stringify({
          club_id: alertClubId,
          channel: "email",
          to: "info@sportsweb.com.au",
          subject: `New club onboarding: ${row.club_name ?? "Unnamed club"}`,
          category: "onboarding",
          body:
            `New onboarding submission (ref ${String(data.id).slice(0, 8)}).\n` +
            `Club: ${row.club_name ?? "—"}\n` +
            `Contact: ${row.contact_name ?? "—"} <${row.contact_email ?? "—"}>\n` +
            `Linked club_id: ${row.club_id ?? "not linked yet"}\n` +
            `Page: ${row.page_url ?? "—"}`,
        }),
      });
    } catch (_notifyErr) {
      // swallow — notification is non-critical
    }
  }

  return json({ id: data.id, status: "submitted" }, 200);
});
