"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, Clock, ChevronRight, Calendar, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getCollaborations } from "@/lib/supabase/queries";

type Collab = {
  id: string;
  status: string;
  deliverables: string | null;
  created_at: string;
  updated_at: string;
  campaigns: { title: string }[] | null;
  profiles: { full_name: string | null; email: string }[] | null;
};

const PIPELINE = ["invited", "agreed", "in_progress", "submitted", "approved", "completed"];

const statusVariant: Record<string, "green" | "purple" | "blue" | "gray" | "orange"> = {
  invited: "gray", agreed: "purple", in_progress: "blue",
  submitted: "orange", approved: "green", completed: "green", rejected: "gray",
};

const statusIcon: Record<string, React.ElementType> = {
  invited: Clock, agreed: CheckCircle, in_progress: FileText,
  submitted: FileText, approved: CheckCircle, completed: CheckCircle, rejected: Clock,
};

export default function CollaborationsPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [selected, setSelected] = useState<Collab | null>(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const role = user.user_metadata?.role ?? "creator";
      setUser({ id: user.id, role });
      const data = await getCollaborations(user.id, role as "brand" | "creator");
      setCollabs(data as Collab[]);
      setLoading(false);
    });
  }, []);

  const filtered = activeStatus === "all" ? collabs : collabs.filter((c) => c.status === activeStatus);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();
    await supabase.from("collaborations").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
    setCollabs((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    setSelected((prev) => prev?.id === id ? { ...prev, status: newStatus } : prev);
    setUpdating(false);
  };

  const nextStatus = (current: string) => {
    const idx = PIPELINE.indexOf(current);
    return idx >= 0 && idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Collaborations</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">
          {user?.role === "brand" ? "Manage your creator collaborations" : "Track your brand deals"}
        </p>
      </div>

      {/* Pipeline tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...PIPELINE].map((s) => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer capitalize ${
              activeStatus === s
                ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                : "border-white/10 text-[#A1A1AA] hover:border-white/20"
            }`}>
            {s.replace("_", " ")}
            {s !== "all" && (
              <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                {collabs.filter((c) => c.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card hover={false}>
          <div className="text-center py-12 text-[#A1A1AA] text-sm">
            {activeStatus === "all" ? "No collaborations yet." : `No collaborations with status "${activeStatus.replace("_", " ")}".`}
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c, i) => {
            const Icon = statusIcon[c.status] ?? FileText;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="cursor-pointer" onClick={() => setSelected(c)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#A855F7]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {c.campaigns?.[0]?.title ?? "Campaign"}
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {c.profiles?.[0]?.full_name ?? (user?.role === "brand" ? "Creator" : "Brand")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={statusVariant[c.status] ?? "gray"}>{c.status.replace("_", " ")}</Badge>
                      <ChevronRight size={16} className="text-[#A1A1AA]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] px-6 pt-7 pb-8 text-center">
                  <button onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                    <X size={16} />
                  </button>
                  <div className="w-14 h-14 rounded-xl bg-white/15 border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
                    {(() => { const Icon = statusIcon[selected.status] ?? FileText; return <Icon size={26} className="text-white" />; })()}
                  </div>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    {selected.campaigns?.[0]?.title ?? "Direct Collaboration"}
                  </h3>
                  <div className="mt-2 flex justify-center">
                    <Badge variant={statusVariant[selected.status] ?? "gray"}>{selected.status.replace("_", " ")}</Badge>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 pt-5 space-y-4">
                  {/* Key details */}
                  <div className="rounded-xl p-4 border border-white/8 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] text-sm">{user?.role === "brand" ? "Creator" : "Brand"}</span>
                      <span className="text-white font-semibold text-sm">
                        {selected.profiles?.[0]?.full_name ?? selected.profiles?.[0]?.email ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] text-sm flex items-center gap-1.5"><Calendar size={13} /> Created</span>
                      <span className="text-white text-sm">{new Date(selected.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selected.deliverables && (
                    <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">Deliverables</p>
                      <p className="text-white text-sm leading-relaxed">{selected.deliverables}</p>
                    </div>
                  )}

                  {/* Pipeline progress */}
                  <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-3">Progress</p>
                    <div className="flex items-center gap-1 mb-2">
                      {PIPELINE.map((s, i) => {
                        const currentIdx = PIPELINE.indexOf(selected.status);
                        const done = i <= currentIdx;
                        return <div key={s} className={`flex-1 h-1.5 rounded-full ${done ? "bg-[#7C5CFF]" : "bg-white/10"}`} />;
                      })}
                    </div>
                    <div className="flex justify-between px-0.5">
                      {PIPELINE.map((s) => (
                        <span key={s} className={`text-[8px] capitalize ${selected.status === s ? "text-[#A855F7] font-semibold" : "text-white/30"}`}>
                          {s.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {nextStatus(selected.status) && selected.status !== "completed" && selected.status !== "rejected" && (
                    <Button variant="primary" size="md" fullWidth disabled={updating}
                      onClick={() => updateStatus(selected.id, nextStatus(selected.status)!)}>
                      {updating ? "Updating…" : `Mark as ${nextStatus(selected.status)!.replace("_", " ")}`}
                    </Button>
                  )}

                  {selected.status === "invited" && user?.role === "creator" && (
                    <Button variant="ghost" size="md" fullWidth disabled={updating}
                      onClick={() => updateStatus(selected.id, "rejected")}>
                      Decline
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
