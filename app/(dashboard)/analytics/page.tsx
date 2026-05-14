"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, FileText, CheckCircle, Clock, XCircle, BarChart2, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { getAnalyticsData } from "@/lib/supabase/queries";

const STATUS_COLORS: Record<string, string> = {
  invited: "#6366F1",
  agreed: "#A855F7",
  in_progress: "#3B82F6",
  submitted: "#F59E0B",
  approved: "#10B981",
  completed: "#059669",
  rejected: "#6B7280",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  invited: Clock,
  agreed: CheckCircle,
  in_progress: FileText,
  submitted: FileText,
  approved: CheckCircle,
  completed: CheckCircle,
  rejected: XCircle,
};

export default function AnalyticsPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [data, setData] = useState<{
    statusCounts: Record<string, number>;
    totalEarnings: number;
    totalPending: number;
    totalBudget: number;
    totalCollabs: number;
    totalCampaigns: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const role = user.user_metadata?.role ?? "creator";
      setUser({ id: user.id, role });
      const analytics = await getAnalyticsData(user.id, role as "brand" | "creator");
      setData(analytics);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  const isBrand = user?.role === "brand";
  const statusEntries = Object.entries(data?.statusCounts ?? {});
  const maxCount = Math.max(...statusEntries.map(([, v]) => v), 1);

  const kpis = isBrand
    ? [
        { label: "Total Campaigns", value: String(data?.totalCampaigns ?? 0), icon: BarChart2, color: "#7C5CFF" },
        { label: "Total Collaborations", value: String(data?.totalCollabs ?? 0), icon: FileText, color: "#A855F7" },
        { label: "Total Budget", value: data?.totalBudget ? `$${data.totalBudget.toLocaleString()}` : "$0", icon: DollarSign, color: "#6366F1" },
        { label: "Completed Payouts", value: data?.totalEarnings ? `$${data.totalEarnings.toLocaleString()}` : "$0", icon: CheckCircle, color: "#10B981" },
      ]
    : [
        { label: "Total Collaborations", value: String(data?.totalCollabs ?? 0), icon: FileText, color: "#7C5CFF" },
        { label: "Total Earned", value: data?.totalEarnings ? `$${data.totalEarnings.toLocaleString()}` : "$0", icon: DollarSign, color: "#10B981" },
        { label: "Pending Payments", value: data?.totalPending ? `$${data.totalPending.toLocaleString()}` : "$0", icon: Clock, color: "#F59E0B" },
        { label: "Active Deals", value: String((data?.statusCounts?.["in_progress"] ?? 0) + (data?.statusCounts?.["agreed"] ?? 0)), icon: TrendingUp, color: "#A855F7" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Analytics</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">
          {isBrand ? "Campaign and collaboration performance" : "Your earnings and collaboration stats"}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#A1A1AA] mb-1">{k.label}</p>
                  <p className="text-2xl font-extrabold text-white">{k.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.color}20` }}>
                  <k.icon size={18} style={{ color: k.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Collaboration status breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card hover={false}>
          <h3 className="font-bold text-white mb-5">Collaboration Status Breakdown</h3>
          {statusEntries.length === 0 ? (
            <div className="text-center py-10 text-[#A1A1AA] text-sm">No collaboration data yet.</div>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => {
                const Icon = STATUS_ICONS[status] ?? FileText;
                const color = STATUS_COLORS[status] ?? "#7C5CFF";
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-sm text-[#A1A1AA] w-24 capitalize flex-shrink-0">{status.replace("_", " ")}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-6 text-right flex-shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Earnings summary */}
      {(data?.totalEarnings ?? 0) > 0 || (data?.totalPending ?? 0) > 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card hover={false}>
            <h3 className="font-bold text-white mb-5">{isBrand ? "Spend Summary" : "Earnings Summary"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-[#A1A1AA] mb-1">Completed</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  ${(data?.totalEarnings ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-4 text-center">
                <p className="text-xs text-[#A1A1AA] mb-1">In Progress</p>
                <p className="text-2xl font-extrabold text-yellow-400">
                  ${(data?.totalPending ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {data?.totalCollabs === 0 && (
        <Card hover={false}>
          <div className="text-center py-10 text-[#A1A1AA] text-sm">
            <BarChart2 size={40} className="mx-auto mb-3 opacity-20" />
            No data yet. {isBrand ? "Create a campaign and invite creators to see analytics." : "Accept collaboration invites to see your analytics here."}
          </div>
        </Card>
      )}
    </div>
  );
}
