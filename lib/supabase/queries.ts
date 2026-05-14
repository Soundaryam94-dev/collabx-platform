import { createClient } from "@/lib/supabase/client";

export async function getBrandStats(userId: string) {
  const supabase = createClient();

  const [campaignsRes, collaborationsRes, spendRes] = await Promise.all([
    supabase.from("campaigns").select("id, status").eq("brand_id", userId),
    supabase.from("collaborations").select("creator_id, status").eq("brand_id", userId),
    supabase.from("collaborations").select("payment_amount").eq("brand_id", userId).in("status", ["approved", "completed"]),
  ]);

  const campaigns = campaignsRes.data ?? [];
  const collaborations = collaborationsRes.data ?? [];
  const spend = spendRes.data ?? [];

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalCreators = new Set(collaborations.map((c) => c.creator_id)).size;
  const totalSpend = spend.reduce((sum, c) => sum + (c.payment_amount ?? 0), 0);

  return { activeCampaigns, totalCampaigns: campaigns.length, totalCreators, totalSpend };
}

export async function getCreatorStats(userId: string) {
  const supabase = createClient();

  const { data: collaborations } = await supabase
    .from("collaborations")
    .select("status, payment_amount")
    .eq("creator_id", userId);

  const all = collaborations ?? [];
  const activeStatuses = ["agreed", "in_progress", "submitted"];

  return {
    activeCollabs: all.filter((c) => activeStatuses.includes(c.status)).length,
    totalEarnings: all.filter((c) => c.status === "completed").reduce((s, c) => s + (c.payment_amount ?? 0), 0),
    pendingReview: all.filter((c) => c.status === "submitted").length,
    totalCollabs: all.length,
  };
}

export async function getBrandCampaigns(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, title, status, budget, created_at")
    .eq("brand_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export async function getCollaborations(userId: string, role: "brand" | "creator") {
  const supabase = createClient();
  const field = role === "brand" ? "brand_id" : "creator_id";
  const joinField = role === "brand" ? "creator_id" : "brand_id";

  const { data } = await supabase
    .from("collaborations")
    .select(`id, status, payment_amount, deliverables, created_at, updated_at, campaigns(title), profiles!collaborations_${joinField}_fkey(full_name, email, role)`)
    .eq(field, userId)
    .order("updated_at", { ascending: false });

  return data ?? [];
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
    .select("id, full_name, email, bio, avatar_url")
    .eq("role", "creator")
    .order("full_name");
  return data ?? [];
}

export async function getBrandProfiles() {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, bio, avatar_url, website")
    .eq("role", "brand")
    .order("full_name");
  return data ?? [];
}

export async function createCampaign(brandId: string, payload: {
  title: string;
  goal: string;
  category: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  guidelines: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: brandId,
      title: payload.title,
      goal: payload.goal || null,
      category: payload.category || null,
      budget: payload.budget,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      guidelines: payload.guidelines || null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, bio, website")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateProfile(userId: string, payload: { full_name?: string; bio?: string; website?: string }) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function getAnalyticsData(userId: string, role: "brand" | "creator") {
  const supabase = createClient();
  const field = role === "brand" ? "brand_id" : "creator_id";

  const [collabsRes, campaignsRes] = await Promise.all([
    supabase.from("collaborations").select("status, payment_amount, created_at").eq(field, userId),
    role === "brand"
      ? supabase.from("campaigns").select("status, budget, created_at").eq("brand_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  const collabs = collabsRes.data ?? [];
  const campaigns = (campaignsRes as { data: { status: string; budget: number; created_at: string }[] | null }).data ?? [];

  const statusCounts = collabs.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const totalEarnings = collabs.filter((c) => c.status === "completed").reduce((s, c) => s + (c.payment_amount ?? 0), 0);
  const totalPending = collabs.filter((c) => ["agreed", "in_progress", "submitted"].includes(c.status)).reduce((s, c) => s + (c.payment_amount ?? 0), 0);
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0);

  return { statusCounts, totalEarnings, totalPending, totalBudget, totalCollabs: collabs.length, totalCampaigns: campaigns.length };
}
