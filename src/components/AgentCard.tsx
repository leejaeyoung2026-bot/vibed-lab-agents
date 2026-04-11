import type { Agent } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";

type Props = {
  agent: Agent;
  featuredComment?: string;
};

export default function AgentCard({ agent, featuredComment }: Props) {
  return (
    <article className="card">
      <h3 className="card-title">
        <a href={`/agent/${agent.slug}`}>{agent.owner}/{agent.repo}</a>
      </h3>
      {featuredComment && (
        <p className="featured-comment">{featuredComment}</p>
      )}
      <p className="card-desc">{agent.description || "No description provided."}</p>
      <div className="card-meta">
        <span className="stars">{agent.stars.toLocaleString()}</span>
        {agent.starsDelta7d > 0 && (
          <span className="delta">+{agent.starsDelta7d} this week</span>
        )}
      </div>
      {agent.categories.length > 0 && (
        <div className="card-tags">
          {agent.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="tag">
              {categoryLabel(cat)}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
