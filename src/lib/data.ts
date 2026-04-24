import agentsData from "../../data/agents.json";
import featuredData from "../../data/featured.json";
import type { Agent, FeaturedData, FeaturedWeek } from "./types";

export function getAllAgents(): Agent[] {
  return agentsData as Agent[];
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return getAllAgents().find((a) => a.slug === slug);
}

export function getTrending(limit = 10): Agent[] {
  return [...getAllAgents()]
    .sort((a, b) => b.starsDelta7d - a.starsDelta7d)
    .slice(0, limit);
}

export function getAgentsByCategory(categorySlug: string): Agent[] {
  return getAllAgents()
    .filter((a) => a.categories.includes(categorySlug))
    .sort((a, b) => b.stars - a.stars);
}

export function getLatestFeatured(): FeaturedWeek | null {
  const data = featuredData as FeaturedData;
  const keys = Object.keys(data).sort().reverse();
  if (keys.length === 0) return null;
  return data[keys[0]];
}

export function getFeaturedAgents(): { agent: Agent; comment: string }[] {
  const latest = getLatestFeatured();
  if (!latest) return [];
  const agents = getAllAgents();
  const result: { agent: Agent; comment: string }[] = [];
  for (const pick of latest.picks) {
    const agent = agents.find((a) => a.slug === pick.slug);
    if (agent) result.push({ agent, comment: pick.comment });
  }
  return result;
}
