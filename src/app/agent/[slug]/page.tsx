import type { Metadata } from "next";
import { getAgentBySlug, getAllAgents } from "@/lib/data";
import { categoryLabel } from "@/lib/categories";
import { notFound } from "next/navigation";

const BASE_URL = "https://agents.vibed-lab.com";

export function generateStaticParams() {
  return getAllAgents().map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) return {};

  const title = `${agent.name} — Vibed Lab Agents`;
  const description = agent.description
    ? agent.description.slice(0, 155)
    : `Explore the ${agent.name} Claude Code agent on Vibed Lab.`;
  const url = `${BASE_URL}/agent/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "Vibed Lab",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  const lastCommitDate = new Date(agent.lastCommit);
  const lastCommitDisplay = isNaN(lastCommitDate.getTime())
    ? "unknown"
    : lastCommitDate.toISOString().slice(0, 10);

  return (
    <>
      <div className="detail-header">
        <h1>{agent.owner}/{agent.repo}</h1>
        <p className="owner">
          {agent.stars.toLocaleString()} stars · Last commit{" "}
          {lastCommitDisplay}
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
            <a href={agent.url} target="_blank" rel="noopener noreferrer">
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
