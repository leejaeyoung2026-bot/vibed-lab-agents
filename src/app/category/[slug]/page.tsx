import { getAgentsByCategory } from "@/lib/data";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import AgentCard from "@/components/AgentCard";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
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
