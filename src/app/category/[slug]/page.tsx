import type { Metadata } from "next";
import { getAgentsByCategory } from "@/lib/data";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import AgentCard from "@/components/AgentCard";
import { notFound } from "next/navigation";

const BASE_URL = "https://agents.vibed-lab.com";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = categoryLabel(slug);
  const title = `${label} — Vibed Lab Agents`;
  const description = `Discover Claude Code agents in the ${label} category on Vibed Lab.`;
  const url = `${BASE_URL}/category/${slug}`;

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const agents = getAgentsByCategory(slug);

  return (
    <>
      <section className="hero">
        <h1>{categoryLabel(slug)}</h1>
        <p>{agents.length} agents in this category.</p>
      </section>
      {agents.length === 0 ? (
        <div className="empty-state">No agents yet in this category.</div>
      ) : (
        <div className="card-grid">
          {agents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      )}
    </>
  );
}
