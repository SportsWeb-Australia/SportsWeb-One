import { useClub } from "../components/ClubContext";
import { Hero } from "../components/blocks/Hero";
import { QuickLinks } from "../components/blocks/QuickLinks";
import { PresidentWelcome } from "../components/blocks/PresidentWelcome";
import { FeaturedNews } from "../components/blocks/FeaturedNews";
import { MatchCentre } from "../components/blocks/MatchCentre";
import { UpcomingEvents } from "../components/blocks/UpcomingEvents";
import { TeamsBlock } from "../components/blocks/TeamsBlock";
import { SponsorStrip } from "../components/blocks/SponsorStrip";
import { Committee } from "../components/blocks/Committee";
import { Documents } from "../components/blocks/Documents";
import { SocialFeed } from "../components/blocks/SocialFeed";
import { JoinCTA } from "../components/blocks/JoinCTA";

export function Home() {
  const { club } = useClub();
  const b = club.blocks;

  return (
    <>
      <Hero />
      {b.quickLinks && <QuickLinks />}
      {b.presidentWelcome && <PresidentWelcome />}
      {b.matchCentre && <MatchCentre />}
      {b.featuredNews && <FeaturedNews limit={3} />}
      {b.teams && <TeamsBlock />}
      {b.upcomingEvents && <UpcomingEvents limit={3} />}
      {b.joinCta && <JoinCTA />}
      {b.sponsors && <SponsorStrip />}
      {b.committee && <Committee />}
      {b.documents && <Documents />}
      {b.socialFeed && <SocialFeed />}
    </>
  );
}
