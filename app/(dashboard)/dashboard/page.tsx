"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Users, TrendingUp, DollarSign, ArrowUpRight, Eye, Heart, Share2, Clock, CheckCircle, Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getBrandStats, getCreatorStats, getBrandCampaigns, getCollaborations } from "@/lib/supabase/queries";

function StatCard({ label, value, change, icon: Icon, color }: {
  label: string; value: string; change: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#A1A1AA]">{label}</p>
          <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> {change}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

function BrandDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [stats, setStats] = useState({ activeCampaigns: 0, totalCreators: 0, totalSpend: 0, totalCampaigns: 0 });
  const [campaigns, setCampaigns] = useState<{ id: string; title: string; status: string; budget: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBrandStats(userId), getBrandCampaigns(userId)]).then(([s, c]) => {
      setStats(s);
      setCampaigns(c as { id: string; title: string; status: string; budget: number }[]);
      setLoading(false);
    });
  }, [userId]);

  const statCards = [
    { label: "Active Campaigns", value: String(stats.activeCampaigns), change: "Live now", icon: Megaphone, color: "#7C5CFF" },
    { label: "Total Creators", value: String(stats.totalCreators), change: "Across campaigns", icon: Users, color: "#A855F7" },
    { label: "Total Reach", value: "—", change: "Connect analytics", icon: TrendingUp, color: "#6366F1" },
    { label: "Total Spend", value: stats.totalSpend > 0 ? `$${stats.totalSpend.toLocaleString()}` : "$0", change: "Approved payouts", icon: DollarSign, color: "#8B5CF6" },
  ];

  const statusVariant: Record<string, "green" | "gray" | "purple"> = {
    active: "green", draft: "gray", paused: "purple", completed: "gray",
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Brand Dashboard</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">Overview of your campaigns and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: "Total Views", icon: Eye, color: "#7C5CFF" },
          { label: "Total Likes", icon: Heart, color: "#A855F7" },
          { label: "Total Shares", icon: Share2, color: "#6366F1" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}20` }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-[#A1A1AA] text-xs">{m.label}</p>
                  <p className="text-xl font-bold text-white">—</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">My Campaigns</h3>
            <Button variant="primary" size="sm" onClick={() => router.push("/campaigns/new")}>+ New Campaign</Button>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-[#A1A1AA] text-sm">No campaigns yet. Create your first campaign to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[#A1A1AA]">
                    <th className="text-left pb-3 font-medium">Campaign</th>
                    <th className="text-left pb-3 font-medium">Budget</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push("/campaigns")}>
                      <td className="py-3 font-medium text-white">{c.title}</td>
                      <td className="py-3 text-[#A1A1AA]">{c.budget ? `$${c.budget.toLocaleString()}` : "—"}</td>
                      <td className="py-3"><Badge variant={statusVariant[c.status] ?? "gray"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function CreatorDashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [stats, setStats] = useState({ activeCollabs: 0, totalEarnings: 0, pendingReview: 0, totalCollabs: 0 });
  const [collaborations, setCollaborations] = useState<{ id: string; status: string; payment_amount: number; campaigns: unknown; profiles: unknown }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCreatorStats(userId), getCollaborations(userId, "creator")]).then(([s, c]) => {
      setStats(s);
      setCollaborations(c as typeof collaborations);
      setLoading(false);
    });
  }, [userId]);

  const statCards = [
    { label: "Active Collabs", value: String(stats.activeCollabs), change: "In progress", icon: CheckCircle, color: "#7C5CFF" },
    { label: "Total Earnings", value: stats.totalEarnings > 0 ? `$${stats.totalEarnings.toLocaleString()}` : "$0", change: "Completed payouts", icon: DollarSign, color: "#A855F7" },
    { label: "Total Reach", value: "—", change: "Connect analytics", icon: TrendingUp, color: "#6366F1" },
    { label: "Pending Review", value: String(stats.pendingReview), change: "Action needed", icon: Clock, color: "#8B5CF6" },
  ];

  const statusVariant: Record<string, "green" | "purple" | "blue" | "gray" | "orange"> = {
    in_progress: "blue", submitted: "orange", agreed: "purple", invited: "gray", approved: "green", completed: "green", rejected: "gray",
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Creator Dashboard</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">Track your collaborations and earnings</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {stats.pendingReview > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card hover={false} className="border border-[#7C5CFF]/20">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#A855F7]" />
              <p className="font-bold text-white">{stats.pendingReview} submission{stats.pendingReview > 1 ? "s" : ""} pending brand review.</p>
              <Button variant="primary" size="sm" className="ml-auto" onClick={() => router.push("/collaborations")}>View</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card hover={false}>
          <h3 className="font-bold text-white mb-4">My Collaborations</h3>
          {collaborations.length === 0 ? (
            <div className="text-center py-10 text-[#A1A1AA] text-sm">No collaborations yet. Browse brands to send your first proposal.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[#A1A1AA]">
                    <th className="text-left pb-3 font-medium">Brand</th>
                    <th className="text-left pb-3 font-medium">Campaign</th>
                    <th className="text-left pb-3 font-medium">Payment</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {collaborations.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push("/collaborations")}>
                      <td className="py-3 font-semibold text-white">{(c.profiles as { full_name?: string } | null)?.full_name ?? "Brand"}</td>
                      <td className="py-3 text-[#A1A1AA]">{(c.campaigns as { title?: string } | null)?.title ?? "—"}</td>
                      <td className="py-3 text-emerald-400 font-semibold">{c.payment_amount ? `$${c.payment_amount.toLocaleString()}` : "—"}</td>
                      <td className="py-3"><Badge variant={statusVariant[c.status] ?? "gray"}>{c.status.replace("_", " ")}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser({ id: user.id, role: user.user_metadata?.role ?? "creator" });
    });
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return user.role === "brand" ? <BrandDashboard userId={user.id} /> : <CreatorDashboard userId={user.id} />;
}
