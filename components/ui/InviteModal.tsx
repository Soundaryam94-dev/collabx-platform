"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, DollarSign, Calendar, FileText, CheckCircle, Briefcase } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface Target {
  id: string;
  name: string;
  avatar: string;
  niche: string;
}

interface InviteModalProps {
  creator: Target | null;
  onClose: () => void;
  /** "brand-to-creator" (default) or "creator-to-brand" */
  mode?: "brand-to-creator" | "creator-to-brand";
  /** Pre-fill the recipient's email when known */
  brandEmail?: string;
}

const DELIVERABLE_OPTIONS = [
  "1 Instagram Reel", "2 Instagram Reels", "3 Instagram Stories",
  "1 YouTube Video", "2 TikTok Videos", "1 Instagram Post + Story",
];

const PLATFORM_OPTIONS = ["Instagram", "YouTube", "TikTok", "Twitter/X", "LinkedIn"];

export default function InviteModal({ creator, onClose, mode = "brand-to-creator", brandEmail }: InviteModalProps) {
  const isBrandMode = mode === "brand-to-creator";
  const [step, setStep] = useState<"form" | "sent">("form");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single();
      if (data) setUserProfile(data);
    });
  }, []);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [form, setForm] = useState({
    recipientEmail: brandEmail ?? "",
    campaignName: "",
    goal: "Product Promotion",
    paymentAmount: "",
    deadline: "",
    notes: "",
  });

  const toggle = (item: string, list: string[], setter: (v: string[]) => void) =>
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const handleSend = async () => {
    if (!creator || !form.campaignName || !form.paymentAmount || !form.deadline) return;
    setSending(true);

    const body = isBrandMode
      ? {
          senderRole: "brand",
          creatorEmail: form.recipientEmail || `${creator.name.toLowerCase().replace(" ", ".")}@example.com`,
          creatorName: creator.name,
          brandEmail: userProfile?.email ?? "",
          brandName: userProfile?.full_name ?? "Brand",
          campaignName: form.campaignName,
          campaignGoal: form.goal,
          deliverables: selectedDeliverables.join(", ") || "TBD",
          paymentAmount: Number(form.paymentAmount),
          deadline: form.deadline,
          notes: form.notes,
        }
      : {
          senderRole: "creator",
          brandEmail: form.recipientEmail || brandEmail || `contact@${creator.name.toLowerCase().replace(" ", "")}.com`,
          brandName: creator.name,
          creatorEmail: userProfile?.email ?? "",
          creatorName: userProfile?.full_name ?? "Creator",
          creatorNiche: creator.niche,
          creatorFollowers: "—",
          campaignName: form.campaignName,
          proposalDetails: form.notes,
          paymentExpected: Number(form.paymentAmount),
          timeline: form.deadline,
          platforms: selectedPlatforms.join(", ") || "Instagram",
        };

    setError(null);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {creator && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
              {step === "form" ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${isBrandMode ? "rounded-full" : "rounded-xl"} bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white`}>
                        {creator.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {isBrandMode ? `Invite ${creator.name}` : `Propose to ${creator.name}`}
                        </p>
                        <p className="text-xs text-[#A1A1AA]">
                          {isBrandMode ? "Creator" : "Brand"}
                        </p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form body */}
                  <div className="p-6 space-y-4">
                    <Input
                      label={isBrandMode ? "Creator Email" : "Brand Contact Email"}
                      type="email"
                      placeholder={isBrandMode
                        ? `${creator.name.toLowerCase().replace(" ", ".")}@example.com`
                        : `contact@${creator.name.toLowerCase().replace(" ", "")}.com`}
                      value={form.recipientEmail}
                      onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))}
                    />
                    <Input
                      label={isBrandMode ? "Campaign Name" : "Campaign / Project Name"}
                      placeholder="e.g. Summer Collection Launch"
                      value={form.campaignName}
                      onChange={(e) => setForm((p) => ({ ...p, campaignName: e.target.value }))}
                      required
                    />

                    {/* Deliverables (brand mode) or Platforms (creator mode) */}
                    {isBrandMode ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#A1A1AA]">Deliverables</label>
                        <div className="flex flex-wrap gap-2">
                          {DELIVERABLE_OPTIONS.map((d) => (
                            <button key={d} type="button"
                              onClick={() => toggle(d, selectedDeliverables, setSelectedDeliverables)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${selectedDeliverables.includes(d) ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/20"}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#A1A1AA]">Platforms I'll post on</label>
                        <div className="flex flex-wrap gap-2">
                          {PLATFORM_OPTIONS.map((p) => (
                            <button key={p} type="button"
                              onClick={() => toggle(p, selectedPlatforms, setSelectedPlatforms)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${selectedPlatforms.includes(p) ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/20"}`}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label={isBrandMode ? "Payment ($)" : "My Rate ($)"}
                        type="number"
                        placeholder="e.g. 800"
                        icon={<DollarSign size={14} />}
                        value={form.paymentAmount}
                        onChange={(e) => setForm((p) => ({ ...p, paymentAmount: e.target.value }))}
                        required
                      />
                      <Input
                        label="Timeline / Deadline"
                        type="date"
                        icon={<Calendar size={14} />}
                        value={form.deadline}
                        onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
                        <FileText size={13} />
                        {isBrandMode ? "Notes for Creator" : "Message to Brand"}
                      </label>
                      <textarea
                        placeholder={isBrandMode
                          ? "Brand guidelines, hashtags, tone of voice..."
                          : "Introduce yourself, explain why you're a great fit..."}
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors resize-none bg-transparent"
                      />
                    </div>

                    <p className="text-xs text-[#A1A1AA] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 rounded-xl px-4 py-3">
                      📧 {isBrandMode
                        ? "An email with Accept / Decline buttons will be sent to the creator instantly. Once accepted, both dashboards update automatically."
                        : "Your proposal email with Accept / Decline buttons will be sent to the brand instantly. Once they respond, you'll be notified and both dashboards update."}
                    </p>
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div className="mx-6 mb-2 flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                      <span className="mt-0.5 flex-shrink-0">✕</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex gap-3 px-6 pb-6">
                    <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button
                      variant="primary" size="md" onClick={handleSend}
                      disabled={sending || !form.campaignName || !form.paymentAmount || !form.deadline}
                      className="flex-1"
                    >
                      {isBrandMode ? <Send size={14} /> : <Briefcase size={14} />}
                      {sending ? "Sending…" : isBrandMode ? "Send Invite" : "Send Proposal"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-10 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-white mb-2">
                    {isBrandMode ? "Invite Sent!" : "Proposal Sent!"}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                    {isBrandMode
                      ? <>An email with Accept &amp; Decline buttons has been sent to <strong className="text-white">{creator.name}</strong>. Once they respond, both dashboards update instantly.</>
                      : <>Your proposal has been sent to <strong className="text-white">{creator.name}</strong>. Once they accept, the collaboration is created and both dashboards update instantly.</>}
                  </p>
                  <Button variant="primary" size="md" fullWidth onClick={onClose}>Done</Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
