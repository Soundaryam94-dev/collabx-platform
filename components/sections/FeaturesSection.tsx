"use client";

import { motion } from "framer-motion";
import {
  Search,
  FileText,
  BarChart2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Card from "@/components/ui/Card";

const features = [
  {
    icon: Search,
    title: "Creator Discovery",
    description:
      "Find the perfect creators with advanced filters — niche, followers, engagement rate, and audience location.",
    color: "#7C5CFF",
  },
  {
    icon: Sparkles,
    title: "AI Match",
    description:
      "Our AI scores creators against your goals — audience fit, engagement, niche, and platform — so you find the right partner instantly.",
    color: "#A855F7",
  },
  {
    icon: FileText,
    title: "Collaboration Management",
    description:
      "Track every collab from proposal to completion. One dashboard for invites, status updates, and content review.",
    color: "#6366F1",
  },
  {
    icon: BarChart2,
    title: "Invite & Propose",
    description:
      "Brands invite creators, creators propose to brands — accept or decline in one click with automatic email notifications.",
    color: "#8B5CF6",
  },
  {
    icon: MessageSquare,
    title: "Collaboration Hub",
    description:
      "Built-in messaging, content review, and approval workflows — all in one place.",
    color: "#9333EA",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#7C5CFF]/30 text-xs font-medium text-[#A855F7] mb-4">
            <Sparkles size={12} />
            Everything you need
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
            Built for the{" "}
            <span className="gradient-text">Creator Economy</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-2xl mx-auto">
            From discovery to collaboration — CollabX handles the entire influencer
            marketing workflow so you can focus on results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon
                    size={22}
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
