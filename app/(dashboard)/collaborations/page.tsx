"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, Clock, ChevronRight, Calendar, X, Send, ExternalLink, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getCollaborations } from "@/lib/supabase/queries";

type Collab = {
  id: string;
  status: string;
  deliverables: string | null;
  content_url: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null; email: string }[] | null;
};

const PIPELINE = ["invited", "agreed", "in_progress", "submitted", "approved", "completed"];

const STATUS_LABEL: Record<string, string> = {
  proposed: "Proposal Sent",
  invited: "Invited",
  agreed: "Agreed",
  in_progress: "In Progress",
  submitted: "Content Submitted",
  approved: "Approved",
  completed: "Completed",
  rejected: "Declined",
};

const statusVariant: Record<string, "green" | "purple" | "blue" | "gray" | "orange"> = {
  proposed: "blue", invited: "gray", agreed: "purple", in_progress: "blue",
  submitted: "orange", approved: "green", completed: "green", rejected: "gray",
};

const statusIcon: Record<string, React.ElementType> = {
  proposed: Send, invited: Clock, agreed: CheckCircle, in_progress: FileText,
  submitted: Upload, approved: CheckCircle, completed: CheckCircle, rejected: Clock,
};

export default function CollaborationsPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [selected, setSelected] = useState<Collab | null>(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [contentUrl, setContentUrl] = useState("");

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

  const submitContent = async (id: string, url: string) => {
    setUpdating(true);
    const supabase = createClient();
    await supabase.from("collaborations")
      .update({ content_url: url, status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", id);
    setCollabs((prev) => prev.map((c) => c.id === id ? { ...c, content_url: url, status: "submitted" } : c));
    setSelected((prev) => prev?.id === id ? { ...prev, content_url: url, status: "submitted" } : prev);
    setContentUrl("");
    setUpdating(false);
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
        {["all", "proposed", ...PIPELINE].map((s) => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer capitalize ${
              activeStatus === s
                ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                : "border-white/10 text-[#A1A1AA] hover:border-white/20"
            }`}>
            {STATUS_LABEL[s] ?? s}
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
            {activeStatus === "all" ? "No collaborations yet. Invite a creator or send a proposal to get started." : `No collaborations at "${STATUS_LABEL[activeStatus] ?? activeStatus}" stage.`}
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
                        {c.profiles?.[0]?.full_name ?? (user?.role === "brand" ? "Creator" : "Brand")}
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">Direct Collaboration</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={statusVariant[c.status] ?? "gray"}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
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
                    {selected.profiles?.[0]?.full_name ?? "Direct Collaboration"}
                  </h3>
                  <div className="mt-2 flex justify-center">
                    <Badge variant={statusVariant[selected.status] ?? "gray"}>{STATUS_LABEL[selected.status] ?? selected.status}</Badge>
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
                        <span key={s} className={`text-[8px] ${selected.status === s ? "text-[#A855F7] font-semibold" : "text-white/30"}`}>
                          {STATUS_LABEL[s] ?? s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Brand: accept or decline a creator proposal */}
                  {selected.status === "proposed" && user?.role === "brand" && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="md" className="flex-1" disabled={updating}
                        onClick={() => updateStatus(selected.id, "agreed")}>
                        <CheckCircle size={14} /> Accept
                      </Button>
                      <Button variant="ghost" size="md" className="flex-1" disabled={updating}
                        onClick={() => updateStatus(selected.id, "rejected")}>
                        Decline
                      </Button>
                    </div>
                  )}

                  {/* Creator: status is proposed — waiting for brand */}
                  {selected.status === "proposed" && user?.role === "creator" && (
                    <p className="text-center text-xs text-[#A1A1AA]">Waiting for the brand to accept your proposal.</p>
                  )}

                  {/* Creator: submit content when in_progress */}
                  {selected.status === "in_progress" && user?.role === "creator" && (
                    <div className="rounded-xl p-4 border border-white/8 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest">Submit Your Content</p>
                      <input
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="Paste your content link (Google Drive, YouTube, etc.)"
                        className="w-full glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none"
                      />
                      <Button variant="primary" size="sm" fullWidth
                        disabled={!contentUrl.trim() || updating}
                        onClick={() => submitContent(selected.id, contentUrl)}>
                        <Upload size={13} /> {updating ? "Submitting…" : "Submit Content"}
                      </Button>
                    </div>
                  )}

                  {/* Show submitted content URL */}
                  {selected.content_url && ["submitted", "approved", "completed"].includes(selected.status) && (
                    <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">Submitted Content</p>
                      <a href={selected.content_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#A855F7] text-sm hover:underline flex items-center gap-1.5 break-all">
                        <ExternalLink size={13} className="flex-shrink-0" /> {selected.content_url}
                      </a>
                    </div>
                  )}

                  {/* Normal pipeline advance (skip for proposed/in_progress creator) */}
                  {nextStatus(selected.status) && selected.status !== "completed" && selected.status !== "rejected"
                    && selected.status !== "proposed"
                    && !(selected.status === "in_progress" && user?.role === "creator") && (
                    <Button variant="primary" size="md" fullWidth disabled={updating}
                      onClick={() => updateStatus(selected.id, nextStatus(selected.status)!)}>
                      {updating ? "Updating…" : `Move to: ${STATUS_LABEL[nextStatus(selected.status)!] ?? nextStatus(selected.status)}`}
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
