import { getAgentBySlug, getAllAgents } from "@/lib/data";
import { categoryLabel } from "@/lib/categories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllAgents().map((agent) => ({ slug: agent.slug }));
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  return (
    <>
      <div className="detail-header">
        <h1>{agent.owner}/{agent.repo}</h1>
        <p className="owner">
          {agent.stars.toLocaleString()} stars · Last commit{" "}
          {new Date(agent.lastCommit).toISOString().slice(0, 10)}
        </p>
        {agent.description && <p>{agent.description}</p>}
        {agent.categories.length > 0 && (
          <div className="card-tags" style={{ marginTop: 12 }}>
            {agent.categories.map((cat) => (
              <a key={cat} href={`/category/${cat}`} className="tag">
                {categoryLabel(cat)}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="detail-body">
        <div>
          <h2>README preview</h2>
          {agent.readmeExcerpt ? (
            <pre className="readme-excerpt">{agent.readmeExcerpt}</pre>
          ) : (
            <div className="empty-state">No README preview available.</div>
          )}
          <p style={{ marginTop: 16 }}>
            <a href={agent.url} target="_blank" rel="noreferrer">
              View full repository on GitHub →
            </a>
          </p>
        </div>
        <aside>
          <div className="install-box">
            <h3>Install</h3>
            <pre>{agent.installSnippet}</pre>
          </div>
        </aside>
      </div>
    </>
  );
}
