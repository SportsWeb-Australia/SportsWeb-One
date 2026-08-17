# AFLVM asset library

Pulled live from `aflvm.com.au` and PlayHQ (org `f6373f0f`) on 2026-08-03. Real assets only — no fabrication.

## Logos
- `aflvm-logo-main.png` — primary horizontal lockup (AFL Masters + Vic Metro), 466×186
- `aflvm-logo-white.png` — reversed/white variant for dark backgrounds

## Brand colours (computed from live site CSS)
| Token | Hex | Where it's used on the live site |
|---|---|---|
| `--brand-navy` | `#01003c` | Contact Us button, PlayHQ org header |
| `--brand-blue` | `#20428f` | Main nav bar background |
| `--brand-red` | `#d23127` | Find a Club button, primary logo mark |
| `--brand-gold` | `#e09900` | Active/hover nav link |

No authored `--brand-accent-ink` yet — pick one when building Design 2/3 per the accent contrast rule in `docs/engineering-conventions.md`.

## Clubs (`clubs/`)
40 crest images + `clubs-manifest.csv` (slug, filename, source URL). Covers 39 of the ~45-club directory — a few shared-slug clubs (e.g. Brunswick, Williamstown men's/women's) reuse the same crest file; couldn't find distinct women's crests for those on the live site.

## PlayHQ (org `f6373f0f`)
Confirmed live and public — no partner approval needed:
`https://www.playhq.com/afl/org/afl-masters-victoria-metropolitan-superules-football-league/f6373f0f`

Two active 2026 competitions found:
- AFL Masters Victoria Metropolitan Superules Football League (29 Mar – 14 Sep 2026)
- AFL Masters Victoria Metropolitan - Footy Rush (11 Apr – 15 Aug 2026)

Org contact: admin@aflvm.com.au · Gareth Long (Operations Manager) · Jaimie Collins (Administrator) · Cameron Nash (Umpire Manager)

## Sponsors mentioned on live site
S-Trend, Top Notch, Sundaylicious, ISLA Vodka, The Reed Group, Le Pine Funerals, Centaur Institute, Pat Cronin Foundation. Only S-Trend and Top Notch logo files were found on the homepage; the rest are referenced by name/news post only — no logo file harvested yet.

## National Carnival
2026 dates confirmed on live site: Newcastle, 27 Sep – 3 Oct (the site currently mislabels the year as "2025" in the carnival blurb — worth flagging to AFLVM, not fixing on our end).
