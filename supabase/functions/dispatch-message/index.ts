// SportsWeb One — dispatch-message Edge Function
// Sends a club message across Email (Zoho ZeptoMail), SMS (ClickSend) and Push (WebPushr).
//
// Deploy:   supabase functions deploy dispatch-message --no-verify-jwt
// Secrets:  supabase secrets set CLICKSEND_USERNAME=... CLICKSEND_API_KEY=... CLICKSEND_FROM=SportsWeb
//           supabase secrets set ZEPTOMAIL_TOKEN=... ZEPTOMAIL_FROM=club@yourdomain.com ZEPTOMAIL_FROM_NAME="Dookie United"
//           supabase secrets set WEBPUSHR_KEY=... WEBPUSHR_AUTH_TOKEN=...
//
// A channel with no secrets configured is skipped (counted as 0), so you can
// turn providers on one at a time.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Recipient = { name?: string; email?: string | null; mobile?: string | null };

/** Best-effort AU mobile → E.164. */
function toE164(raw: string): string {
  const s = raw.replace(/[^\d+]/g, "");
  if (s.startsWith("+")) return s;
  if (s.startsWith("0")) return "+61" + s.slice(1);
  if (s.startsWith("61")) return "+" + s;
  return s;
}

async function sendEmail(to: Recipient[], subject: string, body: string) {
  const token = Deno.env.get("ZEPTOMAIL_TOKEN");
  const from = Deno.env.get("ZEPTOMAIL_FROM");
  const fromName = Deno.env.get("ZEPTOMAIL_FROM_NAME") ?? "Club";
  let sent = 0,
    failed = 0;
  if (!token || !from) return { sent, failed: to.filter((r) => r.email).length };
  const html = `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6">${body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br>")}</div>`;
  for (const r of to) {
    if (!r.email) continue;
    try {
      const res = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: { Authorization: `Zoho-enczapikey ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { address: from, name: fromName },
          to: [{ email_address: { address: r.email, name: r.name ?? "" } }],
          subject,
          htmlbody: html,
        }),
      });
      res.ok ? sent++ : failed++;
    } catch {
      failed++;
    }
  }
  return { sent, failed };
}

async function sendSms(to: Recipient[], body: string) {
  const username = Deno.env.get("CLICKSEND_USERNAME");
  const apiKey = Deno.env.get("CLICKSEND_API_KEY");
  const from = Deno.env.get("CLICKSEND_FROM"); // optional sender id / number
  const targets = to.filter((r) => r.mobile);
  let sent = 0,
    failed = 0;
  if (!username || !apiKey) return { sent, failed: targets.length };
  if (targets.length === 0) return { sent, failed };
  const basic = btoa(`${username}:${apiKey}`);
  const messages = targets.map((r) => ({
    source: "sportsweb",
    body,
    to: toE164(r.mobile as string),
    ...(from ? { from } : {}),
  }));
  try {
    const res = await fetch("https://rest.clicksend.com/v3/sms/send", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return { sent: 0, failed: targets.length };
    // ClickSend returns a per-message status; count SUCCESS as sent.
    try {
      const data = await res.json();
      const msgs = data?.data?.messages;
      if (Array.isArray(msgs) && msgs.length) {
        for (const m of msgs) String(m.status).toUpperCase() === "SUCCESS" ? sent++ : failed++;
      } else {
        sent = targets.length;
      }
    } catch {
      sent = targets.length;
    }
  } catch {
    failed = targets.length;
  }
  return { sent, failed };
}

async function sendPush(title: string, body: string) {
  const key = Deno.env.get("WEBPUSHR_KEY");
  const token = Deno.env.get("WEBPUSHR_AUTH_TOKEN");
  if (!key || !token) return { sent: 0, failed: 0 };
  try {
    const res = await fetch("https://api.webpushr.com/v1/notification/send/all", {
      method: "POST",
      headers: { "Content-Type": "application/json", "webpushr-key": key, "webpushr-auth-token": token },
      body: JSON.stringify({ title, message: body, target_url: "/" }),
    });
    return res.ok ? { sent: 1, failed: 0 } : { sent: 0, failed: 1 };
  } catch {
    return { sent: 0, failed: 1 };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const payload = await req.json();

    // Connection status — booleans only, never the secret values themselves.
    if (payload?.action === "status") {
      const status = {
        email: !!(Deno.env.get("ZEPTOMAIL_TOKEN") && Deno.env.get("ZEPTOMAIL_FROM")),
        sms: !!(Deno.env.get("CLICKSEND_USERNAME") && Deno.env.get("CLICKSEND_API_KEY")),
        push: !!(Deno.env.get("WEBPUSHR_KEY") && Deno.env.get("WEBPUSHR_AUTH_TOKEN")),
      };
      return new Response(JSON.stringify({ ok: true, status }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ClickSend account balance — powers the "keep credit topped up" panel.
    if (payload?.action === "balance") {
      const username = Deno.env.get("CLICKSEND_USERNAME");
      const apiKey = Deno.env.get("CLICKSEND_API_KEY");
      if (!username || !apiKey) {
        return new Response(JSON.stringify({ ok: false, connected: false }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      try {
        const res = await fetch("https://rest.clicksend.com/v3/account", {
          headers: { Authorization: `Basic ${btoa(`${username}:${apiKey}`)}` },
        });
        const data = await res.json();
        const acct = data?.data ?? {};
        return new Response(
          JSON.stringify({ ok: res.ok, connected: true, balance: acct.balance ?? null, currency: acct.currency ?? null }),
          { headers: { ...cors, "Content-Type": "application/json" } },
        );
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, connected: true, error: String(e) }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    const { channels = [], subject = "", body = "", recipients = [] } = payload;
    const sent = { email: 0, sms: 0, push: 0 };
    const failed = { email: 0, sms: 0, push: 0 };

    if (channels.includes("email")) {
      const r = await sendEmail(recipients as Recipient[], subject || "Message from your club", body);
      sent.email = r.sent;
      failed.email = r.failed;
    }
    if (channels.includes("sms")) {
      const r = await sendSms(recipients as Recipient[], body);
      sent.sms = r.sent;
      failed.sms = r.failed;
    }
    if (channels.includes("push")) {
      const r = await sendPush(subject || "Club update", body);
      sent.push = r.sent;
      failed.push = r.failed;
    }

    const ok = failed.email + failed.sms + failed.push === 0;
    return new Response(JSON.stringify({ ok, sent, failed }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
