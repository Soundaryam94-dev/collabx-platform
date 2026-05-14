"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Users, TrendingUp, Instagram, Youtube, ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";

const creators = [
  { id: "1", name: "Alex Rivera", avatar: "AR", niche: "Tech", followers: "840K", engagement: "4.2%", rating: 4.9, platforms: ["YouTube", "Instagram"], tags: ["Reviews", "Unboxing", "Tutorials"] },
  { id: "2", name: "Sara Patel", avatar: "SP", niche: "Fitness", followers: "380K", engagement: "8.4%", rating: 4.8, platforms: ["Instagram", "TikTok"], tags: ["Workouts", "Nutrition", "Wellness"] },
  { id: "3", name: "Maya Chen", avatar: "MC", niche: "Fashion", followers: "1.2M", engagement: "6.8%", rating: 5.0, platforms: ["Instagram", "TikTok"], tags: ["Style", "Trends", "OOTD"] },
  { id: "4", name: "Jordan Lee", avatar: "JL", niche: "Gaming", followers: "620K", engagement: "5.1%", rating: 4.7, platforms: ["YouTube", "TikTok"], tags: ["FPS", "Reviews", "Streaming"] },
  { id: "5", name: "Priya Sharma", avatar: "PS", niche: "Beauty", followers: "290K", engagement: "9.2%", rating: 4.9, platforms: ["Instagram", "YouTube"], tags: ["Makeup", "Skincare", "Tutorials"] },
  { id: "6", name: "Chris Park", avatar: "CP", niche: "Food", followers: "510K", engagement: "7.3%", rating: 4.6, platforms: ["Instagram", "TikTok"], tags: ["Recipes", "Reviews", "Travel"] },
  { id: "7", name: "Aisha Diallo", avatar: "AD", niche: "Travel", followers: "730K", engagement: "5.8%", rating: 4.8, platforms: ["Instagram", "YouTube"], tags: ["Adventure", "Luxury", "Budget"] },
  { id: "8", name: "Liam Torres", avatar: "LT", niche: "Finance", followers: "415K", engagement: "6.1%", rating: 4.7, platforms: ["YouTube", "Instagram"], tags: ["Investing", "Personal Finance", "Crypto"] },
];

const niches = ["All", "Tech", "Fitness", "Fashion", "Gaming", "Beauty", "Food", "Travel", "Finance"];

export default function FindCreatorsPage() {
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState("All");

  const filtered = creators.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.niche.toLowerCase().includes(search.toLowerCase());
    const matchesNiche = activeNiche === "All" || c.niche === activeNiche;
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#7C5CFF]/15 text-[#A855F7] border border-[#7C5CFF]/25 mb-6">
              <Users size={12} /> 10,000+ Verified Creators
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Find the Perfect <span className="gradient-text">Creator</span> for Your Brand
            </h1>
            <p className="text-[#A1A1AA] text-lg mb-8 max-w-2xl mx-auto">
              Browse thousands of verified creators across every niche. Filter by audience size, engagement rate, and platform.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative max-w-xl mx-auto mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search by name or niche…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass rounded-2xl pl-12 pr-4 py-4 text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors text-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Filter size={14} className="text-[#A1A1AA]" />
            {niches.map((niche) => (
              <button key={niche} onClick={() => setActiveNiche(niche)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeNiche === niche
                    ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                    : "border-white/10 text-[#A1A1AA] hover:border-white/20 hover:text-white"
                }`}>
                {niche}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#A1A1AA] text-sm mb-6 text-center">{filtered.length} creators found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((creator, i) => (
              <motion.div key={creator.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="glass rounded-2xl p-5 border border-white/8 hover:border-[#7C5CFF]/30 transition-all group">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {creator.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{creator.name}</p>
                      <p className="text-xs text-[#A1A1AA]">{creator.niche}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-yellow-400">
                      <Star size={11} fill="currentColor" />
                      <span className="text-xs font-semibold text-white">{creator.rating}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#A855F7] mb-0.5">
                        <Users size={11} />
                      </div>
                      <p className="text-white text-sm font-bold">{creator.followers}</p>
                      <p className="text-[#A1A1AA] text-xs">Followers</p>
                    </div>
                    <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                        <TrendingUp size={11} />
                      </div>
                      <p className="text-white text-sm font-bold">{creator.engagement}</p>
                      <p className="text-[#A1A1AA] text-xs">Engagement</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {creator.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#A855F7] border border-[#7C5CFF]/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/signup">
                    <Button variant="primary" size="sm" fullWidth className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Invite Creator <ArrowRight size={12} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sign up CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center glass rounded-3xl p-10 border border-[#7C5CFF]/20">
            <h2 className="text-2xl font-extrabold text-white mb-2">Ready to collaborate?</h2>
            <p className="text-[#A1A1AA] text-sm mb-6">Sign up as a brand to invite creators, manage campaigns, and track performance.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <Button variant="primary" size="lg">Get Started Free</Button>
              </Link>
              <Link href="/for-brands">
                <Button variant="secondary" size="lg">Learn More</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
