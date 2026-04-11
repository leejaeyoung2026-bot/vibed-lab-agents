import {
  getAllAgents,
  getFeaturedAgents,
  getTrending,
} from "@/lib/data";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import AgentCard from "@/components/AgentCard";

export default function Home() {
  const featured = getFeaturedAgents();
  const trending = getTrending(10);
  const all = getAllAgents();

  const categoryCounts = CATEGORIES.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
    count: all.filter((a) => a.categories.includes(cat.slug)).length,
  })).filter((c) => c.count > 0);

  return (
    <>
      <section className="hero">
        <h1>Claude Code Agents</h1>
        <p>Curated weekly. Hand-picked featured agents and auto-trending repos from GitHub.</p>
      </section>

      {featured.length > 0 ? (
        <section className="section">
          <h2>
            This week's featured
            <span className="count">{featured.length} picks</span>
          </h2>
          <div className="card-grid">
            {featured.map(({ agent, comment }) => (
              <AgentCard key={agent.slug} agent={agent} featuredComment={comment} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2>
          Trending
          <span className="count">sorted by weekly star growth</span>
        </h2>
        {trending.length === 0 ? (
          <div className="empty-state">
            No agents crawled yet. The weekly crawler will populate this shortly.
          </div>
        ) : (
          <div className="card-grid">
            {trending.map((agent) => (
              <AgentCard key={agent.slug} agent={agent} />
            ))}
          </div>
        )}
      </section>

      {categoryCounts.length > 0 && (
        <section className="section">
          <h2>Explore by category</h2>
          <div className="category-tiles">
            {categoryCounts.map((cat) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="category-tile"
              >
                <span>{cat.label}</span>
                <span className="tile-count">{cat.count}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
