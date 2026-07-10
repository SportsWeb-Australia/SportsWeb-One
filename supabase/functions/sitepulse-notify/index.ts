// ============================================================================
// sitepulse-notify - Supabase Edge Function
// Repo path: supabase/functions/sitepulse-notify/index.ts
// ----------------------------------------------------------------------------
// Emails the operator when a new SitePulse feedback row lands. Called by a DB
// AFTER INSERT trigger on public.sitepulse_feedback via pg_net (see
// supabase/sitepulse-notify.sql), so it fires for BOTH insert paths -- the
// public/preview widget (sitepulse-ingest) and the in-admin surface
// (AdminFeedback direct client insert).
//
// Auth: no user JWT (the DB calls it). Gated instead by a shared x-webhook-secret
// that must match SITEPULSE_WEBHOOK_SECRET. Deploy with --no-verify-jwt.
//
// Deploy:
//   supabase functions deploy sitepulse-notify --project-ref uzibfawcwoapfbigpzum --no-verify-jwt
//
// Secrets (Carson sets these; see the hand-over notes):
//   SITEPULSE_WEBHOOK_SECRET  - shared secret, must match the trigger's Vault value
//   SITEPULSE_ALERT_EMAIL     - recipient (operator ops inbox). If unset, nothing is sent.
//   ZEPTOMAIL_TOKEN           - reused from dispatch-message (already set)
//   ZEPTOMAIL_FROM            - reused from dispatch-message (already set)
//   ZEPTOMAIL_FROM_NAME       - optional; defaults to "SportsWeb One"
//   SITEPULSE_ADMIN_URL       - optional; admin app URL for the inbox link
//                               (default https://sportsweb-one-v1.vercel.app)
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically (club lookup).
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CATEGORY_LABEL: Record<string, string> = {
  spelling: "Spelling or wording", broken_link: "Broken link", incorrect_info: "Incorrect information",
  missing_info: "Missing information", image_logo: "Image or logo issue", mobile_display: "Looks wrong on mobile",
  desktop_display: "Looks wrong on desktop", sports_data: "Fixture / result / ladder", sponsor: "Sponsor or advertiser",
  event_ticketing: "Event or ticketing", store: "Online store", accessibility: "Accessibility",
  improvement: "Improvement idea", bug: "Something is broken", other: "Other",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendEmail(to: string, subject: string, bodyLines: string[]) {
  const token = Deno.env.get("ZEPTOMAIL_TOKEN");
  const from = Deno.env.get("ZEPTOMAIL_FROM");
  const fromName = Deno.env.get("ZEPTOMAIL_FROM_NAME") ?? "SportsWeb One";
  if (!token || !from) return { sent: 0, skipped: "zeptomail-not-configured" };
  const html =
    `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6">` +
    bodyLines.map((l) => esc(l)).join("<br>") +
    `</div>`;
  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { address: from, name: fromName },
      to: [{ email_address: { address: to, name: "SitePulse" } }],
      subject,
      htmlbody: html,
    }),
  });
  return { sent: res.ok ? 1 : 0, status: res.status };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // --- gate on the shared secret (never send without a configured, matching secret) ---
  const expected = Deno.env.get("SITEPULSE_WEBHOOK_SECRET");
  const provided = req.headers.get("x-webhook-secret");
  if (!expected || provided !== expected) return json({ error: "unauthorized" }, 401);

  let p: Record<string, unknown>;
  try {
    p = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  // Optional skip: item the operator raised themselves (user_type = 'sportsweb').
  if (p.user_type === "sportsweb") return json({ ok: true, skipped: "self-notify" });

  const recipient = Deno.env.get("SITEPULSE_ALERT_EMAIL");
  if (!recipient) return json({ ok: false, skipped: "no-recipient" });

  // Club name lookup (service role; the trigger only sends the id).
  let clubName = "a club";
  const clubId = typeof p.club_id === "string" ? p.club_id : null;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (clubId && url && key) {
    try {
      const sb = createClient(url, key);
      const { data } = await sb.from("clubs").select("name").eq("id", clubId).maybeSingle();
      if (data?.name) clubName = data.name as string;
    } catch { /* fall back to generic name */ }
  }

  const urgent = p.urgency === true || p.urgency === "true";
  const category = CATEGORY_LABEL[String(p.category)] ?? String(p.category ?? "other");
  const description = String(p.description ?? "").trim() || "(no description)";
  const pageUrl = p.page_url ? String(p.page_url) : "";
  const created = p.created_at ? String(p.created_at) : "";
  const adminUrl = Deno.env.get("SITEPULSE_ADMIN_URL") ?? "https://sportsweb-one-v1.vercel.app";

  const subject = `${urgent ? "[URGENT] " : ""}New website feedback - ${clubName}`;
  const body = [
    `New SitePulse feedback from ${clubName}.`,
    ``,
    `Category: ${category}${urgent ? "  (URGENT)" : ""}`,
    `Details: ${description}`,
    ...(pageUrl ? [`Page: ${pageUrl}`] : []),
    ...(created ? [`Received: ${created}`] : []),
    ``,
    `Open the SitePulse inbox to triage: ${adminUrl}`,
  ];

  try {
    const r = await sendEmail(recipient, subject, body);
    return json({ ok: r.sent > 0, result: r });
  } catch (e) {
    // Reported for logs; the DB trigger is exception-safe so the row still commits.
    return json({ ok: false, error: String(e) }, 500);
  }
});
