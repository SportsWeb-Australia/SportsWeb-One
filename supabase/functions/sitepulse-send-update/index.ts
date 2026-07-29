// ============================================================================
// sitepulse-send-update — Supabase Edge Function
// Bundles a club's pending client-visible replies into ONE "club update" email
// (the digest / batch send), then marks them emailed. Deploy verify_jwt ON: the
// admin app calls it with the operator's session; we additionally require the
// caller to be a platform admin (superadmin / sportsweb_manager).
//
// Reuses the ZeptoMail sender contract from sitepulse-notify (verified sender
// resolution + AU host). Secrets already set on the project:
//   ZEPTOMAIL_TOKEN, ZEPTOMAIL_NOTIFY_FROM|TRIAL_FROM|FROM, ZEPTOMAIL_API_HOST,
//   ZEPTOMAIL_FROM_NAME. SUPABASE_URL/_ANON_KEY/_SERVICE_ROLE_KEY are injected.
//
//   supabase functions deploy sitepulse-send-update --project-ref uzibfawcwoapfbigpzum
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
}
function esc(s: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const CATEGORY_LABEL: Record<string, string> = {
  spelling: "Spelling or wording", broken_link: "Broken link", incorrect_info: "Incorrect information",
  missing_info: "Missing information", image_logo: "Image or logo", mobile_display: "Looks wrong on mobile",
  desktop_display: "Looks wrong on desktop", sports_data: "Fixture / result / ladder", sponsor: "Sponsor",
  event_ticketing: "Event or ticketing", store: "Online store", accessibility: "Accessibility",
  improvement: "Improvement idea", bug: "Something is broken", other: "Other",
};

async function sendEmail(to: string, toName: string, subject: string, html: string) {
  const rawToken = Deno.env.get("ZEPTOMAIL_TOKEN");
  const from =
    Deno.env.get("ZEPTOMAIL_NOTIFY_FROM") ??
    Deno.env.get("ZEPTOMAIL_TRIAL_FROM") ??
    Deno.env.get("ZEPTOMAIL_FROM");
  const fromName = Deno.env.get("ZEPTOMAIL_FROM_NAME") ?? "SportsWeb One";
  if (!rawToken || !from) return { sent: 0, skipped: "zeptomail-not-configured" };
  const token = rawToken.trim().replace(/^Zoho-enczapikey\s+/i, "");
  const host = Deno.env.get("ZEPTOMAIL_API_HOST") ?? "api.zeptomail.com";
  const res = await fetch(`https://${host}/v1.1/email`, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { address: from, name: fromName },
      to: [{ email_address: { address: to, name: toName || to } }],
      subject, htmlbody: html,
    }),
  });
  let detail: string | undefined;
  if (!res.ok) { try { detail = (await res.text()).slice(0, 300); } catch { /* ignore */ } }
  return { sent: res.ok ? 1 : 0, status: res.status, ...(detail ? { detail } : {}) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // Caller must be a signed-in platform admin.
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const svc = createClient(url, svcKey);
  const { data: role } = await svc
    .from("platform_user_roles").select("role")
    .eq("user_id", user.id).in("role", ["superadmin", "sportsweb_manager"]).maybeSingle();
  if (!role) return json({ error: "forbidden" }, 403);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const clubId = typeof body.club_id === "string" ? body.club_id : "";
  if (!clubId) return json({ error: "club_id required" }, 400);
  const preview = body.preview === true; // count-only, don't send

  const { data: club } = await svc
    .from("clubs").select("name, contact_email, preview_token").eq("id", clubId).maybeSingle();
  if (!club) return json({ error: "unknown club" }, 400);

  // Pending = client-visible replies not yet emailed.
  const { data: pending } = await svc
    .from("sitepulse_comments")
    .select("id, body, feedback_id")
    .eq("club_id", clubId).eq("visibility", "client_visible").is("emailed_at", null)
    .order("created_at", { ascending: true });
  const items = pending ?? [];
  if (preview) return json({ ok: true, pending: items.length });
  if (!items.length) return json({ ok: true, sent: 0, pending: 0, message: "Nothing to send." });

  let recipient = (club.contact_email as string | null) ?? null;
  if (!recipient) {
    const { data: ob } = await svc
      .from("club_onboarding").select("contact_email").eq("club_id", clubId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    recipient = (ob?.contact_email as string | null) ?? null;
  }
  if (!recipient) return json({ ok: false, error: "no-recipient", message: "No contact email on file for this club." });

  // Item context for each reply.
  const fbIds = [...new Set(items.map((c) => c.feedback_id as string))];
  const { data: fbs } = await svc.from("sitepulse_feedback").select("id, category, description").in("id", fbIds);
  const fbMap = new Map((fbs ?? []).map((f) => [f.id as string, f]));

  const statusUrl = club.preview_token
    ? `https://sitepulse-status.vercel.app/?t=${club.preview_token}`
    : "https://sitepulse-status.vercel.app";
  const rowsHtml = items.map((c) => {
    const f = fbMap.get(c.feedback_id as string) as { category?: string; description?: string } | undefined;
    const cat = CATEGORY_LABEL[String(f?.category)] ?? (f?.category ?? "");
    const item = String(f?.description ?? "").slice(0, 160);
    return `<li style="margin:0 0 12px"><b>${esc(cat)}:</b> ${esc(item)}<br>` +
      `<span style="color:#4f46e5">Our update:</span> ${esc(String(c.body))}</li>`;
  }).join("");
  const html =
    `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6;color:#191317">` +
    `<p>Hi ${esc(String(club.name ?? "there"))},</p>` +
    `<p>Here's an update on the feedback you left during your website review:</p>` +
    `<ul style="padding-left:18px;margin:0 0 14px">${rowsHtml}</ul>` +
    `<p>You can see the live status of every item any time here:<br>` +
    `<a href="${statusUrl}">${statusUrl}</a></p>` +
    `<p>Thanks,<br>The SportsWeb team</p></div>`;
  const subject = `Update on your website feedback — ${club.name ?? "your club"}`;

  const r = await sendEmail(recipient, String(club.name ?? ""), subject, html);
  if (r.sent > 0) {
    await svc.from("sitepulse_comments")
      .update({ emailed_at: new Date().toISOString() })
      .in("id", items.map((c) => c.id));
    return json({ ok: true, sent: items.length, to: recipient });
  }
  // Not sent (e.g. credit exhausted) → leave them queued so a later retry works.
  return json({ ok: false, sent: 0, pending: items.length, to: recipient, result: r });
});
