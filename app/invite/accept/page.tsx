"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Status = "processing" | "accepted" | "declined" | "error";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("");

  const id = searchParams.get("id");
  const action = searchParams.get("action") as "accept" | "decline" | null;
  const sender = searchParams.get("sender") as "brand" | "creator" | null;

  useEffect(() => {
    if (!id || !action) {
      setStatus("error");
      setMessage("Invalid invitation link. Please check your email for a valid link.");
      return;
    }

    const respond = async () => {
      try {
        const res = await fetch("/api/invite/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collaborationId: id, action, sender: sender ?? "brand" }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Something went wrong");

        setStatus(action === "accept" ? "accepted" : "declined");
        setMessage(
          action === "accept"
            ? "Collaboration created! Both dashboards have been updated. The brand will be notified instantly."
            : "You've declined this invitation. The brand has been notified."
        );
      } catch (err: unknown) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    };

    respond();
  }, [id, action]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-3xl p-10 border border-white/10 max-w-md w-full text-center"
    >
      {status === "processing" && (
        <>
          <Loader2 size={48} className="text-[#A855F7] mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Processing…</h2>
          <p className="text-[#A1A1AA] text-sm">
            Updating your collaboration and notifying the other party.
          </p>
        </>
      )}

      {status === "accepted" && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Collaboration Accepted!</h2>
          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8">{message}</p>
          <div className="space-y-3">
            <Button variant="primary" size="lg" fullWidth onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => router.push("/collaborations")}>
              View Collaborations
            </Button>
          </div>
        </>
      )}

      {status === "declined" && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-[#A1A1AA]" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Invitation Declined</h2>
          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8">{message}</p>
          <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Something went wrong</h2>
          <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8">{message}</p>
          <Button variant="secondary" size="lg" fullWidth onClick={() => router.back()}>
            Go Back
          </Button>
        </>
      )}
    </motion.div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#7C5CFF]/15 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#A855F7]/15 blur-3xl" />
      </div>

      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center glow-sm">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-bold text-xl">Collab<span className="gradient-text">X</span></span>
      </Link>

      <Suspense
        fallback={
          <div className="glass rounded-3xl p-10 border border-white/10 max-w-md w-full text-center">
            <Loader2 size={48} className="text-[#A855F7] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-extrabold text-white mb-2">Loading…</h2>
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}
