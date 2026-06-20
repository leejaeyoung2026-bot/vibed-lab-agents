import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";

const BASE_URL = "https://agents.vibed-lab.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

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

  // Individual /agent/[slug] detail pages are noindex (see metadata fix
  // 2026-06-14); excluding them avoids GSC "Submitted URL marked noindex".
  return [...staticEntries, ...categoryEntries];
}
