// sales-advisor: AI sales coach for the Sales Formula screen.
// Takes the current target + computed funnel ladder (+ an optional question) and asks
// Claude to benchmark the funnel against real-world B2B/SaaS sales norms and recommend
// concrete actions to hit the target. No DB access; numbers are passed in from the client.
//
// Secrets (Supabase -> Edge Functions -> Secrets):
//   ANTHROPIC_API_KEY   (required)  -- from console.anthropic.com
//   SALES_ADVISOR_MODEL (optional)  -- defaults to a current Claude Sonnet; override if needed
//
// Until ANTHROPIC_API_KEY is set the function returns a friendly "not connected" message,
// so the UI degrades gracefully instead of erroring.

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });
}

const SYSTEM_PROMPT = `You are a sharp, practical B2B sales coach for SportsWeb, an Australian SaaS company that
sells websites and club-management software to community sports clubs and associations. You advise the
SportsWeb sales team using their "Sales Formula" — a funnel that reverse-engineers a revenue target into the
activity required: CTA views -> contact attempts -> conversations -> demos booked -> presentations -> wins.

Use these real-world B2B / SMB-SaaS funnel benchmarks as your yardstick (give ranges, not false precision):
- Landing/CTA to lead (CTA conversion): ~2-5% (good), 5-8% (strong).
- Contact/connect rate (attempts that reach a human): ~20-40%.
- Conversation -> booked demo: ~20-40%.
- Demo show rate (booked demos that actually happen): ~70-85%.
- Demo/presentation -> closed win (SMB SaaS): ~20-30% (15% soft, 35%+ excellent).
- Sales cycle for SMB SaaS: ~2-6 weeks.

Your job:
1. Compare the user's assumptions to these benchmarks. Call out anything unrealistic (e.g. a 95% close rate
   or 100% show rate are not real — flag them plainly and suggest realistic figures).
2. Tell them, honestly, whether the plan is on track or the numbers are wishful.
3. Give 3-6 concrete, specific actions to hit each weak stage of the funnel — tactics a small team can run
   (outreach cadence, demo-show tactics, follow-up sequences, CTA/website improvements, referral plays).
4. If they ask a question, answer it directly first, then support it with the funnel logic.

Style: concise, direct, Australian business English. Use short markdown — a one-line verdict, then bullet
points. No preamble, no filler, no apologies. Prefer specifics over generic advice.`;

function buildUserMessage(target: Record<string, unknown> | undefined, ladder: Record<string, unknown> | undefined, question?: string): string {
  const t = target ?? {};
  const l = ladder ?? {};
  const pct = (v: unknown) => (typeof v === "number" ? `${Math.round(v * 100)}%` : String(v ?? "?"));
  const lines = [
    "Here is the current sales target and the funnel it implies.",
    "",
    `Target: ${t.name || "(unnamed)"} — product ${t.product_key ?? "?"}, period ${t.period ?? "?"}.`,
    `Revenue target: $${t.revenue_target ?? "?"}; average deal value: $${t.avg_deal_value ?? "?"}.`,
    "Assumed conversion rates:",
    `- Close rate (presentation -> win): ${pct(t.close_rate)}`,
    `- Demo show rate: ${pct(t.show_rate)}`,
    `- Conversation -> booking: ${pct(t.booking_rate)}`,
    `- Contact rate: ${pct(t.contact_rate)}`,
    `- CTA conversion: ${pct(t.cta_conversion_rate)}`,
    "",
    "Implied funnel to hit the target this period:",
    `- Wins: ${l.wins ?? "?"}`,
    `- Presentations: ${l.presentations ?? "?"}`,
    `- Demos booked: ${l.demos ?? "?"}`,
    `- Conversations: ${l.conversations ?? "?"}`,
    `- Contact attempts: ${l.contacts ?? "?"}`,
    `- CTA views: ${l.ctaViews ?? "?"}`,
  ];
  if (question && question.trim()) {
    lines.push("", `The user asks: "${question.trim()}"`, "Answer their question first, then give the benchmark check and actions.");
  } else {
    lines.push("", "No specific question — give the benchmark check, an on-track verdict, and the actions.");
  }
  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  const model = Deno.env.get("SALES_ADVISOR_MODEL") ?? "claude-sonnet-4-5";
  if (!key) {
    return json({
      notConfigured: true,
      advice:
        "The AI sales coach isn't connected yet.\n\nAdd an **ANTHROPIC_API_KEY** as a Supabase Edge Function secret (from console.anthropic.com) to switch it on. Everything else on this screen works without it.",
    });
  }

  let body: { target?: Record<string, unknown>; ladder?: Record<string, unknown>; question?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." });
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(body.target, body.ladder, body.question) }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: `Sales coach error (${resp.status}). ${errText.slice(0, 300)}` });
    }
    const data = await resp.json();
    const advice = (data?.content ?? [])
      .filter((c: { type?: string }) => c.type === "text")
      .map((c: { text?: string }) => c.text ?? "")
      .join("\n")
      .trim();
    return json({ advice: advice || "No advice returned." });
  } catch (e) {
    return json({ error: `Sales coach unavailable: ${(e as Error).message}` });
  }
});
