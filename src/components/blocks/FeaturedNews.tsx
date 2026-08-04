import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars, Chevron } from "../layout/Chevron";
import { EditableText } from "../edit/Editable";
import { formatDate } from "../../lib/format";
import { slugify } from "../../lib/slug";

interface Props {
  limit?: number;
  /** Hide the section header when embedded in a page that has its own. */
  bare?: boolean;
  eyebrow?: string;
  heading?: string;
}

export function FeaturedNews({ limit, bare, eyebrow, heading }: Props) {
  const { club } = useClub();
  const posts = limit ? club.news.slice(0, limit) : club.news;

  const grid = (
    <div className="sw-grid">
      {posts.map((post) => (
        <article className="sw-card" key={post.id}>
          <div className="sw-card-media">
            {post.image ? <img src={post.image} alt={post.title} /> : <Chevron />}
            <span className="sw-card-tag">{post.category}</span>
          </div>
          <div className="sw-card-body">
            <span className="sw-card-date">
              {formatDate(post.date)}
              {post.author && ` · ${post.author}`}
              {post.placeholder && <span className="sw-flag" style={{ marginLeft: 8 }}>Placeholder</span>}
            </span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <SmartLink href={post.href ?? `/news/${post.slug ?? slugify(post.title)}`} className="sw-link-arrow">
              Read more →
            </SmartLink>
          </div>
        </article>
      ))}
    </div>
  );

  if (bare) return grid;

  return (
    <section className="sw-section">
      <div className="sw-container">
        <div className="sw-section-head">
          <div>
            <AccentBars />
            <EditableText as="span" className="sw-eyebrow" k="home.news.eyebrow" value={eyebrow ?? "Latest news"} />
            <EditableText as="h2" k="home.news.heading" value={heading ?? "From the club"} />
          </div>
          <SmartLink href="/news" className="sw-link-arrow">
            All news →
          </SmartLink>
        </div>
        {grid}
      </div>
    </section>
  );
}
