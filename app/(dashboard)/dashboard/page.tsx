"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Users, BarChart2, ArrowUpRight, Clock, CheckCircle, Bell, X, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getBrandStats, getCreatorStats, getBrandCampaigns, getCollaborations } from "@/lib/supabase/queries";

type Step = { label: string; description: string; done: boolean; href: string };

function GettingStarted({ steps, role }: { steps: Step[]; role: string }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem(`gs_dismissed_${role}`) === "1");
    }
  }, [role]);

  useEffect(() => {
    if (allDone) {
      localStorage.setItem(`gs_dismissed_${role}`, "1");
      setDismissed(true);
    }
  }, [allDone, role]);

  const dismiss = () => {
    localStorage.setItem(`gs_dismissed_${role}`, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="rounded-2xl border border-[#7C5CFF]/25 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.08), rgba(168,85,247,0.05))" }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-white text-sm">
                {allDone ? "🎉 You're all set!" : "Getting Started"}
              </h3>
              <p className="text-[#A1A1AA] text-xs mt-0.5">
                {allDone
                  ? "You've completed all the steps. Enjoy CollabX!"
                  : `${completedCount} of ${steps.length} steps completed`}
              </p>
            </div>
            <button onClick={dismiss} className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer p-1">
              <X size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-white/10 rounded-full mt-3 mb-5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#A855F7]"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / steps.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((step, i) => {
              const isActive = !step.done && steps.slice(0, i).every((s) => s.done);
              return (
                <button
                  key={step.label}
                  onClick={() => !step.done && router.push(step.href)}
                  disabled={step.done}
                  className={`text-left rounded-xl px-4 py-3 border transition-all cursor-pointer group ${
                    step.done
                      ? "border-emerald-500/20 bg-emerald-500/5 cursor-default"
                      : isActive
                      ? "border-[#7C5CFF]/50 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/15"
                      : "border-white/8 bg-white/3 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-[#7C5CFF] text-white"
                        : "bg-white/10 text-[#A1A1AA]"
                    }`}>
                      {step.done ? <CheckCircle size={11} /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold ${step.done ? "text-emerald-400" : isActive ? "text-white" : "text-[#A1A1AA]"}`}>
                      {step.label}
                    </span>
                    {isActive && <ChevronRight size={12} className="ml-auto text-[#7C5CFF] group-hover:translate-x-0.5 transition-transform" />}
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] leading-snug">{step.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

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
  const [stats, setStats] = useState({ activeCampaigns: 0, totalCreators: 0, totalCampaigns: 0 });
  const [campaigns, setCampaigns] = useState<{ id: string; title: string; status: string; budget: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBrandStats(userId), getBrandCampaigns(userId)]).then(([s, c]) => {
      setStats(s);
      setCampaigns(c as { id: string; title: string; status: string; budget: number }[]);
      setLoading(false);
    });
  }, [userId]);

  const brandSteps: Step[] = [
    { label: "Create Account", description: "You're signed up and ready to go.", done: true, href: "/settings" },
    { label: "Create a Campaign", description: "Set up your first campaign with goals and details.", done: stats.totalCampaigns > 0, href: "/campaigns/new" },
    { label: "Invite a Creator", description: "Browse creators and send your first collaboration invite.", done: stats.totalCreators > 0, href: "/creators" },
    { label: "Start Collaborating", description: "Track progress once a creator accepts your invite.", done: stats.activeCampaigns > 0, href: "/collaborations" },
  ];

  const statCards = [
    { label: "Active Campaigns", value: String(stats.activeCampaigns), change: "Live now", icon: Megaphone, color: "#7C5CFF" },
    { label: "Total Creators", value: String(stats.totalCreators), change: "Across campaigns", icon: Users, color: "#A855F7" },
    { label: "Total Campaigns", value: String(stats.totalCampaigns), change: "All time", icon: BarChart2, color: "#8B5CF6" },
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

      <GettingStarted steps={brandSteps} role="brand" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
  const [stats, setStats] = useState({ activeCollabs: 0, totalCollabs: 0, pendingReview: 0 });
  const [collaborations, setCollaborations] = useState<{ id: string; status: string; campaigns: unknown; profiles: unknown }[]>([]);
  const [hasBio, setHasBio] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      getCreatorStats(userId),
      getCollaborations(userId, "creator"),
      supabase.from("profiles").select("bio").eq("id", userId).single(),
    ]).then(([s, c, { data: profile }]) => {
      setStats(s);
      setCollaborations(c as typeof collaborations);
      setHasBio(!!(profile?.bio && profile.bio.trim().length > 0));
      setLoading(false);
    });
  }, [userId]);

  const creatorSteps: Step[] = [
    { label: "Create Account", description: "You're signed up and ready to go.", done: true, href: "/settings" },
    { label: "Complete Profile", description: "Add your bio, niche, and follower count so brands can find you.", done: hasBio, href: "/settings" },
    { label: "Send a Proposal", description: "Browse brands and send your first collaboration proposal.", done: stats.totalCollabs > 0, href: "/brands" },
    { label: "Start Collaborating", description: "Track your deal once a brand accepts your proposal.", done: stats.activeCollabs > 0, href: "/collaborations" },
  ];

  const statCards = [
    { label: "Active Collabs", value: String(stats.activeCollabs), change: "In progress", icon: CheckCircle, color: "#7C5CFF" },
    { label: "Total Collabs", value: String(stats.totalCollabs), change: "All time", icon: Users, color: "#A855F7" },
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
        <p className="text-[#A1A1AA] text-sm mt-1">Track your collaborations and activity</p>
      </div>

      <GettingStarted steps={creatorSteps} role="creator" />

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
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {collaborations.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push("/collaborations")}>
                      <td className="py-3 font-semibold text-white">{(c.profiles as { full_name?: string } | null)?.full_name ?? "Brand"}</td>
                      <td className="py-3 text-[#A1A1AA]">{(c.campaigns as { title?: string } | null)?.title ?? "—"}</td>
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
