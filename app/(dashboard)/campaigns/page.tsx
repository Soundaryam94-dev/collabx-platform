"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Megaphone, Users, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Campaign = {
  id: string;
  title: string;
  goal: string | null;
  category: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
};

const statusVariant: Record<string, "green" | "gray" | "orange" | "purple"> = {
  active: "green",
  draft: "gray",
  paused: "orange",
  completed: "purple",
};

const FILTERS = ["All", "Active", "Draft", "Paused", "Completed"];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatGoal(goal: string | null) {
  if (!goal) return "—";
  return goal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("campaigns")
        .select("id, title, goal, category, budget, start_date, end_date, status, created_at")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });
      setCampaigns(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesFilter = filter === "All" || c.status === filter.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Campaigns</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Manage all your influencer campaigns</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push("/campaigns/new")}>
          <Plus size={16} /> New Campaign
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/40"
                  : "glass text-[#A1A1AA] border border-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={40} className="text-[#A1A1AA] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">
            {search || filter !== "All" ? "No campaigns match" : "No campaigns yet"}
          </p>
          <p className="text-[#A1A1AA] text-sm mb-4">
            {search || filter !== "All" ? "Try a different search or filter." : "Create your first campaign to start finding creators."}
          </p>
          {!search && filter === "All" && (
            <Button variant="primary" size="md" onClick={() => router.push("/campaigns/new")}>
              <Plus size={15} /> Create Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="cursor-pointer flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center">
                    <Megaphone size={18} className="text-[#A855F7]" />
                  </div>
                  <Badge variant={statusVariant[campaign.status] ?? "gray"}>{campaign.status}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-white">{campaign.title}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    {formatGoal(campaign.goal)}{campaign.category ? ` · ${campaign.category}` : ""}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="glass rounded-xl p-2.5">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <DollarSign size={11} className="text-emerald-400" />
                      {campaign.budget ? campaign.budget.toLocaleString() : "—"}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA]">Budget</p>
                  </div>
                  <div className="glass rounded-xl p-2.5">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <Users size={11} className="text-[#A855F7]" /> 0
                    </p>
                    <p className="text-[10px] text-[#A1A1AA]">Creators</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
