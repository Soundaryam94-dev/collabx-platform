"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import CreatorNetwork from "@/components/sections/CreatorNetwork";

const stats = [
  { label: "Creators", value: "50K+", icon: Users },
  { label: "Campaigns", value: "12K+", icon: TrendingUp },
  { label: "Avg ROI", value: "340%", icon: Sparkles },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#7C5CFF]/20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#A855F7]/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C5CFF]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#7C5CFF]/30 text-xs font-medium text-[#A855F7] mb-6">
                <Sparkles size={12} />
                AI-Powered Creator Marketplace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            >
              Connect{" "}
              <span className="gradient-text">Brands</span>
              {" "}with{" "}
              <span className="gradient-text">Creators</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-[#A1A1AA] leading-relaxed mb-8 max-w-lg"
            >
              The all-in-one platform for influencer marketing. Discover
              creators, launch campaigns, track performance, and grow your brand
              — powered by AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/signup")}
                className="group"
              >
                Start for Free
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/creators")}
              >
                Browse Creators
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-6"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/20 flex items-center justify-center">
                    <stat.icon size={14} className="text-[#A855F7]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-[#A1A1AA]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Creator Network Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <CreatorNetwork />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
