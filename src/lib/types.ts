export type Agent = {
  slug: string;
  name: string;
  owner: string;
  repo: string;
  url: string;
  description: string;
  stars: number;
  starsDelta7d: number;
  lastCommit: string;
  topics: string[];
  categories: string[];
  installSnippet: string;
  readmeExcerpt: string;
  crawledAt: string;
};

export type FeaturedPick = {
  slug: string;
  comment: string;
};

export type FeaturedWeek = {
  picks: FeaturedPick[];
};

export type FeaturedData = Record<string, FeaturedWeek>;

export type Category = {
  slug: string;
  label: string;
  keywords: string[];
};
