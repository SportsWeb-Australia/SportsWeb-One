import { useMemo, useState } from "react";
import { useClub } from "../components/ClubContext";
import { useActiveClub } from "./ActiveClub";
import { usePermissions } from "../lib/permissions";
import { supabase } from "../lib/supabase";
import { getNewsMode, NEWS_MODE_OPTIONS, type NewsMode } from "../lib/newsMode";
import type { DesignVariant } from "../content/types";

const STYLES: { id: DesignVariant; label: string; note: string; sports?: string[] }[] = [
  { id: "heritage", label: "Heritage", note: "Clean, light, classic club feel." },
  { id: "broadcast", label: "Broadcast", note: "Dark and bold, TV-style." },
  { id: "arena", label: "Arena", note: "Sharp, flat, high-impact." },
  { id: "classic", label: "Classic", note: "Elegant serif, centred." },
  { id: "stadium", label: "Stadium", note: "Full-bleed photo hero + scoreboard." },
  { id: "editorial", label: "Editorial", note: "Magazine-style overlap." },
  { id: "momentum", label: "Momentum", note: "Diagonal split, energetic." },
  { id: "coastal", label: "Coastal", note: "Airy, light, relaxed." },
  { id: "broadsheet", label: "Broadsheet", note: "News-led newspaper front page." },
  { id: "matchday", label: "Matchday", note: "Next match + scores up top." },
  { id: "appshell", label: "App shell", note: "Member-app card feed." },
  { id: "bento", label: "Bento", note: "Asymmetric magazine grid." },
  { id: "sponsorforward", label: "Sponsor-forward", note: "Partners front and centre." },
  { id: "portal", label: "Portal", note: "Sidebar nav + dashboard." },
  { id: "poster", label: "Poster", note: "Brutalist — huge type, colour blocks." },
  { id: "fieldcourt", label: "Fieldcourt (AFL/Netball)", note: "Dual-code club — football + netball split.", sports: ["afl", "netball"] },
  { id: "masters", label: "Masters (AFL Masters)", note: "Warm, social, events-first, photo-led.", sports: ["afl"] },
  { id: "pitch", label: "Pitch (Soccer)", note: "Sleek, dark, horizontal fixture rail.", sports: ["soccer"] },
  { id: "scorecard", label: "Scorecard (Cricket)", note: "Scoreboard strip + fixtures | ladder split.", sports: ["cricket"] },
  { id: "hardcourt", label: "Hardcourt (Basketball)", note: "Dark stat bento, broadcast energy.", sports: ["basketball"] },
  { id: "fastbreak", label: "Fastbreak (Lacrosse)", note: "Energetic zig-zag feature rows.", sports: ["lacrosse"] },
  { id: "leaguefooty", label: "Leaguefooty (AFL)", note: "Guernsey hero, grade strip, match + ladder.", sports: ["afl"] },
  { id: "courtside", label: "Courtside (Netball)", note: "Airy, bib-style grade chips incl. Mixed.", sports: ["netball"] },
  { id: "juniors", label: "Juniors (Junior Football)", note: "Friendly, family-focused, parent info panel.", sports: ["afl"] },
  { id: "rugbyunion", label: "Rugby Union", note: "Traditional, centred crest, honours ribbon.", sports: ["rugbyunion"] },
  { id: "rugbyleague", label: "Rugby League", note: "Dark clash banner, form guide, ladder.", sports: ["rugbyleague"] },
  { id: "oztag", label: "Oztag", note: "Social comp — register-a-team, divisions, nights.", sports: ["oztag"] },
  { id: "touch", label: "Touch Footy", note: "Summery social — come-and-try steps + draw.", sports: ["touch"] },
];

// F2 variant-picker freeze (Brief 04 item 2): the club-facing picker offers ONLY
// Classic + its theme presets (the Classic-backed variants). The 20 bespoke variants
// are removed from the picker; any club already on one keeps rendering it (we never
// change the stored site.variant). A platform admin can still reveal all via "Show all"
// to manage the two draft test tenants on Fastbreak/Poster.
const ALLOWED_VARIANTS: DesignVariant[] = [
  "heritage", "broadcast", "arena", "classic", "stadium", "editorial", "momentum", "coastal",
];

export function AdminWebsite() {
  const { club, variant, setVariant } = useClub();
  const { clubId } = useActiveClub();
  const { can } = usePermissions();
  const isPlatform = can("platform.clubs");
  const [showAll, setShowAll] = useState(false);
  const [mode, setMode] = useState<NewsMode>(getNewsMode(club.content));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [styleSaving, setStyleSaving] = useState(false);
  const [styleSaved, setStyleSaved] = useState(false);

  // Picker offers Classic + its theme presets only. Platform admins can reveal all
  // (to manage the draft test tenants). The stored variant is never changed here.
  const visibleStyles = useMemo(() => {
    if (isPlatform && showAll) return STYLES;
    return STYLES.filter((s) => ALLOWED_VARIANTS.includes(s.id));
  }, [isPlatform, showAll]);
  // If the club is already on a now-frozen bespoke variant, surface it read-only so
  // it never silently resets to Classic and the admin can see what they're on.
  const frozenCurrent =
    ALLOWED_VARIANTS.includes(variant) ? null : STYLES.find((s) => s.id === variant) ?? null;

  const chooseMode = async (m: NewsMode) => {
    setMode(m);
    setSaved(false);
    if (!clubId || !supabase) return;
    setSaving(true);
    const { error } = await supabase
      .from("club_content")
      .upsert({ club_id: clubId, content_key: "news.mode", value: m }, { onConflict: "club_id,content_key" });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const chooseStyle = async (v: DesignVariant) => {
    setVariant(v); // apply live immediately
    setStyleSaved(false);
    if (!clubId || !supabase) return;
    setStyleSaving(true);
    const { error } = await supabase
      .from("club_content")
      .upsert({ club_id: clubId, content_key: "site.variant", value: v }, { onConflict: "club_id,content_key" });
    setStyleSaving(false);
    if (!error) setStyleSaved(true);
  };

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Website style</h2>
      </div>
      <p className="sw-admin-note">
        Pick a look for the {club.identity.shortName} website. It applies live across the site and
        saves as your club&apos;s style straight away.
      </p>
      {frozenCurrent && (
        <p className="sw-admin-note" style={{ background: "#eef2f7", borderRadius: 8, padding: "8px 12px" }}>
          Your current style is <strong>{frozenCurrent.label}</strong>, which is no longer offered to new
          clubs. It keeps working &mdash; pick one of the styles below if you&apos;d like to switch.
        </p>
      )}
      {isPlatform && (
        <label className="sw-admin-showall">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          <span>Show all styles (platform admin)</span>
        </label>
      )}
      <div className="sw-admin-styles">
        {visibleStyles.map((s) => (
          <button
            key={s.id}
            type="button"
            className="sw-admin-style"
            data-active={s.id === variant}
            onClick={() => chooseStyle(s.id)}
          >
            <strong>{s.label}</strong>
            <span>{s.note}</span>
          </button>
        ))}
      </div>
      {(styleSaving || styleSaved) && (
        <p className="sw-admin-note" style={{ marginTop: "0.6rem" }}>
          {styleSaving ? "Saving\u2026" : "Saved \u2014 this is now your club's style."}
        </p>
      )}

      <div className="sw-admin-formhead" style={{ marginTop: "2.5rem" }}>
        <h2>News &amp; social</h2>
      </div>
      <p className="sw-admin-note">
        Choose how {club.identity.shortName} handles news and social. This saves for your club.
      </p>
      <div className="sw-admin-newsmode">
        {NEWS_MODE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className="sw-admin-style"
            data-active={o.id === mode}
            onClick={() => chooseMode(o.id)}
          >
            <strong>{o.label}</strong>
            <span>{o.note}</span>
          </button>
        ))}
      </div>
      <p className="sw-admin-note" aria-live="polite">
        {!clubId
          ? "Sign in as a club admin to change this."
          : saving
            ? "Saving…"
            : saved
              ? "Saved. Reload the site to see it."
              : ""}
      </p>
    </div>
  );
}
