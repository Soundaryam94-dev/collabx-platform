export type CreatorData = {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  category: string | null;
  followers: number;
  engagement_rate: number;
  rating: number;
  tags: string;
};

export type BrandCriteria = {
  target_niches: string[];
  tags: string[];
  min_followers: number;
  min_engagement: number;
};

export type MatchWeights = {
  category: number;
  followers: number;
  engagement: number;
  rating: number;
  tags: number;
};

export type MatchResult = CreatorData & {
  match_score: number;
  breakdown: {
    category: number;
    followers: number;
    engagement: number;
    rating: number;
    tags: number;
  };
};

export const GOAL_WEIGHTS: Record<string, MatchWeights> = {
  "Reach — Maximum audience exposure": {
    category: 0.20, followers: 0.40, engagement: 0.15, rating: 0.15, tags: 0.10,
  },
  "Engagement — Active, responsive audience": {
    category: 0.20, followers: 0.10, engagement: 0.45, rating: 0.15, tags: 0.10,
  },
  "Niche Fit — Exact content category match": {
    category: 0.45, followers: 0.10, engagement: 0.15, rating: 0.15, tags: 0.15,
  },
  "Balanced — All factors matter equally": {
    category: 0.25, followers: 0.20, engagement: 0.25, rating: 0.15, tags: 0.15,
  },
};

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

function tagSimilarity(brandTags: string[], creatorTags: string[]): number {
  const brandSet = new Set(brandTags.map((t) => t.trim().toLowerCase()));
  const creatorSet = new Set(creatorTags.map((t) => t.trim().toLowerCase()));
  if (brandSet.size === 0) return 0;
  const overlap = [...brandSet].filter((t) => creatorSet.has(t));
  return overlap.length / brandSet.size;
}

export class CollabXMatcher {
  private creators: CreatorData[];
  private minF: number;
  private maxF: number;
  private minE: number;
  private maxE: number;

  constructor(creators: CreatorData[]) {
    this.creators = creators;
    this.minF = Math.min(...creators.map((c) => c.followers));
    this.maxF = Math.max(...creators.map((c) => c.followers));
    this.minE = Math.min(...creators.map((c) => c.engagement_rate));
    this.maxE = Math.max(...creators.map((c) => c.engagement_rate));
  }

  score(brand: BrandCriteria, creator: CreatorData, weights: MatchWeights): number {
    const categoryScore = creator.category && brand.target_niches.includes(creator.category) ? 1.0 : 0.0;
    const normFollowers = normalize(creator.followers, this.minF, this.maxF);
    const normEngagement = normalize(creator.engagement_rate, this.minE, this.maxE);
    const normRating = creator.rating / 5.0;
    const creatorTags = creator.tags ? creator.tags.split(",") : [];
    const tScore = tagSimilarity(brand.tags, creatorTags);

    const total =
      categoryScore  * weights.category   +
      normFollowers  * weights.followers   +
      normEngagement * weights.engagement  +
      normRating     * weights.rating      +
      tScore         * weights.tags;

    return Math.round(total * 100 * 100) / 100;
  }

  breakdown(brand: BrandCriteria, creator: CreatorData, weights: MatchWeights) {
    const categoryScore = creator.category && brand.target_niches.includes(creator.category) ? 1.0 : 0.0;
    const normFollowers = normalize(creator.followers, this.minF, this.maxF);
    const normEngagement = normalize(creator.engagement_rate, this.minE, this.maxE);
    const normRating = creator.rating / 5.0;
    const creatorTags = creator.tags ? creator.tags.split(",") : [];
    const tScore = tagSimilarity(brand.tags, creatorTags);

    return {
      category:   Math.round(categoryScore  * weights.category   * 100 * 10) / 10,
      followers:  Math.round(normFollowers  * weights.followers   * 100 * 10) / 10,
      engagement: Math.round(normEngagement * weights.engagement  * 100 * 10) / 10,
      rating:     Math.round(normRating     * weights.rating      * 100 * 10) / 10,
      tags:       Math.round(tScore         * weights.tags        * 100 * 10) / 10,
    };
  }

  match(brand: BrandCriteria, weights: MatchWeights, topN: number = 10): MatchResult[] {
    const eligible = this.creators.filter(
      (c) => c.followers >= brand.min_followers && c.engagement_rate >= brand.min_engagement
    );
    const scored: MatchResult[] = eligible.map((c) => ({
      ...c,
      match_score: this.score(brand, c, weights),
      breakdown: this.breakdown(brand, c, weights),
    }));
    return scored.sort((a, b) => b.match_score - a.match_score).slice(0, topN);
  }
}

export function matchLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 75) return { label: "Excellent Match", color: "#86efac", bg: "#14532d" };
  if (score >= 55) return { label: "Good Match",      color: "#93c5fd", bg: "#1e3a5f" };
  if (score >= 35) return { label: "Fair Match",      color: "#fcd34d", bg: "#78350f" };
  return              { label: "Weak Match",       color: "#fca5a5", bg: "#450a0a" };
}
