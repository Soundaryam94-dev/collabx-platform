"use client";

import { motion } from "framer-motion";
import { DollarSign, Briefcase, BarChart2, Bell, CheckCircle, ArrowRight, Zap, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";

const features = [
  {
    icon: Briefcase,
    color: "#7C5CFF",
    title: "Find Brand Deals",
    desc: "Browse hundreds of brand campaigns looking for creators like you. Apply or get invited directly.",
  },
  {
    icon: DollarSign,
    color: "#A855F7",
    title: "Get Paid Securely",
    desc: "Payments are held in escrow and released automatically when your content is approved. No chasing invoices.",
  },
  {
    icon: BarChart2,
    color: "#6366F1",
    title: "Track Your Growth",
    desc: "See your total earnings, reach, and engagement across all collaborations in one dashboard.",
  },
  {
    icon: Bell,
    color: "#8B5CF6",
    title: "Instant Notifications",
    desc: "Get email alerts the moment a brand invites you to a campaign. Accept or decline in one click.",
  },
];

const steps = [
  { step: "01", title: "Create your creator profile", desc: "Sign up, set your niche, rates, and connect your social platforms." },
  { step: "02", title: "Receive brand invites", desc: "Brands discover and invite you directly to their campaigns via email." },
  { step: "03", title: "Create & submit content", desc: "Deliver content on time. Use the dashboard to track deadlines and deliverables." },
  { step: "04", title: "Get paid automatically", desc: "Once your content is approved, payment is released instantly to your account." },
];

const stats = [
  { value: "500+", label: "Active Brands" },
  { value: "$4.8K", label: "Avg. Monthly Earnings" },
  { value: "2 days", label: "Avg. Deal Closing Time" },
  { value: "4.9★", label: "Creator Satisfaction" },
];

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/25 mb-6">
              <TrendingUp size={12} /> For Creators
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Turn Your Audience into <span className="gradient-text">Real Income</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg mb-10 max-w-2xl mx-auto">
              Connect with top brands, manage your collaborations, and get paid — all from one simple dashboard built for creators.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="gap-2">
                  Join as Creator <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/find-creators">
                <Button variant="secondary" size="lg">See Creator Profiles</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 text-center border border-white/8">
              <p className="text-3xl font-extrabold gradient-text mb-1">{s.value}</p>
              <p className="text-[#A1A1AA] text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">Everything you need to monetize your content</h2>
            <p className="text-[#A1A1AA]">From brand discovery to payment, CollabX makes it effortless.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/8 hover:border-[#A855F7]/30 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}20` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">How it works</h2>
            <p className="text-[#A1A1AA]">Start earning from brand deals in minutes.</p>
          </div>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-5">
                <span className="text-3xl font-extrabold gradient-text flex-shrink-0">{s.step}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-[#A1A1AA] text-sm">{s.desc}</p>
                </div>
                <CheckCircle size={20} className="text-[#A855F7] ml-auto flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 border border-[#A855F7]/20">
          <Star size={32} className="text-[#A855F7] mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-white mb-3">Start earning with your audience</h2>
          <p className="text-[#A1A1AA] mb-8">Join thousands of creators already partnering with top brands. Free to join.</p>
          <Link href="/signup">
            <Button variant="primary" size="lg" className="gap-2">
              Create Creator Account <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
