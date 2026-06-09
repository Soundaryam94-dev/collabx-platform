import { createClient } from "@/lib/supabase/client";

export async function getBrandStats(userId: string) {
  const supabase = createClient();

  const { data: collaborations } = await supabase
    .from("collaborations")
    .select("creator_id, status")
    .eq("brand_id", userId);

  const all = collaborations ?? [];
  const activeStatuses = ["agreed", "in_progress", "submitted"];
  const totalCreators = new Set(all.map((c) => c.creator_id)).size;
  const activeCollabs = all.filter((c) => activeStatuses.includes(c.status)).length;
  const completedCollabs = all.filter((c) => c.status === "completed").length;

  return { totalCreators, activeCollabs, completedCollabs, totalCollabs: all.length };
}

export async function getCreatorStats(userId: string) {
  const supabase = createClient();

  const { data: collaborations } = await supabase
    .from("collaborations")
    .select("status")
    .eq("creator_id", userId);

  const all = collaborations ?? [];
  const activeStatuses = ["agreed", "in_progress", "submitted"];

  return {
    activeCollabs: all.filter((c) => activeStatuses.includes(c.status)).length,
    pendingReview: all.filter((c) => c.status === "submitted").length,
    totalCollabs: all.length,
  };
}

export async function getCollaborations(userId: string, role: "brand" | "creator") {
  const supabase = createClient();
  const field = role === "brand" ? "brand_id" : "creator_id";
  const counterField = role === "brand" ? "creator_id" : "brand_id";

  const { data: collabs, error } = await supabase
    .from("collaborations")
    .select("id, status, deliverables, created_at, updated_at, brand_id, creator_id")
    .eq(field, userId)
    .order("updated_at", { ascending: false });

  if (error) console.error("getCollaborations error:", error.message);

  if (!collabs || collabs.length === 0) return [];

  const counterIds = [...new Set(collabs.map((c) => c[counterField as "brand_id" | "creator_id"]).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("id", counterIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return collabs.map((c) => ({
    ...c,
    content_url: null as string | null,
    profiles: profileMap[c[counterField as "brand_id" | "creator_id"]] ?? null,
  }));
}

export async function getConversations(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, brand_id, creator_id, updated_at, brand:profiles!conversations_brand_id_fkey(full_name, email), creator:profiles!conversations_creator_id_fkey(full_name, email)")
    .or(`brand_id.eq.${userId},creator_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getMessages(conversationId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  return data;
}

export async function getOrCreateConversation(brandId: string, creatorId: string) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("brand_id", brandId)
    .eq("creator_id", creatorId)
    .single();

  if (existing) return existing.id;

  const { data } = await supabase
    .from("conversations")
    .insert({ brand_id: brandId, creator_id: creatorId })
    .select("id")
    .single();
  return data?.id ?? null;
}

export async function getCreatorProfiles() {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, bio, avatar_url, category, followers, engagement_rate, rating, tags, persona_audience_age, persona_audience_gender, persona_platforms, persona_content_formats, persona_collab_rate, persona_languages")
    .eq("role", "creator")
    .order("full_name");
  return data ?? [];
}

export async function getBrandProfiles() {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, bio, avatar_url, website, persona_audience_age, persona_audience_gender, persona_brand_voice, persona_platforms, persona_campaign_goals, persona_budget_range")
    .eq("role", "brand")
    .order("full_name");
  return data ?? [];
}


export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, bio, website, category, followers, engagement_rate, rating, tags, industry, location, phone, instagram, youtube, linkedin, persona_audience_age, persona_audience_gender, persona_brand_voice, persona_platforms, persona_campaign_goals, persona_budget_range, persona_content_formats, persona_collab_rate, persona_languages")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateProfile(userId: string, payload: {
  full_name?: string;
  bio?: string;
  website?: string;
  category?: string;
  followers?: number;
  engagement_rate?: number;
  rating?: number;
  tags?: string;
  industry?: string;
  location?: string;
  phone?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  persona_audience_age?: string;
  persona_audience_gender?: string;
  persona_brand_voice?: string;
  persona_platforms?: string;
  persona_campaign_goals?: string;
  persona_budget_range?: string;
  persona_content_formats?: string;
  persona_collab_rate?: string;
  persona_languages?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

