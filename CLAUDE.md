# SportsWeb One — Project Context

**What it is:** Multi-tenant Australian sports-club SaaS platform. Demo/template club: Dookie United FNC (`club_id 7a841f7f-c6ac-4181-aec2-e91c53103512`).

## Stack
- Vite + React + TypeScript
- Supabase (project ref `uzibfawcwoapfbigpzum`)
- Vercel (deploys from GitHub `main`)
- GitHub org: SportsWeb-Australia

## Architecture locks
- NO `organisation_id`. Everything keys off `club_id`. Associations and sporting bodies are themselves club rows.
- Admin chrome is ALWAYS SportsWeb blue (`#2563eb`) — club colours belong on the live public site, not the admin UI. Club identity is carried by the logo, not by tinting the admin.

## Conventions
- Hand-written CSS using `sw-` / `sw1-` prefixes. NO Tailwind.
- SQL is pure ASCII.
- NEVER run `supabase db push` against production. Migrations go through the Supabase SQL Editor manually. If you write a migration, hand over the SQL for me to paste — do not apply it.

## Workflow
- Show diffs and wait for my approval before committing or pushing.
- Small changes; I verify on Vercel after each push.
- Mobile-first; I often review from my phone.
