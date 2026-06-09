"use client";

import { useState, useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Zap, Briefcase, Video, UserCheck, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signup } from "@/app/actions/auth";

type Role = "creator" | "brand";

function SignupForm() {
  const params = useSearchParams();
  const creatorId = params.get("creator_id") ?? "";
  const creatorName = params.get("creator_name") ?? "";
  const brandId = params.get("brand_id") ?? "";
  const brandName = params.get("brand_name") ?? "";
  const forcedRole = params.get("role") as Role | null;
  // Role is locked when context is clear (came from a role-specific page or invite flow)
  const roleLocked = forcedRole === "brand" || forcedRole === "creator";

  const [selectedRole, setSelectedRole] = useState<Role>(
    forcedRole === "brand" ? "brand" : forcedRole === "creator" ? "creator" : "creator"
  );

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      formData.set("role", selectedRole);
      if (creatorId) formData.set("creator_id", creatorId);
      if (brandId) formData.set("brand_id", brandId);
      const result = await signup(formData);
      return result;
    },
    null
  );

  return (
    <div className="glass rounded-2xl p-8 border border-white/10">
      {/* Invite context banner */}
      {creatorId && creatorName && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/25">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center flex-shrink-0">
            <UserCheck size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Inviting {creatorName}</p>
            <p className="text-xs text-[#A1A1AA]">Sign up as a Brand to send the invite</p>
          </div>
        </div>
      )}

      {/* Propose context banner */}
      {brandId && brandName && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/25">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] to-[#6366F1] flex items-center justify-center flex-shrink-0">
            <UserCheck size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Proposing to {brandName}</p>
            <p className="text-xs text-[#A1A1AA]">Sign up as a Creator to send your proposal</p>
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[#A1A1AA] mb-3">
          I am a...
          {roleLocked && (
            <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Auto-selected
            </span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["creator", "brand"] as Role[]).map((role) => {
            const isSelected = selectedRole === role;
            const isLocked = roleLocked && role !== selectedRole;
            return (
              <button
                key={role}
                type="button"
                onClick={() => !roleLocked && setSelectedRole(role)}
                disabled={roleLocked && role !== selectedRole}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-[#7C5CFF] bg-[#7C5CFF]/15 glow-sm cursor-default"
                    : isLocked
                    ? "border-white/5 bg-white/2 opacity-30 cursor-not-allowed"
                    : "border-white/10 bg-white/5 hover:border-white/20 cursor-pointer"
                }`}
              >
                {isSelected && roleLocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={13} className="text-emerald-400" />
                  </div>
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-gradient-to-br from-[#7C5CFF] to-[#A855F7]" : "bg-white/10"}`}>
                  {role === "creator" ? <Video size={16} className="text-white" /> : <Briefcase size={16} className="text-white" />}
                </div>
                <span className="text-sm font-semibold capitalize text-white">{role}</span>
                <span className="text-xs text-[#A1A1AA] text-center">
                  {role === "creator" ? "Create content & grow your audience" : "Find & collaborate with creators"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input name="full_name" type="text" label="Full Name" placeholder="Your name" icon={<User size={16} />} required />
        <Input name="email" type="email" label="Email" placeholder="you@example.com" icon={<Mail size={16} />} autoComplete="off" required />
        <Input name="password" type="password" label="Password" placeholder="Min. 8 characters" icon={<Lock size={16} />} autoComplete="new-password" minLength={8} required />

        {state?.error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {state.error}
          </motion.p>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending} className="mt-2">
          {isPending ? "Creating account..." : creatorName ? `Sign Up & Invite ${creatorName}` : brandName ? `Sign Up & Propose to ${brandName}` : "Create Account"}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-[#A1A1AA]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7C5CFF] hover:text-[#A855F7] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C5CFF]/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#A855F7]/15 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl">Collab<span className="gradient-text">X</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#A1A1AA] mt-1 text-sm">Join thousands of creators and brands</p>
        </div>

        <Suspense fallback={<div className="glass rounded-2xl p-8 border border-white/10 h-96 animate-pulse" />}>
          <SignupForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
