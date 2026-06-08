"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await login(formData);
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-[#7C5CFF]/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-[#A855F7]/20 blur-3xl" />
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-[#A1A1AA] mt-1 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <form action={formAction} className="flex flex-col gap-5" autoComplete="off">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              autoComplete="new-password"
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              autoComplete="new-password"
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
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#A1A1AA]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#7C5CFF] hover:text-[#A855F7] font-medium transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
