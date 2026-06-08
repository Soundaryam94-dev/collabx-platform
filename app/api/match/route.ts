import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CollabXMatcher, GOAL_WEIGHTS, BrandCriteria } from "@/lib/matcher";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { target_niches, tags, min_followers, min_engagement, goal, top_n } = body;

  const { data: creators, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, bio, avatar_url, category, followers, engagement_rate, rating, tags")
    .eq("role", "creator")
    .neq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!creators || creators.length === 0) return NextResponse.json({ results: [] });

  const brand: BrandCriteria = {
    target_niches: target_niches ?? [],
    tags: tags ?? [],
    min_followers: min_followers ?? 0,
    min_engagement: min_engagement ?? 0,
  };

  const weights = GOAL_WEIGHTS[goal] ?? GOAL_WEIGHTS["Balanced — All factors matter equally"];
  const matcher = new CollabXMatcher(creators);
  const results = matcher.match(brand, weights, top_n ?? 10);

  return NextResponse.json({ results });
}
