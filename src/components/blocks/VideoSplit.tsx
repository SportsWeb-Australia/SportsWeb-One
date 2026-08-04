import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";
import { EditableText } from "../edit/Editable";
import { MediaEmbed } from "./MediaEmbed";

/** Video-led split section: copy/CTA one side, an embedded video the other.
 *  Renders nothing if the club hasn't set videoPitch (optional block —
 *  ported from gameday). Reuses MediaEmbed for the actual video handling
 *  (YouTube/Vimeo/direct file) rather than re-implementing embed logic. */
export function VideoSplit() {
  const { club } = useClub();
  const { videoPitch } = club;
  if (!videoPitch || !videoPitch.videoUrl) return null;

  return (
    <section className="sw-section sw-videosplit">
      <div className="sw-container sw-videosplit-grid">
        <div>
          <AccentBars />
          <EditableText as="span" className="sw-eyebrow" k="home.video.eyebrow" value={videoPitch.eyebrow} />
          <EditableText as="h2" k="home.video.title" value={videoPitch.title} />
          <EditableText as="p" className="sw-videosplit-lead" k="home.video.body" value={videoPitch.body} />
          {videoPitch.cta && (
            <SmartLink href={videoPitch.cta.href} className="sw-btn">
              {videoPitch.cta.label}
            </SmartLink>
          )}
        </div>
        <div>
          <MediaEmbed url={videoPitch.videoUrl} title={videoPitch.title} />
          {videoPitch.caption && <EditableText as="p" className="sw-videosplit-caption" k="home.video.caption" value={videoPitch.caption} />}
        </div>
      </div>
    </section>
  );
}
