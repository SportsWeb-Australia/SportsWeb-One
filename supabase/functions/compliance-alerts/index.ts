// SportsWeb One - compliance-alerts Edge Function
// Weekly WWCC / compliance digest for club senior admins. For every club with
// at least one child-facing adult (coach, committee, volunteer, official...)
// whose WWCC is missing, expired, or expiring within 60 days, sends one email
// per senior admin listing who needs attention. Nothing is sent to the person
// themselves - admin eyes only, matching how the WWCC & compliance report
// itself is gated (club_senior_admin, not club_admin).
//
// Data comes from public.compliance_alert_targets(), a service_role-only SQL
// function that mirrors the ComplianceReport UI's own missing/expired/expiring
// logic server-side (see supabase/compliance-completion.sql).
//
// Delivery goes through dispatch-message (email channel) rather than calling
// ZeptoMail directly, so club-branded sender config stays in one place.
//
// Deploy:  supabase functions deploy compliance-alerts --no-verify-jwt
// Schedule: supabase/compliance-alerts.sql (weekly, pg_cron)
// Frequency and copy are a first cut - adjust the schedule / subject / body
// below as needed; nothing here re-sends more than once per run.

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type AlertTarget = {
  club_id: string;
  club_name: string;
  club_slug: string;
  recipient_email: string;
  at_risk: { name: string; state: "missing" | "expired" | "expiring"; expires_on: string | null }[];
};

const STATE_LABEL: Record<string, string> = {
  missing: "no WWCC on file",
  expired: "WWCC expired",
  expiring: "WWCC expiring soon",
};

function buildBody(target: AlertTarget): { subject: string; body: string } {
  const lines = target.at_risk
    .map((p) => `- ${p.name} - ${STATE_LABEL[p.state] ?? p.state}${p.expires_on ? ` (${p.expires_on})` : ""}`)
    .join("\n");
  const n = target.at_risk.length;
  return {
    subject: `${target.club_name}: ${n} ${n === 1 ? "person needs" : "people need"} a WWCC check`,
    body:
      `Hi there,\n\n` +
      `${n} ${n === 1 ? "person" : "people"} in a child-facing role at ${target.club_name} ` +
      `${n === 1 ? "doesn't" : "don't"} have a current Working with Children Check on file:\n\n` +
      `${lines}\n\n` +
      `Record or update checks from Members > WWCC & compliance in your admin panel.\n\n` +
      `- The SportsWeb One team`,
  };
}

async function sendViaDispatch(email: string, subject: string, body: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPA_URL}/functions/v1/dispatch-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE}` },
      body: JSON.stringify({ channels: ["email"], subject, body, recipients: [{ email }] }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  const res = await fetch(`${SUPA_URL}/rest/v1/rpc/compliance_alert_targets`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) {
    return new Response(JSON.stringify({ ok: false, error: await res.text() }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const targets = (await res.json()) as AlertTarget[];

  let sent = 0;
  const results: Record<string, string> = {};
  for (const t of targets) {
    const { subject, body } = buildBody(t);
    const ok = await sendViaDispatch(t.recipient_email, subject, body);
    if (ok) sent++;
    results[`${t.club_slug}:${t.recipient_email}`] = ok ? "sent" : "failed";
  }

  return new Response(JSON.stringify({ ok: true, clubs: targets.length, sent, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
