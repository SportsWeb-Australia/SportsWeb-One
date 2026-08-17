// SportsWeb One — injury-stage-reminders Edge Function
// Opt-in only: does nothing for a club unless clubs.injury_reminders_enabled
// is true (toggled from the Injuries screen by a senior admin). Runs on a
// schedule (see supabase/injury-stage-reminders-cron.sql — not yet
// scheduled), finds return-to-play stages due today or overdue, and emails
// the club's senior admins one digest per club per run. Nothing goes to
// parents or players — see the handover doc's explicit caution on that.
//
// Deploy:  supabase functions deploy injury-stage-reminders --no-verify-jwt
// Secrets: reuses the dispatch-message ZeptoMail secrets:
//   supabase secrets set ZEPTOMAIL_TOKEN=... ZEPTOMAIL_FROM=... ZEPTOMAIL_FROM_NAME="SportsWeb One"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ZTOKEN = Deno.env.get("ZEPTOMAIL_TOKEN");
const ZFROM = Deno.env.get("ZEPTOMAIL_FROM");
const ZNAME = Deno.env.get("ZEPTOMAIL_FROM_NAME") ?? "SportsWeb One";

const sb = createClient(SUPA_URL, SERVICE);

type Club = { id: string; name: string };
type DueStage = {
  id: string;
  stage_no: number;
  label: string;
  due_on: string;
  record_id: string;
  person_id: string;
  full_name: string;
};

async function sendDigestEmail(to: string, name: string, club: Club, stages: DueStage[]) {
  if (!ZTOKEN || !ZFROM) return false;
  const lines = stages
    .map((s) => {
      const overdue = s.due_on < new Date().toISOString().slice(0, 10);
      return `- ${s.full_name}: stage ${s.stage_no} "${s.label}"${overdue ? " (OVERDUE, due " : " (due "}${s.due_on})`;
    })
    .join("\n");
  const body =
    `Hi ${name || "there"},\n\n` +
    `${club.name} has ${stages.length} return-to-play stage${stages.length === 1 ? "" : "s"} due or overdue:\n\n` +
    `${lines}\n\n` +
    `Open Injuries & concussion in your admin panel to review and sign off.\n`;
  const html = `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6">${body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br>")}</div>`;
  try {
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${ZTOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: { address: ZFROM, name: ZNAME },
        to: [{ email_address: { address: to, name } }],
        subject: `${club.name}: ${stages.length} return-to-play stage${stages.length === 1 ? "" : "s"} due`,
        htmlbody: html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (_req) => {
  try {
    const { data: clubs, error: clubErr } = await sb
      .from("clubs")
      .select("id, name")
      .eq("injury_reminders_enabled", true);
    if (clubErr) return new Response(JSON.stringify({ ok: false, error: clubErr.message }), { status: 500 });

    let clubsNotified = 0;
    let emailsSent = 0;

    for (const club of (clubs ?? []) as Club[]) {
      const { data: stages } = await sb
        .from("injury_stages")
        .select("id, stage_no, label, due_on, record_id, injury_records!inner(id, club_id, person_id, status, people(full_name))")
        .lte("due_on", new Date().toISOString().slice(0, 10))
        .is("completed_at", null)
        .eq("injury_records.club_id", club.id)
        .neq("injury_records.status", "cleared");
      if (!stages || stages.length === 0) continue;

      // Skip stages already reminded on today.
      const today = new Date().toISOString().slice(0, 10);
      const dueStages: DueStage[] = [];
      for (const s of stages as any[]) {
        const { data: already } = await sb
          .from("injury_reminder_log")
          .select("stage_id")
          .eq("stage_id", s.id)
          .eq("sent_on", today)
          .maybeSingle();
        if (already) continue;
        dueStages.push({
          id: s.id,
          stage_no: s.stage_no,
          label: s.label,
          due_on: s.due_on,
          record_id: s.record_id,
          person_id: s.injury_records.person_id,
          full_name: s.injury_records.people?.full_name ?? "Unknown",
        });
      }
      if (dueStages.length === 0) continue;

      const { data: recipients } = await sb.rpc("injury_reminder_recipients", { p_club: club.id });
      let sentAny = false;
      for (const r of (recipients ?? []) as { email: string; name: string }[]) {
        if (await sendDigestEmail(r.email, r.name, club, dueStages)) sentAny = true;
      }
      if (sentAny) {
        clubsNotified++;
        emailsSent += (recipients ?? []).length;
        await sb.from("injury_reminder_log").insert(dueStages.map((s) => ({ stage_id: s.id, sent_on: today })));
      }
    }

    return new Response(JSON.stringify({ ok: true, clubsNotified, emailsSent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
});
