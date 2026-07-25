# SitePulse — how to deploy

SitePulse has **two deploy surfaces**. Neither needs per-club edits: every club site
embeds the *same* hosted widget URL, so one deploy reaches all of them.

## 1. The widget (`public/sitepulse-widget.js`) — deploys itself

The widget is a static file served by Vercel at
`https://sportsweb-one-v1.vercel.app/sitepulse-widget.js`, and every club site embeds
**that one URL**. So:

> **Merge to `main` → Vercel redeploys → every embedding club site gets the new widget.**

Nothing else to do. There is no version query to bump on the embeds (that would recreate
the drift problem) — the URL is stable and Vercel revalidates the file on each request.

To preview a widget change before merging, load it on any staging club page, or run the
throwaway static harness described in the PR.

## 2. The ingest edge function (`supabase/functions/sitepulse-ingest`)

This is a Supabase Edge Function on the `sportsweb-one` project
(ref `uzibfawcwoapfbigpzum`). One command:

```bash
npm run deploy:ingest
```

(= `supabase functions deploy sitepulse-ingest --project-ref uzibfawcwoapfbigpzum`.
Requires the Supabase CLI, logged in. `verify_jwt` stays **on** — the embed sends the
project's legacy anon JWT as the Bearer token.)

The ingest change is **additive and backwards-compatible**: old widgets that don't send
the new fields still get `201`, so you can deploy ingest and the widget independently, in
either order.

## Schema

Element-picker columns were added by a one-off migration
(`element_selector`, `element_confidence`, `element_tag`, `element_label`, `element_meta`
— all nullable). Schema changes are applied by hand against `sportsweb-one`, never bundled
into a code deploy.
