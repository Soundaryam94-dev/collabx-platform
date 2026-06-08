"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Zap, Briefcase, Video } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signup } from "@/app/actions/auth";

type Role = "creator" | "brand";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("creator");

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      formData.set("role", selectedRole);
      const result = await signup(formData);
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C5CFF]/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#A855F7]/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl">
              Collab<span className="gradient-text">X</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[#A1A1AA] mt-1 text-sm">
            Join thousands of creators and brands
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#A1A1AA] mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {(["creator", "brand"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedRole === role
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/15 glow-sm"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedRole === role
                        ? "bg-gradient-to-br from-[#7C5CFF] to-[#A855F7]"
                        : "bg-white/10"
                    }`}
                  >
                    {role === "creator" ? (
                      <Video size={16} className="text-white" />
                    ) : (
                      <Briefcase size={16} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm font-semibold capitalize text-white">
                    {role}
                  </span>
                  <span className="text-xs text-[#A1A1AA] text-center">
                    {role === "creator"
                      ? "Create content & grow your brand"
                      : "Find & hire creators"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <Input
              name="full_name"
              type="text"
              label="Full Name"
              placeholder="Your name"
              icon={<User size={16} />}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              autoComplete="off"
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              minLength={8}
              required
            />

            {state?.error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                {state.error}
              </motion.p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isPending}
              className="mt-2"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </Button>

          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-[#A1A1AA]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#7C5CFF] hover:text-[#A855F7] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
