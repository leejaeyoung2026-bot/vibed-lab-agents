import type { MetadataRoute } from "next";
import { getAllAgents } from "@/lib/data";
import { CATEGORIES } from "@/lib/categories";

const BASE_URL = "https://agents.vibed-lab.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const agents = getAllAgents();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const agentEntries: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE_URL}/agent/${agent.slug}`,
    lastModified: new Date(agent.crawledAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...agentEntries];
}
