// ============================================================================
// club-request-notify - Supabase Edge Function
// Repo path: supabase/functions/club-request-notify/index.ts
// ----------------------------------------------------------------------------
// Emails SportsWeb when a club raises a change request from the on-page editor.
// Called by a DB AFTER INSERT trigger on public.club_requests via pg_net (see
// supabase/club-requests-notify.sql).
//
// Auth: no user JWT (the DB calls it). Gated instead by a shared x-webhook-secret
// that must match CLUB_REQUEST_WEBHOOK_SECRET. Deploy with --no-verify-jwt.
//
// Deploy:
//   supabase functions deploy club-request-notify --project-ref uzibfawcwoapfbigpzum --no-verify-jwt
//
// Secrets (Carson sets these):
//   CLUB_REQUEST_WEBHOOK_SECRET - shared secret, must match the trigger's Vault value
//   CLUB_REQUEST_ALERT_EMAIL    - recipient. Falls back to SITEPULSE_ALERT_EMAIL so
//                                 this works immediately on the existing ops inbox.
//   ZEPTOMAIL_TOKEN             - reused from dispatch-message (already set)
//   ZEPTOMAIL_API_HOST          - THIS ACCOUNT IS AU: set api.zeptomail.com.au
//                                 (default api.zeptomail.com 500s here).
//   From sender (must be a VERIFIED ZeptoMail sender) resolves in this order:
//     ZEPTOMAIL_NOTIFY_FROM -> ZEPTOMAIL_TRIAL_FROM -> ZEPTOMAIL_FROM
//   ZEPTOMAIL_FROM_NAME         - optional; defaults to "SportsWeb One"
//   SITEPULSE_ADMIN_URL         - optional; admin app URL for the queue link
//                                 (default https://sportsweb-one-v1.vercel.app)
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically (club lookup).
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URGENCY_LABEL: Record<string, string> = {
  whenever: "Whenever you can",
  soon: "Soon",
  urgent: "Urgent",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendEmail(to: string, subject: string, bodyLines: string[]) {
  const rawToken = Deno.env.get("ZEPTOMAIL_TOKEN");
  // From must be a verified ZeptoMail sender. Prefer a dedicated notify sender,
  // then the trial sender (known verified), then the plain from.
  const from =
    Deno.env.get("ZEPTOMAIL_NOTIFY_FROM") ??
    Deno.env.get("ZEPTOMAIL_TRIAL_FROM") ??
    Deno.env.get("ZEPTOMAIL_FROM");
  const fromName = Deno.env.get("ZEPTOMAIL_FROM_NAME") ?? "SportsWeb One";
  if (!rawToken || !from) return { sent: 0, skipped: "zeptomail-not-configured" };
  // Normalize: strip an accidental "Zoho-enczapikey " prefix and any whitespace/newline
  // in the stored secret, so the Authorization header is never doubled/malformed.
  const token = rawToken.trim().replace(/^Zoho-enczapikey\s+/i, "");
  const html =
    `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6">` +
    bodyLines.map((l) => esc(l)).join("<br>") +
    `</div>`;
  const host = Deno.env.get("ZEPTOMAIL_API_HOST") ?? "api.zeptomail.com";
  const res = await fetch(`https://${host}/v1.1/email`, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { address: from, name: fromName },
      to: [{ email_address: { address: to, name: "SportsWeb" } }],
      subject,
      htmlbody: html,
    }),
  });
  // On failure, keep a short slice of ZeptoMail's response for ops debugging
  // (lands in net._http_response.content; contains no secrets).
  let detail: string | undefined;
  if (!res.ok) { try { detail = (await res.text()).slice(0, 300); } catch { /* ignore */ } }
  return { sent: res.ok ? 1 : 0, status: res.status, ...(detail ? { detail } : {}) };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // --- gate on the shared secret (never send without a configured, matching secret) ---
  const expected = Deno.env.get("CLUB_REQUEST_WEBHOOK_SECRET");
  const provided = req.headers.get("x-webhook-secret");
  if (!expected || provided !== expected) return json({ error: "unauthorized" }, 401);

  let p: Record<string, unknown>;
  try {
    p = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const recipient = Deno.env.get("CLUB_REQUEST_ALERT_EMAIL") ?? Deno.env.get("SITEPULSE_ALERT_EMAIL");
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

  const urgency = String(p.urgency ?? "soon");
  const urgent = urgency === "urgent";
  const what = String(p.what ?? "").trim() || "(not described)";
  const why = String(p.why ?? "").trim() || "(no reason given)";
  const pagePath = p.page_path ? String(p.page_path) : "";
  const created = p.created_at ? String(p.created_at) : "";
  const adminUrl = Deno.env.get("SITEPULSE_ADMIN_URL") ?? "https://sportsweb-one-v1.vercel.app";

  const subject = `${urgent ? "[URGENT] " : ""}Website change request - ${clubName}`;
  const body = [
    `${clubName} has asked for a change to their website.`,
    ``,
    `What they want: ${what}`,
    `Why: ${why}`,
    `Urgency: ${URGENCY_LABEL[urgency] ?? urgency}`,
    ...(pagePath ? [`Page: ${pagePath}`] : []),
    ...(created ? [`Received: ${created}`] : []),
    ``,
    `Open the requests queue to triage: ${adminUrl}/admin`,
  ];

  try {
    const r = await sendEmail(recipient, subject, body);
    return json({ ok: r.sent > 0, subject, result: r });
  } catch (e) {
    // Reported for logs; the DB trigger is exception-safe so the row still commits.
    return json({ ok: false, error: String(e) }, 500);
  }
});
